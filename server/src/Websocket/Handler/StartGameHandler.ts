import type HandlerInterface from "./HandlerInterface.ts";
import {WebSocket} from 'ws';
import roomManager from "../../Room/RoomManager.ts";
import type StartGameMessage from "../Message/StartGameMessage.ts";

export default class StartGameHandler implements HandlerInterface {
    messageType: string = 'start_game';

    // TODO: check if the user is the room owner
    handle(message: StartGameMessage, ws: WebSocket): void {
        const payload = message.payload;
        let room = roomManager.getRoomByName(payload.roomName);

        if (room === undefined) {
            throw new Error('Room ' + message.payload.roomName + ' does not exist');
        }

        if (room.data.state !== 'waiting') {
            throw new Error('Room ' + payload.roomName + ' is not in waiting state');
        }

        if (room.data.players.length < 2) {
            throw new Error('Not enough players to start the game in room ' + payload.roomName);
        }

        const response = {
            messageType: 'start_game',
            payload: {
                roomName: payload.roomName
            }
        };

        room.data.state = 'in-game';
        room.broadcast(JSON.stringify(response));
    }
}
