import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { KhachHang } from './khach-hang.entity';
import { GiaoDichDiem } from './giao-dich-diem.entity';

@Entity('KhieuNai')
export class KhieuNai {
  @PrimaryGeneratedColumn()
  maKN: number;

  @Column()
  tieuDe: string;

  @Column({ type: 'text' })
  noiDung: string;

  @Column({ type: 'date' })
  ngayGui: Date;

  @Column()
  mucUuTien: string;

  @Column()
  trangThai: string;

  @ManyToOne(() => KhachHang)
  @JoinColumn({ name: 'maKH' })
  khachHang: KhachHang;

  @ManyToOne(() => GiaoDichDiem, { nullable: true })
  @JoinColumn({ name: 'maGD' })
  giaoDichDiem: GiaoDichDiem;
}