import type { ObjectValues } from "@/shared/helpers/types";

export const DEPLOYMENT_ENVIRONMENT = Object.freeze({
  LOCAL: "local",
  DEVELOPMENT: "development",
  PRODUCTION: "production",
});

export const DEPLOYMENT_ENVIRONMENTS = Object.values(DEPLOYMENT_ENVIRONMENT);
export type DeploymentEnvironment = ObjectValues<typeof DEPLOYMENT_ENVIRONMENT>;
