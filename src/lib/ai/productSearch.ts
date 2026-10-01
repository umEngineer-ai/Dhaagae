import prisma from '../db';
import { callOpenAI } from './client';

export interface ParsedSearchFilters {
  keyword?: string;
  category?: string;
  color?: string;
  occasion?: string;
  maxPrice?: number;
  minPrice?: number;
  fabric?: string;
  age?: string;
  style?: string;
}

export async function parseNaturalSearchQuery(query: string): Promise<ParsedSearchFilters> {
  const prompt = `You are the DHAAGAÉ AI Natural Language Search Parser for a Pakistani luxury children's clothing platform.
User query: "${query}"

Extract structured search filters from this query.
Return JSON:
{
  "keyword": "core keyword or empty",
  "category": "one of: Party Wear, Eid Collection, Wedding Collection, Birthday Collection, Everyday Frocks, Custom Frocks or null",
  "color": "e.g. Pink, Peach, White, Maroon, Gold or null",
  "occasion": "e.g. Eid, Wedding, Birthday, Party or null",
  "maxPrice": number in PKR or null (e.g. under 5000 => 5000),
  "minPrice": number in PKR or null,
  "fabric": "e.g. Silk, Organza, Cotton, Velvet, Chiffon or null",
  "age": "e.g. 3-4 Years, 4-5 Years or null",
  "style": "e.g. Anarkali, Peplum, A-Line or null"
}`;

  const res = await callOpenAI([{ role: 'user', content: prompt }], { responseFormat: 'json_object' });

  if (res.success) {
    try {
      const parsed = JSON.parse(res.content);
      return parsed;
    } catch {
      // fallback to regex parsing below
    }
  }

  // Graceful rule-based natural language parsing
  const q = query.toLowerCase();
  const filters: ParsedSearchFilters = { keyword: query };

  // Price parsing
  const underPriceMatch = q.match(/under\s+(\d+)/) || q.match(/below\s+(\d+)/) || q.match(/less than\s+(\d+)/);
  if (underPriceMatch) {
    filters.maxPrice = parseInt(underPriceMatch[1], 10);
  }

  // Occasions
  if (q.includes('eid')) filters.occasion = 'Eid';
  else if (q.includes('wedding') || q.includes('shaadi') || q.includes('barat') || q.includes('walima')) filters.occasion = 'Wedding';
  else if (q.includes('birthday')) filters.occasion = 'Birthday';
  else if (q.includes('party')) filters.occasion = 'Party Wear';

  // Colors
  const colors = ['pink', 'red', 'white', 'peach', 'gold', 'yellow', 'green', 'blue', 'maroon', 'plum', 'ivory', 'purple'];
  for (const c of colors) {
    if (q.includes(c)) {
      filters.color = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  // Fabrics
  const fabrics = ['silk', 'organza', 'cotton', 'velvet', 'chiffon', 'lawn', 'net'];
  for (const f of fabrics) {
    if (q.includes(f)) {
      filters.fabric = f.charAt(0).toUpperCase() + f.slice(1);
      break;
    }
  }

  // Age
  const ageMatch = q.match(/(\d+)\s*(?:years?|y|yr|yo|year old)/);
  if (ageMatch) {
    filters.age = `${ageMatch[1]} Years`;
  }

  return filters;
}

export async function searchProductsWithAI(naturalQuery: string) {
  const filters = await parseNaturalSearchQuery(naturalQuery);

  const whereClause: Record<string, unknown> = {};

  if (filters.maxPrice) {
    whereClause.price = { lte: filters.maxPrice };
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    include: { category: true },
    take: 30,
  });

  // Filter in memory for fuzzy text, color, occasion, fabric matches
  const filtered = products.filter((p) => {
    let match = true;
    const allText = `${p.name} ${p.description} ${p.colors} ${p.fabric} ${p.occasion} ${p.style} ${p.tags || ''}`.toLowerCase();

    if (filters.color && !p.colors.toLowerCase().includes(filters.color.toLowerCase())) {
      match = false;
    }
    if (filters.occasion && !p.occasion.toLowerCase().includes(filters.occasion.toLowerCase())) {
      match = false;
    }
    if (filters.fabric && !p.fabric.toLowerCase().includes(filters.fabric.toLowerCase())) {
      match = false;
    }

    if (!match && filters.keyword) {
      const words = naturalQuery.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      const hasWord = words.some((w) => allText.includes(w));
      if (hasWord) match = true;
    }

    return match;
  });

  return {
    parsedFilters: filters,
    products: filtered.length > 0 ? filtered : products.slice(0, 8),
  };
}
