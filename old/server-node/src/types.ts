export type ProviderDocumentStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface ProviderDocument {
  type: string;
  label: string;
  required: boolean;
  status: ProviderDocumentStatus;
  url: string | null;
  uploadedAt: string | null;
  notes?: string;
}

export interface ProviderProfile {
  providerId: string;
  areas: string[];
  overview?: string;
  documents: ProviderDocument[];
  updatedAt: string;
}

export type DayCode = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

export interface AvailabilityRule {
  id: string;
  providerId: string;
  daysOfWeek: DayCode[];
  startTime: string;
  endTime: string;
  slotMinutes: number;
  bufferMinutes: number;
  maxPerSlot: number;
  maxPerDay?: number;
  urgent: boolean;
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityBlackout {
  id: string;
  providerId: string;
  start: string;
  end: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export type AvailabilitySlotSource = "RULE" | "MANUAL";

export interface AvailabilitySlot {
  id: string;
  providerId: string;
  ruleId: string | null;
  date: string;
  start: string;
  end: string;
  label: string;
  urgent: boolean;
  capacity: number;
  taken: number;
  available: number;
  durationMinutes: number;
  source: AvailabilitySlotSource;
  manualSlotId?: string;
  collaboratorId?: string | null;
  linkedSlotId?: string | null;
  notes?: string;
}

export interface ManualSlot {
  id: string;
  providerId: string;
  start: string;
  end: string;
  label: string;
  urgent: boolean;
  capacity: number;
  collaboratorId?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderNotification {
  id: string;
  providerId: string;
  type: "REQUEST_CREATED" | "SLOT_HELD" | "DOCUMENT_STATUS" | "SYSTEM";
  title: string;
  message: string;
  payload?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface ProviderPushSubscription {
  id: string;
  providerId: string;
  endpoint: string;
  keys?: Record<string, string>;
  platform?: string;
  createdAt: string;
}

export type ServiceModality = "PRESENCIAL" | "VIRTUAL" | "MOVIL";

export interface CatalogItem {
  id: string;
  rubro: string;
  subrubro: string;
  nombre: string;
  categoria: string;
  subcategoria: string;
  etiquetas: string[];
  modalidades: ServiceModality[];
  permiteUrgencias: boolean;
  sinonimos?: string[];
  tiempoEstimado?: number;
}

export interface QuoteItem {
  id: string;
  kind: "LABOR" | "MATERIAL" | "PART" | "OTHER";
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  attachmentUrl?: string | null;
}

export interface ProviderRating {
  id: string;
  providerId: string;
  clientId: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface ProviderMaterial {
  id: string;
  providerId: string;
  requestId: string;
  description: string;
  amount: number;
  currency: string;
  attachmentUrl?: string | null;
  createdAt: string;
}

export interface RequestCancellation {
  reason: string;
  actor: "CLIENT" | "PROVIDER" | "SYSTEM";
  createdAt: string;
  proposedSlot?: {
    date: string;
    start: string;
    end: string;
    label?: string;
  };
}

export type CollaboratorStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED";

export interface CollaboratorRecord {
  id: string;
  providerId: string;
  userId: string | null;
  email: string;
  displayName: string;
  phone?: string | null;
  roles: string[];
  permissions: string[];
  status: CollaboratorStatus;
  invitedBy: string;
  createdAt: string;
  updatedAt: string;
  invitationAcceptedAt?: string | null;
}

export interface CollaboratorDocument extends ProviderDocument {
  collaboratorId: string;
}

export interface CollaboratorProfile {
  collaboratorId: string;
  providerId: string;
  overview?: string;
  documents: CollaboratorDocument[];
  updatedAt: string;
}

export interface CollaboratorMetricsSnapshot {
  collaboratorId: string;
  providerId: string;
  requestsHandled: number;
  quotesIssued: number;
  ratingsCount: number;
  averageRating: number | null;
  lastActiveAt?: string | null;
  updatedAt: string;
}

export interface CollaboratorTermsLog {
  id: string;
  collaboratorId: string;
  providerId: string;
  version: string;
  acceptedAt: string;
  contractHash: string | null;
  signatureHash: string;
}
