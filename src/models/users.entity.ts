import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Archivos } from './archivos.entity';
import { avisoPrivacidad } from './avisoPrivacidad.entity';
import { Municipality } from './Municipality.entity';

@Entity()
export class Users {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    Nombre: string;

    @Column()
    UserName: string;

    @Column()
    Pass: string;

    @Column()
    Municipio: string;

    @Column()
    activo: boolean;

    @Column()
    fechaCreacion: Date;

    // Relación con la entidad Archivos
    @OneToMany(() => Archivos, (archivo) => archivo.user)
    archivos: Archivos[];

    // Relación con la entidad AvisoPrivacidad
    @OneToMany(() => avisoPrivacidad, (aviso) => aviso.user)
    avisoPrivacidad: avisoPrivacidad[];

    // Relación con la entidad Municipality
    @ManyToOne(() => Municipality, (municipality) => municipality.users)
    @JoinColumn({ name: 'municipality_id' })
    municipality: Municipality;

}
