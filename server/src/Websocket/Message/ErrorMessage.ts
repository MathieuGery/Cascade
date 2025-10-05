type ErrorMessage = {
    messageType: 'error';
    payload: {
        error: string;
    };
};

export default ErrorMessage;
