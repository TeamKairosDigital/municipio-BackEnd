import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { avisoPrivacidad } from './entities/avisoPrivacidad.entity';
import { avisoPrivacidadArchivos } from './entities/avisoPrivacidadArchivos.entity';
import { AvisoPrivacidadController } from './aviso-privacidad.controller';
import { AvisoPrivacidadService } from './aviso-privacidad.service';
import { S3Module } from 'src/s3/s3.module';
import { AuthModule } from 'src/auth/auth.module';
import { transparenciaOtrosDocumentos } from './entities/transparenciaOtrosDocumentos.entity';

@Module({
    imports: [TypeOrmModule.forFeature([avisoPrivacidad, avisoPrivacidadArchivos, transparenciaOtrosDocumentos]), 
    forwardRef(() => S3Module),
    forwardRef(() => AuthModule),
],
    controllers: [AvisoPrivacidadController],
    providers: [AvisoPrivacidadService],
    exports: [AvisoPrivacidadService,TypeOrmModule]
})
export class AvisoPrivacidadModule {}
