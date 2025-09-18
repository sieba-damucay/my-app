import db from "../config/database.js";

const getStatus = (time_in) => {
  if (!time_in) return "Absent";
  const [h, m] = time_in.split(":").map(Number);
  if (h < 7) return "Present";
  if (h === 7 && m <= 15) return "Late";
  return "Absent";
};

// ================== DAILY REPORT ==================
const studentReport = (req, res) => {
  const today = new Date().toISOString().split("T")[0]; // Y-MM-DD

  const query = `
    SELECT u.user_id, u.username, u.name, a.date_scanned
    FROM users u
    LEFT JOIN attendance a
      ON u.user_id = a.user_id
      AND DATE(a.date_scanned) = ?
    WHERE u.role='student'
  `;

  db.query(query, [today], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const report = rows.map((r) => ({
      user_id: r.user_id,
      username: r.username,
      name: r.name,
      date_scanned: r.date_scanned,
      status: getStatus(
        r.date_scanned
          ? new Date(r.date_scanned).toTimeString().slice(0, 5)
          : null
      ),
    }));

    res.json(report);
  });
};

// ================== WEEKLY / MONTHLY SUMMARY ==================
const attendanceReports = (req, res) => {
  const { type } = req.query; 

  let startDate;
  const today = new Date();
  const endDate = today.toISOString().split("T")[0];

  if (type === "week") {
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6); // last 7 days
    startDate = weekAgo.toISOString().split("T")[0];
  } else {
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startDate = firstDayOfMonth.toISOString().split("T")[0];
  }

  const query = `
    SELECT u.user_id, u.username, u.name,
      SUM(CASE WHEN TIME(a.date_scanned) < '07:00:00' THEN 1 ELSE 0 END) AS present_count,
      SUM(CASE WHEN TIME(a.date_scanned) BETWEEN '07:01:00' AND '07:15:00' THEN 1 ELSE 0 END) AS late_count,
      SUM(CASE WHEN TIME(a.date_scanned) > '07:15:00' OR a.date_scanned IS NULL THEN 1 ELSE 0 END) AS absent_count
    FROM users u
    LEFT JOIN attendance a
      ON u.user_id = a.user_id
      AND DATE(a.date_scanned) BETWEEN ? AND ?
    WHERE u.role='student'
    GROUP BY u.user_id
  `;

  db.query(query, [startDate, endDate], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// ================== TEACHERS LIST ==================
const teachersReport = (req, res) => {
  const query = `
    SELECT user_id, name
    FROM users
    WHERE role='teacher'
  `;

  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};


// ======================== Get all students + teachers count ================
const GetAllStudents = (req, res) => {
  const { teacher_id } = req.query; 

  let query = `
    SELECT u.user_id, u.username, u.name, u.grade_level,
           u.section_id, u.teacher_id, u.role,
           s.section_name, st.strand_name
    FROM users u
    LEFT JOIN sections s ON u.section_id = s.section_id
    LEFT JOIN strands st ON s.strand_id = st.strand_id
    WHERE u.role = 'student'
  `;

  if (teacher_id) {
    query += ` AND u.teacher_id = ${db.escape(teacher_id)}`;
  }

  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

export default {
  studentReport,
  attendanceReports,
  teachersReport,
  GetAllStudents,
};
