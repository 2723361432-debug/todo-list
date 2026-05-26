import 'dotenv/config';

/**
 * Call the OpenAI-compatible chat completions endpoint.
 * @param {Array<{role: string, content: string}>} messages
 * @param {number} temperature
 * @param {number} timeoutMs
 * @returns {Promise<string>} the assistant message content
 */
export async function chatCompletion(messages, temperature = 0.7, timeoutMs = 30000) {
  const baseUrl = process.env.AI_API_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  if (!baseUrl || !apiKey) {
    throw new Error('AI API is not configured: missing AI_API_BASE_URL or AI_API_KEY');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`AI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
      throw new Error('AI API returned unexpected response shape');
    }

    return content;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`AI API request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
