import { asyncHandler } from "../utils/handler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response, NextFunction } from "express";
import { Subject } from "../models/subject.model";
import { Student } from "../models/student.model";
import { Types } from "mongoose";

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
    const { _id:userId } = res.locals.user;


    if (!userId) {
        throw new ApiError(400, "User id is required");
    }

    const subjects = await Student.aggregate([
        {
            "$match":{
                userId
            },
        },
        {
            "$lookup":{
                from:"subjects",
                localField:"courseId",
                foreignField:"courseId",
                as:"subjects",
                pipeline:[
                    {
                        "$lookup":{
                            from:"users",
                            localField:"facultyId",
                            foreignField:"_id",
                            as:"faculty"
                        },
                    },
                    {
                        $project:{
                            "name":1,
                            "faculty":{
                                "$arrayElemAt":["$faculty",0]
                            }
                        }
                    }
                ]
            }
        },
        {
            "$unset":[
                "subjects.faculty.password",]
        }
    ])


    res.status(200).json(new ApiResponse(200, subjects[0].subjects));
});

const getSubjectAccordingToFaculty = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { _id:userId } = res.locals.user;

    if(!userId){
        throw new ApiError(
            400,"user id is required"
        )
    }

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

    if (!subjectId) {
        throw new ApiError(400, "Subject id is required");
    }

    const detail = await Subject.aggregate([
        {
            "$match": {
                "_id": Types.ObjectId.createFromHexString(subjectId),
            },
        },
        {
            "$lookup": {
                "from": "courses",
                "localField": "courseId",
                "foreignField": "_id",
                "as": "course",
            },
        },
        {
            "$lookup": {
                "from": "faculties",
                "localField": "facultyId",
                "foreignField": "userId",
                "as": "faculty",
                "pipeline": [
                    {
                        "$lookup": {
                            "from": "users",
                            "localField": "userId",
                            "foreignField": "_id",
                            "as": "user",
                        },
                    },
                   
                ],
            },
        },
        {
            "$project":{
                "name":1,
                "course":{
                    "$arrayElemAt": ["$course", 0],
                },
                "faculty":{
                    "$arrayElemAt": ["$faculty", 0],
                },
            }
        },
        {
            "$unset":["user.password"]
        }
    ]);

    if (!detail.length) {
        throw new ApiError(500, "Subject not found");
    }

    res.status(200).json(new ApiResponse(200, detail[0]));
});

export {
    addSubject,
    getSubjectAccordingToStudent,
    getSubjectAccordingToFaculty,
    getSubject,
};
