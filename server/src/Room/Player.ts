import {WebSocket} from "ws";

export default type Player = {
    playerName: string;
    ws: WebSocket
}
