import { Link, useNavigate } from "react-router-dom";
import { assets } from "../Assets/logo";
// Import the icon
import { MdQrCodeScanner } from "react-icons/md";

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  if (user?.role === "admin") return null;

  return (
    <nav
      className="navbar navbar-expand-md px-4 py-2"
      style={{
        backgroundColor: "#800000",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
      }}
    >
      <div className="container-fluid">
        {/* Logo + App Name */}
        <Link
          className="navbar-brand d-flex align-items-center gap-2 text-white fw-bold"
          to="/"
          style={{ fontSize: "1.3rem" }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              overflow: "hidden",
              borderRadius: "50px",
              border: "2px solid rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
              }}
            >
              <img
                src={assets.logo}
                alt="Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scale(1.7)",
                }}
              />
            </div>
          </div>
          <span
            style={{
              letterSpacing: "1px",
              textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            Attendo
          </span>
        </Link>

        {/* Burger button */}
        <button
          className="navbar-toggler bg-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <div className="ms-auto d-flex flex-column flex-md-row align-items-md-center gap-3 mt-3 mt-md-0">
            {/* Scanner link with icon */}
            <Link
              className="text-white text-decoration-none fw-medium d-flex align-items-center gap-2"
              to="/scanner"
              style={{ fontSize: "1rem", transition: "0.3s" }}
            >
              <MdQrCodeScanner size={20} />
              <span>Scanner</span>
            </Link>

            {!user ? (
              <Link
                className="btn btn-light btn-sm"
                to="/login"
                style={{ fontWeight: "600", color: "#800000" }}
              >
                Admin Login
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="btn btn-light btn-sm"
                style={{
                  fontWeight: "600",
                  color: "#800000",
                  border: "1px solid rgba(0,0,0,0.2)",
                }}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
