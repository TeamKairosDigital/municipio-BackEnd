import { avisoPrivacidad } from 'src/aviso-privacidad/entities/avisoPrivacidad.entity';
import { Archivos } from 'src/documentos/entities/archivos.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Municipality } from './Municipality.entity';
import { Obras } from 'src/obras/entities/obras.entity';
import { transparenciaOtrosDocumentos } from 'src/aviso-privacidad/entities/transparenciaOtrosDocumentos.entity';

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

    // Relación con la entidad Obras
    @OneToMany(() => Obras, (obra) => obra.municipality)
    obras: Obras[];

    @OneToMany(() => transparenciaOtrosDocumentos, (otroDocumento) => otroDocumento.usuario_creacion)
    usuario_creacion: transparenciaOtrosDocumentos[];

    @OneToMany(() => transparenciaOtrosDocumentos, (otroDocumento) => otroDocumento.usuario_modificacion)
    usuario_modificacion: transparenciaOtrosDocumentos[];

}
