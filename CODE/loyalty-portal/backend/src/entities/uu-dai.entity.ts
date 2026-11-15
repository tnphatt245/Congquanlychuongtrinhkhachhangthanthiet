import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { HangThanhVien } from './hang-thanh-vien.entity';

@Entity('UuDai')
export class UuDai {
  @PrimaryGeneratedColumn()
  maUuDai: number;

  @Column()
  tenUuDai: string;

  @Column({ type: 'text', nullable: true })
  moTa: string;

  @Column({ type: 'date' })
  ngayBatDau: Date;

  @Column({ type: 'date' })
  ngayKetThuc: Date;

  @Column()
  trangThai: string;

  @ManyToMany(() => HangThanhVien)
  @JoinTable({ name: 'HangThanhVien_UuDai' })
  hangThanhViens: HangThanhVien[];
}