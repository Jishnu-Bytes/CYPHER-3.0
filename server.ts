import express, { Request, Response, NextFunction } from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import { CivicReport } from "./src/server/types.ts";
import { INITIAL_SEED_REPORTS } from "./src/server/seedData.ts";
import { authRouter } from "./src/server/routes/authRoutes.ts";
import { createReportRouter } from "./src/server/routes/reportRoutes.ts";
import { createSystemRouter } from "./src/server/routes/systemRoutes.ts";
import { loadPersistedReports } from "./config/persistence.ts";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
  },
});

const PORT = 3000;

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
const reportsStore: CivicReport[] = persisted && persisted.length > 0 ? persisted : [...INITIAL_SEED_REPORTS];


// Mount Modular API Routers
app.use("/api/auth", authRouter);
app.use("/api/reports", createReportRouter(reportsStore, io));
app.use("/api", createSystemRouter(reportsStore, io));

// Backward compatibility aliases
app.use("/api/verify-id", authRouter);
app.use("/api/admin", authRouter);

// Static Asset Resolution
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

const publicPath = getPublicPath();
app.use(express.static(publicPath));

// Attach Vite Development Middleware
let viteDevServer: any = null;
async function initViteMiddleware() {
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      viteDevServer = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(viteDevServer.middlewares);
      console.log("[Vite] Vite development middleware attached.");
    } catch (e: any) {
      console.warn("[Vite] Dev middleware notice:", e?.message);
    }
  }
}
initViteMiddleware();

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
    console.error("[SPA] Error serving React console:", err);
  }
  return res.sendFile(path.join(publicPath, "index.html"));
}

// Routes serving the unified React application
app.get([
  "/console",
  "/command-center",
  "/dispatch",
  "/react-admin",
  "/portal",
  "/app",
], serveReactSPA);

// Public entry points (can serve React SPA or legacy public HTML)
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.get("/verify-phone", (req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, "verify-phone.html"));
});

app.get("/verify-id", (req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, "verify-id.html"));
});

app.get("/report", (req: Request, res: Response) => {
  // If query parameter ?spa=true or if requested as React route, serve React SPA
  if (req.query.view === "spa" || req.headers["x-requested-with"] === "react") {
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

app.get("/docs", (req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, "docs.html"));
});

app.get("/CYPHER_ARCHITECTURE_SPECIFICATION.md", (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "CYPHER_ARCHITECTURE_SPECIFICATION.md"));
});

// Fallback for SPA routing
app.get("*", async (req: Request, res: Response) => {
  if (
    req.path.startsWith("/console") ||
    req.path.startsWith("/command-center") ||
    req.path.startsWith("/dispatch")
  ) {
    return serveReactSPA(req, res);
  }
  res.sendFile(path.join(publicPath, "index.html"));
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
  console.log(`  CYPHER - Modular Sovereign Civic AI Engine Active`);
  console.log(`  Port: ${PORT} | Bound: 0.0.0.0`);
  console.log(`  Console: http://localhost:${PORT}/console`);
  console.log(`  Admin:   http://localhost:${PORT}/admin`);
  console.log(`========================================================`);
});

export default app;
