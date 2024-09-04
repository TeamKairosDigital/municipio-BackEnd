import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Documentos } from './documentos.entity';

@Entity()
export class TipoDocumento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombreTipoDocumento: string;

    @Column()
    activo: boolean;

    @Column()
    fechaCreacion: Date;


}
