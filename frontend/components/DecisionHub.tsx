
import React, { useState } from 'react';
import { Decision } from '../types';

const INITIAL_DECISIONS: Decision[] = [
  {
    id: 'D-8821',
    category: 'Rerouting',
    action: 'Divert Vessel V-102 to Port of Busan',
    impactAnalysis: 'Mitigates 48h predicted congestion at Rotterdam. Saves $1.2M in potential idle costs.',
    confidence: 94,
    expectedROI: '+12.4%',
    riskReduction: 35,
    status: 'Pending',
    agentConsensus: { risk: 98, ops: 88, cost: 92, sustainability: 75 }
  },
  {
    id: 'D-8822',
    category: 'Inventory',
    action: 'Escalate Safety Stock in California Nodes',
    impactAnalysis: 'Anticipates labor strike ripple effects. Maintains 99% fulfillment capability.',
    confidence: 81,
    expectedROI: '+4.8%',
    riskReduction: 62,
    status: 'Pending',
    agentConsensus: { risk: 72, ops: 94, cost: 65, sustainability: 90 }
  },
  {
    id: 'D-8823',
    category: 'Labor',
    action: 'Shift Terminal Crew Shift A to Overtime',
    impactAnalysis: 'Clears current 12% vessel backlog at Jebel Ali. Operational stabilization reached in 6h.',
    confidence: 89,
    expectedROI: '+2.1%',
    riskReduction: 18,
    status: 'Pending',
    agentConsensus: { risk: 85, ops: 92, cost: 80, sustainability: 55 }
  }
];

export const DecisionHub: React.FC = () => {
  const [decisions, setDecisions] = useState<Decision[]>(INITIAL_DECISIONS);

  const handleAction = (id: string, status: 'Approved' | 'Declined') => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Prescriptive Decision Hub</h1>
          <p className="text-slate-400 text-sm">Autonomous recommendations from the Nexus Multi-Agent Swarm.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SWARM STATUS: OPTIMAL
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {decisions.map((d) => (
          <div key={d.id} className={`bg-slate-900 border ${d.status === 'Approved' ? 'border-emerald-500/50' : d.status === 'Declined' ? 'border-rose-500/50' : 'border-slate-800'} rounded-2xl p-6 shadow-2xl transition-all relative overflow-hidden group`}>
            {d.status !== 'Pending' && (
              <div className={`absolute top-0 right-0 px-6 py-2 ${d.status === 'Approved' ? 'bg-emerald-600' : 'bg-rose-600'} text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl shadow-xl z-10`}>
                {d.status}
              </div>
            )}
            
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[9px] font-bold uppercase tracking-wider rounded border border-cyan-500/20">{d.category}</span>
                  <span className="text-slate-600 font-mono text-[10px]">{d.id}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 leading-tight">{d.action}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{d.impactAnalysis}</p>
              </div>

              <div className="lg:w-1/3 grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-center text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Confidence</span>
                  <span className="text-2xl font-bold text-white font-mono">{d.confidence}%</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-center text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Impact (ROI)</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono">{d.expectedROI}</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-center text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Risk Reduction</span>
                  <span className="text-2xl font-bold text-cyan-400 font-mono">{d.riskReduction}%</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Swarm Consensus</span>
                  <div className="flex justify-around items-end h-8 gap-1 px-2">
                    <div className="w-full bg-rose-500/20 rounded-t" style={{ height: `${d.agentConsensus.risk}%` }}></div>
                    <div className="w-full bg-cyan-500/20 rounded-t" style={{ height: `${d.agentConsensus.ops}%` }}></div>
                    <div className="w-full bg-amber-500/20 rounded-t" style={{ height: `${d.agentConsensus.cost}%` }}></div>
                    <div className="w-full bg-emerald-500/20 rounded-t" style={{ height: `${d.agentConsensus.sustainability}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/3 flex flex-col justify-center gap-3">
                {d.status === 'Pending' ? (
                  <>
                    <button 
                      onClick={() => handleAction(d.id, 'Approved')}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                    >
                      APPROVE & EXECUTE
                    </button>
                    <button 
                      onClick={() => handleAction(d.id, 'Declined')}
                      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl transition-all"
                    >
                      DECLINE RECOMMENDATION
                    </button>
                  </>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 font-mono italic">
                    Logged at {new Date().toLocaleTimeString()} by System Administrator (S. Jenkins)
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
