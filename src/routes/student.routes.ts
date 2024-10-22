import { Router } from "express";
import {
    getStudent,
    registerStudent,
    getAllStudentAccordingToCourse,
    registerStudentByCsv
} from "../controllers/student.controller";
import { verifyJwt } from "../middlewares/auth";
import {upload} from '../middlewares/multer';

const studentRouter: Router = Router();

studentRouter.route("/").get(verifyJwt, getStudent).post(registerStudent);

studentRouter.route("/course").post(verifyJwt, getAllStudentAccordingToCourse);

studentRouter.route("/register-csv").post(verifyJwt,upload.single("file"),registerStudentByCsv);

export { studentRouter };
