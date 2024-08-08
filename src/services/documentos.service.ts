import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Archivos } from 'src/models/archivos.entity';
import { Documentos } from 'src/models/documentos.entity';
import { createFileDto } from 'src/models/dto/create-file.dto';
import { Connection, Repository } from 'typeorm';
import { S3Service } from './s3.service';
import { Periodos } from 'src/models/periodos.entity';
import { periodoDto } from 'src/models/dto/periodo';

@Injectable()
export class DocumentosService {

    constructor(
        @InjectRepository(Documentos)
        private documentosRepository: Repository<Documentos>,
        @InjectRepository(Archivos)
        private ArchivosRepository: Repository<Archivos>,
        @InjectRepository(Periodos)
        private PeriodosRepository: Repository<Periodos>,
        private s3Service: S3Service,
        private connection: Connection
    ) { }

    async getDocumentsWithFilesByYear(anualidad: string): Promise<any[]> {
        // Paso 1: Obtener todos los documentos
        const documents = await this.documentosRepository.find({
            relations: ['archivos', 'archivos.periodo'], // Asegúrate de incluir las relaciones necesarias
            order: { id: 'ASC' } // Ordenar por id si es necesario
        });

        // Paso 2: Obtener los archivos correspondientes
        const archivos = await this.ArchivosRepository.find({
            where: [
                { anualidad: anualidad },
                { anualidad: null } // Para incluir archivos sin anualidad
            ],
            relations: ['periodo'] // Asegúrate de incluir las relaciones necesarias
        });

        // Asociar archivos a sus documentos
        documents.forEach(document => {
            document.archivos = archivos.filter(archivo => archivo.documentoId === document.id);
        });

        // Transformar y devolver los datos
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


    async getPeriodos(): Promise<periodoDto[]> {

        const queryBuilder = this.PeriodosRepository.createQueryBuilder('Periodo')
            .where('Periodo.activo = 1')
            .select(['Periodo.id', 'Periodo.nombrePeriodo']);

        const PeridoList = await queryBuilder.getMany();

        return PeridoList;
    }


    async deleteDocumentAndFile(documentId: number): Promise<void> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const document = await this.ArchivosRepository.findOne({ where: { id: documentId } });

            if (!document) {
                throw new NotFoundException('Document not found');
            }

            const fileName = document.nombreArchivo;

            // Eliminar el documento de la base de datos
            await queryRunner.manager.delete(Archivos, documentId);

            // Log para verificar que la eliminación en la base de datos fue exitosa
            console.log('Document deleted from database:', documentId);

            // Eliminar el archivo de S3
            await this.s3Service.deleteFile(fileName);

            // Log para verificar que el archivo fue eliminado de S3
            console.log('File deleted from S3:', fileName);

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Failed to delete document and file');
        } finally {
            await queryRunner.release();
        }
    }

}
