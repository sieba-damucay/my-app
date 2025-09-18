import express from "express";
import reportsController from "../controllers/reportsController.js";

const reportRouter = express.Router();

// Daily attendance report
reportRouter.get("/students_report", reportsController.studentReport);

// Teachers list
reportRouter.get("/teachers_report", reportsController.teachersReport);

// Weekly / monthly attendance summary
reportRouter.get("/students-filtered", reportsController.attendanceReports);

// all stud
reportRouter.get("/students", reportsController.GetAllStudents);

export default reportRouter;
