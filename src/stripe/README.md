# Stripe Payment Integration

Complete Stripe payment integration for course enrollments and payments.

## Features

✅ **Payment Intents** - Direct payment processing
✅ **Checkout Sessions** - Hosted payment pages
✅ **Refunds** - Full and partial refunds
✅ **Webhooks** - Real-time payment notifications
✅ **Customer Management** - Create and manage Stripe customers
✅ **Payment History** - List and track all payments

## Installation

```bash
npm install stripe
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```properties
STRIPE_API_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_CURRENCY=usd
```

### Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Secret key** (starts with `sk_test_` for test mode)
4. For webhooks:
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - Enter your webhook URL: `https://your-domain.com/api/stripe/webhook`
   - Select events to listen to
   - Copy the **Signing secret** (starts with `whsec_`)

## API Endpoints

### 1. Create Payment Intent

**Direct payment processing with custom UI**

```http
POST /api/stripe/payment-intent
Content-Type: application/json

{
  "amount": 5000,
  "currency": "usd",
  "courseId": "671018fabc123456789ef013",
  "userId": "671018fabc123456789ef014",
  "description": "Course enrollment payment"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 5000,
  "currency": "usd",
  "status": "requires_payment_method"
}
```

### 2. Create Checkout Session

**Hosted payment page (Stripe Checkout)**

```http
POST /api/stripe/checkout-session
Content-Type: application/json

{
  "courseId": "671018fabc123456789ef013",
  "userId": "671018fabc123456789ef014",
  "successUrl": "http://localhost:3000/success",
  "cancelUrl": "http://localhost:3000/cancel",
  "priceInCents": 5000
}
```

**Response:**
```json
{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/pay/cs_test_xxx"
}
```

### 3. Get Payment Intent

```http
GET /api/stripe/payment-intent/:id
```

**Response:**
```json
{
  "id": "pi_xxx",
  "amount": 5000,
  "currency": "usd",
  "status": "succeeded",
  "metadata": {
    "courseId": "671018fabc123456789ef013",
    "userId": "671018fabc123456789ef014"
  },
  "created": 1699000000
}
```

### 4. Get Checkout Session

```http
GET /api/stripe/checkout-session/:id
```

### 5. Cancel Payment Intent

```http
POST /api/stripe/payment-intent/:id/cancel
```

### 6. Create Refund

```http
POST /api/stripe/refund
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx",
  "amount": 2500
}
```

### 7. List Payment Intents

```http
GET /api/stripe/payment-intents?limit=10&startingAfter=pi_xxx
```

### 8. Create Customer

```http
POST /api/stripe/customer
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "metadata": {
    "userId": "671018fabc123456789ef014"
  }
}
```

### 9. Get Customer

```http
GET /api/stripe/customer/:id
```

### 10. Webhook Handler

```http
POST /api/stripe/webhook
Headers:
  stripe-signature: t=xxx,v1=yyy
```

## Frontend Integration

### Option 1: Stripe Elements (Custom UI)

```typescript
// 1. Create payment intent on backend
const response = await fetch('/api/stripe/payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 5000,
    courseId: 'course-id',
    userId: 'user-id'
  })
});

const { clientSecret } = await response.json();

// 2. Use Stripe.js to confirm payment
const stripe = Stripe('pk_test_your_publishable_key');
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'John Doe'
    }
  }
});

if (error) {
  console.error(error.message);
} else if (paymentIntent.status === 'succeeded') {
  console.log('Payment successful!');
}
```

### Option 2: Stripe Checkout (Hosted Page)

```typescript
// 1. Create checkout session on backend
const response = await fetch('/api/stripe/checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    courseId: 'course-id',
    userId: 'user-id',
    successUrl: 'http://localhost:3000/success',
    cancelUrl: 'http://localhost:3000/cancel',
    priceInCents: 5000
  })
});

const { url } = await response.json();

// 2. Redirect to Stripe Checkout
window.location.href = url;
```

## Webhook Events

The webhook handler listens to these events:

- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed
- `checkout.session.completed` - Checkout session completed
- `charge.refunded` - Refund processed

### Webhook Integration Example

```typescript
// In your enrollment service
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class EnrollmentService {
  constructor(
    private stripeService: StripeService,
    // ... other dependencies
  ) {}

  async handlePaymentSuccess(paymentIntentId: string) {
    const payment = await this.stripeService.getPaymentIntent(paymentIntentId);
    
    // Create enrollment
    await this.create({
      userId: payment.metadata.userId,
      courseId: payment.metadata.courseId,
      paymentId: payment.id,
      amount: payment.amount / 100, // Convert cents to dollars
    });
    
    // Send confirmation email
    // Update user access
    // etc.
  }
}
```

## Testing

### Test Cards

Stripe provides test cards for different scenarios:

| Card Number | Scenario |
|------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |

Use any future expiration date and any 3-digit CVC.

### Testing Webhooks Locally

1. Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli
```

2. Login to Stripe:
```bash
stripe login
```

3. Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:5000/api/stripe/webhook
```

4. Trigger test events:
```bash
stripe trigger payment_intent.succeeded
```

## Security Best Practices

1. **Never expose your Secret Key** - Keep `STRIPE_API_KEY` server-side only
2. **Verify webhook signatures** - Always validate the `stripe-signature` header
3. **Use HTTPS in production** - Required for webhooks and secure payments
4. **Implement idempotency** - Use idempotency keys for repeated requests
5. **Store minimal payment data** - Let Stripe handle PCI compliance
6. **Enable radar rules** - Configure fraud detection in Stripe Dashboard

## Error Handling

```typescript
try {
  const payment = await stripeService.createPaymentIntent(dto);
  return payment;
} catch (error) {
  if (error.type === 'StripeCardError') {
    // Card was declined
  } else if (error.type === 'StripeInvalidRequestError') {
    // Invalid parameters
  } else if (error.type === 'StripeAPIError') {
    // Stripe API error
  } else if (error.type === 'StripeConnectionError') {
    // Network error
  } else {
    // Unknown error
  }
  throw error;
}
```

## Production Checklist

- [ ] Replace test API keys with live keys
- [ ] Set up webhook endpoint with HTTPS
- [ ] Configure webhook events in Stripe Dashboard
- [ ] Test webhook signature verification
- [ ] Set up proper error handling and logging
- [ ] Implement payment reconciliation
- [ ] Add payment receipt emails
- [ ] Set up Stripe Radar for fraud prevention
- [ ] Configure tax collection if needed
- [ ] Test refund process
- [ ] Set up monitoring and alerts

## Common Use Cases

### 1. Course Enrollment Payment

```typescript
// Create payment for course
const payment = await stripeService.createPaymentIntent({
  amount: course.price * 100, // Convert to cents
  courseId: course.id,
  userId: user.id,
  description: `Enrollment for ${course.title}`
});

// After payment succeeds (via webhook):
await enrollmentService.create({
  userId: user.id,
  courseId: course.id,
  paymentId: payment.paymentIntentId
});
```

### 2. Subscription for Premium Access

```typescript
// Create customer first
const customer = await stripeService.createCustomer(
  user.email,
  `${user.firstName} ${user.lastName}`,
  { userId: user.id }
);

// Then create subscription (requires additional setup)
```

### 3. Process Refund

```typescript
// Full refund
await stripeService.createRefund(paymentIntentId);

// Partial refund (50%)
await stripeService.createRefund(paymentIntentId, amount / 2);
```

## Support

For Stripe-specific questions:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- [Stripe Status](https://status.stripe.com/)

## License

This module follows the same license as the main application.
