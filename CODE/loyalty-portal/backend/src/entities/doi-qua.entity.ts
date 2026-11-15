import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { KhachHang } from './khach-hang.entity';
import { QuaTang } from './qua-tang.entity';

@Entity('DoiQua')
export class DoiQua {
  @PrimaryGeneratedColumn()
  maDoiQua: number;

  @Column({ type: 'date' })
  ngayDoi: Date;

  @Column({ type: 'int' })
  diemSuDung: number;

  @Column()
  trangThai: string;

  @ManyToOne(() => KhachHang)
  @JoinColumn({ name: 'maKH' })
  khachHang: KhachHang;

  @ManyToOne(() => QuaTang)
  @JoinColumn({ name: 'maQua' })
  quaTang: QuaTang;
}