export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  grantedAt: string;
  revokedAt?: string;
}

export const registerConsent = (userId: string, consentType: string): ConsentRecord => ({
  id: `consent_${Math.random().toString(36).slice(2, 10)}`,
  userId,
  consentType,
  grantedAt: new Date().toISOString(),
});
