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
            ref: "User",
            validate: {
                validator: async function (value: Types.ObjectId) {
                    const userCount = await mongoose.model("User").countDocuments({ _id: value });
                    return userCount > 0; 
                },
                message: "User does not exist", 
            },
        },
        courseId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Course", // Link to the Course collection
            validate: {
                validator: async function (value: Types.ObjectId) {
                    // Check if the course exists in the Course collection
                    const courseCount = await mongoose.model("Course").countDocuments({ _id: value });
                    return courseCount > 0; // Returns true if the course exists
                },
                message: "Course does not exist", // Error message if the validation fails
            },
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

// Create the Student model
const Student = mongoose.model<IStudent>("Student", studentSchema);

export { Student, IStudent };
