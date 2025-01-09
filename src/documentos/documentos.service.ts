import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Archivos } from 'src/documentos/entities/archivos.entity';
import { createFileDto } from 'src/documentos/dto/createFileDto';
import { Connection, Repository } from 'typeorm';
import { periodoDto } from 'src/documentos/dto/periodo';
import { DocumentosFiltrosDto } from 'src/documentos/dto/DocumentosFiltrosDto';
import { v4 as uuidv4 } from 'uuid';
import { Documentos } from './entities/documentos.entity';
import { Periodos } from './entities/periodos.entity';
import { S3Service } from 'src/s3/s3.service';

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

    async getDocumentsWithFilesByYear(data: DocumentosFiltrosDto): Promise<any[]> {
        try {
            const whereConditions: any = {};
    
            if (data.ley != '-1') {
                whereConditions.ley = data.ley;
            }
    
            const documents = await this.documentosRepository.find({
                where: whereConditions,
                relations: ['archivos', 'archivos.periodo'],
                order: { id: 'ASC' }
            });
    
            const archivos = await this.ArchivosRepository.find({
                where: [
                    { anualidad: data.year },
                    { anualidad: null }
                ],
                relations: ['periodo']
            });
    
            documents.forEach(document => {
                document.archivos = archivos.filter(archivo => archivo.documentoId === document.id);
            });
    
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
                    anualidad: archivo.anualidad,
                    userId: archivo.user
                }))
            }));
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener documentos y archivos', error);
        }
    }
    
    async createFile(crearArchivo: createFileDto, file: Express.Multer.File) {
        try {
            const uniqueId = uuidv4();
            const uniqueFileName = `${uniqueId}_${file.originalname}`;
    
            await this.s3Service.uploadFile(file, uniqueFileName);
    
            const newDocument = this.ArchivosRepository.create({
                nombreArchivo: uniqueFileName,
                documentoId: crearArchivo.documentoId,
                periodoId: crearArchivo.periodoId,
                anualidad: crearArchivo.anualidad,
                municipality_id: crearArchivo.municipality_id,
                UsuarioCreacionId: crearArchivo.usuarioCreacionId,
                activo: true,
                fechaCreacion: new Date()
            });
    
            return this.ArchivosRepository.save(newDocument);
        } catch (error) {
            throw new InternalServerErrorException('Error al crear archivo', error);
        }
    }
    
    async getPeriodos(): Promise<periodoDto[]> {
        try {
            const queryBuilder = this.PeriodosRepository.createQueryBuilder('Periodo')
                .where('Periodo.activo = 1')
                .select(['Periodo.id', 'Periodo.nombrePeriodo']);
    
            return await queryBuilder.getMany();
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener los periodos', error);
        }
    }
    
    async deleteDocumentAndFile(documentId: number): Promise<void> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
    
        try {
            const document = await this.ArchivosRepository.findOne({ where: { id: documentId } });
    
            if (!document) {
                throw new NotFoundException('Documento no encontrado');
            }
    
            const fileName = document.nombreArchivo;
    
            await queryRunner.manager.delete(Archivos, documentId);
            console.log('Documento eliminado de la base de datos:', documentId);
    
            await this.s3Service.deleteFile(fileName);
            console.log('Archivo eliminado de S3:', fileName);
    
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Fallo al eliminar documento y archivo', error);
        } finally {
            await queryRunner.release();
        }
    }



        // async getDocumentsWithFilesByYear(data: DocumentosFiltrosDto): Promise<any[]> {
    //     const whereConditions: any = {};

    //     // Agrega la condición 'ley' solo si tiene un valor
    //     if (data.ley != '-1') {
    //         whereConditions.ley = data.ley;
    //     }

    //     // Obtener todos los documentos
    //     const documents = await this.documentosRepository.find({
    //         where: whereConditions,
    //         relations: ['archivos', 'archivos.periodo'],
    //         order: { id: 'ASC' } // Ordenar
    //     });

    //     // Paso 2: Obtener los archivos correspondientes
    //     const archivos = await this.ArchivosRepository.find({
    //         where: [
    //             { anualidad: data.year },

    //             { anualidad: null } // Para incluir archivos sin anualidad
    //         ],
    //         relations: ['periodo']
    //     });

    //     // Asociar archivos a sus documentos
    //     documents.forEach(document => {
    //         document.archivos = archivos.filter(archivo => archivo.documentoId === document.id);
    //     });

    //     // Transformar y devolver los datos
    //     return documents.map(document => ({
    //         id: document.id,
    //         nombreDocumento: document.nombreDocumento,
    //         ley: document.ley,
    //         categoria: document.categoria,
    //         archivos: document.archivos.map(archivo => ({
    //             id: archivo.id,
    //             nombreArchivo: archivo.nombreArchivo,
    //             periodoId: archivo.periodo ? archivo.periodo.id : null,
    //             periodo: archivo.periodo ? archivo.periodo.nombrePeriodo : null,
    //             anualidad: archivo.anualidad,
    //             userId: archivo.user
    //         }))
    //     }));
    // }


    // async createFile(crearArchivo: createFileDto, file: Express.Multer.File) {

    //     // Generar un ID único
    //     const uniqueId = uuidv4();

    //     // Crear un nombre de archivo único concatenando el ID con el nombre original
    //     const uniqueFileName = `${uniqueId}_${file.originalname}`;

    //     // Subir el archivo a S3
    //     await this.s3Service.uploadFile(file, uniqueFileName);

    //     const newDocument = this.ArchivosRepository.create({
    //         nombreArchivo: uniqueFileName,
    //         documentoId: crearArchivo.documentoId,
    //         periodoId: crearArchivo.periodoId,
    //         anualidad: crearArchivo.anualidad,
    //         activo: true,
    //         fechaCreacion: new Date()
    //     });

    //     return this.ArchivosRepository.save(newDocument)
    // }


    // async getPeriodos(): Promise<periodoDto[]> {

    //     const queryBuilder = this.PeriodosRepository.createQueryBuilder('Periodo')
    //         .where('Periodo.activo = 1')
    //         .select(['Periodo.id', 'Periodo.nombrePeriodo']);

    //     const PeridoList = await queryBuilder.getMany();

    //     return PeridoList;
    // }


    // async deleteDocumentAndFile(documentId: number): Promise<void> {

    //     const queryRunner = this.connection.createQueryRunner();
    //     await queryRunner.connect();
    //     await queryRunner.startTransaction();

    //     try {
    //         const document = await this.ArchivosRepository.findOne({ where: { id: documentId } });

    //         if (!document) {
    //             throw new NotFoundException('Document not found');
    //         }

    //         const fileName = document.nombreArchivo;

    //         // Eliminar el documento de la base de datos
    //         await queryRunner.manager.delete(Archivos, documentId);

    //         // Log para verificar que la eliminación en la base de datos fue exitosa
    //         console.log('Document deleted from database:', documentId);

    //         // Eliminar el archivo de S3
    //         await this.s3Service.deleteFile(fileName);

    //         // Log para verificar que el archivo fue eliminado de S3
    //         console.log('File deleted from S3:', fileName);

    //         await queryRunner.commitTransaction();
    //     } catch (error) {
    //         await queryRunner.rollbackTransaction();
    //         throw new InternalServerErrorException('Failed to delete document and file');
    //     } finally {
    //         await queryRunner.release();
    //     }

    // }
    

}
