const { PrismaClient } = require('@prisma/client');
const outfits = require('./outfits-20');

const prisma = new PrismaClient();

async function main() {
  console.log('Adding 20 curated Dhaagae outfit concepts...');

  let created = 0;
  let skipped = 0;

  for (const outfit of outfits) {
    const existing = await prisma.product.findUnique({ where: { slug: outfit.slug } });
    if (existing) {
      skipped += 1;
      continue;
    }

    let category = await prisma.category.findUnique({ where: { slug: outfit.categorySlug } });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: outfit.categorySlug
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          slug: outfit.categorySlug,
          description: 'Curated Pakistani fashion edit by Dhaagae.',
          displayOrder: 20,
        },
      });
    }

    const { categorySlug, imagePlaceholder, ...product } = outfit;

    await prisma.product.create({
      data: {
        ...product,
        categoryId: category.id,
        images: JSON.stringify(product.images),
        inventoryItems: {
          create: {
            quantity: product.stockQuantity,
            reorderLevel: 3,
          },
        },
      },
    });

    created += 1;
    console.log(`Created: ${product.name}`);
  }

  console.log(`Done. Created: ${created}; skipped existing: ${skipped}.`);
}

main()
  .catch((error) => {
    console.error('Outfit seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
