import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [60, 'Subject cannot exceed 60 characters'],
    },
    deskId: {
      type: String,
      default: 'desk_window',
    },
    deskName: {
      type: String,
      default: 'The Window Alcove',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    focusMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetMinutes: {
      type: Number,
      default: 25,
      min: 1,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Session = mongoose.model('Session', sessionSchema);
