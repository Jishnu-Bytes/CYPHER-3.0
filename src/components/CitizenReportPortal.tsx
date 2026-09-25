import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Camera, 
  MapPin, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Loader2,
  FileCheck,
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ThemeMode } from '../types';

interface CitizenReportPortalProps {
  themeMode: ThemeMode;
  onNavigateToTracker: (ticketId: string) => void;
}

export const CitizenReportPortal: React.FC<CitizenReportPortalProps> = ({
  themeMode,
  onNavigateToTracker,
}) => {
  const isDark = themeMode === 'dark';

  // Form states
  const [citizenName, setCitizenName] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [problemDomain, setProblemDomain] = useState('Roads');
  const [location, setLocation] = useState('');
  const [typedComplaint, setTypedComplaint] = useState('');
  const [lat, setLat] = useState<number | ''>('');
  const [lng, setLng] = useState<number | ''>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Submission & AI Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick preset triggers for citizen testing
  const presets = [
    {
      label: '⚡ 11kV Wire in Rainwater',
      domain: 'Power',
      location: 'Outer Ring Road, Gachibowli, Hyderabad',
      text: 'सड़क के बीचों-बीच 11kV की बिजली का तार टूट कर गिर गया है। बारिश में स्पार्किंग हो रही है और पानी भरा हुआ है।',
      lat: 17.4401,
      lng: 78.3489,
    },
    {
      label: '🕳️ Highway Crater Pothole',
      domain: 'Roads',
      location: 'Hitec City Flyover Ramp, Hyderabad',
      text: 'రోడ్డు మధ్యలో పెద్ద గుంత ఏర్పడింది, బైక్ నడిపే వాళ్ళు కింద పడిపోతున్నారు.',
      lat: 17.4474,
      lng: 78.3762,
    },
    {
      label: '🌊 Main Waterline Rupture',
      domain: 'Water',
      location: 'Avenida Presidente Vargas, Rio de Janeiro',
      text: 'Adutora principal rompeu e abriu uma cratera sob o asfalto. A água está inundando lojas.',
      lat: -22.9035,
      lng: -43.1824,
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setProblemDomain(p.domain);
    setLocation(p.location);
    setTypedComplaint(p.text);
    setLat(p.lat);
    setLng(p.lng);
  };

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(parseFloat(pos.coords.latitude.toFixed(4)));
          setLng(parseFloat(pos.coords.longitude.toFixed(4)));
          if (!location) {
            setLocation(`GPS Fixed: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          }
        },
        () => {
          // Fallback location for demo
          setLat(17.4474);
          setLng(78.3762);
          setLocation('Hitec City, Hyderabad (GPS Approximate)');
        }
      );
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!location.trim() || !typedComplaint.trim()) {
      setErrorMsg('Please specify the incident location and description.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('citizenName', citizenName || 'Verified Citizen');
      formData.append('verifiedPhone', verifiedPhone || '+91 98765 43210');
      formData.append('country', country);
      formData.append('problemDomain', problemDomain);
      formData.append('location', location);
      formData.append('typedComplaint', typedComplaint);
      formData.append('documentType', 'National Citizen ID');
      if (lat !== '') formData.append('lat', String(lat));
      if (lng !== '') formData.append('lng', String(lng));
      if (selectedFile) formData.append('photo', selectedFile);

      const res = await fetch('/api/reports/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.report) {
        setSubmittedTicket(data.report);
      } else if (data.duplicateMerged && data.existingTicket) {
        setSubmittedTicket({
          ...data.existingTicket,
          isDuplicateMerged: true,
          mergeMessage: data.message,
        });
      } else {
        setErrorMsg(data.error || 'Failed to submit report. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error submitting report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 py-8 font-sans ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold mb-3 border bg-cyan-950/80 border-cyan-500/40 text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>CYPHER CITIZEN INTAKE • ZERO-FRICTION REPORTING</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
          Report a Municipal Hazard or Emergency
        </h1>
        <p className={`text-sm mt-1 max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Voice notes in any BRICS+ language, photo evidence, and automatic Gemini 2.5 Flash severity assessment.
        </p>
      </div>

      {/* Preset Quick Fill Buttons */}
      <div className="mb-6 p-4 rounded-2xl border backdrop-blur-md bg-slate-900/40 border-slate-800">
        <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 mb-2.5 font-bold">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Test Presets (One-Click Scenario Population):</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition hover:scale-[1.02] bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submission Success Screen */}
      <AnimatePresence>
        {submittedTicket && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-8 p-6 rounded-2xl border shadow-2xl backdrop-blur-md ${
              isDark 
                ? 'bg-slate-900/95 border-emerald-500/60 shadow-emerald-950/50' 
                : 'bg-emerald-50 border-emerald-400 shadow-emerald-100'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-emerald-400">
                    {submittedTicket.isDuplicateMerged ? 'Incident Corroborated & Merged' : 'Incident Logged Successfully'}
                  </h3>
                  <p className="text-xs font-mono text-slate-300">
                    Ticket Reference: <span className="font-bold text-white font-mono">{submittedTicket.ticketId || submittedTicket.referenceId}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateToTracker(submittedTicket.ticketId || submittedTicket.referenceId)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <span>Track This Incident</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/30 border border-slate-800">
                <span className="text-slate-400 block mb-1">Priority Assessment:</span>
                <span className="font-bold text-amber-400 text-sm">
                  {submittedTicket.hazardPriorityScore || 4}/5 • {submittedTicket.finalCategory || problemDomain}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-slate-800">
                <span className="text-slate-400 block mb-1">Assigned Response:</span>
                <span className="font-bold text-cyan-300 text-sm truncate block">
                  {submittedTicket.recommendedDispatchUnit || 'Municipal Rapid Squad'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-slate-800">
                <span className="text-slate-400 block mb-1">Safety Gate Status:</span>
                <span className="font-bold text-indigo-300 text-sm">
                  {submittedTicket.hitl_required ? '⚠️ Awaiting Operator Verification' : '⚡ Auto-Dispatched'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSubmittedTicket(null)}
              className="mt-4 text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer"
            >
              ← Submit Another Incident
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Intake Form */}
      {!submittedTicket && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/80 text-red-200 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Citizen Profile */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>1. Citizen Identity &amp; Region</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono mb-1 font-semibold">Your Full Name</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-mono transition outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 focus:border-cyan-500' : 'bg-slate-50 border-slate-300 focus:border-cyan-600'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-mono mb-1 font-semibold">Mobile Phone (OTP Verified)</label>
                <input
                  type="tel"
                  value={verifiedPhone}
                  onChange={(e) => setVerifiedPhone(e.target.value)}
                  placeholder="+91 98490 12345"
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-mono transition outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 focus:border-cyan-500' : 'bg-slate-50 border-slate-300 focus:border-cyan-600'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-mono mb-1 font-semibold">Jurisdiction / Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-mono transition outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 focus:border-cyan-500' : 'bg-slate-50 border-slate-300 focus:border-cyan-600'
                  }`}
                >
                  <option value="India">🇮🇳 India (Aadhaar / PWD)</option>
                  <option value="Brazil">🇧🇷 Brazil (RG / Defesa Civil)</option>
                  <option value="South Africa">🇿🇦 South Africa (Smart ID / JRA)</option>
                  <option value="Russia">🇷🇺 Russia (Internal Passport / GBU)</option>
                  <option value="China">🇨🇳 China (Resident ID / Civil Defense)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Incident Details & Domain */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4" />
              <span>2. Incident Location &amp; Category</span>
            </h2>

            {/* Problem Domain Pills */}
            <div className="mb-4">
              <label className="block text-xs font-mono mb-2 font-semibold">Select Civic Problem Domain</label>
              <div className="flex flex-wrap gap-2">
                {['Roads', 'Water', 'Power', 'Infrastructure', 'Drainage', 'Sanitation', 'Disaster / Emergency'].map((dom) => (
                  <button
                    key={dom}
                    type="button"
                    onClick={() => setProblemDomain(dom)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition cursor-pointer ${
                      problemDomain === dom
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-900/30'
                        : isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {dom}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono mb-1 font-semibold">Location / Landmark Description</label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Cyber Towers Storm Culvert, Hitec City, Hyderabad"
                    required
                    className={`w-full px-3 py-2 pr-28 rounded-xl border text-sm font-mono transition outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 focus:border-cyan-500' : 'bg-slate-50 border-slate-300 focus:border-cyan-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    className="absolute right-1.5 top-1.5 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Auto GPS</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono mb-1 font-semibold">GPS Coordinates</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Latitude"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                    className={`w-full px-2.5 py-2 rounded-xl border text-xs font-mono transition outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Longitude"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value))}
                    className={`w-full px-2.5 py-2 rounded-xl border text-xs font-mono transition outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Multimodal Description & Photo Evidence */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 mb-4">
              <Camera className="w-4 h-4" />
              <span>3. Multimodal Voice Note &amp; Photo Evidence</span>
            </h2>

            <div>
              <label className="block text-xs font-mono mb-1 font-semibold">
                Complaint Details (Type or describe in any language)
              </label>
              <textarea
                rows={3}
                value={typedComplaint}
                onChange={(e) => setTypedComplaint(e.target.value)}
                placeholder="Describe the damage, hazard, or risk (e.g. exposed live wire in water, deep pothole, burst pipe)..."
                required
                className={`w-full p-3 rounded-xl border text-sm font-mono transition outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 focus:border-cyan-500' : 'bg-slate-50 border-slate-300 focus:border-cyan-600'
                }`}
              />
            </div>

            {/* Photo Evidence Uploader */}
            <div className="mt-4">
              <label className="block text-xs font-mono mb-2 font-semibold">
                Attach Physical Evidence Photo (Optional)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="w-full sm:w-auto px-4 py-3 rounded-xl border border-dashed border-cyan-500/50 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition">
                  <Camera className="w-4 h-4" />
                  <span>Choose Photo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {imagePreview && (
                  <div className="relative group w-20 h-20 rounded-xl overflow-hidden border border-cyan-500 shadow-md">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedFile(null);
                      }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-mono transition"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono font-bold text-sm tracking-wide shadow-xl shadow-cyan-950/50 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Triaging with Gemini 2.5 Flash...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Incident for AI Triage</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
