import { createSignal } from "solid-js";
import BasicStats from "~/components/BasicStats";
import ListofActivePosts from "~/components/ListofActivePosts";
import ListofDraftPosts from "~/components/ListofDraftPosts";
import Navbar from "~/components/Navbar";

export const [isActivePosts, setIsActivePosts] = createSignal(true);

const Home = () => {

  return (
    <>
      <Navbar />
      <main class="w-full bg-gray-50 min-h-[calc(100vh-48px)] flex flex-col md:flex-row md:justify-center gap-4 px-2 py-4">
        <BasicStats />
        {isActivePosts() ? <ListofActivePosts /> : <ListofDraftPosts />}
      </main>
    </>
  );
};

export default Home;
