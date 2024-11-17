import { Injectable, NotFoundException } from '@nestjs/common';
import { Director } from './director.model';
import { CreateDirectorDto } from './dto/create-director.dto';
import { FilesService } from 'src/files/files.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

interface GetAllDirectorsOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

@Injectable()
export class DirectorService {
  constructor(
    @InjectModel(Director.name) private directorRepository: Model<Director>,
    private fileService: FilesService,
  ) {}

  async createDirector(dto: CreateDirectorDto, image?: any) {
    let fileName: string | null = null;

    if (image) {
      fileName = await this.fileService.createImage(image);
    }

    const director = await this.directorRepository.create({
      ...dto,
      image: fileName,
    });

    return director;
  }

  async getAll(options: GetAllDirectorsOptions) {
    const {
      page = 1,
      limit = 3,
      sortBy = 'name',
      sortOrder = 'ASC',
      search,
    } = options;

    const offset = (page - 1) * limit;
    const sortOrderValue = sortOrder === 'ASC' ? 1 : -1;

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { surname: { $regex: search, $options: 'i' } },
        { placeOfBirth: { $regex: search, $options: 'i' } },
      ];
    }

    const directors = await this.directorRepository
      .find(query)
      .populate('movies')
      .sort({ [sortBy]: sortOrderValue })
      .skip(offset)
      .limit(limit);

    const total = await this.directorRepository.countDocuments(query);

    return {
      data: directors,
      pagination: {
        total,
        current_page: Number(page),
        limit: Number(limit),
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const director = await this.directorRepository
      .findOne({ _id: id })
      .populate('movies');

    if (!director) {
      throw new NotFoundException(`Director not found`);
    }

    return director;
  }
}
