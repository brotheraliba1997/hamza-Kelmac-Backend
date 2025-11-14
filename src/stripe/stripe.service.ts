import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { AllConfigType } from '../config/config.type';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService<AllConfigType>) {
    const apiKey = this.configService.get('stripe.apiKey', { infer: true });

    if (!apiKey) {
      throw new Error('Stripe API key is not configured');
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-10-29.clover',
    });
  }

  /**
   * Create a payment intent for direct payment
   */
  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    const currency =
      dto.currency ||
      this.configService.get('stripe.currency', { infer: true }) ||
      'usd';

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: dto.amount,
      currency: currency,
      metadata: {
        courseId: dto.courseId,
        userId: dto.userId,
      },
      description: dto.description || `Course enrollment - ${dto.courseId}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    };
  }

  /**
   * Create a checkout session for hosted payment page
   */
  async createCheckoutSession(
    dto: CreateCheckoutSessionDto,
    courseName: string,
    coursePrice: number,
  ) {
    const priceInCents = dto.priceInCents || Math.round(coursePrice * 100);
    const currency =
      this.configService.get('stripe.currency', { infer: true }) || 'usd';

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: courseName,
              description: `Enrollment for ${courseName}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      metadata: {
        courseId: dto.courseId,
        userId: dto.userId,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Retrieve a payment intent by ID
   */
  async getPaymentIntent(paymentIntentId: string) {
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      metadata: paymentIntent.metadata,
      created: paymentIntent.created,
    };
  }

  /**
   * Retrieve a checkout session by ID
   */
  async getCheckoutSession(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    return {
      id: session.id,
      paymentStatus: session.payment_status,
      amount: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      customer: session.customer,
    };
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string) {
    const paymentIntent =
      await this.stripe.paymentIntents.cancel(paymentIntentId);

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
    };
  }

  /**
   * Create a refund
   */
  async createRefund(paymentIntentId: string, amount?: number) {
    const refundData: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = amount;
    }

    const refund = await this.stripe.refunds.create(refundData);

    return {
      id: refund.id,
      amount: refund.amount,
      status: refund.status,
      paymentIntentId: refund.payment_intent as string,
    };
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get('stripe.webhookSecret', {
      infer: true,
    });

    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not configured');
    }

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  /**
   * List all payment intents with filters
   */
  async listPaymentIntents(limit: number = 10, startingAfter?: string) {
    const params: Stripe.PaymentIntentListParams = { limit };

    if (startingAfter) {
      params.starting_after = startingAfter;
    }

    const paymentIntents = await this.stripe.paymentIntents.list(params);

    return {
      data: paymentIntents.data.map((pi) => ({
        id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        metadata: pi.metadata,
        created: pi.created,
      })),
      hasMore: paymentIntents.has_more,
    };
  }

  /**
   * Create a customer
   */
  async createCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string>,
  ) {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata,
    });

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
    };
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string) {
    const customer = await this.stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      throw new Error('Customer has been deleted');
    }

    return {
      id: customer.id,
      email: (customer as Stripe.Customer).email || null,
      name: (customer as Stripe.Customer).name || null,
      metadata: (customer as Stripe.Customer).metadata || {},
    };
  }

  /**
   * Create a payment method (card)
   */
  async createPaymentMethod(dto: CreatePaymentMethodDto) {
    const paymentMethod = await this.stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: dto.cardNumber,
        exp_month: dto.expMonth,
        exp_year: dto.expYear,
        cvc: dto.cvc,
      },
      billing_details: {
        name: dto.cardholderName,
      },
    });

    return {
      id: paymentMethod.id,
      type: paymentMethod.type,
      card: {
        brand: paymentMethod.card?.brand,
        last4: paymentMethod.card?.last4,
        expMonth: paymentMethod.card?.exp_month,
        expYear: paymentMethod.card?.exp_year,
      },
      billingDetails: {
        name: paymentMethod.billing_details.name,
      },
    };
  }
}
