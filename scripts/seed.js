const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("🌸 Seeding DHAAGAÉ Luxury Children's Couture Platform with New Uploaded Products...");

  // 1. Clean existing records safely
  try {
    await prisma.notification.deleteMany();
    await prisma.recommendation.deleteMany();
    await prisma.aIDesign.deleteMany();
    await prisma.aIMessage.deleteMany();
    await prisma.aIConversation.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.review.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.orderCustomization.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.address.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.productTag.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.log('Cleaned tables or skipped empty tables');
  }

  // 2. Create Users (Admin & Customer)
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123456', salt);
  const customerPassword = await bcrypt.hash('customer123456', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@dhaagae.com',
      passwordHash: adminPassword,
      name: 'Syeda Fatima (Master Artisan & Director)',
      role: 'ADMIN',
      phone: '+92 300 1234567',
      profile: {
        create: {
          bio: 'Founder and Creative Director at DHAAGAÉ. Preserving heritage craftsmanship for little angels.',
        },
      },
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'ayesha.khan@example.com',
      passwordHash: customerPassword,
      name: 'Ayesha Khan',
      role: 'CUSTOMER',
      phone: '+92 321 9876543',
      profile: {
        create: {
          bio: 'Mother of two little princesses (ages 3 and 5). Loves traditional Pakistani embroidery.',
          childAge: 4,
          childGender: 'female',
          preferredSize: '4-5Y',
        },
      },
      addresses: {
        create: {
          fullName: 'Ayesha Khan',
          phone: '+92 321 9876543',
          addressLine1: 'House 42, Street 8, Sector F-7/2',
          city: 'Islamabad',
          province: 'Federal',
          postalCode: '44000',
          isDefault: true,
        },
      },
    },
  });

  console.log('✅ Users seeded: admin@dhaagae.com & ayesha.khan@example.com');

  // 3. Create Categories with new product image references
  const categoriesData = [
    {
      name: 'Eid Collection',
      slug: 'eid-collection',
      description: 'Festive handcrafted frocks with delicate gold zari, resham threadwork, and pure organza drapes.',
      image: '/products/teal-heritage-kurta-set.jpg',
      displayOrder: 1,
    },
    {
      name: 'Wedding Collection',
      slug: 'wedding-collection',
      description: 'Royal regal attire for shaadi, barat, and walima events featuring hand-stitched kalis and tilla.',
      image: '/products/lavender-bloom-kurta-set.jpg',
      displayOrder: 2,
    },
    {
      name: 'Party Wear',
      slug: 'party-wear',
      description: 'Modern silhouettes with traditional Pakistani flair for birthday parties and family gatherings.',
      image: '/products/rose-garden-tiered-frock.jpg',
      displayOrder: 3,
    },
    {
      name: 'Birthday Collection',
      slug: 'birthday-collection',
      description: 'Dreamy pastel frocks with multilayered flairs, satin ribbons, and featherlight organza.',
      image: '/products/vintage-polka-dot-frock.jpg',
      displayOrder: 4,
    },
    {
      name: 'Everyday Frocks',
      slug: 'everyday-frocks',
      description: 'Breathable organic lawn and soft cambric frocks for carefree comfort with artisanal hand-block prints.',
      image: '/products/floral-bloom-lawn-frock.jpg',
      displayOrder: 5,
    },
    {
      name: 'Custom Frocks',
      slug: 'custom-frocks',
      description: 'Made-to-measure bespoke garments tailored to your choice of fabrics, necklines, and personalized embroideries.',
      image: '/products/rose-garden-tiered-frock.jpg',
      displayOrder: 6,
    },
    {
      name: 'New Arrivals',
      slug: 'new-arrivals',
      description: 'The latest seasonal couture designs freshly tailored in our master atelier.',
      image: '/products/lavender-bloom-kurta-set.jpg',
      displayOrder: 7,
    },
  ];

  const categories = {};
  for (const c of categoriesData) {
    categories[c.slug] = await prisma.category.create({ data: c });
  }
  console.log('✅ Categories seeded');

  // 4. Create Individual Products Mapped to New Uploaded Images
  const products = [
    {
      name: 'Floral Bloom Lawn Frock',
      slug: 'floral-bloom-lawn-frock',
      categorySlug: 'everyday-frocks',
      price: 5800,
      discountPrice: 4999,
      fabric: '100% Breathable Cotton Lawn',
      colors: 'Blush Pink, Floral White',
      occasion: 'Everyday Luxury, Summer Dawat',
      style: 'Tiered Lawn Frock with Bow Accents',
      availableSizes: '2-3Y, 3-4Y, 4-5Y, 5-6Y',
      ageRange: '3–5 Years',
      stockQuantity: 18,
      sku: 'DHG-DAY-001',
      tags: 'Floral, Pink, White, Cotton Lawn, Summer, Bows',
      isFeatured: true,
      isNewArrival: true,
      isCustomizable: true,
      rating: 4.9,
      reviewCount: 24,
      shortDescription: 'Breathable pink and white floral lawn frock featuring delicate strap bows and a handcrafted 3D fabric flower.',
      description: 'An artisanal summer staple crafted from the softest organic cotton lawn. Features delicate shoulder strap bows, a dimensional handcrafted fabric rose at the neckline, and a playful tiered ruffle skirt lined with pure breathable mulmul so your little angel stays comfortable all day.',
      images: JSON.stringify([
        '/products/floral-bloom-lawn-frock.jpg',
      ]),
    },
    {
      name: 'Vintage Polka Dot Frock',
      slug: 'vintage-polka-dot-frock',
      categorySlug: 'birthday-collection',
      price: 6800,
      discountPrice: 5999,
      fabric: 'Fine Cotton Cambric & French Ruffles',
      colors: 'Dusty Rose, Mocha Polka',
      occasion: 'Birthday Party, High Tea',
      style: 'Ruffled Cap-Sleeve A-Line Frock',
      availableSizes: '2-3Y, 3-4Y, 4-5Y, 5-6Y',
      ageRange: '3–5 Years',
      stockQuantity: 15,
      sku: 'DHG-BDAY-005',
      tags: 'Polka Dot, Dusty Rose, Butterfly, Ruffles, Birthday, Pearls',
      isFeatured: true,
      isNewArrival: true,
      isCustomizable: true,
      rating: 5.0,
      reviewCount: 31,
      shortDescription: 'Charming dusty rose polka-dot frock with romantic ruffled shoulders and an exquisite pearl butterfly motif.',
      description: 'Inspired by vintage Parisian couture, this sweet frock is crafted from premium polka-dot cotton cambric. The bodice features ruffled flutter sleeves and a meticulously handcrafted lace butterfly brooch adorned with faux pearl accents, creating a twirl-worthy silhouette.',
      images: JSON.stringify([
        '/products/vintage-polka-dot-frock.jpg',
      ]),
    },
    {
      name: 'Rose Garden Tiered Frock',
      slug: 'rose-garden-tiered-frock',
      categorySlug: 'party-wear',
      price: 7900,
      discountPrice: 7200,
      fabric: 'Pure Cotton Lawn & Scalloped Lace',
      colors: 'Soft Cream, Rose Pink',
      occasion: 'Party Wear, Spring Celebration',
      style: 'Tiered Smocked Frock with Ribbon Shoulder Ties',
      availableSizes: '2-3Y, 3-4Y, 4-5Y, 5-6Y',
      ageRange: '3–5 Years',
      stockQuantity: 12,
      sku: 'DHG-PTY-007',
      tags: 'Tiered, Rose, Floral, Lace, Ribbon Bows, Party',
      isFeatured: true,
      isNewArrival: true,
      isCustomizable: true,
      rating: 4.9,
      reviewCount: 19,
      shortDescription: 'Enchanting cream and pink floral tiered frock with smocked bodice, shoulder tie ribbons, and scalloped lace.',
      description: 'A romantic masterpiece for sunny celebrations and family dawats. Crafted with a stretchy smocked bodice that ensures a comfortable snug fit, statement shoulder ribbon bows, and three cascading tiers edged with intricate scalloped cotton lace trims.',
      images: JSON.stringify([
        '/products/rose-garden-tiered-frock.jpg',
      ]),
    },
    {
      name: 'Teal Heritage Kurta Set',
      slug: 'teal-heritage-kurta-set',
      categorySlug: 'eid-collection',
      price: 9200,
      discountPrice: 8400,
      fabric: 'Cotton Silk, Zari & Chiffon Dupatta',
      colors: 'Royal Teal Blue, Sunset Peach',
      occasion: 'Eid Festivities, Mehndi, Milad',
      style: 'Angrakha Flared Kurta with Matching Pants & Dupatta',
      availableSizes: '2-3Y, 3-4Y, 4-5Y, 5-6Y',
      ageRange: '3–5 Years',
      stockQuantity: 10,
      sku: 'DHG-EID-008',
      tags: 'Teal, Peach, Kurta Set, Angrakha, Pakistani, Eid, Tassel',
      isFeatured: true,
      isNewArrival: true,
      isCustomizable: true,
      rating: 5.0,
      reviewCount: 28,
      shortDescription: 'Royal teal Angrakha-style kurta set with intricate gold tilla block prints, bell sleeves, contrast peach border, and dupatta.',
      description: 'Celebratory Pakistani festive wear tailored for little angels. Features an overlapping angrakha neckline with handmade tassel dori, bell flare sleeves finished with gota kinari, matching straight-cut printed trousers, and a soft peach chiffon dupatta.',
      images: JSON.stringify([
        '/products/teal-heritage-kurta-set.jpg',
      ]),
    },
    {
      name: 'Lavender Bloom Kurta Set',
      slug: 'lavender-bloom-kurta-set',
      categorySlug: 'wedding-collection',
      price: 9800,
      discountPrice: 8900,
      fabric: 'Pakistani Lawn & Embroidered Schiffli',
      colors: 'Lavender Purple, Ivory Cream',
      occasion: 'Wedding, Barat, Walima',
      style: '3-Piece Embroidered Kurta, Culottes & Dupatta',
      availableSizes: '2-3Y, 3-4Y, 4-5Y, 5-6Y',
      ageRange: '3–5 Years',
      stockQuantity: 14,
      sku: 'DHG-WED-011',
      tags: 'Lavender, Purple, Embroidered, 3-Piece, Kurta, Wedding, Heirloom',
      isFeatured: true,
      isNewArrival: true,
      isCustomizable: true,
      rating: 4.9,
      reviewCount: 22,
      shortDescription: 'Traditional Pakistani cream and lavender three-piece set featuring botanical print, schiffli lace borders, and matching culottes.',
      description: 'A timeless heirloom three-piece ensemble. Features a botanical lavender floral print kurta with embroidered placket buttons and scalloped schiffli hem borders, paired with matching embroidered lavender culottes and an ethereal matching dupatta.',
      images: JSON.stringify([
        '/products/lavender-bloom-kurta-set.jpg',
      ]),
    },
  ];

  let firstProductId = null;
  for (const prodData of products) {
    const { categorySlug, ...rest } = prodData;
    const cat = categories[categorySlug];

    const createdProduct = await prisma.product.create({
      data: {
        ...rest,
        categoryId: cat.id,
        inventoryItems: {
          create: {
            quantity: rest.stockQuantity,
            reorderLevel: 3,
          },
        },
      },
    });

    if (!firstProductId) firstProductId = createdProduct.id;

    // Add sample verified review
    await prisma.review.create({
      data: {
        productId: createdProduct.id,
        userId: customer.id,
        userName: 'Ayesha Khan',
        rating: 5,
        comment: `Mashallah, absolutely in love with the craftsmanship of ${createdProduct.name}! The fabric is so soft for my 4-year-old daughter and the stitching details are truly boutique quality.`,
        isVerifiedPurchase: true,
        isApproved: true,
      },
    });
  }

  // Create delivered order so customer history is active
  if (firstProductId) {
    const sampleProduct = await prisma.product.findUnique({ where: { id: firstProductId } });
    await prisma.order.create({
      data: {
        orderNumber: 'DHG-ORD-1001',
        userId: customer.id,
        status: 'DELIVERED',
        subtotal: sampleProduct ? sampleProduct.price : 5800,
        discount: 0,
        shippingFee: 250,
        total: sampleProduct ? sampleProduct.price + 250 : 6050,
        paymentMethod: 'COD',
        paymentStatus: 'PAID',
        shippingAddressJson: JSON.stringify({
          fullName: 'Ayesha Khan',
          phone: '+92 321 9876543',
          addressLine1: 'House 42, Street 8, Sector F-7/2',
          city: 'Islamabad',
          province: 'Federal',
          postalCode: '44000',
        }),
        orderItems: {
          create: {
            productId: firstProductId,
            productName: sampleProduct ? sampleProduct.name : 'Floral Bloom Lawn Frock',
            price: sampleProduct ? sampleProduct.price : 5800,
            quantity: 1,
            size: '4-5Y',
            total: sampleProduct ? sampleProduct.price : 5800,
          },
        },
      },
    });
  }

  console.log(`✅ Products, Reviews & Sample Order seeded successfully`);

  // 5. Create Coupons
  await prisma.coupon.create({
    data: {
      code: 'BLOSSOM15',
      discountPercent: 15,
      minOrderAmount: 5000,
      maxUses: 500,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      discountPercent: 10,
      minOrderAmount: 3000,
      maxUses: 1000,
      isActive: true,
    },
  });

  console.log('✅ Coupons seeded: BLOSSOM15 & WELCOME10');
  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
