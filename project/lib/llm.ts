import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export async function generateQuote(category: string): Promise<{ text: string; author: string }> {
  const prompt = `Generate an inspiring quote about ${category}. Include the author. Format: "Quote" - Author`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a wise teacher who provides meaningful, authentic quotes. Always verify the quote and author are real."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 100,
    temperature: 0.7,
  });

  const response = completion.choices[0].message.content || '';
  const match = response.match(/"([^"]+)" - (.+)/);

  if (!match) {
    throw new Error('Failed to parse quote from LLM response');
  }

  return {
    text: match[1],
    author: match[2].trim()
  };
}