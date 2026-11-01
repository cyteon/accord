import { createAsync } from "@solidjs/router";
import { children, Show } from "solid-js";
import { requireUserQ } from "~/lib/api/auth";

export default function AdminComponent(props: { children: any }) {
  const user = createAsync(() => requireUserQ());

  return <Show when={user()?.admin}>{props.children}</Show>;
}
