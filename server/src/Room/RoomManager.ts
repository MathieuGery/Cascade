import {Room} from "./Room.ts";

class RoomManager {
    private rooms: Room[];

    constructor() {
        this.rooms = [];
    }

    public getRoomByName(roomName: string): Room | undefined {
        return this.rooms.find(room => room.data.name === roomName);
    }

    public addRoom(room: Room): void {
        this.rooms.push(room);
    }
}

const roomManager = new RoomManager();

export default roomManager;
