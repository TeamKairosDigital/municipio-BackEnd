import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Archivos } from './archivos.entity';

@Entity()
export class Periodos {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombrePeriodo: string;

    @Column()
    activo: boolean;

    @Column()
    fechaCreacion: Date;

    @OneToMany(() => Archivos, (archivo) => archivo.periodo)
    archivos: Archivos[];
}
