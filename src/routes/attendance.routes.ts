import {Router} from 'express';
import {verifyJwt} from '../middlewares/auth';
import {markAttendance,markTodayAttendance,unMarkAttendance} from '../controllers/attendance.controller';


const attendanceRouter:Router=Router();

attendanceRouter.route("/").post(verifyJwt,markAttendance);
attendanceRouter.route("/today").post(verifyJwt,markTodayAttendance);
attendanceRouter.route("/unmark").delete(verifyJwt,unMarkAttendance);


export {
    attendanceRouter
}