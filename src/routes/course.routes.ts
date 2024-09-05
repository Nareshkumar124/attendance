import {Router} from 'express';
import {verifyJwt} from '../middlewares/auth';
import {getCourse,createCourse,getAllCourse,getCourseByDepartment} from '../controllers/course.controller';

const courseRouter:Router=Router();

// courseRouter.use(verifyJwt)

courseRouter.route("/")
.get(getCourse)
.post(createCourse);

courseRouter.route("/all").get(getAllCourse);

courseRouter.route("/all-by-department").get(getCourseByDepartment);


export {
    courseRouter
}




