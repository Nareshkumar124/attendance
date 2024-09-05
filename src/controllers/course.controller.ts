import {ApiError} from '../utils/ApiError';
import {ApiResponse} from '../utils/ApiResponse';
import {asyncHandler} from '../utils/handler';
import {Request,Response,NextFunction} from 'express';
import {Course} from '../models/course.model';
import {Department} from '../models/department.model';

const createCourse=asyncHandler(
        async function(req:Request,res:Response,next:NextFunction){
            const {name,courseCode,semester,departmentId}=req.body;
            if(!name){
                throw new ApiError(
                    400,"Course name is required"
                )
            }
            if(!semester){
                throw new ApiError(
                    400,"Semester name is required"
                )
            }
            if(!departmentId){
                throw new ApiError(
                    400,"Department id name is required"
                )
            }

            const course=await Course.create({
                name:name,
                semester:semester,
                departmentId:departmentId
            })

            res.status(200).json(
                new ApiResponse(
                    200,
                    course
                )
            )
        }
)


const getCourse=asyncHandler(async function(req:Request,res:Response,next:NextFunction){
    const {id}=req.body;

    if(!id){
        throw new ApiError(
            400,"Course id is required."
        )
    }

    const course=await Course.findById(id);

    if(!course){
        throw new ApiError(
            400,"Not able to find course"
        )
    }

    res.status(200).json(
        new ApiResponse(
            200,course
        )
    )

})

const getAllCourse=asyncHandler(
    async function(req:Request,res:Response,next:NextFunction){

        const allCourse=await Course.find({});

        res.status(200).json(
            new ApiResponse(
                200,
                allCourse
            )
        )
    }
)

const getCourseByDepartment=asyncHandler(async function(req:Request,res:Response,next:NextFunction){
    const {id}=req.body;

    if(!id){
        throw new ApiError(
            400,"Department id is required"
        )
    }

    const departmentExists=await Department.countDocuments({_id:id});

    if(departmentExists<1){
        throw new ApiError(
            400,"Department not exists."
        )
    }

    const allCourse= await Course.find({departmentId:id});

    res.status(200).json(
        new ApiResponse(
            200,
            allCourse
        )
    )
}
);

export {
    createCourse,
    getCourse,
    getAllCourse,
    getCourseByDepartment
}
