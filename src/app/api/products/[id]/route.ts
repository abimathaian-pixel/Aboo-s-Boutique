import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
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
      images,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (brand !== undefined) updateData.brand = brand;
    if (sku !== undefined) updateData.sku = sku;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (discountPrice !== undefined)
      updateData.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
    if (stock !== undefined) updateData.stock = parseInt(stock, 10);
    if (sizes !== undefined)
      updateData.sizes = typeof sizes === 'string' ? sizes : sizes.join(',');
    if (colors !== undefined)
      updateData.colors = typeof colors === 'string' ? colors : JSON.stringify(colors);
    if (material !== undefined) updateData.material = material;
    if (careInstructions !== undefined)
      updateData.careInstructions = careInstructions;
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (isNewArrival !== undefined)
      updateData.isNewArrival = Boolean(isNewArrival);
    if (isBestSeller !== undefined)
      updateData.isBestSeller = Boolean(isBestSeller);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: id,
            url: typeof images[i] === 'string' ? images[i] : images[i].url,
            isPrimary: i === 0,
            sortOrder: i,
          },
        });
      }
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json({ success: true, product: fullProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Hard delete or soft delete: we support deleting from db safely
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.wishlistItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
