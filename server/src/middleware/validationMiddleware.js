import { body, validationResult } from 'express-validator';

/**
 * Middleware to check express-validator results and format clean responses.
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      message: firstError.msg || 'Invalid input provided.',
      errors: errors.array().map((e) => ({ field: e.path || e.param, message: e.msg })),
    });
  }
  next();
};

/**
 * Validation rules for User Registration
 */
export const validateRegister = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required.')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores.')
    .escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be at least 6 characters long.'),
  handleValidationErrors,
];

/**
 * Validation rules for User Login
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
  handleValidationErrors,
];

/**
 * Validation rules for Session Creation
 */
export const validateCreateSession = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Study subject is required.')
    .isLength({ min: 1, max: 60 })
    .withMessage('Subject cannot exceed 60 characters.')
    .escape(),
  body('deskId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 40 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Invalid desk identifier.'),
  body('deskName')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .escape(),
  body('targetMinutes')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Target study interval must be between 1 and 180 minutes.'),
  handleValidationErrors,
];

/**
 * Validation rules for Task Creation and Updating
 */
export const validateTask = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Task text cannot be empty.')
    .isLength({ min: 1, max: 200 })
    .withMessage('Task cannot exceed 200 characters.')
    .escape(),
  handleValidationErrors,
];

/**
 * Validation rules for Hive Creation
 */
export const validateCreateHive = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Hive name is required.')
    .isLength({ min: 2, max: 40 })
    .withMessage('Hive name must be between 2 and 40 characters.')
    .escape(),
  body('topic')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Topic cannot exceed 60 characters.')
    .escape(),
  handleValidationErrors,
];

/**
 * Validation rules for Chat Messages
 */
export const validateMessage = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Message text cannot be empty.')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message cannot exceed 1000 characters.')
    .escape(),
  handleValidationErrors,
];
