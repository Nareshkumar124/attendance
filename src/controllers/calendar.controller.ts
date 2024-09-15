import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/handler";
import { Request, Response, NextFunction } from "express";
import { AcademicCalendar } from "../models/calendar.model";
import {getDataFromCsvFile} from './common';

const addDay = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { date, dayType, description } = req.body;

    if (!date || !dayType) {
        throw new ApiError(400, "date and dayType fields are required");
    }

    const newDay = await AcademicCalendar.create({
        date,
        dayType,
        description,
    });

    if (!newDay) {
        throw new ApiError(500, "Internal server error");
    }

    res.status(201).json(new ApiResponse(201, newDay));
});

const addDaysCsv=asyncHandler(async function(req:Request,res:Response,next:NextFunction){

    const jsonArray=await getDataFromCsvFile(req);

    const validatedJsonArray=[]

    for(const item of jsonArray){
        const day=new AcademicCalendar(item);

        await day.validate();

        validatedJsonArray.push(day)
    }

    await AcademicCalendar.insertMany(validatedJsonArray);

    res.status(201).json(
        new ApiResponse(201,jsonArray,"Data inserted successfully")
    )
})


export {
    addDay,
    addDaysCsv,
}