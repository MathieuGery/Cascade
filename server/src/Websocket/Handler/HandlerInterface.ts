interface HandlerInterface {
    messageType: string;

    handle: (payload: object) => void;
}

export default HandlerInterface;
