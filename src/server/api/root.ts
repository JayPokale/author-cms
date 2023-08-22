import postRouter from "./routers/post.router";
import { userRouter } from "./routers/user.router";
import { router } from "./utils";

export const appRouter = router({
  user: userRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;
