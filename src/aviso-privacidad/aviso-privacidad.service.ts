import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
import { AvisoArchivoDto, AvisoPrivacidadDto } from 'src/aviso-privacidad/dto/avisoPrivacidad.dto';
import { avisoPrivacidadArchivos } from './entities/avisoPrivacidadArchivos.entity';
import { S3Service } from 'src/s3/s3.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { transparenciaOtrosDocumentos } from './entities/transparenciaOtrosDocumentos.entity';
import { createOtroDocumentoDto } from './dto/createOtroDocumento.dto';
import { OtrosDocumentosDto } from './dto/otrosDocumentos.dto';

@Injectable()
export class AvisoPrivacidadService {

  constructor(
      @InjectRepository(avisoPrivacidad)
      private avisoPrivacidadRepository: Repository<avisoPrivacidad>,

      @InjectRepository(avisoPrivacidadArchivos)
      private avisoPrivacidadArchivo: Repository<avisoPrivacidadArchivos>,

      @InjectRepository(transparenciaOtrosDocumentos)
      private transparenciaOtrosDocumentosRespsitory: Repository<transparenciaOtrosDocumentos>,

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
              nombreArchivo: archivo.nombreArchivo,
              nombre: archivo.nombre,
              tipo: archivo.tipo,
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

        const avisoPrivacidad = await this.avisoPrivacidadRepository.findOne({ where: { id: data.avisoPrivacidadId } });

        if (!avisoPrivacidad) {
          throw new NotFoundException(`Aviso de privacidad con ID ${data.id} no encontrado`);
        }

        const uniqueId = uuidv4();
        const uniqueFileName = `${uniqueId}_${data.nombreArchivoOriginal}`;

        await this.s3Service.uploadFile(file, uniqueFileName, 'AvisoPrivacidad');

        const newAvisoArchivo = this.avisoPrivacidadArchivo.create({
          nombre: data.nombreArchivo,
          nombreArchivo: uniqueFileName,
          tipo: data.tipo,
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

  async getAvisoPrivacidadArchivo(id: number): Promise<createAvisoPrivacidadArchivoDto> {
      try {
        const aviso = await this.avisoPrivacidadArchivo.findOne({ where: { id } });
    
        if (!aviso) {
          throw new NotFoundException(`Aviso de privacidad archivo con ID ${id} no encontrado`);
        }

        const url = await this.s3Service.getFileBase64(aviso.id, 'avisoPrivacidadArchivosRepository', 'AvisoPrivacidad');

        if (!url) {
          throw new InternalServerErrorException('No se pudo generar la URL del archivo');
        }

        const response: createAvisoPrivacidadArchivoDto = {
          Activo: aviso.Activo,
          id: aviso.id,
          nombreArchivo: aviso.nombreArchivo,
          tipo: aviso.tipo,
          url: url,
          // avisoPrivacidadId: aviso.avisoPrivacidad.id,
          fechaCreacion: aviso.fechaCreacion,
        }
    
        return response;
      } catch (error) {
        console.error('Error al obtener el aviso de privacidad archivo:', error);
        throw new InternalServerErrorException('Error al obtener el aviso de privacidad archivo');
      }
  }

  async editAvisoPrivacidadArchivo(
      data: createAvisoPrivacidadArchivoDto,
      file: Express.Multer.File = null
    ): Promise<ApiResponse<any>> {
      try {
    
        // Buscar el aviso de privacidad por su ID
        const aviso = await this.avisoPrivacidadArchivo.findOne({ where: { id:data.id } });
    
        if (!aviso) {
          throw new NotFoundException(`Aviso de privacidad con ID ${data.id} no encontrado`);
        }
    
        // Actualizar los campos necesarios
        aviso.nombreArchivo = data.nombreArchivo;
    
        // Si hay un archivo, se podría manejar aquí la lógica para subirlo a S3
        // if (file) {
        //   // Lógica para actualizar archivo en S3
        // }
    
        const updatedAviso = await this.avisoPrivacidadArchivo.save(aviso);
    
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
        // Buscar el aviso de privacidad archivo por su ID
        const aviso = await this.avisoPrivacidadArchivo.findOne({ where: { id } });
    
        if (!aviso) {
          throw new NotFoundException(`Aviso de privacidad archivo con ID ${id} no encontrado`);
        }
    
        // Verificar si el aviso tiene archivos relacionados
        // const avisoConArchivos = await this.avisoPrivacidadRepository.findOne({
        //   where: { id },
        //   relations: ['avisoPrivacidadArchivos'],
        // });
    
        // if (avisoConArchivos && avisoConArchivos.avisoPrivacidadArchivos.length > 0) {
        //   throw new BadRequestException(
        //     `No se puede eliminar el aviso de privacidad con ID ${id} porque tiene archivos relacionados`
        //   );
        // }
    
        // Eliminar el archivo de aviso de privacidad de la base de datos
        await queryRunner.manager.delete(avisoPrivacidadArchivos, id);

        // Eliminar archivo de S3
        const fileName = aviso.nombreArchivo;
        await this.s3Service.deleteFile(fileName, 'AvisoPrivacidad');
        console.log('Archivo eliminado de S3:', fileName);
    
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
  
  async getListAvisoPrivacidadWEB(): Promise<ApiResponse<AvisoPrivacidadDto[]>> {
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
        fechaCreacion: format(new Date(aviso.fechaCreacion), "dd 'de' MMMM yyyy", { locale: es }),
        archivos: (aviso.avisoPrivacidadArchivos ?? []).map((archivo) => ({
          id: archivo.id,
          nombreArchivo: archivo.nombreArchivo,
          nombre: archivo.nombre,
          tipo: archivo.tipo,
          activo: archivo.Activo,
          fechaCreacion: format(new Date(archivo.fechaCreacion), "dd 'de' MMMM yyyy", { locale: es }),
        })),
      }));
  
      return createApiResponse<AvisoPrivacidadDto[]>(true, 'Lista obtenida correctamente', transformedAvisos, null, 200);
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener la lista de avisos de privacidad');
    }
  }

  //
  async getAvisoPrivacidadArchivoWEB(id: number): Promise<ApiResponse<string>> {
    try {
      const aviso = await this.avisoPrivacidadArchivo.findOne({ where: { id } });

      if (!aviso) {
        throw new NotFoundException(`Aviso de privacidad archivo con ID ${id} no encontrado`);
      }

      const base64File = await this.s3Service.getFileBase64(aviso.id, 'avisoPrivacidadArchivosRepository', 'AvisoPrivacidad');

      if (!base64File) {
        throw new InternalServerErrorException('No se pudo obtener el archivo en base64');
      }

      const response = base64File;

      return createApiResponse<string>(true, 'Archivo obtenido correctamente', response, null, 200);
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el archivo de aviso de privacidad');
    }
  }


  // Otros documentos
  async getOtrosDocumentos(): Promise<ApiResponse<OtrosDocumentosDto[]>> {
    try {
      const listData = await this.transparenciaOtrosDocumentosRespsitory.find({

        where: { activo: true },
        order: { id: 'ASC' },
      });
  
      // Transformar los datos al modelo definido
      const transformedList = listData.map((data) => ({
        id: data.id,
        nombre: data.nombre,
        nombreArchivo: data.nombreArchivo,
        fechaCreacion: format(new Date(data.fecha_creacion), "dd 'de' MMMM yyyy", { locale: es }),
      }));
  
      return createApiResponse<OtrosDocumentosDto[]>(true, 'Lista obtenida correctamente', transformedList, null, 200);
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener la lista de avisos de privacidad');
    }
  }

  async getOtroDocumentorchivoWEB(id: number): Promise<ApiResponse<string>> {
    try {
      const documento = await this.transparenciaOtrosDocumentosRespsitory.findOne({ where: { id } });

      if (!documento) {
        throw new NotFoundException(`documento de privacidad archivo con ID ${id} no encontrado`);
      }

      const base64File = await this.s3Service.getFileBase64(documento.id, 'transparenciaOtrosDocumentosRespsitory', 'OtroDocumentos');

      if (!base64File) {
        throw new InternalServerErrorException('No se pudo obtener el archivo en base64');
      }

      const response = base64File;

      return createApiResponse<string>(true, 'Archivo obtenido correctamente', response, null, 200);
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el archivo de aviso de privacidad');
    }
  }

  async createOtroDocumento(data: createOtroDocumentoDto, file: Express.Multer.File) {
    try {

        let uniqueFileName = null;

        if(data.nombreArchivo != null && data.nombreArchivo != '') {
          const uniqueId = uuidv4();
          uniqueFileName = `${uniqueId}_${data.nombreArchivo}`;

          const resS3 = await this.s3Service.uploadFile(file, uniqueFileName, 'OtroDocumentos');

          if(resS3){

            const newOtroDocumento = this.transparenciaOtrosDocumentosRespsitory.create({
              nombre: data.nombre,
              nombreArchivo: uniqueFileName,
              activo: true,
              usuario_creacion:  data.UsuarioCreacionId,
              municipality_id: data.municipality_id,
              fecha_creacion: new Date(),
              fecha_modificacion: new Date(),
              usuario_modificacion: data.UsuarioCreacionId,
            });
    
            const saved = await this.transparenciaOtrosDocumentosRespsitory.save(newOtroDocumento);
    
            return createApiResponse(true, 'Aviso creado correctamente', saved, null, 201);

          }

        }

    } catch (error) {
        throw new InternalServerErrorException('Error al crear el aviso de privacidad');
    }
  }

  // Obtener una obra por ID
  async findOneOtroDocumento(id: number): Promise<ApiResponse<createOtroDocumentoDto>> {
    try {
      const documento = await this.transparenciaOtrosDocumentosRespsitory.findOne({ where: { id } });
      
      if (!documento) {
        throw new HttpException(
          createApiResponse(false, `Obra con ID ${id} no encontrada`, null, null, HttpStatus.NOT_FOUND),
          HttpStatus.NOT_FOUND,
        );
      }

      const url = await this.s3Service.getFileBase64(id, 'transparenciaOtrosDocumentosRespsitory', 'OtroDocumentos');

      if (!url) {
        throw new InternalServerErrorException('No se pudo generar la URL del archivo');
      }

      const response: createOtroDocumentoDto = {
        id: documento.id,
        nombre: documento.nombre,
        nombreArchivo: documento.nombreArchivo,
        url: url,
        fechaCreacion: format(new Date(documento.fecha_creacion), "dd 'de' MMMM yyyy", { locale: es }),

      }

      return createApiResponse<createOtroDocumentoDto>(true, 'Obra obtenida con éxito', response, null, HttpStatus.OK);
    } catch (error) {
      throw new HttpException(
        createApiResponse(false, 'Error al obtener la obra', null, error.message, HttpStatus.INTERNAL_SERVER_ERROR),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Actualizar una obra
  async updateOtroDocumento(Update: createOtroDocumentoDto, file: Express.Multer.File = null): Promise<ApiResponse<any>> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

        const repository = await this.transparenciaOtrosDocumentosRespsitory.findOne({ where: { id:Update.id } });

        if (!repository) {
          throw new HttpException(
            createApiResponse(false, `Obra con ID ${Update.id } no encontrada`, null, null, HttpStatus.NOT_FOUND),
            HttpStatus.NOT_FOUND,
          );
        }

        if(Update.nombreArchivo != repository.nombreArchivo) {

          // Eliminar archivo de S3
          const fileName = repository.nombreArchivo;
          const deleteS3 = await this.s3Service.deleteFile(fileName, 'OtroDocumentos');
          // console.log('Archivo eliminado de S3:', fileName);

          if(deleteS3){
            let uniqueFileName = null;
            const uniqueId = uuidv4();
            uniqueFileName = `${uniqueId}_${Update.nombreArchivo}`;
    
            await this.s3Service.uploadFile(file, uniqueFileName, 'OtroDocumentos');
    
            repository.nombreArchivo = uniqueFileName;
          }
    
        }

        repository.nombre = Update.nombre;
        repository.fecha_modificacion = new Date();

        const updatedObra = await this.transparenciaOtrosDocumentosRespsitory.save(repository);

      return createApiResponse<any>(true, 'Obra actualizada con éxito', null, null, HttpStatus.OK);
    } catch (error) {
      throw new HttpException(
        createApiResponse(false, 'Error al actualizar la obra', null, error.message, HttpStatus.INTERNAL_SERVER_ERROR),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteOtroDocumento(id: number): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const repository = await this.transparenciaOtrosDocumentosRespsitory.findOne({
        where: { id: id }
        });

        if (!repository) {
          throw new NotFoundException(`Aviso de privacidad con ID ${id} no encontrado`);
        }

        // Eliminar archivo de S3
        const fileName = repository.nombreArchivo;
        const deleteS3 = await this.s3Service.deleteFile(fileName, 'OtroDocumentos');
        console.log('Archivo eliminado de S3:', fileName);

        if(deleteS3){
          // Eliminar el archivo de obras de la base de datos
          await queryRunner.manager.delete(transparenciaOtrosDocumentos, id);
          await queryRunner.commitTransaction();
          return createApiResponse(
            true,
            'Obra eliminado exitosamente',
            null,
            null,
            HttpStatus.OK
          );
        }else{
          return createApiResponse(
            false,
            'Error al eliminar la obra',
            null,
            null,
            HttpStatus.BAD_REQUEST
          );
        }

    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException('Error al eliminar el aviso de privacidad');
    } finally {
        await queryRunner.release();
    }
  }

}
