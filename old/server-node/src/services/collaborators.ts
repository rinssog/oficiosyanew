import { CollaboratorDocument, CollaboratorMetricsSnapshot, CollaboratorProfile, CollaboratorRecord, CollaboratorStatus, CollaboratorTermsLog } from "../types.js";
import { writeJson, generateId } from "../storage.js";
import { ensureJsonArray } from "../utils/persistence.js";
import { COLLABORATOR_DEFAULT_DOCUMENTS, COLLABORATOR_PERMISSION_SET, COLLABORATOR_ROLES } from "../utils/constants.js";

const DEFAULT_COLLABORATOR_ROLE = COLLABORATOR_ROLES[0] || "FIELD_SPECIALIST";

const COLLABORATORS_STORE = "collaborators";
const PROFILES_STORE = "collaborator_profiles";
const TERMS_STORE = "collaborator_terms";
const METRICS_STORE = "collaborator_metrics";

type CollaboratorDraft = {
  providerId: string;
  email: string;
  displayName: string;
  phone?: string;
  roles?: string[];
  permissions?: string[];
  invitedBy: string;
};

type CollaboratorPatch = Partial<Pick<CollaboratorRecord, "displayName" | "phone" | "roles" | "permissions" | "status" | "userId" >> & {
  invitationAcceptedAt?: string | null;
};

type CollaboratorMetricsPatch = Partial<Omit<CollaboratorMetricsSnapshot, "collaboratorId">> & { collaboratorId?: never };

const loadCollaborators = () => ensureJsonArray<CollaboratorRecord>(COLLABORATORS_STORE);
const saveCollaborators = (items: CollaboratorRecord[]) => writeJson(COLLABORATORS_STORE, items);

const loadProfiles = () => ensureJsonArray<CollaboratorProfile>(PROFILES_STORE);
const saveProfiles = (items: CollaboratorProfile[]) => writeJson(PROFILES_STORE, items);

const loadTerms = () => ensureJsonArray<CollaboratorTermsLog>(TERMS_STORE);
const saveTerms = (items: CollaboratorTermsLog[]) => writeJson(TERMS_STORE, items);

export const listCollaborators = (providerId?: string) => {
  const all = loadCollaborators();
  if (!providerId) return all;
  return all.filter((item) => item.providerId === providerId && item.status !== "REMOVED");
};

export const findCollaboratorById = (collaboratorId: string) => {
  return loadCollaborators().find((item) => item.id === collaboratorId) || null;
};

export const upsertCollaborator = (record: CollaboratorRecord) => {
  const items = loadCollaborators();
  const idx = items.findIndex((item) => item.id === record.id);
  if (idx >= 0) {
    items[idx] = record;
  } else {
    items.push(record);
  }
  saveCollaborators(items);
  return record;
};

const normalizeRoles = (roles?: string[]) => {
  if (!Array.isArray(roles) || roles.length === 0) return [DEFAULT_COLLABORATOR_ROLE];
  const allowed = new Set(COLLABORATOR_ROLES);
  const unique = Array.from(new Set(roles.map((role) => role.trim()).filter(Boolean)));
  const filtered = unique.filter((role) => allowed.has(role));
  return filtered.length > 0 ? filtered : [DEFAULT_COLLABORATOR_ROLE];
};

const normalizePermissions = (permissions?: string[]) => {
  if (!Array.isArray(permissions) || permissions.length === 0) return [...COLLABORATOR_PERMISSION_SET];
  const allowed = new Set(COLLABORATOR_PERMISSION_SET);
  const unique = Array.from(new Set(permissions.map((perm) => perm.trim()).filter(Boolean)));
  const filtered = unique.filter((perm) => allowed.has(perm));
  return filtered.length > 0 ? filtered : [...COLLABORATOR_PERMISSION_SET];
};

const normalizeStatus = (status?: string): CollaboratorStatus => {
  if (!status) return "INVITED";
  const allowed: CollaboratorStatus[] = ["INVITED", "ACTIVE", "SUSPENDED", "REMOVED"];
  return allowed.includes(status as CollaboratorStatus) ? (status as CollaboratorStatus) : "INVITED";
};

const buildDefaultDocuments = (collaboratorId: string): CollaboratorDocument[] =>
  COLLABORATOR_DEFAULT_DOCUMENTS.map((doc) => ({
    collaboratorId,
    type: doc.type,
    label: doc.label,
    required: doc.required,
    status: "PENDING",
    url: null,
    uploadedAt: null,
    notes: "",
  }));

export const ensureCollaboratorProfile = (collaboratorId: string, providerId: string): CollaboratorProfile => {
  const profiles = loadProfiles();
  let profile = profiles.find((item) => item.collaboratorId === collaboratorId);
  let updated = false;
  if (!profile) {
    profile = {
      collaboratorId,
      providerId,
      overview: "",
      documents: buildDefaultDocuments(collaboratorId),
      updatedAt: new Date().toISOString(),
    };
    profiles.push(profile);
    updated = true;
  } else {
    const known = new Set(profile.documents?.map((doc) => doc.type));
    COLLABORATOR_DEFAULT_DOCUMENTS.forEach((doc) => {
      if (!known.has(doc.type)) {
        profile!.documents.push({
          collaboratorId,
          type: doc.type,
          label: doc.label,
          required: doc.required,
          status: "PENDING",
          url: null,
          uploadedAt: null,
          notes: "",
        });
        updated = true;
      }
    });
  }
  if (updated) saveProfiles(profiles);
  return profile!;
};

