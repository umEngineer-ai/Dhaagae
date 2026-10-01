import { NextResponse } from 'next/server';
import { generateProductCopy } from '@/lib/ai/productDescription';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();

    if (!body.name || !body.fabric || !body.color) {
      return NextResponse.json({ error: 'Product name, fabric, and color are required' }, { status: 400 });
    }

    const copy = await generateProductCopy({
      name: body.name,
      fabric: body.fabric,
      color: body.color,
      designDetails: body.designDetails || 'Hand-embroidered neckline with organza flare',
      occasion: body.occasion || 'Eid and Festive Celebrations',
      sizeInfo: body.sizeInfo,
    });

    return NextResponse.json(copy);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate product copy';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
