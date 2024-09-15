import mongoose, { Document, Schema, Types } from "mongoose";

// Define the interface for the Attendance document
interface IAttendance extends Document {
  date: Date; // Date of attendance
  subjectId: Types.ObjectId; // Reference to the Subject collection
  studentId: Types.ObjectId; // Reference to the Student collection
}

// Define the Attendance schema
const attendanceSchema: Schema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      validate: {
        validator: async function (value: Date) {
          // Check if the date is a working day in the AcademicCalendar collection
          const workingDayCount = await mongoose
            .model("AcademicCalendar")
            .countDocuments({
              date: value,
              dayType: "working",
            });
          return workingDayCount > 0; // Return true if the date is a working day
        },
        message: "The date must be a working day", // Error message if validation fails
      },
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Subject",
      validate: {
        validator: async function (value: Types.ObjectId) {
          const subjectCount = await mongoose
            .model("Subject")
            .countDocuments({ _id: value });
          return subjectCount > 0;
        },
        message: "Subject does not exist",
      }, // Link to the Subject collection
    },
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Student",
      validate: {
        validator: async function (value: Types.ObjectId) {
          const studentCount = await mongoose
            .model("Student")
            .countDocuments({ _id: value });
          return studentCount > 0;
        },
        message: "Student does not exist",
      }, // Link to the Student collection
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Creating a composite unique index
attendanceSchema.index(
  { date: 1, subjectId: 1, studentId: 1 },
  { unique: true }
);

// Create the Attendance model
const Attendance = mongoose.model<IAttendance>("Attendance", attendanceSchema);

export { Attendance, IAttendance };
