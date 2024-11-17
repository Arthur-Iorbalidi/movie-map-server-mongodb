import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateActorDto } from './dto/create-actor.dto';
import { FilesService } from 'src/files/files.service';
import { InjectModel } from '@nestjs/mongoose';
import { Actor } from './actor.model';
import { Model } from 'mongoose';

interface GetAllActorsOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: string;
}

@Injectable()
export class ActorService {
  constructor(
    @InjectModel(Actor.name) private actorRepository: Model<Actor>,
    private fileService: FilesService,
  ) {}

  async createActor(dto: CreateActorDto, image?: any) {
    let fileName: string | null = null;

    if (image) {
      fileName = await this.fileService.createImage(image);
    }

    const actor = await this.actorRepository.create({
      ...dto,
      image: fileName,
    });

    return actor;
  }

  async getAll(options: GetAllActorsOptions) {
    const {
      page = 1,
      limit = 3,
      sortBy = 'name',
      sortOrder = 'ASC',
      search,
      filters,
    } = options;

    const offset = (page - 1) * limit;

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { surname: { $regex: search, $options: 'i' } },
        { placeOfBirth: { $regex: search, $options: 'i' } },
      ];
    }

    if (filters) {
      const parsedFilters = JSON.parse(filters);

      if (
        parsedFilters.heightMin !== undefined ||
        parsedFilters.heightMax !== undefined
      ) {
        query.height = {};
        if (parsedFilters.heightMin !== undefined)
          query.height.$gte = parsedFilters.heightMin;
        if (parsedFilters.heightMax !== undefined)
          query.height.$lte = parsedFilters.heightMax;
      }

      if (parsedFilters.birthdayMin || parsedFilters.birthdayMax) {
        query.birthday = {};
        if (parsedFilters.birthdayMin)
          query.birthday.$gte = new Date(parsedFilters.birthdayMin);
        if (parsedFilters.birthdayMax)
          query.birthday.$lte = new Date(parsedFilters.birthdayMax);
      }
    }

    const [actors, total] = await Promise.all([
      this.actorRepository
        .find(query)
        .populate('movies')
        .skip(offset)
        .limit(limit)
        .sort({ [sortBy]: sortOrder === 'ASC' ? 1 : -1 }),
      this.actorRepository.countDocuments(query),
    ]);

    return {
      data: actors,
      pagination: {
        total,
        current_page: Number(page),
        limit: Number(limit),
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const actor = await this.actorRepository
      .findOne({ _id: id })
      .populate('movies');

    if (!actor) {
      throw new NotFoundException(`Actor not found`);
    }

    return actor;
  }
}
