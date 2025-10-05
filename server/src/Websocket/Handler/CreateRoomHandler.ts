import type HandlerInterface from "./HandlerInterface.ts";
import {Room} from "../../Room/Room.ts";
import {WebSocket, WebSocketServer} from 'ws';
import cache from '../../Utils/cache.ts';

type CreateRoomPayload = {
    roomName: string;
}

export default class CreateRoomHandler implements HandlerInterface {
    messageType: string = 'create_room';

    handle(payload: CreateRoomPayload, ws: WebSocket, wss: WebSocketServer): void {
        if (cache.has('room-'+payload.roomName)) {
            throw new Error('Room ' + payload.roomName + ' already exists');
        }

        ws.addListener('join_room_'+payload.roomName, (data) => {
            ws.send(JSON.stringify({
                messageType: 'join_room',
                payload: data,
            }));
        });

        console.log('CreateRoomHandler received payload:', payload);

        const room = new Room(payload.roomName);
        room.save();
    }
}
