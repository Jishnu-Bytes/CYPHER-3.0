import express, { Request, Response, NextFunction } from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import { CivicReport } from "./types.ts";
import { INITIAL_SEED_REPORTS } from "./seedData.ts";
import { authRouter } from "./routes/authRoutes.ts";
import { createReportRouter } from "./routes/reportRoutes.ts";
import { createSystemRouter } from "./routes/systemRoutes.ts";
import { loadPersistedReports } from "./config/persistence.ts";

dotenv.config();

function getPublicPath(): string {
  const candidates = [
    path.resolve(process.cwd(), "public"),
    path.resolve(process.cwd(), "dist"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.resolve(process.cwd(), "public");
}

let globalApp: express.Application | null = null;
let globalServer: http.Server | null = null;
let globalIo: SocketIOServer | null = null;

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH"],
    },
  });

  globalApp = app;
  globalServer = server;
  globalIo = io;

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(cors());

  // Security Guard: Protect Sensitive Files
  app.use((req: Request, res: Response, next: NextFunction) => {
    const normalizedPath = decodeURIComponent(req.path).toLowerCase();
    if (
      normalizedPath.includes(".env") ||
      normalizedPath.includes("/.git") ||
      normalizedPath.includes("..") ||
      normalizedPath.endsWith(".key") ||
      normalizedPath.endsWith(".pem") ||
      normalizedPath.includes("package-lock.json")
    ) {
      return res.status(403).json({
        error: "Access Denied: Protected security resource.",
        status: 403,
        timestamp: new Date().toISOString(),
      });
    }
    next();
  });

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Initialize in-memory reports store with seed and persisted data
  const persisted = loadPersistedReports<CivicReport>();
  const reportsStore: CivicReport[] =
    persisted && persisted.length > 0 ? persisted : [...INITIAL_SEED_REPORTS];

  // Mount Modular API Routers
  app.use("/api/auth", authRouter);
  app.use("/api/reports", createReportRouter(reportsStore, io));
  app.use("/api", createSystemRouter(reportsStore, io));

  // Auth, Admin, and ID Verification routes & aliases
  app.use("/api/admin", authRouter);
  app.use("/api/verify-id", authRouter);
  app.use("/api", authRouter);

  // Attach Vite Development Middleware BEFORE any static or wildcard routes
  let viteDevServer: any = null;
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      viteDevServer = await createViteServer({
        server: { middlewareMode: true },
        appType: "custom",
      });
      app.use(viteDevServer.middlewares);
      console.log("[Vite] Vite development middleware attached.");
    } catch (e: any) {
      console.warn("[Vite] Dev middleware notice:", e?.message);
    }
  }

  // Static Asset Resolution
  const publicPath = getPublicPath();
  app.use(express.static(publicPath));

  // Primary Web Pages (Original Sovereign Civic AI Platform)
  app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });

  app.get("/report", (req: Request, res: Response) => {
    if (req.query.view === "spa") {
      return serveReactSPA(req, res);
    }
    res.sendFile(path.join(publicPath, "report.html"));
  });

  app.get("/admin", (req: Request, res: Response) => {
    if (req.query.view === "spa") {
      return serveReactSPA(req, res);
    }
    res.sendFile(path.join(publicPath, "admin.html"));
  });

  app.get("/track", (req: Request, res: Response) => {
    if (req.query.view === "spa") {
      return serveReactSPA(req, res);
    }
    res.sendFile(path.join(publicPath, "track.html"));
  });

  app.get("/verify-phone", (req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, "verify-phone.html"));
  });

  app.get("/verify-id", (req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, "verify-id.html"));
  });

  app.get("/select-locale", (req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, "select-locale.html"));
  });

  app.get("/docs", (req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, "docs.html"));
  });

  app.get("/planet", (req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });

  app.get("/globe", (req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });

  app.get(["/console", "/command-center", "/dispatch"], serveReactSPA);

  app.get("/CYPHER_ARCHITECTURE_SPECIFICATION.md", (req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), "CYPHER_ARCHITECTURE_SPECIFICATION.md"));
  });

  // Unified React SPA HTML Server
  async function serveReactSPA(req: Request, res: Response) {
    try {
      const consoleRoot = path.join(process.cwd(), "console.html");
      if (fs.existsSync(consoleRoot)) {
        let html = fs.readFileSync(consoleRoot, "utf-8");
        if (viteDevServer) {
          html = await viteDevServer.transformIndexHtml(req.originalUrl, html);
        }
        return res.status(200).set({ "Content-Type": "text/html" }).send(html);
      }
      const consoleDist = path.join(process.cwd(), "dist/console.html");
      if (fs.existsSync(consoleDist)) {
        return res.sendFile(consoleDist);
      }
    } catch (err) {
      console.error("[SPA] Error serving React SPA:", err);
    }
    return res.sendFile(path.join(publicPath, "index.html"));
  }

  // Fallback for SPA routing or deep links
  app.get("*", async (req: Request, res: Response) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found", path: req.path });
    }
    return res.sendFile(path.join(publicPath, "index.html"));
  });

  // Socket.io Real-Time Dispatch Engine
  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`========================================================`);
    console.log(`  CYPHER-3.0 - Sovereign Civic AI Engine Active`);
    console.log(`  Port: ${PORT} | Bound: 0.0.0.0`);
    console.log(`  Console: http://localhost:${PORT}/console`);
    console.log(`  Admin:   http://localhost:${PORT}/admin`);
    console.log(`========================================================`);
  });

  return { app, server, io };
}

// Start server
startServer().catch((err) => {
  console.error("[Server] Fatal startup error:", err);
});

export { globalApp as app, globalServer as server, globalIo as io };
export default globalApp;
