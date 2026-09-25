// Automated test script for Phase 2 Sessions & Tasks
const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

async function runSessionTests() {
  console.log('🧪 Starting Phase 2 Session & Task Tests on:', BASE_URL);

  // Step 1: Login or Register a test user
  const email = `scholar_p2_${Date.now()}@studyhive.dev`;
  const password = 'password123';
  const username = `p2_${Date.now().toString().slice(-5)}`;

  let token = '';
  try {
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(regData.message);
    token = regData.token;
    console.log(`✅ 1. Registered test user: ${username}`);
  } catch (err) {
    console.error('❌ User setup failed:', err.message);
    process.exit(1);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Step 2: Create a study session
  let sessionId = '';
  try {
    const sessRes = await fetch(`${BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        subject: 'Algorithms & Data Structures',
        deskId: 'desk_window',
        deskName: 'The Window Alcove',
        targetMinutes: 25,
      }),
    });
    const sessData = await sessRes.json();
    if (!sessRes.ok) throw new Error(sessData.message);
    sessionId = sessData.session._id;
    console.log(`✅ 2. Created Session: "${sessData.session.subject}" at ${sessData.session.deskName} (ID: ${sessionId})`);
  } catch (err) {
    console.error('❌ Create session failed:', err.message);
    process.exit(1);
  }

  // Step 3: Add tasks to the session
  let taskId1 = '';
  let taskId2 = '';
  try {
    const t1Res = await fetch(`${BASE_URL}/api/sessions/${sessionId}/tasks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ text: 'Review binary search trees' }),
    });
    const t1Data = await t1Res.json();
    if (!t1Res.ok) throw new Error(t1Data.message);
    taskId1 = t1Data.task._id;

    const t2Res = await fetch(`${BASE_URL}/api/sessions/${sessionId}/tasks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ text: 'Solve 3 graph practice problems' }),
    });
    const t2Data = await t2Res.json();
    if (!t2Res.ok) throw new Error(t2Data.message);
    taskId2 = t2Data.task._id;

    console.log(`✅ 3. Added 2 tasks to session (${taskId1}, ${taskId2})`);
  } catch (err) {
    console.error('❌ Add tasks failed:', err.message);
    process.exit(1);
  }

  // Step 4: Get tasks for session
  try {
    const getTasksRes = await fetch(`${BASE_URL}/api/sessions/${sessionId}/tasks`, {
      headers: authHeaders,
    });
    const getTasksData = await getTasksRes.json();
    if (!getTasksRes.ok) throw new Error(getTasksData.message);
    if (getTasksData.tasks.length !== 2) throw new Error('Expected 2 tasks, got ' + getTasksData.tasks.length);
    console.log(`✅ 4. Retrieved ${getTasksData.tasks.length} tasks successfully.`);
  } catch (err) {
    console.error('❌ Get tasks failed:', err.message);
    process.exit(1);
  }

  // Step 5: Mark task 1 as done
  try {
    const patchRes = await fetch(`${BASE_URL}/api/tasks/${taskId1}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ done: true }),
    });
    const patchData = await patchRes.json();
    if (!patchRes.ok) throw new Error(patchData.message);
    if (!patchData.task.done) throw new Error('Task done state was not updated');
    console.log(`✅ 5. Updated task "${patchData.task.text}" to done: ${patchData.task.done}`);
  } catch (err) {
    console.error('❌ Patch task failed:', err.message);
    process.exit(1);
  }

  // Step 6: Delete task 2
  try {
    const delRes = await fetch(`${BASE_URL}/api/tasks/${taskId2}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const delData = await delRes.json();
    if (!delRes.ok) throw new Error(delData.message);
    console.log(`✅ 6. Deleted task ${delData.taskId}`);
  } catch (err) {
    console.error('❌ Delete task failed:', err.message);
    process.exit(1);
  }

  // Step 7: Complete session (focusMinutes: 25, completed: true)
  try {
    const completeRes = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        focusMinutes: 25,
        completed: true,
      }),
    });
    const completeData = await completeRes.json();
    if (!completeRes.ok) throw new Error(completeData.message);
    console.log(`✅ 7. Completed session: focusMinutes=${completeData.session.focusMinutes}, completed=${completeData.session.completed}`);
  } catch (err) {
    console.error('❌ Complete session failed:', err.message);
    process.exit(1);
  }

  // Step 8: Verify session in history
  try {
    const historyRes = await fetch(`${BASE_URL}/api/sessions`, {
      headers: authHeaders,
    });
    const historyData = await historyRes.json();
    if (!historyRes.ok) throw new Error(historyData.message);
    const found = historyData.sessions.find((s) => s._id === sessionId);
    if (!found) throw new Error('Completed session not found in user history');
    console.log(`✅ 8. Verified session in user history (total sessions: ${historyData.sessions.length})`);
  } catch (err) {
    console.error('❌ Session history failed:', err.message);
    process.exit(1);
  }

  console.log('\n🎉 ALL PHASE 2 BACKEND SESSION & TASK TESTS PASSED SUCCESSFULLY!');
}

runSessionTests();
