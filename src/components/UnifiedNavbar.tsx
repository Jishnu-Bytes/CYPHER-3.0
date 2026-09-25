import React from 'react';
import { 
  Compass, 
  FileText, 
  Search, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Activity,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { AppView, ThemeMode } from '../types';

interface UnifiedNavbarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  pendingCount?: number;
}

export const UnifiedNavbar: React.FC<UnifiedNavbarProps> = ({
  activeView,
  onSelectView,
  themeMode,
  onToggleTheme,
  pendingCount = 3,
}) => {
  const isDark = themeMode === 'dark';

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'console',
      label: 'GIS Command Console',
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'admin',
      label: 'Municipal Operations Desk',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'report',
      label: 'Citizen Intake Portal',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'track',
      label: 'Track Complaint',
      icon: <Search className="w-4 h-4" />,
    },
  ];

  return (
    <nav
      id="unified-app-navbar"
      className={`w-full border-b px-4 sm:px-6 py-2.5 transition-colors duration-200 z-50 sticky top-0 ${
        isDark
          ? 'bg-[#080d1a]/95 border-slate-800 backdrop-blur-md text-slate-100 shadow-lg shadow-black/40'
          : 'bg-white/95 border-slate-200 backdrop-blur-md text-slate-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Engine Indicator */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div 
            onClick={() => onSelectView('console')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-900/40 border border-cyan-400/40 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-white">
                  CYPHER
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  ENGINE v2.5
                </span>
              </div>
              <p className={`text-[10px] font-mono leading-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Sovereign Civic Intelligence
              </p>
            </div>
          </div>

          {/* Mobile Theme Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className={`p-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-amber-400/40 text-amber-300'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Modular Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onSelectView(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40 border border-cyan-400 scale-[1.02]'
                    : isDark
                    ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Telemetry & Theme Switcher */}
        <div className="hidden lg:flex items-center gap-2.5 text-xs font-mono">
          <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 text-[11px] ${
            isDark 
              ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-300' 
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">Sub-50ms</span>
          </div>

          <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 text-[11px] ${
            isDark 
              ? 'bg-slate-900/90 border-cyan-500/40 text-cyan-300' 
              : 'bg-cyan-50 border-cyan-300 text-cyan-800'
          }`}>
            <Zap className="w-3.5 h-3.5 text-cyan-500" />
            <span className="font-semibold">Gemini 2.5 Flash</span>
          </div>

          <button
            id="nav-theme-switcher"
            onClick={onToggleTheme}
            className={`px-2.5 py-1 rounded-full border font-mono font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-amber-400/50 text-amber-300'
                : 'bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-900'
            }`}
            title="Toggle Light / Dark Theme"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
