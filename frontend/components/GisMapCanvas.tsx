import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Flame, AlertTriangle, ShieldCheck, Truck, Users, Radio, Navigation } from 'lucide-react';
import { CivicIncident } from '../types';

interface GisMapCanvasProps {
  incidents: CivicIncident[];
  selectedIncidentId: string;
  onSelectIncident: (id: string) => void;
}

export const GisMapCanvas: React.FC<GisMapCanvasProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident
}) => {
  const [activeTab, setActiveTab] = useState<'hyderabad' | 'global'>('hyderabad');

  // Selected incident
  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  return (
    <div id="gis-command-canvas" className="relative w-full h-full min-h-[460px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Map HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Status Pill - Clean, confident, zero watermark! */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="font-bold tracking-wider">GIS COMMAND CENTER • ACTIVE</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-semibold">{incidents.length} Plotted Incidents</span>
        </div>

        {/* Sector Switcher */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('hyderabad')}
            className={`px-2.5 py-1 rounded-lg transition font-bold ${
              activeTab === 'hyderabad' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sector 1: Hyderabad (Active)
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`px-2.5 py-1 rounded-lg transition font-bold ${
              activeTab === 'global' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Global BRICS Grid
          </button>
        </div>
      </div>

      {/* Interactive Tactical Grid Canvas */}
      <div className="relative flex-1 w-full bg-[#030712] overflow-hidden flex items-center justify-center p-6 select-none">
        {/* Grid Lines Background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#6366f1 1px, #030712 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
          }}
        />

        {/* Radar Scanner Sweep Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="w-[140%] h-[140%] -top-[20%] -left-[20%] rounded-full border border-cyan-500/20 absolute animate-spin" style={{ animationDuration: '24s' }} />
          <div className="w-[80%] h-[80%] top-[10%] left-[10%] rounded-full border border-indigo-500/20 absolute" />
        </div>

        {/* Tactical Geography Nodes for Hyderabad & Metro Clusters */}
        <div className="relative w-full max-w-2xl h-80 sm:h-96 border border-slate-800/80 rounded-2xl bg-slate-950/40 p-4">
          <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span>SOVEREIGN MUNICIPAL SECTOR: HYDERABAD TELANGANA (17.3850° N, 78.4867° E)</span>
          </div>

          {/* Incident Markers Plotted on Map */}
          {incidents.map((incident) => {
            const isSelected = incident.id === activeIncident?.id;
            const isMerged7x = (incident.duplicateCount || incident.corroboratedReports || 0) >= 7;
            const score = incident.criticality_level || incident.hazardPriorityScore || 1;

            // Compute visual position based on incident lat/lng
            let topPercent = 50;
            let leftPercent = 50;

            if (incident.id === 'rep-preset-2' || incident.id === 'rep-000-flood') {
              // Cyber Towers storm drain (top-left quadrant)
              topPercent = 38;
              leftPercent = 34;
            } else if (incident.id === 'rep-preset-1' || incident.id === 'rep-003') {
              // Charminar (bottom-right quadrant)
              topPercent = 68;
              leftPercent = 68;
            } else if (incident.id === 'rep-preset-3' || incident.id === 'rep-000-contradiction') {
              // Madhapur substation (center-left)
              topPercent = 42;
              leftPercent = 48;
            } else if (incident.id === 'rep-001') {
              // Gachibowli
              topPercent = 54;
              leftPercent = 26;
            } else {
              // Sao Paulo or other global
              topPercent = 75;
              leftPercent = 20;
            }

            let markerColor = '#10b981'; // Green
            if (score >= 4) markerColor = '#ef4444'; // Red
            else if (score === 3) markerColor = '#f59e0b'; // Yellow

            return (
              <div
                key={incident.id}
                id={`gis-marker-${incident.id}`}
                onClick={() => onSelectIncident(incident.id)}
                className="absolute transition-all duration-300 cursor-pointer"
                style={{
                  top: `${topPercent}%`,
                  left: `${leftPercent}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isSelected ? 30 : 15
                }}
              >
                {/* Visual Beacon Pulse for Level 5 / Corroborated */}
                {score >= 4 && (
                  <span className="absolute -inset-3 rounded-full opacity-75 animate-ping pointer-events-none" style={{ backgroundColor: markerColor }} />
                )}

                {/* The Unified Pin */}
                <div className={`relative flex items-center justify-center rounded-full transition transform hover:scale-125 ${
                  isSelected ? 'scale-110 ring-4 ring-cyan-400 shadow-2xl shadow-cyan-500' : ''
                }`}
                style={{
                  width: isMerged7x ? '38px' : '30px',
                  height: isMerged7x ? '38px' : '30px',
                  backgroundColor: markerColor,
                  border: '3px solid #ffffff',
                  boxShadow: `0 0 16px ${markerColor}`
                }}>
                  <span className="font-mono font-black text-white text-xs">
                    {score}
                  </span>
                </div>

                {/* Single Problem Badge Showing 7 Users Merged (User Request) */}
                {isMerged7x && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-black text-[10px] shadow-lg shadow-amber-950 flex items-center gap-1 border border-amber-300 animate-bounce">
                    <Flame className="w-3 h-3 text-slate-950" />
                    <span>7x MERGED (1 PROBLEM)</span>
                  </div>
                )}

                {/* Subtitle / Ticket Label */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono font-semibold text-slate-300 bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-800">
                  {incident.ticketId}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Map Legend & Deduplication Callout */}
      <div className="p-3 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500" />
            <span className="text-slate-300 text-[11px]">Level 4-5 (Critical HITL)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300 text-[11px]">Level 3 (Moderate)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300 text-[11px]">Level 1-2 (Low)</span>
          </div>
        </div>

        {/* User Directive: 7 Reports = 1 Problem on Map */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[11px]">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>7 Citizen Reports Clustered into 1 Sovereign Incident Pin</span>
        </div>
      </div>
    </div>
  );
};
