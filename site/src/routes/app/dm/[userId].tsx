import {
  createAsync,
  useParams,
  useSubmission,
  type RouteDefinition,
} from "@solidjs/router";
import { ArrowUp } from "lucide-solid";
import { createEffect, createSignal, on } from "solid-js";
import HomeSidebar from "~/components/HomeSidebar";
import Serverlist from "~/components/ServerList";
import { requireUserQ } from "~/lib/api/auth";
import { getDm, sendDm } from "~/lib/api/dms";

export const route = {
  preload: () => requireUserQ(),
} satisfies RouteDefinition;

export default function UserDM() {
  const user = createAsync(() => requireUserQ(), { deferStream: true });
  const sendMessage = useSubmission(sendDm);

  const params = useParams();
  const dm = createAsync(() => getDm(params.userId!));

  let formRef!: HTMLFormElement;

  createEffect(
    on(
      () => sendMessage.result,
      (result) => result && formRef.reset(),
      { defer: true },
    ),
  );

  return (
    <main class="flex p-2.5 gap-2.5 h-screen">
      <Serverlist />
      <HomeSidebar />

      <div class="bg-panel w-full rounded-lg flex flex-col">
        <div class="flex p-4 border-b items-center">
          <span class="bg-accent rounded-xs size-8 my-auto mr-4 justify-center items-center flex font-bold">
            {dm()?.otherUser.displayName[0].toUpperCase()}
          </span>

          <p class="text-fg font-semibold">{dm()?.otherUser.displayName}</p>
        </div>

        <div class="p-4">messages</div>

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
