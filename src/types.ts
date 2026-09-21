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

export interface IncidentDossier {
  hazard_category: HazardCategory;
  normalized_summary: string;
  distress_score: number;
  criticality_level: 1 | 2 | 3 | 4 | 5;
  contradiction_detected: boolean;
  contradiction_reason: string;
  recommended_crew: string;
  required_equipment: string[];
  hitl_required: boolean;
  hitl_reason: string;
  hitl_authorized?: boolean;
  hitl_authorized_by?: string;
  hitl_authorized_at?: string;
}

export interface CivicIncident extends IncidentDossier {
  id: string;
  ticketId: string;
  referenceId: string;
  timestamp: string;
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
  status: "OPEN" | "DISPATCHED" | "IN_PROGRESS" | "RESOLVED";
  duplicateCount: number;
  corroboratedReports: number;
  corroborationDetails?: CorroboratedSignal[];
  preRepairPhotoUrl?: string;
  postRepairPhotoUrl?: string;
  estimatedRepairCostUSD?: number;
  recommendedCrewSize?: number;
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
