export default interface HandlerInterface {
    messageType: string;

    handle: (payload: object) => void;
}
