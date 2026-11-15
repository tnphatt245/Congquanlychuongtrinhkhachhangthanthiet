import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKhieuNaiDto {
  @ApiProperty({ example: 'Chưa nhận được điểm giao dịch', description: 'Tiêu đề khiếu nại' })
  @IsString()
  @IsNotEmpty()
  tieuDe: string;

  @ApiProperty({ example: 'Tôi có mua đơn hàng ngày hôm qua nhưng hệ thống chưa cộng điểm.', description: 'Nội dung chi tiết' })
  @IsString()
  @IsNotEmpty()
  noiDung: string;

  @ApiProperty({ example: 'TRUNG_BINH', description: 'Mức độ ưu tiên (THAP, TRUNG_BINH, CAO)', required: false })
  @IsString()
  @IsOptional()
  mucUuTien?: string;

  @ApiProperty({ example: 1, description: 'Mã giao dịch phát sinh sự cố (nếu có)', required: false })
  @IsNumber()
  @IsOptional()
  maGD?: number;
}