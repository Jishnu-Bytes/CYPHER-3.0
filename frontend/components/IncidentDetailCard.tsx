import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Globe, 
  Volume2, 
  Camera, 
  Wrench, 
  Users, 
  DollarSign, 
  FileText,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CivicIncident } from '../types';
import { HitlSafetyGateBanner } from './HitlSafetyGateBanner';
import { DeduplicationCorrelationBadge } from './DeduplicationCorrelationBadge';
import { CrossModalContradictionAlert } from './CrossModalContradictionAlert';

interface IncidentDetailCardProps {
  incident: CivicIncident;
  onAuthorizeToggle: (id: string) => void;
  onDispatchCrew: (id: string) => void;
}

export const IncidentDetailCard: React.FC<IncidentDetailCardProps> = ({
  incident,
  onAuthorizeToggle,
  onDispatchCrew
}) => {
  return (
    <div id="incident-detail-card" className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-2xl space-y-4 font-sans text-slate-200">
      {/* Component 2: HITL Safety Gate Banner (Prominent across top) */}
      <HitlSafetyGateBanner 
        incident={incident}
        onAuthorizeToggle={onAuthorizeToggle}
        onDispatchCrew={onDispatchCrew}
      />

      {/* Component 4: Cross-Modal Contradiction Alert (Conditional) */}
      <CrossModalContradictionAlert incident={incident} />

      {/* Header Info: Ticket ID, Hazard Category, Criticality & Deduplication Badge */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-black text-white tracking-wide">
              {incident.ticketId}
            </span>
            <span className="font-mono text-xs text-slate-400">
              ({incident.referenceId})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold">
              {incident.hazard_category || "General Hazard"}
            </span>

            {/* Component 3: Deduplication Correlation Badge */}
            <DeduplicationCorrelationBadge incident={incident} />
          </div>
        </div>

        {/* Distress & Criticality Score Gauges */}
        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400 uppercase">Distress Score</div>
            <div className="text-base font-black text-amber-400">
              {(incident.distress_score * 100).toFixed(0)}%
              <span className="text-[10px] text-slate-400 font-normal"> / 1.00</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400 uppercase">Criticality</div>
            <div className="text-base font-black text-red-400">
              LEVEL {incident.criticality_level} / 5
            </div>
          </div>
        </div>
      </div>

      {/* Normalized Operational Summary */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1">
        <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            NORMALIZED OPERATIONAL SUMMARY
          </span>
          <span className="text-[10px] text-slate-400">English Standard Triage</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-100 font-sans leading-relaxed">
          {incident.normalized_summary || incident.summary}
        </p>
      </div>

      {/* Multimodal Evidence Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left: Citizen Audio & Native Transcript */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1 font-semibold text-cyan-300">
              <Volume2 className="w-3.5 h-3.5" />
              Regional Speech Transcript
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {incident.language || "Regional Dialect"}
            </span>
          </div>

          <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-xs italic text-slate-300 font-sans">
            "{incident.transcription || incident.typedComplaint}"
          </div>

          <div className="text-[11px] text-slate-400 font-sans">
            <strong className="text-slate-300">Normalized Translation:</strong> {incident.englishTranslation}
          </div>
        </div>

        {/* Right: Computer Vision Summary & Imagery */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1 font-semibold text-indigo-300">
              <Camera className="w-3.5 h-3.5" />
              Optical Vision Features
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              Tensor Ingestion Verified
            </span>
          </div>

          {incident.preRepairPhotoUrl ? (
            <div className="relative h-28 w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
              <img 
                src={incident.preRepairPhotoUrl} 
                alt="Incident Ground Telemetry"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono text-slate-300">
                Live Sensor Feed
              </div>
            </div>
          ) : (
            <div className="h-28 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-500 font-mono">
              No Optical Tensor Uploaded
            </div>
          )}
        </div>
      </div>

      {/* Deployment & Equipment Specifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-mono">
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
            <Wrench className="w-3 h-3 text-cyan-400" />
            Required Equipment Checklist
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {(incident.required_equipment || ["Emergency Isolation Kit", "First Responder Unit"]).map((eq, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] border border-slate-700">
                {eq}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
            <MapPin className="w-3 h-3 text-red-400" />
            Telemetry Geolocation
          </span>
          <div className="text-slate-200 text-xs font-semibold truncate mt-1">
            {incident.location}
          </div>
          <div className="text-[10px] text-cyan-400 font-mono">
            GPS: [{incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}]
          </div>
        </div>
      </div>
    </div>
  );
};
