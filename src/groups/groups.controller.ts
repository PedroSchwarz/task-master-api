import { Controller, Get, UseGuards, Request, Body, Post, Delete, Param } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupDocument } from './schemas/group.schema';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import CreateGroupDto from './dto/create_group.dto';

@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getAllForUser(@Request() req): Promise<GroupDocument[]> {
        return this.groupsService.getAllForUser(req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Get('all')
    async getAll(): Promise<GroupDocument[]> {
        return this.groupsService.getAll();
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getById(@Param('id') id: string): Promise<GroupDocument> {
        return this.groupsService.getById(id);
    }

    @UseGuards(AuthGuard)
    @Post()
    async create(@Request() req, @Body() createGroupDto: CreateGroupDto): Promise<string> {
        return this.groupsService.create(req.user.sub, createGroupDto);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<void> {
        return this.groupsService.delete(id);
    }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteAll(): Promise<void> {
        return this.groupsService.deleteAll();
    }
}
