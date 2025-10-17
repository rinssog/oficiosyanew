export interface EvidenceItem {
  id: string;
  requestId: string;
  providerId: string;
  clientId: string;
  imageUrl: string;
  watermarkedUrl?: string;
  verifiedByClient: boolean;
  uploadedAt: string;
}

export const watermarkEvidence = (url: string) => {
  // TODO: integrar pipeline de watermarking; por ahora retorna la misma URL
  return url;
};
