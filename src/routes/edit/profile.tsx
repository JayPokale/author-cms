import { createSignal, createEffect } from "solid-js";
import { Form } from "solid-start/data/Form";
import toast from "solid-toast";
import Navbar from "~/components/Navbar";
import { User, setLoadingState, setUser } from "~/root";
import { client } from "~/utils/client";
import uploadImage from "~/utils/uploadImage";

const isValidSocialMediaUrl = (url: string, platform: string) => {
  const regex = new RegExp(
    `^(https?:\/\/(www\\.)?(${platform})\\.com\/.*)`,
    "i"
  );
  return regex.test(url);
};

const EditProfileInfo = () => {
  const [profilePhoto, setProfilePhoto] = createSignal<File | null>(null);
  const [name, setName] = createSignal("");
  const [bio, setBio] = createSignal("");
  const [facebookLink, setFacebookLink] = createSignal("");
  const [youtubeLink, setYoutubeLink] = createSignal("");
  const [twitterLink, setTwitterLink] = createSignal("");
  const [instagramLink, setInstagramLink] = createSignal("");
  const [githubLink, setGithubLink] = createSignal("");
  const [linkedinLink, setLinkedinLink] = createSignal("");

  createEffect(() => {
    const user = User();
    if (user) {
      const socialLinksData = user.socialLinks?.reduce(
        (acc: any, link: any) => {
          acc[`${link.platform}Link`] = link.link;
          return acc;
        },
        {}
      );

      setName(user.name);
      setBio(user.bio);
      setFacebookLink(socialLinksData.FacebookLink || "");
      setYoutubeLink(socialLinksData.YouTubeLink || "");
      setTwitterLink(socialLinksData.TwitterLink || "");
      setInstagramLink(socialLinksData.InstagramLink || "");
      setGithubLink(socialLinksData.GithubLink || "");
      setLinkedinLink(socialLinksData.LinkedinLink || "");
    }
  });

  const socialMediaPlatforms = [
    { name: "Facebook", state: facebookLink, setter: setFacebookLink },
    { name: "YouTube", state: youtubeLink, setter: setYoutubeLink },
    { name: "Twitter", state: twitterLink, setter: setTwitterLink },
    { name: "Instagram", state: instagramLink, setter: setInstagramLink },
    { name: "Github", state: githubLink, setter: setGithubLink },
    { name: "LinkedIn", state: linkedinLink, setter: setLinkedinLink },
  ];

  const handleSubmit = async () => {
    setLoadingState((prev) => Math.max(1, prev + 1));
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const payload: any = {};
          payload.name = name();
          payload.bio = bio();
          payload.socialLinks = [];

          for (const platformData of socialMediaPlatforms) {
            const link = platformData.state();
            if (link) {
              if (
                isValidSocialMediaUrl(link, platformData.name.toLowerCase())
              ) {
                payload.socialLinks.push({
                  platform: platformData.name,
                  link: link,
                });
              } else {
                reject(`Invalid ${platformData.name} url`);
              }
            }
          }

          if (profilePhoto()) {
            const uploadedProfileImage = await uploadImage(
              profilePhoto() as File
            );
            if (uploadedProfileImage) payload.profilePhoto = uploadImage;
          }

          const result: any = await client.user.updateUser.query({
            token: localStorage.getItem("token") as string,
            payload,
          });
          if (!result.success) {
            reject(result.msg);
            return;
          }
          setUser({
            name: result.name,
            username: result.username,
            bio: result.bio,
            profilePhoto: result.preofilePhoto,
            socialLinks: result.socialLinks,
            countPosts: result.countPosts,
            countDrafts: result.countDrafts,
          });
          resolve("Updated Successfully");
        } catch {
          reject("Some error occured");
        }
      }),
      {
        loading: "Updating Post",
        success: (val) => {
          setLoadingState((prev) => prev - 1);
          return val as string;
        },
        error: (val: string) => {
          setLoadingState((prev) => prev - 1);
          return val;
        },
      }
    );
  };

  const handleProfilePhotoChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      const file = target.files[0];
      setProfilePhoto(() => file);
    } else {
      setProfilePhoto(() => null);
    }
  };

  const inputClass =
    "bg-gray-100 appearance-none border-2 border-gray-100 rounded w-full pt-2 pb-3 px-4 text-gray-700 leading-tight outline-none focus:bg-white duration-200";

  return (
    <>
      <Navbar />
      <Form onSubmit={handleSubmit} class="max-w-md mx-auto p-4">
        <div class="mb-4">
          <label class="block font-semibold">Profile Photo</label>
          <img
            src={
              (profilePhoto() && URL.createObjectURL(profilePhoto() as File)) ||
              User()?.profilePhoto ||
              `${import.meta.env.VITE_MAIN_URI}/userNone.webp`
            }
            alt="Profile Preview"
            class="w-32 h-32 rounded-full mb-2 cursor-pointer object-cover"
            onclick={(event: any) => event.target.nextElementSibling.click()}
          />
          <input
            type="file"
            id="profilePhoto"
            class="hidden"
            accept="image/*"
            onInput={handleProfilePhotoChange}
          />
        </div>
        <div class="mb-4">
          <label class="block font-semibold">Name</label>
          <input
            type="text"
            id="location"
            class={inputClass}
            placeholder="Enter your location"
            value={name()}
            onInput={(e: Event) =>
              setName((e.target as HTMLInputElement).value)
            }
          />
        </div>
        <div class="mb-4">
          <label class="block font-semibold">Bio</label>
          <input
            type="text"
            id="bio"
            class={inputClass}
            placeholder="Enter your bio"
            value={bio() || ""}
            onInput={(e: Event) => setBio((e.target as HTMLInputElement).value)}
          />
        </div>
        <div class="mb-4">
          <label class="block font-semibold">Facebook Link</label>
          <input
            type="text"
            id="facebookLink"
            class={inputClass}
            placeholder="Enter your Facebook link"
            value={facebookLink()}
            onInput={(e: Event) =>
              setFacebookLink((e.target as HTMLInputElement).value)
            }
          />
        </div>
        <div class="mb-4">
          <label class="block font-semibold">YouTube Link</label>
          <input
            type="text"
            id="youtubeLink"
            class={inputClass}
            placeholder="Enter your YouTube link"
            value={youtubeLink()}
            onInput={(e: Event) =>
              setYoutubeLink((e.target as HTMLInputElement).value)
            }
          />
        </div>
        <div class="mb-4">
          <label class="block font-semibold">Twitter Link</label>
          <input
            type="text"
            id="twitterLink"
            class={inputClass}
            placeholder="Enter your Twitter link"
            value={twitterLink()}
            onInput={(e: Event) =>
              setTwitterLink((e.target as HTMLInputElement).value)
            }
          />
        </div>
        <div class="mb-4">
          <label class="block font-semibold">Instagram Link</label>
          <input
            type="text"
            id="instagramLink"
            class={inputClass}
            placeholder="Enter your Instagram link"
            value={instagramLink()}
            onInput={(e: Event) =>
              setInstagramLink((e.target as HTMLInputElement).value)
            }
          />
        </div>
        <div class="mb-4">
          <label class="block font-semibold">Github Link</label>
          <input
            type="text"
            id="githubLink"
            class={inputClass}
            placeholder="Enter your GitHub link"
            value={githubLink()}
            onInput={(e: Event) =>
              setGithubLink((e.target as HTMLInputElement).value)
            }
          />
        </div>
        <div class="mb-4">
          <label class="block font-semibold">LinkedIn Link</label>
          <input
            type="text"
            id="linkedinLink"
            class={inputClass}
            placeholder="Enter your LinkedIn link"
            value={linkedinLink()}
            onInput={(e: Event) =>
              setLinkedinLink((e.target as HTMLInputElement).value)
            }
          />
        </div>
        <input
          type="submit"
          class="text-white bg-black px-6 py-2 rounded-md cursor-pointer"
          value="Save"
        />
      </Form>
    </>
  );
};

export default EditProfileInfo;
