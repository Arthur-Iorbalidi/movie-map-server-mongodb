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
import { DirectorService } from './director.service';
import { CreateDirectorDto } from './dto/create-director.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('directors')
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  @Get()
  getAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
  ) {
    return this.directorService.getAll({
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    });
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.directorService.getById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  createDirector(
    @Body() directorDto: CreateDirectorDto,
    @UploadedFile() image?,
  ) {
    return this.directorService.createDirector(directorDto, image);
  }
}
