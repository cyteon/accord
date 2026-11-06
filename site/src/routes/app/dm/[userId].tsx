import {
  createAsync,
  useParams,
  useSubmission,
  type RouteDefinition,
} from "@solidjs/router";
import { ArrowUp } from "lucide-solid";
import { createEffect, createSignal, For, on, Show } from "solid-js";
import HomeSidebar from "~/components/HomeSidebar";
import Serverlist from "~/components/ServerList";
import { requireUserQ } from "~/lib/api/auth";
import { getDm, getOlderMessages, sendDm } from "~/lib/api/dms";
import { Message } from "~/lib/types/client/message";

export const route = {
  preload: () => requireUserQ(),
} satisfies RouteDefinition;

export default function UserDM() {
  const sendMessage = useSubmission(sendDm);

  const params = useParams();
  const dm = createAsync(() => getDm(params.userId!));

  const [list, setList] = createSignal<Message[]>([]);
  const [hasMore, setHasMore] = createSignal(true);
  let loading = false;

  createEffect(
    on(dm, (data) => {
      if (!data) return;
      const current = list();

      if (current[0]?.channelId !== data.channel?.id) {
        setList(data.messages);
        setHasMore(data.messages.length === 50);
        return;
      }

      const ids = new Set(current.map((m) => m.id));
      setList([...data.messages, ...current.filter((m) => !ids.has(m.id))]);
    }),
  );

  const onScroll = async (event: Event) => {
    const element = event.currentTarget as HTMLDivElement;
    if (element.scrollHeight - element.clientHeight + element.scrollTop > 200)
      return;

    const oldest = list()[0];
    if (!oldest || !hasMore() || loading) return;

    loading = true;
    try {
      const older = await getOlderMessages(params.userId!, oldest.id);
      setHasMore(older.length === 50);
      setList((prev) => [...older, ...prev]);
    } finally {
      loading = false;
    }
  };

  let formRef!: HTMLFormElement;

  createEffect(
    on(
      () => sendMessage.pending,
      (result) => result && formRef.reset(),
      { defer: true },
    ),
  );

  const doGroup = (i: number) => {
    const messages = list();
    if (!messages || i === 0) return false;

    const prev = messages[i - 1];
    const current = messages[i];

    return (
      prev.author.id === current.author.id &&
      new Date(current.createdAt).getTime() -
        new Date(prev.createdAt).getTime() <
        1000 * 60 * 5
    );
  };

  return (
    <main class="flex p-2.5 gap-2.5 h-screen">
      <Serverlist />
      <HomeSidebar />

      <div class="bg-panel w-full rounded-lg flex flex-col">
        <div class="flex p-4 border-b items-center">
          <span class="bg-accent rounded-xs size-8 mr-4 justify-center items-center flex font-bold text-sm">
            {dm()?.otherUser.displayName[0].toUpperCase()}
          </span>

          <p class="text-fg font-semibold">{dm()?.otherUser.displayName}</p>
        </div>

        <div
          class="p-4 flex flex-col-reverse overflow-y-auto h-full"
          onScroll={onScroll}
        >
          <div class="flex flex-col">
            <For each={list()}>
              {(message, i) => (
                <Show
                  when={!doGroup(i())}
                  fallback={<p class="text-fg pl-12">{message.content}</p>}
                >
                  <div class="flex" classList={{ "mt-2": i() > 0 }}>
                    <span class="bg-accent rounded-xs size-10 mr-2 justify-center items-center flex font-bold">
                      {message.author.displayName[0].toUpperCase()}
                    </span>

                    <div class="flex flex-col">
                      <p class="text-white leading-4.5 font-semibold">
                        {message.author.displayName}
                      </p>
                      <p class="text-fg">{message.content}</p>
                    </div>
                  </div>
                </Show>
              )}
            </For>
          </div>
        </div>

        <form class="p-4 mt-auto" method="post" action={sendDm} ref={formRef}>
          <input type="hidden" name="otherId" value={dm()?.otherUser.id} />

          <div class="bg-accent p-1.5 pl-6 rounded-sm flex border">
            <input
              type="text"
              placeholder={`Message ${dm()?.otherUser.displayName}`}
              class="focus:outline-none w-full"
              id="content"
              name="content"
              autocomplete="off"
            />

            <button
              type="submit"
              class="bg-primary text-primary-fg ml-auto size-10 rounded-xs items-center justify-center flex"
            >
              <ArrowUp class="size-5" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
