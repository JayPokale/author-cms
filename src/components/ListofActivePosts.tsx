import { A } from "@solidjs/router";
import { For, createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import { format } from "timeago.js";
import { User } from "~/root";
import { setIsActivePosts } from "~/routes";
import { client } from "~/utils/client";

export const [posts, setPosts] = createSignal([]);
const [postsLoading, setPostsLoading] = createSignal(false);

export const loadPosts = async () => {
  setPostsLoading(true);
  const token = localStorage.getItem("token");
  if (token) {
    const data: any = await client.post.getActivePosts.query({
      token,
      start: posts().length,
      end: posts().length + 10,
    });
    setPosts(posts().concat(data?.posts));
  }
  setPostsLoading(false);
};
if (!isServer) loadPosts();

const ListofActivePosts = () => {
  return (
    <aside
      class="max-w-3xl w-full h-max rounded-md p-4 flex flex-col gap-4 bg-white"
      style={{
        "box-shadow": "0 0 0 1px rgb(0 0 0 / 7%), 0 2px 4px rgb(0 0 0 / 5%)",
      }}
    >
      <div class="flex gap-4">
        <button class="py-2 px-12 rounded-md bg-gray-100">Posts</button>
        <button
          class="py-2 px-12 rounded-md text-gray-500 hover:text-black"
          onclick={() => setIsActivePosts(false)}
        >
          Drafts
        </button>
      </div>
      <div class="flex flex-col">
        {User()?.countPosts === 0 ? (
          <div class="flex justify-center text-3xl italic font-semibold py-8 text-gray-400">
            No Posts Yet
          </div>
        ) : posts()?.length !== 0 ? (
          <For each={posts()}>
            {(post: any) => (
              <div class="w-full py-2">
                <A
                  href={`/edit/${post.postId}`}
                  class="w-full p-4 flex justify-between items-center cursor-pointer bg-gray-100/50 hover:bg-gray-100 rounded-md"
                >
                  <h3 class="w-3/4 text-ellipsis line-clamp-1">{post.title}</h3>
                  <div class="flex items-center">
                    <p class="text-sm text-gray-500">
                      {format(post.createdAt)}
                    </p>
                  </div>
                </A>
              </div>
            )}
          </For>
        ) : (
          <div class="grid place-items-center">
            <div class="w-16 h-16 rounded-full border-2 border-t-black/50 border-black/5 animate-spin" />
          </div>
        )}
      </div>
      {User()?.countPosts > posts()?.length && !postsLoading() && (
        <div class="grid place-items-center">
          <button
            class="py-1 px-4 rounded-md text-gray-500 bg-gray-100"
            onclick={loadPosts}
          >
            Load More
          </button>
        </div>
      )}
    </aside>
  );
};

export default ListofActivePosts;
