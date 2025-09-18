import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { FaBell } from "react-icons/fa";

function TeacherNotifications({ teacherId }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get(`/notifications/${teacherId}`);
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, [teacherId]);

  return (
    <div className="container mt-4 d-flex justify-content-center">
      <div
        className="card p-4"
        style={{
          width: "100%",
          maxWidth: "600px",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          className="mb-4 d-flex align-items-center gap-2"
          style={{ color: "#800000" }}
        >
          <FaBell />
          Notifications
        </h2>

        {notifications.length === 0 ? (
          <p className="text-muted text-center">No notifications yet</p>
        ) : (
          <ul className="list-group">
            {notifications.map((n) => (
              <li
                key={n.notification_id}
                className={`list-group-item mb-2 p-3 ${
                  n.is_read ? "" : "fw-bold"
                }`}
                style={{
                  backgroundColor: n.is_read ? "#fff" : "#ffe6e6",
                  borderLeft: `5px solid ${n.is_read ? "#ccc" : "#800000"}`,
                  borderRadius: "0.25rem",
                }}
              >
                <div>
                  <strong style={{ color: "#800000" }}>
                    {n.type === "late_absent" ? "Late/Absent" : "Perfect Attendance"}
                  </strong>
                  <p className="mb-1">{n.message}</p>
                  <small className="text-muted">
                    {new Date(n.date_created).toLocaleString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TeacherNotifications;
