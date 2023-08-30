import { createEffect, createSignal } from "solid-js";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import "quill/dist/quill.bubble.css";
import ImageResize from "quill-image-resize";
import "./Quill.css";
import uploadImage from "~/utils/uploadImage";
import { client } from "~/utils/client";
import { setLoadingState } from "~/root";
import toast from "solid-toast";
import { useNavigate, useParams } from "solid-start";
import { loadPosts, setPosts } from "./ListofActivePosts";
import { loadDrafts, setDrafts } from "./ListofDraftPosts";
import { loadUserDataAgain } from "~/utils/loadUserDataAgain";

const EditPost = () => {
  const [title, setTitle] = createSignal("");
  let quillContainer: HTMLDivElement | null = null;
  const [quillInstance, setQuillInstance] = createSignal<any>(null);

  const navigate = useNavigate();
  const params = useParams();
  const postId = params.postId;
  let postData: any;

  const fetchEditPost = async () => {
    const token = localStorage.getItem("token") as string;
    postData = await client.post.fetchPostForEdit.query({ token, postId });

    if (postData.error || !postData.success) {
      toast.error("Some Error Occured");
      setLoadingState((prev) => prev - 1);
      navigate("/");
    }

    setTitle(postData.post.title);
    const titleInput = document.getElementById("title");
    if (titleInput) titleInput.innerText = postData.post.title;

    if (quillInstance() && postData.post.content) {
      await quillInstance()?.setContents(JSON.parse(postData.post.content));
    }

    setLoadingState((prev) => prev - 1);
  };

  createEffect(() => {
    try {
      setLoadingState((prev) => Math.max(1, prev + 1));
      fetchEditPost();
    } catch (error) {
      console.log({ error });
    }
  });

  const handleClear = () => {
    setTitle("");
    quillInstance()?.deleteText(0, quillInstance()?.getLength());
  };

  const handleUpdate = (isSaveAsDraft: boolean) => {
    setLoadingState((prev) => Math.max(1, prev + 1));
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          if (!title()) {
            reject("Title is required");
            return;
          }
          const data = JSON.stringify(quillInstance()?.getContents());
          const result: any = await client.post.updatePost.mutate({
            token: localStorage.getItem("token") as string,
            _id: postData.post._id,
            payload: {
              title: title(),
              content: data,
              draft: isSaveAsDraft,
            },
          });
          if (!result.success) {
            reject(result.msg);
            return;
          }
          handleClear();
          navigate("/");
          resolve("Post Updated");
        } catch (error) {
          console.log(error);
          reject("Some error occurred");
        }
      }),
      {
        loading: "Updating Post",
        success: (val) => {
          setLoadingState((prev) => prev - 1);
          setPosts([]);
          setDrafts([]);
          loadPosts();
          loadDrafts();
          loadUserDataAgain();
          return val as string;
        },
        error: (val: string) => {
          setLoadingState((prev) => prev - 1);
          return val;
        },
      }
    );
  };

  createEffect(() => {
    if (!quillInstance()) {
      if (quillContainer) {
        Quill.register("modules/imageResize", ImageResize);

        const quill = new Quill(quillContainer, {
          theme: "snow",
          placeholder: "Let's write an awesome story!",
          modules: {
            toolbar: {
              container: [
                [{ header: 1 }, { header: 2 }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ script: "sub" }, { script: "super" }],
                [{ align: [] }],
                ["blockquote", "code-block"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
                ["clean"],
              ],
            },
            imageResize: {
              modules: ["Resize", "DisplaySize"],
            },
          },
        });

        quill.getModule("toolbar").addHandler("image", async () => {
          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.accept = "image/*";
          fileInput.onchange = async (event) => {
            const inputElement = event.target as HTMLInputElement;
            const files = inputElement.files;
            if (files && files.length > 0) {
              const imageFile = files[0];
              const imageUrl = await uploadImage(imageFile);
              if (imageUrl) {
                const range = quill.getSelection();
                quill.insertEmbed(range?.index || 0, "image", imageUrl, "user");
              }
            }
          };
          fileInput.click();
        });

        setQuillInstance(quill);
      }
    }
  });

  return (
    <main
      class="max-w-3xl w-full px-4 py-8 flex flex-col gap-4 bg-white"
      style={{
        "box-shadow": "0 0 0 1px rgb(0 0 0 / 7%), 0 2px 4px rgb(0 0 0 / 5%)",
      }}
    >
      <div class="w-full flex justify-end gap-2">
        <button
          class="py-1 px-4 rounded-md text-gray-500 bg-gray-100"
          onclick={() => handleUpdate(false)}
        >
          Publish
        </button>
        <button
          class="py-1 px-4 rounded-md text-gray-500 bg-gray-100"
          onclick={() => handleUpdate(true)}
        >
          Save as Draft
        </button>
      </div>
      <div class="w-full" style={{ "font-family": "Raleway, sans-serif" }}>
        <div
          contentEditable={true}
          id="title"
          class={`contentEditable w-full px-4 py-2 text-2xl outline-none border-l ${
            title() ? "border-transparent" : "border-gray-300"
          } focus:border-gray-300 duration-75 group`}
          data-ph="Title"
          onInput={(e) => setTitle((e.target as HTMLElement).innerText)}
        />
      </div>
      <div id="QuillJsContent">
        <div
          ref={(quillElem) => (quillContainer = quillElem)}
          class="cursor-text"
        />
      </div>
    </main>
  );
};

export default EditPost;
