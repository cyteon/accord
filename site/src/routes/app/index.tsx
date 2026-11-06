import {
  createAsync,
  useAction,
  useSubmission,
  type RouteDefinition,
} from "@solidjs/router";
import { Check, MessagesCircle, X } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";
import HomeSidebar from "~/components/HomeSidebar";
import Serverlist from "~/components/ServerList";
import { requireUserQ } from "~/lib/api/auth";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  getFriends,
  sendFriendRequest,
} from "~/lib/api/friends";

export default function App() {
  const user = createAsync(() => requireUserQ(), { deferStream: true });
  const friends = createAsync(() => getFriends());

  const [tab, setTab] = createSignal<"online" | "all" | "pending" | "add">(
    "all",
  );

  const [addFriendUsername, setAddFriendUsername] = createSignal("");
  const addFriendSubmission = useSubmission(sendFriendRequest);

  const accept = useAction(acceptFriendRequest);
  const decline = useAction(declineFriendRequest);
  const cancel = useAction(cancelFriendRequest);
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
              <Show when={friends()?.incoming.length}>
                <span class="font-bold text-red ml-2">
                  {friends()?.incoming.length}
                </span>
              </Show>
            </button>
          </div>

          <button
            class={`ml-auto rounded-sm font-semibold text-sm p-2 px-4 ${tab() === "add" ? "bg-primary-tint text-primary" : "bg-primary text-primary-fg"}`}
            onClick={() => setTab("add")}
          >
            Add friend
          </button>
        </div>

        <Show when={tab() === "online"}>
          <div class="flex flex-col w-full mt-4"></div>
        </Show>

        <Show when={tab() === "all"}>
          <div class="flex flex-col w-full mt-4">
            <h3 class="text-sm text-muted-fg font-semibold">
              All friends · {friends()?.friends.length}
            </h3>

            <For each={friends()?.friends}>
              {(friend, i) => (
                <>
                  <div class="flex py-2">
                    <span class="bg-accent rounded-sm w-10 h-10 my-auto mr-4 justify-center items-center flex font-bold">
                      {friend.user.displayName[0].toUpperCase()}
                    </span>

                    <div>
                      <p class="text-fg font-semibold">
                        {friend.user.displayName}
                      </p>

                      <p class="text-sm text-muted-fg">
                        @{friend.user.username}
                      </p>
                    </div>

                    <div class="flex ml-auto">
                      <a
                        href={`/app/dm/${friend.user.id}`}
                        class="bg-bg/50 ml-2 font-semibold flex rounded-sm h-9 px-3.5 my-auto text-sm items-center justify-center"
                      >
                        <MessagesCircle class="size-4 mr-2" />
                        Message
                      </a>
                    </div>
                  </div>

                  <Show when={i() < friends()?.friends.length - 1}>
                    <hr class="border-border/50!" />
                  </Show>
                </>
              )}
            </For>
          </div>
        </Show>

        <Show when={tab() === "pending"}>
          <div class="flex flex-col w-full mt-4">
            <div class="flex flex-col">
              <h3 class="text-sm text-muted-fg font-semibold">
                Incoming · {friends()?.incoming.length}
              </h3>

              <For each={friends()?.incoming}>
                {(request, i) => (
                  <>
                    <div class="flex py-2">
                      <span class="bg-accent rounded-sm w-10 h-10 my-auto mr-4 justify-center items-center flex font-bold">
                        {request.user.displayName[0].toUpperCase()}
                      </span>

                      <div>
                        <p class="text-fg font-semibold">
                          {request.user.displayName}
                        </p>

                        <p class="text-sm text-muted-fg">
                          @{request.user.username}
                        </p>
                      </div>

                      <div class="flex ml-auto">
                        <button
                          class="bg-green text-bg font-semibold flex rounded-sm px-3 h-9 my-auto text-sm items-center"
                          onClick={() => accept(request.user.id)}
                        >
                          <Check class="size-4 mr-2" strokeWidth={3} />
                          Accept
                        </button>

                        <button
                          class="bg-bg/50 ml-2 text-red font-semibold flex rounded-sm size-9 my-auto text-sm items-center justify-center"
                          onClick={() => decline(request.user.id)}
                        >
                          <X class="size-5" strokeWidth={3} />
                        </button>
                      </div>
                    </div>

                    <Show when={i() < friends()?.incoming.length - 1}>
                      <hr class="border-border/50!" />
                    </Show>
                  </>
                )}
              </For>
            </div>

            <div class="flex flex-col mt-4">
              <h3 class="text-sm text-muted-fg font-semibold">
                Sent · {friends()?.outgoing.length}
              </h3>

              <For each={friends()?.outgoing}>
                {(request, i) => (
                  <>
                    <div class="flex py-2">
                      <span class="bg-accent rounded-sm w-10 h-10 my-auto mr-4 justify-center items-center flex font-bold">
                        {request.user.displayName[0].toUpperCase()}
                      </span>

                      <div>
                        <p class="text-fg font-semibold">
                          {request.user.displayName}
                        </p>

                        <p class="text-sm text-muted-fg">
                          @{request.user.username}
                        </p>
                      </div>

                      <div class="flex ml-auto">
                        <button
                          class="bg-accent font-semibold flex rounded-sm px-3 h-9 my-auto text-sm items-center"
                          onClick={() => cancel(request.user.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <Show when={i() < friends()?.outgoing.length - 1}>
                      <hr class="border-border/50!" />
                    </Show>
                  </>
                )}
              </For>
            </div>
          </div>
        </Show>

        <Show when={tab() === "add"}>
          <div class="mt-4 w-full md:w-1/3 lg:w-2/3">
            <h3 class="text-lg font-semibold mb-2">Add a friend</h3>

            <p class="text-sm text-muted-fg mb-2">
              Send someone a friend request using their username (not display
              name)
            </p>

            <form
              action={sendFriendRequest}
              method="post"
              class="flex w-full bg-bg rounded-md border-2"
            >
              <p class="text-muted-fg ml-4 text-lg my-auto">@</p>

              <input
                name="username"
                id="username"
                type="text"
                autocomplete="off"
                placeholder="Enter username"
                value={addFriendUsername()}
                onInput={(e) => setAddFriendUsername(e.currentTarget.value)}
                class="p-3 focus:outline-none w-full"
              />

              <button
                type="submit"
                disabled={!addFriendUsername() || addFriendSubmission.pending}
                class="bg-primary text-primary-fg font-semibold rounded-sm w-36 m-1 text-sm disabled:bg-card disabled:text-muted-fg"
              >
                Send request
              </button>
            </form>

            <Show when={addFriendSubmission.error}>
              <p class="text-sm text-red mt-2">
                {addFriendSubmission.error.message}
              </p>
            </Show>

            <Show when={addFriendSubmission.result}>
              <p class="text-sm text-green mt-2">
                {addFriendSubmission.result}
              </p>
            </Show>
          </div>
        </Show>
      </div>
    </main>
  );
}
