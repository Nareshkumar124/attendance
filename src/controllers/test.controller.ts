import {Test,ITest} from '../models/test.model';
import {ApiError} from '../utils/ApiError';
import {ApiResponse} from '../utils/ApiResponse';
import {asyncHandler} from '../utils/handler';
import {Request,Response,NextFunction} from 'express';

const addTestData=asyncHandler(async function(req:Request,res:Response,next:NextFunction){
    // get data from body
    const {auid,name,macAddress,time,teacherId,email,courseId,date}=req.body;

    if (
        [auid, name, email, time, teacherId,macAddress,courseId,date].some(
            (field) => field?.trim() === "" || !field
        )
    ) {
        throw new ApiError(
            400,
            "Auid, Name, Email, Time, teacherId, courseId,date and macAddress is required"
        );
    }


    const testDataDb=await Test.create({
        auid,name,macAddress,time,teacherId,email,courseId,date
    })

    if(!testDataDb){
        throw new ApiError(500,"Internal Server Error");
    }

    res.status(200).json(
        new ApiResponse(200,{},"Data enter successfully")
    )


})

export {
    addTestData
}