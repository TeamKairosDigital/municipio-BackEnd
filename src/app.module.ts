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
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      username: 'soporte',
      password: '12345',
      database: 'AlmacenArchivos',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Esto se utiliza si no esta creado las tablas
      options: {
        encrypt: true, // Esta opción asegura que la conexión esté cifrada
      },
      extra: {
        trustServerCertificate: true, // en prod habra que ponerlo en false
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que ConfigService esté disponible globalmente
    }),
    TypeOrmModule.forFeature([Documentos, Archivos, Periodos]),
    S3Module,
  ],
  controllers: [DocumentosController, S3Controller],
  providers: [DocumentosService, S3Service],
})
export class AppModule { }
