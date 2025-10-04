import Room from './Room/Room.ts';
import WebsocketServer from './Websocket/WebsocketServer.ts';

const room = new Room();
const webSocket = new WebsocketServer();

webSocket.initServer();
