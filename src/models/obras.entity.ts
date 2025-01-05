import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Municipality } from './Municipality.entity';
import { Users } from './users.entity';

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

  // Relación con la entidad Municipality
  @ManyToOne(() => Municipality, (municipality) => municipality.obras)
  @JoinColumn({ name: 'municipality_id' })
  municipality: Municipality;

  // Relación con la entidad Users
  @ManyToOne(() => Users, (User) => User.archivos)
  @JoinColumn({ name: 'UsuarioCreacionId' })
  user: Users;


}
