import { Controller, Post, Body, Get, Query, UseInterceptors, NestInterceptor, UploadedFile, Param, ParseIntPipe, HttpStatus, Res, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { createFileDto } from 'src/models/dto/create-file.dto';
import { periodoDto } from 'src/models/dto/periodo';
import { DocumentosService } from 'src/services/documentos.service';
import { S3Service } from 'src/services/s3.service';

@Controller('documentos')
export class DocumentosController {

    constructor(
        private documentosService: DocumentosService,
        private s3Service: S3Service
    ) { }

    @Get('getDocumentsWithFiles')
    async getDocumentsWithFiles(@Query('anualidad') anualidad: string) {
        return this.documentosService.getDocumentsWithFilesByYear(anualidad);
    }

    @Post('create-file')
    @UseInterceptors(FileInterceptor('archivo'))
    async postCreateFile(
        @Body() createFileDto: createFileDto,
        @UploadedFile() file: Express.Multer.File
    ) {

        // Llamar al servicio para procesar el archivo y guardar la información
        const result = await this.documentosService.createFile(createFileDto, file);

        // Retornar una respuesta
        return {
            message: 'File uploaded successfully',
            // fileUrl: await this.s3Service.getFileURL(file.originalname), // Obtener la URL pública del archivo
            fileData: result
        };
    }

    @Get('getFileURL/:id')
    async getFileURL(@Param('id') id: number): Promise<{ url: string }> {
        const url = await this.s3Service.getFileURL(id);
        return { url }; // Devuelve un objeto JSON
    }

    @Get('base64/:id')
    async getFileBase64(@Param('id') id: number): Promise<{ base64: string }> {
        const base64 = await this.s3Service.getFileBase64(id);
        return { base64 };
    }

    @Get('periodos')
    async getPeriodos(): Promise<periodoDto[]> {
        return this.documentosService.getPeriodos();
    }


    @Delete(':id')
    async deleteDocument(@Param('id', ParseIntPipe) id: number, @Res() res) {
        try {
            await this.documentosService.deleteDocumentAndFile(id);
            return res.status(HttpStatus.OK).json({
                message: 'Document and file deleted successfully',
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error deleting document and file',
                error: error.message,
            });
        }
    }

}
