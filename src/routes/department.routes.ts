import {Router} from 'express';
import {verifyJwt} from '../middlewares/auth';
import {getAllDepartment,getDepartment,createDepartment} from '../controllers/department.controller';


const departmentRouter:Router=Router();

// departmentRouter.use(verifyJwt)

departmentRouter.route("/")
.get(getDepartment)
.post(createDepartment);

departmentRouter.route("/all").get(getAllDepartment);

export {
    departmentRouter
}

