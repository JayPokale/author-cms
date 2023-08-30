import { createEffect } from "solid-js";
import { createRouteAction, useNavigate, useSearchParams } from "solid-start";
import toast from "solid-toast";
import { setLoadingState } from "~/root";
import { client } from "~/utils/client";

const verify = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const verify = { ...params }.verify;
  const [_, verification] = createRouteAction(async () => {
    setLoadingState((prev) => Math.max(1, prev + 1));
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          if (!verify) {
            reject("Permission denied");
          }
          const res: any = await client.user.createUserFromVerify.query(verify);
          if (res.success) {
            localStorage.setItem("token", res.token);
            resolve("Registration successful");
          }
          reject(res.msg || "Some error occured");
        } catch {
          reject("Some error occured");
        }
      }),
      {
        loading: "Authenticating user",
        success: (val) => {
          navigate("/");
          setLoadingState((prev) => prev - 1);
          return val as string;
        },
        error: (val) => {
          navigate("/");
          setLoadingState((prev) => prev - 1);
          return val as string;
        },
      }
    );
  });
  createEffect(() => verification());

  return <div></div>;
};

export default verify;
