import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Documentos } from './documentos.entity';
import { Periodos } from './periodos.entity';

@Entity()
export class Archivos {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombreArchivo: string;

    @Column()
    documentoId: number;

    @Column()
    periodoId: number;

    @Column()
    anualidad: string;

    @Column()
    activo: boolean;

    @Column()
    fechaCreacion: Date;

    @ManyToOne(() => Documentos, (documento) => documento.archivos)
    documento: Documentos;

    @ManyToOne(() => Periodos, (periodo) => periodo.archivos)
    periodo: Periodos;
}
