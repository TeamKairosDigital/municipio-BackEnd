import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Municipality } from '../../users/entities/Municipality.entity';

@Entity()
export class FileesEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fileName: string;

    @Column()
    url: string;

    // Relación con la entidad Municipality
    @ManyToOne(() => Municipality, (municipality) => municipality.files)
    @JoinColumn({ name: 'municipality_id' })
    municipality: Municipality;
}
