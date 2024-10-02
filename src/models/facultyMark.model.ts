import mongoose, { Schema, Document, Types } from "mongoose";

interface IFacultyMark extends Document {
    facultyId: string;
    mark: boolean;
    date: Date;
    subjectId: Types.ObjectId;
}

const facultyMarkSchema: Schema = new mongoose.Schema({
    facultyId: {
        type: Schema.Types.ObjectId,
        ref: "Faculty",
        required: true,
    },
    subjectId: {
        type: Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
        validate: {
            validator: async function (value: Types.ObjectId) {
                const subjectCount = await mongoose
                    .model("Subject")
                    .countDocuments({ _id: value });
                return subjectCount > 0;
            },
            message: "Subject does not exist",
        },
    },
    date: {
        type: Date,
        required: true,
        validate: {
            validator: async function (value: Date) {
                const workingDayCount = await mongoose
                    .model("AcademicCalendar")
                    .countDocuments({
                        date: value,
                        dayType: "working",
                    });
                return workingDayCount > 0;
            },
            message: "The date must be a working day",
        },
    },
});

const FacultyMark = mongoose.model("FacultyMark", facultyMarkSchema);

export { FacultyMark, IFacultyMark };
