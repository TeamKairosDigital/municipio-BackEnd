import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand, ObjectCannedACL, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import { Readable } from 'stream';
import { Upload } from '@aws-sdk/lib-storage';
import { Archivos } from 'src/models/archivos.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class S3Service {
    private client: S3Client;

    constructor(
        private configService: ConfigService,
        @InjectRepository(Archivos)
        private archivosRepository: Repository<Archivos>,
    ) {
        this.client = new S3Client({
            region: this.configService.get<string>('AWS_BUCKET_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_PUBLIC_KEY'),
                secretAccessKey: this.configService.get<string>('AWS_SECRET_KEY'),
            },
        });
    }

    async uploadFile(file: Express.Multer.File): Promise<any> {
        const stream = Readable.from(file.buffer);
        const uploadParams = {
            Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
            Key: file.originalname,
            Body: stream,
            ContentType: file.mimetype
            // Omite la propiedad ACL
        };

        // Usar la clase Upload en lugar de PutObjectCommand
        const parallelUploads3 = new Upload({
            client: this.client,
            params: uploadParams,
            leavePartsOnError: false, // opcional, elimina las partes en caso de error
        });

        return parallelUploads3.done();
    }

    async getFiles(): Promise<any> {
        const command = new ListObjectsCommand({
            Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        });
        return await this.client.send(command);
    }

    async getFile(fileName: string): Promise<any> {
        const command = new GetObjectCommand({
            Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
            Key: fileName,
        });
        return await this.client.send(command);
    }

    async downloadFile(fileName: string): Promise<void> {
        const command = new GetObjectCommand({
            Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
            Key: fileName,
        });
        const result = await this.client.send(command);

        if (result.Body instanceof Readable) {
            result.Body.pipe(fs.createWriteStream(`./images/${fileName}`));
        } else {
            throw new Error('Unexpected Body type');
        }
    }

    async getFileURL(id: number): Promise<string> {
        const archivo = await this.archivosRepository.findOne({
            where: { id: id }
        });

        if (!archivo) {
            throw new Error('Archivo no encontrado');
        }

        return `https://${this.configService.get<string>('AWS_BUCKET_NAME')}.s3.amazonaws.com/${archivo.nombreArchivo}`;
    }

    async getFileBase64(id: number): Promise<string> {
        // Obtén el archivo desde la base de datos
        const archivo = await this.archivosRepository.findOneBy({ id });

        if (!archivo) {
            throw new Error('Archivo no encontrado');
        }

        const params = {
            Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
            Key: archivo.nombreArchivo, // Usa el nombre del archivo obtenido de la base de datos
        };

        const command = new GetObjectCommand(params);
        const data = await this.client.send(command);
        const fileContent = await this.streamToBuffer(data.Body);

        return fileContent.toString('base64');
    }

    // Convierte el stream a buffer
    private async streamToBuffer(stream: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: Uint8Array[] = [];
            stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }

    async deleteFile(fileName: string): Promise<void> {

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
        };

        const command = new DeleteObjectCommand(params);

        try {
            await this.client.send(command);
            console.log('File deleted successfully from S3');
        } catch (error) {
            console.error('Error deleting file from S3:', error);
            throw new InternalServerErrorException('Failed to delete file from S3');
        }
    }
}
