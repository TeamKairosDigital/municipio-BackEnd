import { Body, Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiResponse } from 'src/models/ApiResponse';
import { filterAvisoPrivacidadDto } from 'src/models/dto/filterAvisoPrivacidadDto';
import { AvisoPrivacidadService } from 'src/services/aviso-privacidad.service';

@Controller('aviso-privacidad')
export class AvisoPrivacidadController {

    constructor(
        private avisoPrivaciadService: AvisoPrivacidadService
    ) { }

    @Get('getListAvisoPrivacidad')
    async getListAvisoPrivacidad(@Body() data: filterAvisoPrivacidadDto): Promise<ApiResponse<any[]>> {

        const list = await this.avisoPrivaciadService.getListAvisoPrivacidad(data);

        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: 'Documents retrieved successfully',
            data: list
        };
    }
}
