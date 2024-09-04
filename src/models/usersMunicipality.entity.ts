import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Archivos } from './archivos.entity';
import { avisoPrivacidad } from './avisoPrivacidad.entity';


@Entity()
export class UsersMunicipality {
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

    @OneToMany(() => Archivos, (archivo) => archivo.User)
    archivos: Archivos[];

    @OneToMany(() => avisoPrivacidad, (aviso) => aviso.UsuarioCreacionId)
    avisoPrivacidad: avisoPrivacidad[];

}
