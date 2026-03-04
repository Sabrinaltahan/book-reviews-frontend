import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const nav = useNavigate();
  const token = localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    nav("/login");
  }

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 20px",
      borderBottom: "1px solid #ddd",
      marginBottom: "20px"
    }}>
      <div>
        <Link to="/" style={{ marginRight: 10 }}>Home</Link>
      </div>

      <div>
        {!token && (
          <>
            <Link to="/login" style={{ marginRight: 10 }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {token && (
          <button onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}