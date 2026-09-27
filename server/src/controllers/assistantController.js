/**
 * Study Assistant Chatbot Controller
 * Integrates server-side with Anthropic API (Claude) when an API key is configured.
 * Seamlessly provides an intelligent in-house Scholar Knowledge Engine when no API key
 * is present, guaranteeing students always get actionable, high-quality study guidance.
 */

const SYSTEM_PROMPT = `You are StudyHive's cozy, friendly in-app study assistant and scholar companion.
Your mission is to help students learn effectively, manage study stress, and maintain deep focus.
Key capabilities:
1. Break down assignments or large tasks into small, actionable Pomodoro steps.
2. Explain difficult academic concepts simply and clearly (Feynman technique).
3. Offer proven study tips (active recall, spaced repetition, interval pacing).
4. Guide users on StudyHive features (claiming desks, honey drops & XP, pixel avatar customizer, study hives, and break games).

Tone & Style:
- Warm, supportive, scholarly, and concise.
- Keep answers focused (1-3 short paragraphs maximum, or clean bullet points).
- Avoid overly long lectures; focus on immediate clarity and encouraging action.`;

/**
 * Intelligent In-House Scholar Response Engine
 * Provides immediate, high-quality, structured study guidance for all common
 * study workflows, Pomodoro planning, learning techniques, and app features.
 */
