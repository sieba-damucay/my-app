import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaRegListAlt,
  FaChalkboardTeacher,
  FaQrcode,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

const TeacherLayout = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const teacherName = storedUser.name || "Teacher";
  const teacherRole = storedUser.role || "teacher";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === `/teacher${path}`;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      <aside
        style={{
          width: sidebarOpen ? "250px" : "60px",
          background: "#800000",
          color: "#fff",
          padding: "2rem 1rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "width 0.3s ease",
          boxShadow: "2px 0 12px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <div
            style={{
              textAlign: sidebarOpen ? "center" : "left",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarOpen ? "center" : "flex-start",
              gap: sidebarOpen ? "0" : "0.5rem",
            }}
          >
            {sidebarOpen && (
              <div>
                <p style={{ margin: 0, fontWeight: "bold" }}>{teacherName}</p>
                <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>{teacherRole}</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "1.2rem",
                cursor: "pointer",
                marginLeft: sidebarOpen ? "auto" : "0",
              }}
            >
              <FaBars />
            </button>
          </div>

         <nav style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { to: "", label: "Dashboard", icon: <FaTachometerAlt /> },
              { to: "attendance-report", label: "Attendance", icon: <FaRegListAlt /> },
              { to: "my-students", label: "My Students", icon: <FaChalkboardTeacher /> },
              { to: "generate-qr", label: "Generate QR", icon: <FaQrcode /> },
              { to: "notification", label: "Notifications", icon: <FaBell /> },
              { to: "profile", label: "My Profile", icon: <FaUserCircle /> },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to === "" ? "" : item.to}
                style={{
                  ...linkStyle,
                  ...(isActive("/" + item.to) && activeLinkStyle),
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  padding: sidebarOpen ? "0.8rem 1rem" : "0.8rem 0",
                }}
              >
                <span style={{ display: "inline-flex", minWidth: "20px", justifyContent: "center" }}>
                  {item.icon}
                </span>
                {sidebarOpen && <span style={{ marginLeft: "0.5rem" }}>{item.label}</span>}
              </Link>
            ))}
          </nav>

        </div>

        {/* <button style={logoutButtonStyle} onClick={handleLogout}>
          <FaSignOutAlt style={{ marginRight: sidebarOpen ? "0.5rem" : "0" }} />
          {sidebarOpen && "Logout"}
        </button> */}
      </aside>

      <main style={{ flex: 1, padding: "2rem", background: "#f1f5f9" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
            minHeight: "80vh",
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;












const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  padding: "0.8rem 1rem",
  borderRadius: "8px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  transition: "all 0.3s ease",
};
const activeLinkStyle = {
  background: "rgba(255,255,255,0.2)",
};
const logoutButtonStyle = {
  background: "#660000",
  border: "none",
  padding: "0.8rem",
  color: "#fff",
  cursor: "pointer",
  borderRadius: "8px",
  fontWeight: "bold",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.3s ease",
};
