import { asyncHandler } from "../utils/handler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response, NextFunction } from "express";
import { getUserDataFromRequest, getUserData } from "./common";
import { UserRegisterData, register } from "./user.controller";
import { Faculty } from "../models/faculty.model";
import { User } from "../models/user.model";

const registerFaculty = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const user = await getUserDataFromRequest(req);

    const userWithRole = Object.assign(user, {
        role: "faculty",
    }) as UserRegisterData;

    const userInDb = await register(userWithRole);

    const facultyInDb = await Faculty.create({
        userId: userInDb._id,
        departmentId: userInDb.departmentId,
    });

    if (!facultyInDb) {
        User.deleteOne({ _id: userInDb._id });
        throw new ApiError(500, "Internal Server Error");
    }

    res.status(201).json(
        new ApiResponse(
            201,
            { userInDb, facultyInDb },
            "Faculty register successfully"
        )
    );
});

const getFaculty = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { _id } = res.locals.user;

    const userInDb = await getUserData(_id);

    const facultyInDb = await Faculty.findOne({ userId: _id });

    if (!facultyInDb) {
        throw new ApiError(500, "Internal Server Error");
    }

    res.status(200).json(
        new ApiResponse(200, { user:userInDb, faculty:facultyInDb }, "Faculty Data")
    );
});

const getAllFaculty = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {});

export { registerFaculty, getFaculty };
