import mongoose, { Document, Schema, Types } from 'mongoose';

// Define the interface for the Faculty document
interface IFaculty extends Document {
  userId: Types.ObjectId; // Reference to the User collection
  designation: string; // Faculty designation (e.g., Professor, Assistant Professor)
  departmentId: string; // Reference to the Department collection
}

// Define the Faculty schema
const facultySchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Link to the User collection
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Department' // Link to the Department collection
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create the Faculty model
const Faculty = mongoose.model<IFaculty>('Faculty', facultySchema);

export {
    Faculty,IFaculty
};
