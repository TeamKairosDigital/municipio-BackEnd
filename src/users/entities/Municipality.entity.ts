import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Users } from './users.entity';
import { Archivos } from '../../documentos/entities/archivos.entity';
import { avisoPrivacidad } from '../../aviso-privacidad/entities/avisoPrivacidad.entity';
import { Obras } from '../../obras/entities/obras.entity';
import { FileesEntity } from '../../s3/entities/filees.entity';

@Entity()
export class Municipality {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    NombreMunicipio: string;

    @Column()
    activo: boolean;

    @Column()
    fechaCreacion: Date;

    // Relación con la entidad Users
    @OneToMany(() => Users, (user) => user.municipality)
    users: Users[];

    // Relación con la entidad Archivos
    @OneToMany(() => Archivos, (archivo) => archivo.municipality)
    archivos: Archivos[];

    // Relación con la entidad AvisoPrivacidad
    @OneToMany(() => avisoPrivacidad, (aviso) => aviso.user)
    avisoPrivacidad: avisoPrivacidad[];

    // Relación con la entidad Obras
    @OneToMany(() => Obras, (obra) => obra.municipality)
    obras: Obras[];

    // Relación con la entidad Obras
    @OneToMany(() => FileesEntity, (file) => file.municipality)
    files: FileesEntity[];
}
