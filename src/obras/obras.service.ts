import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponse } from 'src/common/response/ApiResponse';
import { CreateObrasDto } from 'src/obras/dto/obrasDto';
import { Obras } from 'src/obras/entities/obras.entity';
import { v4 as uuidv4 } from 'uuid';
import { Connection, Repository } from 'typeorm';
import { S3Service } from '../s3/s3.service';
import { createApiResponse } from 'src/common/response/createApiResponse';
import { obrasWEBDto } from './dto/obrasWEB.dto';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Injectable()
export class ObrasService {

  constructor(
      @InjectRepository(Obras)
      private readonly obrasRepository: Repository<Obras>,
      private readonly s3Service: S3Service,
      private connection: Connection
    ) {}

  // Crear nueva obra
  async create(data: CreateObrasDto, file: Express.Multer.File) {
    try {
          let uniqueFileName = null;

          if(data.nombreArchivo != null && data.nombreArchivo != '') {
            const uniqueId = uuidv4();
            uniqueFileName = `${uniqueId}_${data.nombreArchivo}`;

            const resS3 = await this.s3Service.uploadFile(file, uniqueFileName, 'Obras');

            if(resS3){

              const newObra = this.obrasRepository.create({
                nombre: data.nombre,
                descripcion: data.descripcion,
                autor: data.autor,
                nombreArchivo: uniqueFileName,
                Activo: true,
                fechaCreacion: new Date(),
                municipality_id: data.municipality_id,
                UsuarioCreacionId: data.UsuarioCreacionId
              });
    
              const savedObra = await this.obrasRepository.save(newObra);
    
              return createApiResponse(true, 'Obra creada con éxito', savedObra, null, HttpStatus.CREATED);
            }
          }

    } catch (error) {
      throw new HttpException(
        createApiResponse(false, 'Error al crear la obra', null, error.message, HttpStatus.INTERNAL_SERVER_ERROR),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Obtener lista de obras
  async findAll(): Promise<ApiResponse<Obras[]>> {
    try {
      const obras = await this.obrasRepository.find({ order: { id: 'ASC' }});

      return createApiResponse<Obras[]>(true, 'Obras obtenidas con éxito', obras, null, HttpStatus.OK);
    } catch (error) {
      throw new HttpException(
        createApiResponse(false, 'Error al obtener las obras', null, error.message, HttpStatus.INTERNAL_SERVER_ERROR),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Obtener una obra por ID
  async findOne(id: number): Promise<ApiResponse<CreateObrasDto>> {
    try {
      const obra = await this.obrasRepository.findOne({ where: { id } });
      
      if (!obra) {
        throw new HttpException(
          createApiResponse(false, `Obra con ID ${id} no encontrada`, null, null, HttpStatus.NOT_FOUND),
          HttpStatus.NOT_FOUND,
        );
      }

      const url = await this.s3Service.getFileBase64(id, 'obrasRepository', 'Obras');

      if (!url) {
        throw new InternalServerErrorException('No se pudo generar la URL del archivo');
      }

      const response: CreateObrasDto = {
        id: obra.id,
        nombre: obra.nombre,
        descripcion: obra.descripcion,
        autor: obra.autor,
        nombreArchivo: obra.nombreArchivo,
        url: url,
        fechaCreacion: obra.fechaCreacion
      }

      return createApiResponse<CreateObrasDto>(true, 'Obra obtenida con éxito', response, null, HttpStatus.OK);
    } catch (error) {
      throw new HttpException(
        createApiResponse(false, 'Error al obtener la obra', null, error.message, HttpStatus.INTERNAL_SERVER_ERROR),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Actualizar una obra
  async update(updateObrasDto: CreateObrasDto, file: Express.Multer.File = null): Promise<ApiResponse<any>> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // const obra = await this.obrasRepository.preload({
      //   id,
      //   ...updateObrasDto,
      // });

      // if (!obra) {
      //   throw new HttpException(
      //     createApiResponse(false, `Obra con ID ${id} no encontrada`, null, null, HttpStatus.NOT_FOUND),
      //     HttpStatus.NOT_FOUND,
      //   );
      // }

      const obra = await this.obrasRepository.findOne({ where: { id:updateObrasDto.id } });

      if (!obra) {
        throw new HttpException(
          createApiResponse(false, `Obra con ID ${updateObrasDto.id } no encontrada`, null, null, HttpStatus.NOT_FOUND),
          HttpStatus.NOT_FOUND,
        );
      }

      if(updateObrasDto.nombreArchivo != obra.nombreArchivo) {

        // Eliminar archivo de S3
        const fileName = obra.nombreArchivo;
        const deleteS3 = await this.s3Service.deleteFile(fileName, 'Obras');
        // console.log('Archivo eliminado de S3:', fileName);

        if(deleteS3){
          let uniqueFileName = null;
          const uniqueId = uuidv4();
          uniqueFileName = `${uniqueId}_${updateObrasDto.nombreArchivo}`;
  
          await this.s3Service.uploadFile(file, uniqueFileName, 'Obras');
  
          obra.nombreArchivo = uniqueFileName;
        }
 
      }

      obra.nombre = updateObrasDto.nombre;
      obra.descripcion = updateObrasDto.descripcion;
      obra.autor = updateObrasDto.autor;

      const updatedObra = await this.obrasRepository.save(obra);

      return createApiResponse<any>(true, 'Obra actualizada con éxito', null, null, HttpStatus.OK);
    } catch (error) {
      throw new HttpException(
        createApiResponse(false, 'Error al actualizar la obra', null, error.message, HttpStatus.INTERNAL_SERVER_ERROR),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Eliminar una obra
  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const result = await this.obrasRepository.delete(id);

      if (result.affected === 0) {
        throw new HttpException(
          createApiResponse(false, `Obra con ID ${id} no encontrada`, null, null, HttpStatus.NOT_FOUND),
          HttpStatus.NOT_FOUND,
        );
      }

      return createApiResponse<null>(true, 'Obra eliminada con éxito', null, null, HttpStatus.OK);
    } catch (error) {
      throw new HttpException(
        createApiResponse(false, 'Error al eliminar la obra', null, error.message, HttpStatus.INTERNAL_SERVER_ERROR),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteObras(obraId: number): Promise<any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const obra = await this.obrasRepository.findOne({
        where: { id: obraId }
        });

        if (!obra) {
          throw new NotFoundException(`Aviso de privacidad con ID ${obraId} no encontrado`);
        }

        // Eliminar archivo de S3
        const fileName = obra.nombreArchivo;
        const deleteS3 = await this.s3Service.deleteFile(fileName, 'Obras');
        console.log('Archivo eliminado de S3:', fileName);

        if(deleteS3){
          // Eliminar el archivo de obras de la base de datos
          await queryRunner.manager.delete(Obras, obraId);
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


  async findAllWEB(): Promise<ApiResponse<obrasWEBDto[]>> {
    try {
    // Obtén las obras con los campos necesarios
    const obras = await this.obrasRepository.find({
      select: ['id', 'nombre', 'descripcion', 'autor', 'fechaCreacion'],
      order: { id: 'ASC' },
    });

    // Mapea las obras y busca la imagen para cada una
    const obrasConUrl = await Promise.all(
      obras.map(async (obra) => {
        const imagenUrl = await this.s3Service.getFileBase64(
          obra.id, // Ajusta esto según cómo identifiques las imágenes en S3
          'obrasRepository',
          'Obras'
        );

        return {
          ...obra,
          imagenUrl, // Añade la URL de la imagen al resultado
          fechaCreacion: format(new Date(obra.fechaCreacion), "dd 'de' MMMM yyyy", { locale: es }), // Formato deseado
        };
      })
    );

      return createApiResponse<obrasWEBDto[]>(true, 'Obras obtenidas con éxito', obrasConUrl, null, HttpStatus.OK);
    } catch (error) {
      throw new HttpException(
        createApiResponse(false, 'Error al obtener las obras', null, error.message, HttpStatus.INTERNAL_SERVER_ERROR),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
