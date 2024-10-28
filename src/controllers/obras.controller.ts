import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile } from '@nestjs/common';
import { ApiResponse } from 'src/models/ApiResponse';
import { CreateObrasDto } from 'src/models/dto/obrasDto';
import { Obras } from 'src/models/obras.entity';
import { ObrasService } from 'src/services/obras.service';

@Controller('obras')
export class ObrasController {

    constructor(private readonly obrasService: ObrasService) {}

  // Crear nueva obra
  @Post()
  create(
    @Body() createObrasDto: CreateObrasDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<ApiResponse<any>> {
    return this.obrasService.create(createObrasDto, file);
  }

  // Obtener lista de obras
  @Get()
  findAll(): Promise<ApiResponse<any>> {
    return this.obrasService.findAll();
  }

  // Obtener un obra por ID
  @Get(':id')
  findOne(@Param('id') id: number): Promise<ApiResponse<any>> {
    return this.obrasService.findOne(id);
  }

  // Actualizar una obra
  @Put(':id')
  update(@Param('id') id: number, 
  @Body() updateObrasDto: CreateObrasDto,  
  @UploadedFile() file: Express.Multer.File
): Promise<ApiResponse<any>> {
    return this.obrasService.update(id, updateObrasDto);
  }

  // Eliminar un obra
  @Delete(':id')
  remove(@Param('id') id: number): Promise<ApiResponse<any>> {
    return this.obrasService.remove(id);
  }

}
