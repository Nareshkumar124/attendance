import mongoose, { Document, Schema } from "mongoose";

// Define the interface for the AcademicCalendar document
interface IAcademicCalendar extends Document {
    date: Date; // Date for the event
    dayType: "working" | "holiday"; // Type of the day
    description?: string; // Optional description of the event
}

// Define the Academic Calendar schema
const academicCalendarSchema: Schema = new Schema(
    {
        date: {
            type: Date,
            required: true,
            unique: true,
        },
        dayType: {
            type: String,
            enum: ["working", "holiday"],
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

// Create the Academic Calendar model
const AcademicCalendar = mongoose.model<IAcademicCalendar>(
    "AcademicCalendar",
    academicCalendarSchema
);

export { AcademicCalendar, IAcademicCalendar };
