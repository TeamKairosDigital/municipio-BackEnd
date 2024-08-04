import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from 'src/services/s3.service';
import { S3Controller } from 'src/controllers/s3.controller';
import { FileEntity } from 'src/models/file.entity';
import { Archivos } from 'src/models/archivos.entity';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([FileEntity, Archivos])
    ],
    controllers: [S3Controller],
    providers: [S3Service],
})
export class S3Module { }