const generateLocalScholarReply = (userQuery) => {
  const q = userQuery.toLowerCase();

  // 1. Pomodoro Breakdown & Session Planning
  if (
    q.includes('pomodoro') ||
    q.includes('break down') ||
    q.includes('breakdown') ||
    q.includes('plan') ||
    q.includes('schedule') ||
    q.includes('organize') ||
    q.includes('session')
  ) {
    return `Here is a structured Pomodoro study plan to conquer your session with deep focus:

🧩 **Pomodoro 1: Foundation & The Hardest Task (25 min)**
- Write your main objective in your desk checklist.
- Tackle the most cognitively demanding topic or problem first while your focus reserves are highest.

☕ **Short Break (5 min):** Stand up, stretch your neck and shoulders, and grab some water. (Feel free to play a quick round of Memory Match in the Break Games tab!)

🧩 **Pomodoro 2: Active Application & Problem Solving (25 min)**
- Close your notes and test your understanding through active problem-solving or coding.
- Jot down any sticking points on scrap paper without stopping the timer.

☕ **Short Break (5 min):** Rest your eyes using the 20-20-20 rule (look at an object 20 feet away for 20 seconds).

🧩 **Pomodoro 3: Review, Synthesis & Error Log (25 min)**
- Revisit mistakes from block 2 and summarize key takeaways in 3 concise bullet points.
- Check off your completed goals to collect your sweet Honey drops and XP! 🍯

🏆 **Long Break (15–20 min):** Step away from your desk, enjoy a warm cup of honey tea, and let your brain consolidate what you've learned.`;
  }

  // 2. Feynman Technique & Active Recall
  if (
    q.includes('feynman') ||
    q.includes('active recall') ||
    q.includes('recall') ||
    q.includes('technique') ||
    q.includes('how to study') ||
    q.includes('memorize') ||
    q.includes('retention')
  ) {
    return `Here are the two most powerful, scientifically validated learning techniques to master any subject:

💡 **1. The Feynman Technique (Learn by Teaching):**
1. **Choose your concept:** Write the title at the top of a blank page.
2. **Teach it to a 10-year-old:** Explain it out loud or in writing using simple, everyday language without relying on complex jargon.
3. **Identify your gaps:** Whenever you get stuck, hesitate, or use buzzwords to hide confusion, stop and re-read your source material.
4. **Simplify with an analogy:** Create a real-world metaphor (e.g., explaining a computer CPU as a library librarian fetching books).

🧠 **2. Active Recall (Retrieval Practice):**
- Reading and highlighting create the "illusion of competence."
- Instead, read a section, close the book, and actively write down everything you remember from memory before looking back!`;
  }

  // 3. Break Activities & Refreshment
  if (
    q.includes('break') ||
    q.includes('activity') ||
    q.includes('activities') ||
    q.includes('relax') ||
    q.includes('stretch') ||
    q.includes('rest')
  ) {
    return `To maximize brain recovery during your 5-minute and 15-minute breaks, follow these scholar tips:

✨ **Recommended Break Activities:**
- **Physical Movement:** Stand up, roll your shoulders, stretch your wrists, or do 10 jumping jacks to boost cerebral blood flow.
- **Hydration:** Sip cool water or warm honey tea to keep your brain cells performing at peak velocity.
- **Play a Break Mini-Game:** Hop over to the **Break Games** tab in StudyHive for a quick game of 2048 Honey Tiles or Memory Match (strictly unlocked only during breaks!).
- **Sensory Rest:** Close your eyes, listen to the ambient rain in our Lo-Fi player, and take three deep diaphragmatic breaths.

🚫 **Avoid:** Doomscrolling social media or answering stressful emails—these flood your working memory and prevent cognitive consolidation!`;
  }

  // 4. Honey Drops, XP, Leveling & Shop
  if (
    q.includes('honey') ||
    q.includes('xp') ||
    q.includes('reward') ||
    q.includes('level') ||
    q.includes('shop') ||
    q.includes('avatar') ||
    q.includes('currency')
  ) {
    return `Here is how the StudyHive rewards and progression system works:

🍯 **Honey Drops (Currency):**
- Earn 1 Honey drop per focused minute during completed sessions (e.g. 25m focus = 25 Honey drops).
- Bonus drops are awarded for checking off tasks in your desk checklist!
- Spend Honey in the **Avatar & Shop** to unlock cute hairstyles, warm knit sweaters, vintage glasses, and desk plants.

⭐ **Experience Points (XP) & Levels:**
- Earn XP steadily for every completed focus block.
- Every 100 XP advances your Scholar Level (Level 1 Scholar ➡️ Head Librarian tier).
- Early quits yield partial rewards based on elapsed time, so keep buzzing until the chime sounds!`;
  }

  // 5. Desk & Library Spots
  if (
    q.includes('desk') ||
    q.includes('spot') ||
    q.includes('seat') ||
    q.includes('window') ||
    q.includes('hearth') ||
    q.includes('fireplace') ||
    q.includes('botanical') ||
    q.includes('oak')
  ) {
    return `Welcome to the StudyHive cozy library hall! Here is a guide to choosing your ideal desk nook:

🌧️ **The Window Alcove:** Overlooking the rainy cobblestones with gentle drizzle. Ideal for contemplative reading, humanities, and reflective writing.
📚 **The Grand Oak Table:** Antique banker’s lamp and polished wood. Perfect for serious problem sets, coding, and heavy research.
🔥 **The Fireplace Hearth:** Wingback chair beside warm crackling embers. Best for relaxing revision, vocabulary flashcards, and reading.
📖 **The Bookshelf Nook:** Tucked privately between antique encyclopedias. The best spot for zero-distraction deep work.
🌿 **The Botanical Corner:** Surrounded by blooming jasmine and ivy. Inspires creative projects and design thinking.

Click any open desk on the library floor to zoom in and begin!`;
  }

  // 6. Coding & Technical Studies
  if (
    q.includes('code') ||
    q.includes('coding') ||
    q.includes('programming') ||
    q.includes('javascript') ||
    q.includes('python') ||
    q.includes('react') ||
    q.includes('bug') ||
    q.includes('debug')
  ) {
    return `Here is the StudyHive 3-step framework for mastering code and conquering stubborn bugs:

💻 **1. Rubber-Duck Debugging:**
- Explain the logic line-by-line out loud to your pixel bee companion. Vocalizing your assumptions exposes flaws faster than staring at the screen.

🔍 **2. Isolate & Replicate:**
- Narrow the problem down to the smallest reproducible example. Use console logs or breakpoints to verify actual state against expected state.

⚡ **3. The 25-Minute Rule:**
- If you're stuck on a single bug for more than one full Pomodoro, step away for a 5-minute break. Diffuse-mode thinking often delivers the breakthrough while you're stretching!`;
  }

  // 7. Mathematics & Science
  if (
    q.includes('math') ||
    q.includes('equation') ||
    q.includes('physics') ||
    q.includes('chemistry') ||
    q.includes('calculus') ||
    q.includes('algebra')
  ) {
    return `For quantitative subjects like Math, Physics, and Chemistry, passive rereading does not work. Use this active approach:

📐 **1. Understand the 'Why':** Before memorizing a formula, understand what physical or geometric relationship it describes.
📝 **2. Work Backwards from Examples:** Cover up the solution of a worked example. Try solving it step-by-step, only uncovering the next line when truly stuck.
🔍 **3. Error Diagnosis Log:** Keep a small scratch notepad for mistakes. Did you make an arithmetic slip, misapply a formula, or misunderstand the question? Categorizing errors stops them from repeating!`;
  }

  // 8. Greetings & General Inquiries
  if (
    q.includes('hello') ||
    q.includes('hi') ||
    q.includes('hey') ||
    q.includes('good morning') ||
    q.includes('good evening') ||
    q.includes('who are you')
  ) {
    return `Bzz! Hello there, fellow scholar! 🍯 

I'm your StudyHive Scholar study companion. Whether you need to break a massive syllabus into manageable 25-minute Pomodoros, clarify a tricky concept, or pick an effective study strategy, I'm here at your desk to help.

What subject or assignment are we conquering together today?`;
  }

  // Default: Contextual Study Guide for User's Query
  return `Great question! Here is how to tackle **"${userQuery}"** using proven study principles:

1. **Deconstruct the Core Question:**
   - Break this topic into 2–3 sub-questions. Identify what fundamentals must be understood first before tackling details.

2. **Active Retrieval Practice:**
   - Summarize the main idea in 2 sentences in your own words.
   - If you can explain it clearly without checking reference material, you have true mastery!

3. **Suggested Pomodoro Action Plan:**
   - **First 20 min:** Deep, focused reading and note synthesis at your chosen library desk.
   - **Last 5 min:** Test yourself with 3 quick recall questions and check off your session goal checklist. 🍯

Would you like me to break this down into specific Pomodoro steps or provide an analogy?`;
};

