import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/constants/jwt.strategy';
import { UserModule } from '../users/user.module'; // Asegúrate de ajustar la ruta
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AvisoPrivacidadModule } from 'src/aviso-privacidad/aviso-privacidad.module';
import { DocumentosModule } from 'src/documentos/documentos.module';
import { ObrasModule } from 'src/obras/obras.module';

@Module({
    imports: [
      ConfigModule.forRoot({
          isGlobal: true, // Asegura que las variables de entorno estén disponibles globalmente
      }),
      PassportModule,
      JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => {
              const secret = configService.get<string>('JWT_SECRET');
              return {
                  secret,
                  signOptions: { expiresIn: '1h' },
              };
          },
          inject: [ConfigService],
      }),
      forwardRef(() => UserModule),
      forwardRef(() => AvisoPrivacidadModule),
      forwardRef(() => DocumentosModule),
      forwardRef(() => ObrasModule),
    ],
    providers: [AuthService, JwtStrategy, AuthGuard],
    controllers: [AuthController],
    exports: [JwtModule, AuthService]
})
export class AuthModule { }
