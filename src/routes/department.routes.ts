import {Router} from 'express';
import {verifyJwt} from '../middlewares/auth';
import {getAllDepartment,getDepartment,createDepartment,uploadDepartmentsUsingCsv} from '../controllers/department.controller';
import {upload} from '../middlewares/multer';

const departmentRouter:Router=Router();

// departmentRouter.use(verifyJwt)

departmentRouter.route("/")
.get(getDepartment)
.post(createDepartment);

departmentRouter.route("/all").get(getAllDepartment);

departmentRouter.route("/upload").post(upload.single("file"),uploadDepartmentsUsingCsv);

export {
    departmentRouter
}

