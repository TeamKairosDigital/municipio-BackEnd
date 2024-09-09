import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipality } from 'src/models/Municipality.entity';
import { Users } from 'src/models/users.entity';
import { UserService } from 'src/services/user.service';

@Module({
    imports: [TypeOrmModule.forFeature([Users, Municipality])],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule { }
