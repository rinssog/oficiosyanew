import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(["CLIENT", "PROVIDER", "ADMIN"]).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RequestCreateSchema = z.object({
  serviceId: z.string().min(1),
  providerId: z.string().min(1),
  clientId: z.string().min(1),
  notes: z.string().max(2000).optional(),
  schedule: z
    .object({
      slotId: z.string().optional(),
      date: z.string().optional(),
      start: z.string().optional(),
      end: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      label: z.string().optional(),
      urgent: z.boolean().optional(),
      timezone: z.string().optional(),
    })
    .optional()
    .default({}),
});

export const QuoteItemSchema = z.object({
  kind: z.enum(["LABOR", "MATERIAL", "PART", "OTHER"]),
  description: z.string().min(1),
  qty: z.number().int().min(1).default(1),
  unit: z.number().int().min(0).default(0),
  total: z.number().int().min(0),
  attachmentUrl: z.string().url().optional(),
});

export const QuoteCreateSchema = z.object({
  requestId: z.string().min(1),
  providerId: z.string().min(1),
  items: z.array(QuoteItemSchema).min(1),
});

export const CancellationSchema = z.object({
  action: z.enum(["RESCHEDULE", "CANCEL"]).optional(),
  reason: z.string().min(3).max(500).optional(),
  actor: z.enum(["CLIENT", "PROVIDER"]).optional(),
  proposedSlot: z
    .object({
      date: z.string(),
      start: z.string(),
      end: z.string(),
      label: z.string().optional(),
    })
    .optional(),
});

