import { PartialType } from '@nestjs/swagger';
import { CreateFeedbackAnswerDto } from './create-feedback-answer.dto';

export class UpdateFeedbackAnswerDto extends PartialType(
  CreateFeedbackAnswerDto,
) {}
