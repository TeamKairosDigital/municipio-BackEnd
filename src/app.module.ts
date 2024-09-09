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
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { AuthModule } from './modulos/auth/auth.module';
import { UserModule } from './modulos/user/user.module';
import { JwtService } from '@nestjs/jwt';
import { Users } from './models/users.entity';
import { Municipality } from './models/Municipality.entity';
import { avisoPrivacidad } from './models/avisoPrivacidad.entity';
import { avisoPrivacidadArchivos } from './models/avisoPrivacidadArchivos.entity';
import { AvisoPrivacidadController } from './controllers/aviso-privacidad.controller';
import { AvisoPrivacidadService } from './services/aviso-privacidad.service';

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
    TypeOrmModule.forFeature([Documentos, Archivos, Periodos, Users, Municipality, avisoPrivacidad, avisoPrivacidadArchivos]),
    S3Module,
    AuthModule,
    UserModule,
  ],
  controllers: [DocumentosController, S3Controller, AuthController, AvisoPrivacidadController],
  providers: [DocumentosService, S3Service, AuthService, UserService, JwtService, AvisoPrivacidadService],
})
export class AppModule { }
