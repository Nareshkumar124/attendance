import { Router } from "express";
import {
    getStudent,
    registerStudent,
    getAllStudentAccordingToCourse,
} from "../controllers/student.controller";
import { verifyJwt } from "../middlewares/auth";

const studentRouter: Router = Router();

studentRouter.route("/").get(verifyJwt, getStudent).post(registerStudent);

studentRouter.route("/course").post(verifyJwt, getAllStudentAccordingToCourse);

export { studentRouter };
