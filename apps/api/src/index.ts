import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth";
import ingestRoutes from "./routes/injest";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

// routes

app.use(healthRoutes);
app.use(authRoutes);
app.use(ingestRoutes);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("[server] Unhandled error:", err.message);
    res.status(500).json({
      data: null,
      error: err.message || "Internal server error",
      status: 500,
    });
  },
);

app.listen(PORT, () => {
  console.log(`🏀 HARDWOOD API running on http://localhost:${PORT}`);
});
