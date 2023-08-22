import { APIEvent } from "solid-start";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/server/api/root";
import dbConnect from "~/server/api/mongoose";

const handler = (event: APIEvent) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: event.request,
    router: appRouter,
    createContext: async () => {
      await dbConnect();
      return {};
    },
  });

export const GET = handler;
export const POST = handler;
