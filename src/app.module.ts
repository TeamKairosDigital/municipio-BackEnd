import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosController } from './controllers/documentos.controller';
import { DocumentosService } from './services/documentos.service';
import { Documentos } from './models/documentos.entity';
import { Archivos } from './models/archivos.entity';
import { S3Module } from './modulos/s3/s3.module';
import { S3Service } from './services/s3.service';
import { S3Controller } from './controllers/s3.controller';
import { ConfigModule } from '@nestjs/config';
import { Periodos } from './models/periodos.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'soporte',
      password: '12345',
      database: 'almacenArchivos',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Esto se utiliza si no esta creado las tablas
      // extra: {
      //   trustServerCertificate: true, // en prod habra que ponerlo en false
      // },
      // logging: true
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que ConfigService esté disponible globalmente
      // envFilePath: __dirname + '../../../.env',
    }),
    TypeOrmModule.forFeature([Documentos, Archivos, Periodos]),
    S3Module,
  ],
  controllers: [DocumentosController, S3Controller],
  providers: [DocumentosService, S3Service],
})
export class AppModule { }
