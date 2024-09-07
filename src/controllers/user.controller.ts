import { User, IUser } from "../models/user.model";
import { asyncHandler } from "../utils/handler";
import { NextFunction, Response, Request } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

interface UserRegisterData {
    auid: string;
    name: string;
    email: string;
    password: string;
    role: "student" | "faculty" | "admin";
    departmentId: String;
}

const register = async function (userData: UserRegisterData) {
    const user: IUser = await User.create(userData);

    if (!user) {
        throw new ApiError(500, "Internal Server Error");
    }

    return user;
};

const loginUser = asyncHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { auid, password } = req.body;
    if (!auid) {
        return new ApiError(400, "Auid is required");
    }
    if (!password) {
        return new ApiError(400, "Password is required");
    }

    const user = await User.findOne({ auid: auid });

    if (!user) {
        throw new ApiError(401, "User not register");
    }

    const passwordCorrectOrNot = await user.isPasswordCorrect(password);

    if (!passwordCorrectOrNot) {
        throw new ApiError(400, "Password is incorrect.");
    }
    const accessToken = user.accessToken();
    const userInDb = await User.findById(user._id).select("-password");




    res.status(200)
    .cookie("token",accessToken,{
        maxAge: 86400000,
        httpOnly: true,   
        secure: true,   
        sameSite:"none",
        
      })
    .json(
        new ApiResponse(
            200,
            {
                user: userInDb,
                accessToken,
            },
            "Login Successful"
        )
    );
});

const logoutUser = asyncHandler(async function (req:Request,res:Response,next:NextFunction) {
    res.status(200).clearCookie("token").json({message:"Logout Successful"});
}); 


export { register, loginUser, logoutUser,UserRegisterData };
