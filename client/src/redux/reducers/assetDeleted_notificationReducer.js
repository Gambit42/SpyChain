const assetDeleted_notificationReducer = (state = false, action) => {
  switch (action.type) {
    case "assetDeleted_show":
      return (state = true);
    case "assetDeleted_hide":
      return (state = false);
    default:
      return state;
  }
};

export default assetDeleted_notificationReducer;
