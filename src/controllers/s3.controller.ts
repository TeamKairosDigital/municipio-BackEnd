import { Controller, Post, Get, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/services/s3.service';

@Controller('s3')
export class S3Controller {
    constructor(private readonly s3Service: S3Service) { }

    @Post('uploadFile')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file) {
        const result = await this.s3Service.uploadFile(file);
        return { message: 'Archivo subido', result: result };
    }

    @Get('getFiles')
    async getFiles() {
        const result = await this.s3Service.getFiles();
        return result.Contents;
    }

    @Get('getFile/:fileName')
    async getFile(@Param('fileName') fileName: string) {
        const result = await this.s3Service.getFile(fileName);
        return result.$metadata;
    }

    @Get('downloadFile/:fileName')
    async downloadFile(@Param('fileName') fileName: string) {
        await this.s3Service.downloadFile(fileName);
        return { message: 'Archivo descargado' };
    }

    // @Get('getFileURL/:fileName')
    // async getFileURL(@Param('fileName') fileName: string) {
    //     const url = await this.s3Service.getFileURL(fileName);
    //     return { url: url };
    // }
}
