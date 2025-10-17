export type FeatureFlag =
  | "chat_internal"
  | "escrow_flow"
  | "multi_city"
  | "watermark_pipeline"
  | "provider_badges";

const defaults: Record<FeatureFlag, boolean> = {
  chat_internal: false,
  escrow_flow: false,
  multi_city: false,
  watermark_pipeline: false,
  provider_badges: false,
};

const overrides = new Map<FeatureFlag, boolean>();

export const isFeatureEnabled = (flag: FeatureFlag) => overrides.get(flag) ?? defaults[flag];

export const setFeatureFlag = (flag: FeatureFlag, value: boolean) => {
  overrides.set(flag, value);
};

export const listFeatureFlags = () => ({ ...defaults, ...Object.fromEntries(overrides.entries()) });
