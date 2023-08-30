import { A, useLocation } from "@solidjs/router";
import { createSignal, createEffect, onCleanup } from "solid-js";
import { useNavigate } from "solid-start";
import toast from "solid-toast";
import { User, setLoadingState, setUser } from "~/root";
import { client } from "~/utils/client";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation().pathname;
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [curUser, setCurUser] = createSignal<any>();

  createEffect(() => setCurUser(User()));

  createEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdownElement = document.getElementById("dropdown-menu");
      const toggleButton = document.getElementById("toggle-dropdown");

      if (dropdownElement && toggleButton) {
        if (
          !dropdownElement.contains(event.target as Element) &&
          !toggleButton.contains(event.target as Element)
        ) {
          setShowDropdown(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);

    onCleanup(() => {
      document.removeEventListener("click", handleClickOutside);
    });
  });

  return (
    <nav
      class="w-full h-12 flex justify-center bg-white sticky top-0 z-10"
      style={{
        "box-shadow": "0 0 0 1px rgb(0 0 0 / 7%), 0 2px 4px rgb(0 0 0 / 5%)",
      }}
    >
      <main class="w-full max-w-6xl h-full px-2 flex items-center justify-between">
        <h1
          class="font-semibold text-2xl cursor-pointer transition-colors"
          style={{ "font-family": "Signika" }}
          onClick={() => navigate("/")}
        >
          AuthorsLog<span class="text-xs">.com</span>
        </h1>
        <div class="relative">
          <div
            id="toggle-dropdown"
            class="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-2 border-gradient-primary"
            onClick={() => setShowDropdown(!showDropdown())}
          >
            <img
              src={
                curUser()?.profilePhoto ||
                `${import.meta.env.VITE_MAIN_URI}/userNone.webp`
              }
              alt=""
              class="object-cover"
            />
          </div>
          {showDropdown() && (
            <ul
              id="dropdown-menu"
              class="absolute top-[110%] right-0 mt-2 w-60 max-w-[90vw] p-2 bg-white border rounded shadow-lg text-gray-400"
            >
              <A href="/">
                <li
                  class={`px-4 py-2 rounded-md hover:text-black cursor-pointer transition-colors ${
                    location === "/" && "bg-gray-100 text-black"
                  }`}
                >
                  Dashboard
                </li>
              </A>
              <A href="/write">
                <li
                  class={`px-4 py-2 rounded-md hover:text-black cursor-pointer transition-colors ${
                    location === "/write" && "bg-gray-100 text-black"
                  }`}
                >
                  Create Post
                </li>
              </A>
              <A href="/edit/profile">
                <li
                  class={`px-4 py-2 rounded-md hover:text-black cursor-pointer transition-colors ${
                    location === "/edit/profile" && "bg-gray-100 text-black"
                  }`}
                >
                  Edit Profile
                </li>
              </A>
              <hr class="my-2" />
              <A href="/auth/login">
                <li
                  class="px-4 py-2 rounded-md hover:text-black cursor-pointer transition-colors"
                  onclick={() => {
                    localStorage.removeItem("token");
                    setUser(null);
                  }}
                >
                  Log Out (This Device)
                </li>
              </A>
              <li
                class="px-4 py-2 rounded-md hover:text-black cursor-pointer transition-colors"
                onclick={async () => {
                  setLoadingState((prev) => Math.max(1, prev + 1));
                  toast.promise(
                    new Promise(async (resolve, reject) => {
                      try {
                        const res: any =
                          await client.user.logOutAllDevices.query(
                            localStorage.getItem("token") as string
                          );
                        if (res.error) reject("Some error occured");
                        else if (!res.success) reject(res.msg);
                        else resolve(res.msg);
                      } catch {
                        reject("Some error occured");
                      }
                    }),
                    {
                      loading: "Logging out",
                      success: (val) => {
                        localStorage.removeItem("token");
                        setUser(null);
                        navigate("/auth/login");
                        setLoadingState((prev) => prev - 1);
                        return val as string;
                      },
                      error: (val) => {
                        setLoadingState((prev) => prev - 1);
                        return val;
                      },
                    }
                  );
                }}
              >
                Log Out (All Devices)
              </li>
            </ul>
          )}
        </div>
      </main>
    </nav>
  );
};

export default Navbar;
