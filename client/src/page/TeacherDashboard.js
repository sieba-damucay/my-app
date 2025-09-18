import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { FaChalkboardTeacher } from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";


function TeacherDashboard({ teacherId }) {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const COLORS = ["#800000", "#ffffff", "#FFA500"]; 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
const studentsRes = await api.get("/students", { params: { teacher_id: teacherId } });
      const attendanceRes = await api.get("/teacher_reportdashboard", { params: { teacher_id: teacherId, type: "daily" } });

      const merged = studentsRes.data.map((s) => {
        const record = attendanceRes.data.find((a) => a.user_id === s.user_id);
        return {
          ...s,
          attendance_id: record?.attendance_id || null,
          date_scanned: record?.date_scanned || null,
          status: record ? record.status : "Absent",
        };
      });

      setStudents(studentsRes.data);
      setAttendance(merged);
    } catch (err) {
      console.error(err);
    }
  };

  const today = new Date().toDateString();
  const presentToday = attendance.filter(a => a.date_scanned && new Date(a.date_scanned).toDateString() === today && a.status === "Present").length;
  const lateToday = attendance.filter(a => a.date_scanned && new Date(a.date_scanned).toDateString() === today && a.status === "Late").length;
  const absentToday = students.length - presentToday - lateToday;

  const attendanceByDate = attendance.reduce((acc, a) => {
    if (a.date_scanned) {
      const date = new Date(a.date_scanned).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});
  const lineData = Object.keys(attendanceByDate).map(date => ({ date, scans: attendanceByDate[date] }));

  const attendanceByStudent = attendance.reduce((acc, a) => {
    acc[a.name] = (acc[a.name] || 0) + (a.status === "Present" ? 1 : 0);
    return acc;
  }, {});
  const barData = Object.keys(attendanceByStudent).map(name => ({ name, scans: attendanceByStudent[name] }));

  const pieData = [
    { name: "Present Today", value: presentToday },
    { name: "Late Today", value: lateToday },
    { name: "Absent Today", value: absentToday },
  ];

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4 d-flex align-items-center justify-content-center gap-2" style={{ color: "#800000" }}>
        <FaChalkboardTeacher /> Teacher Dashboard
      </h2>

      <div className="row mb-4 g-3">
        {[
          { label: "Total Students", value: students.length },
          { label: "Present Today", value: presentToday },
          { label: "Late Today", value: lateToday },
          { label: "Absent Today", value: absentToday },
        ].map((kpi, idx) => (
          <div className="col-md-3" key={idx}>
            <div className="card p-3 shadow-sm text-center" style={{ backgroundColor: "#800000", color: "#fff" }}>
              <h5>{kpi.label}</h5>
              <h2>{kpi.value}</h2>
            </div>
          </div>
        ))}
      </div>


      <div className="row g-4">
        <div className="col-md-6">
          <h5>Attendance Trend</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="scans" stroke="#800000" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>


        <div className="col-md-6">
          <h5>Attendance by Student</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="scans" fill="#800000" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


        <div className="col-md-6 mt-4">
          <h5>Today's Attendance</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


      <h4 className="mt-4" style={{ color: "#800000" }}>All Attendance Records</h4>
      <div className="table-responsive">

        
        <table className="table table-bordered table-striped">
         <thead className="table-light" style={{ backgroundColor: "#800000", color: "#fff" }}>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Username</th>
            <th>Grade</th>
            <th>Section</th>
            <th>Strand</th>
            <th>Status</th>
            <th>Time Scanned</th>
          </tr>
        </thead>
        <tbody>
          {attendance.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center text-muted">No students found</td>
            </tr>
          ) : (
            attendance.map((a, index) => (
              <tr key={a.user_id}>
                <td>{index + 1}</td>
                <td>{a.name}</td>
                <td>{a.username}</td>
                <td>{a.grade_level || "N/A"}</td>
                <td>{a.section_name || "N/A"}</td>
                <td>{a.strand_name || "N/A"}</td>
                <td className={
                  a.status === "Present" ? "text-success" :
                  a.status === "Late" ? "text-warning" : "text-danger"
                }>
                  {a.status || "-"}
                </td>
                <td>{a.date_scanned ? new Date(a.date_scanned).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
              </tr>
            ))
          )}
        </tbody>

        </table>


      </div>
    </div>
  );
}

export default TeacherDashboard;
