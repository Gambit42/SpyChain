const assetAdded_notificationReducer = (state = false, action) => {
  switch (action.type) {
    case "assetAdded_show":
      return (state = true);
    case "assetAdded_hide":
      return (state = false);
    default:
      return state;
  }
};

export default assetAdded_notificationReducer;
