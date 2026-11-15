import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PhienBanQuyTac } from './phien-ban-quy-tac.entity';

@Entity('QuyTacTichDiem')
export class QuyTacTichDiem {
  @PrimaryGeneratedColumn()
  maQuyTac: number;

  @Column()
  tenQuyTac: string;

  @Column({ type: 'text', nullable: true })
  moTa: string;

  @OneToMany(() => PhienBanQuyTac, (pb) => pb.quyTacTichDiem)
  phienBans: PhienBanQuyTac[];
}