import prisma from '../db';
import { callOpenAI } from './client';

export interface StyleAssistantResponse {
  message: string;
  recommendedProducts: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number | null;
    image: string;
    reason: string;
    stylingTip: string;
    fabric: string;
  }>;
  suggestedPrompts: string[];
}

export async function askStyleAssistant(
  userQuery: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  productContextId?: string
): Promise<StyleAssistantResponse> {
  // 1. Fetch real active catalog products to ground the AI recommendations
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      discountPrice: true,
      colors: true,
      fabric: true,
      occasion: true,
      style: true,
      ageRange: true,
      images: true,
    },
    take: 20,
  });

  const catalogSummary = allProducts.map((p) => {
    let primaryImage = '';
    try {
      const parsed = JSON.parse(p.images);
      primaryImage = Array.isArray(parsed) ? parsed[0] : p.images;
    } catch {
      primaryImage = p.images;
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      discountPrice: p.discountPrice,
      colors: p.colors,
      fabric: p.fabric,
      occasion: p.occasion,
      style: p.style,
      ageRange: p.ageRange,
      image: primaryImage,
    };
  });

  // Check if user is asking about a specific product
  let contextProduct = null;
  if (productContextId) {
    contextProduct = catalogSummary.find((p) => p.id === productContextId);
  }

  const systemPrompt = `You are the DHAAGAÉ Style Assistant, a warm, sophisticated fashion consultant for a luxury Pakistani handmade children's boutique (target age 3–5 years).
You help parents find the perfect frocks for Eid, weddings, birthdays, parties, and everyday royal elegance.
Brand aesthetic: Thread + Craft + Childhood + Elegance + Personalization. Warm ivory, soft rose, subtle zari, artisanal organza and raw silk.

CRITICAL GUARDRAIL:
You MUST ONLY recommend products from the provided catalog below. NEVER invent products or prices.
CATALOG:
${JSON.stringify(catalogSummary, null, 2)}

${contextProduct ? `User is currently viewing: ${JSON.stringify(contextProduct)}` : ''}

Respond in JSON format with:
{
  "message": "Warm, polite, conversational advice explaining the choice in high-fashion Pakistani craftsmanship terminology.",
  "recommendedProductIds": ["id1", "id2"],
  "reasons": { "id1": "Why it matches", "id2": "Why it matches" },
  "stylingTips": { "id1": "How to accessorize (e.g. khussa shoes, delicate floral hairband)", "id2": "Styling tip" },
  "suggestedPrompts": ["Follow up question 1", "Follow up question 2"]
}`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.slice(-4),
    { role: 'user' as const, content: userQuery },
  ];

  const aiRes = await callOpenAI(messages, { responseFormat: 'json_object', temperature: 0.6 });

  if (aiRes.success) {
    try {
      const parsed = JSON.parse(aiRes.content);
      const recommendedProducts = (parsed.recommendedProductIds || [])
        .map((id: string) => {
          const prod = catalogSummary.find((p) => p.id === id);
          if (!prod) return null;
          return {
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            price: prod.price,
            discountPrice: prod.discountPrice,
            image: prod.image,
            reason: parsed.reasons?.[id] || `Perfect match for ${prod.occasion} in luxurious ${prod.fabric}`,
            stylingTip: parsed.stylingTips?.[id] || 'Pair with soft velvet khussas and a matching silk hairband.',
            fabric: prod.fabric,
          };
        })
        .filter(Boolean);

      return {
        message: parsed.message || 'Here are our handcrafted selections tailored to your little one:',
        recommendedProducts,
        suggestedPrompts: parsed.suggestedPrompts || [
          'Can this frock be customized in a different color?',
          'What size should I choose for an average 4-year-old?',
          'Show me Eid collection outfits',
        ],
      };
    } catch (e) {
      console.error('Failed to parse AI Style response', e);
    }
  }

  // Graceful deterministic fallback using our intelligent matcher
  const queryLower = userQuery.toLowerCase();
  const matched = catalogSummary.filter((p) => {
    const text = `${p.name} ${p.colors} ${p.occasion} ${p.fabric} ${p.style}`.toLowerCase();
    const keywords = queryLower.split(/\s+/).filter((w) => w.length > 2);
    return keywords.some((k) => text.includes(k));
  });

  const selectedProds = matched.length > 0 ? matched.slice(0, 3) : catalogSummary.slice(0, 3);

  return {
    message: `Welcome to DHAAGAÉ! For your little one, we recommend our signature handcrafted pieces crafted from breathable pure cottons, raw silks, and delicate organza—featuring artisanal tilla and resham thread embroidery.`,
    recommendedProducts: selectedProds.map((prod) => ({
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      price: prod.price,
      discountPrice: prod.discountPrice,
      image: prod.image,
      reason: `Exquisitely tailored for ${prod.occasion} celebrations with soft hypoallergenic lining.`,
      stylingTip: `Pair with traditional embroidered khussas or metallic ballet flats and a matching organza clip.`,
      fabric: prod.fabric,
    })),
    suggestedPrompts: [
      'What size is best for a 4 year old girl?',
      'Can you show me frocks in soft pink or peach?',
      'Show me your Eid collection',
    ],
  };
}
