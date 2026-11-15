import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { DoiQua } from './doi-qua.entity';

@Entity('EVoucher')
export class EVoucher {
  @PrimaryGeneratedColumn()
  maVoucher: number;

  @Column({ unique: true })
  maCode: string;

  @Column({ type: 'date' })
  ngayPhatHanh: Date;

  @Column({ type: 'date' })
  hanSuDung: Date;

  @Column()
  trangThai: string;

  @Column({ type: 'date', nullable: true })
  ngaySuDung: Date;

  @OneToOne(() => DoiQua)
  @JoinColumn({ name: 'maDoiQua' })
  doiQua: DoiQua;
}