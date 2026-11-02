import { useLocation } from "@solidjs/router";
import { Users } from "lucide-solid";

export default function HomeSidebar() {
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
    </div>
  );
}
