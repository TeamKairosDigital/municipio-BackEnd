import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateObrasDto } from 'src/models/dto/obrasDto';
import { Obras } from 'src/models/obras.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ObrasService {

    constructor(
        @InjectRepository(Obras)
        private readonly blogRepository: Repository<Obras>,
      ) {}

  // Crear un nuevo blog
  async create(createObrasDto: CreateObrasDto): Promise<Obras> {
    try {
      const newBlog = this.blogRepository.create(createObrasDto);
      return await this.blogRepository.save(newBlog);
    } catch (error) {
      throw new InternalServerErrorException('Error al crear el blog');
    }
  }

  // Obtener todos los blogs
  async findAll(): Promise<Obras[]> {
    try {
      return await this.blogRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los blogs');
    }
  }

  // Obtener un blog por ID
  async findOne(id: number): Promise<Obras> {
    try {
      const blog = await this.blogRepository.findOneBy({ id });
      if (!blog) {
        throw new NotFoundException(`Blog con ID ${id} no encontrado`);
      }
      return blog;
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el blog');
    }
  }

  // Actualizar un blog
  async update(id: number, updateObrasDto: CreateObrasDto): Promise<Obras> {
    try {
      const blog = await this.blogRepository.preload({
        id,
        ...updateObrasDto,
      });

      if (!blog) {
        throw new NotFoundException(`Blog con ID ${id} no encontrado`);
      }

      return await this.blogRepository.save(blog);
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar el blog');
    }
  }

  // Eliminar un blog
  async remove(id: number): Promise<void> {
    try {
      const result = await this.blogRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Blog con ID ${id} no encontrado`);
      }
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar el blog');
    }
  }

}
