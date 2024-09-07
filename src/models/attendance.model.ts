import mongoose, { Document, Schema,Types } from 'mongoose';

// Define the interface for the Attendance document
interface IAttendance extends Document {
  date: Date; // Date of attendance
  subjectId: Types.ObjectId; // Reference to the Subject collection
  studentId: Types.ObjectId; // Reference to the Student collection
  status: 'present' | 'absent' ; // Attendance status
}

// Define the Attendance schema
const attendanceSchema: Schema = new Schema({
  date: {
    type: Date,
    required: true
  },
  subjectId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Subject',
    validate: {
      validator: async function (value: Types.ObjectId) {
          
          const subjectCount = await mongoose.model("Subject").countDocuments({ _id: value });
          return subjectCount > 0; 
      },
      message: "Subject does not exist", 
  }, // Link to the Subject collection
  },
  studentId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Student',
    validate: {
      validator: async function (value: Types.ObjectId) {
          
          const studentCount = await mongoose.model("Student").countDocuments({ _id: value });
          return studentCount > 0; 
      },
      message: "Student does not exist", 
  }, // Link to the Student collection
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  indexes: [
    { fields: { date: 1, subjectId: 1, studentId: 1 }, unique: true } // Composite unique index
  ]
});

// Create the Attendance model
const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);

export  {
    Attendance,IAttendance
};
