import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDocument } from './schemas/user.schema';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async getAll(): Promise<Omit<UserDocument[], 'password'>> {
        return this.usersService.findAll();
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<Omit<UserDocument, 'password'>> {
        return this.usersService.findOneById(id);
    }
}
