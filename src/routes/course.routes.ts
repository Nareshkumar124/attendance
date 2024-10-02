import { Router } from "express";
import { verifyJwt } from "../middlewares/auth";
import {
    getCourse,
    createCourse,
    getAllCourse,
    getCourseByDepartment,
} from "../controllers/course.controller";

const courseRouter: Router = Router();

// courseRouter.use(verifyJwt)

courseRouter.route("/").post(getCourse);

courseRouter.route("/create").post(createCourse);

courseRouter.route("/all").post(getAllCourse);

courseRouter.route("/all-by-department").post(getCourseByDepartment);

export { courseRouter };
