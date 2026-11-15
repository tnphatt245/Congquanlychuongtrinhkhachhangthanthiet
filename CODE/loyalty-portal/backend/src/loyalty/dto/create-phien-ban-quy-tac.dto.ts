import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePhienBanQuyTacDto {
  @ApiProperty({ example: 1, description: 'Số phiên bản quy tắc' })
  @IsNumber()
  @Min(1)
  soPhienBan: number;

  @ApiProperty({ example: 0.05, description: 'Tỷ lệ quy đổi điểm (ví dụ: 0.05 = 5%)' })
  @IsNumber()
  tyLe: number;

  @ApiProperty({ example: 'Áp dụng cho hóa đơn từ 100.000 VNĐ', description: 'Điều kiện áp dụng', required: false })
  @IsString()
  @IsOptional()
  dieuKien?: string;

  @ApiProperty({ example: '2026-11-01', description: 'Ngày có hiệu lực (YYYY-MM-DD)' })
  @IsDateString()
  ngayHieuLuc: string;

  @ApiProperty({ example: 'HOAT_DONG', description: 'Trạng thái phiên bản', required: false })
  @IsString()
  @IsOptional()
  trangThai?: string;

  @ApiProperty({ example: 1, description: 'Mã quy tắc tích điểm' })
  @IsNumber()
  maQuyTac: number;
}