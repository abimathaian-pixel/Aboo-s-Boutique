import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const filter = searchParams.get('filter'); // 'low_stock', 'out_of_stock'

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (filter === 'low_stock') {
      where.stock = { gt: 0, lte: 10 };
    } else if (filter === 'out_of_stock') {
      where.stock = 0;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { stock: 'asc' },
      include: {
        category: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error in GET /api/admin/inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, stock } = body;

    if (!id || stock === undefined) {
      return NextResponse.json(
        { error: 'Product ID and stock amount are required' },
        { status: 400 }
      );
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { stock: parseInt(stock, 10) },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Error updating inventory stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}
