
import React, { useState, useEffect } from 'react';
import { CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { PORTS, DELAY_TREND_DATA } from './constants';
import { GoogleGenAI } from '@google/genai';

export const Dashboard: React.FC = () => {
  const [livePorts, setLivePorts] = useState(PORTS);
  const [selectedWeatherPort, setSelectedWeatherPort] = useState(PORTS[0]);
  const [weatherReport, setWeatherReport] = useState<string | null>(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [groundingLinks, setGroundingLinks] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePorts(current => 
        current.map(p => ({
          ...p,
          congestionIndex: Math.max(0, Math.min(100, p.congestionIndex + (Math.random() * 2 - 1))),
          activeVessels: Math.max(0, Math.floor(p.activeVessels + (Math.random() * 6 - 3)))
        }))
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    { label: 'Network Efficiency', value: '94.2%', trend: '+1.2%', color: 'text-emerald-400' },
    { label: 'At-Risk Revenue', value: '$12.4M', trend: '-2.4%', color: 'text-rose-400' },
    { label: 'Avg. Port Delay', value: '18.4h', trend: '+4.1h', color: 'text-amber-400' },
    { label: 'Active Shipments', value: '4,281', trend: '+124', color: 'text-cyan-400' }
  ];

  const fetchLiveWeatherReport = async (portId: string) => {
    const port = PORTS.find(p => p.id === portId);
    if (!port) return;
    
    setIsFetchingWeather(true);
    setWeatherReport(null);
    setGroundingLinks([]);
    
    try {
      // @google/genai fix: Correct initialization
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Provide real-time meteorological audit for ${port.name}. Current Temp, Wind, Visibility. Clean plain text only, no markdown.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });

      const cleanText = (response.text || "").replace(/[#*]/g, '');
      setWeatherReport(cleanText);
      // @google/genai rule: extract URLs from groundingChunks
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setGroundingLinks(response.candidates[0].groundingMetadata.groundingChunks);
      }
    } catch (err) {
      setWeatherReport("MET-SCAN ERROR: Unable to establish real-time link.");
    } finally {
      setIsFetchingWeather(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="w-full bg-slate-900/60 border-y border-slate-800/50 py-1.5 overflow-hidden whitespace-nowrap">
        <div className="flex gap-16 animate-pulse px-8">
          {livePorts.map(p => (
            <div key={p.id} className="text-[10px] font-mono">
              <span className="text-slate-500 uppercase">{p.id}:</span>
              <span className="text-cyan-400 ml-2">{p.congestionIndex.toFixed(1)}% LOAD</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <span className="text-slate-500 text-[10px] font-bold uppercase">{kpi.label}</span>
            <div className="flex items-end justify-between mt-3">
              <span className={`text-3xl font-bold font-mono ${kpi.color}`}>{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Weather Surveillance</h2>
          <div className="flex gap-4">
            <select 
              value={selectedWeatherPort.id}
              onChange={(e) => {
                const port = PORTS.find(p => p.id === e.target.value);
                if (port) setSelectedWeatherPort(port);
              }}
              className="bg-slate-800 text-white rounded-xl px-4 py-2 text-xs"
            >
              {PORTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={() => fetchLiveWeatherReport(selectedWeatherPort.id)} className="bg-indigo-600 px-4 py-2 rounded-xl text-xs text-white">SCAN</button>
          </div>
        </div>
        <div className="bg-slate-950 p-6 rounded-2xl min-h-[100px] text-sm text-slate-300">
          {isFetchingWeather ? "Establishing satellite handshake..." : (
            <div>
              <p>{weatherReport || "Select a port to begin weather scan."}</p>
              {groundingLinks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-2 uppercase tracking-widest font-bold">Source Documents:</span>
                  <ul className="space-y-1">
                    {groundingLinks.map((chunk, i) => (
                      chunk.web && (
                        <li key={i}>
                          <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                            {chunk.web.title || chunk.web.uri}
                          </a>
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
