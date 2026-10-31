import { type RouteDefinition } from "@solidjs/router";
import { requireUserQ } from "~/lib/server/auth.actions";

export const route = {
  preload: () => requireUserQ(),
} satisfies RouteDefinition;

export default function App() {
  return <>hi</>;
}
