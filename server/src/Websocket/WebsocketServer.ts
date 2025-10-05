import {WebSocketServer} from 'ws';
import type HandlerInterface from './Handler/HandlerInterface.ts';
import CreateRoomHandler from './Handler/CreateRoomHandler.ts';

export default class WebsocketServer {
    wss: WebSocketServer;
    handlers: HandlerInterface[];

    constructor() {
        this.wss = new WebSocketServer({
            port: 8080,
        });

        this.handlers = [];
    }

    private registerMessages(): void {
        this.handlers.push(new CreateRoomHandler());
    }

    public initServer(): void {
        console.log('WebSocket server started on port 8080');

        this.registerMessages();

        this.wss.on('connection', (ws) => {
            ws.on('error', console.error);

            ws.on('message', this.processMessage);
        });
    }

    private processMessage(message): void {
        console.log('received: %s', message);

        const parsedMessage = JSON.parse(message.toString());

        if (!parsedMessage.messageType || !parsedMessage.payload) {
            console.log('Invalid message format');

            return;
        }

        const messageType = parsedMessage.type;
        const handler = this.handlers.find(h => h.messageType === messageType);

        if (handler) {
            handler.handle(payload);
        } else {
            console.log(`No handler found for message type: ${messageType}`);
        }
    }
}
