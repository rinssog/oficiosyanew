import { createAuthClient } from "better-auth/react";

// Configure client to always send cookies and target the API route
export const authClient = createAuthClient({
  fetchOptions: {
    credentials: "include",
  },
});
