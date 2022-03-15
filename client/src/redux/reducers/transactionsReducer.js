const transactions_assetReducer = (state = { transactions: [] }, action) => {
  switch (action.type) {
    case "getTransactions_asset":
      return action.payload;
    default:
      return state;
  }
};

export default transactions_assetReducer;
