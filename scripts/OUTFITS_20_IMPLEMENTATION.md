Create a dedicated seed dataset for 20 additional women's Pakistani fashion outfits without changing existing products or clearing/recreating any users, orders, categories, or current products.

The app is Next.js 15 + Prisma + SQLite. Product model fields are:
name, slug, description, shortDescription, price, discountPrice, categoryId, availableSizes, ageRange, colors, fabric, occasion, style, stockQuantity, sku, tags, isFeatured, isNewArrival, isCustomizable, images, rating, reviewCount.
Existing categories include: eid-collection, wedding-collection, party-wear, birthday-collection, everyday-frocks, custom-frocks, new-arrivals.
Current public product assets are only:
floral-bloom-lawn-frock.jpg
lavender-bloom-kurta-set.jpg
rose-garden-tiered-frock.jpg
teal-heritage-kurta-set.jpg
vintage-polka-dot-frock.jpg

IMPORTANT:
- Do NOT invent image URLs that do not exist.
- Do NOT use external hotlinked images in seeded products.
- Do NOT overwrite existing seed products.
- Keep current database schema intact.
- Add a reusable data file, for example scripts/outfits-20.js, exporting exactly 20 product objects, plus a safe script such as scripts/seed-outfits-20.js that inserts them only when their slug does not already exist.
- Each new product must have a unique slug and SKU.
- Since there are no new image files available in the repo, use ONE existing local image as a temporary placeholder per product, chosen to visually fit the outfit, and add a clear imagePlaceholder=true field in the separate outfit data only (not Prisma Product). The seeding script must strip that helper field before create.
- Do not claim placeholder images are actual outfit photography.

Design direction:
Research current Pakistani fashion e-commerce presentation patterns from reputable websites such as Sana Safinaz, Gul Ahmed, Khaadi, and similar brands. Use those sites only for high-level design/product taxonomy inspiration: stitched 2-piece/3-piece suits, lawn, cambric, embroidered shirts, culottes, shalwar, frocks, co-ords, festive/wedding edits, pastel and jewel palettes, botanical/geometric prints, subtle embroidery, etc. Do not copy names, descriptions, photos, exact product text, or proprietary branding.

Create 20 visually and semantically distinct outfit concepts, mostly for girls/women rather than children's frocks, while preserving the existing Dhaagae Pakistani-fashion concept. Mix:
- 4 everyday lawn/cotton looks
- 4 embroidered/pret looks
- 4 festive/Eid looks
- 4 wedding/occasion looks
- 4 modern co-ords / contemporary Pakistani looks

Use realistic PKR pricing and varied discounts. Use sizes such as XS, S, M, L, XL where appropriate, and keep ageRange as "Adult". Ensure searchable tags and varied colors/fabrics/occasions/styles.

Suggested concept directions (do not copy wording; turn them into polished unique products):
1. Sage botanical lawn 2-piece with straight shirt + culotte
2. Ivory chikankari-style cotton kurta set
3. Terracotta block-print lawn suit
4. Powder blue striped co-ord
5. Rose quartz embroidered cambric shirt + trouser
6. Deep plum threadwork 2-piece
7. Mustard chikankari-inspired kurta + pants
8. Seafoam printed lawn shirt + culotte
9. Emerald festive embroidered 3-piece
10. Coral Eid jacquard kurta set
11. Midnight blue velvet-inspired winter festive suit
12. Champagne beige organza-detail formal set
13. Ruby red wedding ensemble with zardozi-inspired detailing
14. Dusty lilac baraat/walima outfit with sharara
15. Teal and antique gold formal anarkali set
16. Blush rose gharara-inspired occasion set
17. Black-and-ivory minimal co-ord
18. Olive utility-inspired Pakistani co-ord
19. Cobalt blue printed shirt + wide-leg trouser
20. Soft peach statement kurta + culotte

For each product write:
- polished fashion title
- concise 1–2 sentence card description
- 2–4 sentence full description
- price and optional sale price
- fabric
- 2–4 colors
- occasion
- style/silhouette
- sizes
- ageRange Adult
- stock 8–25
- rating 4.6–5.0
- reviewCount 6–35
- 6–10 useful tags
- isFeatured for around 6 items
- isNewArrival for around 10 items
- isCustomizable true for around 14 items
- local placeholder image path

Also create/update a small homepage/shop data presentation section only if necessary so the 20 new records are visible naturally. Do not redesign the whole app. Preserve current styling, components, filters, wishlist/cart/quick-view behavior, and routing.

Then:
1. Add scripts/outfits-20.js
2. Add scripts/seed-outfits-20.js
3. Update package.json with "db:seed:outfits": "node scripts/seed-outfits-20.js"
4. Run type/lint/build-safe validation if possible.
5. Commit changes to main with message: "Add 20 Pakistani fashion outfit concepts"
6. Return a concise summary listing changed files and validation status.

Do NOT modify prisma/schema.prisma unless absolutely required.