export interface OTPRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}

export interface CivicReport {
  id: string;
  referenceId: string;
  ticketId: string;
  timestamp: string;
  createdAt: number;
  citizenName: string;
  verifiedPhone?: string;
  country: "India" | "Brazil" | "South Africa" | "Russia" | "China" | string;
  language: string;
  documentType: string;
  problemDomain?: string;
  location: string;
  lat: number;
  lng: number;
  coordinates: { lat: number; lng: number };
  typedComplaint?: string;
  hasAudio: boolean;
  hasPhoto: boolean;
  photoBase64?: string;
  preRepairPhotoUrl?: string;
  postRepairPhotoUrl?: string;
  transcription: string;
  originalTranscript: string;
  englishTranslation: string;
  finalCategory: "Roads" | "Water" | "Power" | "Infrastructure" | "Other" | string;
  issueCategory: "Roads" | "Water" | "Power" | "Infrastructure" | "Other" | string;
  hazardPriorityScore: number; // 1 to 5
  priorityScore: number; // 1 to 5
  summary: string;
  actionableSummary: string;
  recommendedDispatchUnit: string;
  estimatedRepairCostUSD?: number;
  recommendedCrewSize?: number;
  status: "Pending" | "Dispatched" | "In Progress" | "Resolved" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "DISPATCHED" | "AWAITING_VALIDATION";
  resolutionQualityScore?: number;
  verificationNotes?: string;
  dispatchLogs: { timestamp: string; note: string; officer?: string }[];
  embedding?: number[];
  duplicateCount?: number;
  corroboratedReports?: number;
  corroborationDetails?: { citizen: string; phone?: string; time: string; distanceM: number; medium: string; transcript: string }[];
  hazard_category?: string;
  normalized_summary?: string;
  distress_score?: number;
  criticality_level?: number;
  contradiction_detected?: boolean;
  contradiction_reason?: string;
  recommended_crew?: string;
  required_equipment?: string[];
  hitl_required?: boolean;
  hitl_reason?: string;
  hitl_authorized?: boolean;
  hitl_authorized_by?: string;
  hitl_authorized_at?: string;
  operator_id?: string;
  hitl_override_reason?: string;
  assignedUnit?: string;
  duplicateOf?: string;
  livenessVerified?: boolean;
  piiRedacted?: boolean;
}

export interface FieldConfidences {
  hazard_category: number;
  summary: number;
  criticality: number;
  location: number;
  crew_recommendation: number;
}

export interface TriageResult {
  ticketId: string;
  originalTranscript: string;
  englishTranslation: string;
  hazard_category: string;
  issueCategory?: string;
  criticality_level: number;
  priorityScore?: number;
  distress_score: number;
  actionableSummary: string;
  photoContradictsReport: boolean;
  contradictionExplanation: string;
  confidence_score: number;
  field_confidences: FieldConfidences;
  recommended_crew?: string;
  departmentRouted?: string;
  required_equipment?: string[];
  recommendedCrewSize?: number;
  estimatedRepairCostUSD?: number;
  hitl_required?: boolean;
  hitl_reason?: string;
  isDegraded?: boolean;
}
