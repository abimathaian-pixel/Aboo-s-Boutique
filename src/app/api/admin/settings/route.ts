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

    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
      storeName,
      storeLogo,
      contactEmail,
      contactPhone,
      address,
      upiId,
      currency,
      shippingCharge,
      freeShippingThreshold,
      taxPercentage,
    } = body;

    const updated = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: {
        storeName: storeName || "Aboo'sBoutique",
        storeLogo: storeLogo !== undefined ? storeLogo : '/logo.svg',
        contactEmail: contactEmail || 'contact@aboosboutique.com',
        contactPhone: contactPhone || '+91 63695 37463',
        address: address || '',
        upiId: upiId || '6369537463@ptsbi',
        currency: currency || 'INR',
        shippingCharge: shippingCharge !== undefined ? parseFloat(shippingCharge) : 99,
        freeShippingThreshold:
          freeShippingThreshold !== undefined ? parseFloat(freeShippingThreshold) : 1999,
        taxPercentage: taxPercentage !== undefined ? parseFloat(taxPercentage) : 5,
      },
      create: {
        id: 'default',
        storeName: storeName || "Aboo'sBoutique",
        storeLogo: storeLogo !== undefined ? storeLogo : '/logo.svg',
        contactEmail: contactEmail || 'contact@aboosboutique.com',
        contactPhone: contactPhone || '+91 63695 37463',
        address: address || '',
        upiId: upiId || '6369537463@ptsbi',
        currency: currency || 'INR',
        shippingCharge: shippingCharge !== undefined ? parseFloat(shippingCharge) : 99,
        freeShippingThreshold:
          freeShippingThreshold !== undefined ? parseFloat(freeShippingThreshold) : 1999,
        taxPercentage: taxPercentage !== undefined ? parseFloat(taxPercentage) : 5,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Error updating store settings:', error);
    return NextResponse.json(
      { error: 'Failed to update store settings' },
      { status: 500 }
    );
  }
}
