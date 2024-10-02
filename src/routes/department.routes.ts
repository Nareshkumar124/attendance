import { Router } from "express";
import { verifyJwt } from "../middlewares/auth";
import {
    getAllDepartment,
    getDepartment,
    createDepartment,
    uploadDepartmentsUsingCsv,
} from "../controllers/department.controller";
import { upload } from "../middlewares/multer";

const departmentRouter: Router = Router();

// departmentRouter.use(verifyJwt)

departmentRouter.route("/").post(getDepartment);

departmentRouter.route("/create").post(createDepartment);

departmentRouter.route("/all").post(getAllDepartment);

departmentRouter
    .route("/upload")
    .post(upload.single("file"), uploadDepartmentsUsingCsv);

export { departmentRouter };
