import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Documentos } from './documentos.entity';
import { Periodos } from './periodos.entity';
import { UsersMunicipality } from './usersMunicipality.entity';

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

    @Column()
    UsersMunicipalityId: number;

    @ManyToOne(() => Documentos, (documento) => documento.archivos)
    documento: Documentos;

    @ManyToOne(() => Periodos, (periodo) => periodo.archivos)
    periodo: Periodos;

    @ManyToOne(() => UsersMunicipality, (User) => User.archivos)
    @JoinColumn({ name: 'UsersMunicipalityId' })
    User: UsersMunicipality;
}
