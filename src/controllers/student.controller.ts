import { Request, Response, NextFunction } from "express";
import { register, UserRegisterData } from "./user.controller";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/handler";
import { Student } from "../models/student.model";
import {Types} from 'mongoose';
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.model";
import {
    getUserDataFromRequest,
    courseExistsInDepartment,
    getUserData,
    getDataFromCsvFile,
    getUserDataFromObject
} from "./common";

// use to register a student user
const registerStudent = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const user = await getUserDataFromRequest(req);

    const userWithRole = Object.assign(user, {
        role: "student",
    }) as UserRegisterData;

    const { courseId } = req.body;

    if (!courseId || courseId === "") {
        throw new ApiError(400, "course id is required");
    }

    if (!(await courseExistsInDepartment(user.departmentId, courseId))) {
        throw new ApiError(400, "course not exists in your department");
    }

    // Create user
    let userInDb = await register(userWithRole);

    // Create student
    let studentInDb = await Student.create({
        courseId: courseId,
        userId: userInDb._id,
    });

    if (!studentInDb) {
        User.deleteOne({ _id: userInDb._id });
        throw new ApiError(500, "Internal Server Error");
    }

    const userDb = await User.findById(userInDb._id).select("-password");
    const studentDb = await Student.findById(studentInDb._id);

    res.status(201).json(
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


const registerStudentByCsv=asyncHandler(async function(req:Request,res:Response,next:NextFunction){
    
    const csvData= await getDataFromCsvFile(req);

    const userDataArray=[]
    for(const item of csvData){
        const userData=await getUserDataFromObject(item);

        const userDataWithRole=Object.assign(userData,{
            role:"student"
        }) as UserRegisterData;

        const user=new User(userData);

        await user.validate();

        userDataArray.push(userDataWithRole);
    }


    const studentDataArray=[]

    for(const item of csvData){
        const { courseId } = item;

        if (!courseId || courseId === "") {
            throw new ApiError(400, "course id is required");
        }

        if (!(await courseExistsInDepartment(item.departmentId, courseId))) {
            throw new ApiError(400, "course not exists in your department");
        }

        const studentData={
            courseId: courseId
        }
        studentDataArray.push(studentData);
    }


    // Create user  
    for(let i=0;i<userDataArray.length;i++){
        const userInDb = await register(userDataArray[i]);

        // Create student
        const studentInDb = await Student.create({
            courseId: studentDataArray[i].courseId,
            userId: userInDb._id,
        });
    }

    res.status(201).json(
        new ApiResponse(201,{},"Students register successfully")
    )
})

const getStudent = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { _id } = res.locals.user;

    console.log(_id);
    // const user = await getUserData(_id);

    // const student = await Student.findOne({ userId: _id });

    const student=await Student.aggregate([
        {
            $match:{
                userId: _id
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"userId",
                foreignField:"_id",
                as:"user",
                pipeline:[
                    { $project: { password: 0 } },
                ]
            }
        },
        {
            $lookup:{
                from:"courses",
                localField:"courseId",
                foreignField:"_id",
                as:"course"
            }
        },
        {
            $lookup:{
                from:"departments",
                localField:"user.departmentId",
                foreignField:"_id",
                as:"department"
            }
        },
        {
            $project:{
                user:{  
                    $arrayElemAt:["$user",0]
                },
                course:{
                    $arrayElemAt:["$course",0]
                },
                department:{
                    $arrayElemAt:["$department",0]
                }
            }
        }
    ])

    if (!student.length) {
        throw new ApiError(400, "Student is not found");
    }

    res.status(200).json(new ApiResponse(200, student[0]));
});

const getAllStudentAccordingToCourse=asyncHandler(
    async function(req:Request,res:Response,next:NextFunction){
        const {courseId}=req.body;

        if(!courseId){
            throw new ApiError(400,"Course id is required")
        }

        const studentList=await Student.aggregate([
            {
                $match:{
                    courseId: Types.ObjectId.createFromHexString(courseId)
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"userId",
                    foreignField:"_id",
                    as:"user"
                }
            },
            {
                $project:{
                    user:{
                        $arrayElemAt:["$user",0]
                    }
                }
            },{
                $unset:["user.password"]
            }
        ])

        if(!studentList){
            throw new ApiError(500,"Internal server error")
        }

        res.status(200).json(
            new ApiResponse(200,studentList,"Student in course")
        )
    }
)

export { registerStudent, getStudent,getAllStudentAccordingToCourse,registerStudentByCsv };
