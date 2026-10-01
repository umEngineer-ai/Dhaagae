import prisma from '../db';
import { callOpenAI } from './client';

export interface RecommendationInput {
  age?: number | string;
  occasion?: string;
  color?: string;
  season?: string;
  style?: string;
  budgetMax?: number;
  fabric?: string;
}

export interface RecommendationResult {
  summary: string;
  recommendedProducts: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number | null;
    image: string;
    matchReason: string;
    accessories: string[];
    colorPalette: string[];
  }>;
  curatorNotes: string;
}

export async function getOutfitRecommendations(input: RecommendationInput): Promise<RecommendationResult> {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      discountPrice: true,
      colors: true,
      fabric: true,
      occasion: true,
      style: true,
      ageRange: true,
      images: true,
    },
    take: 25,
  });

  const catalog = products.map((p) => {
    let img = '';
    try {
      const arr = JSON.parse(p.images);
      img = Array.isArray(arr) ? arr[0] : p.images;
    } catch {
      img = p.images;
    }
    return { ...p, image: img };
  });

  const prompt = `You are the DHAAGAÉ AI Recommendation Engine.
A customer is looking for children's fashion with these parameters:
- Age: ${input.age || '3-5 years'}
- Occasion: ${input.occasion || 'Festive / Party'}
- Color Preference: ${input.color || 'Any'}
- Season: ${input.season || 'All season'}
- Style: ${input.style || 'Traditional or Modern Frock'}
- Budget Max: ${input.budgetMax ? 'PKR ' + input.budgetMax : 'Flexible'}
- Preferred Fabric: ${input.fabric || 'Soft silk, lawn or organza'}

From this catalog ONLY:
${JSON.stringify(catalog.map((c) => ({ id: c.id, name: c.name, price: c.price, colors: c.colors, fabric: c.fabric, occasion: c.occasion, style: c.style })))}

Return a JSON object:
{
  "summary": "Brief 1-2 sentence overview of the curated aesthetic",
  "productMatches": [
    {
      "id": "catalog product id",
      "matchReason": "Why this specific dress suits the parameters",
      "accessories": ["accessory 1", "accessory 2"],
      "colorPalette": ["#hex1", "#hex2"]
    }
  ],
  "curatorNotes": "Styling advice from DHAAGAÉ master craftsmen"
}`;

  const res = await callOpenAI([{ role: 'user', content: prompt }], { responseFormat: 'json_object' });

  if (res.success) {
    try {
      const data = JSON.parse(res.content);
      const matches = (data.productMatches || [])
        .map((m: { id: string; matchReason: string; accessories: string[]; colorPalette: string[] }) => {
          const item = catalog.find((c) => c.id === m.id);
          if (!item) return null;
          return {
            id: item.id,
            name: item.name,
            slug: item.slug,
            price: item.price,
            discountPrice: item.discountPrice,
            image: item.image,
            matchReason: m.matchReason,
            accessories: m.accessories || ['Embroidered headpiece', 'Silk khussa'],
            colorPalette: m.colorPalette || ['#E8C5C8', '#D4AF37'],
          };
        })
        .filter(Boolean);

      if (matches.length > 0) {
        return {
          summary: data.summary || 'Handpicked artisan ensembles for your child:',
          recommendedProducts: matches,
          curatorNotes: data.curatorNotes || 'Tailored with pure soft cotton lining to protect delicate young skin during long festive hours.',
        };
      }
    } catch (e) {
      console.error('Failed to parse AI Recommendation', e);
    }
  }

  // Graceful rule-based scoring fallback
  let scored = catalog.map((p) => {
    let score = 0;
    const txt = `${p.name} ${p.colors} ${p.occasion} ${p.fabric} ${p.style}`.toLowerCase();
    if (input.occasion && txt.includes(input.occasion.toLowerCase())) score += 5;
    if (input.color && txt.includes(input.color.toLowerCase())) score += 4;
    if (input.fabric && txt.includes(input.fabric.toLowerCase())) score += 3;
    if (input.budgetMax && p.price <= input.budgetMax) score += 3;
    return { ...p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3);

  return {
    summary: `Curated selection tailored for ${input.occasion || 'festive celebrations'} for age ${input.age || '3-5 years'}.`,
    recommendedProducts: top.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      discountPrice: p.discountPrice,
      image: p.image,
      matchReason: `Crafted from breathable ${p.fabric} with delicate detailing, ideal for children's comfort and festive splendor.`,
      accessories: ['Handmade organza flower bow', 'Traditional soft-soled velvet khussa', 'Delicate gold bangles'],
      colorPalette: ['#E0B0B4', '#D4AF37', '#FAF7F2'],
    })),
    curatorNotes:
      'All DHAAGAÉ outfits feature double-layer mulmul lining so seams never itch or irritate delicate skin during celebrations.',
  };
}
