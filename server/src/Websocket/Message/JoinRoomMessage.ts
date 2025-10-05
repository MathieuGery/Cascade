type JoinRoomMessage = {
    messageType: 'join_room';
    payload: {
        roomName: string;
        playerName: string;
    };
};

export default JoinRoomMessage;
