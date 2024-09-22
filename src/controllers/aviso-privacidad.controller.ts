import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Post, Put, Res } from '@nestjs/common';
import { ApiResponse } from 'src/models/ApiResponse';
import { createAvisoPrivacidadArchivoDto } from 'src/models/dto/createAvisoPrivacidadArchivoDto';
import { createAvisoPrivacidadDto } from 'src/models/dto/createAvisoPrivacidadDto';
import { filterAvisoPrivacidadDto } from 'src/models/dto/filterAvisoPrivacidadDto';
import { AvisoPrivacidadService } from 'src/services/aviso-privacidad.service';

@Controller('aviso-privacidad')
export class AvisoPrivacidadController {

    constructor(
        private avisoPrivaciadService: AvisoPrivacidadService
    ) { }

    @Post('getListAvisoPrivacidad')
    async getListAvisoPrivacidad(@Body() data: filterAvisoPrivacidadDto): Promise<ApiResponse<any[]>> {

        const list = await this.avisoPrivaciadService.getListAvisoPrivacidad(data);

        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: 'Documents retrieved successfully',
            data: list
        };
    }

    @Post('createAvisoPrivacidad')
    async createAvisoPrivacidad(@Body() data: createAvisoPrivacidadDto): Promise<ApiResponse<any>> {

        const result = await this.avisoPrivaciadService.createAvisoPrivacidad(data);

        return {
            success: true,
            statusCode: HttpStatus.CREATED,
            message: 'Aviso de privacidad creado correctamente',
            data: result
        };

    }

    @Put('editAvisoPrivacidad')
    async editAvisoPrivacidad(@Body() data: createAvisoPrivacidadDto): Promise<ApiResponse<any>> {

        const result = await this.avisoPrivaciadService.editAvisoPrivacidad(data);

        return {
            success: true,
            statusCode: HttpStatus.CREATED,
            message: 'Aviso de privacidad editado correctamente',
            data: result
        };

    }


    @Delete('deleteAvisoPrivacidad:id')
    async deleteDocument(@Param('id', ParseIntPipe) id: number, @Res() res): Promise<ApiResponse<void>> {

        try {
            await this.avisoPrivaciadService.deleteAvisoPrivacidad(id);
            return res.status(HttpStatus.OK).json({
                success: true,
                statusCode: HttpStatus.OK,
                message: 'Documento y archivo eliminados exitosamente',
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error al eliminar documento y archivo',
                errors: error.message,
            });
        }

    }


    @Post('createAvisoPrivacidadArchivo')
    async createAvisoPrivacidadArchivo(@Body() data: createAvisoPrivacidadArchivoDto): Promise<ApiResponse<any>> {

        const result = await this.avisoPrivaciadService.createAvisoPrivacidadArchivo(data);

        return {
            success: true,
            statusCode: HttpStatus.CREATED,
            message: 'Aviso de privacidad creado correctamente',
            data: result
        };

    }


    @Put('editAvisoPrivacidadArchivo')
    async editAvisoPrivacidadArchivo(@Body() data: createAvisoPrivacidadArchivoDto): Promise<ApiResponse<any>> {

        const result = await this.avisoPrivaciadService.editAvisoPrivacidadArchivo(data);

        return {
            success: true,
            statusCode: HttpStatus.CREATED,
            message: 'Aviso de privacidad editado correctamente',
            data: result
        };

    }


    @Delete('deleteAvisoPrivacidadArchivo:id')
    async deleteAvisoPrivacidadArchivo(@Param('id', ParseIntPipe) id: number, @Res() res): Promise<ApiResponse<void>> {

        try {
            await this.avisoPrivaciadService.deleteAvisoPrivacidadArchivo(id);
            return res.status(HttpStatus.OK).json({
                success: true,
                statusCode: HttpStatus.OK,
                message: 'Documento y archivo eliminados exitosamente',
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error al eliminar documento y archivo',
                errors: error.message,
            });
        }

    }

}
