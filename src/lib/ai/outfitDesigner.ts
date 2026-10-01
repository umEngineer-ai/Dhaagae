import { callOpenAI } from './client';

export interface DesignYourFrockInput {
  prompt?: string;
  dressType: string;
  mainColor: string;
  secondaryColor?: string;
  sleeveStyle: string;
  neckStyle: string;
  length: string;
  embroidery: string;
  pattern?: string;
  fabric: string;
  occasion: string;
  decorativeElements?: string[];
  ageGroup?: string;
}

export interface GeneratedDesignResult {
  title: string;
  conceptDescription: string;
  colorPalette: { name: string; hex: string }[];
  suggestedFabric: string;
  craftsmanshipNotes: string;
  customizationLevel: string;
  estimatedPrice: number;
  svgVisualMockup: string; // Dynamic vector couture mockup showing the exact color, cut, and embroidery motifs!
  disclaimer: string;
}

// Generate realistic dynamic SVG fashion illustration based on chosen colors, dress type, and neckline
function generateFashionCoutureSVG(input: DesignYourFrockInput): string {
  const main = input.mainColor || '#E5989B';
  const secondary = input.secondaryColor || '#F7D1BA';
  const isAnarkali = input.dressType.toLowerCase().includes('anarkali') || input.length.toLowerCase().includes('floor');
  const hasZari = input.embroidery.toLowerCase().includes('zari') || input.embroidery.toLowerCase().includes('gold') || input.embroidery.toLowerCase().includes('tilla');
  const accentGold = hasZari ? '#D4AF37' : '#FFFFFF';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%" class="rounded-xl shadow-inner bg-gradient-to-b from-[#FFFDF9] to-[#F7F3EB]">
    <defs>
      <linearGradient id="fabricGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${main}" />
        <stop offset="60%" stop-color="${secondary}" />
        <stop offset="100%" stop-color="${main}" />
      </linearGradient>
      <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#C59B27" />
        <stop offset="50%" stop-color="#F3E5AB" />
        <stop offset="100%" stop-color="#D4AF37" />
      </linearGradient>
      <pattern id="stitchMotif" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="1.5" fill="${accentGold}" opacity="0.6"/>
        <path d="M 5,10 Q 10,5 15,10 Q 10,15 5,10" fill="none" stroke="${accentGold}" stroke-width="0.8" opacity="0.4"/>
      </pattern>
    </defs>

    <!-- Mannequin / Hanger Minimal Silhouette -->
    <path d="M 170,40 Q 200,20 230,40 L 250,55 L 150,55 Z" fill="#8C7A6B" opacity="0.4"/>
    <circle cx="200" cy="30" r="8" fill="none" stroke="#8C7A6B" stroke-width="2.5" opacity="0.4"/>

    <!-- Bodice -->
    <path d="M 160,55 Q 200,75 240,55 L 230,140 Q 200,148 170,140 Z" fill="url(#fabricGrad)" stroke="#B38D8F" stroke-width="1.5"/>
    <path d="M 160,55 Q 200,75 240,55 L 230,140 Q 200,148 170,140 Z" fill="url(#stitchMotif)"/>

    <!-- Sleeves -->
    ${
      input.sleeveStyle.toLowerCase().includes('sleeveless')
        ? ''
        : input.sleeveStyle.toLowerCase().includes('bell')
        ? `<path d="M 160,55 L 115,120 L 135,135 L 165,95 Z" fill="url(#fabricGrad)" stroke="#B38D8F"/>
           <path d="M 240,55 L 285,120 L 265,135 L 235,95 Z" fill="url(#fabricGrad)" stroke="#B38D8F"/>`
        : `<path d="M 160,55 L 130,105 L 145,115 L 168,85 Z" fill="url(#fabricGrad)" stroke="#B38D8F"/>
           <path d="M 240,55 L 270,105 L 255,115 L 232,85 Z" fill="url(#fabricGrad)" stroke="#B38D8F"/>`
    }

    <!-- Neckline Embroidered Collar -->
    <path d="M 175,55 Q 200,85 225,55" fill="none" stroke="url(#goldTrim)" stroke-width="3"/>
    <circle cx="200" cy="75" r="3" fill="${accentGold}"/>
    <circle cx="190" cy="70" r="2" fill="${accentGold}"/>
    <circle cx="210" cy="70" r="2" fill="${accentGold}"/>

    <!-- Waistband Belt / Handcrafted Dori -->
    <path d="M 168,138 Q 200,148 232,138" fill="none" stroke="url(#goldTrim)" stroke-width="4"/>
    <circle cx="200" cy="144" r="5" fill="#C59B27"/>
    <!-- Tassels -->
    <line x1="197" y1="148" x2="194" y2="175" stroke="#C59B27" stroke-width="1.5"/>
    <circle cx="194" cy="177" r="3" fill="${accentGold}"/>
    <line x1="203" y1="148" x2="206" y2="175" stroke="#C59B27" stroke-width="1.5"/>
    <circle cx="206" cy="177" r="3" fill="${accentGold}"/>

    <!-- Skirt / Flare / Gher -->
    ${
      isAnarkali
        ? `<path d="M 168,140 Q 90,260 70,410 Q 200,440 330,410 Q 310,260 232,140 Z" fill="url(#fabricGrad)" stroke="#B38D8F" stroke-width="1.5"/>
           <path d="M 168,140 Q 90,260 70,410 Q 200,440 330,410 Q 310,260 232,140 Z" fill="url(#stitchMotif)"/>
           <!-- Gher Kalis -->
           <path d="M 185,145 Q 150,280 130,420" stroke="${accentGold}" stroke-dasharray="3,3" stroke-width="1"/>
           <path d="M 215,145 Q 250,280 270,420" stroke="${accentGold}" stroke-dasharray="3,3" stroke-width="1"/>
           <path d="M 200,146 L 200,426" stroke="${accentGold}" stroke-dasharray="3,3" stroke-width="1"/>
           <!-- Hem Border -->
           <path d="M 70,410 Q 200,440 330,410 L 330,420 Q 200,450 70,420 Z" fill="url(#goldTrim)"/>`
        : `<path d="M 168,140 Q 110,240 100,350 Q 200,375 300,350 Q 290,240 232,140 Z" fill="url(#fabricGrad)" stroke="#B38D8F" stroke-width="1.5"/>
           <path d="M 168,140 Q 110,240 100,350 Q 200,375 300,350 Q 290,240 232,140 Z" fill="url(#stitchMotif)"/>
           <!-- Hem Border -->
           <path d="M 100,350 Q 200,375 300,350 L 300,362 Q 200,387 100,362 Z" fill="url(#goldTrim)"/>`
    }

    <!-- Delicate Brand Watermark -->
    <text x="200" y="475" text-anchor="middle" fill="#8C7A6B" font-family="serif" font-size="12" letter-spacing="3" opacity="0.7">DHAAGAÉ COUTURE CONCEPT</text>
  </svg>`;
}

export async function generateCustomOutfitDesign(input: DesignYourFrockInput): Promise<GeneratedDesignResult> {
  const prompt = `You are the master designer at DHAAGAÉ, an elite Pakistani children's custom couture house.
A customer has requested a custom frock design:
- Description: ${input.prompt || 'Custom bespoke baby frock'}
- Dress Type: ${input.dressType}
- Main Color: ${input.mainColor}
- Secondary Color: ${input.secondaryColor || 'Complementary tone'}
- Sleeve Style: ${input.sleeveStyle}
- Neck Style: ${input.neckStyle}
- Length: ${input.length}
- Embroidery: ${input.embroidery}
- Fabric: ${input.fabric}
- Occasion: ${input.occasion}
- Age: ${input.ageGroup || '3-5 Years'}

Create a royal, artisan couture description for the master tailors and the mother.
Return JSON:
{
  "title": "Evocative Urdu/English poetic title (e.g. 'Gul-e-Noor Embroidered Anarkali')",
  "conceptDescription": "Rich 2-3 paragraph couture breakdown explaining the cut, motif placement, and drape.",
  "colorPalette": [
    {"name": "Color 1", "hex": "#HEX"},
    {"name": "Color 2", "hex": "#HEX"},
    {"name": "Accent", "hex": "#HEX"}
  ],
  "suggestedFabric": "Exact fabric composition (e.g. Pure Organza overlay with Pakistani Raw Silk lining)",
  "craftsmanshipNotes": "Notes on tilla, resham, pearls, or hand-tacking",
  "customizationLevel": "Bespoke Masterpiece (High / Artisan)",
  "estimatedPrice": 9500
}`;

  const res = await callOpenAI([{ role: 'user', content: prompt }], { responseFormat: 'json_object' });

  const svgVisualMockup = generateFashionCoutureSVG(input);
  const disclaimer = 'Notice: This is an AI-generated fashion concept mockup created by DHAAGAÉ Couture Engine. Each garment is hand-stitched by our master artisans to your exact child measurements; slight artisanal variations celebrate the authentic handmade process.';

  if (res.success) {
    try {
      const data = JSON.parse(res.content);
      return {
        title: data.title || 'Bespoke DHAAGAÉ Custom Frock',
        conceptDescription: data.conceptDescription || 'A handcrafted heirloom frock created exclusively for your little princess.',
        colorPalette: data.colorPalette || [
          { name: 'Primary', hex: input.mainColor || '#E5989B' },
          { name: 'Secondary', hex: input.secondaryColor || '#F7D1BA' },
          { name: 'Gilded Zari', hex: '#D4AF37' },
        ],
        suggestedFabric: data.suggestedFabric || `${input.fabric} with breathable hypoallergenic cotton lining`,
        craftsmanshipNotes: data.craftsmanshipNotes || 'Delicate hand-embroidered resham motifs along neckline and hem with hand-rolled pipings.',
        customizationLevel: data.customizationLevel || 'Artisanal Hand-Crafted',
        estimatedPrice: typeof data.estimatedPrice === 'number' ? data.estimatedPrice : 8800,
        svgVisualMockup,
        disclaimer,
      };
    } catch (e) {
      console.error('Failed to parse Custom Outfit AI response', e);
    }
  }

  // Graceful bespoke fallback
  return {
    title: `Bespoke ${input.fabric} ${input.dressType}`,
    conceptDescription: `Designed for ${input.occasion}, this handcrafted frock features a tailored bodice in ${input.mainColor}, balanced with ${input.secondaryColor || 'soft accent hues'}. The ${input.sleeveStyle} sleeves and ${input.neckStyle} neckline are framed with artisanal ${input.embroidery} embroidery, flowing into an ethereal ${input.length} flare lined with cloud-soft mulmul.`,
    colorPalette: [
      { name: 'Main Shade', hex: input.mainColor.startsWith('#') ? input.mainColor : '#D68C93' },
      { name: 'Accent', hex: input.secondaryColor?.startsWith('#') ? input.secondaryColor : '#FCE8E6' },
      { name: 'Artisan Zari', hex: '#D4AF37' },
    ],
    suggestedFabric: `${input.fabric} with 100% breathable organic cotton lining`,
    craftsmanshipNotes: `Features handmade fabric potli buttons, delicate ${input.embroidery} threadwork, and reinforced soft seams.`,
    customizationLevel: 'Artisanal Hand-Crafted',
    estimatedPrice: 8500,
    svgVisualMockup,
    disclaimer,
  };
}
