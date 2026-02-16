import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { FeedbackService } from './feedback.services';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@ApiTags('Feedback Questions')
@Controller({
  path: 'feedback',
  version: '1',
})
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create feedback questions for a course',
    description:
      'Creates multiple feedback questions for a course in bulk. Each question has text, type (rating/text/multiple_choice), and active status.',
  })
  @ApiBody({
    type: CreateFeedbackDto,
    description: 'Course ID and array of feedback questions',
    examples: {
      default: {
        summary: 'Create feedback questions',
        value: {
          courseId: '507f1f77bcf86cd799439011',
          questions: [
            {
              question: 'How would you rate the course content?',
              title: 'Learning Marketing',
              type: 'rating',
              status: true,
              options: ['Very Good', 'Good', 'Average', 'Poor'],
            },
            {
              question: 'Any additional comments?',
              title: 'Learner Registration',
              type: 'text',
              status: true,
              options: [
                'linkedin',
                'facebook',
                'google',
                'instgram',
                'twitter',
              ],
            },
          ],
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Feedback questions created successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439012' },
          courseId: { type: 'string', example: '507f1f77bcf86cd799439011' },
          question: {
            type: 'string',
            example: 'How would you rate the course content?',
          },
          options: {
            type: 'array',
            example: ['Very Good', 'Good', 'Average', 'Poor'],
          },
          type: { type: 'string', example: 'rating' },
          status: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid courseId or validation failed',
  })
  @ApiResponse({
    status: 422,
    description: 'Unprocessable entity - course not found or duplicate',
  })
  create(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all feedback questions' })
  @ApiOkResponse({ description: 'List of all feedback questions' })
  findAll() {
    return this.feedbackService.findAll();
  }

  @Get('course/:courseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get feedback questions by course ID' })
  @ApiParam({
    name: 'courseId',
    type: String,
    required: true,
    description: 'Course MongoDB ObjectId',
  })
  @ApiOkResponse({ description: 'Feedback questions for the course' })
  findByCourseId(@Param('courseId') courseId: string) {
    return this.feedbackService.findByCourseId(courseId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get feedback question by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Feedback question MongoDB ObjectId',
  })
  @ApiOkResponse({ description: 'Feedback question found' })
  @ApiResponse({ status: 404, description: 'Feedback question not found' })
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update feedback question' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Feedback question MongoDB ObjectId',
  })
  @ApiBody({ type: UpdateFeedbackDto })
  @ApiOkResponse({ description: 'Feedback question updated successfully' })
  @ApiResponse({ status: 404, description: 'Feedback question not found' })
  update(@Param('id') id: string, @Body() dto: UpdateFeedbackDto) {
    return this.feedbackService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete feedback question' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Feedback question MongoDB ObjectId',
  })
  @ApiOkResponse({ description: 'Feedback question deleted successfully' })
  @ApiResponse({ status: 404, description: 'Feedback question not found' })
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}
