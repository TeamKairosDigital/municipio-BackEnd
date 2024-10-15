import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('obras')
export class Obras {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column()
  nombreArchivo: string;

  @Column()
  Activo: boolean;

  @Column()
  fechaCreacion: Date;

}
