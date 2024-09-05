import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the AcademicCalendar document
interface IAcademicCalendar extends Document {
  date: Date; // Date for the event
  dayType: 'working' | 'holiday' | 'missing'; // Type of the day
  description?: string; // Optional description of the event
}

// Define the Academic Calendar schema
const academicCalendarSchema: Schema = new Schema({
  date: {
    type: Date,
    required: true
  },
  dayType: {
    type: String,
    enum: ['working', 'holiday', 'missing'],
    required: true
  },
  description: {
    type: String,
    required: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  indexes: [
    { fields: { date: 1 }, unique: true } // Ensure each date is unique
  ]
});

// Create the Academic Calendar model
const AcademicCalendar = mongoose.model<IAcademicCalendar>('AcademicCalendar', academicCalendarSchema);

export {
    AcademicCalendar,IAcademicCalendar
};