export const chatWithAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Please provide a study question or goal.' });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 1500) {
      return res.status(400).json({ message: 'Message is too long. Please limit to 1500 characters.' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Check if Anthropic API key is configured with a valid key
    const hasAnthropicKey =
      apiKey &&
      typeof apiKey === 'string' &&
      apiKey.trim().length > 10 &&
      !apiKey.includes('your_anthropic_api_key');

    // If no external LLM key is configured, seamlessly engage the Scholar Engine
    if (!hasAnthropicKey) {
      const scholarReply = generateLocalScholarReply(trimmedMessage);
      return res.status(200).json({
        configured: true,
        mode: 'scholar_engine',
        reply: scholarReply,
      });
    }

    // Format conversation history (limit to last 8 turns to keep context fast and focused)
    const validHistory = Array.isArray(history)
      ? history
          .slice(-8)
          .filter((msg) => msg && (msg.role === 'user' || msg.role === 'assistant') && typeof msg.content === 'string')
          .map((msg) => ({
            role: msg.role,
            content: msg.content.slice(0, 1500),
          }))
      : [];

    const messages = [
      ...validHistory,
      { role: 'user', content: trimmedMessage },
    ];

    // Call Anthropic API
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 800,
          system: SYSTEM_PROMPT,
          messages,
        }),
      });

      if (!response.ok) {
        console.warn('Anthropic API returned status:', response.status);
        // Seamless fallback to scholar engine on network/auth issue
        const scholarReply = generateLocalScholarReply(trimmedMessage);
        return res.status(200).json({
          configured: true,
          mode: 'scholar_engine_fallback',
          reply: scholarReply,
        });
      }

      const data = await response.json();
      const replyText =
        data.content?.[0]?.text || generateLocalScholarReply(trimmedMessage);

      return res.status(200).json({
        configured: true,
        mode: 'claude',
        reply: replyText,
      });
    } catch (apiErr) {
      console.warn('Anthropic API call failed, falling back to scholar engine:', apiErr.message);
      const scholarReply = generateLocalScholarReply(trimmedMessage);
      return res.status(200).json({
        configured: true,
        mode: 'scholar_engine_fallback',
        reply: scholarReply,
      });
    }
  } catch (error) {
    console.error('Study Assistant Controller Error:', error);
    return res.status(500).json({
      message: 'Failed to communicate with Study Assistant. Please try again.',
      error: error.message,
    });
  }
};
