import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { UsersMunicipality } from './usersMunicipality.entity';
import { avisoPrivacidadArchivos } from './avisoPrivacidadArchivos.entity';

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
    UsuarioCreacionId: number;

    @ManyToOne(() => UsersMunicipality, (user) => user.avisoPrivacidad)
    UsersMunicipality: UsersMunicipality;

    @OneToMany(() => avisoPrivacidadArchivos, (avisoPrivacidadArchivo) => avisoPrivacidadArchivo.avisoPrivacidadId)
    avisoPrivacidadArchivos: avisoPrivacidadArchivos[];

}
