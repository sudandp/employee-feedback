import express from "express";
import { createServer as createViteServer } from "vite";
import { ReportService } from "./src/services/reportService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Example route to trigger precompute
  app.post("/api/reports/precompute", async (req, res) => {
    try {
      const { cycleId, responses, previousScore, invitedCount } = req.body;
      
      const report = await ReportService.generateCycleReport(
        cycleId,
        responses || [],
        previousScore || 0,
        invitedCount || 100
      );

      // In a real app, save to Supabase reports_cache here
      
      res.json({ success: true, report });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
