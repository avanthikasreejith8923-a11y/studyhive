import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter for Authentication endpoints (login, register)
 * Prevents credential stuffing and brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts from this library terminal. Please try again after 15 minutes.',
  },
});

/**
 * Rate Limiter for AI Chatbot Assistant endpoint
 * Protects server-side LLM consumption and controls rate of API calls.
 */
export const assistantLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // max 20 queries per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'The StudyHive Scholar is receiving questions too quickly! Please pause for a moment before asking again.',
  },
});

/**
 * General API Limiter
 * Guards all incoming API traffic against flood / scraping attacks.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // generous allowance for active polling/presence while studying
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests sent to the library archives. Please slow down.',
  },
});
