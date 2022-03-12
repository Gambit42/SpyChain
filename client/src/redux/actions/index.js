export const login = () => {
  return {
    type: "login",
  };
};

export const logout = () => {
  return {
    type: "logout",
  };
};

export const changeCurrency = (currency) => {
  return {
    type: "changeCurrency",
    payload: currency,
  };
};

export const getUser = (user) => {
  return {
    type: "getUser",
    payload: user,
  };
};

export const changeActive = (portfolio) => {
  return {
    type: "changeActive",
    payload: portfolio,
  };
};

export const updatePortfolios = (portfolio) => {
  return {
    type: "updatePortfolios",
    payload: portfolio,
  };
};

export const showNotification = (notification) => {
  return {
    type: "showNotification",
    payload: notification,
  };
};

export const hideNotification = () => {
  return {
    type: "hideNotification",
  };
};

export const assetAdded_show = () => {
  return {
    type: "assetAdded_show",
  };
};

export const assetAdded_hide = () => {
  return {
    type: "assetAdded_hide",
  };
};
export const assetDeleted_show = () => {
  return {
    type: "assetDeleted_show",
  };
};

export const assetDeleted_hide = () => {
  return {
    type: "assetDeleted_hide",
  };
};
