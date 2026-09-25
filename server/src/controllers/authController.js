import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'studyhive_super_secret_jwt_key_cozy_library_2026';
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check duplicate username or email
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }
      return res.status(400).json({ message: 'Username is already taken by another bee.' });
    }

    // First user can be made admin automatically if username is admin, or we can check
    const isFirstUser = (await User.countDocuments()) === 0;
    const role = isFirstUser || username.toLowerCase() === 'admin' ? 'admin' : 'user';

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      role,
      isAdmin: role === 'admin',
      honey: 50,
      xp: 0,
      level: 1,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'Welcome to the StudyHive Library!',
      token,
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Failed to register. Please try again.', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'This account has been banned from the library.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: 'Welcome back to your desk!',
      token,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Failed to log in. Please try again.', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
};
