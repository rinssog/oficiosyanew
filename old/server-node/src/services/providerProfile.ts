import { CABA_BARRIOS, DEFAULT_DOCUMENTS } from "../utils/constants.js";
import { ProviderDocument, ProviderProfile } from "../types.js";
import { readJson, writeJson } from "../storage.js";

const loadProfiles = () => readJson<ProviderProfile[]>("provider_profiles", []);
const saveProfiles = (profiles: ProviderProfile[]) => writeJson("provider_profiles", profiles);

const createDefaultDocuments = (): ProviderDocument[] =>
  DEFAULT_DOCUMENTS.map((doc) => ({
    ...doc,
    status: "PENDING",
    url: null,
    uploadedAt: null,
    notes: "",
  }));

export const ensureProviderProfile = (providerId: string): ProviderProfile => {
  const profiles = loadProfiles();
  let profile = profiles.find((p) => p.providerId === providerId);
  let updated = false;

  if (!profile) {
    profile = {
      providerId,
      areas: [],
      overview: "",
      documents: createDefaultDocuments(),
      updatedAt: new Date().toISOString(),
    };
    profiles.push(profile);
    updated = true;
  } else {
    const known = new Set(profile.documents?.map((d) => d.type));
    DEFAULT_DOCUMENTS.forEach((doc) => {
      if (!known.has(doc.type)) {
        profile!.documents.push({
          ...doc,
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

export const saveProviderProfile = (profile: ProviderProfile) => {
  const profiles = loadProfiles().map((p) => (p.providerId === profile.providerId ? profile : p));
  saveProfiles(profiles);
};

export const sanitizeAreas = (areas: string[]): string[] => {
  const allowed = new Set(CABA_BARRIOS);
  return Array.from(new Set((areas || []).map((b) => b.trim()).filter((b) => Boolean(b) && allowed.has(b))));
};
