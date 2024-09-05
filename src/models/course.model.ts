import mongoose, { Document, Schema, Types } from "mongoose";

// Define the interface for the Course document
interface ICourse extends Document {
    name: string; // Name of the course
    semester: number; // Semester in which the course is offered
    departmentId: Types.ObjectId; // Reference to the Department collection
}

// Define the Course schema
const courseSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique:true,
            index:true
        },
        semester: {
            type: Number,
            required: true,
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Department", // Link to the Department collection
            validate: {
                validator: async function (value: Types.ObjectId) {
                    // Check if the department exists in the Department collection
                    const departmentCount = await mongoose.model("Department").countDocuments({ _id: value });
                    return departmentCount > 0; // Returns true if the department exists
                },
                message: "Department does not exist", // Error message if the validation fails
            },
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

// Create the Course model
const Course = mongoose.model<ICourse>("Course", courseSchema);

export { Course, ICourse };
