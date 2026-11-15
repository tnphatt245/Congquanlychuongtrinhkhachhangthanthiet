import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { QuyenHan } from './quyen-han.entity';
import { TaiKhoan } from './tai-khoan.entity';

@Entity('VaiTro')
export class VaiTro {
  @PrimaryGeneratedColumn()
  maVaiTro: number;

  @Column()
  tenVaiTro: string;

  @Column({ type: 'text', nullable: true })
  moTa: string;

  @ManyToMany(() => QuyenHan, (quyen) => quyen.vaiTros)
  @JoinTable({ name: 'VaiTro_QuyenHan' })
  quyenHans: QuyenHan[];

  @OneToMany(() => TaiKhoan, (tk) => tk.vaiTro)
  taiKhoans: TaiKhoan[];
}