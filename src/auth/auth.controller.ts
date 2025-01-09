import { Body, Controller, HttpException, HttpStatus, Param, Post, UnauthorizedException } from '@nestjs/common';
import { ApiResponse } from 'src/common/response/ApiResponse';
import { LoginDto } from 'src/auth/dto/user.dto';
import { UserDataDto } from 'src/users/dto/UserDataDto';
import { createApiResponse } from 'src/common/response/createApiResponse';
import { Login } from 'src/auth/models/login';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService
    ) { }

    // LOGIN
    @Post('login')
    async login(@Body() login: Login): Promise<ApiResponse<UserDataDto>> {
        try {
            const response = await this.authService.validateUser(
                login.username,
                login.password,
            );
    
            if (!response.success) {
                // Si la validación falla, se lanzará una excepción personalizada desde el servicio
                throw new HttpException(
                    response,
                    response.statusCode || HttpStatus.UNAUTHORIZED
                );
            }
    
            return response;
    
        } catch (error) {
            console.error('Error en login:', error);
    
            // Si el error es una instancia de HttpException, lanzarlo tal cual
            if (error instanceof HttpException) {
                throw error;
            }
    
            // Si no es una HttpException, devolver un error genérico
            throw new HttpException(
                createApiResponse(false, 'Error inesperado al autenticar', null, error, HttpStatus.INTERNAL_SERVER_ERROR),
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
    
    


}


