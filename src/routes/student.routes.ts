import { Router } from "express";
import { getStudent, registerStudent } from "../controllers/student.controller";
import { verifyJwt } from "../middlewares/auth";

const studentRouter: Router = Router();

studentRouter.route("/").get(verifyJwt, getStudent).post(registerStudent);

export { studentRouter };
