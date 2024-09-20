import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/handler";
import { Request, Response, NextFunction } from "express";
import { Attendance } from "../models/attendance.model";
import {AcademicCalendar} from '../models/calendar.model';
import {Types} from 'mongoose';

const setAttendance = async function (req: Request, res:Response,todayDate?: Date) {
  let { date, subjectId } = req.body;

  
  if (todayDate instanceof Date) {
    date = todayDate;
  }

  console.log(date);

  if (!date) {
    throw new ApiError(400, "Date is required");
  }
  
  if (!subjectId) {
    throw new ApiError(400, "Subject id is required");
  }

  let studentId = res.locals.user._id;

  if(!studentId){
    studentId=req.body.studentId;
  }

  console.log(studentId);

  if (!studentId) {
    throw new ApiError(400, "Student id is required");
  }

  const attendance = await Attendance.create({
    date: date,
    subjectId: subjectId,
    studentId: studentId,
  });

  if (!attendance) {
    throw new ApiError(500, "Internal server error");
  }

  return attendance;
};

const deleteAttendance = async function (req: Request) {
  const { date, subjectId, studentId } = req.body;

  if (!date) {
    throw new ApiError(400, "Date is required");
  }

  if (!subjectId) {
    throw new ApiError(400, "Subject id is required");
  }
  if (!studentId) {
    throw new ApiError(400, "Student id is required");
  }

  const attendance = await Attendance.findOneAndDelete({
    date: date,
    subjectId: subjectId,
    studentId: studentId,
  });

  if (!attendance) {
    throw new ApiError(500, "Internal server error");
  }

  return attendance;
};

// main controller.....................
const markTodayAttendance = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const today = new Date();

  const attendance = await setAttendance(req,res, today);

  res
    .status(201)
    .json(new ApiResponse(201, attendance, "Attendance marked successfully"));
});

const markAttendance = asyncHandler(async function ( //Ok
  req: Request,
  res: Response,
  next: NextFunction
) {
  const attendance = await setAttendance(req,res);

  res
    .status(201)
    .json(new ApiResponse(201, attendance, "Attendance marked successfully"));
});

const unMarkAttendance = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const attendance = await deleteAttendance(req);
  res
    .status(200)
    .json(new ApiResponse(200, attendance, "Attendance unmarked successfully"));
});


// Month wise attendance controller
const getAttendanceAccordingToStudent = asyncHandler(
  async function(req:Request,res:Response,next:NextFunction){

    const {startDate,endDate,subjectId}=req.body;

    const {_id:studentId}=res.locals.user;

    if(!studentId){
      throw new ApiError(500,"Internal Server Error")
    }

    if(!startDate || !endDate){
      throw new ApiError(
        400,"Start Date and End Date is required"
      )
    }

    // TODO: Check if subjectId is valid and user have this subjectId or not. 

    if(!subjectId){
      throw new ApiError(400,"Subject id is required")
    }

    const attendanceSummary = await AcademicCalendar.aggregate([
      {
        // Match documents in the AcademicCalendar between startDate and endDate
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        // Perform a left outer join with the Attendance collection
        $lookup: {
          from: "attendances",
          let: { calendarDate: "$date" }, // Define the local field for the join
          pipeline: [
            {
              $match: {
                // Filter Attendance records for the matching subjectId, studentId, and date
                $expr: {
                  $and: [
                    { $eq: ["$subjectId", Types.ObjectId.createFromHexString(subjectId)] },
                    { $eq: ["$studentId", studentId ] },
                    { $eq: ["$date", "$$calendarDate"] },
                  ],
                },
              },
            },
          ],
          as: "attendanceRecords", // Output the matching attendance data
        },
      },
      {
        // Add a field to indicate whether the student was present or absent
        $addFields: {
          present: {
            // Check if the attendanceRecords array has any entries, which means present
            $cond: { if: { $gt: [{ $size: "$attendanceRecords" }, 0] }, then: true, else: false },
          },
        },
      },
      {
        // Project the required fields
        $project: {
          _id: 0, // Exclude the _id field
          date: 1, // Include the date from AcademicCalendar
          dayType: 1, // Include the dayType from AcademicCalendar
          present: 1, // Include the presence status
        },
      },
    ]);

    
    if(!attendanceSummary){
      throw new ApiError(500,"Internal Server Error")
    }

    res.status(200).json(
      new ApiResponse(200,attendanceSummary,"Attendance Data")
    )
  }
);

const getAttendanceAccordingToSubject = asyncHandler(
  async function(req:Request,res:Response,next:NextFunction){
    
    const {date,subjectId}=req.body;

    if(!date){
      throw new ApiError(400,"Date is required")
    }

    if(!subjectId){
      throw new ApiError(400,"Subject id is required")
    }

    const attendanceData= AcademicCalendar.aggregate();

    if(!attendanceData){
      throw new ApiError(500,"Internal Server Error")
    }

    res.status(200).json(
      new ApiResponse(200,attendanceData,"Attendance Data")
    )

  }
);


const getAttendanceAccordingToCourseOfStudent=null; // Get Attendance of student of all Subjects;

const calculationOfAttendance=null; // Fetch all calculation of attendance of student of all Subjects.

export {
  markAttendance,
  unMarkAttendance,
  markTodayAttendance,
  getAttendanceAccordingToStudent,
  getAttendanceAccordingToSubject,
  getAttendanceAccordingToCourseOfStudent,
  calculationOfAttendance,
}