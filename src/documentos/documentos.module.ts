import { forwardRef, Module } from '@nestjs/common';
import { DocumentosController } from './documentos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Archivos } from './entities/archivos.entity';
import { Documentos } from './entities/documentos.entity';
import { Periodos } from './entities/periodos.entity';
import { DocumentosService } from './documentos.service';
import { S3Module } from 'src/s3/s3.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([Documentos, Archivos, Periodos]), forwardRef(() => S3Module), forwardRef(() => AuthModule),],
    controllers: [DocumentosController],
    providers: [DocumentosService],
    exports: [DocumentosService, TypeOrmModule]
})
export class DocumentosModule { }
