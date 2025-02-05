import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Post, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse } from 'src/common/response/ApiResponse';
import { createAvisoPrivacidadArchivoDto } from 'src/aviso-privacidad/dto/createAvisoPrivacidadArchivoDto';
import { createAvisoPrivacidadDto } from 'src/aviso-privacidad/dto/createAvisoPrivacidadDto';
import { filterAvisoPrivacidadDto } from 'src/aviso-privacidad/dto/filterAvisoPrivacidadDto';
import { createApiResponse } from 'src/common/response/createApiResponse';
import { AvisoArchivoDto, AvisoPrivacidadDto } from 'src/aviso-privacidad/dto/avisoPrivacidad.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AvisoPrivacidadService } from './aviso-privacidad.service';
import { createOtroDocumentoDto } from './dto/createOtroDocumento.dto';
import { OtrosDocumentosDto } from './dto/otrosDocumentos.dto';

@Controller('aviso-privacidad')
export class AvisoPrivacidadController {

  constructor(
      private avisoPrivaciadService: AvisoPrivacidadService
  ) { }

  @Get('getListAvisoPrivacidadWEB')
  async getListAvisoPrivacidadWEB(
  ): Promise<ApiResponse<AvisoPrivacidadDto[]>> {
    return await this.avisoPrivaciadService.getListAvisoPrivacidadWEB();
  }

  @Get('getAvisoPrivacidadArchivoWEB/:id')
  async getAvisoPrivacidadArchivoWEB(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<string>> {
    return await this.avisoPrivaciadService.getAvisoPrivacidadArchivoWEB(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('getListAvisoPrivacidad')
  async getListAvisoPrivacidad(
    @Body() data: filterAvisoPrivacidadDto
  ): Promise<ApiResponse<AvisoPrivacidadDto[]>> {
    return await this.avisoPrivaciadService.getListAvisoPrivacidad(data);
  }
  
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('createAvisoPrivacidad')
  async createAvisoPrivacidad(@Body() data: createAvisoPrivacidadDto): Promise<ApiResponse<any>> {
    const result = await this.avisoPrivaciadService.createAvisoPrivacidad(data);
    return createApiResponse(true, 'Aviso de privacidad creado correctamente', result, null, HttpStatus.CREATED);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('getAvisoPrivacidad/:id')
  async getAvisoPrivacidad(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<any>> {
    const result = await this.avisoPrivaciadService.getAvisoPrivacidad(id);
    return createApiResponse(true, 'Aviso de privacidad obtenido correctamente', result, null, HttpStatus.OK);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put('editAvisoPrivacidad')
  async editAvisoPrivacidad(@Body() data: createAvisoPrivacidadDto): Promise<ApiResponse<any>> {
    const result = await this.avisoPrivaciadService.editAvisoPrivacidad(data);
    return createApiResponse(true, 'Aviso de privacidad editado correctamente', result, null, HttpStatus.OK);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete('deleteAvisoPrivacidad/:id')
  async deleteDocument(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<void>> {
    try {
      await this.avisoPrivaciadService.deleteAvisoPrivacidad(id);
      return createApiResponse(true, 'Aviso de privacidad eliminado exitosamente', null, null, HttpStatus.OK);
    } catch (error) {
      return createApiResponse(false, 'Error al eliminar aviso de privacidad', null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('createAvisoPrivacidadArchivo')
  @UseInterceptors(FileInterceptor('archivo'))
  async createAvisoPrivacidadArchivo(
    @Body() data: createAvisoPrivacidadArchivoDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<any>> {
    const result = await this.avisoPrivaciadService.createAvisoPrivacidadArchivo(data, file);
    return createApiResponse(true, 'Aviso de privacidad creado correctamente', result, null, HttpStatus.CREATED);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('getAvisoPrivacidadArchivo/:id')
  async getAvisoPrivacidadArchivo(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<createAvisoPrivacidadArchivoDto>> {
    const result = await this.avisoPrivaciadService.getAvisoPrivacidadArchivo(id);
    return createApiResponse(true, 'Aviso de privacidad obtenido correctamente', result, null, HttpStatus.OK);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put('editAvisoPrivacidadArchivo')
  @UseInterceptors(FileInterceptor('archivo'))
  async editAvisoPrivacidadArchivo(
    @Body() data: createAvisoPrivacidadArchivoDto,
    // @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<any>> {
    const result = await this.avisoPrivaciadService.editAvisoPrivacidadArchivo(data);
    return createApiResponse(true, 'Aviso de privacidad editado correctamente', result, null, HttpStatus.OK);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete('deleteAvisoPrivacidadArchivo/:id')
  async deleteAvisoPrivacidadArchivo(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<void>> {
    try {
      await this.avisoPrivaciadService.deleteAvisoPrivacidadArchivo(id);
      return createApiResponse(true, 'Documento y archivo eliminados exitosamente', null, null, HttpStatus.OK);
    } catch (error) {
      return createApiResponse(false, 'Error al eliminar documento y archivo', null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
  // Otros Documentos
  @Get('getOtrosDocumentos')
  async getOtrosDocumentos(): Promise<ApiResponse<OtrosDocumentosDto[]>> {
    return await this.avisoPrivaciadService.getOtrosDocumentos();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('createOtroDocumento')
  @UseInterceptors(FileInterceptor('archivo'))
  async createOtroDocumento(
    @Body() data: createOtroDocumentoDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<any>> {
    return await this.avisoPrivaciadService.createOtroDocumento(data, file);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('findOneOtroDocumento/:id')
  async findOneOtroDocumento(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<createOtroDocumentoDto>> {
    return await this.avisoPrivaciadService.findOneOtroDocumento(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put('updateOtroDocumento')
  @UseInterceptors(FileInterceptor('archivo'))
  async updateOtroDocumento(
    @Body() data: createOtroDocumentoDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<any>> {
    return await this.avisoPrivaciadService.updateOtroDocumento(data, file);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete('deleteOtroDocumento/:id')
  async deleteOtroDocumento(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<any>> {
    return await this.avisoPrivaciadService.deleteOtroDocumento(id);
  }

}
