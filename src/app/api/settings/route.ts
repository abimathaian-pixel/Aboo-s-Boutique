import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
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
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
