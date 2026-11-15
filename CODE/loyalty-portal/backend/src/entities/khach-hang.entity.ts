import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { HangThanhVien } from './hang-thanh-vien.entity';

@Entity('KhachHang')
export class KhachHang {
  @PrimaryGeneratedColumn()
  maKH: number;

  @Column()
  hoTen: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  soDienThoai: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  matKhau: string

  @Column({ type: 'int', default: 0 })
  diemHienTai: number;

  @Column({ type: 'date' })
  ngayThamGia: Date;

  @ManyToOne(() => HangThanhVien, (hang) => hang.khachHangs)
  @JoinColumn({ name: 'maHang' })
  hangThanhVien: HangThanhVien;
}