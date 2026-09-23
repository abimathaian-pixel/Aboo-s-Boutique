import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const category = searchParams.get('category')?.trim();
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const size = searchParams.get('size');
    const color = searchParams.get('color');
    const sort = searchParams.get('sort') || 'newest';
    const isFeatured = searchParams.get('featured') === 'true';
    const isNewArrival = searchParams.get('newArrival') === 'true';
    const isBestSeller = searchParams.get('bestSeller') === 'true';
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
        { category: { name: { contains: search } } },
      ];
    }

    if (category) {
      where.category = {
        OR: [
          { slug: category },
          { id: category },
          { name: category },
        ],
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (size) {
      where.sizes = { contains: size };
    }

    if (color) {
      where.colors = { contains: color };
    }

    if (isFeatured) where.isFeatured = true;
    if (isNewArrival) where.isNewArrival = true;
    if (isBestSeller) where.isBestSeller = true;

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'best-selling') {
      orderBy = [{ isBestSeller: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'popular') {
      orderBy = [{ isFeatured: 'desc' }, { isBestSeller: 'desc' }];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({ products, total: products.length });
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      categoryId,
      subcategory,
      brand,
      sku,
      price,
      discountPrice,
      stock,
      sizes,
      colors,
      material,
      careInstructions,
      isFeatured,
      isNewArrival,
      isBestSeller,
      isActive,
      images, // array of urls
    } = body;

    if (!name || !categoryId || !sku || price === undefined) {
      return NextResponse.json(
        { error: 'Name, category, SKU, and price are required' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    let slug = baseSlug;
    let count = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || '',
        categoryId,
        subcategory: subcategory || null,
        brand: brand || "Aboo'sBoutique",
        sku,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: parseInt(stock || '0', 10),
        sizes: typeof sizes === 'string' ? sizes : (sizes || []).join(','),
        colors: typeof colors === 'string' ? colors : JSON.stringify(colors || []),
        material: material || null,
        careInstructions: careInstructions || null,
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        isBestSeller: Boolean(isBestSeller),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    if (images && Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: images[i],
            isPrimary: i === 0,
            sortOrder: i,
          },
        });
      }
    }

    const created = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: true,
      },
    });

    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A product with this SKU or slug already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
