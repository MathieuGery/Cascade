export type WebSocketMessage = {
  messageType: string;
  payload: Record<string, unknown>;
}

export type WebSocketResponseMessage = {
  messageType: 'success' | 'error' | 'join_room';
  payload: object | PlayerJoinedRoom;
};

export type PlayerJoinedRoom = {
  roomName: string;
  playerName: string;
}
