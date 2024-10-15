import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateObrasDto } from 'src/models/dto/obrasDto';
import { Obras } from 'src/models/obras.entity';
import { ObrasService } from 'src/services/obras.service';

@Controller('obras')
export class ObrasController {

    constructor(private readonly obrasService: ObrasService) {}

    @Post()
    create(@Body() createObrasDto: CreateObrasDto): Promise<Obras> {
      return this.obrasService.create(createObrasDto);
    }
  
    @Get()
    findAll(): Promise<Obras[]> {
      return this.obrasService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: number): Promise<Obras> {
      return this.obrasService.findOne(id);
    }
  
    @Put(':id')
    update(@Param('id') id: number, @Body() updateObrasDto: CreateObrasDto): Promise<Obras> {
      return this.obrasService.update(id, updateObrasDto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: number): Promise<void> {
      return this.obrasService.remove(id);
    }

}
