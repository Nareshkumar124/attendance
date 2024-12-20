import {Test,ITest} from '../models/test.model';
import {ApiError} from '../utils/ApiError';
import {ApiResponse} from '../utils/ApiResponse';
import {asyncHandler} from '../utils/handler';
import {Request,Response,NextFunction} from 'express';

const addTestData=asyncHandler(async function(req:Request,res:Response,next:NextFunction){
    // get data from body
    const {macAddress,time,teacherId,subjectId,date}=req.body;

    const {auid,name,email}=res.locals.user;

    console.log({auid,name,email,macAddress,time,teacherId,subjectId,date})
    
    if (
        [auid, name, email, time, teacherId,macAddress,subjectId,date].some(
            (field) => field?.trim() === "" || !field
        )
    ) {
        throw new ApiError(
            400,
            "macAddress,time,teacherId,subjectId and date is required"
        );
    }


    const testDataDb=await Test.create({
        auid,name,macAddress,time,teacherId,email,subjectId,date
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