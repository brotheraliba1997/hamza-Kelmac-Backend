import { PartialType } from '@nestjs/swagger';
import { CreateBundleOfferDto } from './create-bundle-offer.dto';

export class UpdateBundleOfferDto extends PartialType(CreateBundleOfferDto) {}
