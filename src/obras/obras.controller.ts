import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiResponse } from 'src/common/response/ApiResponse';
import { CreateObrasDto } from 'src/obras/dto/obrasDto';
import { Obras } from 'src/obras/entities/obras.entity';
import { ObrasService } from 'src/obras/obras.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { createApiResponse } from 'src/common/response/createApiResponse';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@Controller('obras')
export class ObrasController {

  constructor(private readonly obrasService: ObrasService) {}

  @Get()
  async findAll(): Promise<ApiResponse<Obras[]>> {
    return this.obrasService.findAll();
  }

  @Post('createObra')
  @UseInterceptors(FileInterceptor('archivo'))
  async create(
    @Body() createObrasDto: CreateObrasDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<any>> {
    const result = await  this.obrasService.create(createObrasDto, file);
    return createApiResponse(true, 'Obras creado correctamente', result, null, HttpStatus.CREATED);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<CreateObrasDto>> {
    return this.obrasService.findOne(id);
  }

  @Put('updateObra')
  @UseInterceptors(FileInterceptor('archivo'))
  async update(
    @Body() updateObrasDto: CreateObrasDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<any>> {
    return this.obrasService.update(updateObrasDto, file);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<ApiResponse<null>> {
    return this.obrasService.deleteObras(id);
  }

}
