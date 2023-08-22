import { z } from "zod";
import userModel from "../schemas/user.model";
import { procedure, router } from "../utils";
import * as sgMail from "@sendgrid/mail";
import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import randomString from "~/utils/randomString";

sgMail.setApiKey(import.meta.env.VITE_SEND_GRID_KEY as string);

export const userRouter = router({
  loginUser: procedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { username, password } = input;
      try {
        const thisUser = await userModel.findOne(
          { username },
          {
            password: 1,
            jwtKey: 1,
            name: 1,
            username: 1,
            blocked: 1,
            bio: 1,
            profilePhoto: 1,
            socialLinks: 1,
            countPosts: 1,
            countDrafts: 1,
          }
        );
        if (thisUser && thisUser.blocked) {
          return {
            msg: "Your account is temporary blocked",
            success: false,
            error: false,
          };
        }
        if (thisUser && bcrypt.compareSync(password, thisUser.password)) {
          return {
            name: thisUser.name,
            username: thisUser.username,
            bio: thisUser.bio,
            profilePhoto: thisUser.profilePhoto,
            socialLinks: thisUser.socialLinks,
            countPosts: thisUser.countPosts,
            countDrafts: thisUser.countDrafts,
            token: jwt.sign(
              { _id: thisUser._id, jwtKey: thisUser.jwtKey },
              import.meta.env.VITE_JWT_SECRET
            ),
            success: true,
            error: false,
          };
        }
        return {
          msg: "Invalid Credentials",
          success: false,
          error: false,
        };
      } catch (error) {
        console.log(error);
        return { error };
      }
    }),

  logOutAllDevices: procedure.input(z.string()).query(async ({ input }) => {
    try {
      const { _id, jwtKey } = jwt.verify(
        input,
        import.meta.env.VITE_JWT_SECRET
      ) as { _id: string; jwtKey: string };
      const thisUser = await userModel.findById(_id, { _id: 0, jwtKey: 1 });
      if (jwtKey !== thisUser.jwtKey) {
        return { msg: "Not a valid user", success: false, error: false };
      }

      await userModel.findByIdAndUpdate(_id, {
        $set: { jwtKey: randomString(4) },
      });
      return {
        msg: "Logged out from all devices",
        success: true,
        error: false,
      };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }),

  sendMailForAuth: procedure
    .input(
      z.object({
        name: z.string(),
        username: z.string(),
        email: z.string().email(),
        password: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { name, username, email, password } = input;
      try {
        if (await userModel.exists({ email })) {
          return { msg: "Email Already Exists", success: false, error: false };
        }
        if (await userModel.exists({ username })) {
          return {
            msg: "Username Already Exists",
            success: false,
            error: false,
          };
        }
        const verify = jwt.sign(
          { name, email, username, password },
          import.meta.env.VITE_JWT_SECRET,
          { expiresIn: 5 * 60 }
        );
        const msg = {
          to: email,
          subject: "Verification email for AuthorsLog",
          from: "jay.pokale.35@gmail.com",
          text: "Authentication using this link",
          html: `<div>
                  <p>Link valid for 5 minutes only</p>
                  <a href=${
                    import.meta.env.VITE_MAIN_URI
                  }/auth/verify?verify=${verify}>AuthorsLog.com</a>
                </div>`,
        };
        await sgMail.send(msg);
        return { success: true, error: false };
      } catch (error) {
        console.log(error);
        return { error };
      }
    }),

  createUserFromVerify: procedure.input(z.string()).query(async ({ input }) => {
    try {
      let { name, username, email, password } = jwt.verify(
        input,
        import.meta.env.VITE_JWT_SECRET
      ) as { name: string; username: string; email: string; password: string };
      if (await userModel.exists({ email })) {
        return {
          msg: "Email Already Exists",
          success: false,
          error: false,
        };
      }
      if (await userModel.exists({ username })) {
        return {
          msg: "Username Already Exists",
          success: false,
          error: false,
        };
      }
      password = bcrypt.hashSync(password, 8);
      const userId = randomString(8);
      const jwtKey = randomString(4);
      const user = await userModel.create({
        name,
        username,
        password,
        email,
        userId,
        jwtKey,
      });
      return {
        token: jwt.sign(
          { _id: user._id, jwtKey: user.jwtKey },
          import.meta.env.VITE_JWT_SECRET
        ),
        success: true,
        error: false,
      };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }),

  getUser: procedure.input(z.string()).query(async ({ input }) => {
    try {
      const { _id, jwtKey } = jwt.verify(
        input,
        import.meta.env.VITE_JWT_SECRET
      ) as { _id: string; jwtKey: string };
      const thisUser = await userModel.findById(_id, {
        _id: 0,
        jwtKey: 1,
        name: 1,
        username: 1,
        blocked: 1,
        bio: 1,
        profilePhoto: 1,
        socialLinks: 1,
        countPosts: 1,
        countDrafts: 1,
      });
      if (thisUser && thisUser.blocked) {
        return {
          msg: "Your account is temporary blocked",
          success: false,
          error: false,
        };
      }
      if (jwtKey !== thisUser.jwtKey) {
        return { msg: "Not a valid user", success: false, error: false };
      }
      return {
        name: thisUser.name,
        username: thisUser.username,
        bio: thisUser.bio,
        profilePhoto: thisUser.profilePhoto,
        socialLinks: thisUser.socialLinks,
        countPosts: thisUser.countPosts,
        countDrafts: thisUser.countDrafts,
        success: true,
        error: false,
      };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }),

  updateUser: procedure
    .input(
      z.object({
        token: z.string(),
        payload: z.object({
          name: z.string().optional(),
          bio: z.string().optional(),
          profilePhoto: z.string().optional(),
          socialLinks: z
            .array(z.object({ platform: z.string(), link: z.string() }))
            .optional(),
        }),
      })
    )
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

        const updatedUser = await userModel.findByIdAndUpdate(
          _id,
          { $set: input.payload },
          {
            new: true,
            projection: {
              _id: 0,
              jwtKey: 1,
              name: 1,
              username: 1,
              blocked: 1,
              bio: 1,
              profilePhoto: 1,
              socialLinks: 1,
              countPosts: 1,
              countDrafts: 1,
            },
          }
        );
        return {
          name: updatedUser.name,
          username: updatedUser.username,
          bio: updatedUser.bio,
          profilePhoto: updatedUser.profilePhoto,
          socialLinks: updatedUser.socialLinks,
          countPosts: updatedUser.countPosts,
          countDrafts: updatedUser.countDrafts,
          success: true,
          error: false,
        };
      } catch (error) {
        console.log(error);
        return { error };
      }
    }),
});
