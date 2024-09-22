import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/models/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(Users)
        private readonly UsersRepository: Repository<Users>,
    ) { }

    // Método para encontrar un usuario por su nombre de usuario
    async findByUsername(UserName: string, relations: string[] = []): Promise<Users | undefined> {
        try {
            const user = await this.UsersRepository.findOne({
                where: { UserName: UserName },
                relations: relations.length > 0 ? relations : undefined,  // Cargar las relaciones necesarias
            });
            if (!user) {
                console.warn(`No user found with username: ${UserName}`);
            }
            return user;
        } catch (error) {
            console.error('Error finding user by username:', error);
            throw error;
        }
    }

    // async findById(userId: number): Promise<any> {
    //     return this.usersMunicipalityRepository.find(user => user.Id === userId);
    // }

}
