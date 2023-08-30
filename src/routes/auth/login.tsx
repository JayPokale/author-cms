import { A } from "@solidjs/router";
import { createRouteAction, useNavigate } from "solid-start";
import toast from "solid-toast";
import Input from "~/components/Input";
import { setLoadingState, setUser } from "~/root";
import { client } from "~/utils/client";

const login = () => {
  const navigate = useNavigate();

  const [_, { Form }] = createRouteAction(async (formData: FormData) => {
    setLoadingState((prev) => Math.max(1, prev + 1));
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const res: any = await client.user.loginUser.query({
            username: formData.get("username") as string,
            password: formData.get("password") as string,
          });
          if (res.success) {
            localStorage.setItem("token", res.token);
            setUser({
              name: res.name,
              username: res.username,
              bio: res.bio,
              profilePhoto: res.profilePhoto,
              socialLinks: res.socialLinks,
              countPosts: res.countPosts,
              countDrafts: res.countDrafts,
            });
            resolve("Login Successful");
          }
          reject(res.msg || "Some error occured");
        } catch {
          reject("Some error occured");
        }
      }),
      {
        loading: "Verifying Credentials",
        success: (val) => {
          navigate("/");
          setLoadingState((prev) => prev - 1);
          return val as string;
        },
        error: (val: string) => {
          setLoadingState((prev) => prev - 1);
          return val;
        },
      }
    );
  });

  return (
    <div class="grid place-items-center min-h-screen">
      <Form class="w-full max-w-sm flex flex-col gap-4">
        <Input
          id="username"
          type="text"
          placeholder="Your username"
          required={true}
        />
        <Input
          id="password"
          type="password"
          placeholder="Password"
          required={true}
        />
        <div class="mt-4 flex justify-between items-center">
          <input
            type="submit"
            class="text-white bg-black px-6 py-2 rounded-md cursor-pointer"
            value="Log in"
          />
          <p class="text-sm text-gray-500">
            New here?{" "}
            <A href="/auth/signup" class="underline">
              Register
            </A>
          </p>
        </div>
      </Form>
    </div>
  );
};

export default login;
