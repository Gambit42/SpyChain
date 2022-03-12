const portfoliosReducer = (state = [], action) => {
  switch (action.type) {
    case "updatePortfolios":
      return action.payload;
    default:
      return state;
  }
};

export default portfoliosReducer;
