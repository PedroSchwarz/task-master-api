import { Controller, Get, UseGuards, Request, Body, Post, Delete } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupDocument } from './schemas/group.schema';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import CreateGroupDto from './dto/create_group.dto';

@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getAll(@Request() req): Promise<GroupDocument[]> {
        return this.groupsService.getAllForUser(req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Post()
    async create(@Request() req, @Body() createGroupDto: CreateGroupDto): Promise<GroupDocument> {
        return this.groupsService.create(req.user.sub, createGroupDto);
    }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteAll(): Promise<GroupDocument> {
        return this.groupsService.deleteAll();
    }
}
