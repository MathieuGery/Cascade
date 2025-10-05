type CreateRoomMessage = {
    messageType: 'create_room';
    payload: {
        roomName: string;
    };
};

export default CreateRoomMessage;
