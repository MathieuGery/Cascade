import {randomBytes} from 'node:crypto';

export default class Room {
    id: string;

    constructor() {
        this.init();
    }

    private generateRoomId(): string {
        return randomBytes(16).toString('hex');
    }

    private init() {
        this.id = this.generateRoomId();

        console.log('Room ID: ', this.id);
    }
}
