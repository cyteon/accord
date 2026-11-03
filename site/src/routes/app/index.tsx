import { createAsync, type RouteDefinition } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import HomeSidebar from "~/components/HomeSidebar";
import Serverlist from "~/components/ServerList";
import { requireUserQ } from "~/lib/api/auth";
import { sendFriendRequest } from "~/lib/api/friends";

export const route = {
  preload: () => requireUserQ(),
} satisfies RouteDefinition;

export default function App() {
  const user = createAsync(() => requireUserQ(), { deferStream: true });

  const [tab, setTab] = createSignal<"online" | "all" | "pending" | "add">(
    "online",
  );

  const [addFriendUsername, setAddFriendUsername] = createSignal("");
  const [addFriendError, setAddFriendError] = createSignal("");
  const [addFriendSuccess, setAddFriendSuccess] = createSignal("");

  async function handleAddFriend() {
    setAddFriendError("");
    setAddFriendSuccess("");

    if (!addFriendUsername()) {
      setAddFriendError("Enter a username");
      return;
    }

    try {
      const message = await sendFriendRequest(addFriendUsername());
      setAddFriendSuccess(message);
    } catch (e: any) {
      setAddFriendError(e.message || "An error occurred");
    }
  }

  return (
    <main class="flex p-2.5 gap-2.5 h-screen">
      <Serverlist />
      <HomeSidebar />

      <div class="bg-panel w-full rounded-lg p-4 pl-7">
        <div class="flex items-center gap-4 h-10">
          <h2 class="text-xl font-bold leading-none">Friends</h2>

          <div class="flex bg-card p-1 gap-1 rounded-xl">
            <button
              class={`h-8 px-3.5 rounded-sm ${tab() === "online" ? "bg-accent" : "text-muted-fg hover:text-fg"}`}
              onClick={() => setTab("online")}
            >
              Online
            </button>

            <button
              class={`h-8 px-3.5 rounded-sm ${tab() === "all" ? "bg-accent" : "text-muted-fg hover:text-fg"}`}
              onClick={() => setTab("all")}
            >
              All
            </button>

            <button
              class={`h-8 px-3.5 rounded-sm ${tab() === "pending" ? "bg-accent" : "text-muted-fg hover:text-fg"}`}
              onClick={() => setTab("pending")}
            >
              Pending
            </button>
          </div>

          <button
            class={`ml-auto rounded-sm font-semibold text-sm p-2 px-4 ${tab() === "add" ? "bg-primary-tint text-primary" : "bg-primary text-primary-fg"}`}
            onClick={() => setTab("add")}
          >
            Add friend
          </button>
        </div>

        <Show when={tab() === "add"}>
          <div class="mt-4 w-full md:w-1/3 lg:w-2/3">
            <h3 class="text-lg font-semibold mb-2">Add a friend</h3>

            <p class="text-sm text-muted-fg mb-2">
              Send someone a friend request using their username (not display
              name)
            </p>

            <div class="flex w-full bg-bg rounded-md border-2">
              <p class="text-muted-fg ml-4 text-lg my-auto">@</p>

              <input
                type="text"
                placeholder="Enter username"
                value={addFriendUsername()}
                onInput={(e) => setAddFriendUsername(e.currentTarget.value)}
                class="p-3 focus:outline-none w-full"
              />

              <button
                onClick={handleAddFriend}
                disabled={!addFriendUsername()}
                class="bg-primary text-primary-fg font-semibold rounded-sm w-36 m-1 text-sm disabled:bg-card disabled:text-muted-fg"
              >
                Send request
              </button>
            </div>

            <Show when={addFriendError()}>
              <p class="text-sm text-red-400 mt-2">{addFriendError()}</p>
            </Show>

            <Show when={addFriendSuccess()}>
              <p class="text-sm text-green-400 mt-2">{addFriendSuccess()}</p>
            </Show>
          </div>
        </Show>
      </div>
    </main>
  );
}
