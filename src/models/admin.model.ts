import mongoose, { Document, Schema,Types } from 'mongoose';

// Define the interface for the Admin document
interface IAdmin extends Document {
  userId: Types.ObjectId; // Reference to the User collection
  position: string; // Admin position (e.g., Registrar, IT Admin)
}

// Define the Admin schema
const adminSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Link to the User collection
  },
  position: {
    type: String,
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create the Admin model
const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

export {
    Admin,IAdmin
}
