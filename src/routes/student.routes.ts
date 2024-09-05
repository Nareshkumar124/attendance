import {Router} from 'express';
import { getStudent, registerStudent } from '../controllers/student.controller';
import { verifyJwt } from '../middlewares/auth';

const StudentRouter:Router=Router();


StudentRouter.route("/")
.get(verifyJwt,getStudent)
.post(registerStudent)

export {
    StudentRouter
}
