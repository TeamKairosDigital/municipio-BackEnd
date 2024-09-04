import { Controller, Post, Body, Get, Query, UseInterceptors, NestInterceptor, UploadedFile, Param, ParseIntPipe, HttpStatus, Res, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ApiResponse } from 'src/models/ApiResponse';
import { createFileDto } from 'src/models/dto/create-file.dto';
import { DocumentosFiltrosDto } from 'src/models/dto/DocumentosFiltrosDto';
import { periodoDto } from 'src/models/dto/periodo';
import { DocumentosService } from 'src/services/documentos.service';
import { S3Service } from 'src/services/s3.service';

@Controller('documentos')
export class DocumentosController {

    constructor(
        private documentosService: DocumentosService,
        private s3Service: S3Service
    ) { }

    @Post('getDocumentsWithFiles')
    async getDocumentsWithFiles(@Body() data: DocumentosFiltrosDto): Promise<ApiResponse<any[]>> {

        const documents = await this.documentosService.getDocumentsWithFilesByYear(data);

        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: 'Documents retrieved successfully',
            data: documents
        };

    }

    @Post('create-file')
    @UseInterceptors(FileInterceptor('archivo'))
    async postCreateFile(
        @Body() createFileDto: createFileDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<ApiResponse<any>> {

        // Llamar al servicio para procesar el archivo y guardar la información
        const result = await this.documentosService.createFile(createFileDto, file);

        // Retornar una respuesta
        return {
            success: true,
            statusCode: HttpStatus.CREATED,
            message: 'Archivo cargado exitosamente',
            data: result
        };

    }

    @Get('periodos')
    async getPeriodos(): Promise<ApiResponse<periodoDto[]>> {

        const periodos = await this.documentosService.getPeriodos();
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: 'Periods retrieved successfully',
            data: periodos
        };

    }

    @Delete(':id')
    async deleteDocument(@Param('id', ParseIntPipe) id: number, @Res() res): Promise<ApiResponse<void>> {

        try {
            await this.documentosService.deleteDocumentAndFile(id);
            return res.status(HttpStatus.OK).json({
                success: true,
                statusCode: HttpStatus.OK,
                message: 'Documento y archivo eliminados exitosamente',
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error al eliminar documento y archivo',
                errors: error.message,
            });
        }

    }


    @Get('getFileURL/:id')
    async getFileURL(@Param('id') id: number): Promise<ApiResponse<{ url: string }>> {

        const url = await this.s3Service.getFileURL(id);

        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: 'URL del archivo recuperada con éxito',
            data: { url }
        };

    }

    @Get('base64/:id')
    async getFileBase64(@Param('id') id: number): Promise<ApiResponse<{ base64: string }>> {

        const base64 = await this.s3Service.getFileBase64(id);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: 'Archivo Base64 recuperado exitosamente',
            data: { base64 }
        };

    }

}
