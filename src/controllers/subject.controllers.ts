import { asyncHandler } from "../utils/handler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response, NextFunction } from "express";
import { Subject } from "../models/subject.model";
import { Student } from "../models/student.model";

const getSubjectAccordingToCourse = async function (courseId: any) {
    const subjects = await Subject.find({ courseId });

    if (!subjects) {
        throw new ApiError(500, "Internal Server Error");
    }
    return subjects;
};

const addSubject = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { name, courseId, facultyId } = req.body;

    if (!name || name.trim() == "") {
        throw new ApiError(400, "Subject name is required");
    }
    if (!courseId || courseId.trim() == "") {
        throw new ApiError(400, "Course id name is required");
    }
    if (!facultyId || facultyId.trim() == "") {
        throw new ApiError(400, "Faculty id name is required");
    }

    const subjectInDb = await Subject.create({
        name,
        courseId,
        facultyId,
    });

    if (!subjectInDb) {
        throw new ApiError(500, "Internal server error");
    }

    res.status(201).json(new ApiResponse(201, subjectInDb));
});

const getSubjectAccordingToStudent = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { userId } = res.locals.user;

    if (!userId) {
        throw new ApiError(400, "User id is required");
    }

    const student = await Student.findOne({ userId });

    if (!student) {
        throw new ApiError(500, "Internal server error");
    }

    const subjects = await getSubjectAccordingToCourse(student.courseId);

    res.status(200).json(new ApiResponse(200, subjects));
});

const getSubjectAccordingToFaculty = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { userId } = res.locals.user;

    // const subjects=await Subject.find({facultyId:userId});

    // if(!subjects){
    //     throw new ApiError(
    //         500,"Internal Server Error"
    //     )
    // }

    const subjects = await Subject.aggregate([
        {
            $match: { facultyId: userId },
        },
        {
            $lookup: {
                from: "courses",
                localField: "courseId",
                foreignField: "_id",
                as: "course",
            },
        },
    ]);

    res.status(200).json(new ApiResponse(200, subjects));
});

const getSubject = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { subjectId } = req.body;

    const detail = await Subject.aggregate([
        {
            $match: {
                _id: subjectId,
            },
        },
        {
            $lookup: {
                from: "courses",
                localField: "courseId",
                foreignField: "_id",
                as: "course",
            },
        },
        {
            $lookup: {
                from: "faculties",
                localField: "facultyId",
                foreignField: "_id",
                as: "course",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "userId",
                            foreignField: "_id",
                            as: "user",
                        },
                    },
                ],
            },
        },
    ]);

    if (!detail) {
        throw new ApiError(500, "Internal Server error");
    }

    res.status(200).json(new ApiResponse(200, detail));
});

export {
    addSubject,
    getSubjectAccordingToStudent,
    getSubjectAccordingToFaculty,
    getSubject,
};
