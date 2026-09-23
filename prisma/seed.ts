import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Aboo\'sBoutique Database Seed ---');

  // 1. Seed Store Settings
  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: "Aboo'sBoutique",
      storeLogo: '/logo.svg',
      contactEmail: 'contact@aboosboutique.com',
      contactPhone: '+91 63695 37463',
      address: '42 Haute Avenue, Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
      upiId: '6369537463@ptsbi',
      currency: 'INR',
      shippingCharge: 99,
      freeShippingThreshold: 1999,
      taxPercentage: 5,
    },
  });
  console.log('✓ Store settings initialized');

  // 2. Seed Users (Admin and Demo Customer)
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@12345', salt);
  const customerPasswordHash = await bcrypt.hash('Customer@12345', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aboosboutique.com' },
    update: { role: 'admin' },
    create: {
      name: 'Boutique Administrator',
      email: 'admin@aboosboutique.com',
      phone: '+91 63695 37463',
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@aboosboutique.com' },
    update: {},
    create: {
      name: 'Rohan Sharma',
      email: 'customer@aboosboutique.com',
      phone: '+91 98450 12345',
      passwordHash: customerPasswordHash,
      role: 'customer',
    },
  });
  console.log('✓ Admin and Customer users created');

  // 3. Seed Default Address for Customer
  await prisma.address.deleteMany({ where: { userId: customer.id } });
  await prisma.address.create({
    data: {
      userId: customer.id,
      fullName: 'Rohan Sharma',
      phone: '+91 98450 12345',
      houseNo: 'Villa 12, Palm Meadows',
      street: 'HAL Airport Road',
      area: 'Kodihalli',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560008',
      landmark: 'Near Leela Palace',
      addressType: 'Home',
      isDefault: true,
    },
  });

  // 4. Seed Categories
  const categoriesData = [
    {
      name: 'Men',
      slug: 'men',
      description: 'Sophisticated modern tailoring and contemporary menswear.',
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Women',
      slug: 'women',
      description: 'Effortless silhouettes, artisanal dresses, and couture outerwear.',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Kids',
      slug: 'kids',
      description: 'Playful yet premium garments crafted with gentle organic cotton.',
      image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Shirts',
      slug: 'shirts',
      description: 'Pure Italian linen and structured Egyptian cotton formal shirts.',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'T-Shirts',
      slug: 't-shirts',
      description: 'Heavyweight organic cotton tees with relaxed, structured drape.',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Dresses',
      slug: 'dresses',
      description: 'Evening gowns, breezy sundresses, and timeless silk slips.',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Jeans',
      slug: 'jeans',
      description: 'Authentic Japanese selvedge denim in tailored & relaxed fits.',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Trousers',
      slug: 'trousers',
      description: 'Pleated wool flannel and breathable linen-blend tailored trousers.',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Hoodies',
      slug: 'hoodies',
      description: 'Ultra-plush fleece hoodies with brushed interior finish.',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Handcrafted leather belts, cashmere scarves, and luxury hats.',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Saree',
      slug: 'saree',
      description: 'Handcrafted Banarasi, Kanjeevaram silk, and fine drape sarees with opulent zari borders.',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }
  console.log(`✓ ${categoriesData.length} categories seeded`);

  // 5. Seed Products
  const productsData = [
    {
      name: 'Aboo Riviera Pure Linen Shirt',
      slug: 'aboo-riviera-pure-linen-shirt',
      description: 'Tailored from 100% Normandy flax linen. Features mother-of-pearl buttons, a relaxed spread collar, and exceptional breathability for warm afternoons.',
      categorySlug: 'shirts',
      subcategory: 'Linen Shirts',
      brand: "Aboo'sBoutique",
      sku: 'AB-SH-001',
      price: 3499,
      discountPrice: 2499,
      stock: 24,
      sizes: 'S,M,L,XL,XXL',
      colors: JSON.stringify(['White', 'Sky Blue', 'Sage Green', 'Sand Beige']),
      material: '100% French Normandy Linen',
      careInstructions: 'Machine wash delicate at 30°C. Line dry in shade. Warm iron while slightly damp.',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Atelier Silk Slip Evening Midi Dress',
      slug: 'atelier-silk-slip-evening-midi-dress',
      description: 'Lustrous heavyweight 22-momme Mulberry silk cut on the bias for an effortless, figure-skimming drape. Styled with delicate adjustable straps and a refined cowl neckline.',
      categorySlug: 'dresses',
      subcategory: 'Evening Dresses',
      brand: "Aboo'sBoutique",
      sku: 'AB-DR-002',
      price: 6999,
      discountPrice: 4899,
      stock: 12,
      sizes: 'XS,S,M,L,XL',
      colors: JSON.stringify(['Champagne Gold', 'Emerald Forest', 'Noir Black']),
      material: '100% Grade 6A Mulberry Silk',
      careInstructions: 'Dry clean only or gentle hand wash in cold water with silk detergent. Do not wring.',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Kuroki Selvedge Tapered Denim Jeans',
      slug: 'kuroki-selvedge-tapered-denim-jeans',
      description: 'Crafted on vintage shuttle looms in Okayama, Japan using 14oz raw selvedge denim. Features custom brass hardware, copper rivets, and a classic red selvedge ID line.',
      categorySlug: 'jeans',
      subcategory: 'Selvedge Denim',
      brand: "Aboo'sBoutique",
      sku: 'AB-JN-003',
      price: 4999,
      discountPrice: 3899,
      stock: 18,
      sizes: '30,32,34,36,38',
      colors: JSON.stringify(['Raw Indigo', 'Vintage Stone Wash', 'Washed Black']),
      material: '100% Long-Staple Cotton, 14oz Japanese Selvedge',
      careInstructions: 'Wash inside-out in cold water every 6 months to preserve natural fading whiskers.',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Heavyweight Supima Cotton Boxy Tee',
      slug: 'heavyweight-supima-cotton-boxy-tee',
      description: '280 GSM American Supima combed cotton. Features a snug 1-inch ribbed collar, dropped shoulders, and pre-shrunk finish for lifetime durability.',
      categorySlug: 't-shirts',
      subcategory: 'Essential Tees',
      brand: "Aboo'sBoutique",
      sku: 'AB-TS-004',
      price: 1899,
      discountPrice: 1299,
      stock: 45,
      sizes: 'S,M,L,XL,XXL',
      colors: JSON.stringify(['Chalk White', 'Washed Charcoal', 'Olive Mist', 'Oatmeal']),
      material: '100% American Supima Cotton (280 GSM)',
      careInstructions: 'Cold machine wash with like colors. Tumble dry low.',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Double-Breasted Wool Cashmere Overcoat',
      slug: 'double-breasted-wool-cashmere-overcoat',
      description: 'A sartorial masterpiece woven from Italian virgin wool blended with Mongolian cashmere. Features peak lapels, horn buttons, and cupro silk lining.',
      categorySlug: 'men',
      subcategory: 'Outerwear',
      brand: "Aboo'sBoutique",
      sku: 'AB-CO-005',
      price: 14999,
      discountPrice: 11999,
      stock: 8,
      sizes: '38R,40R,42R,44R',
      colors: JSON.stringify(['Camel Tan', 'Midnight Navy', 'Charcoal Heather']),
      material: '90% Virgin Wool, 10% Cashmere',
      careInstructions: 'Specialist dry clean only. Store on wide wooden hanger.',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Artisan Floral Pleated Chiffon Dress',
      slug: 'artisan-floral-pleated-chiffon-dress',
      description: 'Hand-painted botanical print across fluid micro-pleated chiffon. Accented with a cinched smocked waist, flutter sleeves, and sweeping tiered hemline.',
      categorySlug: 'dresses',
      subcategory: 'Day Dresses',
      brand: "Aboo'sBoutique",
      sku: 'AB-DR-006',
      price: 5499,
      discountPrice: 3999,
      stock: 15,
      sizes: 'XS,S,M,L',
      colors: JSON.stringify(['Blush Rose', 'Lavender Mist']),
      material: '100% Breathable Eco-Chiffon with modal lining',
      careInstructions: 'Hand wash cold. Do not iron pleats; steam gently.',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Pleated Gurkha High-Rise Trousers',
      slug: 'pleated-gurkha-high-rise-trousers',
      description: 'Distinguished double-pleated waist with double cummerbund buckle side-adjusters. Tailored with a generous rise and elegant gentle taper.',
      categorySlug: 'trousers',
      subcategory: 'Tailored Trousers',
      brand: "Aboo'sBoutique",
      sku: 'AB-TR-007',
      price: 4299,
      discountPrice: 3299,
      stock: 20,
      sizes: '30,32,34,36,38',
      colors: JSON.stringify(['Khaki Beige', 'Dark Espresso', 'Slate Gray']),
      material: '60% Fine Wool Flannel, 40% Long-Staple Cotton',
      careInstructions: 'Dry clean recommended. Warm iron with press cloth.',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'French Terry Cloud Fleece Hoodie',
      slug: 'french-terry-cloud-fleece-hoodie',
      description: '450 GSM diagonal-loop French terry fleece. Features double-layer hood without eyelets for a clean minimalist architectural silhouette.',
      categorySlug: 'hoodies',
      subcategory: 'Fleece Hoodies',
      brand: "Aboo'sBoutique",
      sku: 'AB-HD-008',
      price: 3899,
      discountPrice: 2899,
      stock: 22,
      sizes: 'S,M,L,XL,XXL',
      colors: JSON.stringify(['Stone Sand', 'Washed Mauve', 'Anthracite Black']),
      material: '100% Organic Combed French Terry Cotton',
      careInstructions: 'Machine wash cold inside out. Flat dry recommended.',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Structured Trench Coat with Storm Flap',
      slug: 'structured-trench-coat-with-storm-flap',
      description: 'Weather-resistant gabardine cotton trench coat with signature storm flap, double storm collar, raglan sleeves, and custom tonal horn buckle belt.',
      categorySlug: 'women',
      subcategory: 'Outerwear',
      brand: "Aboo'sBoutique",
      sku: 'AB-TC-009',
      price: 11999,
      discountPrice: 8999,
      stock: 9,
      sizes: 'XS,S,M,L',
      colors: JSON.stringify(['Honey Beige', 'Midnight Black', 'Olive Drab']),
      material: '100% Cotton Gabardine Water-Repellent Weave',
      careInstructions: 'Professional dry clean only.',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Oxford Button-Down Royal Pinpoint Shirt',
      slug: 'oxford-button-down-royal-pinpoint-shirt',
      description: 'Traditional 80s 2-ply pinpoint Oxford weave that grows softer with every wash. Tailored with a gentle roll collar and split back yoke.',
      categorySlug: 'shirts',
      subcategory: 'Oxford Shirts',
      brand: "Aboo'sBoutique",
      sku: 'AB-SH-010',
      price: 2999,
      discountPrice: 2199,
      stock: 32,
      sizes: 'S,M,L,XL,XXL',
      colors: JSON.stringify(['Classic White', 'Light Oxford Blue', 'University Stripe']),
      material: '100% Giza Egyptian Cotton',
      careInstructions: 'Machine wash warm. Hang dry. Hot iron with steam.',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Kids Organic Cotton Breton Sailor Set',
      slug: 'kids-organic-cotton-breton-sailor-set',
      description: 'Ultra-gentle GOTS-certified organic cotton set featuring a striped long-sleeve Breton tee and soft elasticated twill trousers.',
      categorySlug: 'kids',
      subcategory: 'Matching Sets',
      brand: "Aboo'sBoutique",
      sku: 'AB-KD-011',
      price: 2499,
      discountPrice: 1799,
      stock: 14,
      sizes: '2-3Y,3-4Y,4-5Y,5-6Y,6-7Y',
      colors: JSON.stringify(['Navy Stripe', 'Red Stripe']),
      material: '100% GOTS Certified Organic Cotton',
      careInstructions: 'Machine wash at 40°C. Gentle cycle. Non-chlorine bleach only.',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Full-Grain Italian Leather Weekender Duffle',
      slug: 'full-grain-italian-leather-weekender-duffle',
      description: 'Vegetable-tanned Vachetta leather from Tuscany that patinas gracefully. Solid brass YKK Excella zippers, reinforced handles, and padded shoulder strap.',
      categorySlug: 'accessories',
      subcategory: 'Leather Goods',
      brand: "Aboo'sBoutique",
      sku: 'AB-AC-012',
      price: 16999,
      discountPrice: 13999,
      stock: 4, // Low stock test!
      sizes: 'One Size (45L)',
      colors: JSON.stringify(['Cognac Brown', 'Obsidian Black']),
      material: '100% Italian Vegetable Tanned Leather',
      careInstructions: 'Condition with natural beeswax leather cream twice yearly.',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Kids Sherpa Lined Corduroy Jacket',
      slug: 'kids-sherpa-lined-corduroy-jacket',
      description: 'Cozy plush faux-sherpa lined fine-wale corduroy jacket designed for all-day comfort and warmth. Snap-front closure for easy dressing.',
      categorySlug: 'kids',
      subcategory: 'Jackets',
      brand: "Aboo'sBoutique",
      sku: 'AB-KD-013',
      price: 2999,
      discountPrice: 2199,
      stock: 2, // Low stock!
      sizes: '3-4Y,4-5Y,5-6Y,6-7Y',
      colors: JSON.stringify(['Caramel Tan', 'Forest Pine']),
      material: '100% Cotton Corduroy with recycled poly-sherpa lining',
      careInstructions: 'Machine wash delicate. Tumble dry extra low.',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Tailored Single-Breasted Italian Blazer',
      slug: 'tailored-single-breasted-italian-blazer',
      description: 'Half-canvas construction with soft natural shoulder line. Crafted from 4-season hopsack wool that resists creasing.',
      categorySlug: 'men',
      subcategory: 'Blazers',
      brand: "Aboo'sBoutique",
      sku: 'AB-BZ-014',
      price: 9999,
      discountPrice: 7499,
      stock: 11,
      sizes: '38R,40R,42R,44R',
      colors: JSON.stringify(['Navy Blue', 'Charcoal Gray', 'Sand Tan']),
      material: '100% Super 120s Merino Wool',
      careInstructions: 'Dry clean only. Steam to remove creases.',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Pure Silk Crepe de Chine Button-Up Shirt',
      slug: 'pure-silk-crepe-de-chine-shirt',
      description: 'Flowing drape and matte sheen, tailored with concealed placket and elongated French cuffs. Looks sensational tucked into wide-leg trousers.',
      categorySlug: 'women',
      subcategory: 'Blouses',
      brand: "Aboo'sBoutique",
      sku: 'AB-BL-015',
      price: 5299,
      discountPrice: 3999,
      stock: 16,
      sizes: 'XS,S,M,L,XL',
      colors: JSON.stringify(['Ivory Silk', 'Champagne Nude', 'Midnight Teal']),
      material: '100% Crepe de Chine Silk (18mm)',
      careInstructions: 'Hand wash cold or eco dry clean. Cool iron inside out.',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Handcrafted Vegetable-Tanned Dress Belt',
      slug: 'handcrafted-vegetable-tanned-dress-belt',
      description: 'Beveled and burnished edges by hand with solid brass matte buckle. 32mm width designed to slide smoothly through tailored belt loops.',
      categorySlug: 'accessories',
      subcategory: 'Belts',
      brand: "Aboo'sBoutique",
      sku: 'AB-AC-016',
      price: 1999,
      discountPrice: 1499,
      stock: 28,
      sizes: '32,34,36,38,40',
      colors: JSON.stringify(['Dark Brown', 'Saddle Tan', 'Black']),
      material: '100% Full Grain Bridle Leather',
      careInstructions: 'Wipe with soft damp cloth.',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Imperial Banarasi Katan Silk Saree',
      slug: 'imperial-banarasi-katan-silk-saree',
      description: 'Hand-loomed by master weavers over 24 days, featuring intricate floral jaal weaving, an opulent kadhwa pallu, and accompanied by an unstitched contrast pure silk blouse piece.',
      categorySlug: 'saree',
      subcategory: 'Banarasi',
      brand: "Aboo'sBoutique",
      sku: 'AB-SAR-101',
      price: 8999,
      discountPrice: 7499,
      stock: 15,
      sizes: 'Free Size',
      colors: JSON.stringify(['Royal Crimson', 'Midnight Navy', 'Emerald Green']),
      material: '100% Pure Handloom Katan Silk with 24k Gold Electroplated Zari',
      careInstructions: 'Dry clean exclusively. Store folded in breathable pure cotton or muslin fabric. Avoid perfume spraying directly onto zari.',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Heritage Kanjeevaram Bridal Silk Saree',
      slug: 'heritage-kanjeevaram-bridal-silk-saree',
      description: 'A timeless heirloom woven with dense mulberry silk threads and authentic gold zari temple motifs, radiating regal grace for grand ceremonial occasions.',
      categorySlug: 'saree',
      subcategory: 'Kanjeevaram',
      brand: "Aboo'sBoutique",
      sku: 'AB-SAR-102',
      price: 14500,
      discountPrice: 12999,
      stock: 8,
      sizes: 'Free Size',
      colors: JSON.stringify(['Crimson & Gold', 'Peacock Teal & Gold']),
      material: 'Pure Mulberry Silk with Heavy Korvai Weave & Traditional Temple Borders',
      careInstructions: 'Professional dry clean only. Change saree folds periodically every 3-4 months to preserve pristine zari integrity.',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      images: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Ethereal Chanderi Floral Zari Saree',
      slug: 'ethereal-chanderi-floral-zari-saree',
      description: 'Featherlight and gracefully translucent, woven with delicate artisanal booti motifs and finished with a shimmering zari border for effortless daytime sophistication.',
      categorySlug: 'saree',
      subcategory: 'Chanderi',
      brand: "Aboo'sBoutique",
      sku: 'AB-SAR-103',
      price: 5499,
      discountPrice: 4699,
      stock: 20,
      sizes: 'Free Size',
      colors: JSON.stringify(['Pastel Blush', 'Mint Sage', 'Ivory Gold']),
      material: 'Chanderi Silk-Cotton Blend with Muted Silver & Gold Booti Embellishments',
      careInstructions: 'Gentle dry clean only. Iron with damp protective cloth at low temperature.',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      ],
    },
  ];

  for (const p of productsData) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) continue;

    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId,
        subcategory: p.subcategory,
        brand: p.brand,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.stock,
        sizes: p.sizes,
        colors: p.colors,
        material: p.material,
        careInstructions: p.careInstructions,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isBestSeller: p.isBestSeller,
        isActive: true,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId,
        subcategory: p.subcategory,
        brand: p.brand,
        sku: p.sku,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.stock,
        sizes: p.sizes,
        colors: p.colors,
        material: p.material,
        careInstructions: p.careInstructions,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isBestSeller: p.isBestSeller,
        isActive: true,
      },
    });

    // Delete existing images and re-insert
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: p.images[i],
          isPrimary: i === 0,
          sortOrder: i,
        },
      });
    }
  }
  console.log(`✓ ${productsData.length} products seeded with images and specifications`);

  // 6. Seed a sample order for demonstration in admin and customer portals
  const sampleOrder = await prisma.order.upsert({
    where: { orderNumber: 'ABO-2026-1001' },
    update: {},
    create: {
      orderNumber: 'ABO-2026-1001',
      userId: customer.id,
      customerName: 'Rohan Sharma',
      customerEmail: 'customer@aboosboutique.com',
      customerPhone: '+91 98450 12345',
      subtotal: 7398,
      shippingCharge: 0,
      taxAmount: 369.9,
      discountAmount: 0,
      totalAmount: 7767.9,
      paymentStatus: 'submitted',
      orderStatus: 'placed',
      upiRef: 'UPI-REF-981273918237',
      addressJson: JSON.stringify({
        fullName: 'Rohan Sharma',
        phone: '+91 98450 12345',
        houseNo: 'Villa 12, Palm Meadows',
        street: 'HAL Airport Road',
        area: 'Kodihalli',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560008',
        landmark: 'Near Leela Palace',
        addressType: 'Home',
      }),
    },
  });

  const linenShirt = await prisma.product.findUnique({ where: { sku: 'AB-SH-001' } });
  const silkDress = await prisma.product.findUnique({ where: { sku: 'AB-DR-002' } });

  if (linenShirt && silkDress) {
    await prisma.orderItem.deleteMany({ where: { orderId: sampleOrder.id } });
    await prisma.orderItem.create({
      data: {
        orderId: sampleOrder.id,
        productId: linenShirt.id,
        productName: linenShirt.name,
        productImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
        size: 'L',
        color: 'Sky Blue',
        price: 2499,
        quantity: 1,
        subtotal: 2499,
      },
    });
    await prisma.orderItem.create({
      data: {
        orderId: sampleOrder.id,
        productId: silkDress.id,
        productName: silkDress.name,
        productImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
        size: 'M',
        color: 'Champagne Gold',
        price: 4899,
        quantity: 1,
        subtotal: 4899,
      },
    });
  }
  console.log('✓ Demonstration sample order seeded');
  console.log('--- Aboo\'sBoutique Database Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
