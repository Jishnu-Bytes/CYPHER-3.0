import { CivicReport } from "../types.ts";
import {
  getDistanceFromLatLonInMeters,
  resolveCoordinates,
  generateDeterministicSemanticVector,
  cosineSimilarity,
} from "../geo.ts";
import { getAI, isGeminiAvailable, handleGeminiError } from "./geminiService.ts";
import { GEMINI_EMBEDDING_MODEL } from "../../../config/models.ts";

export async function computeComplaintEmbedding(text: string): Promise<number[]> {
  if (isGeminiAvailable()) {
    try {
      const ai = getAI();
      const res = await (ai.models as any).embedContent({
        model: GEMINI_EMBEDDING_MODEL,
        contents: text,
      });
      if (res?.embedding?.values && Array.isArray(res.embedding.values)) {
        return res.embedding.values.slice(0, 64);
      }
    } catch (err: any) {
      handleGeminiError(err, "Embedding");
    }
  }
  return generateDeterministicSemanticVector(text);
}

export interface DuplicateCheckResult {
  duplicateDetected: boolean;
  distanceMeters?: number;
  similarityScore?: number;
  existingTicket?: Partial<CivicReport>;
  existingReport?: CivicReport;
  message?: string;
}

export async function findDuplicateReport(
  params: {
    location?: string;
    typedComplaint?: string;
    country?: string;
    lat?: number;
    lng?: number;
  },
  reports: CivicReport[]
): Promise<DuplicateCheckResult> {
  const { location = "", typedComplaint = "", country = "India", lat, lng } = params;
  const targetCoords = resolveCoordinates(location, country, Number(lat), Number(lng));

  if (!typedComplaint && !location) {
    return { duplicateDetected: false };
  }

  const queryEmbedding = await computeComplaintEmbedding(typedComplaint || location);

  for (const report of reports) {
    if (report.status === "Resolved" || report.status === "RESOLVED") continue;

    const reportCoords = { lat: report.lat, lng: report.lng };
    const distance = getDistanceFromLatLonInMeters(
      targetCoords.lat,
      targetCoords.lng,
      reportCoords.lat,
      reportCoords.lng
    );

    const sameLandmark =
      report.location.toLowerCase().includes(location.toLowerCase()) ||
      location.toLowerCase().includes(report.location.toLowerCase());

    // 100m geospatial candidate filter
    if (distance <= 120 || (distance <= 500 && sameLandmark)) {
      let similarity = 0;
      if (report.embedding && report.embedding.length > 0) {
        similarity = cosineSimilarity(queryEmbedding, report.embedding);
      } else {
        const repEmbedding = generateDeterministicSemanticVector(
          report.typedComplaint || report.englishTranslation || report.summary
        );
        similarity = cosineSimilarity(queryEmbedding, repEmbedding);
      }

      const complaintClean = (typedComplaint || "").toLowerCase();
      const repComplaintClean = (report.typedComplaint || report.englishTranslation || "").toLowerCase();
      if (complaintClean.length > 5 && repComplaintClean.includes(complaintClean.slice(0, 15))) {
        similarity = Math.max(similarity, 0.88);
      }

      // 64D Vector Cosine Similarity threshold >= 0.72
      if (similarity >= 0.72) {
        return {
          duplicateDetected: true,
          distanceMeters: Math.round(distance),
          similarityScore: Math.round(similarity * 100),
          existingTicket: {
            id: report.id,
            referenceId: report.referenceId,
            summary: report.summary,
            problemDomain: report.problemDomain,
            hazardPriorityScore: report.hazardPriorityScore,
            status: report.status,
            location: report.location,
            duplicateCount: report.duplicateCount || 1,
          },
          existingReport: report,
          message: `Found similar open municipal incident ${Math.round(distance)}m away with ${Math.round(similarity * 100)}% semantic similarity.`,
        };
      }
    }
  }

  return { duplicateDetected: false };
}
