import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHangThanhVienDto {
  @ApiProperty({ example: 'Bạc', description: 'Tên hạng thành viên' })
  @IsString()
  @IsNotEmpty()
  tenHang: string;

  @ApiProperty({ example: 0, description: 'Mức điểm tối thiểu để đạt hạng' })
  @IsNumber()
  @Min(0)
  diemToiThieu: number;

  @ApiProperty({ example: 1000, description: 'Mức điểm tối đa của hạng' })
  @IsNumber()
  diemToiDa: number;

  @ApiProperty({ example: 'Giảm 5% hóa đơn, quà sinh nhật', description: 'Quyền lợi của hạng', required: false })
  @IsString()
  @IsOptional()
  quyenLoi?: string;
}