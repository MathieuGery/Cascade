import HandlerInterface from "./HandlerInterface.ts";

export default class CreateRoomHandler implements HandlerInterface {
    messageType: string = 'create_room';

    handle(): void {
        console.log('CreateRoomMessage handled');


    }
}
