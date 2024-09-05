import mongoose, { Document, Schema,Types } from 'mongoose';

// Define the interface for the Subject document
interface ISubject extends Document {
  name: string; // Name of the subject (e.g., DSA)
  courseFaculties: {
    courseId: Types.ObjectId, // Reference to the Course collection
    facultyId: Types.ObjectId,// Reference to the Faculty collection
  }[]; // Array of course and faculty references
}

// Define the Subject schema
const subjectSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true // Ensure subject names are unique
  },
  courseFaculties: [{
    courseId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Course' // Link to the Course collection
    },
    facultyId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Faculty' // Link to the Faculty collection
    }
  }]
}, {
  timestamps: true
});

// Create the Subject model
const Subject = mongoose.model<ISubject>('Subject', subjectSchema);

export {
    Subject,ISubject
};
