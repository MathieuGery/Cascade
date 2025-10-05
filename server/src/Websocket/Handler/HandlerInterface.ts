import {WebSocket, WebSocketServer} from 'ws';

export default interface HandlerInterface {
    messageType: string;

    handle: (payload: object, ws: WebSocket, wss: WebSocketServer) => void;
}
