import { createTRPCRouter } from "~/server/api/trpc";
import { usersRouter } from "users";
import { completionsRouter } from "./routers/completions";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: usersRouter,
  completions: completionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
