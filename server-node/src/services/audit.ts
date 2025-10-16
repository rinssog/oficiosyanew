export interface AuditEntry {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  actorId: string;
  createdAt: string;
  data?: Record<string, unknown>;
}

export const createAuditEntry = (entry: Omit<AuditEntry, "id" | "createdAt">): AuditEntry => ({
  id: `audit_${Math.random().toString(36).slice(2, 10)}`,
  createdAt: new Date().toISOString(),
  ...entry,
});
