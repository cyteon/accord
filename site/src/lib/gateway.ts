import { createSignal } from "solid-js";

const [connected, setConnected] = createSignal(false);
const handlers = new Map<string, Set<(data: any) => void>>();

let ws: WebSocket | undefined;
let retry = 0;

export function onEvent(e: string, fn: (d: any) => void) {
  if (!handlers.has(e)) handlers.set(e, new Set());
  handlers.get(e)!.add(fn);

  return () => handlers.get(e)?.delete(fn);
}

export function connect() {
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  ws = new WebSocket(`${protocol}://${location.host}/gateway`);

  ws.onmessage = (e) => {
    const message = JSON.parse(e.data);

    if (message.e === "READY") {
      setConnected(true);
      retry = 0;
    }

    handlers.get(message.e)?.forEach((handler) => handler(message.d));
  };
}

export function disconnect() {
  setConnected(false);
  ws?.close();
}
