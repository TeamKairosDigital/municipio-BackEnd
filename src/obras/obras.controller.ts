import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiResponse } from 'src/common/response/ApiResponse';
import { CreateObrasDto } from 'src/obras/dto/obrasDto';
import { Obras } from 'src/obras/entities/obras.entity';
import { ObrasService } from 'src/obras/obras.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { createApiResponse } from 'src/common/response/createApiResponse';
import { FileInterceptor } from '@nestjs/platform-express';
import { obrasWEBDto } from './dto/obrasWEB.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';


@Controller('obras')
export class ObrasController {

  constructor(private readonly obrasService: ObrasService) {}

  @Get('findAllWEB')
  async findAllWEB(): Promise<ApiResponse<obrasWEBDto[]>> {
    return this.obrasService.findAllWEB();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  async findAll(): Promise<ApiResponse<Obras[]>> {
    return this.obrasService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('createObra')
  @UseInterceptors(FileInterceptor('archivo'))
  async create(
    @Body() createObrasDto: CreateObrasDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<any>> {
    const result = await  this.obrasService.create(createObrasDto, file);
    return createApiResponse(true, 'Obras creado correctamente', result, null, HttpStatus.CREATED);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<CreateObrasDto>> {
    return this.obrasService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put('updateObra')
  @UseInterceptors(FileInterceptor('archivo'))
  async update(
    @Body() updateObrasDto: CreateObrasDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<any>> {
    return this.obrasService.update(updateObrasDto, file);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<ApiResponse<null>> {
    return this.obrasService.deleteObras(id);
  }



}
