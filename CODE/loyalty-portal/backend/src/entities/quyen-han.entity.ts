import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { VaiTro } from './vai-tro.entity';

@Entity('QuyenHan')
export class QuyenHan {
  @PrimaryGeneratedColumn()
  maQuyen: number;

  @Column()
  tenQuyen: string;

  @Column({ type: 'text', nullable: true })
  moTa: string;

  @ManyToMany(() => VaiTro, (vaiTro) => vaiTro.quyenHans)
  vaiTros: VaiTro[];
}