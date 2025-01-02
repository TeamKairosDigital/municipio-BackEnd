import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiResponse } from 'src/models/ApiResponse';
import { LoginDto } from 'src/models/dto/LoginDto';
import { UserDataDto } from 'src/models/dto/UserDataDto';
import { AuthService } from 'src/services/auth.service';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService
    ) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<ApiResponse<UserDataDto>> {
        return await this.authService.validateUser(loginDto.username, loginDto.password);
    }

}
