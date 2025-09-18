// import db from "../config/database.js";



// // ======================  GET NITIFICATION ====================
// const getNotifications = (req, res) => {
//     const { teacherId } = req.params;
//     db.query("SELECT * FROM notifications WHERE teacher_id = ? ORDER BY date_created DESC",[teacherId],(err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json(results);
//         }
//     );
// };



// // ========================= SPECIFIC  =============================
// const notifications = (req, res) => {
//     const teacherId = req.params.teacherId;
//     const sql = `
//         SELECT n.notification_id, n.type, n.message, n.date_created, n.is_read, s.name AS student_name
//         FROM notifications n
//         LEFT JOIN students s ON n.student_id = s.student_id
//         WHERE n.user_id = ?
//         ORDER BY n.date_created DESC
//     `;
//     db.query(sql, [teacherId], (err, results) => {
//         if (err) return res.status(500).json({ error: err });
//         res.json(results);
//     });
// };


// export default { getNotifications, notifications };




import db from "../config/database.js";

// GET all notifications for a teacher
const getNotifications = (req, res) => {
  const { teacherId } = req.params;
  const sql = `
    SELECT n.notification_id, n.type, n.message, n.date_created, n.is_read,
           u.name AS student_name
    FROM notifications n
    LEFT JOIN users u ON n.student_id = u.user_id
    WHERE n.teacher_id = ?
    ORDER BY n.date_created DESC
  `;
  db.query(sql, [teacherId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export default { getNotifications };
