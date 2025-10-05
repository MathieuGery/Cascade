import {WebSocketServer, WebSocket} from 'ws';
import type HandlerInterface from './Handler/HandlerInterface.ts';
import CreateRoomHandler from './Handler/CreateRoomHandler.ts';
import type ErrorMessage from "./Message/ErrorMessage.ts";
import type SuccessMessage from "./Message/SuccessMessage.ts";
import JoinRoomHandler from "./Handler/JoinRoomHandler.ts";

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
        this.handlers.push(new JoinRoomHandler());
    }

    public initServer(): void {
        console.log('WebSocket server started on port 8080');

        this.registerMessages();

        this.wss.on('connection', (ws) => {
            ws.on('error', console.error);

            ws.on('message', (message) => this.processMessage(message, ws));
        });
    }

    private processMessage(message, ws: WebSocket): void {
        let parsedMessage = null;

        try {
            parsedMessage = JSON.parse(message.toString());
        } catch (e) {
            console.error('Error parsing message:', e);

            return;
        }

        if (!parsedMessage.messageType || !parsedMessage.payload) {
            console.log('Invalid message format');

            return;
        }

        const messageType = parsedMessage.messageType;
        const handler = this.handlers.find(h => h.messageType === messageType);

        if (handler) {
            try {
                handler.handle(parsedMessage.payload, ws, this.wss);

                console.log('Handled successfully message of type : ' + messageType);

                this.sendSuccessMessage(ws, 'Handled successfully message of type : ' + messageType);
            } catch (e: Error) {
                console.error('Error while handling message of type : ' + messageType);
                console.error(e.message);

                this.sendErrorMessage(ws, e.message);
            }
        } else {
            console.log(`No handler found for message type: ${messageType}`);
        }
    }

    private sendErrorMessage(ws: WebSocket, error: string): void {
        const errorMessage: ErrorMessage = {
            messageType: 'error',
            payload: {
                error,
            }
        };

        ws.send(JSON.stringify(errorMessage));
    }

    private sendSuccessMessage(ws: WebSocket, message: string): void {
        const successMessage: SuccessMessage = {
            messageType: 'success',
            payload: {
                message,
            }
        };

        ws.send(JSON.stringify(successMessage));
    }

}
