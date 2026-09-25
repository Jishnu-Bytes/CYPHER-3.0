import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Lock, 
  Check, 
  Zap, 
  Plus, 
  Minus, 
  Compass, 
  AlertTriangle
} from 'lucide-react';
import { CivicIncident, ThemeMode } from '../types';

interface GoogleDarkMapCanvasProps {
  incidents: CivicIncident[];
  selectedIncidentId: string;
  onSelectIncident: (id: string) => void;
  activeFilter: 'all' | 'hitl' | 'merged' | 'resolved';
  themeMode?: ThemeMode;
}

export const GoogleDarkMapCanvas: React.FC<GoogleDarkMapCanvasProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  activeFilter,
  themeMode = 'dark'
}) => {
  const [mapType, setMapType] = useState<'vector' | 'satellite' | 'terrain'>('vector');
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [hoveredIncidentId, setHoveredIncidentId] = useState<string | null>(null);

  const isDark = themeMode === 'dark';

  // Dynamic Theme Colors according to Specification:
  // Dark: Land #242f3e, Water #17263c, Roads #38414e | Accents: #FF5252, #00E5FF, #FFC107
  // Light: Land #f5f5f5, Water #c9e8e5, Roads #ffffff | Accents: #D32F2F, #1976D2, #F57C00
  const themeColors = isDark
    ? {
        land: '#242f3e',
        water: '#17263c',
        waterBorder: '#1d304a',
        roads: '#38414e',
        minorRoads: '#2c3545',
        blocks: '#1f2735',
        parks: '#1b2836',
        textRoads: '#8d9aa9',
        accent1: '#FF5252',
        accent2: '#00E5FF',
        accent3: '#FFC107',
        hudBg: 'bg-[#17263c]/90',
        hudBorder: 'border-slate-700/80',
        hudText: 'text-slate-200'
      }
    : {
        land: '#f5f5f5',
        water: '#c9e8e5',
        waterBorder: '#a5d5d0',
        roads: '#ffffff',
        minorRoads: '#e2e8f0',
        blocks: '#e5e7eb',
        parks: '#dcfce7',
        textRoads: '#475569',
        accent1: '#D32F2F',
        accent2: '#1976D2',
        accent3: '#F57C00',
        hudBg: 'bg-white/95',
        hudBorder: 'border-slate-300',
        hudText: 'text-slate-800'
      };

  // Filtered incidents
  const filteredIncidents = incidents.filter(inc => {
    if (activeFilter === 'hitl') return inc.hitl_required || !inc.hitl_authorized;
    if (activeFilter === 'merged') return (inc.duplicateCount || inc.corroboratedReports || 0) >= 7;
    if (activeFilter === 'resolved') return inc.status === 'RESOLVED';
    return true;
  });

  return (
    <div 
      id="google-maps-dark-container" 
      className={`relative w-full h-full min-h-[580px] rounded-2xl border overflow-hidden shadow-2xl flex flex-col select-none font-sans transition-colors duration-300 ${
        isDark ? 'border-slate-800' : 'border-slate-200 shadow-slate-200'
      }`}
      style={{ backgroundColor: themeColors.land }}
    >
      {/* ------------------------------------------------------------- */}
      {/* GOOGLE MAPS CONTROLS: TOP BAR (Map Type / Mode Switcher)       */}
      {/* ------------------------------------------------------------- */}
      <div className={`absolute top-3 left-3 z-30 flex items-center gap-1.5 p-1 rounded-xl backdrop-blur-md border shadow-xl ${themeColors.hudBg} ${themeColors.hudBorder}`}>
        <button
          onClick={() => setMapType('vector')}
          className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
            mapType === 'vector' 
              ? isDark ? 'bg-[#38414e] text-cyan-300 font-bold' : 'bg-slate-200 text-indigo-700 font-bold' 
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {isDark ? 'Vector Night' : 'Vector Day'}
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
            mapType === 'satellite' 
              ? isDark ? 'bg-[#38414e] text-cyan-300 font-bold' : 'bg-slate-200 text-indigo-700 font-bold' 
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapType('terrain')}
          className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
            mapType === 'terrain' 
              ? isDark ? 'bg-[#38414e] text-cyan-300 font-bold' : 'bg-slate-200 text-indigo-700 font-bold' 
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Terrain
        </button>
      </div>

      {/* Top Center: Active Sector Telemetry Badge */}
      <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md border text-[11px] font-mono shadow-xl ${themeColors.hudBg} ${themeColors.hudBorder} ${themeColors.hudText}`}>
        <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: themeColors.accent2 }} />
        <span className="font-bold" style={{ color: themeColors.accent2 }}>HYDERABAD DISPATCH GRID</span>
        <span className="opacity-40">|</span>
        <span>17.3850° N, 78.4867° E</span>
        <span className="opacity-40">|</span>
        <span className="font-bold text-emerald-500">{filteredIncidents.length} Active Targets</span>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* GOOGLE MAPS CONTROLS: ZOOM +/- & RECENTER (Right Edge)        */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute bottom-16 right-3 z-30 flex flex-col items-center gap-1.5 shadow-2xl">
        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition shadow-lg active:scale-95 cursor-pointer ${themeColors.hudBg} ${themeColors.hudBorder} ${themeColors.hudText}`}
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 1, 10))}
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition shadow-lg active:scale-95 cursor-pointer ${themeColors.hudBg} ${themeColors.hudBorder} ${themeColors.hudText}`}
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoomLevel(14);
            onSelectIncident('rep-master-7x');
          }}
          className={`w-8 h-8 mt-2 rounded-lg border flex items-center justify-center transition shadow-lg active:scale-95 cursor-pointer ${themeColors.hudBg} ${themeColors.hudBorder}`}
          style={{ color: themeColors.accent2 }}
          title="Center on 7-in-1 Master Cluster"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VECTOR CANVAS MAP VIEWPORT (Dark & Light Theme Vector Schema)  */}
      {/* ------------------------------------------------------------- */}
      <div className="relative flex-1 w-full overflow-hidden" style={{ backgroundColor: themeColors.land }}>
        {/* Synthetic Google Maps Vector Graphic (SVG) */}
        <svg 
          className="w-full h-full absolute inset-0 pointer-events-none opacity-90 transition-colors duration-300"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1000 650"
        >
          <defs>
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={themeColors.water} />
              <stop offset="100%" stopColor={isDark ? '#0f1a29' : '#b2e2dd'} />
            </linearGradient>

            <pattern id="buildingPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect x="2" y="2" width="16" height="14" rx="2" fill={themeColors.blocks} />
              <rect x="22" y="4" width="14" height="12" rx="2" fill={themeColors.blocks} />
              <rect x="4" y="22" width="14" height="14" rx="2" fill={themeColors.blocks} />
              <rect x="22" y="20" width="16" height="16" rx="2" fill={themeColors.blocks} />
            </pattern>
          </defs>

          {/* Urban Land Grid Base */}
          <rect x="0" y="0" width="1000" height="650" fill={themeColors.land} />

          {/* Park & Greenery Zones */}
          <path d="M 80,40 C 140,50 180,120 120,180 C 60,190 40,120 80,40 Z" fill={themeColors.parks} />
          <path d="M 720,80 C 820,60 880,140 820,200 C 740,210 700,140 720,80 Z" fill={themeColors.parks} />
          <path d="M 380,460 C 480,440 560,520 490,610 C 400,620 340,540 380,460 Z" fill={themeColors.parks} />

          {/* Vector City Blocks / Building Footprints */}
          <rect x="180" y="100" width="220" height="180" fill="url(#buildingPattern)" opacity="0.65" />
          <rect x="480" y="80" width="200" height="240" fill="url(#buildingPattern)" opacity="0.65" />
          <rect x="220" y="340" width="280" height="200" fill="url(#buildingPattern)" opacity="0.65" />
          <rect x="580" y="320" width="280" height="240" fill="url(#buildingPattern)" opacity="0.65" />

          {/* Major Water Bodies: Hussain Sagar & Durgam Cheruvu */}
          <path 
            d="M 680,240 C 760,220 840,260 860,340 C 880,420 800,480 720,460 C 660,440 640,360 650,300 Z" 
            fill="url(#waterGrad)"
            stroke={themeColors.waterBorder}
            strokeWidth="3"
          />
          <text x="740" y="350" fill={isDark ? '#465872' : '#0e7490'} fontSize="13" fontFamily="Roboto, sans-serif" fontWeight="bold" letterSpacing="1">
            HUSSAIN SAGAR
          </text>

          <path 
            d="M 120,380 C 180,360 220,400 240,460 C 220,520 160,540 110,500 C 80,460 90,400 120,380 Z" 
            fill="url(#waterGrad)"
            stroke={themeColors.waterBorder}
            strokeWidth="2"
          />
          <text x="130" y="450" fill={isDark ? '#465872' : '#0e7490'} fontSize="11" fontFamily="Roboto, sans-serif" fontWeight="bold">
            DURGAM CHERUVU
          </text>

          {/* Secondary Arterial Roads */}
          <path d="M 0,160 L 1000,160" stroke={themeColors.minorRoads} strokeWidth="6" />
          <path d="M 0,360 L 1000,360" stroke={themeColors.minorRoads} strokeWidth="6" />
          <path d="M 0,520 L 1000,520" stroke={themeColors.minorRoads} strokeWidth="6" />
          <path d="M 280,0 L 280,650" stroke={themeColors.minorRoads} strokeWidth="6" />
          <path d="M 440,0 L 440,650" stroke={themeColors.minorRoads} strokeWidth="6" />
          <path d="M 680,0 L 680,650" stroke={themeColors.minorRoads} strokeWidth="6" />
          <path d="M 840,0 L 840,650" stroke={themeColors.minorRoads} strokeWidth="6" />

          {/* Primary Highways & Flyovers */}
          <path 
            d="M 50,0 C 180,180 340,320 540,350 C 720,380 880,500 980,650" 
            fill="none" 
            stroke={themeColors.roads} 
            strokeWidth="14" 
            strokeLinecap="round" 
          />
          <path 
            d="M 50,0 C 180,180 340,320 540,350 C 720,380 880,500 980,650" 
            fill="none" 
            stroke={themeColors.accent3} 
            strokeWidth="2.5" 
            strokeDasharray="14 10" 
            opacity="0.8"
          />
          <text x="320" y="270" fill={themeColors.textRoads} fontSize="11" fontFamily="Roboto, sans-serif" transform="rotate(35, 320, 270)">
            OUTER RING ROAD (ORR)
          </text>

          {/* PVNR Elevated Expressway */}
          <path 
            d="M 980,80 C 800,160 520,240 280,480 C 140,600 80,650 0,650" 
            fill="none" 
            stroke={themeColors.roads} 
            strokeWidth="12" 
            strokeLinecap="round" 
          />
          <path 
            d="M 980,80 C 800,160 520,240 280,480 C 140,600 80,650 0,650" 
            fill="none" 
            stroke={themeColors.accent2} 
            strokeWidth="2" 
            strokeDasharray="12 8" 
            opacity="0.85"
          />

          {/* Local Road Grid Lines */}
          {[120, 220, 320, 480, 580, 760, 880].map((rx, idx) => (
            <line key={`grid-x-${idx}`} x1={rx} y1="0" x2={rx} y2="650" stroke={themeColors.minorRoads} strokeWidth="2" strokeDasharray="4 6" opacity="0.6" />
          ))}
          {[80, 240, 420, 580].map((ry, idx) => (
            <line key={`grid-y-${idx}`} x1="0" y1={ry} x2="1000" y2={ry} stroke={themeColors.minorRoads} strokeWidth="2" strokeDasharray="4 6" opacity="0.6" />
          ))}

          {/* Sector Labels */}
          <text x="460" y="320" fill={themeColors.textRoads} fontSize="12" fontFamily="Roboto, monospace" fontWeight="bold">
            SECTOR 1 • HITEC CITY CORE
          </text>
          <text x="460" y="140" fill={themeColors.textRoads} fontSize="11" fontFamily="Roboto, monospace">
            NORTH SECTOR • SECUNDERABAD
          </text>
          <text x="760" y="440" fill={themeColors.textRoads} fontSize="11" fontFamily="Roboto, monospace">
            EAST SECTOR • UPPAL JUNCTION
          </text>
          <text x="320" y="560" fill={themeColors.textRoads} fontSize="11" fontFamily="Roboto, monospace">
            SOUTH SECTOR • OLD CITY PLAZA
          </text>
        </svg>

        {/* ------------------------------------------------------------- */}
        {/* SPATIAL INCIDENT MARKERS (THE 4 EXACT SPECIFIED STATES)       */}
        {/* ------------------------------------------------------------- */}

        {/* MARKER A: THE FEATURED "7-IN-1" DEDUPLICATED MASTER MARKER (Center Map) */}
        {filteredIncidents.some(i => i.id === 'rep-master-7x') && (
          <div 
            id="marker-rep-master-7x"
            style={{ left: '50%', top: '48%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
            onClick={() => onSelectIncident('rep-master-7x')}
            onMouseEnter={() => setHoveredIncidentId('rep-master-7x')}
            onMouseLeave={() => setHoveredIncidentId(null)}
          >
            <div className="relative flex flex-col items-center">
              {/* Outer Pulsing Glowing Ring */}
              <div className="absolute -inset-4 rounded-full bg-amber-500/30 animate-ping pointer-events-none" />
              <div className="absolute -inset-2 rounded-full bg-orange-600/40 animate-pulse pointer-events-none" />

              {/* Pin Base */}
              <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-2xl transition-transform duration-200 ${
                selectedIncidentId === 'rep-master-7x' 
                  ? 'scale-115 border-white bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 ring-4 ring-amber-400/50' 
                  : 'border-amber-300 bg-gradient-to-br from-amber-500 to-orange-600 hover:scale-105'
              }`}>
                <Flame className="w-6 h-6 text-white drop-shadow" />
              </div>

              {/* Prominent Badge: 🔥 7 Signals Merged */}
              <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/95 border border-amber-400 text-amber-300 text-[11px] font-mono font-black tracking-tight whitespace-nowrap shadow-xl flex items-center gap-1">
                <span>🔥 7 Signals Merged</span>
              </div>

              {/* Tooltip Hover as specified:
                  "Haversine Proximity < 100m | Vector Similarity 0.88 → Merged 7 citizen reports into 1 master incident." */}
              <AnimatePresence>
                {hoveredIncidentId === 'rep-master-7x' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-3 w-80 p-3 rounded-xl bg-slate-950/95 border border-amber-400/80 shadow-2xl z-40 text-left pointer-events-none"
                  >
                    <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xs pb-1 border-b border-slate-800">
                      <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>MASTER INCIDENT CORRELATION</span>
                    </div>
                    <p className="text-xs font-sans text-slate-200 mt-1.5 leading-snug">
                      Haversine Proximity &lt; 100m | Vector Similarity 0.88 → Merged 7 citizen reports into 1 master incident.
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-cyan-300 flex items-center justify-between">
                      <span>Substation Culvert Breach</span>
                      <span className="text-amber-400 font-bold">Level 5 Emergency</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* MARKER B: LEVEL 5 HITL SAFETY GATE MARKER (North Sector) */}
        {filteredIncidents.some(i => i.id === 'rep-hitl-north') && (
          <div 
            id="marker-rep-hitl-north"
            style={{ left: '48%', top: '22%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
            onClick={() => onSelectIncident('rep-hitl-north')}
            onMouseEnter={() => setHoveredIncidentId('rep-hitl-north')}
            onMouseLeave={() => setHoveredIncidentId(null)}
          >
            <div className="relative flex flex-col items-center">
              {/* Flashing Red Alert Ping */}
              <div className="absolute -inset-3 rounded-full bg-red-600/40 animate-ping pointer-events-none" />

              <div className={`relative flex items-center justify-center w-11 h-11 rounded-full border-2 shadow-2xl transition-transform duration-200 ${
                selectedIncidentId === 'rep-hitl-north'
                  ? 'scale-115 border-white bg-red-600 ring-4 ring-red-400/50'
                  : 'border-red-400 bg-red-600 hover:scale-105'
              }`}>
                <Lock className="w-5 h-5 text-white animate-bounce" />
              </div>

              {/* Badge: 🔒 HITL LOCK */}
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/95 border border-red-500 text-red-300 text-[10px] font-mono font-bold whitespace-nowrap shadow-xl flex items-center gap-1">
                <span>🔒 HITL LOCK</span>
              </div>

              {/* Tooltip Hover */}
              <AnimatePresence>
                {hoveredIncidentId === 'rep-hitl-north' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-3 w-72 p-3 rounded-xl bg-slate-950/95 border border-red-500/80 shadow-2xl z-40 text-left pointer-events-none"
                  >
                    <div className="text-red-400 font-mono font-bold text-xs pb-1 border-b border-slate-800 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>LEVEL 5 SAFETY INTERLOCK</span>
                    </div>
                    <p className="text-xs font-sans text-slate-200 mt-1 leading-snug">
                      High-Voltage Line Down in Water: Automated dispatch locked until operator validates triage.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* MARKER C: IN-PROGRESS INCIDENT MARKER (East Sector) */}
        {filteredIncidents.some(i => i.id === 'rep-progress-east') && (
          <div 
            id="marker-rep-progress-east"
            style={{ left: '78%', top: '56%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
            onClick={() => onSelectIncident('rep-progress-east')}
            onMouseEnter={() => setHoveredIncidentId('rep-progress-east')}
            onMouseLeave={() => setHoveredIncidentId(null)}
          >
            <div className="relative flex flex-col items-center">
              <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-2xl transition-transform duration-200 ${
                selectedIncidentId === 'rep-progress-east'
                  ? 'scale-115 border-white bg-amber-500 ring-4 ring-amber-400/50'
                  : 'border-amber-300 bg-amber-500 hover:scale-105'
              }`}>
                <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
              </div>

              {/* Badge: ⚡ Dispatched */}
              <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/95 border border-amber-400 text-amber-300 text-[10px] font-mono font-bold whitespace-nowrap shadow-xl">
                <span>⚡ Dispatched</span>
              </div>

              {/* Tooltip Hover */}
              <AnimatePresence>
                {hoveredIncidentId === 'rep-progress-east' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-3 w-64 p-2.5 rounded-xl bg-slate-950/95 border border-amber-400/80 shadow-2xl z-40 text-left pointer-events-none"
                  >
                    <div className="text-amber-400 font-mono font-bold text-xs">Main Water Pipe Leak</div>
                    <p className="text-[11px] font-sans text-slate-300 mt-0.5">
                      Assigned Unit: <strong className="text-white">Utility Crew 04</strong> (In Progress)
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* MARKER D: RESOLVED INCIDENT MARKER (South Sector) */}
        {filteredIncidents.some(i => i.id === 'rep-resolved-south') && (
          <div 
            id="marker-rep-resolved-south"
            style={{ left: '34%', top: '78%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
            onClick={() => onSelectIncident('rep-resolved-south')}
            onMouseEnter={() => setHoveredIncidentId('rep-resolved-south')}
            onMouseLeave={() => setHoveredIncidentId(null)}
          >
            <div className="relative flex flex-col items-center">
              <div className={`relative flex items-center justify-center w-9 h-9 rounded-full border shadow-xl transition-transform duration-200 ${
                selectedIncidentId === 'rep-resolved-south'
                  ? 'scale-110 border-white bg-emerald-700 ring-2 ring-emerald-400/50'
                  : 'border-emerald-500/50 bg-emerald-900/80 hover:scale-105'
              }`}>
                <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
              </div>

              {/* Badge: ✅ Resolved */}
              <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/95 border border-emerald-500/60 text-emerald-300 text-[10px] font-mono font-medium whitespace-nowrap shadow-lg">
                <span>✅ Resolved</span>
              </div>

              {/* Tooltip Hover */}
              <AnimatePresence>
                {hoveredIncidentId === 'rep-resolved-south' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-3 w-60 p-2.5 rounded-xl bg-slate-950/95 border border-emerald-500/80 shadow-2xl z-40 text-left pointer-events-none"
                  >
                    <div className="text-emerald-400 font-mono font-bold text-xs">Minor Road Debris</div>
                    <p className="text-[11px] font-sans text-slate-300 mt-0.5">
                      SLA Met: <strong className="text-white">12 mins</strong>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* MARKER E: CROSS-MODAL CONTRADICTION (West Sector) */}
        {filteredIncidents.some(i => i.id === 'rep-contradiction-west') && (
          <div 
            id="marker-rep-contradiction-west"
            style={{ left: '26%', top: '38%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
            onClick={() => onSelectIncident('rep-contradiction-west')}
            onMouseEnter={() => setHoveredIncidentId('rep-contradiction-west')}
            onMouseLeave={() => setHoveredIncidentId(null)}
          >
            <div className="relative flex flex-col items-center">
              <div className="absolute -inset-3 rounded-full bg-purple-600/30 animate-pulse pointer-events-none" />

              <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-2xl transition-transform duration-200 ${
                selectedIncidentId === 'rep-contradiction-west'
                  ? 'scale-115 border-white bg-purple-700 ring-4 ring-purple-400/50'
                  : 'border-purple-400 bg-purple-800 hover:scale-105'
              }`}>
                <AlertTriangle className="w-5 h-5 text-amber-300" />
              </div>

              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/95 border border-purple-400 text-purple-300 text-[10px] font-mono font-bold whitespace-nowrap shadow-xl">
                <span>⚡ Contradiction</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* GOOGLE MAPS ATTRIBUTION BAR (Bottom Right)                     */}
      {/* ------------------------------------------------------------- */}
      <div className={`px-3 py-1 border-t text-[10px] font-mono flex items-center justify-between ${
        isDark ? 'bg-[#0f172a] border-slate-800/90 text-slate-500' : 'bg-slate-100 border-slate-300 text-slate-600'
      }`}>
        <div className="flex items-center gap-2">
          <span>Map data ©2026 Google / Spatial Mesh</span>
          <span className="opacity-40">|</span>
          <span>Zoom: {zoomLevel}x</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Vector Tile Engine: Hardware Accelerated (WebGL)</span>
        </div>
      </div>
    </div>
  );
};
export default GoogleDarkMapCanvas;
