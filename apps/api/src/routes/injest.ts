import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getJobState, setJobState } from "../lib/injest-tracker";
import { IngestOptions } from "../types/nba.types";
import { runPlayerIngestion } from "../services/injest.service";

const router = Router();

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };

router.post(
  "/ingest/players",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const currentState = getJobState();

    if (currentState.status === "running") {
      res.status(409).json({
        data: null,
        error:
          "An ingestion job is already running" +
          "Poll GET /ingest/status for updates",
        status: 409,
      });
      return;
    }

    const options: IngestOptions = {
      season: (req.body.season as string | undefined) ?? "2024-25",
      delayMs: Number(req.body.delayMs ?? 600),
    };

    setJobState({
      status: "running",
      startedAt: Date.now(),
      result: null,
      error: null,
    });

    runPlayerIngestion(options)
      .then((result) => {
        setJobState({ status: "done", result });
        console.log("[ingest] Job completed successfully");
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setJobState({ status: "failed", error: message });
        console.error("[ingest] Job failed:", message);
      });

    res.status(202).json({
      data: {
        message:
          "Ingestion started. Poll GET /ingest/status every few seconds to track progress.",
        status: "running",
        startedAt: Date.now(),
      },
      error: null,
      status: 202,
    });
  }),
);

router.get("/ingest/status", authMiddleware, (req: Request, res: Response) => {
  const state = getJobState();

  res.status(200).json({
    data: {
      status: state.status,
      startedAt: state.startedAt,
      elapsedMs: state.startedAt ? Date.now() - state.startedAt : null,
      result: state.result,
      error: state.error,
    },
    error: null,
    status: 200,
  });
});

export default router;

