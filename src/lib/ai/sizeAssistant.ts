import { callOpenAI } from './client';

export interface SizeRecommendationInput {
  ageYears: number;
  heightCm?: number;
  chestInches?: number;
  waistInches?: number;
  frockLengthPreference?: 'above-knee' | 'knee-length' | 'mid-calf' | 'floor-length';
}

export interface SizeRecommendationResult {
  recommendedSize: string;
  alternativeSize?: string;
  reasoning: string;
  standardMeasurements: {
    chest: string;
    waist: string;
    typicalHeight: string;
    standardFrockLength: string;
  };
  customTailoringAdvised: boolean;
  disclaimer: string;
}

export async function recommendChildSize(input: SizeRecommendationInput): Promise<SizeRecommendationResult> {
  const prompt = `You are the DHAAGAÉ Master Tailor & Size Consultant for handmade Pakistani children's frocks (ages 2 to 7, primary 3–5).
Child data:
- Age: ${input.ageYears} years old
- Height: ${input.heightCm ? input.heightCm + ' cm' : 'Standard'}
- Chest: ${input.chestInches ? input.chestInches + ' inches' : 'Standard'}
- Waist: ${input.waistInches ? input.waistInches + ' inches' : 'Standard'}
- Preferred Length: ${input.frockLengthPreference || 'knee-length'}

Return JSON:
{
  "recommendedSize": "e.g. 3-4Y or 4-5Y",
  "alternativeSize": "e.g. 4-5Y if between sizes",
  "reasoning": "Clear explanation considering Pakistani children's growth and comfort during festivities",
  "standardMeasurements": {
    "chest": "23-24 inches",
    "waist": "22 inches",
    "typicalHeight": "98-104 cm",
    "standardFrockLength": "24 inches"
  },
  "customTailoringAdvised": false
}`;

  const res = await callOpenAI([{ role: 'user', content: prompt }], { responseFormat: 'json_object' });

  const disclaimer = 'Note: This AI size recommendation is based on DHAAGAÉ standard Pakistani bespoke tailoring charts. Children grow at different rates—we recommend taking a tape measure and comparing chest and desired shoulder-to-hem length before finalizing your order.';

  if (res.success) {
    try {
      const data = JSON.parse(res.content);
      return {
        recommendedSize: data.recommendedSize || `${input.ageYears}-${input.ageYears + 1}Y`,
        alternativeSize: data.alternativeSize,
        reasoning: data.reasoning || `For a ${input.ageYears}-year-old child, this size offers comfortable room for movement and festive wear.`,
        standardMeasurements: data.standardMeasurements || {
          chest: '23-24 inches',
          waist: '22 inches',
          typicalHeight: '100-105 cm',
          standardFrockLength: '24 inches',
        },
        customTailoringAdvised: !!data.customTailoringAdvised,
        disclaimer,
      };
    } catch {
      // fallback below
    }
  }

  // Graceful standard Pakistani child sizing chart
  let rec = '3-4Y';
  let alt = '4-5Y';
  let chest = '23-24 in';
  let waist = '22 in';
  let len = '24 in';
  let height = '98-104 cm';

  if (input.ageYears <= 2) {
    rec = '2-3Y';
    alt = '3-4Y';
    chest = '21-22 in';
    waist = '20 in';
    len = '21 in';
    height = '86-94 cm';
  } else if (input.ageYears === 3) {
    rec = '3-4Y';
    alt = '4-5Y';
    chest = '22-23 in';
    waist = '21 in';
    len = '23 in';
    height = '95-102 cm';
  } else if (input.ageYears === 4) {
    rec = '4-5Y';
    alt = '5-6Y';
    chest = '24-25 in';
    waist = '22.5 in';
    len = '25 in';
    height = '103-110 cm';
  } else if (input.ageYears >= 5) {
    rec = '5-6Y';
    alt = '6-7Y';
    chest = '25-26 in';
    waist = '23.5 in';
    len = '27 in';
    height = '111-118 cm';
  }

  return {
    recommendedSize: rec,
    alternativeSize: alt,
    reasoning: `Based on your child's age (${input.ageYears} years), ${rec} ensures a graceful silhouette while providing enough ease for play and long party events. If you anticipate quick growth, ${alt} is also a practical choice.`,
    standardMeasurements: {
      chest,
      waist,
      typicalHeight: height,
      standardFrockLength: len,
    },
    customTailoringAdvised: false,
    disclaimer,
  };
}
