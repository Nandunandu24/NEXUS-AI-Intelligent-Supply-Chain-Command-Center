
import React from 'react';

export interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  message: string;
  time: string;
}

interface AlertSystemProps {
  alerts: Alert[];
  onRemove: (id: string) => void;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({ alerts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 w-80 z-40 space-y-3 pointer-events-none">
      {alerts.map((alert) => (
        <div 
          key={alert.id} 
          className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 animate-in slide-in-from-right duration-300 ${
            alert.type === 'danger' ? 'bg-rose-950/80 border-rose-500/50 text-rose-200' :
            alert.type === 'warning' ? 'bg-amber-950/80 border-amber-500/50 text-amber-200' :
            'bg-cyan-950/80 border-cyan-500/50 text-cyan-200'
          }`}
        >
          <div className="mt-0.5">
            {alert.type === 'danger' && <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            {alert.type === 'warning' && <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            {alert.type === 'info' && <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium leading-tight">{alert.message}</p>
            <span className="text-[10px] opacity-60 mt-1 block">{alert.time}</span>
          </div>
          <button onClick={() => onRemove(alert.id)} className="opacity-40 hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
};
