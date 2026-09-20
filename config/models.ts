/**
 * CYPHER Sovereign Civic AI Platform
 * Single Source of Truth for Model Identifiers & AI Officers
 */

export const GEMINI_PRIMARY_MODEL = "gemini-2.0-flash";
export const GEMINI_MULTIMODAL_MODEL = "gemini-2.0-flash";
export const GEMINI_TRIAGE_MODEL = "gemini-2.0-flash";
export const GEMINI_INSPECTION_MODEL = "gemini-2.0-flash";
export const GEMINI_EMBEDDING_MODEL = "text-embedding-004";

export const MODEL_DISPLAY_NAMES = {
  PRIMARY: "Gemini 2.0 Flash",
  TRIAGE: "Gemini 2.0 Flash",
  VERIFICATION: "Gemini 2.0 Flash",
  STATUS: "Gemini-2.0-Flash Online",
} as const;

export const AI_OFFICER_NAME = "Civic AI Core (Gemini 2.0 Flash / Sovereign AI)";
export const AI_INSPECTOR_NAME = "Gemini 2.0 Flash Autonomous Inspector";
export const CIVIC_DEDUP_OFFICER = "Civic Deduplication Engine (Gemini 2.0 Flash / Sovereign AI)";

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
