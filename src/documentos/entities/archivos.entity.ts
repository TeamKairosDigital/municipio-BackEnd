import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Municipality } from '../../users/entities/Municipality.entity';
import { Documentos } from './documentos.entity';
import { Periodos } from './periodos.entity';
import { Users } from 'src/users/entities/users.entity';

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
    UsuarioCreacionId: number;

    @Column()
    municipality_id: number;

    // Relación con la entidad Documentos
    @ManyToOne(() => Documentos, (documento) => documento.archivos)
    documento: Documentos;

    // Relación con la entidad Periodos
    @ManyToOne(() => Periodos, (periodo) => periodo.archivos)
    periodo: Periodos;

    // Relación con la entidad Users
    @ManyToOne(() => Users, (User) => User.archivos)
    @JoinColumn({ name: 'UsuarioCreacionId' })
    user: Users;

    // Relación con la entidad Municipality
    @ManyToOne(() => Municipality, (municipality) => municipality.users)
    @JoinColumn({ name: 'municipality_id' })
    municipality: Municipality;
}
