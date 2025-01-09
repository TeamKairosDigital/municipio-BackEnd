import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipality } from 'src/users/entities/Municipality.entity';
import { UserService } from 'src/users/user.service';
import { Users } from './entities/users.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([Users, Municipality]), forwardRef(() => AuthModule),],
    controllers: [],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule { }