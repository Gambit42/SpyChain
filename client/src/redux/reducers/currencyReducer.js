const currencyReducer = (state = { sign: "$", symbol: "USD" }, action) => {
  switch (action.type) {
    case "changeCurrency":
      return action.payload;
    default:
      return state;
  }
};

export default currencyReducer;
