const active_portfolioReducer = (state = {}, action) => {
  switch (action.type) {
    case "changeActive":
      return action.payload;
    default:
      return state;
  }
};

export default active_portfolioReducer;
