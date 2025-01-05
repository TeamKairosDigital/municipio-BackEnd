import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosController } from './controllers/documentos.controller';
import { DocumentosService } from './services/documentos.service';
import { Documentos } from './models/documentos.entity';
import { Archivos } from './models/archivos.entity';
import { S3Module } from './modulos/s3/s3.module';
import { S3Service } from './services/s3.service';
import { S3Controller } from './controllers/s3.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { ObrasService } from './services/obras.service';
import { ObrasController } from './controllers/obras.controller';
import { Obras } from './models/obras.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que ConfigService esté disponible globalmente
      envFilePath: '.env',
      // envFilePath: __dirname + '../../../.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Desactivar sincronización en producción
        // extra: {
        //   trustServerCertificate: false,
        // },
      }),
      inject: [ConfigService],

    }),

    TypeOrmModule.forFeature([Documentos, Archivos, Periodos, Users, Municipality, avisoPrivacidad, avisoPrivacidadArchivos, Obras]),
    S3Module,
    AuthModule,
    UserModule,
  ],
  controllers: [DocumentosController, S3Controller, AuthController, AvisoPrivacidadController, ObrasController],
  providers: [DocumentosService, S3Service, AuthService, UserService, JwtService, AvisoPrivacidadService, ObrasService],
})
export class AppModule { }
