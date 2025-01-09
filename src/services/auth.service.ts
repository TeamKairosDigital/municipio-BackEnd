import { HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/models/dto/LoginDto';
import { UserService } from './user.service';
import { UserDataDto } from 'src/models/dto/UserDataDto';
import * as bcrypt from 'bcrypt';
import { ApiResponse } from 'src/models/response/ApiResponse';
import { JwtStrategy } from 'src/modulos/auth/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { createApiResponse } from 'src/models/response/createApiResponse';

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        private usersService: UserService,
        private readonly configService: ConfigService,
    ) { }

    // LOGIN
    // async validateUser(username: string, password: string): Promise<ApiResponse<UserDataDto>> {
    //     // Buscar el usuario por nombre de usuario
    //     const user = await this.usersService.findByUsername(username, ['municipality']);
    //     if (!user) {
    //       return createApiResponse(false, 'Usuario no encontrado', null, null, HttpStatus.NOT_FOUND);
    //     }
      
    //     // Verificar la contraseña
    //     const isPasswordValid = await bcrypt.compare(password, user.Pass);
    //     if (!isPasswordValid) {
    //       return createApiResponse(false, 'Contraseña incorrecta', null, null, HttpStatus.UNAUTHORIZED);
    //     }
      
    //     // Crear el DTO del usuario con la información necesaria
    //     const userDataDto = new UserDataDto();
    //     userDataDto.id = user.id;
    //     userDataDto.username = user.UserName;
    //     userDataDto.nombre = user.Nombre;
    //     userDataDto.mombreMunicipio = user.municipality?.NombreMunicipio || null;
    //     userDataDto.municipality_id = user.municipality?.id || null;
    //     userDataDto.access_token = await this.generateJwtToken(userDataDto.id);
      
    //     // Devolver respuesta de éxito
    //     return createApiResponse(true, 'Usuario autenticado correctamente', userDataDto, null, HttpStatus.OK);
      
    // }
    async validateUser(username: string, password: string): Promise<ApiResponse<UserDataDto>> {

        const user = await this.usersService.findByUsername(username, ['municipality']);
        if (!user) {
            // Lanzar excepción 404 si el usuario no se encuentra
            throw new NotFoundException('Usuario no encontrado');
        }
    
        const isPasswordValid = await bcrypt.compare(password, user.Pass);
        if (!isPasswordValid) {
            // Lanzar excepción 401 si la contraseña es incorrecta
            throw new UnauthorizedException('Contraseña incorrecta');
        }
    
        const userDataDto = new UserDataDto();
        userDataDto.id = user.id;
        userDataDto.username = user.UserName;
        userDataDto.nombre = user.Nombre;
        userDataDto.mombreMunicipio = user.municipality?.NombreMunicipio || null;
        userDataDto.municipality_id = user.municipality?.id || null;
        userDataDto.access_token = await this.generateJwtToken(userDataDto.id);
    
        // Devolver la respuesta de éxito
        return createApiResponse(true, 'Usuario autenticado correctamente', userDataDto, null, HttpStatus.OK);
    }
    
      
    
    //GENERATE JWT TOKEN
    async generateJwtToken(userId: number): Promise<string> {

        const secret = this.configService.get<string>('JWT_SECRET');
        return this.jwtService.signAsync(
            { userId },
            { secret, expiresIn: '1h' },
        );

    }

}
