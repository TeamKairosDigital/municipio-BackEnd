import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { avisoPrivacidad } from './avisoPrivacidad.entity';

@Entity()
export class avisoPrivacidadArchivos {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombreArchivo: string;

    @Column()
    nombre: string;

    @Column()
    tipo: number;

    @Column()
    Activo: boolean;

    @Column()
    fechaCreacion: Date;

    @ManyToOne(() => avisoPrivacidad, (avisoPrivacidad) => avisoPrivacidad.avisoPrivacidadArchivos)
    @JoinColumn({ name: 'avisoPrivacidadId' })
    avisoPrivacidad: avisoPrivacidad;

}
