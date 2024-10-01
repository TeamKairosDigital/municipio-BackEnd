import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { avisoPrivacidad } from 'src/models/avisoPrivacidad.entity';
import { avisoPrivacidadArchivos } from 'src/models/avisoPrivacidadArchivos.entity';
import { createAvisoPrivacidadArchivoDto } from 'src/models/dto/createAvisoPrivacidadArchivoDto';
import { createAvisoPrivacidadDto } from 'src/models/dto/createAvisoPrivacidadDto';
import { filterAvisoPrivacidadDto } from 'src/models/dto/filterAvisoPrivacidadDto';
import { Connection, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
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
            order: { id: 'ASC' } // Ordenar por el campo que desees
        });

        // Transformar los avisos con sus archivos
        return avisos.map(aviso => ({
            id: aviso.id,
            nombre: aviso.Nombre,
            activo: aviso.Activo,
            fechaCreacion: aviso.fechaCreacion,
            archivos: (aviso.avisoPrivacidadArchivos ?? []).map(archivo => ({
                id: archivo.id,
                nombreArchivo: archivo.NombreArchivo,
                uuid: archivo.uuid,
                activo: archivo.Activo,
                fechaCreacion: archivo.fechaCreacion,
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
    async deleteAvisoPrivacidad(id: number): Promise<void> {

        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            // Paso 1: Buscar el aviso de privacidad
            const aviso = await this.avisoPrivacidadRepository.findOne({
                where: { id },
                relations: ['avisoPrivacidadArchivos'], // Incluir archivos relacionados
            });

            // Paso 2: Verificar si el aviso existe
            if (!aviso) {
                throw new Error(`Aviso de privacidad con ID ${id} no encontrado`);
            }

            // Paso 3: Verificar si tiene archivos relacionados
            if (aviso.avisoPrivacidadArchivos && aviso.avisoPrivacidadArchivos.length > 0) {
                throw new Error(`No se puede eliminar el aviso de privacidad con ID ${id} porque tiene archivos relacionados.`);
            }

            // Paso 4: Eliminar el aviso de privacidad
            await this.avisoPrivacidadRepository.remove(aviso);

            // Eliminar el archivo de S3
            // await this.s3Service.deleteFile(fileName);

            await queryRunner.commitTransaction();

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Failed to delete document and file');
        } finally {
            await queryRunner.release();
        }


    }

    // Crear aviso de privacidad archivo
    async createAvisoPrivacidadArchivo(data: createAvisoPrivacidadArchivoDto) {

        // Generar un ID único
        const uniqueId = uuidv4();

        const newAvisoPrivacidadArchivo = this.avisoPrivacidadArchivo.create({
            NombreArchivo: data.nombreArchivo,
            uuid: uniqueId,
            avisoPrivacidadId: data.avisoPrivacidadId,
            Activo: true,
            fechaCreacion: new Date()
        });

        return this.avisoPrivacidadArchivo.save(newAvisoPrivacidadArchivo);

    }

    async getAvisoPrivacidadArchivo(id: number): Promise<any> {
        const aviso = await this.avisoPrivacidadArchivo.findOne({
            where: { id }
        });

        return aviso;
    }

    // Editar aviso de privacidad archivo
    async editAvisoPrivacidadArchivo(data: createAvisoPrivacidadArchivoDto) {

        const id = data.id;

        // Paso 1: Buscar el aviso de privacidad por su ID
        const aviso = await this.avisoPrivacidadArchivo.findOne({ where: { id } });

        // Paso 2: Verificar si el aviso existe
        if (!aviso) {
            throw new Error(`Aviso de privacidad con ID ${data.id} no encontrado`);
        }

        // Paso 3: Actualizar los campos necesarios
        aviso.NombreArchivo = data.nombreArchivo;
        aviso.uuid = data.uuid;

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
    }

}
