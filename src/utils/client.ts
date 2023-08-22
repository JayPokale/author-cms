import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { AppRouter } from "~/server/api/root";

export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_MAIN_URI}/api/trpc`,
    }),
  ],
});
