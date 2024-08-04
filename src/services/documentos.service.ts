import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Archivos } from 'src/models/archivos.entity';
import { Documentos } from 'src/models/documentos.entity';
import { createFileDto } from 'src/models/dto/create-file.dto';
import { Repository } from 'typeorm';
import { S3Service } from './s3.service';

@Injectable()
export class DocumentosService {

    constructor(
        @InjectRepository(Documentos)
        private documentosRepository: Repository<Documentos>,
        @InjectRepository(Archivos)
        private ArchivosRepository: Repository<Archivos>,
        private s3Service: S3Service
    ) { }

    async getDocumentsWithFilesByYear(anualidad: string): Promise<any[]> {
        const queryBuilder = this.documentosRepository.createQueryBuilder('documentos')
            .leftJoinAndSelect('documentos.archivos', 'archivos')
            .leftJoinAndSelect('archivos.periodo', 'periodos')
            // .where('documentos.tipoDocumentoId = :tipoDocumentoId', { tipoDocumentoId })
            .where('(archivos.anualidad = :anualidad OR archivos.anualidad IS NULL)', { anualidad })
            .select(['documentos.id', 'documentos.nombreDocumento', 'documentos.ley', 'documentos.categoria', 'archivos', 'periodos'])
            .orderBy('documentos.id', 'ASC');

        const documents = await queryBuilder.getMany();

        return documents.map(document => ({
            id: document.id,
            nombreDocumento: document.nombreDocumento,
            ley: document.ley,
            categoria: document.categoria,
            archivos: document.archivos.map(archivo => ({
                id: archivo.id,
                nombreArchivo: archivo.nombreArchivo,
                periodoId: archivo.periodo ? archivo.periodo.id : null,
                periodo: archivo.periodo ? archivo.periodo.nombrePeriodo : null,
                anualidad: archivo.anualidad
            }))
        }));
    }


    async createFile(crearArchivo: createFileDto, file: Express.Multer.File) {

        // Subir el archivo a S3
        await this.s3Service.uploadFile(file);

        const newDocument = this.ArchivosRepository.create({
            nombreArchivo: file.originalname,
            documentoId: crearArchivo.documentoId,
            periodoId: crearArchivo.periodoId,
            anualidad: crearArchivo.anualidad,
            activo: true,
            fechaCreacion: new Date()
        });

        return this.ArchivosRepository.save(newDocument)
    }

}
