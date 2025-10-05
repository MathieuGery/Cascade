import type HandlerInterface from "./HandlerInterface.ts";
import {Room} from "../../Room/Room.ts";
import {WebSocket} from 'ws';
import roomManager from "../../Room/RoomManager.ts";
import type CreateRoomMessage from "../Message/CreateRoomMessage.ts";

export default class CreateRoomHandler implements HandlerInterface {
    messageType: string = 'create_room';

    handle(message: CreateRoomMessage, ws: WebSocket): void {
        let room = roomManager.getRoomByName(message.payload.roomName);

        if (room !== undefined) {
            throw new Error('Room ' + message.payload.roomName + ' already exists');
        }

        console.log('CreateRoomHandler received message:', message.payload);

        room = new Room(message.payload.roomName, ws);

        roomManager.addRoom(room);
    }
}
