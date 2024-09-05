import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";


interface IUser extends Document {
    auid: string;
    name: string;
    email: string;
    password: string;
    role: "student" | "faculty" | "admin";
    departmentId?: Types.ObjectId;

    isPasswordCorrect(password:String):Promise<boolean>;
    accessToken():String;
}

const userSchema: Schema = new Schema(
    {
        auid: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["student", "faculty", "admin"],
            required: true,
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: "Department",
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err: any) {
        next(err);
    }
});
userSchema.methods.accessToken = function (): string {
    let secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
        throw new ApiError(400, "Failed to load env file.");
    } else {
        return jwt.sign(
            {
                _id: this._id,
                role: this.role,
            },
            secret,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            }
        );
    }
};

userSchema.methods.isPasswordCorrect = async function (password: string) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export { User, IUser };
