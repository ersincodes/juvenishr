import mongoose, { Schema, model, models } from "mongoose";

export type UserSettingsDocument = {
  _id: mongoose.Types.ObjectId;
  userId: string; // NextAuth user id (JWT sub)
  visibleColumns: string[];
  lastUpdated: Date;
  createdAt: Date;
};

const UserSettingsSchema = new Schema<UserSettingsDocument>(
  {
    userId: { type: String, required: true, index: true, unique: true },
    visibleColumns: { type: [String], default: [] },
    lastUpdated: { type: Date, default: () => new Date() },
  },
  { timestamps: { createdAt: true, updatedAt: "lastUpdated" } }
);

export const UserSettingsModel =
  (models.UserSettings as mongoose.Model<UserSettingsDocument>) ||
  model<UserSettingsDocument>("UserSettings", UserSettingsSchema);
