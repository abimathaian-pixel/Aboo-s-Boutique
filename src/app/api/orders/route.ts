import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/utils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: user.id },
          { customerEmail: user.email },
        ],
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      items,
      subtotal,
      shippingCharge,
      taxAmount,
      discountAmount,
      totalAmount,
      paymentStatus = 'submitted',
      upiRef,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !address || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required order details' },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user ? user.id : null,
        customerName: customerName.trim(),
        customerEmail: customerEmail.toLowerCase().trim(),
        customerPhone: customerPhone.trim(),
        subtotal: parseFloat(subtotal),
        shippingCharge: parseFloat(shippingCharge || '0'),
        taxAmount: parseFloat(taxAmount || '0'),
        discountAmount: parseFloat(discountAmount || '0'),
        totalAmount: parseFloat(totalAmount),
        paymentStatus, // "submitted" or "pending"
        orderStatus: 'placed',
        upiRef: upiRef || null,
        addressJson: JSON.stringify(address),
      },
    });

    // Create order items
    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId || null,
          productName: item.productName || item.product?.name || 'Item',
          productImage:
            item.productImage ||
            (item.product?.images?.[0]?.url ?? '/logo.svg'),
          size: item.size,
          color: item.color,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity, 10),
          subtotal: parseFloat(item.price) * parseInt(item.quantity, 10),
        },
      });
    }

    // Clear cart if user logged in
    if (user) {
      await prisma.cartItem.deleteMany({ where: { userId: user.id } });
    }

    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });

    return NextResponse.json({ success: true, order: fullOrder }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
