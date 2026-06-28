import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const session = localStorage.getItem("ferroelectricos_session");
  return session ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
