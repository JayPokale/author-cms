import { setUser } from "~/root";
import { client } from "./client";

export const loadUserDataAgain = async () => {
  const res: any = await client.user.getUser.query(
    localStorage.getItem("token") as string
  );
  if (res.success) {
    setUser({
      name: res.name,
      username: res.username,
      bio: res.bio,
      profilePhoto: res.profilePhoto,
      socialLinks: res.socialLinks,
      countPosts: res.countPosts,
      countDrafts: res.countDrafts,
    });
  }
};
