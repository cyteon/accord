import { createAsync, type RouteDefinition } from "@solidjs/router";
import HomeSidebar from "~/components/HomeSidebar";
import Serverlist from "~/components/ServerList";
import { requireUserQ } from "~/lib/api/auth";

export const route = {
  preload: () => requireUserQ(),
} satisfies RouteDefinition;

export default function App() {
  const user = createAsync(() => requireUserQ(), { deferStream: true });

  return (
    <main class="flex p-2.5 gap-2.5 h-screen">
      <Serverlist />
      <HomeSidebar />
    </main>
  );
}
