import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { VaiTro } from './vai-tro.entity';
import { KhachHang } from './khach-hang.entity';
import { NhanVien } from './nhan-vien.entity';
import { NhatKyHeThong } from './nhat-ky-he-thong.entity';

@Entity('TaiKhoan')
export class TaiKhoan {
  @PrimaryGeneratedColumn()
  maTK: number;

  @Column({ unique: true })
  tenDangNhap: string;

  @Column()
  matKhau: string;

  @Column()
  trangThai: string;

  @Column({ type: 'date' })
  ngayTao: Date;

  @ManyToOne(() => VaiTro, (vaiTro) => vaiTro.taiKhoans)
  @JoinColumn({ name: 'maVaiTro' })
  vaiTro: VaiTro;

  @OneToOne(() => KhachHang, { nullable: true })
  @JoinColumn({ name: 'maKH' })
  khachHang: KhachHang;

  @OneToOne(() => NhanVien, { nullable: true })
  @JoinColumn({ name: 'maNV' })
  nhanVien: NhanVien;

  @OneToMany(() => NhatKyHeThong, (nk) => nk.taiKhoan)
  nhatKys: NhatKyHeThong[];
}