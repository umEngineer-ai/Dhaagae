import { NextResponse } from 'next/server';
import { generateCustomOutfitDesign } from '@/lib/ai/outfitDesigner';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { generateDesignConceptImage } from '@/lib/ai/imageGeneration';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await getCurrentUser();

    if (!body.dressType || !body.mainColor) {
      return NextResponse.json({ error: 'Dress type and primary color are required' }, { status: 400 });
    }

    const design = await generateCustomOutfitDesign(body);
    const generatedImageUrl = await generateDesignConceptImage(
      `${body.ageGroup || '4'} year old child, ${body.occasion}, ${body.mainColor} ${body.fabric} frock, ${body.sleeveStyle} sleeves, ${body.neckStyle} neckline, ${body.length} skirt, details: ${body.embroidery}. ${body.prompt || ''}`
    );

    // Save AI design in database
    let savedDesignId: string | null = null;
    try {
      if (!user) {
        return NextResponse.json({ ...design, generatedImageUrl, designId: null, requiresLoginToSave: true });
      }
      const saved = await prisma.aIDesign.create({
        data: {
          userId: user ? user.id : null,
          title: design.title,
          prompt: body.prompt || `Custom ${body.dressType} in ${body.mainColor}`,
          dressType: body.dressType,
          mainColor: body.mainColor,
          secondaryColor: body.secondaryColor || null,
          sleeveStyle: body.sleeveStyle || null,
          neckStyle: body.neckStyle || null,
          length: body.length || null,
          embroidery: body.embroidery || null,
          pattern: body.pattern || null,
          fabric: body.fabric || null,
          occasion: body.occasion || null,
          decorativeElements: Array.isArray(body.decorativeElements) ? body.decorativeElements.join(', ') : null,
          suggestedColors: JSON.stringify(design.colorPalette),
          customizationLevel: design.customizationLevel,
          estimatedPrice: design.estimatedPrice,
          generatedImageUrl,
        },
      });
      savedDesignId = saved.id;
    } catch (saveErr) {
      console.warn('Could not persist AI design:', saveErr);
    }

    return NextResponse.json({
      ...design,
      generatedImageUrl,
      designId: savedDesignId,
    });
  } catch (error) {
    console.error('Custom outfit designer API error:', error);
    return NextResponse.json({ error: 'Failed to generate custom frock design' }, { status: 500 });
  }
}
