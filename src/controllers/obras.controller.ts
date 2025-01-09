import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile } from '@nestjs/common';
import { ApiResponse } from 'src/models/response/ApiResponse';
import { CreateObrasDto } from 'src/models/dto/obrasDto';
import { Obras } from 'src/models/obras.entity';
import { ObrasService } from 'src/services/obras.service';

@Controller('obras')
export class ObrasController {

  constructor(private readonly obrasService: ObrasService) {}

  @Post()
  async create(
    @Body() createObrasDto: CreateObrasDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<Obras>> {
    return this.obrasService.create(createObrasDto, file);
  }

  @Get()
  async findAll(): Promise<ApiResponse<Obras[]>> {
    return this.obrasService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<Obras>> {
    return this.obrasService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateObrasDto: CreateObrasDto,
  ): Promise<ApiResponse<Obras>> {
    return this.obrasService.update(id, updateObrasDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<ApiResponse<null>> {
    return this.obrasService.remove(id);
  }

//   // Crear nueva obra
//   @Post()
//   create(
//     @Body() createObrasDto: CreateObrasDto,
//     @UploadedFile() file: Express.Multer.File
//   ): Promise<ApiResponse<any>> {
//     return this.obrasService.create(createObrasDto, file);
//   }

//   // Obtener lista de obras
//   @Get()
//   findAll(): Promise<ApiResponse<any>> {
//     return this.obrasService.findAll();
//   }

//   // Obtener un obra por ID
//   @Get(':id')
//   findOne(@Param('id') id: number): Promise<ApiResponse<any>> {
//     return this.obrasService.findOne(id);
//   }

//   // Actualizar una obra
//   @Put(':id')
//   update(@Param('id') id: number, 
//   @Body() updateObrasDto: CreateObrasDto,  
//   @UploadedFile() file: Express.Multer.File
// ): Promise<ApiResponse<any>> {
//     return this.obrasService.update(id, updateObrasDto);
//   }

//   // Eliminar un obra
//   @Delete(':id')
//   remove(@Param('id') id: number): Promise<ApiResponse<any>> {
//     return this.obrasService.remove(id);
//   }

}
