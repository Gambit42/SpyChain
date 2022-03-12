const userReducer = (state = {}, action) => {
  switch (action.type) {
    case "getUser":
      return action.payload;
    default:
      return state;
  }
};

export default userReducer;
