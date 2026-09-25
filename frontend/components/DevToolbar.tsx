import React from 'react';
import { Terminal, ShieldAlert, Flame, Zap, RefreshCw } from 'lucide-react';
import { TEST_PRESETS } from '../data/presets';

interface DevToolbarProps {
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  onReset: () => void;
}

export const DevToolbar: React.FC<DevToolbarProps> = ({
  activePresetId,
  onSelectPreset,
  onReset
}) => {
  return (
    <div id="quick-load-dev-toolbar" className="w-full bg-[#030712] border-b border-cyan-500/20 px-3 sm:px-6 py-2 text-xs font-mono text-slate-300">
      <div className="w-full max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left Branding */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span>OPERATIONAL SCENARIO PRESETS</span>
          </div>
          <span className="text-slate-500 hidden md:inline text-[11px]">| Real-Time Triage Simulation</span>
        </div>

        {/* 3 Required Quick-Test Buttons: [Preset A: L5 Hazard], [Preset B: 7-Signal Cluster], [Preset C: Contradiction] */}
        <div className="flex flex-wrap items-center gap-2">
          {TEST_PRESETS.map(preset => {
            const isActive = activePresetId === preset.id;
            let icon = <ShieldAlert className="w-3.5 h-3.5" />;
            if (preset.id === 'preset-b') {
              icon = <Flame className="w-3.5 h-3.5 text-amber-400" />;
            } else if (preset.id === 'preset-c') {
              icon = <Zap className="w-3.5 h-3.5 text-purple-400" />;
            }

            return (
              <button
                key={preset.id}
                id={`btn-${preset.id}`}
                onClick={() => onSelectPreset(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  isActive
                    ? preset.id === 'preset-a'
                      ? 'bg-red-600 text-white shadow-red-950 border border-red-400'
                      : preset.id === 'preset-b'
                      ? 'bg-amber-600 text-slate-950 font-black shadow-amber-950 border border-amber-300'
                      : 'bg-purple-600 text-white shadow-purple-950 border border-purple-400'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                }`}
                title={preset.description}
              >
                {icon}
                <span>[{preset.label}]</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping ml-1" />
                )}
              </button>
            );
          })}

          <button
            id="btn-reset-scenarios"
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
            title="Reset All Preset Scenarios"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default DevToolbar;
