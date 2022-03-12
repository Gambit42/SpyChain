import { useState, useEffect } from "react";
import "./styles/tailwind.css";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Error from "./pages/Error";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import Transactions from "./pages/Transactions";
import Loading from "./pages/Loading";
import { useDispatch } from "react-redux";
import { getUser, changeActive } from "./redux/actions";

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const config = {
      method: ["GET"],
      header: {
        "Content-Type": "application/json",
      },

      withCredentials: true,
    };
    axios
      .get("https://spy-chain.herokuapp.com/session/ongoing", config)
      .then((res) => {
        if (res.data.isAuth) {
          console.log(res.data);
          axios
            .get("https://spy-chain.herokuapp.com/user", config)
            .then((res) => {
              console.log(res.data);
              dispatch(getUser(res.data.user));
              if (res.data.user.portfolios.length === 1) {
                dispatch(changeActive(res.data.user.portfolios[0]));
              }
            });
          setIsLogged(true);
        }
        setLoading(false);
      });
  }, [isLogged]);

  return (
    <Router>
      {!loading ? (
        <Routes>
          <Route element={<PrivateRoute isLogged={isLogged} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transact" element={<Transactions />} />
          </Route>
          <Route element={<PublicRoute isLogged={isLogged} />}>
            <Route
              path="/login"
              element={<Login setIsLogged={setIsLogged} />}
            />
            <Route
              path="/register"
              element={<Register setIsLogged={setIsLogged} />}
            />
          </Route>
          <Route path="*" element={<Error />} />
        </Routes>
      ) : (
        <Loading />
      )}

      {/* <Routes>    
        <Route element={<PrivateRoute isLogged={isLogged} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transact" element={<Transactions />} />
        </Route>
        <Route element={<PublicRoute isLogged={isLogged} />}>
          <Route path="/login" element={<Login setIsLogged={setIsLogged} />} />
        </Route>
        <Route path="*" element={<Error />} />
      </Routes> */}
    </Router>
  );
}

export default App;
