import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from 'src/s3/s3.service';
import { S3Controller } from 'src/s3/s3.controller';
import { FileesEntity } from 'src/s3/entities/filees.entity';
import { DocumentosModule } from 'src/documentos/documentos.module';
import { ObrasModule } from 'src/obras/obras.module';
import { AvisoPrivacidadModule } from 'src/aviso-privacidad/aviso-privacidad.module';

@Module({
    imports: [ 
        TypeOrmModule.forFeature([FileesEntity]),
        forwardRef(() => DocumentosModule),
        forwardRef(() => ObrasModule),
        forwardRef(() => AvisoPrivacidadModule),
    ],
    controllers: [S3Controller],
    providers: [S3Service],
    exports: [S3Service, TypeOrmModule]
})
export class S3Module { }
