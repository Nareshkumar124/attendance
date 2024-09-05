import mongoose, { Document, Schema } from "mongoose";

// Define the interface for the Department document
interface IDepartment extends Document {
    name: string; // Name of the department
}

// Define the Department schema
const departmentSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // Ensure department names are unique
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

// Create the Department model
const Department = mongoose.model<IDepartment>("Department", departmentSchema);


export { Department, IDepartment };
