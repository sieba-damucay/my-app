import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { FaChartBar } from "react-icons/fa";

function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const LIGHT = "#B76E79";
  const MEDIUM = "#A0525E";
  const DARK = "#800000";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [studentsRes, teachersRes, attendanceRes] = await Promise.all([
          api.get("/students_report"),
          api.get("/teachers_report"),
          api.get("/attendance-report"),
        ]);
        setStudents(studentsRes.data || []);
        setTeachers(teachersRes.data || []);
        setAttendance(attendanceRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchAll();
  }, []);

  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const today = new Date().toDateString();
  const presentToday = attendance.filter(a => new Date(a.date_scanned).toDateString() === today && a.status === "Present").length;
  const absentToday = totalStudents - presentToday;

  const attendanceByDate = attendance.reduce((acc, a) => {
    const date = new Date(a.date_scanned).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const lineData = Object.keys(attendanceByDate).map(date => ({ date, scans: attendanceByDate[date] }));

  const attendanceByGrade = students.reduce((acc, s) => {
    const grade = s.grade_level || "N/A";
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.keys(attendanceByGrade).map(grade => ({ grade, count: attendanceByGrade[grade] }));

  const pieData = [{ name: "Present Today", value: presentToday }, { name: "Absent Today", value: absentToday }];
  const PIE_COLORS = [DARK, LIGHT];

  return (
    <div className="container mt-4" style={{ color: DARK }}>
      <h2 className="text-center mb-4"><FaChartBar style={{ marginRight: "0.5rem" }} />Admin Dashboard</h2>

      <div className="row mb-4 g-3">
        <div className="col-6 col-md-3">
          <div className="card p-3 shadow-sm text-center" style={{ backgroundColor: DARK, color: "#fff" }}>
            <h5>Total Students</h5><h2>{totalStudents}</h2>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card p-3 shadow-sm text-center" style={{ backgroundColor: DARK, color: "#fff" }}>
            <h5>Total Teachers</h5><h2>{totalTeachers}</h2>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card p-3 shadow-sm text-center" style={{ backgroundColor: LIGHT, color: DARK, border: `1px solid ${DARK}` }}>
            <h5>Present Today</h5><h2>{presentToday}</h2>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card p-3 shadow-sm text-center" style={{ backgroundColor: LIGHT, color: DARK, border: `1px solid ${DARK}` }}>
            <h5>Absent Today</h5><h2>{absentToday}</h2>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6">
          <h5>Attendance Trend</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke={MEDIUM} />
                <XAxis dataKey="date" stroke={DARK} />
                <YAxis stroke={DARK} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="scans" stroke={DARK} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <h5>Students per Grade</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke={MEDIUM} />
                <XAxis dataKey="grade" stroke={DARK} />
                <YAxis stroke={DARK} />
                <Tooltip />
                <Bar dataKey="count" fill={DARK} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <h5>Today’s Attendance</h5>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} fill={DARK} dataKey="value" label>
                  {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <h5>Today’s Attendance Details</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-hover" style={{ borderColor: DARK }}>
              <thead className="table-light" style={{ backgroundColor: DARK, color: "#fff" }}>
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
                {attendance.map((a, index) => (
                  <tr key={a.user_id}>
                    <td>{index + 1}</td>
                    <td>{a.name}</td>
                    <td>{a.username}</td>
                    <td>{a.grade_level || "N/A"}</td>
                    <td>{a.section_name || "N/A"}</td>
                    <td>{a.strand_name || "N/A"}</td>
                    <td className={a.status === "Present" ? "text-success" : a.status === "Late" ? "text-warning" : "text-danger"}>{a.status}</td>
                    <td>{a.date_scanned ? new Date(a.date_scanned).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
