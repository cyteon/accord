import { useLocation } from "@solidjs/router";
import { requireUserQ } from "~/lib/api/auth";
import AdminComponent from "./AdminComponent";
import { DatabaseCog, Home, Plus } from "lucide-solid";

export default function Serverlist() {
  const location = useLocation();

  return (
    <aside class="flex flex-col gap-2">
      <a
        href="/app"
        class={`size-14 rounded-sm flex ${location.pathname === "/app" ? "bg-primary text-primary-fg" : "bg-card text-fg"}`}
      >
        <Home class="m-auto size-6" />
      </a>

      <AdminComponent>
        <a
          href="/admin"
          class="size-14 rounded-sm flex border border-amber-200/50! border-dashed text-amber-200/75"
        >
          <DatabaseCog class="m-auto size-6" />
        </a>
      </AdminComponent>

      <hr class="m-2 border" />

      <button class="size-14 rounded-sm flex border border-dashed text-muted-fg">
        <Plus class="m-auto size-6" />
      </button>
    </aside>
  );
}
