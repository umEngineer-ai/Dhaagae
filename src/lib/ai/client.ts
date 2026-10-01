// DHAAGAÉ AI Core Client
// Supports OpenAI API with automatic graceful fallback when API quota is exhausted or offline

export interface AIMessageInput {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callOpenAI(
  messages: AIMessageInput[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'json_object' | 'text';
  } = {}
): Promise<{ success: boolean; content: string; source: 'openai' | 'fallback'; error?: string }> {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey || apiKey.startsWith('your-')) {
    return {
      success: false,
      content: '',
      source: 'fallback',
      error: 'AI_API_KEY not configured',
    };
  }

  try {
    const payload: Record<string, unknown> = {
      model: options.model || 'gpt-4o-mini',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1200,
    };

    if (options.responseFormat === 'json_object') {
      payload.response_format = { type: 'json_object' };
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn('OpenAI API returned error:', data?.error?.message || res.statusText);
      return {
        success: false,
        content: '',
        source: 'fallback',
        error: data?.error?.message || 'API request failed',
      };
    }

    const content = data?.choices?.[0]?.message?.content || '';
    return {
      success: true,
      content,
      source: 'openai',
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Network error';
    console.warn('OpenAI request error:', errorMessage);
    return {
      success: false,
      content: '',
      source: 'fallback',
      error: errorMessage,
    };
  }
}
