import { Router } from "express";
import {
    registerFaculty,
    getFaculty,
} from "../controllers/faculty.controllers";
import { verifyJwt } from "../middlewares/auth";

const facultyRouter: Router = Router();

facultyRouter.route("/").get(verifyJwt, getFaculty).post(registerFaculty);

export { facultyRouter };
