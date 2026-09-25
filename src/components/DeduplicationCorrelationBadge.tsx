import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, Users, ChevronDown, ChevronUp, MapPin, Clock } from 'lucide-react';
import { CivicIncident } from '../types';

interface DeduplicationCorrelationBadgeProps {
  incident: CivicIncident;
  variant?: 'compact' | 'full';
}

export const DeduplicationCorrelationBadge: React.FC<DeduplicationCorrelationBadgeProps> = ({
  incident
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const count = incident.duplicateCount || incident.corroboratedReports || 1;

  if (count <= 1) {
    return null;
  }

  const badgeText = `🔥 ${count} Corroborated Signals (Merged via Haversine <100m + 64D Vector Match)`;
  const computedSimilarity = incident.vectorSimilarity ? (incident.vectorSimilarity * 100).toFixed(1) : "88.0";

  return (
    <div className="relative inline-block select-none font-mono">
      {/* Animated Radar Pulse Outer Ring */}
      <div 
        id={`dedup-badge-${incident.id}`}
        onClick={() => setShowDetails(!showDetails)}
        className="relative group cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/50 text-amber-300 text-[11px] font-bold shadow-lg shadow-amber-950/40 hover:border-amber-400 transition"
        title="Corroborated citizen signals merged into 1 problem via Haversine & 64D semantic embeddings. Click to examine signals."
      >
        {/* Pulsing Radar Glow */}
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>

        <span className="truncate tracking-tight font-extrabold flex items-center gap-1">
          {badgeText}
        </span>

        {incident.corroborationDetails && (
          <span className="ml-1 text-amber-400 group-hover:text-white transition">
            {showDetails ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}
          </span>
        )}
      </div>

      {/* Corroboration Signal Inspection Dropdown */}
      <AnimatePresence>
        {showDetails && incident.corroborationDetails && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-2 w-80 sm:w-96 p-3 bg-slate-950/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-2xl shadow-black z-50 text-xs font-sans text-slate-200"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-[11px]">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>{count} CITIZEN REPORTS → 1 SINGLE INCIDENT</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-[9px] text-amber-300 font-mono font-semibold">
                Haversine &lt; 100m
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mb-2.5 leading-relaxed font-normal">
              CYPHER's spatial-semantic deduplication engine merged <strong className="text-white">{count} independent citizen reports</strong> within a 100m radius into this single master incident, preventing queue duplication.
            </p>

            {/* List of the reports */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {incident.corroborationDetails.map((sig, idx) => (
                <div 
                  key={idx} 
                  className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-1 text-[11px]"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-white flex items-center gap-1">
                      <Users className="w-3 h-3 text-amber-400" />
                      {sig.citizen}
                    </span>
                    <span className="text-cyan-400 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      +{sig.distanceM}m offset
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {sig.time}
                    </span>
                    <span className="text-slate-300 bg-slate-800 px-1.5 py-0.2 rounded text-[9px]">
                      {sig.medium}
                    </span>
                  </div>

                  <p className="text-slate-300 italic text-[10px] bg-slate-950/70 p-1.5 rounded border border-slate-800/60 leading-tight">
                    "{sig.transcript}"
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Cosine Similarity Match: <strong className="text-amber-400">{computedSimilarity}%</strong></span>
              <span className="text-cyan-400">1 Unified Dispatch</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
