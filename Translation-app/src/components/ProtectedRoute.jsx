import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("loggedIn"); // later change to token/session
  return isLoggedIn ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
