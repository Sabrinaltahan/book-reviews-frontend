import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const nav = useNavigate();
  const token = localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    nav("/login");
  }

  return (
    <div className="navbar">
      <div className="navbarInner">
        <div className="brand">Book Reviews</div>

        <div className="navLinks">
          <Link to="/" className="btn">Home</Link>
          {token ? (
            <button className="btn btnDanger" onClick={logout}>Logout</button>
          ) : (
            <>
              <Link to="/login" className="btn btnPrimary">Login</Link>
              <Link to="/register" className="btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}