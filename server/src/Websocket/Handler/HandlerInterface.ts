import {WebSocket, WebSocketServer} from 'ws';

export default interface HandlerInterface {
    messageType: string;

    handle: (message: object, ws: WebSocket) => void;
}
