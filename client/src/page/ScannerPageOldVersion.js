import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { FaCamera, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import api from "../api/axiosConfig";
import { assets } from "../Assets/logo";

function ScannerPage() {
  const [result, setResult] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });

  const handleScan = async (data) => {
    if (!data) return;

    let text = "";
    if (Array.isArray(data)) text = data[0]?.rawValue || "";
    else if (typeof data === "object") text = data.rawValue || "";
    else text = String(data);

    if (!text) {
      setMsg({ text: "Invalid QR Code", type: "error" });
      return;
    }

    setResult(text);

    try {
      let payload = {};
      try {
        const parsed = JSON.parse(text);
        if (parsed.user_id && parsed.username)
          payload = { user_id: parsed.user_id, username: parsed.username };
        else if (parsed.username) payload = { username: parsed.username };
        else throw new Error("Invalid QR format");
      } catch {
        payload = { username: text };
      }

      const token = localStorage.getItem("token");
      const res = await api.post("/attendance", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg({ text: res.data.msg || "Attendance recorded", type: "success" });
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Invalid QR Code";
      setMsg({ text: errorMessage, type: "error" });
    }
  };

  const handleError = () => {
    setMsg({ text: "Camera error. Please allow permissions.", type: "error" });
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center vh-100"
      style={{
        position: "relative",
        backgroundImage: `url(${assets.background_logo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "2rem",
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
          maxWidth: "400px",
        }}
      >
        <h2 className="text-white mb-4 fw-bold d-flex align-items-center justify-content-center">
          <FaCamera className="me-2" /> QR Attendance
        </h2>

        <p className="text-white mb-4 text-center" style={{ fontSize: "0.9rem", opacity: 0.85 }}>
          Please make sure the QR code is clearly visible and properly aligned
          in front of your camera. Hold your device steady for accurate
          scanning.
        </p>

        <div
          style={{
            position: "relative",
            padding: "6px",
            borderRadius: "1rem",
            overflow: "hidden",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: "conic-gradient(maroon, gold, maroon, gold, maroon)", // custom rotating colors
              animation: "spin 3s linear infinite",
              zIndex: 0,
            }}
          ></div>

          <div
            style={{
              position: "relative",
              borderRadius: "1rem",
              overflow: "hidden",
              background: "#000",
              zIndex: 1,
            }}
          >
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{ facingMode: "environment" }}
              styles={{ width: "100%" }}
            />
          </div>
        </div>

        <div className="text-center">
          <p className="fw-bold text-white">{result || ""}</p>

          {msg.text && (
            <p className="fw-bold mt-2 d-flex justify-content-center align-items-center gap-2">
              {msg.type === "success" && (
                <span className="text-success d-flex align-items-center">
                  <FaCheckCircle /> {msg.text}
                </span>
              )}
              {msg.type === "error" && (
                <span className="text-danger d-flex align-items-center">
                  <FaTimesCircle /> {msg.text}
                </span>
              )}
            </p>
          )}
        </div>
      </div>






      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>



      
    </div>
  );
}

export default ScannerPage;
