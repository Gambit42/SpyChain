import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = ({ isLogged }) => {
  return isLogged ? <Navigate to="/" /> : <Outlet />;
};

export default PublicRoute;
