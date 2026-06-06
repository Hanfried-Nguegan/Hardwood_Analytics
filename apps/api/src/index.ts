import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth"

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

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🏀 HARDWOOD API running on http://localhost:${PORT}`);
});
