
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { SHAP_VALUES, PORTS } from '../constants';
import { GoogleGenAI } from '@google/genai';

export const AnalyticsView: React.FC = () => {
  const [intensity, setIntensity] = useState(50);
  const [tension, setTension] = useState(30);
  const [duration, setDuration] = useState('2 Weeks');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const pieData = [
    { name: 'Risk Agent', value: 92, color: '#f43f5e' },
    { name: 'Cost Agent', value: 85, color: '#fbbf24' },
    { name: 'Ops Agent', value: 78, color: '#06b6d4' },
    { name: 'Sustainability', value: 64, color: '#10b981' },
  ];

  const runSimulation = async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    setSimulationProgress(0);

    const progressInterval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.floor(Math.random() * 15);
      });
    }, 400);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Digital Twin Cascading Impact Simulation. 
      Input Parameters: 
      - Weather Disruption: ${intensity}% 
      - Geopolitical Tension: ${tension}%
      - Time Horizon: ${duration}
      
      Perform Multi-Agent Consensus Analysis:
      1. RISK AGENT: Predict probability of localized conflict or closure.
      2. COST AGENT: Calculate P90 loss distribution in millions.
      3. OPS AGENT: Identify cascading bottlenecks in connected ports.
      4. EXECUTIVE SUMMARY: Consensus operational recommendation.
      
      Format as a technical multi-agent log. Plain text only, no markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      clearInterval(progressInterval);
      setSimulationProgress(100);
      setSimulationResult((response.text || "").replace(/[#*]/g, ''));
    } catch (err) {
      setSimulationResult("Twin simulation link failed. Check model observability.");
    } finally {
      setTimeout(() => setIsSimulating(false), 500);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Supply Chain Digital Twin</h1>
          <p className="text-slate-400 text-sm">Monte Carlo Uncertainty Modeling & Multi-Agent Swarm Intelligence.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Swarm Intelligence Panel */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl lg:col-span-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM16 18a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1z" /></svg>
            Swarm Decision Confidence
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500 uppercase">{d.name}</span>
                <span className="text-white font-bold">{d.value}% RELIABILITY</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Importance Panel */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl lg:col-span-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">SHAP Root Cause Explainer</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={SHAP_VALUES} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} opacity={0.3} />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis type="category" dataKey="feature" stroke="#64748b" fontSize={11} width={130} />
                <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {SHAP_VALUES.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#06b6d4' : '#f43f5e'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Monte Carlo Engine */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-white mb-6">Twin Scenario Controller</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Disruption Intensity</label>
              <input type="range" min="1" max="100" value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono"><span>1%</span><span>100%</span></div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Geopolitical Tension</label>
              <input type="range" min="1" max="100" value={tension} onChange={(e) => setTension(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500" />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono"><span>CALM</span><span>CRITICAL</span></div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Simulation Window</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none font-mono">
                <option>7 Days</option><option>14 Days</option><option>30 Days</option><option>90 Days</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={runSimulation} disabled={isSimulating} className="w-full py-2.5 bg-white text-slate-950 font-bold rounded-lg hover:bg-slate-200 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
                {isSimulating ? 'SIMULATING...' : 'EXECUTE TWIN SIM'}
              </button>
            </div>
          </div>

          {(isSimulating || simulationResult) && (
            <div className="mt-8 border-t border-slate-800 pt-8 animate-in fade-in zoom-in-95 duration-500">
              {isSimulating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_15px_#06b6d4]" style={{ width: `${simulationProgress}%` }}></div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 animate-pulse tracking-widest">NEURAL PATH CALCULATIONS IN PROGRESS...</span>
                </div>
              ) : (
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 font-mono text-xs leading-relaxed text-slate-300">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                    <span className="text-cyan-500 font-bold">MULTI-AGENT TRACE LOG [v2.4.1]</span>
                    <span className="text-slate-600 italic">SCENARIO: ID-7712A</span>
                  </div>
                  <div className="whitespace-pre-wrap">{simulationResult}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
