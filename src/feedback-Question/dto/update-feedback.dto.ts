import { PartialType } from '@nestjs/swagger';
import { QuestionDto } from './create-feedback.dto';

export class UpdateFeedbackDto extends PartialType(QuestionDto) {}
