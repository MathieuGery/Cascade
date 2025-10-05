import type HandlerInterface from "./HandlerInterface.ts";
import {WebSocket} from 'ws';
import roomManager from "../../Room/RoomManager.ts";
import type JoinRoomMessage from "../Message/JoinRoomMessage.ts";

export default class JoinRoomHandler implements HandlerInterface {
    messageType: string = 'join_room';

    handle(message: JoinRoomMessage, ws: WebSocket): void {
        const payload = message.payload;
        const room = roomManager.getRoomByName(payload.roomName);

        if (!room) {
            throw new Error('Room ' + payload.roomName + ' does not exist');
        }

        if (room.data.state !== 'waiting') {
            throw new Error('Room ' + payload.roomName + ' is not in waiting state');
        }

        if (room.data.players.find(p => p.name === payload.playerName)) {
            throw new Error('Player ' + payload.playerName + ' already in room ' + payload.roomName);
        }

        console.log('JoinRoomHandler received payload:', payload);
        const response = {
            messageType: 'join_room',
            payload: {
                roomName: payload.roomName,
                playerName: payload.playerName
            }
        };

        room.data.host.send(JSON.stringify(response));

        room.data.players.forEach(player => {
            player.ws.send(JSON.stringify(response));
        });

        room.addPlayer({name: payload.playerName, ws});

    }
}
