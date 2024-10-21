import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/handler";
import { Request, Response, NextFunction } from "express";
import { Attendance } from "../models/attendance.model";
import { AcademicCalendar } from "../models/calendar.model";
import { Subject } from "../models/subject.model";
import { Types } from "mongoose";
import { FacultyMark } from "../models/facultyMark.model";
import { Faculty } from "../models/faculty.model";
import { User } from "../models/user.model";

const setAttendance = async function (
    req: Request,
    res: Response,
    todayDate?: Date,
    studentId?: string
) {
    let { date, subjectId } = req.body;

    if (todayDate instanceof Date) {
        date = todayDate.toISOString().slice(0, 10);
    }

    console.log(date);

    if (!date) {
        throw new ApiError(400, "Date is required");
    }

    if (!subjectId) {
        throw new ApiError(400, "Subject id is required");
    }
    if(!studentId){
        studentId = res.locals.user._id;
    }

    if (!studentId) {
        throw new ApiError(400, "Student id is required");
    }

    const checkAttendance=await Attendance.findOne({
        date: date,
        subjectId: subjectId,
        studentId: studentId,
    })

    if(checkAttendance){
        throw new ApiError(400, "Attendance already marked");
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

    const attendance = await setAttendance(req, res, today);

    res.status(201).json(
        new ApiResponse(201, attendance, "Attendance marked successfully")
    );
});

const markAttendance = asyncHandler(async function (
    //Ok
    req: Request,
    res: Response,
    next: NextFunction
) {
    const {studentId}=req.body;

    if(!studentId){
        throw new ApiError(400,"Student id is required");
    }
    const attendance = await setAttendance(req, res, undefined,studentId);

    res.status(201).json(
        new ApiResponse(201, attendance, "Attendance marked successfully")
    );
});

const unMarkAttendance = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const attendance = await deleteAttendance(req);
    res.status(200).json(
        new ApiResponse(200, attendance, "Attendance unmarked successfully")
    );
});

// Month wise attendance controller
const getAttendanceAccordingToStudent = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { startDate, endDate, subjectId } = req.body;

    const { _id: studentId } = res.locals.user;

    // Get faculty id from subject table
    const subject = await Subject.findById(subjectId).select("facultyId");
    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    const facultyId = subject.facultyId;
    if (!facultyId) {
        throw new ApiError(500, "Faculty not assigned to this subject");
    }

    if (!studentId) {
        throw new ApiError(500, "Internal Server Error");
    }

    if (!startDate || !endDate) {
        throw new ApiError(400, "Start Date and End Date is required");
    }

    // TODO: Check if subjectId is valid and user have this subjectId or not.

    if (!subjectId) {
        throw new ApiError(400, "Subject id is required");
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
                                    {
                                        $eq: [
                                            "$subjectId",
                                            Types.ObjectId.createFromHexString(
                                                subjectId
                                            ),
                                        ],
                                    },
                                    { $eq: ["$studentId", studentId] },
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
            // Perform a left outer join with the FacultyMark collection
            $lookup: {
                from: "facultymarks",
                let: { calendarDate: "$date" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$facultyId", facultyId] },
                                    { $eq: ["$date", "$$calendarDate"] },
                                    { $eq: ["$subjectId", Types.ObjectId.createFromHexString(subjectId)] },
                                ],
                            },
                        },
                    },
                ],
                as: "facultyMarks",
            },
        },
        {
            // Add fields to indicate whether the student was present and faculty was present
            $addFields: {
                present: {
                    $cond: {
                        if: { $gt: [{ $size: "$attendanceRecords" }, 0] },
                        then: true,
                        else: false,
                    },
                },
                facultyPresent: {
                    $cond: {
                        if: { $gt: [{ $size: "$facultyMarks" }, 0] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            // Project the required fields
            $project: {
                _id: 0, // Exclude the _id field
                date: 1, // Include the date from AcademicCalendar
                dayType: 1, // Include the dayType from AcademicCalendar
                present: 1, // Include student attendance status
                facultyPresent: 1, // Include faculty attendance status
            },
        },
    ]);

    if (!attendanceSummary) {
        throw new ApiError(500, "Internal Server Error");
    }

    res.status(200).json(
        new ApiResponse(200, attendanceSummary, "Attendance Data")
    );
});

