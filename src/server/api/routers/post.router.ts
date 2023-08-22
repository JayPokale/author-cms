import { z } from "zod";
import { procedure, router } from "../utils";
import * as jwt from "jsonwebtoken";
import userModel from "../schemas/user.model";
import postModel from "../schemas/post.model";
import randomString from "~/utils/randomString";
import mongoose from "mongoose";

const postRouter = router({
  createPost: procedure
    .input(
      z.object({
        token: z.string(),
        payload: z.object({
          title: z.string(),
          content: z.string().optional(),
          catagories: z.array(z.string()).optional(),
          draft: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { _id, jwtKey } = jwt.verify(
          input.token,
          import.meta.env.VITE_JWT_SECRET
        ) as { _id: string; jwtKey: string };
        const thisUser = await userModel.findById(_id, {
          _id: 0,
          jwtKey: 1,
          userId: 1,
        });
        if (jwtKey !== thisUser.jwtKey) {
          return {
            msg: "Not a valid user",
            success: false,
            error: false,
          };
        }
        const payload: any = input.payload;
        payload.user_id = new mongoose.Types.ObjectId(_id);
        payload.postId = randomString(9);
        const post = await postModel.create(payload);
        if (input.payload.draft) {
          await userModel.findByIdAndUpdate(_id, {
            $push: {
              drafts: {
                $each: [new mongoose.Types.ObjectId(post._id)],
                $position: 0,
              },
            },
            $inc: { countDrafts: 1 },
          });
        } else {
          await userModel.findByIdAndUpdate(_id, {
            $push: {
              posts: {
                $each: [new mongoose.Types.ObjectId(post._id)],
                $position: 0,
              },
            },
            $inc: { countPosts: 1 },
          });
        }
        return {
          postId: payload.postId,
          success: true,
          error: false,
        };
      } catch (error) {
        console.log(error);
        return { error };
      }
    }),

  fetchPostForEdit: procedure
    .input(z.object({ token: z.string(), postId: z.string() }))
    .query(async ({ input }) => {
      try {
        const { _id, jwtKey } = jwt.verify(
          input.token,
          import.meta.env.VITE_JWT_SECRET
        ) as { _id: string; jwtKey: string };
        const thisUser = await userModel.findById(_id, { _id: 0, jwtKey: 1 });
        if (jwtKey !== thisUser.jwtKey) {
          return { msg: "Not a valid user", success: false, error: false };
        }
        const post = await postModel.findOne({ postId: input.postId });
        if (!post.user_id.equals(new mongoose.Types.ObjectId(_id))) {
          return { msg: "Not a valid user", success: false, error: false };
        }
        return { post, success: true, error: false };
      } catch (error) {
        console.log(error);
        return { error };
      }
    }),

  updatePost: procedure
    .input(
      z.object({
        token: z.string(),
        _id: z.string(),
        payload: z.object({
          title: z.string(),
          content: z.string().optional(),
          catagories: z.array(z.string()).optional(),
          draft: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { _id, jwtKey } = jwt.verify(
          input.token,
          import.meta.env.VITE_JWT_SECRET
        ) as { _id: string; jwtKey: string };
        const thisUser = await userModel.findById(_id, { _id: 0, jwtKey: 1 });
        if (jwtKey !== thisUser.jwtKey) {
          return { msg: "Not a valid user", success: false, error: false };
        }

        const post = await postModel.findById(input._id, {
          draft: 1,
          user_id: 1,
        });
        if (!post.user_id.equals(new mongoose.Types.ObjectId(_id))) {
          return { msg: "Not a valid user", success: false, error: false };
        }

        await postModel.findByIdAndUpdate(input._id, {
          $set: input.payload,
        });
        const wasDraft = post.draft;
        const isDraft = input.payload.draft;
        if (!wasDraft && isDraft) {
          await userModel.findByIdAndUpdate(_id, {
            $pull: { posts: post._id },
            $push: {
              drafts: {
                $each: [new mongoose.Types.ObjectId(post._id)],
                $position: 0,
              },
            },
            $inc: { countPosts: -1, countDrafts: 1 },
          });
        } else if (wasDraft && !isDraft) {
          await userModel.findByIdAndUpdate(_id, {
            $push: {
              posts: {
                $each: [new mongoose.Types.ObjectId(post._id)],
                $position: 0,
              },
            },
            $pull: { drafts: post._id },
            $inc: { countPosts: 1, countDrafts: -1 },
          });
        }
        return { success: true, error: true };
      } catch (error) {
        console.log(error);
        return { error };
      }
    }),

  deletePost: procedure
    .input(z.object({ token: z.string(), _id: z.string() }))
    .query(async ({ input }) => {
      try {
        const { _id, jwtKey } = jwt.verify(
          input.token,
          import.meta.env.VITE_JWT_SECRET
        ) as { _id: string; jwtKey: string };
        const thisUser = await userModel.findById(_id, { _id: 0, jwtKey: 1 });
        if (jwtKey !== thisUser.jwtKey) {
          return { msg: "Not a valid user", success: false, error: false };
        }

        const post = await postModel.findById(input._id, {
          draft: 1,
          user_id: 1,
        });
        if (!post.user_id.equals(new mongoose.Types.ObjectId(_id))) {
          return { msg: "Not a valid user", success: false, error: false };
        }

        const wasDraft = post.draft;

        await postModel.findByIdAndRemove(input._id);

        if (wasDraft) {
          await userModel.findByIdAndUpdate(_id, {
            $pull: { drafts: post._id },
            $inc: { countDrafts: -1 },
          });
        } else {
          await userModel.findByIdAndUpdate(_id, {
            $pull: { posts: post._id },
            $inc: { countPosts: -1 },
          });
        }
        return { msg: "Post Deleted", success: true, error: false };
      } catch (error) {
        console.log(error);
        return { error };
      }
    }),

  getActivePosts: procedure
    .input(z.object({ token: z.string(), start: z.number(), end: z.number() }))
    .query(async ({ input }) => {
      try {
        const { _id, jwtKey } = jwt.verify(
          input.token,
          import.meta.env.VITE_JWT_SECRET
        ) as { _id: string; jwtKey: string };
        const thisUser = await userModel.findById(_id, { _id: 0, jwtKey: 1 });
        if (jwtKey !== thisUser.jwtKey) {
          return { msg: "Not a valid user", success: false, error: false };
        }

        const user = await userModel
          .findById(_id, { posts: { $slice: [input.start, input.end] } })
          .populate({
            path: "posts",
            model: postModel,
            select: "title postId createdAt -_id",
          });
        return { posts: user?.posts };
      } catch (error) {
        console.log(error);
        return { error };
      }
    }),

  getDraftPosts: procedure
    .input(z.object({ token: z.string(), start: z.number(), end: z.number() }))
    .query(async ({ input }) => {
      try {
        const { _id, jwtKey } = jwt.verify(
          input.token,
          import.meta.env.VITE_JWT_SECRET
        ) as { _id: string; jwtKey: string };
        const thisUser = await userModel.findById(_id, { _id: 0, jwtKey: 1 });
        if (jwtKey !== thisUser.jwtKey) {
          return { msg: "Not a valid user", success: false, error: false };
        }

        const user = await userModel
          .findById(_id, { drafts: 1 })
          .slice("drafts", [input.start, input.end + 1])
          .populate({
            path: "drafts",
            model: postModel,
            select: "title postId createdAt -_id",
          });
        return { drafts: user?.drafts };
      } catch (error) {
        console.log(error);
        return { error };
      }
    }),
});

export default postRouter;
