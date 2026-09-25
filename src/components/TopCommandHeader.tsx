import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Filter, 
  Flame, 
  Lock, 
  CheckCircle2, 
  Activity,
  Sun,
  Moon
} from 'lucide-react';
import { ThemeMode } from '../types';

interface TopCommandHeaderProps {
  activeFilter: 'all' | 'hitl' | 'merged' | 'resolved';
  onFilterChange: (filter: 'all' | 'hitl' | 'merged' | 'resolved') => void;
  counts: {
    all: number;
    hitl: number;
    merged: number;
    resolved: number;
  };
  themeMode: ThemeMode;
  onToggleTheme: () => void;
}

export const TopCommandHeader: React.FC<TopCommandHeaderProps> = ({
  activeFilter,
  onFilterChange,
  counts,
  themeMode,
  onToggleTheme
}) => {
  const isDark = themeMode === 'dark';

  return (
    <header 
      id="top-command-header"
      className={`w-full border-b px-4 sm:px-6 py-3 flex flex-col gap-3 shadow-xl transition-colors duration-200 ${
        isDark 
          ? 'bg-[#0a0f1d] border-slate-800/90 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}
    >
      {/* Top Row: Title + Live Status Badges + Theme Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-900/30 border border-cyan-400/40 shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={`text-base sm:text-lg font-black font-mono tracking-wider flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <span>CYPHER // MUNICIPAL GIS DISPATCH ENGINE</span>
            </h1>
            <p className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Autonomous Spatial Triage &amp; Human-in-the-Loop Municipal Operations
            </p>
          </div>
        </div>

        {/* Live Status Badges (Top Right) + Theme Switcher */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Badge 1: WebSocket Connected */}
          <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-sm ${
            isDark 
              ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-300' 
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">🟢 WebSocket: Connected (Sub-50ms)</span>
          </div>

          {/* Badge 2: Gemini 2.5 Flash */}
          <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-sm ${
            isDark 
              ? 'bg-slate-900/90 border-cyan-500/40 text-cyan-300' 
              : 'bg-cyan-50 border-cyan-300 text-cyan-800'
          }`}>
            <Zap className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500" />
            <span className="font-bold">⚡ Gemini 2.5 Flash: Active (1.18s • ~412 tok)</span>
          </div>

          {/* Badge 3: Schema Validation */}
          <div className={`hidden md:flex px-2.5 py-1 rounded-full border items-center gap-1.5 shadow-sm ${
            isDark 
              ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-300' 
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-bold">Schema: PASS</span>
          </div>

          {/* Badge 4: HITL Safety Gate */}
          <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-sm ${
            isDark 
              ? 'bg-slate-900/90 border-indigo-500/40 text-indigo-300' 
              : 'bg-indigo-50 border-indigo-300 text-indigo-800'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-bold">🛡️ HITL Safety Gate: ENFORCED</span>
          </div>

          {/* Theme Switcher Button */}
          <button
            id="theme-switcher-toggle"
            onClick={onToggleTheme}
            className={`px-3 py-1 rounded-full border font-mono font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-amber-400/50 text-amber-300'
                : 'bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-900'
            }`}
            title="Toggle Light / Dark Map & Interface Theme"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>[☀️ Light]</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>[🌙 Dark]</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Row: Filter Controls Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono flex items-center gap-1 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <Filter className="w-3.5 h-3.5" />
            <span>Map Filters:</span>
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Filter 1: All Incidents */}
            <button
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-900/40 border border-cyan-400'
                  : isDark
                    ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <span>[All Incidents]</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
                {counts.all}
              </span>
            </button>

            {/* Filter 2: HITL Required */}
            <button
              onClick={() => onFilterChange('hitl')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'hitl'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-900/40 border border-red-400'
                  : isDark
                    ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Lock className="w-3 h-3 text-red-400" />
              <span>[⚠️ HITL Required]</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
                {counts.hitl}
              </span>
            </button>

            {/* Filter 3: Merged Clusters */}
            <button
              onClick={() => onFilterChange('merged')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'merged'
                  ? 'bg-amber-600 text-slate-950 font-black shadow-md shadow-amber-900/40 border border-amber-300'
                  : isDark
                    ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-500" />
              <span>[🔥 Merged Clusters]</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
                {counts.merged}
              </span>
            </button>

            {/* Filter 4: Resolved */}
            <button
              onClick={() => onFilterChange('resolved')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'resolved'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/40 border border-emerald-400'
                  : isDark
                    ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>[✅ Resolved]</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
                {counts.resolved}
              </span>
            </button>
          </div>
        </div>

        <div className={`hidden sm:flex items-center gap-2 text-xs font-mono ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Active Grid Mesh: <strong className={isDark ? 'text-white' : 'text-slate-900'}>WGS-84 Telemetry</strong></span>
        </div>
      </div>
    </header>
  );
};
export default TopCommandHeader;
