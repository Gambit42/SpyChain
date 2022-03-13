import { useState, useEffect, lazy, Suspense } from "react";
import "./styles/tailwind.css";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Transactions from "./pages/Transactions";
// import Error from "./pages/Error";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import Loading from "./pages/Loading";
import { useDispatch } from "react-redux";
import { getUser, changeActive } from "./redux/actions";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Error = lazy(() => import("./pages/Error"));

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
            <Route
              path="/"
              element={
                <Suspense fallback={<Loading />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/transact"
              element={
                <Suspense fallback={<Loading />}>
                  <Transactions />
                </Suspense>
              }
            />
          </Route>
          <Route element={<PublicRoute isLogged={isLogged} />}>
            <Route
              path="/login"
              element={
                <Suspense fallback={<Loading />}>
                  <Login setIsLogged={setIsLogged} />
                </Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <Suspense fallback={<Loading />}>
                  <Register setIsLogged={setIsLogged} />
                </Suspense>
              }
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
