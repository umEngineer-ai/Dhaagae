import { NextResponse } from 'next/server';
import { recommendChildSize } from '@/lib/ai/sizeAssistant';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.ageYears) {
      return NextResponse.json({ error: 'Child age in years is required' }, { status: 400 });
    }

    const result = await recommendChildSize({
      ageYears: parseFloat(body.ageYears),
      heightCm: body.heightCm ? parseFloat(body.heightCm) : undefined,
      chestInches: body.chestInches ? parseFloat(body.chestInches) : undefined,
      waistInches: body.waistInches ? parseFloat(body.waistInches) : undefined,
      frockLengthPreference: body.frockLengthPreference,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Size assistant error:', error);
    return NextResponse.json({ error: 'Failed to generate size recommendation' }, { status: 500 });
  }
}
