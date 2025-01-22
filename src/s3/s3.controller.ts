import { Controller, Post, Get, Param, UploadedFile, UseInterceptors, HttpStatus, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/response/ApiResponse';
import { S3Service } from 'src/s3/s3.service';
import { getFileDto } from './dto/getFile.dto';

@ApiBearerAuth()
@Controller('s3')
export class S3Controller {
    constructor(private readonly s3Service: S3Service) { }

    @Get('getFiles')
    async getFiles() {
        try {
            const result = await this.s3Service.getFiles();
            if (!result || !result.Contents) {
                throw new Error('No se encontraron archivos');
            }
            return {
                success: true,
                statusCode: HttpStatus.OK,
                message: 'Archivos recuperados con éxito',
                data: result.Contents,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error al recuperar los archivos',
                errors: error.message,
            };
        }
    }

    @Get('getFile/:fileName')
    async getFile(@Param('fileName') fileName: string) {
        try {
            const result = await this.s3Service.getFile(fileName);
            if (!result || !result.$metadata) {
                throw new Error('Archivo no encontrado');
            }
            return {
                success: true,
                statusCode: HttpStatus.OK,
                message: 'Archivo recuperado con éxito',
                data: result.$metadata,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Error al recuperar el archivo',
                errors: error.message,
            };
        }
    }

    @Get('downloadFile/:fileName')
    async downloadFile(@Param('fileName') fileName: string) {
        try {
            await this.s3Service.downloadFile(fileName);
            return {
                success: true,
                statusCode: HttpStatus.OK,
                message: 'Archivo descargado con éxito',
            };
        } catch (error) {
            return {
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error al descargar el archivo',
                errors: error.message,
            };
        }
    }

    @Post('getFileBase64')
    async findOne(@Body() getFileDto: getFileDto,): Promise<ApiResponse<string>> {
        const result = await this.s3Service.getFileBase64(getFileDto.id, getFileDto.repository, getFileDto.folder);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: 'Archivo recuperado con éxito',
            data: result,
        };
    }


    // @Post('uploadFile')
    // @UseInterceptors(FileInterceptor('file'))
    // async uploadFile(@UploadedFile() file) {
    //     const result = await this.s3Service.uploadFile(file, );
    //     return { message: 'Archivo subido', result: result };
    // }

    // @Get('getFiles')
    // async getFiles() {
    //     const result = await this.s3Service.getFiles();
    //     return result.Contents;
    // }

    // @Get('getFile/:fileName')
    // async getFile(@Param('fileName') fileName: string) {
    //     const result = await this.s3Service.getFile(fileName);
    //     return result.$metadata;
    // }

    // @Get('downloadFile/:fileName')
    // async downloadFile(@Param('fileName') fileName: string) {
    //     await this.s3Service.downloadFile(fileName);
    //     return { message: 'Archivo descargado' };
    // }

    // @Get('getFileURL/:fileName')
    // async getFileURL(@Param('fileName') fileName: string) {
    //     const url = await this.s3Service.getFileURL(fileName);
    //     return { url: url };
    // }


}
