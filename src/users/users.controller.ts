import { Controller, Get, Request, Param, UseGuards, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDocument } from './schemas/user.schema';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getAllForUser(@Request() req): Promise<UserDocument[]> {
        return this.usersService.findAllForUser(req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Get('all')
    async getAll(): Promise<UserDocument[]> {
        return this.usersService.findAll();
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getById(@Param('id') id: string): Promise<UserDocument> {
        return this.usersService.findOneById(id);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<void> {
        return this.usersService.delete(id);
    }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteAll(): Promise<void> {
        return this.usersService.deleteAll();
    }
}
