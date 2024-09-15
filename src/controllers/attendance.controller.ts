import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/handler";
import { Request, Response, NextFunction } from "express";
import { Attendance } from "../models/attendance.model";

const setAttendance = async function (req: Request, todayDate?: Date) {
  let { date, subjectId, studentId } = req.body;

  if (todayDate) {
    date = todayDate;
  }

  console.log(date);

  if (!date) {
    throw new ApiError(400, "Date is required");
  }

  if (!subjectId) {
    throw new ApiError(400, "Subject id is required");
  }
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

  const attendance = await setAttendance(req, today);

  res
    .status(201)
    .json(new ApiResponse(201, attendance, "Attendance marked successfully"));
});

const markAttendance = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const attendance = await setAttendance(req);

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
const getAttendanceAccordingToStudent = null;

const getAttendanceAccordingToSubject = null;
