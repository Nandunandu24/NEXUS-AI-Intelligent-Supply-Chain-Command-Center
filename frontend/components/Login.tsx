
import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_100%)]">
      <div className="max-w-md w-full space-y-8 p-10 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
        
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-12 transition-transform shadow-[0_0_30px_rgba(8,145,178,0.3)]">
            <span className="text-3xl font-bold text-white">N</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Nexus Control</h2>
          <p className="mt-2 text-slate-400 text-sm">Enterprise Logistics & Intelligence Portal</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Access ID</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="ops.sarah.nexus"
                defaultValue="ops.admin"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Secure Token</label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                defaultValue="password123"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              'Initialize Terminal'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-slate-600 text-xs">Security Clearance: LEVEL 4 (OPERATIONS)</span>
        </div>
      </div>
    </div>
  );
};
