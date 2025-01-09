import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from './s3/s3.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { JwtService } from '@nestjs/jwt';
import { AvisoPrivacidadModule } from './aviso-privacidad/aviso-privacidad.module';
import { ObrasModule } from './obras/obras.module';
import { DocumentosModule } from './documentos/documentos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que ConfigService esté disponible globalmente
      envFilePath: '.env',
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
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    AvisoPrivacidadModule,
    DocumentosModule,
    ObrasModule,
    S3Module,
    UserModule
  ],
  controllers: [],
  providers: [JwtService],
})
export class AppModule { }
