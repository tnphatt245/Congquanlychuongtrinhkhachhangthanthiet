import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TaiKhoan } from './tai-khoan.entity';

@Entity('NhatKyHeThong')
export class NhatKyHeThong {
  @PrimaryGeneratedColumn()
  maNhatKy: number;

  @Column()
  hanhDong: string;

  @Column()
  doiTuong: string;

  @Column({ type: 'text', nullable: true })
  giaTriCu: string;

  @Column({ type: 'text', nullable: true })
  giaTriMoi: string;

  @Column({ type: 'datetime' })
  thoiGian: Date;

  @Column({ nullable: true })
  diaChiIP: string;

  @ManyToOne(() => TaiKhoan, (tk) => tk.nhatKys)
  @JoinColumn({ name: 'maTK' })
  taiKhoan: TaiKhoan;
}