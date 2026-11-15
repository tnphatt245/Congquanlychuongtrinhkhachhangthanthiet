import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('QuaTang')
export class QuaTang {
  @PrimaryGeneratedColumn()
  maQua: number;

  @Column()
  tenQua: string;

  @Column({ type: 'int' })
  diemDoi: number;

  @Column({ type: 'int', default: 0 })
  soLuongTon: number;

  @Column({ type: 'date' })
  hanDung: Date;

  @Column()
  trangThai: string;
}