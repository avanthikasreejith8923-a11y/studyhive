// Automated test script for Phase 1 Authentication
const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting Phase 1 Authentication Tests on:', BASE_URL);

  // 1. Health check
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log('✅ 1. Health Check:', healthData.message);
  } catch (err) {
    console.error('❌ Server is not responding at', BASE_URL, err.message);
    process.exit(1);
  }

  const testUser = {
    username: `scholar_${Date.now().toString().slice(-4)}`,
    email: `scholar_${Date.now()}@studybee.dev`,
    password: 'password123',
  };

  // 2. Register
  let token = '';
  try {
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(regData.message);
    token = regData.token;
    console.log(`✅ 2. Register Success: Welcome ${regData.user.username}, Starter Honey: ${regData.user.honey}`);
  } catch (err) {
    console.error('❌ Register failed:', err.message);
    process.exit(1);
  }

  // 3. Login
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message);
    console.log('✅ 3. Login Success: Token received, User verified.');
  } catch (err) {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  }

  // 4. Verify /api/auth/me
  try {
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    if (!meRes.ok) throw new Error(meData.message);
    console.log(`✅ 4. Auth/Me verified: ${meData.user.username} (${meData.user.role}) with ${meData.user.honey} Honey`);
  } catch (err) {
    console.error('❌ Auth/Me failed:', err.message);
    process.exit(1);
  }

  console.log('\n🎉 ALL PHASE 1 AUTHENTICATION TESTS PASSED SUCCESSFULLY!');
}

runTests();
