import { IsNumber, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DieuChinhDiemDto {
  @ApiProperty({ example: 1, description: 'Mã khách hàng cần điều chỉnh' })
  @IsNumber()
  @IsNotEmpty()
  maKH: number;

  @ApiProperty({ example: 500, description: 'Số điểm cộng (+) hoặc trừ (-)' })
  @IsNumber()
  @IsNotEmpty()
  soDiemThayDoi: number;

  @ApiProperty({ example: 'Đền bù sự cố hệ thống', description: 'Lý do điều chỉnh' })
  @IsString()
  @IsNotEmpty()
  lyDo: string;
}