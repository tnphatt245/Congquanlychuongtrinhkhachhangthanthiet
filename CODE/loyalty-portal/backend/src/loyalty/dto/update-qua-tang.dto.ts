import { PartialType } from '@nestjs/swagger';
import { CreateQuaTangDto } from './create-qua-tang.dto';

export class UpdateQuaTangDto extends PartialType(CreateQuaTangDto) {}