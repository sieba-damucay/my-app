import db from "../config/database.js";
import PDFDocument from "pdfkit";




const getStatus = (date_scanned) => {
  if (!date_scanned) return "Absent"; 

  const scanTime = new Date(date_scanned);
  const hours = scanTime.getHours();
  const minutes = scanTime.getMinutes();

  // TIME RULES ===============
  if (hours < 7 || (hours === 7 && minutes === 0)) return "Present";
  if (hours === 7 && minutes <= 15) return "Late";
  if (hours > 7 || (hours === 7 && minutes > 15)) return "Absent";

  return "Absent";
};



const finalizeStatus = (record) => {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(17, 0, 0, 0); 

  if (!record.date_scanned) return "Absent";

  if (now < cutoff) return getStatus(record.date_scanned);

  return getStatus(record.date_scanned);
};

// ================== OLD Record student attendance (scan) ==================
// const studentAttendance = (req, res) => {
//   const { user_id, username } = req.body;
//   if (!user_id) return res.status(400).json({ error: "User ID is required" });

//   const today = new Date().toISOString().slice(0, 10);

//   const sqlCheck =
//     "SELECT * FROM attendance WHERE user_id=? AND DATE(date_scanned)=?";
//   db.query(sqlCheck, [user_id, today], (err, results) => {
//     if (err) return res.status(500).json({ error: err.message });

//     if (results.length > 0) {
//       return res.json({ msg: `Hi ${username}, you have already scanned today.` });
//     }

//     const now = new Date();
//     const hours = now.getHours();
//     const minutes = now.getMinutes();

//     let status = "Absent";

//     if (hours < 7 || (hours === 7 && minutes === 0)) status = "Present";
//     else if (hours === 7 && minutes >= 1 && minutes <= 15) status = "Late";
//     else if (hours === 7 && minutes >= 16) status = "Absent";
//     else if (hours > 7) status = "Absent";

//     const sqlInsert =
//       "INSERT INTO attendance (user_id, date_scanned, status) VALUES (?, NOW(), ?)";
//     db.query(sqlInsert, [user_id, status], (err2) => {
//       if (err2) return res.status(500).json({ error: err2.message });
//       res.json({
//         msg: `Hi ${username}, your attendance has been recorded as "${status}".`,
//       });
//     });
//   });
// };



const studentAttendance = (req, res) => {
  const { user_id, username } = req.body;
  if (!user_id) return res.status(400).json({ error: "User ID is required" });

  const today = new Date().toISOString().slice(0, 10);

  const sqlCheck = "SELECT * FROM attendance WHERE user_id=? AND DATE(date_scanned)=?";
  db.query(sqlCheck, [user_id, today], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const now = new Date();
    const timeNow = now.toTimeString().slice(0, 8); // HH:MM:SS
    const hours = now.getHours();
    const minutes = now.getMinutes();

    let status = "Absent"; 
    if (hours < 7 || (hours === 7 && minutes === 0)) status = "Present";
    else if (hours === 7 && minutes >= 1 && minutes <= 15) status = "Late";
    else status = "Absent"; 

    if (results.length === 0) {
      // First scan -- INSERT with time_in
      const sqlInsert = `
        INSERT INTO attendance (user_id, date_scanned, time_in, status) 
        VALUES (?, NOW(), ?, ?)
      `;
      db.query(sqlInsert, [user_id, timeNow, status], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });

        db.query("SELECT teacher_id FROM users WHERE user_id=?", [user_id], (err3, userRes) => {
          if (err3) console.error(err3);
          const teacherId = userRes?.[0]?.teacher_id;

          // Polished notification messages for Late or Absent
          if ((status === "Late" || status === "Absent") && teacherId) {
            let message = "";
            if (status === "Late") {
              message = `${username} has been marked late due to delayed arrival at ${timeNow}.`;
            } else if (status === "Absent") {
              message = `${username} has been marked absent for today.`;
            }

            db.query(
              "INSERT INTO notifications (teacher_id, student_id, type, message) VALUES (?, ?, 'late_absent', ?)",
              [teacherId, user_id, message],
              (err4) => { if (err4) console.error(err4); }
            );
          }

          // Check weekly absences
          const startOfWeek = new Date();
          startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday of this week
          const weekStart = startOfWeek.toISOString().slice(0, 10);

          db.query(
            "SELECT COUNT(*) AS absences FROM attendance WHERE user_id=? AND status='Absent' AND DATE(date_scanned) >= ?",
            [user_id, weekStart],
            (err5, absenceRes) => {
              if (err5) console.error(err5);
              const absences = absenceRes?.[0]?.absences || 0;
              if (absences >= 3 && teacherId) {
                const message = `${username} has been absent ${absences} times this week.`;
                db.query(
                  "INSERT INTO notifications (teacher_id, student_id, type, message) VALUES (?, ?, 'late_absent', ?)",
                  [teacherId, user_id, message],
                  (err6) => { if (err6) console.error(err6); }
                );
              }
            }
          );
        });

        return res.json({ msg: `Hi ${username}, you have been marked "${status}" at ${timeNow}.` });
      });
    } else {
      const record = results[0];
      if (!record.time_out) {
        // Second scan -- UPDATE time_out
        const sqlUpdate = `
          UPDATE attendance 
          SET time_out=? 
          WHERE attendance_id=?
        `;
        db.query(sqlUpdate, [timeNow, record.attendance_id], (err3) => {
          if (err3) return res.status(500).json({ error: err3.message });
          return res.json({ msg: `Hi ${username}, your time-out has been recorded at ${timeNow}.` });
        });
      } else {
        return res.json({ msg: `Hi ${username}, your attendance for today is already complete.` });
      }
    }
  });
};









