import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { avisoPrivacidad } from 'src/models/avisoPrivacidad.entity';
import { createAvisoPrivacidadDto } from 'src/models/dto/createAvisoPrivacidadDto';
import { filterAvisoPrivacidadDto } from 'src/models/dto/filterAvisoPrivacidadDto';
import { Repository } from 'typeorm';

@Injectable()
export class AvisoPrivacidadService {

    constructor(
        @InjectRepository(avisoPrivacidad)
        private avisoPrivacidadRepository: Repository<avisoPrivacidad>
    ) { }

    //lista para pantalla de Aviso de privacidad
    async getListAvisoPrivacidad(data: filterAvisoPrivacidadDto) {

        // Paso 1: Obtener todos los avisos de privacidad
        const avisos = await this.avisoPrivacidadRepository.find({
            relations: ['user', 'municipality', 'avisoPrivacidadArchivos'], // Relacionar las entidades necesarias
            order: { id: 'ASC' } // Ordenar por el campo que desees
        });

        // Transformar los avisos con sus archivos
        return avisos.map(aviso => ({
            id: aviso.id,
            nombre: aviso.Nombre,
            activo: aviso.Activo,
            fechaCreacion: aviso.fechaCreacion,
            user: {
                id: aviso.user?.id,
                nombre: aviso.user?.Nombre,
            },
            municipality: {
                id: aviso.municipality?.id,
                nombreMunicipio: aviso.municipality?.NombreMunicipio,
            },
            archivos: aviso.avisoPrivacidadArchivos.map(archivo => ({
                id: archivo.id,
                nombreArchivo: archivo.NombreArchivo,
                uuid: archivo.uuid,
                activo: archivo.Activo,
                fechaCreacion: archivo.fechaCreacion,
            }))
        }));

    }

    // Crear nuevo aviso de privacidad
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

    //editar aviso de privacidad
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

    //Eliminar aviso de privacidad
    async deleteAvisoPrivacidad(id: number): Promise<void> {

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
    }




}
