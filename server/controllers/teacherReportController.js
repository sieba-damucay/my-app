import db from "../config/database.js";

const getStatus = (time_in) => {
  if (!time_in) return "Absent";
  const [h, m] = time_in.split(":").map(Number);
  if (h < 7) return "Present";
  if (h === 7 && m <= 15) return "Late";
  return "Absent";
};

const isWithinSchoolHours = () => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 7 && hour <= 17; 
};

// Get all students for this teacher
const getStudents = (req, res) => {
  const teacherId = req.query.teacher_id;
  const query = `SELECT * FROM users WHERE role='student' AND teacher_id=?`;

  db.query(query, [teacherId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

const getAttendanceReport = (req, res) => {
  const { type = "daily", teacher_id } = req.query;
  let startDate, endDate;
  const today = new Date().toISOString().split("T")[0];
  endDate = today;

  if (type === "daily") startDate = today;
  else if (type === "week")
    startDate = new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0];
  else if (type === "month")
    startDate = new Date(new Date().setDate(1)).toISOString().split("T")[0];

  const query = `
    SELECT u.user_id, u.name, u.email, a.attendance_id, a.date_scanned, a.status
    FROM users u
    LEFT JOIN attendance a
      ON u.user_id = a.user_id
      AND DATE(a.date_scanned) BETWEEN ? AND ?
    WHERE u.role='student' AND u.teacher_id=?
    ORDER BY u.name, a.date_scanned
  `;

  db.query(query, [startDate, endDate, teacher_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const withinHours = isWithinSchoolHours();
    const studentsMap = {};

    rows.forEach((r) => {
      let status = r.status || "Absent";

      // If it's after 5 PM, hide "Absent" and "Late" counts → mark as "N/A"
      if (!withinHours && (status === "Absent" || status === "Late")) {
        status = "N/A";
      }

      studentsMap[r.user_id] = {
        ...r,
        status,
      };
    });

    res.json(Object.values(studentsMap));
  });
};

const updateAttendance = (req, res) => {
  const { attendance_id } = req.params;
  const { status } = req.body;

  const query = `UPDATE attendance SET status=? WHERE attendance_id=?`;
  db.query(query, [status, attendance_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Attendance not found" });

    res.json({ message: "Attendance updated successfully" });
  });
};

const deleteAttendance = (req, res) => {
  const { attendance_id } = req.params;

  const query = `DELETE FROM attendance WHERE attendance_id=?`;
  db.query(query, [attendance_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Attendance not found" });

    res.json({ message: "Attendance deleted successfully" });
  });
};

export default {
  getStudents,
  getAttendanceReport,
  updateAttendance,
  deleteAttendance,
  getStatus,
};
