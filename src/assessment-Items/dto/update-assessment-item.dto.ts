import { PartialType } from '@nestjs/swagger';
import { CreateAssessmentItemDto } from './create-assessment-Item.dto';

export class UpdateAssessmentItemDto extends PartialType(
  CreateAssessmentItemDto,
) {}
