import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { DEFAULT_OWNED_ITEMS, DEFAULT_EQUIPPED_ITEMS } from '../config/itemCatalog.js';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    honey: {
      type: Number,
      default: 50, // Starting honey jar
      min: 0,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    streak: {
      type: Number,
      default: 1,
      min: 0,
    },
    totalFocusMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    ownedItems: {
      type: [String],
      default: DEFAULT_OWNED_ITEMS,
    },
    equippedItems: {
      hair: { type: String, default: DEFAULT_EQUIPPED_ITEMS.hair },
      outfit: { type: String, default: DEFAULT_EQUIPPED_ITEMS.outfit },
      accessory: { type: String, default: DEFAULT_EQUIPPED_ITEMS.accessory },
      deskDecor: { type: String, default: DEFAULT_EQUIPPED_ITEMS.deskDecor },
    },
    avatarConfig: {
      skinColor: { type: String, default: '#FDE68A' },
      hairStyle: { type: String, default: 'hair_curly' },
      outfit: { type: String, default: 'outfit_sweater' },
      accessory: { type: String, default: 'acc_glasses' },
      deskDecor: { type: String, default: 'decor_mug' },
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Exclude password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Indexes for fast lookups and administrative filtering
userSchema.index({ role: 1 });
userSchema.index({ isBanned: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model('User', userSchema);


