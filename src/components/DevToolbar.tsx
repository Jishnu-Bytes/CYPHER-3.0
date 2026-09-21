import React from 'react';
import { motion } from 'motion/react';
import { Sliders, Zap, Flame, AlertOctagon, Terminal, RefreshCw, Layers } from 'lucide-react';
import { TEST_PRESETS } from '../data/presets';
import { CivicIncident } from '../types';

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
    <div id="quick-load-dev-toolbar" className="w-full bg-slate-950/90 border-b border-cyan-500/30 px-3 py-2 text-xs font-mono text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left Branding */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold">
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span>DEV TOOLBAR • QUICK-LOAD PRESETS</span>
          </div>
          <span className="text-slate-500 hidden sm:inline text-[11px]">| Instant Test States</span>
        </div>

        {/* 3 Preset Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {TEST_PRESETS.map(preset => {
            const isActive = activePresetId === preset.id;
            let accentColor = "cyan";
            let Icon = Zap;

            if (preset.id === 'preset-1') {
              accentColor = "red";
              Icon = Zap;
            } else if (preset.id === 'preset-2') {
              accentColor = "amber";
              Icon = Flame;
            } else if (preset.id === 'preset-3') {
              accentColor = "purple";
              Icon = AlertOctagon;
            }

            return (
              <button
                key={preset.id}
                id={`btn-${preset.id}`}
                onClick={() => onSelectPreset(preset.id)}
                className={`relative px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  isActive
                    ? preset.id === 'preset-1'
                      ? 'bg-red-600 text-white shadow-red-900/60 border border-red-400 ring-1 ring-red-400'
                      : preset.id === 'preset-2'
                        ? 'bg-amber-600 text-slate-950 shadow-amber-900/60 border border-amber-300 ring-1 ring-amber-300 font-extrabold'
                        : 'bg-purple-600 text-white shadow-purple-900/60 border border-purple-400 ring-1 ring-purple-400'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-slate-600'
                }`}
                title={preset.description}
              >
                <Icon className={`w-3.5 h-3.5 ${
                  isActive ? (preset.id === 'preset-2' ? 'text-slate-950' : 'text-white') : 'text-slate-400'
                }`} />
                <span>[{preset.label}]</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}

          <button
            id="btn-reset-scenarios"
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            title="Reset All Incidents"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
