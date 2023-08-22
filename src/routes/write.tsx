import Navbar from "~/components/Navbar";
import { unstable_clientOnly } from "solid-start";

const WritePost = unstable_clientOnly(() => import("~/components/WritePost"));

const write = () => {
  return (
    <>
      <Navbar />
      <main class="w-full bg-gray-50 h-max min-h-[calc(100vh-48px)] flex justify-center px-2 py-4">
        {typeof window !== "undefined" && <WritePost />}
      </main>
    </>
  );
};

export default write;
