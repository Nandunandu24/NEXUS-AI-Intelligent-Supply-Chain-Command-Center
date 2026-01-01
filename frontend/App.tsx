
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './components/Dashboard';
import { GlobalMap } from './components/GlobalMap';
import { AnalyticsView } from './components/AnalyticsView';
import { DecisionHub } from './components/DecisionHub';
import { AIAgent } from './components/AIAgent';
import { AlertSystem } from './components/AlertSystem';
import { Login } from './components/Login';
import { MapIncident } from './types';

export interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  message: string;
  time: string;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'analytics' | 'decisions'>('dashboard');
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [mapIncidents, setMapIncidents] = useState<MapIncident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', type: 'danger', message: 'Critical congestion detected at Port of Mumbai (92% capacity)', time: 'Just now' },
    { id: '2', type: 'warning', message: 'Predicted delay at LAX increased to 36 hours', time: '2m ago' }
  ]);

  const addAlert = (alert: Omit<Alert, 'id' | 'time'>) => {
    setAlerts(prev => {
      if (prev.some(a => a.message === alert.message)) return prev;
      return [{ ...alert, id: Math.random().toString(36).substr(2, 9), time: 'Just now' }, ...prev];
    });
  };

  const removeAlert = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));

  const handleMarkMap = (incident: MapIncident) => {
    setMapIncidents(prev => [...prev, incident]);
    addAlert({ type: incident.type === 'cyclone' ? 'warning' : 'danger', message: `Tactical Alert: ${incident.label} identified.` });
  };

  useEffect(() => {
    const auth = localStorage.getItem('nexus_auth');
    if (auth) setIsAuthenticated(true);
  }, []);

  if (!isAuthenticated) return <Login onLogin={() => { localStorage.setItem('nexus_auth', 'true'); setIsAuthenticated(true); }} />;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Topbar onAgentToggle={() => setIsAgentOpen(!isAgentOpen)} />
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'map' && <GlobalMap onAddAlert={addAlert} incidents={mapIncidents} />}
          {activeTab === 'decisions' && <DecisionHub />}
          {activeTab === 'analytics' && <AnalyticsView />}
        </div>
        <AlertSystem alerts={alerts} onRemove={removeAlert} />
        <AIAgent isOpen={isAgentOpen} onClose={() => setIsAgentOpen(false)} onMarkMap={handleMarkMap} />
      </main>
    </div>
  );
};

export default App;
