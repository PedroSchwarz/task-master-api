import { Controller, Get, Request, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDocument } from './schemas/user.schema';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getAll(@Request() req): Promise<UserDocument[]> {
        return this.usersService.findAll(req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getById(@Param('id') id: string): Promise<UserDocument> {
        return this.usersService.findOneById(id);
    }
}
