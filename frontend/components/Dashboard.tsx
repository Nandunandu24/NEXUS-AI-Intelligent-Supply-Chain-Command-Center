
import React, { useState, useEffect } from 'react';
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { PORTS, DELAY_TREND_DATA } from '../constants';
import { GoogleGenAI } from '@google/genai';

const THROUGHPUT_DATA = [
  { name: 'SGP', volume: 4500, capacity: 5000 },
  { name: 'SHA', volume: 8200, capacity: 8500 },
  { name: 'ROT', volume: 3100, capacity: 4000 },
  { name: 'LAX', volume: 5600, capacity: 5500 },
  { name: 'DXB', volume: 2800, capacity: 3500 },
];

export const Dashboard: React.FC = () => {
  const [livePorts, setLivePorts] = useState(PORTS);
  const [selectedWeatherPort, setSelectedWeatherPort] = useState(PORTS[0]);
  const [weatherReport, setWeatherReport] = useState<string | null>(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [groundingLinks, setGroundingLinks] = useState<any[]>([]);
  
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [stressProgress, setStressProgress] = useState(0);
  const [stressResult, setStressResult] = useState<string | null>(null);

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
    { label: 'Network Efficiency', value: '94.2%', trend: '+1.2%', color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
    { label: 'At-Risk Revenue', value: '$12.4M', trend: '-2.4%', color: 'text-rose-400', bg: 'bg-rose-400/5' },
    { label: 'Avg. Port Delay', value: '18.4h', trend: '+4.1h', color: 'text-amber-400', bg: 'bg-amber-400/5' },
    { label: 'Active Shipments', value: '4,281', trend: '+124', color: 'text-cyan-400', bg: 'bg-cyan-400/5' }
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
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Real-time meteorology for ${port.name}, ${port.state}, ${port.country}. Current Temp, Wind, Visibility. Plain text only.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      const cleanText = (response.text || "").replace(/[#*]/g, '');
      setWeatherReport(cleanText);
      // @google/genai rule: extract URLs from groundingChunks
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setGroundingLinks(response.candidates[0].groundingMetadata.groundingChunks);
      }
    } catch (err) { 
      setWeatherReport("MET-SCAN ERROR: Connection failed."); 
    } finally { 
      setIsFetchingWeather(false); 
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="w-full bg-slate-900/60 border-y border-slate-800/50 py-2 overflow-hidden whitespace-nowrap">
        <div className="flex gap-16 animate-pulse px-8">
          {livePorts.map(p => (
            <div key={p.id} className="text-[10px] font-mono flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
              <span className="text-slate-500 uppercase">{p.id}:</span>
              <span className="text-cyan-400 ml-1">{p.congestionIndex.toFixed(1)}% LOAD</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`relative bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl overflow-hidden group hover:border-slate-700 transition-all`}>
            <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${kpi.color.replace('text', 'bg')}`}></div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em]">{kpi.label}</span>
            <div className="flex items-end justify-between mt-4">
              <span className={`text-3xl font-bold font-mono ${kpi.color}`}>{kpi.value}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${kpi.bg} ${kpi.color}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Network Latency Trend (24h)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DELAY_TREND_DATA}>
                <defs>
                  <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                <XAxis dataKey="time" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} tick={{ dy: 10 }} />
                <YAxis stroke="#475569" fontSize={11} axisLine={false} tickLine={false} tick={{ dx: -10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="delay" stroke="#06b6d4" fillOpacity={1} fill="url(#colorDelay)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden group">
           <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Strategic Node Assessment</h2>
           <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 font-mono text-xs text-slate-400 leading-relaxed">
             System telemetry suggests critical bottlenecking in the Pacific sector. Recommend buffer escalation for Tier-1 terminals.
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Regional Meteorological Handshake</h2>
            <div className="flex gap-2">
              <select 
                value={selectedWeatherPort.id}
                onChange={(e) => {
                  const port = PORTS.find(p => p.id === e.target.value);
                  if (port) setSelectedWeatherPort(port);
                }}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-[10px] outline-none font-bold uppercase"
              >
                {PORTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button 
                onClick={() => fetchLiveWeatherReport(selectedWeatherPort.id)}
                disabled={isFetchingWeather}
                className="bg-indigo-600 px-3 py-1.5 rounded-lg text-[10px] text-white font-bold uppercase hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                SCAN
              </button>
            </div>
          </div>
          <div className="bg-slate-950 p-6 rounded-2xl min-h-[120px] text-xs text-slate-300 border border-slate-800 italic leading-relaxed">
            {isFetchingWeather ? "Syncing..." : (
              <div>
                <p>{weatherReport || "Select node for scan."}</p>
                {groundingLinks.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 block mb-2 uppercase tracking-widest font-bold">Source Documents:</span>
                    <ul className="space-y-1">
                      {groundingLinks.map((chunk, i) => (
                        chunk.web && (
                          <li key={i}>
                            <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
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
    </div>
  );
};
