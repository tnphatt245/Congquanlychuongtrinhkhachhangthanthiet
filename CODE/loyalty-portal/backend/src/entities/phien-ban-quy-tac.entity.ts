import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { QuyTacTichDiem } from './quy-tac-tich-diem.entity';

@Entity('PhienBanQuyTac')
export class PhienBanQuyTac {
  @PrimaryGeneratedColumn()
  maPhienBan: number;

  @Column({ type: 'int' })
  soPhienBan: number;

  @Column({ type: 'double' })
  tyLe: number;

  @Column({ type: 'text', nullable: true })
  dieuKien: string;

  @Column({ type: 'date' })
  ngayHieuLuc: Date;

  @Column()
  trangThai: string;

  @ManyToOne(() => QuyTacTichDiem, (qt) => qt.phienBans)
  @JoinColumn({ name: 'maQuyTac' })
  quyTacTichDiem: QuyTacTichDiem;
}