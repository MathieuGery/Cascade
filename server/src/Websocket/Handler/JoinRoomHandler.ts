import type HandlerInterface from "./HandlerInterface.ts";
import {Room, type RoomType} from "../../Room/Room.ts";
import {WebSocket, WebSocketServer} from 'ws';
import cache from '../../Utils/cache.ts';

type JoinRoomPayload = {
    roomName: string;
    playerName: string;
}

export default class JoinRoomHandler implements HandlerInterface {
    messageType: string = 'join_room';

    handle(payload: JoinRoomPayload, ws: WebSocket, wss: WebSocketServer): void {
        const roomData = cache.get('room-'+payload.roomName) as RoomType;

        if (!roomData) {
            throw new Error('Room ' + payload.roomName + ' does not exist');
        }

        if (roomData.state !== 'waiting') {
            throw new Error('Room ' + payload.roomName + ' is not in waiting state');
        }

        if (roomData.players.find(p => p.name === payload.playerName)) {
            throw new Error('Player ' + payload.playerName + ' already in room ' + payload.roomName);
        }

        console.log('JoinRoomHandler received payload:', payload);
        roomData.players.push({name: payload.playerName});

        const room = new Room(payload.roomName, roomData.players, roomData.state);

        wss.clients.forEach((client: WebSocket) => {
            client.emit('join_room_'+payload.roomName, payload);
        });

        ws.addListener('join_room_'+payload.roomName, (data) => {
            ws.send(JSON.stringify({
                messageType: 'join_room',
                payload: data,
            }));
        });

        room.save();
    }
}
