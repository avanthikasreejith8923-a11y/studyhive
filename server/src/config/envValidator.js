/**
 * Environment Variable Validator
 * Validates mandatory environment variables on server startup.
 * Halts execution immediately with clear, descriptive errors if misconfigured.
 */

export const validateEnv = () => {
  const errors = [];

  // 1. JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || typeof jwtSecret !== 'string' || jwtSecret.trim() === '') {
    errors.push('JWT_SECRET: Required for securing user sessions and authentication tokens.');
  } else if (jwtSecret.length < 16) {
    errors.push('JWT_SECRET: Secret is too short. It must be at least 16 characters long for security.');
  }

  // 2. PORT
  const port = process.env.PORT;
  if (port) {
    const portNum = Number(port);
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
      errors.push(`PORT: Must be a valid port number between 1 and 65535 (received: "${port}").`);
    }
  }

  // 3. CLIENT_URL
  const clientUrl = process.env.CLIENT_URL;
  if (clientUrl) {
    try {
      new URL(clientUrl);
    } catch (_) {
      errors.push(`CLIENT_URL: Must be a valid URL (e.g. "http://localhost:5173", received: "${clientUrl}").`);
    }
  }

  // If validation errors exist, display formatted error banner and exit cleanly
  if (errors.length > 0) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ StudyHive Server Startup Configuration Error');
    console.error('='.repeat(70));
    console.error('The server could not start because required environment variables are invalid:\n');
    errors.forEach((err, i) => console.error(`  ${i + 1}. ${err}`));
    console.error('\nPlease update server/.env with valid configuration values and restart.');
    console.error('='.repeat(70) + '\n');
    process.exit(1);
  }

  console.log('✅ Environment configuration validated successfully.');
};
