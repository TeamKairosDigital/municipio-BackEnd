import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from 'src/services/s3.service';
import { S3Controller } from 'src/controllers/s3.controller';
import { FileesEntity } from 'src/models/filees.entity';
import { Archivos } from 'src/models/archivos.entity';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([FileesEntity, Archivos])
    ],
    controllers: [S3Controller],
    providers: [S3Service],
})
export class S3Module { }
