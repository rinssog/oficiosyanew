export interface EscrowRecord {
  id: string;
  requestId: string;
  providerId: string;
  clientId: string;
  amount: number;
  currency: string;
  status: "HELD" | "RELEASED" | "REFUNDED";
  createdAt: string;
  releasedAt?: string;
}

export const createEscrowRecord = (
  payload: Omit<EscrowRecord, "id" | "status" | "createdAt" | "releasedAt">
): EscrowRecord => ({
  id: `escrow_${Math.random().toString(36).slice(2, 10)}`,
  status: "HELD",
  createdAt: new Date().toISOString(),
  ...payload,
});
