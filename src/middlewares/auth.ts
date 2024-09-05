import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/handler";
import { IUser, User } from "../models/user.model";
import jwt from "jsonwebtoken";

interface jwtPayload {
    _id: String;
    role: "student" | "faculty" | "admin";
}

const verifyJwt = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies["token"];

    // Check token is present or not
    if (!token) {
        throw new ApiError(400, "Token is required");
    }

    // get secret key
    const secret = process.env["ACCESS_TOKEN_SECRET"];
    if (!secret) {
        throw new ApiError(500, "Failed to load env file.");
    }

    // Decode token
    let decodedToken: jwtPayload;
    try {
        decodedToken = jwt.verify(token, secret) as jwtPayload;
    } catch (error: any) {
        throw new ApiError(400, "Token Verification Failed");
    }

    const user = await User.findById(decodedToken._id);
    if (!user) {
        throw new ApiError(401, "Invalid Access Token");
    }

    res.locals.user = user;
    next();
});

export { verifyJwt };
