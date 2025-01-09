import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Archivos } from './archivos.entity';

@Entity()
export class Documentos {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombreDocumento: string;

    @Column({ nullable: true })
    ley: string;

    @Column({ nullable: true })
    categoria: string;

    @Column()
    activo: boolean;

    @Column()
    fechaCreacion: Date;

    @OneToMany(() => Archivos, (archivo) => archivo.documento)
    archivos: Archivos[];
}
