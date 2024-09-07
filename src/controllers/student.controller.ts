import { Request, Response, NextFunction } from "express";
import { register, UserRegisterData } from "./user.controller";
import {ApiError} from '../utils/ApiError';
import {asyncHandler} from '../utils/handler';
import {Student} from '../models/student.model';
import {ApiResponse} from '../utils/ApiResponse';
import {User} from '../models/user.model';
import { getUserData, getUserDataFromRequest,courseExistsInDepartment } from "./common";


// use to register a student user
const registerStudent = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {

    const user = await getUserDataFromRequest(req);

    const userWithRole=Object.assign(user,{role:"student"}) as UserRegisterData;

    const {courseId}=req.body;

    if(!(await courseExistsInDepartment(user.departmentId,courseId))){
        throw new ApiError(
            400,"course not exists in your department"
        )
    }

    // Create user
    let userInDb = await register(userWithRole);

    // Create student
    let studentInDb = await Student.create({
        courseId: courseId,
        userId: userInDb._id,
    });

    if (!studentInDb) {
        throw new ApiError(500, "Internal Server Error");
    }

    const userDb = await User.findById(userInDb._id).select("-password");
    const studentDb = await Student.findById(studentInDb._id);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: userDb,
                student: studentDb,
            },
            "Student register successfully"
        )
    );
});


const getStudent=asyncHandler(async function (req:Request,res:Response,next:NextFunction){
    
    const {_id}=res.locals.user;


    const user=await getUserData(_id);

    const student=await Student.findOne({userId:_id});

    if(!student){
        throw new ApiError(
            400,"Student is not found"
        )
    }

    res.status(200).json(
        new ApiResponse(200,{user,student})
    )

})



export { registerStudent,getStudent};
