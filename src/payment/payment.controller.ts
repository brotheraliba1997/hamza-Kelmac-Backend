import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentStatus } from './schema/payment.schema';

@ApiTags('Payment')
@Controller('v1/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a payment intent for a course' })
  @ApiResponse({
    status: 200,
    description: 'Payment intent created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Course or user not found' })
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    const userId = createPaymentDto.userId;

    if (!userId) {
      throw new NotFoundException('User ID is required');
    }

    return this.paymentService.createPayment(userId, createPaymentDto);
  }

  @Post('create-checkout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a checkout session for a course' })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Course or user not found' })
  async createCheckout(
    @Body() createCheckoutDto: CreateCheckoutDto,
    @Request() req: any,
  ) {
    // In a real app, get userId from authenticated user
    const userId = req.user?.id || createCheckoutDto.courseId; // Temporary for testing
    return this.paymentService.createCheckout(userId, createCheckoutDto);
  }

  @Post('refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async refundPayment(@Body() refundDto: RefundPaymentDto) {
    return this.paymentService.refundPayment(refundDto);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm payment and send course materials',
    description:
      'Confirm a payment by PaymentIntent ID. This will update payment status, send confirmation email to student with course materials link, and return course materials in response.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed successfully with course materials',
    schema: {
      example: {
        success: true,
        message: 'Payment confirmed',
        payment: {
          id: '675f4aaf2b67a23d4c9f2941',
          status: 'succeeded',
          amount: 99.99,
          currency: 'USD',
          paidAt: '2025-11-19T12:00:00.000Z',
        },
        course: {
          id: '675f4aaf2b67a23d4c9f2942',
          title: 'Full Stack Web Development',
          slug: 'full-stack-web-development',
        },
        courseMaterialLink:
          'https://frontend.com/courses/full-stack-web-development/materials',
        courseMaterials: [
          {
            name: 'Session 1 - Full Week',
            type: 'Session',
            link: 'https://frontend.com/courses/full-stack-web-development/materials#session-1',
          },
          {
            name: 'Session 2 - Split Week',
            type: 'Session',
            link: 'https://frontend.com/courses/full-stack-web-development/materials#session-2',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['paymentIntentId'],
      properties: {
        paymentIntentId: {
          type: 'string',
          description: 'Stripe PaymentIntent ID (e.g., pi_xxx)',
          example: 'pi_3QxYz1234567890abcdef',
        },
      },
    },
  })
  async confirmPayment(@Body() body: { paymentIntentId: string }) {
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      throw new NotFoundException('PaymentIntentId is required');
    }

    return this.paymentService.confirmPayment(paymentIntentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(@Param('id') id: string) {
    return this.paymentService.getPayment(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'User payments retrieved successfully',
  })
  async getUserPayments(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.paymentService.getUserPayments(userId, page, limit);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get course payments (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Course payments retrieved successfully',
  })
  async getCoursePayments(
    @Param('courseId') courseId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.paymentService.getCoursePayments(courseId, page, limit);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getAllPayments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: PaymentStatus,
  ) {
    return this.paymentService.getAllPayments(page, limit, status);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get payment statistics (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Payment stats retrieved successfully',
  })
  async getPaymentStats() {
    return this.paymentService.getPaymentStats();
  }
}
