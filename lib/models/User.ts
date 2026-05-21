import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String },
    color: { type: String },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

const User = (mongoose.models && (mongoose.models as any).User) || mongoose.model('User', UserSchema);
export default User;
