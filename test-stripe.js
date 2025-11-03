const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testStripeIntegration() {
  console.log('🧪 Testing Stripe Integration...\n');

  try {
    // Test 1: Create Payment Intent
    console.log('1️⃣  Testing: Create Payment Intent');
    const paymentIntent = await axios.post(
      `${BASE_URL}/stripe/payment-intent`,
      {
        amount: 5000, // $50.00
        currency: 'usd',
        courseId: '507f1f77bcf86cd799439011',
        userId: '507f1f77bcf86cd799439012',
        description: 'Test course payment',
      },
    );
    console.log('✅ Payment Intent Created:', {
      id: paymentIntent.data.id,
      amount: paymentIntent.data.amount,
      currency: paymentIntent.data.currency,
      status: paymentIntent.data.status,
    });
    console.log('');

    const paymentIntentId = paymentIntent.data.id;

    // Test 2: Get Payment Intent
    console.log('2️⃣  Testing: Get Payment Intent');
    const getPaymentIntent = await axios.get(
      `${BASE_URL}/stripe/payment-intent/${paymentIntentId}`,
    );
    console.log('✅ Payment Intent Retrieved:', {
      id: getPaymentIntent.data.id,
      status: getPaymentIntent.data.status,
      amount: getPaymentIntent.data.amount,
    });
    console.log('');

    // Test 3: Create Checkout Session
    console.log('3️⃣  Testing: Create Checkout Session');
    const checkoutSession = await axios.post(
      `${BASE_URL}/stripe/checkout-session`,
      {
        amount: 7500, // $75.00
        currency: 'usd',
        courseId: '507f1f77bcf86cd799439011',
        userId: '507f1f77bcf86cd799439012',
        courseName: 'Advanced TypeScript Course',
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      },
    );
    console.log('✅ Checkout Session Created:', {
      id: checkoutSession.data.id,
      url: checkoutSession.data.url,
      amount_total: checkoutSession.data.amount_total,
    });
    console.log('');

    // Test 4: List Payment Intents
    console.log('4️⃣  Testing: List Payment Intents');
    const listPayments = await axios.get(
      `${BASE_URL}/stripe/payment-intents?limit=5`,
    );
    console.log('✅ Payment Intents Listed:', {
      count: listPayments.data.data.length,
      hasMore: listPayments.data.has_more,
    });
    console.log('');

    // Test 5: Create Customer
    console.log('5️⃣  Testing: Create Customer');
    const customer = await axios.post(`${BASE_URL}/stripe/customer`, {
      email: 'test@example.com',
      name: 'Test User',
      userId: '507f1f77bcf86cd799439012',
    });
    console.log('✅ Customer Created:', {
      id: customer.data.id,
      email: customer.data.email,
      name: customer.data.name,
    });
    console.log('');

    const customerId = customer.data.id;

    // Test 6: Get Customer
    console.log('6️⃣  Testing: Get Customer');
    const getCustomer = await axios.get(
      `${BASE_URL}/stripe/customer/${customerId}`,
    );
    console.log('✅ Customer Retrieved:', {
      id: getCustomer.data.id,
      email: getCustomer.data.email,
      name: getCustomer.data.name,
    });
    console.log('');

    // Test 7: Cancel Payment Intent
    console.log('7️⃣  Testing: Cancel Payment Intent');
    const cancelPayment = await axios.post(
      `${BASE_URL}/stripe/payment-intent/${paymentIntentId}/cancel`,
    );
    console.log('✅ Payment Intent Cancelled:', {
      id: cancelPayment.data.id,
      status: cancelPayment.data.status,
    });
    console.log('');

    console.log('🎉 All Stripe tests passed successfully!\n');
    console.log('📊 Summary:');
    console.log('   ✅ Payment Intent Creation - PASSED');
    console.log('   ✅ Payment Intent Retrieval - PASSED');
    console.log('   ✅ Checkout Session Creation - PASSED');
    console.log('   ✅ Payment Intents Listing - PASSED');
    console.log('   ✅ Customer Creation - PASSED');
    console.log('   ✅ Customer Retrieval - PASSED');
    console.log('   ✅ Payment Intent Cancellation - PASSED');
  } catch (error) {
    console.error('❌ Test Failed:', {
      endpoint: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      details: error.response?.data,
      fullError: error.code || error.toString(),
    });
  }
}

// Run tests
testStripeIntegration();
