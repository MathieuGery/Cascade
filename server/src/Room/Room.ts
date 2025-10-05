import type Player from "./Player";
import {WebSocket} from "ws";

type RoomState = 'waiting' | 'in-game' | 'finished';

export type RoomType = {
    name: string;
    players: Player[];
    state: RoomState;
    host: WebSocket;
}

export class Room {
    data: RoomType;

    constructor(name: string, host: WebSocket, players: Player[] = [], state: RoomState = 'waiting') {
        this.data = {
            name,
            players,
            state,
            host
        };
    }

    public addPlayer(player: Player): void {
        this.data.players.push(player);
    }
}
