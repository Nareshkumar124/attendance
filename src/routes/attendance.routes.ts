import { Router } from "express";
import { verifyJwt } from "../middlewares/auth";
import {
    markAttendance,
    markTodayAttendance,
    unMarkAttendance,
    getAttendanceAccordingToStudent,
    getAttendanceAccordingToSubject,
    markAttendanceByFaculty,
    checkAttendanceMarkByFaculty,
} from "../controllers/attendance.controller";

const attendanceRouter: Router = Router();

attendanceRouter.route("/").post(verifyJwt, markAttendance);
attendanceRouter.route("/today").post(verifyJwt, markTodayAttendance);
attendanceRouter.route("/unmark").delete(verifyJwt, unMarkAttendance);

attendanceRouter
    .route("/student")
    .post(verifyJwt, getAttendanceAccordingToStudent);
attendanceRouter
    .route("/subject")
    .post(verifyJwt, getAttendanceAccordingToSubject);

attendanceRouter.route("/faculty").post(verifyJwt, markAttendanceByFaculty);
attendanceRouter
    .route("/faculty/check")
    .post(verifyJwt, checkAttendanceMarkByFaculty);

export { attendanceRouter };
