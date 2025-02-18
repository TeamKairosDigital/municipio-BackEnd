import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Obras } from './entities/obras.entity';
import { ObrasController } from './obras.controller';
import { ObrasService } from './obras.service';
import { S3Module } from 'src/s3/s3.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Obras]),
        forwardRef(() => S3Module),
        forwardRef(() => AuthModule),
    ],
    controllers: [ObrasController],
    providers: [ObrasService],
    exports: [ObrasService, TypeOrmModule]
})
export class ObrasModule {}
