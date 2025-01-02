import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module'; // Asegúrate de ajustar la ruta
import { AuthService } from 'src/services/auth.service';
import { AuthController } from 'src/controllers/auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
      UserModule,
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [JwtModule, AuthService],
})
export class AuthModule { }
