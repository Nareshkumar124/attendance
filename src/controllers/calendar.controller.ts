import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/handler";
import { Request, Response, NextFunction } from "express";
import { AcademicCalendar } from "../models/calendar.model";
import { getDataFromCsvFile } from "./common";

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

const addDaysCsv = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const jsonArray = await getDataFromCsvFile(req);

    const validatedJsonArray = [];

    for (const item of jsonArray) {
        const day = new AcademicCalendar(item);

        await day.validate();

        validatedJsonArray.push(day);
    }

    await AcademicCalendar.insertMany(validatedJsonArray);

    res.status(201).json(
        new ApiResponse(201, jsonArray, "Data inserted successfully")
    );
});

const getCalendarRange = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
        throw new ApiError(400, "Start date and end date are required");
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new ApiError(400, "Invalid date format");
    }

    if (start > end) {
        throw new ApiError(400, "Start date must be before end date");
    }

    const calendarRange = await AcademicCalendar.find({
        date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    if (!calendarRange) {
        throw new ApiError(500, "Internal server error");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            calendarRange,
            "Calendar range retrieved successfully"
        )
    );
});

export { addDay, addDaysCsv, getCalendarRange };
