import { Types } from "mongoose";
import { User } from "../models/user.model";
import { Request } from "express";
import { ApiError } from "../utils/ApiError";
import { IUser } from "../models/user.model";
import { Course } from "../models/course.model";
import { csvToJson } from "../utils/csvToJson";
import fs from "fs/promises";

/**
 * Get a user by ID
 *
 * @param {Types.ObjectId} userId - ID of the user
 * @returns {Promise<IUser>} - User data
 * @throws {ApiError} - If user is not found
 */
const getUserData = async function (userId: Types.ObjectId): Promise<IUser> {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};

/**
 * Extract user data from the request body and validate the fields
 *
 * @param {Request} req - Express request object
 * @returns {Promise<{auid: string, name: string, email: string, password: string, departmentId?: string}>} - User data
 * @throws {ApiError} - If any of the fields are missing or empty
 */
const getUserDataFromRequest = async function (req: Request): Promise<{
    auid: string;
    name: string;
    email: string;
    password: string;
    departmentId: string;
}> {
    const { auid, name, email, password, departmentId } = req.body;
    console.log(req.body);

    // Check if any of the fields are empty or not provided
    if (
        [auid, name, email, password, departmentId].some(
            (field) => field?.trim() === "" || !field
        )
    ) {
        throw new ApiError(
            400,
            "Auid, Name, Email, Password, department id is required"
        );
    }

    return { auid, name, email, password, departmentId };
};

const getUserDataFromObject=async function (obj:any):Promise<{
    auid: string;
    name: string;
    email: string;
    password: string;
    departmentId: string;
}> {

    const {auid, name, email, password, departmentId}=obj;

    // Check if any of the fields are empty or not provided
    // Check if any of the fields are empty or not provided
    if (
        [auid, name, email, password, departmentId].some(
            (field) => field?.trim() === "" || !field
        )
    ) {
        throw new ApiError(
            400,
            "Auid, Name, Email, Password, department id is required"
        );
    }

    return { auid, name, email, password, departmentId };

}

const courseExistsInDepartment = async function (
    departmentId: string,
    courseId: string
) {
    const courseCount = await Course.countDocuments({
        departmentId,
        _id: courseId,
    });

    return courseCount > 0;
};



const getDataFromCsvFile = async function (req: Request) {
    const file = req.file;

    if (!file) {
        throw new ApiError(400, "Csv file is required");
    }

    if (file.mimetype !== "text/csv") {
        throw new ApiError(400, "File must be a cvs file");
    }

    const filePath = file.path;

    const jsonArray = await csvToJson(filePath);

    fs.unlink(filePath);

    if (!jsonArray) {
        throw new ApiError(400, "Failed to parse file");
    }

    return jsonArray;
};

export {
    getUserData,
    getUserDataFromRequest,
    courseExistsInDepartment,
    getDataFromCsvFile,
    getUserDataFromObject
};
