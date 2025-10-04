const validateRoomName = (name: string) => {
    const alphanumericRegex = /^[a-zA-Z0-9]*$/;
    return alphanumericRegex.test(name);
};
export default validateRoomName;
