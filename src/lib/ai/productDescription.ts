import { callOpenAI } from './client';

export interface AdminProductDescriptionInput {
  name: string;
  fabric: string;
  color: string;
  designDetails: string;
  occasion: string;
  sizeInfo?: string;
}

export interface GeneratedProductCopy {
  description: string;
  shortDescription: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
}

export async function generateProductCopy(input: AdminProductDescriptionInput): Promise<GeneratedProductCopy> {
  const prompt = `You are a luxury fashion copywriter and SEO specialist for DHAAGAÉ, an artisanal Pakistani children's custom boutique.
Product details:
- Name: ${input.name}
- Fabric: ${input.fabric}
- Color: ${input.color}
- Design details: ${input.designDetails}
- Occasion: ${input.occasion}
- Size: ${input.sizeInfo || '3-5 Years (customizable)'}

Write poetic, persuasive, and SEO-optimized e-commerce copy. Emphasize handmade craftsmanship, skin-friendly mulmul lining, delicate zari/resham embroidery, and festive splendor.

Return JSON:
{
  "description": "Rich 2-3 paragraph product description highlighting artisanal heritage, pure fabrics, and tailoring details.",
  "shortDescription": "1-2 sentence compelling summary for product cards and quick views.",
  "seoTitle": "SEO Title under 60 chars | DHAAGAÉ Pakistan",
  "seoDescription": "Meta description under 155 chars engaging buyers looking for luxury kids party wear.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"]
}`;

  const res = await callOpenAI([{ role: 'user', content: prompt }], { responseFormat: 'json_object' });

  if (res.success) {
    try {
      const data = JSON.parse(res.content);
      return {
        description: data.description,
        shortDescription: data.shortDescription,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        tags: Array.isArray(data.tags) ? data.tags : ['Handmade Frock', 'Kids Eid Wear', 'Pakistani Couture'],
      };
    } catch {
      // fallback below
    }
  }

  // Graceful bespoke fallback
  return {
    description: `Imbued with the timeless charm of Pakistani artisan craft, the ${input.name} is meticulously handcrafted in ${input.color} utilizing premium ${input.fabric}. Featuring ${input.designDetails}, this exquisite ensemble is designed specifically for memorable ${input.occasion} celebrations.\n\nEvery seam is lined with ultra-soft breathable cotton to ensure day-long comfort for delicate young skin, while the hand-finished embroidery adds an unmistakable touch of regal elegance.`,
    shortDescription: `A handcrafted ${input.color} ${input.fabric} frock with ${input.designDetails}, exquisitely tailored for ${input.occasion}.`,
    seoTitle: `${input.name} | Handmade Kids Frock | DHAAGAÉ`,
    seoDescription: `Shop ${input.name} in ${input.color} at DHAAGAÉ. Hand-embroidered luxury children's festive frock in ${input.fabric} for Eid, weddings, and parties.`,
    tags: [
      'Kids Frock',
      'Pakistani Children Wear',
      input.color,
      input.occasion,
      input.fabric,
      'Handmade Dress',
      'Custom Frock',
    ],
  };
}
