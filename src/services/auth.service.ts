import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/models/dto/LoginDto';
import { UserService } from './user.service';
import { UserDataDto } from 'src/models/dto/UserDataDto';
import * as bcrypt from 'bcrypt';
import { ApiResponse } from 'src/models/ApiResponse';
import { JwtStrategy } from 'src/modulos/auth/jwt.strategy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        private usersService: UserService,
        private readonly configService: ConfigService,
    ) { }

    // async validateUser(username: string, pass: string): Promise<any> {
    //     const user = await this.usersService.findByUsername(username);
    //     if (user && user.Pass === pass) { // Asegúrate de verificar la contraseña correctamente
    //         const { Pass, ...result } = user;
    //         return result;
    //     }
    //     return null;
    // }

    // async login(user: any) {
    //     const payload = { username: user.username, sub: user.userId };
    //     return {
    //         access_token: this.jwtService.sign(payload),
    //     };
    // }

    async validateUser(username: string, password: string): Promise<ApiResponse<UserDataDto> | null> {

        const response = new ApiResponse<UserDataDto>();
        // Cargar el usuario y la relación 'municipality'
        const user = await this.usersService.findByUsername(username, ['municipality']);

        if (!user) {
            response.success = false;
            response.message = 'Usuario no encontrado';
            response.data = null;
            return response;
        }
        
        // Validar la contraseña (usa bcrypt para comparar el hash)
        const isPasswordValid = await bcrypt.compare(password, user.Pass);
        if (!isPasswordValid) {
            response.success = false;
            response.message = 'Contraseña incorrecta';
            response.data = null;
            return response;
        }
        
        // Crear el DTO para exponer la información del usuario
        const userDataDto = new UserDataDto();
        userDataDto.id = user.id;
        userDataDto.username = user.UserName;
        userDataDto.nombre = user.Nombre;
        userDataDto.mombreMunicipio = user.municipality?.NombreMunicipio || null;
        userDataDto.municipality_id = user.municipality?.id || null;
    
        // Generar el JWT
        // const payload = { username: userDataDto.username, sub: userDataDto.id };
        // userDataDto.access_token = this.jwtService.sign(payload); // Usamos JwtService aquí

        const token = await this.generateJwtToken(userDataDto.id);
        userDataDto.access_token = token;

        response.success = true;
        response.message = 'Usuario autenticado correctamente';
        response.data = userDataDto;
    
        return response;
    }

    // Generar token o similar
    // const token = this.authService.generateJwtToken(user.id);

    // return {
    //     user,
    //     token
    // };

    // async generateJwtToken(user: LoginDto): Promise<string> {
    //     const payload = { username: user.username, sub: user.id };
    //     return this.jwtService.sign(payload); // Aquí generas el JWT
    // }

    async generateJwtToken(userId: number): Promise<string> {
        const secret = this.configService.get<string>('JWT_SECRET');
        return this.jwtService.signAsync({ userId }, { secret: secret });
    }



}
