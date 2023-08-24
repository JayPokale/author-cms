import { Suspense, createEffect, createSignal, onCleanup } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Navigate,
  Routes,
  Scripts,
  Title,
  useLocation,
  useNavigate,
} from "solid-start";
import "./root.css";
import toast, { Toaster } from "solid-toast";
import { client } from "./utils/client";
import NotFound from "./routes/[...404]";

export const [loadingState, setLoadingState] = createSignal<boolean>(false);
export const [User, setUser] = createSignal<any>(null);

export default function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  createEffect(() => location.pathname);

  createEffect(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (!/^\/auth\/(login|signup|verify)$/.test(location.pathname)) {
        window.location.href = "/auth/login";
      }
    } else {
      const res: any = await client.user.getUser.query(token);
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
      } else {
        navigate("/auth/login");
        toast.error("Login Expired, please login again");
      }
    }
    setLoadingState(false);
  });

  return (
    <Html lang="en">
      <Head>
        <Title>AuthorsLog - CMS</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <Suspense>
          {loadingState() && (
            <div class="w-screen h-screen fixed grid place-items-center bg-black/25 backdrop-blur-[2px] z-50">
              <div class="w-16 h-16 rounded-full border-4 border-t-white border-white/20 animate-spin" />
            </div>
          )}
          <Toaster position="bottom-right" gutter={8} />
          <ErrorBoundary>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
