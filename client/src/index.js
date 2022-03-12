import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import store, { Persistor } from "./redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

ReactDOM.render(
  <Provider store={store}>
    <PersistGate persistor={Persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById("root")
);
