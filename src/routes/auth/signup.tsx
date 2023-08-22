import { A, createRouteAction, useNavigate } from "solid-start";
import toast from "solid-toast";
import Input from "~/components/Input";
import { setLoadingState } from "~/root";
import { client } from "~/utils/client";

const signup = () => {
  const navigate = useNavigate();

  const [_, { Form }] = createRouteAction(async (formData: FormData) => {
    setLoadingState(true);
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const res: any = await client.user.sendMailForAuth.query({
            name: formData.get("name") as string,
            username: formData.get("username") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
          });
          if (res.success) resolve("Virification mail sent");
          reject(res.msg || "Some error occured");
        } catch {
          reject("Some error occured");
        }
      }),
      {
        loading: "Sending data",
        success: (val) => {
          setLoadingState(false);
          navigate("/auth/login");
          return val as string;
        },
        error: (val) => {
          setLoadingState(false);
          return val;
        },
      }
    );
  });

  return (
    <div class="grid place-items-center min-h-screen">
      <Form class="w-full max-w-sm flex flex-col gap-4">
        <Input id="name" type="text" placeholder="Your Name" required={true} />
        <Input
          id="username"
          type="text"
          placeholder="Set username"
          required={true}
        />
        <Input
          id="email"
          type="email"
          placeholder="Your Email"
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
            value="Register"
          />
          <p class="text-sm text-gray-500">
            Existing user?{" "}
            <A href="/auth/login" class="underline">
              Login
            </A>
          </p>
        </div>
      </Form>
    </div>
  );
};

export default signup;
