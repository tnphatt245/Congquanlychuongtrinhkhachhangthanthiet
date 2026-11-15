import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { KhieuNai } from './khieu-nai.entity';
import { NhanVien } from './nhan-vien.entity';

@Entity('PhanHoiKhieuNai')
export class PhanHoiKhieuNai {
  @PrimaryGeneratedColumn()
  maPH: number;

  @Column({ type: 'text' })
  noiDung: string;

  @Column({ type: 'datetime' })
  thoiGian: Date;

  @ManyToOne(() => KhieuNai)
  @JoinColumn({ name: 'maKN' })
  khieuNai: KhieuNai;

  @ManyToOne(() => NhanVien)
  @JoinColumn({ name: 'maNV' })
  nhanVien: NhanVien;
}