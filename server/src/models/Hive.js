import mongoose from 'mongoose';

const deskOccupantSchema = new mongoose.Schema(
  {
    deskId: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      default: 'General Study',
      trim: true,
    },
    seatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const hiveSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hive name is required'],
      trim: true,
      minlength: [2, 'Hive name must be at least 2 characters'],
      maxlength: [40, 'Hive name cannot exceed 40 characters'],
    },
    topic: {
      type: String,
      trim: true,
      default: 'Cozy Library Study Session',
      maxlength: [60, 'Topic cannot exceed 60 characters'],
    },
    joinCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    desks: [deskOccupantSchema],
    timerState: {
      mode: {
        type: String,
        enum: ['focus', 'shortBreak', 'longBreak'],
        default: 'focus',
      },
      duration: {
        type: Number,
        default: 25 * 60, // 25 minutes in seconds
      },
      remainingSeconds: {
        type: Number,
        default: 25 * 60,
      },
      isRunning: {
        type: Boolean,
        default: false,
      },
      startedAt: {
        type: Date,
        default: null,
      },
      endsAt: {
        type: Number, // Epoch timestamp in ms when running timer expires
        default: null,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Hive = mongoose.model('Hive', hiveSchema);
