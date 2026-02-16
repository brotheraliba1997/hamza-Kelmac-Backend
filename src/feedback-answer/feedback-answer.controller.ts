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

import { CreateFeedbackAnswerDto } from './dto/create-feedback-answer.dto';
import { UpdateFeedbackAnswerDto } from './dto/update-feedback-answer.dto';
import { FeedbackAnswerService } from './feedback-answer.services';

@ApiTags('Feedback Answers')
@Controller({
  path: 'feedback-answers',
  version: '1',
})
export class FeedbackAnswerController {
  constructor(private readonly feedbackAnswerService: FeedbackAnswerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new feedback answer',
    description:
      'Submits feedback answers for a course. User must be enrolled in the course via class schedule. Each answer is linked to a feedback question.',
  })
  @ApiBody({
    type: CreateFeedbackAnswerDto,
    description: 'User feedback submission with answers',
    examples: {
      default: {
        summary: 'Submit feedback',
        value: {
          userId: '507f1f77bcf86cd799439011',

          answers: [
            {
              questionId: '507f1f77bcf86cd799439012',
              answer: '5',
              type: 'rating',
            },
            {
              questionId: '507f1f77bcf86cd799439014',
              answer: 'Great course!',
              type: 'text',
            },
          ],
          isCompleted: true,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Feedback answer created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '507f1f77bcf86cd799439015' },
        userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        courseId: { type: 'string', example: '507f1f77bcf86cd799439013' },
        answers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'string' },
              answer: { type: 'string' },
              type: { type: 'string' },
            },
          },
        },
        isCompleted: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 404,
    description: 'Class schedule or student not found',
  })
  create(@Body() createFeedbackAnswerDto: CreateFeedbackAnswerDto) {
    return this.feedbackAnswerService.create(createFeedbackAnswerDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all feedback answers',
    description: 'Retrieves a list of all feedback answer submissions',
  })
  @ApiOkResponse({
    description: 'List of all feedback answers',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          courseId: { type: 'string' },
          answers: { type: 'array' },
          isCompleted: { type: 'boolean' },
        },
      },
    },
  })
  findAll() {
    return this.feedbackAnswerService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a feedback answer by ID',
    description: 'Retrieves a single feedback answer by MongoDB ObjectId',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Feedback answer MongoDB ObjectId',
  })
  @ApiOkResponse({
    description: 'Feedback answer found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        courseId: { type: 'string' },
        answers: { type: 'array' },
        isCompleted: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Feedback answer not found' })
  findOne(@Param('id') id: string) {
    return this.feedbackAnswerService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a feedback answer by ID',
    description: 'Updates an existing feedback answer submission',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Feedback answer MongoDB ObjectId',
  })
  @ApiBody({ type: UpdateFeedbackAnswerDto })
  @ApiOkResponse({
    description: 'Feedback answer updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Feedback answer not found' })
  update(
    @Param('id') id: string,
    @Body() updateFeedbackAnswerDto: UpdateFeedbackAnswerDto,
  ) {
    return this.feedbackAnswerService.update(id, updateFeedbackAnswerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a feedback answer by ID',
    description: 'Deletes a feedback answer submission',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Feedback answer MongoDB ObjectId',
  })
  @ApiOkResponse({ description: 'Feedback answer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Feedback answer not found' })
  remove(@Param('id') id: string) {
    return this.feedbackAnswerService.remove(id);
  }
}
