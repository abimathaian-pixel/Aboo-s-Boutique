import prisma from './src/lib/db.js';

// Verification script for database & schema integrity
async function verifyAll() {
  console.log('--- Aboo\'sBoutique Automated Verification ---');

  // 1. Check Store Settings
  const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
  console.log('1. Store Settings:');
  console.log('   Store Name:', settings?.storeName);
  console.log('   UPI ID:', settings?.upiId);
  console.log('   Free Shipping Threshold:', settings?.freeShippingThreshold);
  if (settings?.upiId !== '6369537463@ptsbi') {
    throw new Error('UPI ID mismatch');
  }

  // 2. Check Users
  const admin = await prisma.user.findUnique({ where: { email: 'admin@aboosboutique.com' } });
  const customer = await prisma.user.findUnique({ where: { email: 'customer@aboosboutique.com' } });
  console.log('2. Users:');
  console.log('   Admin User:', admin?.email, 'Role:', admin?.role);
  console.log('   Customer User:', customer?.email, 'Role:', customer?.role);
  if (!admin || admin.role !== 'admin') throw new Error('Admin user missing or incorrect role');
  if (!customer || customer.role !== 'customer') throw new Error('Customer user missing or incorrect role');

  // 3. Check Categories & Products
  const categoriesCount = await prisma.category.count();
  const productsCount = await prisma.product.count();
  const imagesCount = await prisma.productImage.count();
  console.log('3. Catalog:');
  console.log('   Categories count:', categoriesCount);
  console.log('   Products count:', productsCount);
  console.log('   Product images count:', imagesCount);
  if (categoriesCount < 10) throw new Error('Expected at least 10 categories');
  if (productsCount < 12) throw new Error('Expected at least 12 products');

  // 4. Check Sample Order
  const orders = await prisma.order.findMany({ include: { items: true } });
  console.log('4. Orders:');
  console.log('   Total Orders in DB:', orders.length);
  if (orders.length > 0) {
    console.log('   Sample Order ID:', orders[0].orderNumber);
    console.log('   Sample Order Payment Status:', orders[0].paymentStatus);
    console.log('   Sample Order Total:', orders[0].totalAmount);
    console.log('   Sample Order Items Count:', orders[0].items.length);
  }

  console.log('--- ALL AUTOMATED VERIFICATION CHECKS PASSED ---');
}

verifyAll()
  .catch((e) => {
    console.error('Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
