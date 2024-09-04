import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { avisoPrivacidad } from './avisoPrivacidad.entity';

@Entity()
export class avisoPrivacidadArchivos {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    NombreArchivo: string;

    @Column()
    uuid: string;

    @Column()
    avisoPrivacidadId: number;

    @Column()
    Activo: boolean;

    @Column()
    fechaCreacion: Date;

    @ManyToOne(() => avisoPrivacidad, (aviso) => aviso.avisoPrivacidadArchivos)
    avisoPrivacidad: avisoPrivacidad;

}
