export async function generateDesignConceptImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.IMAGE_GENERATION_API_KEY || process.env.AI_API_KEY;
  if (!apiKey || apiKey.startsWith('your-')) return null;
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-image-1', prompt: `Luxury Pakistani children's couture concept illustration. This is a fashion design concept, not a manufactured product. ${prompt}`, size: '1024x1024', quality: 'medium' }),
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return typeof data?.data?.[0]?.url === 'string' ? data.data[0].url : null;
  } catch {
    return null;
  }
}
