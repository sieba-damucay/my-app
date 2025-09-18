import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { FaQrcode } from "react-icons/fa";
import { assets } from "../Assets/logo"; 

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      if (res.data.user.role === "admin") navigate("/admin-dashboard");
      else navigate("/scanner");
    } catch {
      setMsg("Invalid credentials");
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center vh-100"
      style={{
        position: "relative",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#fff",
        padding: "1rem",
        backgroundImage: `url(${assets.background_logo})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(128,0,0,0.7)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "380px",
          textAlign: "center",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <FaQrcode
          size={60}
          style={{
            marginBottom: "1rem",
            color: "#fff",
            animation: "bounce 1.5s infinite",
          }}
        />
        <h1 className="mt-2 fw-bold" style={{ letterSpacing: "1px" }}>
          QR Attendance
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#ffd6d6",
            marginBottom: "1.5rem",
          }}
        >
          Please make sure your credentials are correct and your account is active.
          Check twice to avoid login issues.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            marginBottom: "1rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            fontWeight: "500",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            marginBottom: "1rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            fontWeight: "500",
          }}
        />

        {msg && (
          <p className="mb-2" style={{ color: "#ffcccc", fontWeight: "500" }}>
            {msg}
          </p>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            border: "none",
            backgroundColor: "#fff",
            color: "#800000",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#ffe6e6";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#fff";
            e.target.style.transform = "translateY(0)";
          }}
        >
          Login
        </button>
      </div>


      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-10px);}
          60% {transform: translateY(-5px);}
        }
      `}</style>

      
    </div>
  );
}

export default Login;
