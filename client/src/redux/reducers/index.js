import { combineReducers } from "redux";
import currencyReducer from "./currencyReducer";
import loginReducer from "./loginReducer";
import userReducer from "./userReducer";
import active_portfolioReducer from "./active_portfolioReducer";
import notificationReducer from "./notificationReducer";
import transactions_assetReducer from "./transactionsReducer";

const allReducers = combineReducers({
  currency: currencyReducer,
  // isLoggedIn: loginReducer,
  user: userReducer,
  activePortfolio: active_portfolioReducer,
  notification: notificationReducer,
  transactionsAsset: transactions_assetReducer,
});

export default allReducers;
