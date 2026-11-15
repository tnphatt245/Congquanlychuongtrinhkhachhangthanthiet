import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('NhanVien')
export class NhanVien {
  @PrimaryGeneratedColumn()
  maNV: number;

  @Column()
  hoTen: string;

  @Column({ unique: true })
  email: string;

  @Column()
  chucVu: string;
}