
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Message, MapIncident } from '../types';

interface AIAgentProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkMap?: (incident: MapIncident) => void;
}

export const AIAgent: React.FC<AIAgentProps> = ({ isOpen, onClose, onMarkMap }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello, I am Nexus Core. I can help you analyze port delays, identify dangerous zones, or monitor cyclone symptoms. How can I assist you today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // @google/genai fix: Correct initialization
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const markIncidentTool = {
        name: 'markMapIncident',
        parameters: {
          type: Type.OBJECT,
          description: 'Marks a dangerous location or weather symptom on the tactical map.',
          properties: {
            type: { type: Type.STRING, enum: ['cyclone', 'danger'], description: 'The type of incident.' },
            lat: { type: Type.NUMBER, description: 'Latitude coordinate.' },
            lng: { type: Type.NUMBER, description: 'Longitude coordinate.' },
            label: { type: Type.STRING, description: 'Name of the incident area.' },
            radius: { type: Type.NUMBER, description: 'Size of the area on map.' }
          },
          required: ['type', 'lat', 'lng', 'label', 'radius']
        }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          systemInstruction: `You are Nexus Core. You help logistics managers. 
          If the user mentions "danger", "cyclone", or "dangerous location", use the markMapIncident tool. 
          Example dangerous locations: Red Sea [40, 15], Strait of Malacca [101, 3], Gulf of Aden [48, 12].
          Respond in clean plain text. No markdown symbols like # or *.`,
          tools: [{ functionDeclarations: [markIncidentTool] }]
        }
      });

      if (response.functionCalls) {
        for (const fc of response.functionCalls) {
          if (fc.name === 'markMapIncident' && onMarkMap) {
            const args: any = fc.args;
            onMarkMap({
              id: Math.random().toString(),
              type: args.type as 'cyclone' | 'danger',
              coordinates: [args.lng, args.lat],
              label: args.label,
              radius: args.radius
            });
          }
        }
      }

      const cleanResponse = (response.text || "Incident logged. Tactical map updated.").replace(/[#*]/g, '');
      setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse, timestamp: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Metacomm connection failure.', timestamp: new Date() }]);
    } finally { setIsTyping(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      <div className="pointer-events-auto w-full max-w-lg bg-slate-900 border-l border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col h-full animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_20px_#0891b2]">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Nexus Core Agent</h3>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span><span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tactical Online</span></div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <span className="text-[10px] opacity-40 mt-2 block text-right font-mono">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
          {isTyping && <div className="flex gap-1"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></span><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></span></div>}
        </div>

        <div className="p-6 bg-slate-900 border-t border-slate-800">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="E.g. Mark Red Sea as dangerous location..."
              className="w-full bg-slate-800 border-slate-700 text-white text-sm rounded-xl p-4 pr-12 focus:ring-2 focus:ring-cyan-500 outline-none h-24 transition-all resize-none"
            />
            <button onClick={handleSend} disabled={!input.trim() || isTyping} className="absolute bottom-4 right-4 p-2 bg-cyan-600 text-white rounded-lg shadow-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
          </div>
        </div>
      </div>
    </div>
  );
};
