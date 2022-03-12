const notificationReducer = (
  state = { active: false, message: "" },
  action
) => {
  switch (action.type) {
    case "showNotification":
      return action.payload;
    case "hideNotification":
      return (state = { active: false, message: "" });
    default:
      return state;
  }
};

export default notificationReducer;
