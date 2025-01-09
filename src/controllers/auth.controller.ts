import { Body, Controller, HttpException, HttpStatus, Post, UnauthorizedException } from '@nestjs/common';
import { ApiResponse } from 'src/models/response/ApiResponse';
import { LoginDto } from 'src/models/dto/LoginDto';
import { UserDataDto } from 'src/models/dto/UserDataDto';
import { AuthService } from 'src/services/auth.service';
import { createApiResponse } from 'src/models/response/createApiResponse';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService
    ) { }

    // LOGIN
    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<ApiResponse<UserDataDto>> {
        try {
            const response = await this.authService.validateUser(
                loginDto.username,
                loginDto.password,
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


