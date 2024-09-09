import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from 'src/models/dto/LoginDto';
import { AuthService } from 'src/services/auth.service';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService
    ) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<any> {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generar token o similar
        const token = this.authService.generateJwtToken(user.id);

        return {
            user,
            token
        };
    }

}
