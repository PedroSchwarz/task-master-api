import { Body, Controller, Delete, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CommentsService } from './comments.service';
import { CommentDocument } from './schema/comment.schema';
import CreateCommentDto from './dto/create_comment.dto';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @UseGuards(AuthGuard)
    @Get('/task/:taskId')
    async getAllForTask(@Param('taskId') taskId: string): Promise<CommentDocument[]> {
        return this.commentsService.getAllForTask(taskId);
    }

    @UseGuards(AuthGuard)
    @Post()
    async createComment(@Request() req, @Body() createCommentDto: CreateCommentDto): Promise<void> {
        return this.commentsService.create(req.user.sub, createCommentDto);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async deleteComment(@Param('id') id: string): Promise<void> {
        return this.commentsService.delete(id);
    }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteAll(): Promise<void> {
        return this.commentsService.deleteAll();
    }
}
