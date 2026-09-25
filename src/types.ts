export type HazardCategory = 
  | "Electrical"
  | "Structural"
  | "Water_Sewer"
  | "Fire"
  | "Road Hazard"
  | "Other";

export interface CorroboratedSignal {
  citizen: string;
  phone: string;
  time: string;
  distanceM: number;
  medium: string;
  transcript: string;
}

export interface FieldConfidences {
  hazard_category: number;
  summary: number;
  criticality: number;
  location: number;
  crew_recommendation: number;
}

export interface IncidentDossier {
  hazard_category: HazardCategory;
  normalized_summary: string;
  distress_score: number;
  criticality_level: 1 | 2 | 3 | 4 | 5;
  contradiction_detected: boolean;
  contradiction_reason: string;
  photoContradictsReport?: boolean;
  contradictionExplanation?: string;
  recommended_crew: string;
  required_equipment: string[];
  hitl_required: boolean;
  hitl_reason: string;
  hitl_authorized?: boolean;
  hitl_authorized_by?: string;
  hitl_authorized_at?: string;
  hitl_override_reason?: string;
  operator_id?: string;
  confidence_score?: number;
  field_confidences?: FieldConfidences;
  departmentRouted?: string;
  isDegraded?: boolean;
}

export interface CivicIncident extends IncidentDossier {
  id: string;
  ticketId: string;
  referenceId: string;
  timestamp: string;
  createdAt: number;
  citizenName: string;
  verifiedPhone: string;
  country: string;
  language: string;
  location: string;
  lat: number;
  lng: number;
  typedComplaint: string;
  transcription: string;
  englishTranslation: string;
  status: "AWAITING_VALIDATION" | "OPEN" | "DISPATCHED" | "IN_PROGRESS" | "RESOLVED";
  duplicateCount: number;
  corroboratedReports: number;
  corroborationDetails?: CorroboratedSignal[];
  preRepairPhotoUrl?: string;
  postRepairPhotoUrl?: string;
  estimatedRepairCostUSD?: number;
  recommendedCrewSize?: number;
  assignedUnit?: string;
  slaMet?: string;
  slaTargetMinutes?: number;
  corroborationSummary?: string;
  sector?: "Center" | "North" | "East" | "South" | "West";
  vectorSimilarity?: number;
  haversineDistanceM?: number;
}

export interface TelemetryState {
  model: string;
  latencyMs: number;
  tokens: number;
  schemaCheckPassed: boolean;
  activeEndpoint: string;
  lastEvaluatedAt: string;
}

export interface TestScenarioPreset {
  id: string;
  label: string;
  badge: string;
  description: string;
  incident: Partial<CivicIncident>;
}

export type ThemeMode = 'dark' | 'light';

export type AppView = 'console' | 'report' | 'track' | 'admin';
