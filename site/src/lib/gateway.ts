let ws: WebSocket | undefined;
let retry = 0;
let running = false;

export function connect() {
  running = false;
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  ws = new WebSocket(`${protocol}://${location.host}/gateway`);
}

export function disconnect() {
  running = false;
  ws?.close();
}
