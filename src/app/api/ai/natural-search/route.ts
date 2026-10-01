import { NextResponse } from 'next/server';
import { searchProductsWithAI } from '@/lib/ai/productSearch';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const result = await searchProductsWithAI(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Natural Search error:', error);
    return NextResponse.json({ error: 'Failed to process AI search' }, { status: 500 });
  }
}
