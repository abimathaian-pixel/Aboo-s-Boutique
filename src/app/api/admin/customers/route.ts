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

    const where: any = { role: 'customer' };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            paymentStatus: true,
            orderStatus: true,
          },
        },
      },
    });

    const formatted = customers.map((c) => {
      const ordersCount = c.orders.length;
      const totalSpend = c.orders.reduce((sum, o) => {
        if (o.orderStatus !== 'cancelled' && o.paymentStatus !== 'failed') {
          return sum + o.totalAmount;
        }
        return sum;
      }, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        isActive: c.isActive,
        createdAt: c.createdAt,
        ordersCount,
        totalSpend,
      };
    });

    return NextResponse.json({ customers: formatted });
  } catch (error) {
    console.error('Error in GET /api/admin/customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
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
    const { id, isActive } = body;

    if (!id || isActive === undefined) {
      return NextResponse.json(
        { error: 'User ID and isActive status are required' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error) {
    console.error('Error updating customer status:', error);
    return NextResponse.json(
      { error: 'Failed to update customer status' },
      { status: 500 }
    );
  }
}
