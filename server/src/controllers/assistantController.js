/**
 * Study Assistant Chatbot Controller
 * Integrates server-side with Anthropic API (Claude)
 * Gracefully handles unconfigured API key, rate limits, and network errors.
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

    // Check if Anthropic API key is configured
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_anthropic_api_key')) {
      return res.status(200).json({
        configured: false,
        reply: "StudyHive Scholar is currently resting in the library archives! 📚 To activate live AI study assistance, please add your ANTHROPIC_API_KEY to server/.env and restart the server.",
        tip: "Once configured, I can break down study goals, explain difficult concepts, and provide Pomodoro tips right at your desk!",
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
      const errData = await response.json().catch(() => ({}));
      console.warn('Anthropic API returned status:', response.status, errData);

      if (response.status === 401) {
        return res.status(200).json({
          configured: false,
          reply: "⚠️ The configured Anthropic API key was not recognized or is unauthorized. Please double-check your key in server/.env.",
        });
      }

      if (response.status === 429) {
        return res.status(429).json({
          message: "The StudyHive Scholar is receiving high demand right now! Please wait a few seconds and ask again.",
        });
      }

      return res.status(502).json({
        message: errData.error?.message || "StudyHive Scholar encountered a hiccup connecting to the library archives. Please try again.",
      });
    }

    const data = await response.json();
    const replyText =
      data.content?.[0]?.text || "I'm thinking about that! Could you rephrase your question?";

    return res.status(200).json({
      configured: true,
      reply: replyText,
    });
  } catch (error) {
    console.error('Study Assistant Controller Error:', error);
    return res.status(500).json({
      message: 'Failed to communicate with Study Assistant. Please try again.',
      error: error.message,
    });
  }
};
