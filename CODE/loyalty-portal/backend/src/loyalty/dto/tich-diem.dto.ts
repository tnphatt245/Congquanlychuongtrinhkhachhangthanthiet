import { IsNumber, IsNotEmpty, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TichDiemDto {
  @ApiProperty({ description: 'Số điểm muốn tích', example: 500 })
  @IsNumber({}, { message: 'Số điểm phải là số' })
  @Min(1, { message: 'Số điểm phải lớn hơn 0' })
  @IsNotEmpty({ message: 'Số điểm không được để trống' })
  soDiem: number;

  @ApiProperty({ description: 'Mô tả giao dịch tích điểm', example: 'Tích điểm mua hàng' })
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @IsOptional()
  moTa?: string;
}