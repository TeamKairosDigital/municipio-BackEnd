import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Users } from './users.entity';
import { avisoPrivacidadArchivos } from './avisoPrivacidadArchivos.entity';
import { Municipality } from './Municipality.entity';

@Entity()
export class avisoPrivacidad {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    Nombre: string;

    @Column()
    Activo: boolean;

    @Column()
    fechaCreacion: Date;

    @Column()
    UsuarioCreacionId: number

    @Column()
    municipality_id: number

    // Relación con la entidad Users
    @ManyToOne(() => Users, (User) => User.archivos)
    @JoinColumn({ name: 'UsuarioCreacionId' })
    user: Users;

    // Relación con la entidad Municipality
    @ManyToOne(() => Municipality, (municipality) => municipality.users)
    @JoinColumn({ name: 'municipality_id' })
    municipality: Municipality;

    @OneToMany(() => avisoPrivacidadArchivos, (avisoPrivacidadArchivo) => avisoPrivacidadArchivo.avisoPrivacidad)
    avisoPrivacidadArchivos: avisoPrivacidadArchivos[];


}
