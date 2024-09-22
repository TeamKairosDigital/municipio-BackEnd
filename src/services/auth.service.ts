import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/models/dto/LoginDto';
import { UserService } from './user.service';

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        private usersService: UserService
    ) { }

    // async validateUser(username: string, pass: string): Promise<any> {
    //     const user = await this.usersService.findByUsername(username);
    //     if (user && user.Pass === pass) { // Asegúrate de verificar la contraseña correctamente
    //         const { Pass, ...result } = user;
    //         return result;
    //     }
    //     return null;
    // }

    async login(user: any) {
        const payload = { username: user.username, sub: user.userId };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async validateUser(username: string, password: string): Promise<LoginDto | null> {
        // Cargar el usuario y la relación 'municipality'
        const user = await this.usersService.findByUsername(username, ['municipality']);

        if (user && user.Pass === password) {  // Aquí debes usar hashing real en producción
            // Retornamos un LoginDto con la información que queremos exponer
            const loginDto = new LoginDto();
            loginDto.id = user.id;
            loginDto.username = user.UserName;
            loginDto.municipality_id = user.municipality.id;
            return loginDto;

        }
        else {
            return null;
        }

    }

    // async generateJwtToken(user: LoginDto): Promise<string> {
    //     const payload = { username: user.username, sub: user.id };
    //     return this.jwtService.sign(payload); // Aquí generas el JWT
    // }

    async generateJwtToken(userId: number): Promise<string> {
        return this.jwtService.signAsync({ userId }, { secret: 'JWT_SECRET' });
    }



}
