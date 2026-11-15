import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { KhachHang } from './khach-hang.entity';

@Entity('GiaoDichDiem')
export class GiaoDichDiem {
  @PrimaryGeneratedColumn()
  maGD: number;

  @Column()
  loaiGD: string; // Tích điểm, Trừ điểm, Hết hạn

  @Column({ type: 'int' })
  soDiem: number;

  @Column({ type: 'datetime' })
  thoiGian: Date;

  @Column({ type: 'text', nullable: true })
  moTa: string;

  @ManyToOne(() => KhachHang)
  @JoinColumn({ name: 'maKH' })
  khachHang: KhachHang;
}