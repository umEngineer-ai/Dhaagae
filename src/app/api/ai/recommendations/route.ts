import { NextResponse } from 'next/server';
import { getOutfitRecommendations } from '@/lib/ai/recommendations';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await getCurrentUser();

    const result = await getOutfitRecommendations(body);

    // Save recommendation to database
    try {
      await prisma.recommendation.create({
        data: {
          userId: user ? user.id : null,
          promptQuery: `Age: ${body.age || '3-5'}, Occasion: ${body.occasion || 'Festive'}, Color: ${body.color || 'Any'}`,
          inputFiltersJson: JSON.stringify(body),
          recommendedProductIds: JSON.stringify(result.recommendedProducts.map((p) => p.id)),
          reasoningText: result.summary,
          stylingNotes: result.curatorNotes,
        },
      });
    } catch (saveErr) {
      console.warn('Could not save recommendation record:', saveErr);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Recommendation API error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}
