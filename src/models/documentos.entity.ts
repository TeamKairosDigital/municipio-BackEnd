import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { TipoDocumento } from './tipoDocumento.entity';
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
    tipoDocumentoId: number;

    @Column()
    activo: boolean;

    @Column()
    fechaCreacion: Date;

    @ManyToOne(() => TipoDocumento, (tipoDocumento) => tipoDocumento.documentos)
    tipoDocumento: TipoDocumento;

    @OneToMany(() => Archivos, (archivo) => archivo.documento)
    archivos: Archivos[];
}
