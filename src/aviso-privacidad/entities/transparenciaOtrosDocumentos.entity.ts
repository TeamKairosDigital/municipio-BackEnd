import { Municipality } from "src/users/entities/Municipality.entity";
import { Users } from "src/users/entities/users.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class transparenciaOtrosDocumentos {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    nombreArchivo: string;

    @Column()
    activo: boolean;

    @Column()
    fecha_creacion: Date;

    @Column()
    usuario_creacion: number

    @Column()
    fecha_modificacion: Date;

    @Column()
    usuario_modificacion: number

    @Column()
    municipality_id: number

    // Relación con la entidad Users
    @ManyToOne(() => Users, (User) => User.usuario_creacion)
    @JoinColumn({ name: 'usuario_creacion' })
    usuario_creacion_id: Users;
    
    // Relación con la entidad Users
    @ManyToOne(() => Users, (User) => User.usuario_modificacion)
    @JoinColumn({ name: 'usuario_modificacion' })
    usuario_modificacion_id: Users;

    // Relación con la entidad Municipality
    @ManyToOne(() => Municipality, (municipality) => municipality.transparenciaOtrosDocumentos)
    @JoinColumn({ name: 'municipality_id' })
    municipality: Municipality;
}