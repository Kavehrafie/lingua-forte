import { createAuthClient } from "better-auth/client";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.PROD
    ? "https://lingua-forte.pages.dev"
    : "http://localhost:4321",
  plugins: [magicLinkClient()],
});
