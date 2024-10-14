import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { avisoPrivacidad } from 'src/models/avisoPrivacidad.entity';
import { avisoPrivacidadArchivos } from 'src/models/avisoPrivacidadArchivos.entity';
import { createAvisoPrivacidadArchivoDto } from 'src/models/dto/createAvisoPrivacidadArchivoDto';
import { createAvisoPrivacidadDto } from 'src/models/dto/createAvisoPrivacidadDto';
import { filterAvisoPrivacidadDto } from 'src/models/dto/filterAvisoPrivacidadDto';
import { Connection, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { S3Service } from './s3.service';

@Injectable()
export class AvisoPrivacidadService {

    constructor(
        @InjectRepository(avisoPrivacidad)
        private avisoPrivacidadRepository: Repository<avisoPrivacidad>,

        @InjectRepository(avisoPrivacidadArchivos)
        private avisoPrivacidadArchivo: Repository<avisoPrivacidadArchivos>,

        private s3Service: S3Service,
        private connection: Connection
    ) { }

    // lista para pantalla de Aviso de privacidad
    async getListAvisoPrivacidad(data: filterAvisoPrivacidadDto) {

        // Paso 1: Obtener todos los avisos de privacidad
        const avisos = await this.avisoPrivacidadRepository.find({ // Relacionar las entidades necesarias
            relations: ['avisoPrivacidadArchivos'],
            order: { id: 'ASC' } // Ordenar por el campo que desees
        });

        // Transformar los avisos con sus archivos
        return avisos.map(aviso => ({
            id: aviso.id,
            nombre: aviso.Nombre,
            activo: aviso.Activo,
            fechaCreacion: new Date(aviso.fechaCreacion).toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
            archivos: (aviso.avisoPrivacidadArchivos ?? []).map(archivo => ({
                id: archivo.id,
                nombreArchivo: archivo.NombreArchivo,
                uuid: archivo.uuid,
                activo: archivo.Activo,
                fechaCreacion: new Date(archivo.fechaCreacion).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }),
            }))
        }));

    }

    // Crear aviso de privacidad
    async createAvisoPrivacidad(data: createAvisoPrivacidadDto) {

        const newAvisoPrivacidad = this.avisoPrivacidadRepository.create({
            Nombre: data.nombreAvisoPrivacidad,
            Activo: true,
            UsuarioCreacionId: data.usuarioId,
            municipality_id: data.municipality_id,
            fechaCreacion: new Date(),
        });

        return this.avisoPrivacidadRepository.save(newAvisoPrivacidad);

    }

    async getAvisoPrivacidad(id: number): Promise<any> {
        const aviso = await this.avisoPrivacidadRepository.findOne({
            where: { id }
        });

        return aviso;
    }

    // Editar aviso de privacidad
    async editAvisoPrivacidad(data: createAvisoPrivacidadDto) {

        const id = data.id;

        // Paso 1: Buscar el aviso de privacidad por su ID
        const aviso = await this.avisoPrivacidadRepository.findOne({ where: { id } });

        // Paso 2: Verificar si el aviso existe
        if (!aviso) {
            throw new Error(`Aviso de privacidad con ID ${data.id} no encontrado`);
        }

        // Paso 3: Actualizar los campos necesarios
        aviso.Nombre = data.nombreAvisoPrivacidad;

        // Paso 4: Guardar los cambios en la base de datos
        return this.avisoPrivacidadRepository.save(aviso);
    }

    // Eliminar aviso de privacidad
    async deleteAvisoPrivacidad(AvisoPrivacidadId: number): Promise<void> {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const aviso = await this.avisoPrivacidadRepository.findOne({
                where: { id: AvisoPrivacidadId },
                relations: ['avisoPrivacidadArchivos'],
            });

            if (!aviso) {
                throw new Error(`Aviso de privacidad con ID ${AvisoPrivacidadId} no encontrado`);
            }

            if (aviso.avisoPrivacidadArchivos && aviso.avisoPrivacidadArchivos.length > 0) {
                throw new Error(`No se puede eliminar el aviso de privacidad con ID ${AvisoPrivacidadId} porque tiene archivos relacionados.`);
            }

            await queryRunner.manager.delete(avisoPrivacidad, AvisoPrivacidadId);

            await queryRunner.commitTransaction();

        } catch (error) {
            console.error('Error en el servicio deleteAvisoPrivacidad:', error); // Log de error detallado
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Failed to delete aviso de privacidad');
        } finally {
            await queryRunner.release();
        }
    }


    // Crear aviso de privacidad archivo
    async createAvisoPrivacidadArchivo(data: createAvisoPrivacidadArchivoDto, file: Express.Multer.File) {

        try {
            // Generar un ID único
            const uniqueId = uuidv4();

            // // Definir ruta para guardar el archivo
            // // Quitar la barra inicial para evitar que se interprete como ruta absoluta
            // const uploadDir = path.join(__dirname, '..', 'uploads');

            // // Asegúrate de que la carpeta existe, si no, crearla
            // if (!fs.existsSync(uploadDir)) {
            //     fs.mkdirSync(uploadDir, { recursive: true });
            // }

            // Nombre único para el archivo con su extensión original
            const uniqueFileName = `${uniqueId}_${file.originalname}`;
            // const filePath = path.join(uploadDir, uniqueFileName);

            // // Guardar el archivo en la carpeta 'uploads'
            // fs.writeFileSync(filePath, file.buffer);

            //Subir archivo al S3
            // await this.s3Service.uploadFile(file, uniqueFileName);

            const newAvisoPrivacidadArchivo = this.avisoPrivacidadArchivo.create({
                NombreArchivo: data.nombreArchivo,
                uuid: uniqueId,
                avisoPrivacidad: { id: data.avisoPrivacidadId },
                Activo: true,
                fechaCreacion: new Date(),
            });

            return await this.avisoPrivacidadArchivo.save(newAvisoPrivacidadArchivo);
        } catch (error) {
            console.error('Error guardando el archivo:', error); // Log para detectar errores
            throw new Error('Error al guardar el archivo.');
        }

    }

    async getAvisoPrivacidadArchivo(id: number): Promise<any> {

        const aviso = await this.avisoPrivacidadArchivo.findOne({
            where: { id }
        });

        return aviso;
    }

    // Editar aviso de privacidad archivo
    async editAvisoPrivacidadArchivo(data: createAvisoPrivacidadArchivoDto, file: Express.Multer.File = null) {

        const id = data.id;

        // Paso 1: Buscar el aviso de privacidad por su ID
        const aviso = await this.avisoPrivacidadArchivo.findOne({ where: { id } });

        // Paso 2: Verificar si el aviso existe
        if (!aviso) {
            throw new Error(`Aviso de privacidad con ID ${data.id} no encontrado`);
        }

        // UPDATE AL S3
        // if(file){
            
        // }

        // Paso 3: Actualizar los campos necesarios
        aviso.NombreArchivo = data.nombreArchivo;
        // aviso.uuid = data.uuid;

        // Paso 4: Guardar los cambios en la base de datos
        return this.avisoPrivacidadRepository.save(aviso);
    }

    // Eliminar aviso de privacidad Archivo
    async deleteAvisoPrivacidadArchivo(id: number): Promise<void> {

        // Paso 1: Buscar el aviso de privacidad
        const aviso = await this.avisoPrivacidadArchivo.findOne({
            where: { id }
        });

        // Paso 2: Verificar si el aviso existe
        if (!aviso) {
            throw new Error(`Aviso de privacidad con ID ${id} no encontrado`);
        }

        // Paso 3: Eliminar el aviso de privacidad
        await this.avisoPrivacidadArchivo.remove(aviso);



        // const queryRunner = this.connection.createQueryRunner();
        // await queryRunner.connect();
        // await queryRunner.startTransaction();

        // try {
        //     const aviso = await this.avisoPrivacidadRepository.findOne({
        //         where: { id: AvisoPrivacidadId },
        //         relations: ['avisoPrivacidadArchivos'],
        //     });

        //     if (!aviso) {
        //         throw new Error(`Aviso de privacidad con ID ${AvisoPrivacidadId} no encontrado`);
        //     }

        //     if (aviso.avisoPrivacidadArchivos && aviso.avisoPrivacidadArchivos.length > 0) {
        //         throw new Error(`No se puede eliminar el aviso de privacidad con ID ${AvisoPrivacidadId} porque tiene archivos relacionados.`);
        //     }

        //     await queryRunner.manager.delete(avisoPrivacidad, AvisoPrivacidadId);

        //     await queryRunner.commitTransaction();

        // } catch (error) {
        //     console.error('Error en el servicio deleteAvisoPrivacidad:', error); // Log de error detallado
        //     await queryRunner.rollbackTransaction();
        //     throw new InternalServerErrorException('Failed to delete aviso de privacidad');
        // } finally {
        //     await queryRunner.release();
        // }

    }

}
