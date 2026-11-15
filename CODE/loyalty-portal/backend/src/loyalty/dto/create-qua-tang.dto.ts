import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuaTangDto {
  @ApiProperty({ example: 'Voucher Phim CGV 100k', description: 'Tên món quà' })
  @IsString()
  @IsNotEmpty()
  tenQua: string;

  @ApiProperty({ example: 500, description: 'Số điểm cần để quy đổi quà' })
  @IsNumber()
  @Min(1)
  diemDoi: number;

  @ApiProperty({ example: 50, description: 'Số lượng quà hiện có trong kho' })
  @IsNumber()
  @Min(0)
  soLuongTon: number;

  @ApiProperty({ example: '2026-12-31', description: 'Hạn sử dụng quà (YYYY-MM-DD)', required: false })
  @IsDateString()
  @IsOptional()
  hanDung?: string;

  @ApiProperty({ example: 'HOAT_DONG', description: 'Trạng thái quà tặng', required: false })
  @IsString()
  @IsOptional()
  trangThai?: string;
}