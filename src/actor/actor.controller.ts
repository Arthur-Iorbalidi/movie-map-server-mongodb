import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ActorService } from './actor.service';
import { CreateActorDto } from './dto/create-actor.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('actors')
export class ActorController {
  constructor(private readonly actorService: ActorService) {}

  @Get()
  getAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('filters') filters?: string,
  ) {
    return this.actorService.getAll({
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      filters,
    });
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.actorService.getById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  createActor(@Body() actorDto: CreateActorDto, @UploadedFile() image?) {
    return this.actorService.createActor(actorDto, image);
  }
}