// ================== Delete attendance ==================
const deleteAttendance = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM attendance WHERE attendance_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Attendance record not found" });
    res.json({ message: "Attendance record deleted successfully" });
  });
};




// ================== Today's attendance by teacher ==================
const studentAttendanceByTeacher = (req, res) => {
  const { teacherId } = req.query;
  if (!teacherId) return res.status(400).json({ error: "teacherId required" });

  const query = `
    SELECT 
      u.user_id, u.name, u.username, u.grade_level, u.email,
      u.section_id, s.section_name, st.strand_name,
      a.attendance_id, a.date_scanned, a.status
    FROM users u
    LEFT JOIN sections s ON s.section_id = u.section_id
    LEFT JOIN strands st ON st.strand_id = s.strand_id
    LEFT JOIN attendance a 
      ON a.user_id = u.user_id AND DATE(a.date_scanned) = CURDATE()
    WHERE u.role='student' AND u.teacher_id = ?
    ORDER BY u.name
  `;

  db.query(query, [teacherId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const result = rows.map((r) => ({
      ...r,
      status: finalizeStatus(r),
      date_scanned: r.date_scanned || null,
    }));

    res.json(result);
  });
};



// ================== Full attendance report ==================
const fullAttendanceReport = (req, res) => {
  const query = `
    SELECT 
      u.user_id, u.name, u.email, u.grade_level, u.username,
      s.section_id, s.section_name, st.strand_name,
      a.attendance_id, a.date_scanned, a.time_in, a.time_out, a.status
    FROM users u
    LEFT JOIN sections s ON s.section_id = u.section_id
    LEFT JOIN strands st ON st.strand_id = s.strand_id
    LEFT JOIN attendance a ON a.user_id = u.user_id
    WHERE u.role='student'
    ORDER BY a.date_scanned DESC
  `;

  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const result = rows.map((r) => ({
      ...r,
      status: finalizeStatus(r),
      date_scanned: r.date_scanned || null,
    }));

    res.json(result);
  });
};










const getStrandsAndSections = (req, res) => {
  const sql = `
    SELECT s.strand_id, s.strand_name, sec.section_id, sec.section_name
    FROM strands s
    JOIN sections sec ON s.strand_id = sec.strand_id
    ORDER BY s.strand_name, sec.section_name
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    res.json(result);
  });
};





// ====================== history per student
const getAttendanceHistory = (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT a.attendance_id, a.date_scanned, a.time_in, a.time_out, a.status
    FROM attendance a
    WHERE a.user_id = ?
    ORDER BY a.date_scanned DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching attendance history:", err);
      return res.status(500).json({ error: "Failed to fetch history" });
    }
    res.json(results);
  });
};

// ==================== summary counts (Present, Late, Absent) 
const getAttendanceSummary = (req, res) => {
  const { user_id } = req.params;

  const sql = `SELECT status, COUNT(*) as count FROM attendance WHERE user_id = ? GROUP BY status`;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching summary:", err);
      return res.status(500).json({ error: "Failed to fetch summary" });
    }
    const summary = { Present: 0, Late: 0, Absent: 0 };
    results.forEach((r) => {
      summary[r.status] = r.count;
    });

    res.json(summary);
  });
};






export default {
  studentAttendance,
  deleteAttendance,
  studentAttendanceByTeacher,
  fullAttendanceReport,
  getStrandsAndSections,
  getAttendanceHistory,
  getAttendanceSummary
};
