import { Injectable, NotFoundException } from '@nestjs/common';
import { Movie } from './movie.model';
import { CreateMovieDto } from './dto/create-movie.dto';
import { FilesService } from 'src/files/files.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface GetAllMoviesOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private movieRepository: Model<Movie>,
    private fileService: FilesService,
  ) {}

  async createMovie(dto: CreateMovieDto, image?: any) {
    let fileName: string | null = null;

    if (image) {
      fileName = await this.fileService.createImage(image);
    }

    const movie = await this.movieRepository.create({
      ...dto,
      image: fileName,
    });

    return movie;
  }

  async getAllMovies(options: GetAllMoviesOptions) {
    const {
      page = 1,
      limit = 3,
      sortBy = 'title',
      sortOrder = 'ASC',
      search,
    } = options;

    const skip = (page - 1) * limit;
    const sortOrderValue = sortOrder === 'ASC' ? 1 : -1;

    const searchFilter: any = {};

    if (search) {
      searchFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
      ];
    }

    const movies = await this.movieRepository
      .find(searchFilter)
      .populate('directors')
      .populate('actors')
      .sort({ [sortBy]: sortOrderValue })
      .skip(skip)
      .limit(limit);

    const total = await this.movieRepository.countDocuments(searchFilter);

    return {
      data: movies,
      pagination: {
        total,
        current_page: page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getMovieById(id: string) {
    const movie = await this.movieRepository
      .findOne({ _id: id })
      .populate('directors')
      .populate('actors');

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return movie;
  }
}
