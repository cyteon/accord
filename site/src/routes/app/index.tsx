import { type RouteDefinition } from "@solidjs/router";
import { requireUserQ } from "~/lib/api/auth";

export const route = {
  preload: () => requireUserQ(),
} satisfies RouteDefinition;

export default function App() {
  return <>hi</>;
}
