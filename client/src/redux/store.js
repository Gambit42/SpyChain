import { createStore, applyMiddleware } from "redux";
import allReducers from "./reducers";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "persist-store",
  storage,
};

const persistedReducer = persistReducer(persistConfig, allReducers);
const store = createStore(persistedReducer, applyMiddleware());
const Persistor = persistStore(store);

export { Persistor };
export default store;
