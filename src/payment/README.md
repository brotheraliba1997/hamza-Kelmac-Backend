# Payment Module

Complete payment processing system integrated with Stripe for course purchases and enrollments.

## Features

- ✅ **Payment Intent Creation** - Direct payment processing with custom UI
- ✅ **Checkout Sessions** - Hosted Stripe checkout pages
- ✅ **Automatic Enrollment** - Auto-enroll users upon successful payment
- ✅ **Refund Processing** - Full and partial refund support
- ✅ **Payment History** - Track all user payments
- ✅ **Payment Statistics** - Revenue and success rate analytics
- ✅ **Email Notifications** - Confirmation emails for payments and refunds
- ✅ **Webhook Integration** - Auto-handle payment events from Stripe

## API Endpoints

### Create Payment Intent
```http
POST /api/payment/create-payment
```

**Request Body:**
```json
{
  "courseId": "507f1f77bcf86cd799439011",
  "amount": 99.99,  // Optional, uses course price if not provided
  "currency": "usd",  // Optional, defaults to USD
  "metadata": {}  // Optional
}
```

**Response:**
```json
{
  "payment": {
    "_id": "...",
    "user": "...",
    "course": "...",
    "amount": 99.99,
    "currency": "usd",
    "status": "processing"
  },
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Create Checkout Session
```http
POST /api/payment/create-checkout
```

**Request Body:**
```json
{
  "courseId": "507f1f77bcf86cd799439011",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel"
}
```

**Response:**
```json
{
  "payment": {
    "_id": "...",
    "status": "pending"
  },
  "sessionId": "cs_xxx",
  "url": "https://checkout.stripe.com/pay/cs_xxx"
}
```

### Refund Payment
```http
POST /api/payment/refund
```

**Request Body:**
```json
{
  "paymentId": "507f1f77bcf86cd799439011",
  "amount": 50.00,  // Optional, full refund if not provided
  "reason": "Customer request"  // Optional
}
```

### Get Payment
```http
GET /api/payment/:id
```

### Get User Payments
```http
GET /api/payment/user/:userId?page=1&limit=10
```

### Get Course Payments (Admin)
```http
GET /api/payment/course/:courseId?page=1&limit=10
```

### Get All Payments (Admin)
```http
GET /api/payment?page=1&limit=10&status=succeeded
```

### Get Payment Statistics (Admin)
```http
GET /api/payment/stats/overview
```

**Response:**
```json
{
  "totalRevenue": 15000.00,
  "totalPayments": 250,
  "successfulPayments": 235,
  "failedPayments": 15,
  "successRate": "94.00"
}
```

## Payment Flow

### 1. Direct Payment (Payment Intent)

1. **Create Payment Intent**
   ```javascript
   const response = await fetch('/api/payment/create-payment', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ courseId: 'xxx' })
   });
   const { clientSecret } = await response.json();
   ```

2. **Confirm Payment on Frontend (Stripe.js)**
   ```javascript
   const { error } = await stripe.confirmCardPayment(clientSecret, {
     payment_method: {
       card: cardElement,
       billing_details: { name: 'John Doe' }
     }
   });
   ```

3. **Webhook Handles Success**
   - Payment status updated to "succeeded"
   - Enrollment automatically created
   - Confirmation email sent to user

### 2. Checkout Session (Hosted Page)

1. **Create Checkout Session**
   ```javascript
   const response = await fetch('/api/payment/create-checkout', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       courseId: 'xxx',
       successUrl: 'https://yoursite.com/success',
       cancelUrl: 'https://yoursite.com/cancel'
     })
   });
   const { url } = await response.json();
   ```

2. **Redirect to Stripe Checkout**
   ```javascript
   window.location.href = url;
   ```

3. **User Completes Payment on Stripe**
   - Redirected to success URL
   - Webhook handles payment confirmation
   - Enrollment created automatically

## Webhook Configuration

### Setup Webhook in Stripe Dashboard

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy webhook signing secret
5. Update `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### Webhook Event Handling

The payment service automatically handles:

- **payment_intent.succeeded** → Creates enrollment + sends email
- **payment_intent.payment_failed** → Updates payment status to failed
- **checkout.session.completed** → Same as payment_intent.succeeded

## Payment States

- **pending** - Payment created, awaiting processing
- **processing** - Payment intent created in Stripe
- **succeeded** - Payment completed successfully (user enrolled)
- **failed** - Payment failed
- **cancelled** - Payment cancelled by user or admin
- **refunded** - Payment refunded

## Enrollment Integration

When a payment succeeds:

1. **Enrollment Created**:
   ```javascript
   {
     user: userId,
     course: courseId,
     status: 'active',
     paymentStatus: 'paid',
     enrolledAt: new Date()
   }
   ```

2. **Payment Linked to Enrollment**:
   - Payment record updated with enrollment ID
   - Bi-directional reference for easy lookup

3. **Email Sent**:
   - User receives enrollment confirmation
   - Admin receives notification

## Refund Handling

When a refund is processed:

1. **Stripe Refund Created**
2. **Payment Status Updated** to "refunded"
3. **Enrollment Cancelled** (status → 'cancelled')
4. **Refund Email Sent** to user

## Database Schema

```typescript
{
  user: ObjectId,  // Reference to User
  course: ObjectId,  // Reference to Course
  enrollment: ObjectId,  // Reference to Enrollment (after payment)
  amount: Number,  // Payment amount
  currency: String,  // Currency code (e.g., 'usd')
  status: String,  // Payment status
  paymentMethod: String,  // 'stripe', 'paypal', etc.
  stripePaymentIntentId: String,  // Stripe payment intent ID
  stripeCustomerId: String,  // Stripe customer ID
  receiptUrl: String,  // URL to payment receipt
  metadata: Object,  // Additional data
  paidAt: Date,  // When payment succeeded
  refundedAt: Date,  // When refunded
  refundedAmount: Number,  // Refund amount
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

### Test Cards (Stripe Test Mode)

**Success:**
- `4242 4242 4242 4242` - Visa
- Use any future expiry, any CVC

**Decline:**
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds

### Test Payment Intent

```bash
curl -X POST http://localhost:5000/api/payment/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "507f1f77bcf86cd799439011"
  }'
```

### Test Checkout Session

```bash
curl -X POST http://localhost:5000/api/payment/create-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "507f1f77bcf86cd799439011",
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

## Security Best Practices

1. **Always verify webhooks** - Use Stripe signatures
2. **Never trust client-side amounts** - Get price from database
3. **Prevent double enrollments** - Check existing enrollments before payment
4. **Use idempotency** - Stripe payment intents are idempotent
5. **Log all transactions** - Keep audit trail
6. **Handle webhook retries** - Stripe retries failed webhooks

## Error Handling

The service handles various error cases:

- **Course not found** → 404 error
- **User not found** → 404 error
- **Already enrolled** → 400 error (prevents duplicate payments)
- **Invalid amount** → 400 error
- **Stripe API errors** → Logged and returned with friendly message
- **Payment already refunded** → 400 error

## Dependencies

- `@nestjs/common` - NestJS core
- `@nestjs/mongoose` - MongoDB integration
- `stripe` - Stripe SDK
- StripeModule - Custom Stripe integration
- MailModule - Email notifications
- EnrollmentModule - Course enrollments
- CourseModule - Course data
- UserModule - User data

## License

MIT
