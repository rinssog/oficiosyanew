export interface RenaperResponse {
  dni: string;
  status: "VALID" | "INVALID" | "PENDING";
  message?: string;
}

export const verifyIdentityWithRenaper = async (dni: string): Promise<RenaperResponse> => {
  // TODO: integrar API real. Mockeamos respuesta positiva para la demo.
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { dni, status: "VALID" };
};
