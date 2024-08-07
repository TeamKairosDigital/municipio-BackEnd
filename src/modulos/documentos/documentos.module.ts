import { Module } from '@nestjs/common';
import { DocumentosController } from 'src/controllers/documentos.controller';
import { DocumentosService } from 'src/services/documentos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documentos } from 'src/models/documentos.entity';
import { Archivos } from 'src/models/archivos.entity';
import { S3Module } from '../s3/s3.module';
import { Periodos } from 'src/models/periodos.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Documentos, Archivos, Periodos]), S3Module],
    controllers: [DocumentosController],
    providers: [DocumentosService]
})
export class DocumentosModule { }
