
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { PORTS, VESSELS } from '../constants';
import { PortData, Vessel, WeatherConditionType, WeatherData, MapIncident } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

interface GlobalMapProps {
  onAddAlert?: (alert: { type: 'danger' | 'warning' | 'info', message: string }) => void;
  incidents?: MapIncident[]; // AI can inject these
}

interface SimulationState {
  isActive: boolean;
  progress: number;
  vesselId: string | null;
  report: string | null;
}

// Fixed missing function error on line 269
const getETAString = (vessel: Vessel) => {
  if (vessel.status === 'stuck') return 'STALLED';
  if (vessel.status === 'anchored') return 'ARRIVED';
  // Simple heuristic for ETA based on remaining path points
  const etaHours = (vessel.path?.length || 0) * 8 + Math.floor(Math.random() * 4);
  return `${etaHours}h`;
};

export const GlobalMap: React.FC<GlobalMapProps> = ({ onAddAlert, incidents = [] }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<any>(null);
  const sentAlertsRef = useRef<Set<string>>(new Set());
  
  const [selectedPort, setSelectedPort] = useState<PortData | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [hoveredEntity, setHoveredEntity] = useState<{type: 'port' | 'vessel' | 'weather' | 'incident', data: any, weather?: WeatherData, nextVessel?: string} | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [vesselTelemetry, setVesselTelemetry] = useState(VESSELS);
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const [isSyncingWeather, setIsSyncingWeather] = useState(false);
  
  const [playbackTime, setPlaybackTime] = useState(1); 
  const [isPlaying, setIsPlaying] = useState(false);

  const [simState, setSimState] = useState<SimulationState>({
    isActive: false,
    progress: 0,
    vesselId: null,
    report: null
  });

  const nextVesselsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    PORTS.forEach(port => {
      const incoming = vesselTelemetry
        .filter(v => v.destination === port.name)
        .map(v => v.name);
      map[port.id] = incoming;
    });
    return map;
  }, [vesselTelemetry]);

  const getWeatherIconSVG = (type: WeatherConditionType) => {
    const icons = {
      sunny: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
      cloudy: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>`,
      rainy: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 13l-2 4m-4-4l-2 4m9-4l-2 4"/><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>`,
      stormy: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 13l-2 2h4l-2 2"/><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>`,
      foggy: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h16M4 14h16M6 18h12"/></svg>`
    };
    return icons[type] || icons.cloudy;
  };

  const syncWeather = async () => {
    setIsSyncingWeather(true);
    try {
      // @google/genai fix: Correct initialization
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const locations = PORTS.map(p => `${p.name}, ${p.country}`).join('; ');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Perform meteorological scan for hubs: ${locations}. Return JSON: id, temp, condition, type.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                temp: { type: Type.STRING },
                condition: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ["id", "temp", "condition", "type"]
            }
          }
        }
      });
      const data = JSON.parse(response.text || '[]');
      const newWeatherMap: Record<string, WeatherData> = {};
      data.forEach((item: any) => {
        newWeatherMap[item.id] = { temp: item.temp, condition: item.condition, type: item.type as WeatherConditionType };
      });
      setWeatherMap(newWeatherMap);
    } catch (err) { console.error("Met scan fail", err); } finally { setIsSyncingWeather(false); }
  };

  useEffect(() => {
    syncWeather();
    const interval = setInterval(syncWeather, 300000); // 5 minute refresh
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const renderMap = () => {
      const svg = d3.select(svgRef.current);
      const width = containerRef.current?.clientWidth || 800;
      const height = containerRef.current?.clientHeight || 600;
      svg.selectAll("*").remove();

      const projection = d3.geoMercator().scale(width / 6.5).translate([width / 2, height / 1.6]);
      const path = d3.geoPath().projection(projection);

      // Changed water background to a deep tactical blue
      svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#0c4a6e');
      const mainGroup = svg.append('g');

      d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then((data: any) => {
        // Changed fill to dark and stroke to white for high contrast outlines
        mainGroup.append('g').selectAll('path').data(data.features).enter().append('path')
          .attr('d', path)
          .attr('fill', '#020617')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 0.8)
          .attr('stroke-opacity', 0.9);

        // Incidents (Danger zones, Cyclones)
        incidents.forEach(inc => {
          const pos = projection(inc.coordinates);
          if (!pos) return;
          const incG = mainGroup.append('g').attr('transform', `translate(${pos[0]}, ${pos[1]})`)
            .on('mouseover', (event) => {
              setHoveredEntity({ type: 'incident', data: inc });
              setTooltipPos({ x: event.clientX, y: event.clientY });
            })
            .on('mouseout', () => setHoveredEntity(null));

          if (inc.type === 'cyclone') {
            incG.append('circle').attr('r', inc.radius).attr('fill', 'url(#grad-cyclone)').attr('fill-opacity', 0.2);
            incG.append('path').attr('d', 'M0 -10 A 10 10 0 0 1 10 0 A 10 10 0 0 1 0 10 A 10 10 0 0 1 -10 0 Z')
              .attr('fill', 'none').attr('stroke', '#0ea5e9').attr('stroke-width', 2).append('animateTransform')
              .attr('attributeName', 'transform').attr('type', 'rotate').attr('from', '0 0 0').attr('to', '360 0 0').attr('dur', '3s').attr('repeatCount', 'indefinite');
          } else {
            incG.append('circle').attr('r', inc.radius).attr('fill', '#f43f5e').attr('fill-opacity', 0.15).attr('stroke', '#f43f5e').attr('stroke-dasharray', '4,2');
            incG.append('text').attr('text-anchor', 'middle').attr('dy', '4px').attr('font-size', '14px').text('💀');
          }
        });

        // Vessels
        vesselTelemetry.forEach((vessel) => {
          const isSelected = selectedVessel?.id === vessel.id;
          const isStuck = vessel.status === 'stuck';
          const geoJsonLine: any = { type: 'LineString', coordinates: vessel.path };
          
          mainGroup.append('path').attr('d', path(geoJsonLine)).attr('fill', 'none')
            .attr('stroke', isStuck ? '#ef4444' : '#22d3ee').attr('stroke-width', isSelected ? 2 : 1).attr('stroke-opacity', 0.2);

          const vesselMarker = mainGroup.append('g').attr('class', 'cursor-pointer')
            .on('mouseover', (event) => {
              setHoveredEntity({ type: 'vessel', data: vessel });
              setTooltipPos({ x: event.clientX, y: event.clientY });
            })
            .on('mousemove', (event) => setTooltipPos({ x: event.clientX, y: event.clientY }))
            .on('mouseout', () => setHoveredEntity(null))
            .on('click', (event) => { event.stopPropagation(); setSelectedVessel(vessel); setSelectedPort(null); });

          vesselMarker.append('circle').attr('r', isSelected ? 6 : 4).attr('fill', isStuck ? '#ef4444' : '#22d3ee').attr('stroke', '#fff').attr('stroke-width', isSelected ? 1.5 : 0);
          
          const trackLen = mainGroup.append('path').attr('d', path(geoJsonLine)).attr('fill', 'none').attr('stroke', 'none').node()?.getTotalLength() || 0;
          vesselMarker.transition().duration(40000).ease(d3.easeLinear).attrTween('transform', () => {
            return (t) => {
              const p = mainGroup.append('path').attr('d', path(geoJsonLine)).attr('fill', 'none').attr('stroke', 'none').node()?.getPointAtLength(t * trackLen);
              return p ? `translate(${p.x}, ${p.y})` : '';
            };
          });
        });

        // Ports
        const portMarkers = mainGroup.append('g').selectAll('g').data(PORTS).enter().append('g')
          .attr('transform', d => `translate(${projection(d.coordinates)![0]}, ${projection(d.coordinates)![1]})`)
          .attr('class', 'cursor-pointer')
          .on('mouseover', (event, d) => {
            setHoveredEntity({ type: 'port', data: d, weather: weatherMap[d.id], nextVessel: nextVesselsMap[d.id]?.[0] || 'NONE' });
            setTooltipPos({ x: event.clientX, y: event.clientY });
          })
          .on('mouseout', () => setHoveredEntity(null))
          .on('click', (event, d) => { event.stopPropagation(); setSelectedPort(d); setSelectedVessel(null); });

        portMarkers.append('circle')
          .attr('r', d => 4 + (d.congestionIndex / 100) * 8)
          .attr('fill', d => d.congestionIndex > 75 ? '#f43f5e' : d.congestionIndex > 40 ? '#fbbf24' : '#10b981')
          .attr('fill-opacity', 0.9).attr('stroke', '#fff').attr('stroke-width', 1.5);
      });

      const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([1, 15]).on('zoom', (event) => mainGroup.attr('transform', event.transform));
      zoomBehaviorRef.current = zoom;
      svg.call(zoom);
    };

    renderMap();
    window.addEventListener('resize', renderMap);
    return () => window.removeEventListener('resize', renderMap);
  }, [vesselTelemetry, selectedVessel, weatherMap, incidents, nextVesselsMap]);

  return (
    <div className="h-full flex flex-col relative animate-in fade-in duration-700">
      <div className="absolute top-6 left-6 z-10 p-5 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl pointer-events-none">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white tracking-tight uppercase">Tactical Map</h2>
          {isSyncingWeather && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>}
        </div>
        <div className="space-y-2 text-[10px] font-mono uppercase tracking-widest">
          <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-cyan-400"></span> Active Fleet</div>
          <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span> Incident / Stuck</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="w-4 h-4 rounded-full bg-rose-500"></span>
            <span className="text-slate-400">Port Load</span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 bg-slate-950 rounded-3xl border border-slate-800 relative overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" onClick={() => { setSelectedPort(null); setSelectedVessel(null); }} />
        
        {hoveredEntity && (
          <div className="fixed pointer-events-none z-[100] px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl min-w-[200px]" style={{ left: tooltipPos.x + 20, top: tooltipPos.y - 10 }}>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-white">{hoveredEntity.data.name || hoveredEntity.data.label}</span>
              {hoveredEntity.type === 'port' && (
                <>
                  <span className="text-[10px] text-slate-400 uppercase tracking-tighter">
                    {hoveredEntity.data.state}, {hoveredEntity.data.country}
                  </span>
                  <div className="mt-2 pt-1 border-t border-slate-800 flex justify-between">
                    <span className="text-[9px] text-slate-500 uppercase">Load Status</span>
                    <span className={`text-[9px] font-bold ${hoveredEntity.data.congestionIndex > 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {hoveredEntity.data.congestionIndex.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1 pt-1 border-t border-slate-800">
                    <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase">Incoming: {hoveredEntity.nextVessel}</span>
                  </div>
                </>
              )}
              {hoveredEntity.type === 'incident' && (
                <span className="text-[10px] text-rose-400 uppercase font-bold">Active {hoveredEntity.data.type} Warning</span>
              )}
            </div>
          </div>
        )}

        {selectedVessel && (
          <div className="absolute top-6 right-6 w-80 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl p-6 z-20">
             <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-white uppercase">{selectedVessel.name}</h4>
                  <span className="text-[10px] text-cyan-400 font-mono">{selectedVessel.id}</span>
                </div>
                <button onClick={() => setSelectedVessel(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
             </div>
             <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase mb-2">
                    <span>Target Terminal</span>
                    <span>ETA</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white truncate max-w-[150px]">{selectedVessel.destination}</span>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{getETAString(selectedVessel)}</span>
                  </div>
                </div>
                <button className="w-full py-2.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg uppercase border border-indigo-500 hover:bg-indigo-500 transition-colors">
                  Analyze AIS Signal
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
