export type WebSocketMessage = {
  messageType: string;
  payload: Record<string, unknown>;
}

export type WebSocketResponseMessage = {
  messageType: "success" | "error";
  payload: object;
};
