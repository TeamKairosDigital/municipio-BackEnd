import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponse } from 'src/models/ApiResponse';
import { CreateObrasDto } from 'src/models/dto/obrasDto';
import { Obras } from 'src/models/obras.entity';
import { Repository } from 'typeorm';
import { S3Service } from './s3.service';

@Injectable()
export class ObrasService {

    constructor(
        @InjectRepository(Obras)
        private readonly obrasRepository: Repository<Obras>,
        private readonly s3: S3Service
      ) {}

  // Crear nueva obra
  async create(createObrasDto: CreateObrasDto, file: Express.Multer.File): Promise<ApiResponse<Obras>> {

    try {

      const newObra = this.obrasRepository.create(createObrasDto);
      const savedObra = await this.obrasRepository.save(newObra);

      return {
        success: true,
        statusCode: 201,
        message: 'Obra creado con éxito',
        data: savedObra,
      };

    } catch (error) {

      return {
        success: false,
        statusCode: 500,
        message: 'Error al crear la obra',
        errors: error.message,
      };

    }

  }

  // Obtener lista de obras
  async findAll(): Promise<ApiResponse<Obras[]>> {

    try {

      const Obras = await this.obrasRepository.find();

      return {
        success: true,
        statusCode: 200,
        message: 'Obras obtenidos con éxito',
        data: Obras,
      };

    } catch (error) {

      return {
        success: false,
        statusCode: 500,
        message: 'Error al obtener las obras',
        errors: error.message,
      };

    }

  }

  // Obtener un obra por ID
  async findOne(id: number): Promise<ApiResponse<Obras>> {

    try {

      const Obra = await this.obrasRepository.findOneBy({ id });
      
      if (!Obra) {
        return {
          success: false,
          statusCode: 404,
          message: `Obra con ID ${id} no encontrado`,
        };
      }

      return {
        success: true,
        statusCode: 200,
        message: 'Obra obtenido con éxito',
        data: Obra,
      };

    } catch (error) {

      return {
        success: false,
        statusCode: 500,
        message: 'Error al obtener la Obra',
        errors: error.message,
      };

    }

  }

  // Actualizar una obra
  async update(id: number, updateObrasDto: CreateObrasDto): Promise<ApiResponse<Obras>> {

    try {

      const Obra = await this.obrasRepository.preload({
        id,
        ...updateObrasDto,
      });

      if (!Obra) {

        return {
          success: false,
          statusCode: 404,
          message: `Obra con ID ${id} no encontrado`,
        };

      }

      const updatedObra = await this.obrasRepository.save(Obra);

      return {
        success: true,
        statusCode: 200,
        message: 'Obra actualizado con éxito',
        data: updatedObra,
      };

    } catch (error) {

      return {
        success: false,
        statusCode: 500,
        message: 'Error al actualizar el Obra',
        errors: error.message,
      };

    }

  }

  // Eliminar un obra
  async remove(id: number): Promise<ApiResponse<any>> {

    try {

      const result = await this.obrasRepository.delete(id);

      if (result.affected === 0) {

        return {
          success: false,
          statusCode: 404,
          message: `Obra con ID ${id} no encontrado`,
        };

      }

      return {
        success: true,
        statusCode: 200,
        message: 'Obra eliminado con éxito',
        data: null,
      };

    } catch (error) {

      return {
        success: false,
        statusCode: 500,
        message: 'Error al eliminar el Obra',
        errors: error.message,
      };
      
    }

  }

}
