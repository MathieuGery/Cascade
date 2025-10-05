type StartGameMessage = {
    messageType: 'start_game';
    payload: {
        roomName: string;
    };
};

export default StartGameMessage;
