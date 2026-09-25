import { Router, Request, Response } from "express";
import multer from "multer";
import crypto from "crypto";
import { Server as SocketIOServer } from "socket.io";
import { Type } from "@google/genai";
import { CivicReport } from "../types.ts";
import { redisCache } from "../cache.ts";
import {
  resolveCoordinates,
  getDistanceFromLatLonInMeters,
  generateDeterministicSemanticVector,
  cosineSimilarity,
} from "../geo.ts";
import {
  computeComplaintEmbedding,
  findDuplicateReport,
} from "../services/dedupService.ts";
import {
  getAI,
  isGeminiAvailable,
  translateAndTriageCivicComplaint,
  generateReferenceId,
  verifyRepair,
} from "../services/geminiService.ts";
import {
  GEMINI_PRIMARY_MODEL,
  GEMINI_TRIAGE_MODEL,
  MODEL_DISPLAY_NAMES,
  AI_OFFICER_NAME,
  AI_INSPECTOR_NAME,
  CIVIC_DEDUP_OFFICER,
} from "../config/models.ts";
import { persistReports } from "../config/persistence.ts";

export function createReportRouter(reportsStore: CivicReport[], io: SocketIOServer): Router {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
  });

  // 1. Deduplication Check
  router.post("/check-duplicate", async (req: Request, res: Response) => {
    try {
      const result = await findDuplicateReport(req.body, reportsStore);
      return res.json(result);
    } catch (error: any) {
      console.error("Error in /api/reports/check-duplicate:", error);
      return res.json({ duplicateDetected: false });
    }
  });

  // 2. Submit Multimodal Report
  router.post(
    "/submit",
    upload.fields([
      { name: "audio", maxCount: 1 },
      { name: "photo", maxCount: 1 },
    ]),
    async (req: Request, res: Response) => {
      try {
        const clientIp = req.ip || req.socket.remoteAddress || "global";
        const rateCheck = redisCache.checkRateLimit(clientIp, 30);
        res.setHeader("X-RateLimit-Limit", "30");
        res.setHeader("X-RateLimit-Remaining", String(rateCheck.remaining));
        if (!rateCheck.allowed) {
          return res.status(429).json({
            success: false,
            error: "Rate limit exceeded (Upstash Redis Guard). Maximum 30 complaints per minute allowed to protect Gemini quotas from spam.",
          });
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const audioFile = files?.["audio"]?.[0];
        const photoFile = files?.["photo"]?.[0];

        const {
          citizenName = "Verified Citizen",
          verifiedPhone = "+91 98765 43210",
          country = "India",
          language = "English",
          documentType = "Government ID",
          problemDomain = "Roads",
          location = "Unspecified Civic Location",
          typedComplaint = "",
          forceSubmit = "false",
          lat,
          lng,
          livenessVerified = "true",
          piiRedacted = "true",
        } = req.body;

        const coords = resolveCoordinates(location, country, Number(lat), Number(lng));
        const shouldForce = forceSubmit === "true" || forceSubmit === true;

        let embeddingVector: number[] = [];
        try {
          embeddingVector = await computeComplaintEmbedding(typedComplaint || location);
        } catch {
          embeddingVector = generateDeterministicSemanticVector(typedComplaint || location);
        }

        // Deduplication & Corroboration
        if (!shouldForce) {
          for (const existing of reportsStore) {
            if (existing.status === "Resolved" || existing.status === "RESOLVED") continue;
            const dist = getDistanceFromLatLonInMeters(coords.lat, coords.lng, existing.lat, existing.lng);
            const sameLandmark =
              existing.location.toLowerCase().includes(location.toLowerCase()) ||
              location.toLowerCase().includes(existing.location.toLowerCase());

            if (dist <= 120 || (dist <= 500 && sameLandmark)) {
              let sim = 0;
              if (existing.embedding && existing.embedding.length > 0) {
                sim = cosineSimilarity(embeddingVector, existing.embedding);
              } else {
                const repVec = generateDeterministicSemanticVector(
                  existing.typedComplaint || existing.englishTranslation || existing.summary
                );
                sim = cosineSimilarity(embeddingVector, repVec);
              }

              const cleanInput = (typedComplaint || "").toLowerCase();
              const cleanExisting = (existing.typedComplaint || existing.englishTranslation || "").toLowerCase();
              if (cleanInput.length > 5 && cleanExisting.includes(cleanInput.slice(0, 15))) {
                sim = Math.max(sim, 0.88);
              }

              if (sim >= 0.72) {
                existing.duplicateCount = (existing.duplicateCount || 1) + 1;
                existing.corroboratedReports = (existing.corroboratedReports || 1) + 1;
                existing.dispatchLogs.push({
                  timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
                  note: `Corroborating report received within ${Math.round(dist)}m (${Math.round(sim * 100)}% semantic match). Upvoted municipal priority. Citizen: ${citizenName}.`,
                  officer: CIVIC_DEDUP_OFFICER,
                });

                persistReports(reportsStore).catch(err => console.warn('[Persistence] write err:', err));
                io.emit("statusUpdated", existing);

                return res.json({
                  success: true,
                  duplicateMerged: true,
                  existingTicket: existing,
                  report: existing,
                  message: `Similar incident detected within ${Math.round(dist)}m. Your report has been merged with ticket ${existing.referenceId} to prevent municipal duplication.`,
                });
              }
            }
          }
        }

        // Redis Caching
        const cacheHash = crypto
          .createHash("sha256")
          .update(`${country}:${language}:${problemDomain}:${typedComplaint}`)
          .digest("hex");
        const cacheKey = `cypher:cache:triage:${cacheHash}`;

        let photoBase64 = "";
        if (photoFile) {
          photoBase64 = `data:${photoFile.mimetype || "image/jpeg"};base64,${photoFile.buffer.toString("base64")}`;
        }

        let triageResult = translateAndTriageCivicComplaint(
          typedComplaint,
          country,
          language,
          problemDomain,
          location
        );

        const cachedPayload = !audioFile && !photoFile ? await redisCache.get(cacheKey) : null;
        if (cachedPayload) {
          try {
            triageResult = JSON.parse(cachedPayload);
            res.setHeader("X-CYPHER-Cache", "HIT");
          } catch {
            // continue
          }
        }

        if (!cachedPayload && isGeminiAvailable()) {
          try {
            const ai = getAI();
            const promptParts: any[] = [
              {
                text: `You are the CYPHER Sovereign Civic Emergency AI Engine (serving BRICS+ nations: India, Brazil, South Africa, Russia, China).
A citizen from ${country} speaking/writing in ${language} has submitted a civic hazard report.
Context:
- Citizen Name: ${citizenName}
- Problem Domain: ${problemDomain}
- Location: ${location}
- Typed Text: "${typedComplaint}"
- Has Audio: ${Boolean(audioFile)}
- Has Photo: ${Boolean(photoFile)}
Transcribe verbatim in regional script, translate to English, categorize, assign hazardPriorityScore (1-5), and specify actionable dispatch unit.`,
              },
            ];

            if (audioFile) {
              promptParts.push({
                inlineData: {
                  data: audioFile.buffer.toString("base64"),
                  mimeType: audioFile.mimetype || "audio/webm",
                },
              });
            }
            if (photoFile) {
              promptParts.push({
                inlineData: {
                  data: photoFile.buffer.toString("base64"),
                  mimeType: photoFile.mimetype || "image/jpeg",
                },
              });
            }

            const response = await ai.models.generateContent({
              model: GEMINI_TRIAGE_MODEL,
              contents: [{ role: "user", parts: promptParts }],
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    transcription: { type: Type.STRING },
                    englishTranslation: { type: Type.STRING },
                    finalCategory: { type: Type.STRING },
                    hazardPriorityScore: { type: Type.INTEGER },
                    summary: { type: Type.STRING },
                    recommendedDispatchUnit: { type: Type.STRING },
                  },
                  required: [
                    "transcription",
                    "englishTranslation",
                    "finalCategory",
                    "hazardPriorityScore",
                    "summary",
                    "recommendedDispatchUnit",
                  ],
                },
              },
            });

            if (response.text) {
              const parsed = JSON.parse(response.text.trim());
              triageResult = {
                transcription: parsed.transcription || triageResult.transcription,
                englishTranslation: parsed.englishTranslation || triageResult.englishTranslation,
                finalCategory: parsed.finalCategory || triageResult.finalCategory,
                hazardPriorityScore: Number(parsed.hazardPriorityScore) || triageResult.hazardPriorityScore,
                summary: parsed.summary || triageResult.summary,
                recommendedDispatchUnit: parsed.recommendedDispatchUnit || triageResult.recommendedDispatchUnit,
              };

              if (!audioFile && !photoFile) {
                redisCache.set(cacheKey, JSON.stringify(triageResult), 86400).catch(() => {});
              }
            }
          } catch (err: any) {
            console.warn("[Triage] Falling back to sovereign engine:", err?.message);
          }
        }

        // Section 2 & 11: HITL Safety Gate Mechanics
        const critScore = Number(triageResult.hazardPriorityScore) || 3;
        const contradictionFlag = false;
        const hitlMandatory = critScore >= 4;
        const initialStatus = hitlMandatory ? "AWAITING_VALIDATION" : "OPEN";
        const hitlReasonText = hitlMandatory
          ? `Level ${critScore} High-Criticality Incident: Automated dispatch locked. Operator verification required.`
          : undefined;

        const reportId = `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const refId = generateReferenceId(country);
        const ticketCode = `CYP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newReport: CivicReport = {
          id: reportId,
          referenceId: refId,
          ticketId: ticketCode,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
          createdAt: Date.now(),
          citizenName,
          verifiedPhone,
          country,
          language,
          documentType,
          problemDomain,
          location,
          lat: coords.lat,
          lng: coords.lng,
          coordinates: coords,
          typedComplaint,
          hasAudio: Boolean(audioFile),
          hasPhoto: Boolean(photoFile),
          photoBase64,
          preRepairPhotoUrl: photoBase64,
          transcription: triageResult.transcription,
          originalTranscript: triageResult.transcription,
          englishTranslation: triageResult.englishTranslation,
          finalCategory: triageResult.finalCategory,
          issueCategory: triageResult.finalCategory,
          hazardPriorityScore: critScore,
          priorityScore: critScore,
          criticality_level: critScore,
          distress_score: critScore >= 4 ? 0.92 : 0.65,
          summary: triageResult.summary,
          actionableSummary: triageResult.summary,
          recommendedDispatchUnit: triageResult.recommendedDispatchUnit,
          recommended_crew: triageResult.recommendedDispatchUnit,
          required_equipment: ["Emergency Field Kit"],
          status: initialStatus,
          hitl_required: hitlMandatory,
          hitl_reason: hitlReasonText,
          hitl_authorized: !hitlMandatory,
          contradiction_detected: contradictionFlag,
          dispatchLogs: [
            {
              timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
              note: `AI Triage completed with Priority Score ${critScore}/5. Status: ${initialStatus}.`,
              officer: AI_OFFICER_NAME,
            },
          ],
          embedding: embeddingVector,
          duplicateCount: 1,
          corroboratedReports: 1,
          livenessVerified: livenessVerified === "true" || livenessVerified === true,
          piiRedacted: piiRedacted === "true" || piiRedacted === true,
        };

        reportsStore.unshift(newReport);
        persistReports(reportsStore).catch(err => console.warn('[Persistence] write err:', err));

        io.emit("newReport", newReport);

        return res.json({
          success: true,
          report: newReport,
        });
      } catch (error: any) {
        console.error("Error in /api/reports/submit:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to submit civic hazard report. Please try again.",
        });
      }
    }
  );

  // 3. Get All Reports
  router.get("/", (req: Request, res: Response) => {
    const sortedReports = [...reportsStore].sort((a, b) => {
      if (b.hazardPriorityScore !== a.hazardPriorityScore) {
        return b.hazardPriorityScore - a.hazardPriorityScore;
      }
      return b.createdAt - a.createdAt;
    });

    return res.json({
      success: true,
      total: sortedReports.length,
      reports: sortedReports,
    });
  });

  // 4. Update Report Status
  router.patch("/:id/status", (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, note, officer = "Senior Dispatch Officer" } = req.body;

    const report = reportsStore.find((r) => r.id === id || r.referenceId === id || r.ticketId === id);
    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found." });
    }

    if (status) report.status = status;
    if (note) {
      report.dispatchLogs.push({
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
        note,
        officer,
      });
    }

    persistReports(reportsStore).catch(err => console.warn('[Persistence] write err:', err));
    io.emit("statusUpdated", report);

    return res.json({
      success: true,
      report,
    });
  });

  // 5. Track Complaint
  router.get("/track", (req: Request, res: Response) => {
    const query = ((req.query.q as string) || (req.query.ref as string) || (req.query.phone as string) || "").trim().toLowerCase();
    if (!query) {
      return res.json({ success: true, total: reportsStore.length, reports: reportsStore });
    }

    const rawDigits = query.replace(/\D/g, "");
    const matches = reportsStore.filter((r) => {
      const rRef = (r.referenceId || "").toLowerCase();
      const rId = (r.id || "").toLowerCase();
      const rTicket = (r.ticketId || "").toLowerCase();
      const rPhone = (r.verifiedPhone || "").replace(/\D/g, "");
      const rName = (r.citizenName || "").toLowerCase();

      return (
        rRef === query ||
        rRef.includes(query) ||
        rTicket === query ||
        rTicket.includes(query) ||
        rId === query ||
        (rawDigits.length >= 4 && rPhone.includes(rawDigits)) ||
        (query.length >= 3 && rName.includes(query))
      );
    });

    return res.json({
      success: true,
      total: matches.length,
      reports: matches,
    });
  });

  router.get("/track/:query", (req: Request, res: Response) => {
    const query = (req.params.query || "").trim().toLowerCase();
    const rawDigits = query.replace(/\D/g, "");

    const matches = reportsStore.filter((r) => {
      const rRef = (r.referenceId || "").toLowerCase();
      const rId = (r.id || "").toLowerCase();
      const rTicket = (r.ticketId || "").toLowerCase();
      const rPhone = (r.verifiedPhone || "").replace(/\D/g, "");
      const rName = (r.citizenName || "").toLowerCase();

      return (
        rRef === query ||
        rRef.includes(query) ||
        rTicket === query ||
        rTicket.includes(query) ||
        rId === query ||
        (rawDigits.length >= 4 && rPhone.includes(rawDigits)) ||
        (query.length >= 3 && rName.includes(query))
      );
    });

    return res.json({
      success: true,
      total: matches.length,
      reports: matches,
    });
  });

  // 6. Authorize HITL Interlock / Operator Override (Section 2 & 11)
  router.post(["/:id/override", "/:id/authorize-hitl"], (req: Request, res: Response) => {
    const { id } = req.params;
    const report = reportsStore.find(r => r.id === id || r.ticketId === id || r.referenceId === id);

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const operatorId = req.body.operator_id || req.body.officer || (req as any).user?.operator_id || "OPERATOR-402";
    const overrideReason = req.body.override_reason || req.body.reason || "Manual triage verification and safety check passed.";
    const timestamp = req.body.timestamp || new Date().toISOString();

    report.hitl_authorized = true;
    report.hitl_authorized_by = operatorId;
    report.operator_id = operatorId;
    report.hitl_override_reason = overrideReason;
    report.hitl_authorized_at = timestamp;
    report.status = "OPEN";

    report.dispatchLogs.push({
      timestamp,
      note: `Human-in-the-Loop authorization override verified by ${operatorId}. Reason: "${overrideReason}". Automated dispatch unlocked.`,
      officer: operatorId,
    });

    persistReports(reportsStore).catch(err => console.warn('[Persistence] write err:', err));

    io.emit("incident:authorized", {
      id: report.id,
      ticketId: report.ticketId,
      authorizedBy: operatorId,
      authorizedAt: timestamp,
      overrideReason,
    });

    return res.json({
      success: true,
      report,
    });
  });

  // 7. Dispatch Crew (Dispatch Lock enforced until authorized)
  router.post("/:id/dispatch", (req: Request, res: Response) => {
    const { id } = req.params;
    const report = reportsStore.find(r => r.id === id || r.ticketId === id || r.referenceId === id);

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (report.hitl_required && !report.hitl_authorized) {
      return res.status(403).json({
        error: "Dispatch locked: Human-in-the-Loop authorization required before dispatch.",
        hitl_required: true,
        status: report.status || "AWAITING_VALIDATION",
      });
    }

    const assignedUnit = req.body.unit || report.recommended_crew || report.recommendedDispatchUnit || "Emergency Rapid Squad";
    const operator = req.body.operator || req.body.operator_id || (req as any).user?.operator_id || "Tactical Dispatcher #402";

    report.status = "DISPATCHED";
    report.assignedUnit = assignedUnit;
    report.dispatchLogs.push({
      timestamp: new Date().toISOString(),
      note: `Tactical crew dispatched: ${assignedUnit} authorized by ${operator}`,
      officer: operator,
    });

    persistReports(reportsStore).catch(err => console.warn('[Persistence] write err:', err));

    io.emit("incident:dispatched", {
      id: report.id,
      ticketId: report.ticketId,
      status: report.status,
      assignedUnit,
    });

    return res.json({
      success: true,
      report,
    });
  });

  return router;
}
