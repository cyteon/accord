import {
  createAsync,
  RouteDefinition,
  RouteSectionProps,
} from "@solidjs/router";
import { createEffect, onCleanup } from "solid-js";
import { requireUserQ } from "~/lib/api/auth";
import { connect, disconnect } from "~/lib/gateway";

export const route = {
  preload: () => requireUserQ(),
} satisfies RouteDefinition;

export default function AppLayout(props: RouteSectionProps) {
  const user = createAsync(() => requireUserQ());

  createEffect(() => {
    if (!user()) return;

    connect();
    onCleanup(disconnect);
  });

  return <>{props.children}</>;
}
