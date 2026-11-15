import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuyTacDto {
  @ApiProperty({ example: 'Tích điểm đơn hàng', description: 'Tên quy tắc tích điểm' })
  @IsString()
  @IsNotEmpty()
  tenQuyTac: string;

  @ApiProperty({ example: 'Quy tắc tích điểm chuẩn cho toàn hệ thống', description: 'Mô tả chi tiết', required: false })
  @IsString()
  @IsOptional()
  moTa?: string;
}