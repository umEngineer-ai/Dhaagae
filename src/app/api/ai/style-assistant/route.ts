import { NextResponse } from 'next/server';
import { askStyleAssistant } from '@/lib/ai/styleAssistant';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { query, history = [], productContextId, conversationId } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    const result = await askStyleAssistant(query, history, productContextId);
    let persistedConversationId: string | undefined;

    // Save AI conversation and message history to database if logged in
    try {
      let convId = conversationId;
      if (convId && user) {
        const owned = await prisma.aIConversation.findFirst({ where: { id: convId, userId: user.id }, select: { id: true } });
        if (!owned) convId = undefined;
      }
      if (!convId && user) {
        const conv = await prisma.aIConversation.create({
          data: {
            userId: user.id,
            title: query.slice(0, 45) + (query.length > 45 ? '...' : ''),
            contextType: productContextId ? 'PRODUCT_CONTEXT' : 'STYLE_ASSISTANT',
          },
        });
        convId = conv.id;
      }
      persistedConversationId = convId;

      if (convId) {
        await prisma.aIMessage.createMany({
          data: [
            { conversationId: convId, role: 'user', content: query },
            {
              conversationId: convId,
              role: 'assistant',
              content: result.message,
              metadataJson: JSON.stringify({
                recommendedProducts: result.recommendedProducts,
                suggestedPrompts: result.suggestedPrompts,
              }),
            },
          ],
        });
      }
    } catch (saveErr) {
      console.warn('Could not persist AI message history:', saveErr);
    }

    return NextResponse.json({ ...result, conversationId: persistedConversationId });
  } catch (error) {
    console.error('Style assistant error:', error);
    return NextResponse.json({ error: 'Failed to process AI Style Assistant query' }, { status: 500 });
  }
}
