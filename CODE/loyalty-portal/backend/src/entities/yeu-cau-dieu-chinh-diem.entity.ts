import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { KhachHang } from './khach-hang.entity';
import { NhanVien } from './nhan-vien.entity';
import { KhieuNai } from './khieu-nai.entity';

@Entity('YeuCauDieuChinhDiem')
export class YeuCauDieuChinhDiem {
  @PrimaryGeneratedColumn()
  maYC: number;

  @Column({ type: 'int' })
  soDiem: number;

  @Column({ type: 'text' })
  lyDo: string;

  @Column({ type: 'date' })
  ngayTao: Date;

  @Column()
  trangThai: string;

  @Column({ type: 'text', nullable: true })
  lyDoTuChoi: string;

  @ManyToOne(() => KhachHang)
  @JoinColumn({ name: 'maKH' })
  khachHang: KhachHang;

  @ManyToOne(() => NhanVien, { nullable: true })
  @JoinColumn({ name: 'maNV_Tao' })
  nhanVienTao: NhanVien;

  @ManyToOne(() => NhanVien, { nullable: true })
  @JoinColumn({ name: 'maNV_Duyet' })
  nhanVienDuyet: NhanVien;

  @ManyToOne(() => KhieuNai, { nullable: true })
  @JoinColumn({ name: 'maKN' })
  khieuNai: KhieuNai;
}