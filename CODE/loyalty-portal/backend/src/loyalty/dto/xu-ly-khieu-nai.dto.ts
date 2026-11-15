import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class XuLyKhieuNaiDto {
  @ApiProperty({ example: 'DA_DUYET', description: 'Trạng thái xử lý (DA_DUYET hoặc TU_CHOI)' })
  @IsString()
  @IsIn(['DA_DUYET', 'TU_CHOI'])
  @IsNotEmpty()
  trangThai: string;

  @ApiProperty({ example: 100, description: 'Số điểm đền bù/cộng thêm cho khách hàng nếu được duyệt', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  soDiemCong?: number;

  @ApiProperty({ example: 'Xác minh đơn hàng thành công, đền bù 100 điểm.', description: 'Lý do / Phản hồi xử lý', required: false })
  @IsString()
  @IsOptional()
  lyDo?: string;
}