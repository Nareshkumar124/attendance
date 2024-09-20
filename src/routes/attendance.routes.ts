import {Router} from 'express';
import {verifyJwt} from '../middlewares/auth';
import {markAttendance,markTodayAttendance,unMarkAttendance,getAttendanceAccordingToStudent,getAttendanceAccordingToSubject} from '../controllers/attendance.controller';


const attendanceRouter:Router=Router();

attendanceRouter.route("/").post(verifyJwt,markAttendance);
attendanceRouter.route("/today").post(verifyJwt,markTodayAttendance);
attendanceRouter.route("/unmark").delete(verifyJwt,unMarkAttendance);

attendanceRouter.route("/student").get(verifyJwt,getAttendanceAccordingToStudent);
attendanceRouter.route("/subject").get(verifyJwt,getAttendanceAccordingToStudent)


export {
    attendanceRouter
}