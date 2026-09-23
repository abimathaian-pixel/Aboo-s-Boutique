import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // Aggregations
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrdersCount,
      allOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.product.count(),
      prisma.order.count({
        where: {
          OR: [
            { paymentStatus: 'submitted' },
            { orderStatus: 'placed' },
          ],
        },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 10 } },
        orderBy: { stock: 'asc' },
        take: 10,
        include: { category: true },
      }),
    ]);

    // Total sales calculation (only for orders that are submitted or confirmed)
    const totalSales = allOrders.reduce((acc, order) => {
      if (order.paymentStatus !== 'failed' && order.orderStatus !== 'cancelled') {
        return acc + order.totalAmount;
      }
      return acc;
    }, 0);

    const recentOrders = allOrders.slice(0, 8);

    // Sales by day (last 7 days)
    const last7Days: { date: string; sales: number; orders: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOrders = allOrders.filter(
        (o) => o.createdAt.toISOString().split('T')[0] === dateStr
      );
      const daySales = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      last7Days.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        sales: daySales,
        orders: dayOrders.length,
      });
    }

    return NextResponse.json({
      metrics: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders: pendingOrdersCount,
        lowStockCount: lowStockProducts.length,
      },
      recentOrders,
      lowStockProducts,
      salesChart: last7Days,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