export const saveCollaboratorProfile = (profile: CollaboratorProfile) => {
  const profiles = loadProfiles();
  const idx = profiles.findIndex((item) => item.collaboratorId === profile.collaboratorId);
  if (idx >= 0) {
    profiles[idx] = profile;
  } else {
    profiles.push(profile);
  }
  saveProfiles(profiles);
  return profile;
};

export const createCollaborator = (draft: CollaboratorDraft): CollaboratorRecord => {
  const now = new Date().toISOString();
  const collaborator: CollaboratorRecord = {
    id: generateId("col_"),
    providerId: draft.providerId,
    userId: null,
    email: draft.email.trim().toLowerCase(),
    displayName: draft.displayName.trim(),
    phone: draft.phone ? draft.phone.trim() : null,
    roles: normalizeRoles(draft.roles),
    permissions: normalizePermissions(draft.permissions),
    status: "INVITED",
    invitedBy: draft.invitedBy,
    createdAt: now,
    updatedAt: now,
    invitationAcceptedAt: null,
  };
  const items = loadCollaborators();
  items.push(collaborator);
  saveCollaborators(items);
  ensureCollaboratorProfile(collaborator.id, collaborator.providerId);
  return collaborator;
};

export const updateCollaborator = (collaboratorId: string, patch: CollaboratorPatch) => {
  const items = loadCollaborators();
  const idx = items.findIndex((item) => item.id === collaboratorId);
  if (idx < 0) return null;
  const current = items[idx]!;
  const nextPhone = (() => {
    if (patch.phone === undefined) return current.phone ?? null;
    if (patch.phone === null) return null;
    const trimmed = patch.phone.trim();
    return trimmed.length > 0 ? trimmed : null;
  })();
  const next: CollaboratorRecord = {
    ...current,
    displayName: patch.displayName?.trim() || current.displayName,
    phone: nextPhone,
    roles: patch.roles ? normalizeRoles(patch.roles) : current.roles,
    permissions: patch.permissions ? normalizePermissions(patch.permissions) : current.permissions,
    status: normalizeStatus(patch.status),
    userId: patch.userId === undefined ? current.userId : patch.userId,
    invitationAcceptedAt:
      patch.invitationAcceptedAt === undefined ? current.invitationAcceptedAt || null : patch.invitationAcceptedAt,
    updatedAt: new Date().toISOString(),
  };
  items[idx] = next;
  saveCollaborators(items);
  return next;
};

export const removeCollaborator = (collaboratorId: string) => {
  const items = loadCollaborators();
  const idx = items.findIndex((item) => item.id === collaboratorId);
  if (idx < 0) return false;
  const record = items[idx]!;
  record.status = "REMOVED";
  record.updatedAt = new Date().toISOString();
  record.permissions = [];
  record.roles = [DEFAULT_COLLABORATOR_ROLE];
  saveCollaborators(items);
  return true;
};

export const registerCollaboratorTerms = (entry: Omit<CollaboratorTermsLog, "id">) => {
  const items = loadTerms();
  const log: CollaboratorTermsLog = {
    ...entry,
    id: generateId("colterms_"),
  };
  items.push(log);
  saveTerms(items);
  return log;
};

export const listCollaboratorTerms = (collaboratorId: string) => {
  return loadTerms()
    .filter((item) => item.collaboratorId === collaboratorId)
    .sort((a, b) => new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime());
};

export const ensureCollaboratorMetrics = (collaboratorId: string, providerId: string) => {
  const metrics = ensureJsonArray<CollaboratorMetricsSnapshot>(METRICS_STORE);
  const existing = metrics.find((item) => item.collaboratorId === collaboratorId);
  if (existing) return existing;
  const now = new Date().toISOString();
  const snapshot: CollaboratorMetricsSnapshot = {
    collaboratorId,
    providerId,
    requestsHandled: 0,
    quotesIssued: 0,
    ratingsCount: 0,
    averageRating: null,
    lastActiveAt: null,
    updatedAt: now,
  };
  metrics.push(snapshot);
  writeJson(METRICS_STORE, metrics);
  return snapshot;
};

export const updateCollaboratorMetrics = (collaboratorId: string, patch: CollaboratorMetricsPatch) => {
  const metrics = ensureJsonArray<CollaboratorMetricsSnapshot>(METRICS_STORE);
  const idx = metrics.findIndex((item) => item.collaboratorId === collaboratorId);
  if (idx < 0) {
    if (!patch.providerId) {
      throw new Error("providerId required to initialize collaborator metrics");
    }
    return ensureCollaboratorMetrics(collaboratorId, patch.providerId);
  }
  const current = metrics[idx]!;
  const next: CollaboratorMetricsSnapshot = {
    collaboratorId: current.collaboratorId,
    providerId: patch.providerId ?? current.providerId,
    requestsHandled: patch.requestsHandled ?? current.requestsHandled,
    quotesIssued: patch.quotesIssued ?? current.quotesIssued,
    ratingsCount: patch.ratingsCount ?? current.ratingsCount,
    averageRating: patch.averageRating ?? current.averageRating,
    lastActiveAt: patch.lastActiveAt ?? current.lastActiveAt ?? null,
    updatedAt: new Date().toISOString(),
  };
  metrics[idx] = next;
  writeJson(METRICS_STORE, metrics);
  return next;
};
