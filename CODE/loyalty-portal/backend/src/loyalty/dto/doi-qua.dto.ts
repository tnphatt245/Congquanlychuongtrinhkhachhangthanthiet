import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DoiQuaDto {
  @ApiProperty({ example: 1, description: 'Mã món quà cần đổi' })
  @IsNumber()
  @IsNotEmpty()
  maQua: number;
}