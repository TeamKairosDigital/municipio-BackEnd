import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { avisoPrivacidad } from 'src/aviso-privacidad/entities/avisoPrivacidad.entity';
import { createAvisoPrivacidadArchivoDto } from 'src/aviso-privacidad/dto/createAvisoPrivacidadArchivoDto';
import { createAvisoPrivacidadDto } from 'src/aviso-privacidad/dto/createAvisoPrivacidadDto';
import { filterAvisoPrivacidadDto } from 'src/aviso-privacidad/dto/filterAvisoPrivacidadDto';
import { Connection, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { createApiResponse } from 'src/common/response/createApiResponse';
import { ApiResponse } from 'src/common/response/ApiResponse';
import { AvisoPrivacidadDto } from 'src/aviso-privacidad/dto/avisoPrivacidad.dto';
import { avisoPrivacidadArchivos } from './entities/avisoPrivacidadArchivos.entity';
import { S3Service } from 'src/s3/s3.service';

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

  async getListAvisoPrivacidad(data: filterAvisoPrivacidadDto): Promise<ApiResponse<AvisoPrivacidadDto[]>> {
        try {
          const avisos = await this.avisoPrivacidadRepository.find({
            relations: ['avisoPrivacidadArchivos'],
            order: { id: 'ASC' },
          });
      
          // Transformar los datos al modelo definido
          const transformedAvisos = avisos.map((aviso) => ({
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
            archivos: (aviso.avisoPrivacidadArchivos ?? []).map((archivo) => ({
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
            })),
          }));
      
          return createApiResponse<AvisoPrivacidadDto[]>(true, 'Lista obtenida correctamente', transformedAvisos, null, 200);
        } catch (error) {
          throw new InternalServerErrorException('Error al obtener la lista de avisos de privacidad');
        }
  }
    
  async createAvisoPrivacidad(data: createAvisoPrivacidadDto) {
    try {
        const newAvisoPrivacidad = this.avisoPrivacidadRepository.create({
          Nombre: data.nombreAvisoPrivacidad,
          Activo: true,
          UsuarioCreacionId: data.usuarioCreacionId,
          municipality_id: data.municipality_id,
          fechaCreacion: new Date(),
        });

        const savedAviso = await this.avisoPrivacidadRepository.save(newAvisoPrivacidad);
        return createApiResponse(true, 'Aviso creado correctamente', savedAviso, null, 201);
    } catch (error) {
        throw new InternalServerErrorException('Error al crear el aviso de privacidad');
    }
  }

  async getAvisoPrivacidad(id: number): Promise<any> {
    try {
        const aviso = await this.avisoPrivacidadRepository.findOne({ where: { id } });

        if (!aviso) {
        throw new NotFoundException(`Aviso de privacidad con ID ${id} no encontrado`);
        }

        return aviso;
    } catch (error) {
        throw new InternalServerErrorException('Error al obtener el aviso de privacidad');
    }
  }

  async editAvisoPrivacidad(data: createAvisoPrivacidadDto) {
    try {
        const aviso = await this.avisoPrivacidadRepository.findOne({ where: { id: data.id } });

        if (!aviso) {
        throw new NotFoundException(`Aviso de privacidad con ID ${data.id} no encontrado`);
        }

        aviso.Nombre = data.nombreAvisoPrivacidad;
        const updatedAviso = await this.avisoPrivacidadRepository.save(aviso);

        return createApiResponse(true, 'Aviso actualizado correctamente', updatedAviso, null, 200);
    } catch (error) {
        throw new InternalServerErrorException('Error al actualizar el aviso de privacidad');
    }
  }

  async deleteAvisoPrivacidad(AvisoPrivacidadId: number): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const aviso = await this.avisoPrivacidadRepository.findOne({
        where: { id: AvisoPrivacidadId },
        relations: ['avisoPrivacidadArchivos'],
        });

        if (!aviso) {
        throw new NotFoundException(`Aviso de privacidad con ID ${AvisoPrivacidadId} no encontrado`);
        }

        if (aviso.avisoPrivacidadArchivos.length > 0) {
        throw new Error(`No se puede eliminar el aviso con ID ${AvisoPrivacidadId} porque tiene archivos relacionados.`);
        }

        await queryRunner.manager.delete(avisoPrivacidad, AvisoPrivacidadId);
        await queryRunner.commitTransaction();

        return createApiResponse(true, 'Aviso eliminado correctamente', null, null, 200);
    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException('Error al eliminar el aviso de privacidad');
    } finally {
        await queryRunner.release();
    }
  }

  async createAvisoPrivacidadArchivo(data: createAvisoPrivacidadArchivoDto, file: Express.Multer.File) {
    try {
        const uniqueId = uuidv4();
        const uniqueFileName = `${uniqueId}_${file.originalname}`;

        await this.s3Service.uploadFile(file, uniqueFileName);

        const newAvisoArchivo = this.avisoPrivacidadArchivo.create({
        NombreArchivo: data.nombreArchivo,
        uuid: uniqueId,
        avisoPrivacidad: { id: data.avisoPrivacidadId },
        Activo: true,
        fechaCreacion: new Date(),
        });

        const savedArchivo = await this.avisoPrivacidadArchivo.save(newAvisoArchivo);
        return createApiResponse(true, 'Archivo creado correctamente', savedArchivo, null, 201);
    } catch (error) {
        throw new InternalServerErrorException('Error al crear el archivo del aviso de privacidad');
    }
  }
      
    // // lista para pantalla de Aviso de privacidad
    // async getListAvisoPrivacidad(data: filterAvisoPrivacidadDto) {

    //     // Paso 1: Obtener todos los avisos de privacidad
    //     const avisos = await this.avisoPrivacidadRepository.find({ // Relacionar las entidades necesarias
    //         relations: ['avisoPrivacidadArchivos'],
    //         order: { id: 'ASC' } // Ordenar por el campo que desees
    //     });

    //     // Transformar los avisos con sus archivos
    //     return avisos.map(aviso => ({
    //         id: aviso.id,
    //         nombre: aviso.Nombre,
    //         activo: aviso.Activo,
    //         fechaCreacion: new Date(aviso.fechaCreacion).toLocaleString('es-ES', {
    //             year: 'numeric',
    //             month: '2-digit',
    //             day: '2-digit',
    //             hour: '2-digit',
    //             minute: '2-digit',
    //             second: '2-digit',
    //         }),
    //         archivos: (aviso.avisoPrivacidadArchivos ?? []).map(archivo => ({
    //             id: archivo.id,
    //             nombreArchivo: archivo.NombreArchivo,
    //             uuid: archivo.uuid,
    //             activo: archivo.Activo,
    //             fechaCreacion: new Date(archivo.fechaCreacion).toLocaleString('es-ES', {
    //                 year: 'numeric',
    //                 month: '2-digit',
    //                 day: '2-digit',
    //                 hour: '2-digit',
    //                 minute: '2-digit',
    //                 second: '2-digit',
    //             }),
    //         }))
    //     }));

    // }

    // // Crear aviso de privacidad
    // async createAvisoPrivacidad(data: createAvisoPrivacidadDto) {

    //     const newAvisoPrivacidad = this.avisoPrivacidadRepository.create({
    //         Nombre: data.nombreAvisoPrivacidad,
    //         Activo: true,
    //         UsuarioCreacionId: data.usuarioId,
    //         municipality_id: data.municipality_id,
    //         fechaCreacion: new Date(),
    //     });

    //     return this.avisoPrivacidadRepository.save(newAvisoPrivacidad);

    // }

    // async getAvisoPrivacidad(id: number): Promise<any> {
    //     const aviso = await this.avisoPrivacidadRepository.findOne({
    //         where: { id }
    //     });

    //     return aviso;
    // }

    // // Editar aviso de privacidad
    // async editAvisoPrivacidad(data: createAvisoPrivacidadDto) {

    //     const id = data.id;

    //     // Paso 1: Buscar el aviso de privacidad por su ID
    //     const aviso = await this.avisoPrivacidadRepository.findOne({ where: { id } });

    //     // Paso 2: Verificar si el aviso existe
    //     if (!aviso) {
    //         throw new Error(`Aviso de privacidad con ID ${data.id} no encontrado`);
    //     }

    //     // Paso 3: Actualizar los campos necesarios
    //     aviso.Nombre = data.nombreAvisoPrivacidad;

    //     // Paso 4: Guardar los cambios en la base de datos
    //     return this.avisoPrivacidadRepository.save(aviso);
    // }

    // // Eliminar aviso de privacidad
    // async deleteAvisoPrivacidad(AvisoPrivacidadId: number): Promise<void> {
    //     const queryRunner = this.connection.createQueryRunner();
    //     await queryRunner.connect();
    //     await queryRunner.startTransaction();

    //     try {
    //         const aviso = await this.avisoPrivacidadRepository.findOne({
    //             where: { id: AvisoPrivacidadId },
    //             relations: ['avisoPrivacidadArchivos'],
    //         });

    //         if (!aviso) {
    //             throw new Error(`Aviso de privacidad con ID ${AvisoPrivacidadId} no encontrado`);
    //         }

    //         if (aviso.avisoPrivacidadArchivos && aviso.avisoPrivacidadArchivos.length > 0) {
    //             throw new Error(`No se puede eliminar el aviso de privacidad con ID ${AvisoPrivacidadId} porque tiene archivos relacionados.`);
    //         }

    //         await queryRunner.manager.delete(avisoPrivacidad, AvisoPrivacidadId);

    //         await queryRunner.commitTransaction();

    //     } catch (error) {
    //         console.error('Error en el servicio deleteAvisoPrivacidad:', error); // Log de error detallado
    //         await queryRunner.rollbackTransaction();
    //         throw new InternalServerErrorException('Failed to delete aviso de privacidad');
    //     } finally {
    //         await queryRunner.release();
    //     }
    // }


    // // Crear aviso de privacidad archivo
    // async createAvisoPrivacidadArchivo(data: createAvisoPrivacidadArchivoDto, file: Express.Multer.File) {

    //     try {
    //         // Generar un ID único
    //         const uniqueId = uuidv4();

    //         // Definir ruta para guardar el archivo
    //         // Quitar la barra inicial para evitar que se interprete como ruta absoluta
    //         const uploadDir = path.join(__dirname, '..', 'uploads');

    //         // Asegúrate de que la carpeta existe, si no, crearla
    //         if (!fs.existsSync(uploadDir)) {
    //             fs.mkdirSync(uploadDir, { recursive: true });
    //         }

    //         // Nombre único para el archivo con su extensión original
    //         const uniqueFileName = `${uniqueId}_${file.originalname}`;
    //         // const filePath = path.join(uploadDir, uniqueFileName);

    //         // // Guardar el archivo en la carpeta 'uploads'
    //         // fs.writeFileSync(filePath, file.buffer);

    //         //Subir archivo al S3
    //         await this.s3Service.uploadFile(file, uniqueFileName);

    //         const newAvisoPrivacidadArchivo = this.avisoPrivacidadArchivo.create({
    //             NombreArchivo: data.nombreArchivo,
    //             uuid: uniqueId,
    //             avisoPrivacidad: { id: data.avisoPrivacidadId },
    //             Activo: true,
    //             fechaCreacion: new Date(),
    //         });

    //         return await this.avisoPrivacidadArchivo.save(newAvisoPrivacidadArchivo);
    //     } catch (error) {
    //         console.error('Error guardando el archivo:', error); // Log para detectar errores
    //         throw new Error('Error al guardar el archivo.');
    //     }

    // }

    async getAvisoPrivacidadArchivo(id: number): Promise<any> {
        try {
          const aviso = await this.avisoPrivacidadArchivo.findOne({ where: { id } });
      
          if (!aviso) {
            throw new NotFoundException(`Aviso de privacidad archivo con ID ${id} no encontrado`);
          }
      
          return aviso;
        } catch (error) {
          throw new InternalServerErrorException('Error al obtener el aviso de privacidad archivo');
        }
    }

    async editAvisoPrivacidadArchivo(
        data: createAvisoPrivacidadArchivoDto,
        file: Express.Multer.File = null
      ): Promise<ApiResponse<any>> {
        try {
          const id = data.id;
      
          // Buscar el aviso de privacidad por su ID
          const aviso = await this.avisoPrivacidadArchivo.findOne({ where: { id } });
      
          if (!aviso) {
            throw new NotFoundException(`Aviso de privacidad con ID ${id} no encontrado`);
          }
      
          // Actualizar los campos necesarios
          aviso.NombreArchivo = data.nombreArchivo;
      
          // Si hay un archivo, se podría manejar aquí la lógica para subirlo a S3
          if (file) {
            // Lógica para actualizar archivo en S3
          }
      
          const updatedAviso = await this.avisoPrivacidadRepository.save(aviso);
      
          return createApiResponse(
            true,
            'Aviso de privacidad archivo actualizado exitosamente',
            updatedAviso,
            null,
            HttpStatus.OK
          );
        } catch (error) {
          throw new InternalServerErrorException('Error al editar el aviso de privacidad archivo');
        }
    }

    async deleteAvisoPrivacidadArchivo(id: number): Promise<ApiResponse<void>> {
        const queryRunner = this.connection.createQueryRunner();
      
        await queryRunner.connect();
        await queryRunner.startTransaction();
      
        try {
          // Buscar el aviso de privacidad
          const aviso = await this.avisoPrivacidadArchivo.findOne({ where: { id } });
      
          if (!aviso) {
            throw new NotFoundException(`Aviso de privacidad archivo con ID ${id} no encontrado`);
          }
      
          // Verificar si el aviso tiene archivos relacionados
          const avisoConArchivos = await this.avisoPrivacidadRepository.findOne({
            where: { id },
            relations: ['avisoPrivacidadArchivos'],
          });
      
          if (avisoConArchivos && avisoConArchivos.avisoPrivacidadArchivos.length > 0) {
            throw new BadRequestException(
              `No se puede eliminar el aviso de privacidad con ID ${id} porque tiene archivos relacionados`
            );
          }
      
          // Eliminar el aviso
          await queryRunner.manager.delete(avisoPrivacidadArchivos, id);
      
          await queryRunner.commitTransaction();
      
          return createApiResponse(
            true,
            'Aviso de privacidad archivo eliminado exitosamente',
            null,
            null,
            HttpStatus.OK
          );
        } catch (error) {
          await queryRunner.rollbackTransaction();
      
          if (error instanceof NotFoundException || error instanceof BadRequestException) {
            throw error;
          }
      
          console.error('Error en el servicio deleteAvisoPrivacidadArchivo:', error);
          throw new InternalServerErrorException('Error al eliminar el aviso de privacidad archivo');
        } finally {
          await queryRunner.release();
        }
    }
      
    // async getAvisoPrivacidadArchivo(id: number): Promise<any> {

    //     const aviso = await this.avisoPrivacidadArchivo.findOne({
    //         where: { id }
    //     });

    //     return aviso;
    // }

    // // Editar aviso de privacidad archivo
    // async editAvisoPrivacidadArchivo(data: createAvisoPrivacidadArchivoDto, file: Express.Multer.File = null) {

    //     const id = data.id;

    //     // Paso 1: Buscar el aviso de privacidad por su ID
    //     const aviso = await this.avisoPrivacidadArchivo.findOne({ where: { id } });

    //     // Paso 2: Verificar si el aviso existe
    //     if (!aviso) {
    //         throw new Error(`Aviso de privacidad con ID ${data.id} no encontrado`);
    //     }

    //     // UPDATE AL S3
    //     // if(file){
            
    //     // }

    //     // Paso 3: Actualizar los campos necesarios
    //     aviso.NombreArchivo = data.nombreArchivo;
    //     // aviso.uuid = data.uuid;

    //     // Paso 4: Guardar los cambios en la base de datos
    //     return this.avisoPrivacidadRepository.save(aviso);
    // }

    // // Eliminar aviso de privacidad Archivo
    // async deleteAvisoPrivacidadArchivo(id: number): Promise<void> {

    //     // Paso 1: Buscar el aviso de privacidad
    //     const aviso = await this.avisoPrivacidadArchivo.findOne({
    //         where: { id }
    //     });

    //     // Paso 2: Verificar si el aviso existe
    //     if (!aviso) {
    //         throw new Error(`Aviso de privacidad con ID ${id} no encontrado`);
    //     }

    //     // Paso 3: Eliminar el aviso de privacidad
    //     await this.avisoPrivacidadArchivo.remove(aviso);

    //     const queryRunner = this.connection.createQueryRunner();
    //     await queryRunner.connect();
    //     await queryRunner.startTransaction();

    //     let idaviso = aviso.id;

    //     try {
    //         const aviso = await this.avisoPrivacidadRepository.findOne({
    //             where: { id: idaviso },
    //             relations: ['avisoPrivacidadArchivos'],
    //         });

    //         if (!aviso) {
    //             throw new Error(`Aviso de privacidad con ID ${idaviso} no encontrado`);
    //         }

    //         if (aviso.avisoPrivacidadArchivos && aviso.avisoPrivacidadArchivos.length > 0) {
    //             throw new Error(`No se puede eliminar el aviso de privacidad con ID ${idaviso} porque tiene archivos relacionados.`);
    //         }

    //         await queryRunner.manager.delete(avisoPrivacidad, idaviso);

    //         await queryRunner.commitTransaction();

    //     } catch (error) {
    //         console.error('Error en el servicio deleteAvisoPrivacidad:', error); // Log de error detallado
    //         await queryRunner.rollbackTransaction();
    //         throw new InternalServerErrorException('Failed to delete aviso de privacidad');
    //     } finally {
    //         await queryRunner.release();
    //     }

    // }

}
