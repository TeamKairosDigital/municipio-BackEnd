import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('blogs')
export class Blog {
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