const getAttendanceAccordingToSubject = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { date, subjectId } = req.body;

    const attendanceDate = new Date(date);

    if (!date) {
        throw new ApiError(400, "Date is required");
    }

    if (!subjectId) {
        throw new ApiError(400, "Subject id is required");
    }

    const day = await AcademicCalendar.findOne({ date: attendanceDate });

    if (day) {
        if (day.dayType == "holiday") {
            throw new ApiError(400, "Today is holiday");
        }
    } else {
        throw new ApiError(500, "Not a working day");
    }

    // Check if there's a faculty mark for this subject on the given date
    const facultyMark = await FacultyMark.findOne({
        date: attendanceDate,
        subjectId: subjectId,
    });

    if (!facultyMark) {
        throw new ApiError(
            400,
            "No lecture scheduled for this subject on the given date"
        );
    }

    // Now the day is working
    // Steps:
    // - fetch the student details that are present in course
    // - now map the attendance of student
    // - if record present than mark is present(true) otherwise mark as absent(false)

    const attendanceData = await Subject.aggregate([
        {
            // Match the Subject by subjectId
            $match: {
                _id: Types.ObjectId.createFromHexString(subjectId), // Use the subjectId provided
            },
        },
        {
            // Lookup students based on courseId from the Subject model
            $lookup: {
                from: "students", // The students collection
                localField: "courseId", // The courseId field in the Subject model
                foreignField: "courseId", // The courseId field in the students collection
                as: "students", // Alias for the joined data
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "userId",
                            foreignField: "_id",
                            as: "user",
                        },
                    },
                    {
                        $unwind: "$user",
                    },
                    {
                        $project: {
                            "user.password": 0,
                        },
                    },
                ],
            },
        },
        {
            // Unwind the students array to process each student individually
            $unwind: "$students",
        },
        {
            // Lookup attendance for each student based on subjectId, studentId, and the provided date
            $lookup: {
                from: "attendances", // The attendances collection
                let: {
                    studentId: "$students.user._id", // Pass the student's _id
                    // subjectId: "$_id", // Pass the subject _id
                    // attendanceDate: new Date(date), // Use the provided attendance date
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$studentId", "$$studentId"] }, // Match studentId
                                    {
                                        $eq: [
                                            "$subjectId",
                                            Types.ObjectId.createFromHexString(
                                                subjectId
                                            ),
                                        ],
                                    }, // Match subjectId "$$subjectId"
                                    { $eq: ["$date", attendanceDate] }, // Match date
                                ],
                            },
                        },
                    },
                ],
                as: "attendanceRecord", // Store the attendance result in attendanceRecord
            },
        },
        {
            // Add a new field "present" based on whether attendanceRecord exists
            $addFields: {
                "students.present": {
                    $cond: {
                        if: { $gt: [{ $size: "$attendanceRecord" }, 0] }, // If attendanceRecord exists
                        then: true, // Mark as present
                        else: false, // Otherwise mark as absent
                    },
                },
            },
        },
        {
            // Group by the subject and collect student attendance in an array
            $group: {
                _id: "$_id", // Group by the subject ID
                subject: { $first: "$name" }, // Get subject name
                students: { $push: "$students" }, // Push all student attendance records into an array
            },
        },
        {
            // Project the final output fields
            $project: {
                _id: 0,
                subject: 1, // Include the subject name
                students: {
                    _id: 1, // Include student ID
                    user: 1,
                    present: 1, // Include attendance status
                },
            },
        },
    ]);

    // console.log(attendanceData);

    if (!attendanceData) {
        throw new ApiError(500, "Internal Server Error");
    }

    res.status(200).json(
        new ApiResponse(200, attendanceData, "Attendance Data")
    );
});

const markAttendanceByFaculty = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { date, facultyId, subjectId } = req.body;

    // Validate required fields
    if (!date || !facultyId || !subjectId) {
        throw new ApiError(400, "Date, facultyId, and subjectId are required");
    }

    // Validate facultyId and subjectId (assuming they are MongoDB ObjectIds)
    if (
        !Types.ObjectId.isValid(facultyId) ||
        !Types.ObjectId.isValid(subjectId)
    ) {
        throw new ApiError(400, "Invalid facultyId or subjectId");
    }

    // Check if the subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    const facultyMark = await FacultyMark.create({
        facultyId: facultyId,
        date: date,
        subjectId: subjectId,
    });

    if (!facultyMark) {
        throw new ApiError(500, "Internal Server Error");
    }

    res.status(201).json(new ApiResponse(201, facultyMark, "Faculty Mark"));
});

const checkAttendanceMarkByFaculty = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { date, facultyId, subjectId } = req.body;

    if (!date || !facultyId || !subjectId) {
        throw new ApiError(400, "Date, facultyId, and subjectId are required");
    }

    if (
        !Types.ObjectId.isValid(facultyId) ||
        !Types.ObjectId.isValid(subjectId)
    ) {
        throw new ApiError(400, "Invalid facultyId or subjectId");
    }

    const facultyMark = await FacultyMark.findOne({
        facultyId: facultyId,
        date: date,
        subjectId: subjectId,
    });

    if (!facultyMark) {
        throw new ApiError(404, "Faculty Mark not found");
    }

    res.status(200).json(new ApiResponse(200, facultyMark, "Faculty Mark"));
});

const getAttendanceAccordingToCourseOfStudent = null; // Get Attendance of student of all Subjects;

export {
    markAttendance,
    unMarkAttendance,
    markTodayAttendance,
    getAttendanceAccordingToStudent,
    getAttendanceAccordingToSubject,
    getAttendanceAccordingToCourseOfStudent,
    markAttendanceByFaculty,
    checkAttendanceMarkByFaculty,
};
