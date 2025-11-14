import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { Request } from 'express';

@ApiTags('Stripe Payments')
@Controller({ path: 'stripe', version: '1' })
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('payment-intent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a payment intent' })
  @ApiResponse({
    status: 200,
    description: 'Payment intent created successfully',
  })
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.stripeService.createPaymentIntent(dto);
  }

  @Post('checkout-session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a checkout session' })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
  })
  async createCheckoutSession(@Body() dto: CreateCheckoutSessionDto) {
    // In a real application, you would fetch course details from the database
    const courseName = `Course ${dto.courseId}`;
    const coursePrice = dto.priceInCents ? dto.priceInCents / 100 : 99.99;

    return this.stripeService.createCheckoutSession(
      dto,
      courseName,
      coursePrice,
    );
  }

  @Get('payment-intent/:id')
  @ApiOperation({ summary: 'Get payment intent details' })
  @ApiParam({ name: 'id', description: 'Payment Intent ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment intent retrieved successfully',
  })
  async getPaymentIntent(@Param('id') id: string) {
    return this.stripeService.getPaymentIntent(id);
  }

  @Get('checkout-session/:id')
  @ApiOperation({ summary: 'Get checkout session details' })
  @ApiParam({ name: 'id', description: 'Checkout Session ID' })
  @ApiResponse({
    status: 200,
    description: 'Checkout session retrieved successfully',
  })
  async getCheckoutSession(@Param('id') id: string) {
    return this.stripeService.getCheckoutSession(id);
  }

  @Post('payment-intent/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a payment intent' })
  @ApiParam({ name: 'id', description: 'Payment Intent ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment intent cancelled successfully',
  })
  async cancelPaymentIntent(@Param('id') id: string) {
    return this.stripeService.cancelPaymentIntent(id);
  }

  @Post('refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a refund' })
  @ApiResponse({ status: 200, description: 'Refund created successfully' })
  async createRefund(
    @Body() body: { paymentIntentId: string; amount?: number },
  ) {
    return this.stripeService.createRefund(body.paymentIntentId, body.amount);
  }

  @Get('payment-intents')
  @ApiOperation({ summary: 'List payment intents' })
  @ApiResponse({
    status: 200,
    description: 'Payment intents retrieved successfully',
  })
  async listPaymentIntents(
    @Query('limit') limit?: number,
    @Query('startingAfter') startingAfter?: string,
  ) {
    return this.stripeService.listPaymentIntents(limit, startingAfter);
  }

  @Post('customer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a Stripe customer' })
  @ApiResponse({ status: 200, description: 'Customer created successfully' })
  async createCustomer(
    @Body()
    body: {
      email: string;
      name: string;
      metadata?: Record<string, string>;
    },
  ) {
    return this.stripeService.createCustomer(
      body.email,
      body.name,
      body.metadata,
    );
  }

  @Get('customer/:id')
  @ApiOperation({ summary: 'Get customer details' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  async getCustomer(@Param('id') id: string) {
    return this.stripeService.getCustomer(id);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing request body');
    }

    try {
      const event = this.stripeService.verifyWebhookSignature(
        rawBody,
        signature,
      );

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('PaymentIntent succeeded:', event.data.object);
          // Handle successful payment
          // You can update enrollment status, send confirmation email, etc.
          break;

        case 'payment_intent.payment_failed':
          console.log('PaymentIntent failed:', event.data.object);
          // Handle failed payment
          break;

        case 'checkout.session.completed':
          console.log('Checkout session completed:', event.data.object);
          // Handle successful checkout
          break;

        case 'charge.refunded':
          console.log('Charge refunded:', event.data.object);
          // Handle refund
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true, eventType: event.type };
    } catch (error) {
      console.error('Webhook error:', error.message);
      throw new BadRequestException(`Webhook Error: ${error.message}`);
    }
  }

  @Post('create-payment-method')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create a payment method',
    description:
      'Creates a payment method (card) for future use. This tokenizes the card details without charging it.',
  })
  @ApiBody({ type: CreatePaymentMethodDto })
  @ApiResponse({
    status: 200,
    description: 'Payment method created successfully',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: 'pm_1234567890',
          description: 'Payment method ID',
        },
        type: {
          type: 'string',
          example: 'card',
        },
        card: {
          type: 'object',
          properties: {
            brand: { type: 'string', example: 'visa' },
            last4: { type: 'string', example: '4242' },
            expMonth: { type: 'number', example: 12 },
            expYear: { type: 'number', example: 2026 },
          },
        },
        billingDetails: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'John Doe' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid card details or validation error',
  })
  async createPaymentMethod(@Body() dto: CreatePaymentMethodDto) {
    return this.stripeService.createPaymentMethod(dto);
  }
}
