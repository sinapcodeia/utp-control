import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('documents')
@UseGuards(SupabaseGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Get()
  async findAll(@Req() req, @Query('regionId') regionId?: string) {
    return this.documentsService.findAll(req.user, regionId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Post()
  async create(@Req() req, @Body() createDocumentDto: CreateDocumentDto) {
    const uploaderId = req.user.id;
    return this.documentsService.create(uploaderId, createDocumentDto);
  }

  @Post(':id/comments')
  async addComment(
    @Req() req,
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const userId = req.user.id;
    return this.documentsService.addComment(id, userId, createCommentDto);
  }
}
