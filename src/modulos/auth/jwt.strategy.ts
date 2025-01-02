import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private jwtService: JwtService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        // Aquí puedes realizar validaciones adicionales si es necesario.
            // Validaciones adicionales (por ejemplo, verificar si el usuario está activo)
        const user = await this.userService.findByUsername(payload.sub);
        if (!user) {
            throw new UnauthorizedException('Usuario no autorizado');
        }

        // Retornar datos útiles para la solicitud
        return { userId: payload.sub, username: payload.username};
    }
}

