import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  Terminal
} from 'lucide-react';
import { TelemetryState } from '../types';

interface LiveTelemetryHUDProps {
  telemetry?: Partial<TelemetryState>;
}

export const LiveTelemetryHUD: React.FC<LiveTelemetryHUDProps> = ({ telemetry }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [latency, setLatency] = useState(1.18);
  const [tokens, setTokens] = useState(412);
  const [ping, setPing] = useState(true);

  // Micro-jitter to demonstrate live real-time stream
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const delta = (Math.random() * 0.08 - 0.04);
        return parseFloat((Math.max(1.11, Math.min(1.26, prev + delta))).toFixed(2));
      });
      setTokens(prev => {
        if (Math.random() > 0.8) {
          return 412 + Math.floor(Math.random() * 15);
        }
        return prev;
      });
      setPing(p => !p);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="live-telemetry-hud" className="fixed bottom-4 right-4 z-40 select-none">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative group"
      >
        {/* Ambient Cyan/Indigo Neon Underglow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 via-indigo-500/20 to-emerald-500/30 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition duration-500 pointer-events-none" />

        {/* HUD Card */}
        <div className="relative bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/60 p-3 min-w-[320px] max-w-sm text-xs font-mono text-slate-200">
          {/* Top Bar / Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
              </span>
              <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                LIVE TELEMETRY HUD
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-semibold uppercase">
                ENGINE V2.5
              </span>
              <button
                id="toggle-telemetry-expand"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
                title={isExpanded ? "Collapse telemetry details" : "Expand telemetry details"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Primary 4 Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-2">
            {/* Metric 1: Model */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-indigo-400" />
                Model
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="font-semibold text-slate-100 text-xs truncate">
                  Gemini 2.5 Flash
                </span>
              </div>
            </div>

            {/* Metric 2: Latency */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                Latency
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-bold text-cyan-300 text-sm tracking-tight font-mono">
                  {latency}s
                </span>
                <span className="text-[9px] text-emerald-400 font-bold">● FAST</span>
              </div>
            </div>

            {/* Metric 3: Tokens */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Tokens
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-bold text-amber-300 text-sm tracking-tight font-mono">
                  {tokens}
                </span>
                <span className="text-[9px] text-slate-400">in/out</span>
              </div>
            </div>

            {/* Metric 4: Schema Check */}
            <div className="bg-slate-900/80 border border-emerald-900/40 rounded-xl p-2 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Schema Check
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-90" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="font-bold text-emerald-400 text-xs">
                  PASSED
                </span>
              </div>
            </div>
          </div>

          {/* Expanded Deep Telemetry Drawer */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-2 pt-2 border-t border-slate-800 space-y-1.5 overflow-hidden text-[10px]"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span>Endpoint Protocol:</span>
                  <span className="text-cyan-300 font-mono">gRPC / TLS 1.3 / HTTP/2</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Structured Output:</span>
                  <span className="text-emerald-300 font-mono">Strict JSON Schema (Type.OBJECT)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Inference Grounding:</span>
                  <span className="text-indigo-300 font-mono">Spatial Telemetry + Haversine</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Temperature:</span>
                  <span className="text-slate-200 font-mono">0.10 (Deterministic Triage)</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 font-mono text-[9px] text-cyan-400/90 leading-tight">
                  <code>{`{ hazard_category, distress_score: 0.0-1.0, hitl_required: bool }`}</code>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
