import { ProviderRating } from "../types.js";
import { generateId, readJson, writeJson } from "../storage.js";

const RATINGS_KEY = "provider_ratings";

const readRatings = () => readJson<ProviderRating[]>(RATINGS_KEY, []);

export const addProviderRating = (providerId: string, clientId: string, score: number, comment?: string) => {
  const sanitizedScore = Math.min(Math.max(Math.round(score), 1), 5);
  const rating: ProviderRating = {
    id: generateId("rating_"),
    providerId,
    clientId,
    score: sanitizedScore,
    createdAt: new Date().toISOString(),
  };
  if (comment && comment.trim()) {
    rating.comment = comment.trim();
  }
  const ratings = readRatings();
  ratings.push(rating);
  writeJson(RATINGS_KEY, ratings);
  return rating;
};

export const getProviderRatings = (providerId: string) => readRatings().filter((rating) => rating.providerId === providerId);

export const getProviderAverageScore = (providerId: string) => {
  const ratings = getProviderRatings(providerId);
  if (ratings.length === 0) return null;
  const total = ratings.reduce((acc, rating) => acc + rating.score, 0);
  return Number((total / ratings.length).toFixed(2));
};
