import currencyReducer from "./currencyReducer";
import loginReducer from "./loginReducer";
import userReducer from "./userReducer";
import active_portfolioReducer from "./active_portfolioReducer";
import portfoliosReducer from "./portfoliosReducer";
import assetAdded_notificationReducer from "./assetAdded_notificationReducer";
import assetDeleted_notificationReducer from "./assetDeleted_notificationReducer";
import { combineReducers } from "redux";
import notificationReducer from "./notificationReducer";

const allReducers = combineReducers({
  currency: currencyReducer,
  isLoggedIn: loginReducer,
  user: userReducer,
  activePortfolio: active_portfolioReducer,
  notification: notificationReducer,
  // portfolios: portfoliosReducer,
  assetAdded_notification: assetAdded_notificationReducer,
  assetDeleted_notification: assetDeleted_notificationReducer,
});

export default allReducers;
