/**
 * CYPHER-3.0 Sovereign Civic AI Platform
 * Standardized Model Identifiers & AI Officers
 * Enforces gemini-2.5-flash across all municipal triage & multimodal pipelines
 */

export const GEMINI_PRIMARY_MODEL = "gemini-2.5-flash";
export const GEMINI_MULTIMODAL_MODEL = "gemini-2.5-flash";
export const GEMINI_TRIAGE_MODEL = "gemini-2.5-flash";
export const GEMINI_INSPECTION_MODEL = "gemini-2.5-flash";
export const GEMINI_EMBEDDING_MODEL = "text-embedding-004";

export const MODEL_DISPLAY_NAMES = {
  PRIMARY: "Gemini 2.5 Flash",
  TRIAGE: "Gemini 2.5 Flash",
  VERIFICATION: "Gemini 2.5 Flash",
  STATUS: "Gemini-2.5-Flash Active",
} as const;

export const AI_OFFICER_NAME = "Civic AI Core (Gemini 2.5 Flash / Sovereign AI)";
export const AI_INSPECTOR_NAME = "Gemini 2.5 Flash Autonomous Inspector";
export const CIVIC_DEDUP_OFFICER = "Civic Deduplication Engine (Gemini 2.5 Flash / Sovereign AI)";

export default {
  GEMINI_PRIMARY_MODEL,
  GEMINI_MULTIMODAL_MODEL,
  GEMINI_TRIAGE_MODEL,
  GEMINI_INSPECTION_MODEL,
  GEMINI_EMBEDDING_MODEL,
  MODEL_DISPLAY_NAMES,
  AI_OFFICER_NAME,
  AI_INSPECTOR_NAME,
  CIVIC_DEDUP_OFFICER,
};
