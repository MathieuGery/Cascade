import cache from '../Utils/cache.ts';
import type Player from "./Player";

type RoomState = 'waiting' | 'in-game' | 'finished';

export type RoomType = {
    name: string;
    players: Player[];
    state: RoomState;
}

export class Room {
    data: RoomType;

    constructor(name: string, players: string[] = [], state: RoomState = 'waiting') {
        this.data = {
            name,
            players,
            state,
        };
    }

    public save() {
        cache.set('room-'+this.data.name, this.data);
        console.log('Room saved: ', this.data);

        const data = cache.get('room-'+this.data.name);

        console.log('data : ' + JSON.stringify(data));
    }
}
