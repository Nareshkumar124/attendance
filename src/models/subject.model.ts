import mongoose, { Document, Schema, Types } from "mongoose";

// Define the interface for the Subject document
interface ISubject extends Document {
    name: string; // Name of the subject (e.g., DSA)
    courseId: Types.ObjectId; // Reference to the Course collection
    facultyId: Types.ObjectId; // Reference to the Faculty collection
}

// Define the Subject schema
const subjectSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // Ensure subject names are unique
        },

        courseId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Course",
            validate: {
                validator: async function (value: Types.ObjectId) {
                    // Check if the course exists in the Course collection
                    const courseCount = await mongoose
                        .model("Course")
                        .countDocuments({ _id: value });
                    return courseCount > 0; // Returns true if the course exists
                },
                message: "Course does not exist", // Error message if the validation fails
            }, // Link to the Course collection
        },
        facultyId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Faculty", // Link to the Faculty collection
            validate: {
                validator: async function (value: Types.ObjectId) {
                    // Check if the Faculty exists in the Faculty collection
                    const facultyCount = await mongoose
                        .model("Faculty")
                        .countDocuments({ _id: value });
                    return facultyCount > 0; // Returns true if the faculty exists
                },
                message: "Faculty does not exist", // Error message if the validation fails
            },
        },
    },
    {
        timestamps: true,
    }
);

// Create the Subject model
const Subject = mongoose.model<ISubject>("Subject", subjectSchema);

export { Subject, ISubject };
