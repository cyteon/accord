import { createAsync, useLocation } from "@solidjs/router";
import { Users } from "lucide-solid";
import { For } from "solid-js";
import { getDmList } from "~/lib/api/dms";

export default function HomeSidebar() {
  const dmList = createAsync(() => getDmList());
  const location = useLocation();

  return (
    <div class="bg-card w-62 rounded-lg p-2 flex flex-col">
      <div>
        <a
          href="/app"
          class={`flex gap-3 px-3 h-9.5 items-center rounded-sm ${location.pathname === "/app" && "bg-accent"} hover:bg-panel`}
        >
          <Users class="size-5 my-auto" /> Friends
        </a>
      </div>

      <div class="mt-2 gap-2 flex flex-col">
        <p class="text-muted-fg px-2 text-sm font-semibold">Messages</p>

        <For each={dmList()}>
          {(dm) => (
            <a
              href={`/app/dm/${dm.otherUser.id}`}
              class={`flex gap-3 p-2 items-center rounded-sm ${location.pathname === `/app/dm/${dm.otherUser.id}` && "bg-panel"} hover:bg-panel`}
            >
              <span class="bg-accent rounded-xs size-8 text-sm justify-center items-center flex font-bold">
                {dm.otherUser.displayName[0].toUpperCase()}
              </span>

              <div class="text-sm w-32">
                <p class="text-fg font-semibold truncate">
                  {dm.otherUser.displayName}
                </p>
                <p class="text-fg text-xs truncate">
                  {dm.lastMessage.isMine && "You:"} {dm.lastMessage?.content}
                </p>
              </div>
            </a>
          )}
        </For>
      </div>
    </div>
  );
}
