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
    ref: 'User', // Link to the User collection
    validate: {
      validator: async function (value: Types.ObjectId) {
          const userCount = await mongoose.model("User").countDocuments({ _id: value });
          return userCount > 0; 
      },
      message: "User does not exist", 
  },
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Department',
    validate: {
      validator: async function (value: Types.ObjectId) {
          // Check if the department exists in the Department collection
          const departmentCount = await mongoose.model("Department").countDocuments({ _id: value });
          return departmentCount > 0; // Returns true if the department exists
      },
      message: "Department does not exist", // Error message if the validation fails
  }, // Link to the Department collection
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create the Faculty model
const Faculty = mongoose.model<IFaculty>('Faculty', facultySchema);

export {
    Faculty,IFaculty
};
