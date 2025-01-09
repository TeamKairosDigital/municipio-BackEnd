import { Controller, Post, Body, Get, Query, UseInterceptors, NestInterceptor, UploadedFile, Param, ParseIntPipe, HttpStatus, Res, Delete, HttpException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ApiResponse } from 'src/common/response/ApiResponse';
import { createFileDto } from 'src/documentos/dto/createFileDto';
import { DocumentosFiltrosDto } from 'src/documentos/dto/DocumentosFiltrosDto';
import { periodoDto } from 'src/documentos/dto/periodo';
import { S3Service } from 'src/s3/s3.service';
import { createApiResponse } from 'src/common/response/createApiResponse';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { DocumentosService } from './documentos.service';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('documentos')
export class DocumentosController {

    constructor(
        private documentosService: DocumentosService,
        private s3Service: S3Service
    ) { }

    @Post('getDocumentsWithFiles')
    async getDocumentsWithFiles(@Body() data: DocumentosFiltrosDto): Promise<ApiResponse<any[]>> {
        try {
            const documents = await this.documentosService.getDocumentsWithFilesByYear(data);
    
            return createApiResponse(true, 'Documentos recuperados exitosamente', documents, null, HttpStatus.OK);
        } catch (error) {
            console.error('Error al obtener documentos:', error);
            throw new HttpException(
                createApiResponse(false, 'Error al obtener documentos', null, error, HttpStatus.INTERNAL_SERVER_ERROR),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    @Post('create-file')
    @UseInterceptors(FileInterceptor('archivo'))
    async postCreateFile(
        @Body() createFileDto: createFileDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<ApiResponse<any>> {
        try {
            const result = await this.documentosService.createFile(createFileDto, file);
    
            return createApiResponse(true, 'Archivo cargado exitosamente', result, null, HttpStatus.CREATED);
        } catch (error) {
            console.error('Error al crear archivo:', error);
            throw new HttpException(
                createApiResponse(false, 'Error al crear archivo', null, error, HttpStatus.INTERNAL_SERVER_ERROR),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    @Get('periodos')
    async getPeriodos(): Promise<ApiResponse<periodoDto[]>> {
        try {
            const periodos = await this.documentosService.getPeriodos();
    
            return createApiResponse(true, 'Periodos recuperados exitosamente', periodos, null, HttpStatus.OK);
        } catch (error) {
            console.error('Error al obtener periodos:', error);
            throw new HttpException(
                createApiResponse(false, 'Error al obtener periodos', null, error, HttpStatus.INTERNAL_SERVER_ERROR),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
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
            console.error('Error al eliminar documento y archivo:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error al eliminar documento y archivo',
                errors: error.message,
            });
        }
    }
    


    // @Post('getDocumentsWithFiles')
    // async getDocumentsWithFiles(@Body() data: DocumentosFiltrosDto): Promise<ApiResponse<any[]>> {

    //     const documents = await this.documentosService.getDocumentsWithFilesByYear(data);

    //     return {
    //         success: true,
    //         statusCode: HttpStatus.OK,
    //         message: 'Documents retrieved successfully',
    //         data: documents
    //     };

    // }

    // @Post('create-file')
    // @UseInterceptors(FileInterceptor('archivo'))
    // async postCreateFile(
    //     @Body() createFileDto: createFileDto,
    //     @UploadedFile() file: Express.Multer.File
    // ): Promise<ApiResponse<any>> {

    //     // Llamar al servicio para procesar el archivo y guardar la información
    //     const result = await this.documentosService.createFile(createFileDto, file);

    //     // Retornar una respuesta
    //     return {
    //         success: true,
    //         statusCode: HttpStatus.CREATED,
    //         message: 'Archivo cargado exitosamente',
    //         data: result
    //     };

    // }

    // @Get('periodos')
    // async getPeriodos(): Promise<ApiResponse<periodoDto[]>> {

    //     const periodos = await this.documentosService.getPeriodos();
    //     return {
    //         success: true,
    //         statusCode: HttpStatus.OK,
    //         message: 'Periods retrieved successfully',
    //         data: periodos
    //     };

    // }

    // @Delete(':id')
    // async deleteDocument(@Param('id', ParseIntPipe) id: number, @Res() res): Promise<ApiResponse<void>> {

    //     try {
    //         await this.documentosService.deleteDocumentAndFile(id);
    //         return res.status(HttpStatus.OK).json({
    //             success: true,
    //             statusCode: HttpStatus.OK,
    //             message: 'Documento y archivo eliminados exitosamente',
    //         });
    //     } catch (error) {
    //         return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    //             success: false,
    //             statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    //             message: 'Error al eliminar documento y archivo',
    //             errors: error,
    //         });
    //     }

    // }

    @Get('getFileURL/:id')
    async getFileURL(@Param('id') id: number): Promise<ApiResponse<{ url: string }>> {
        try {
            const url = await this.s3Service.getFileURL(id);
            return {
                success: true,
                statusCode: HttpStatus.OK,
                message: 'URL del archivo recuperada con éxito',
                data: { url },
            };
        } catch (error) {
            return {
                success: false,
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Error al recuperar la URL del archivo',
                errors: error.message,
            };
        }
    }

    @Get('base64/:id')
    async getFileBase64(@Param('id') id: number): Promise<ApiResponse<{ base64: string }>> {
        try {
            const base64 = await this.s3Service.getFileBase64(id);
            return {
                success: true,
                statusCode: HttpStatus.OK,
                message: 'Archivo Base64 recuperado exitosamente',
                data: { base64 },
            };
        } catch (error) {
            return {
                success: false,
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Error al recuperar el archivo en Base64',
                errors: error.message,
            };
        }
    }


    // @Get('getFileURL/:id')
    // async getFileURL(@Param('id') id: number): Promise<ApiResponse<{ url: string }>> {

    //     const url = await this.s3Service.getFileURL(id);

    //     return {
    //         success: true,
    //         statusCode: HttpStatus.OK,
    //         message: 'URL del archivo recuperada con éxito',
    //         data: { url }
    //     };

    // }

    // @Get('base64/:id')
    // async getFileBase64(@Param('id') id: number): Promise<ApiResponse<{ base64: string }>> {

    //     const base64 = await this.s3Service.getFileBase64(id);
    //     return {
    //         success: true,
    //         statusCode: HttpStatus.OK,
    //         message: 'Archivo Base64 recuperado exitosamente',
    //         data: { base64 }
    //     };

    // }

}
