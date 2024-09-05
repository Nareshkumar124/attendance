import mongoose, { Document, Schema, Types } from "mongoose";

// Define the interface for the Student document
interface IStudent extends Document {
    userId: Types.ObjectId; // Reference to the User collection
    courseId: Types.ObjectId; // Reference to the Course collection
}

// Define the Student schema
const studentSchema: Schema = new Schema(
    {
        userId: {
            type: String,
            required: true,
            ref: "User", // Link to the User collection
        },
        courseId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Course", // Link to the Course collection
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

// Create the Student model
const Student = mongoose.model<IStudent>("Student", studentSchema);

export { Student, IStudent };
