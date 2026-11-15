import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { KhachHang } from './khach-hang.entity';

@Entity('HangThanhVien')
export class HangThanhVien {
  @PrimaryGeneratedColumn()
  maHang: number;

  @Column()
  tenHang: string;

  @Column({ type: 'int', default: 0 })
  diemToiThieu: number;

  @Column({ type: 'int' })
  diemToiDa: number;

  @Column({ type: 'text', nullable: true })
  quyenLoi: string;

  @OneToMany(() => KhachHang, (khachHang) => khachHang.hangThanhVien)
  khachHangs: KhachHang[];
}