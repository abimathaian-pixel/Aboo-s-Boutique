// test-e2e.mjs
async function runTests() {
  const BASE_URL = 'http://localhost:3000';
  console.log(`Starting E2E API and Flow Verification against ${BASE_URL}...`);

  // Wait briefly for server ready
  let ready = false;
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/settings`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }

  if (!ready) {
    throw new Error('Server not responding at ' + BASE_URL);
  }
  console.log('✓ Server is live and responding!');

  // Test 1: Verify Settings & UPI ID
  const settingsRes = await fetch(`${BASE_URL}/api/settings`);
  const settingsData = await settingsRes.json();
  console.log('1. Store Settings Check:');
  console.log('   Brand Name:', settingsData.settings.storeName);
  console.log('   UPI ID:', settingsData.settings.upiId);
  if (settingsData.settings.upiId !== '6369537463@ptsbi') {
    throw new Error('UPI ID does not match expected 6369537463@ptsbi');
  }
  console.log('   ✓ Store Settings and Default UPI ID verified.');

  // Test 2: Verify Categories and Products
  const catRes = await fetch(`${BASE_URL}/api/categories`);
  const catData = await catRes.json();
  console.log(`2. Categories Check: Found ${catData.categories.length} categories.`);
  if (catData.categories.length < 5) throw new Error('Too few categories');

  const prodRes = await fetch(`${BASE_URL}/api/products?sort=newest`);
  const prodData = await prodRes.json();
  console.log(`   Products Check: Found ${prodData.products.length} products.`);
  if (prodData.products.length < 12) throw new Error('Expected at least 12 products');
  console.log('   Sample Product:', prodData.products[0].name, '| SKU:', prodData.products[0].sku);
  console.log('   ✓ Products catalog verified.');

  // Test 3: Search and Filter Check
  const searchRes = await fetch(`${BASE_URL}/api/products?search=linen`);
  const searchData = await searchRes.json();
  console.log(`3. Search Test: Query "linen" returned ${searchData.products.length} products.`);
  if (searchData.products.length === 0) throw new Error('Search failed for linen');
  console.log('   ✓ Search functionality verified.');

  // Test 4: Customer Authentication
  const customerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'customer@aboosboutique.com',
      password: 'Customer@12345',
      requiredRole: 'customer',
    }),
  });
  const customerLoginData = await customerLoginRes.json();
  if (!customerLoginRes.ok || !customerLoginData.user) {
    throw new Error('Customer login failed: ' + JSON.stringify(customerLoginData));
  }
  const customerCookie = customerLoginRes.headers.get('set-cookie');
  console.log('4. Customer Authentication Check:');
  console.log('   Customer Name:', customerLoginData.user.name);
  console.log('   Customer Role:', customerLoginData.user.role);
  console.log('   ✓ Customer login successfully authenticated with cookie.');

  // Test 5: Role Security - Customer trying to access Admin API
  const unauthorizedRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
    headers: { Cookie: customerCookie || '' },
  });
  console.log('5. Security Check: Customer accessing /api/admin/dashboard status:', unauthorizedRes.status);
  if (unauthorizedRes.status !== 403) {
    throw new Error('Security failure: non-admin request should return 403');
  }
  console.log('   ✓ Non-admin access properly rejected with 403.');

  // Test 6: Admin Authentication
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@aboosboutique.com',
      password: 'Admin@12345',
      requiredRole: 'admin',
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  if (!adminLoginRes.ok || !adminLoginData.user) {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLoginData));
  }
  const adminCookie = adminLoginRes.headers.get('set-cookie');
  console.log('6. Admin Authentication Check:');
  console.log('   Admin Name:', adminLoginData.user.name);
  console.log('   Admin Role:', adminLoginData.user.role);
  console.log('   ✓ Admin login successfully authenticated.');

  // Test 7: Admin Dashboard Metrics Access
  const dashboardRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
    headers: { Cookie: adminCookie || '' },
  });
  const dashboardData = await dashboardRes.json();
  console.log('7. Admin Dashboard KPI Check:');
  console.log('   Total Sales:', dashboardData.metrics.totalSales);
  console.log('   Total Orders:', dashboardData.metrics.totalOrders);
  console.log('   Total Products:', dashboardData.metrics.totalProducts);
  console.log('   ✓ Admin Dashboard data loaded successfully.');

  // Test 8: End-to-End Order Creation Flow (Customer creates order with UPI payment submission)
  const testProduct = prodData.products[0];
  const orderPayload = {
    customerName: 'Aarav Patel',
    customerEmail: 'aarav.patel@example.com',
    customerPhone: '+91 99887 76655',
    address: {
      fullName: 'Aarav Patel',
      phone: '+91 99887 76655',
      houseNo: 'Flat 402, Prestige Tower',
      street: 'Koramangala 4th Block',
      area: 'Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      landmark: 'Near Wipro Park',
      addressType: 'Home',
    },
    items: [
      {
        productId: testProduct.id,
        productName: testProduct.name,
        productImage: testProduct.images[0]?.url || '/logo.svg',
        size: 'L',
        color: 'Classic',
        price: testProduct.discountPrice || testProduct.price,
        quantity: 2,
      },
    ],
    subtotal: (testProduct.discountPrice || testProduct.price) * 2,
    shippingCharge: 0,
    taxAmount: Math.round(((testProduct.discountPrice || testProduct.price) * 2) * 0.05),
    discountAmount: 0,
    totalAmount: ((testProduct.discountPrice || testProduct.price) * 2) * 1.05,
    paymentStatus: 'submitted',
    upiRef: 'UPI-TEST-99882211',
  };

  const createOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: customerCookie || '',
    },
    body: JSON.stringify(orderPayload),
  });
  const createOrderData = await createOrderRes.json();
  if (!createOrderRes.ok || !createOrderData.order) {
    throw new Error('Order creation failed: ' + JSON.stringify(createOrderData));
  }
  const createdOrder = createOrderData.order;
  console.log('8. Order Creation Flow Check:');
  console.log('   Order Created:', createdOrder.orderNumber);
  console.log('   Order Payment Status:', createdOrder.paymentStatus);
  console.log('   Order Total (INR):', createdOrder.totalAmount);
  console.log('   ✓ Customer order placement and payment submission verified.');

  // Test 9: Admin Order Status Update & Auto Stock Decrement
  const initialStock = testProduct.stock;
  const updateOrderRes = await fetch(`${BASE_URL}/api/admin/orders`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie || '',
    },
    body: JSON.stringify({
      id: createdOrder.id,
      orderStatus: 'confirmed',
      paymentStatus: 'confirmed',
    }),
  });
  const updateOrderData = await updateOrderRes.json();
  if (!updateOrderRes.ok) {
    throw new Error('Order update failed: ' + JSON.stringify(updateOrderData));
  }
  console.log('9. Admin Order Management & Stock Verification:');
  console.log('   Updated Order Status:', updateOrderData.order.orderStatus);
  console.log('   Updated Payment Status:', updateOrderData.order.paymentStatus);

  // Check that stock was automatically decremented by 2
  const updatedProductRes = await fetch(`${BASE_URL}/api/products/${testProduct.id}`);
  const updatedProductData = await updatedProductRes.json();
  console.log(`   Initial Stock: ${initialStock} -> Decremented Stock: ${updatedProductData.product.stock}`);
  if (updatedProductData.product.stock !== initialStock - 2) {
    throw new Error(`Stock decrement failed: expected ${initialStock - 2}, got ${updatedProductData.product.stock}`);
  }
  console.log('   ✓ Automated stock decrement on confirmation verified.');

  console.log('\n======================================================');
  console.log('🎉 ALL 9 END-TO-END VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================\n');
}

runTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
