import { Router } from "express";

import { readJson, writeJson, pushItem, generateId } from "../storage.js";
import { ProviderRating } from "../types.js";

const router = Router();

router.get("/providers/:providerId/ratings", (req, res) => {
  const ratings = readJson<ProviderRating[]>("provider_ratings", []).filter(
    (rating) => rating.providerId === req.params.providerId,
  );
  const average = ratings.length
    ? Number((ratings.reduce((acc, rating) => acc + rating.score, 0) / ratings.length).toFixed(2))
    : null;
  res.json({ ok: true, ratings, average, total: ratings.length });
});

router.post("/providers/:providerId/ratings", (req, res) => {
  const { providerId } = req.params;
  const { clientId, score, comment } = req.body || {};
  if (!clientId || !score) {
    return res.status(400).json({ ok: false, error: "clientId y score son obligatorios" });
  }

  const sanitizedScore = Math.min(Math.max(Number(score), 1), 5);
  const rating: ProviderRating = {
    id: generateId("rating_"),
    providerId,
    clientId,
    score: sanitizedScore,
    createdAt: new Date().toISOString(),
    ...(comment ? { comment: String(comment).slice(0, 500) } : {}),
  };

  pushItem("provider_ratings", rating);
  res.json({ ok: true, rating });
});

export default router;
