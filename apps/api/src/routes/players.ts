import { Router, Request, Response, NextFunction } from "express";
import { getPlayerById, getPlayers } from "../db/queries/players.queries";

const router = Router();

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };

router.get(
  "/players",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      page,
      limit,
      search,
      team,
      position,
      conference,
      sortBy,
      order,
      season,
    } = req.query;

    const result = await getPlayers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 24,
      search: search as string | undefined,
      team: team as string | undefined,
      position: position as string | undefined,
      conference: conference as string | undefined,
      sortBy: (sortBy as "ppg" | "rpg" | "apg" | "name") ?? "ppg",
      order: (order as "asc" | "desc") ?? "desc",
      season: season ? Number(season) : 2024,
    });

    res.status(200).json({
      data: result.data,
      pagination: {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 24,
        total: result.total,
        pages: Math.ceil(result.total / (limit ? Number(limit) : 24)),
      },
      error: null,
      status: 200,
    });
  }),
);

router.get(
  "/player/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const player = await getPlayerById(req.params.id);

    if (!player) {
      res.status(404).json({
        data: null,
        error: "Player not found",
        status: 404,
      });
      return;
    }

    res.status(200).json({
      data: player,
      error: null,
      status: 200,
    });
  }),
);

export default router;
