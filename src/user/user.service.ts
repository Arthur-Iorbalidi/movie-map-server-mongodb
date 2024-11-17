import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { Movie } from 'src/movie/movie.model';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Actor } from 'src/actor/actor.model';
import { Director } from 'src/director/director.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<User>,
    @InjectModel(Movie.name) private movieRepository: Model<Movie>,
    @InjectModel(Actor.name) private actorRepository: Model<Actor>,
    @InjectModel(Director.name) private directorRepository: Model<Director>,
    private jwtService: JwtService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.userRepository.create(dto);

    return await this.getUserByEmail(user.email);
  }

  async getAllUsers() {
    const users = await this.userRepository.find({}, { password: 0 });

    return users;
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({ _id: id });

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository
      .findOne({ email })
      .populate({
        path: 'movies',
        select: 'id',
      })
      .populate({
        path: 'actors',
        select: 'id',
      })
      .populate({
        path: 'directors',
        select: 'id',
      });

    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const updatedUser = { ...dto };
    const user = await this.getUserById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.password) {
      if (!dto.oldPassword) {
        throw new UnauthorizedException({ message: 'Incorrect password' });
      }

      const passwordEquals = await bcrypt.compare(
        dto.oldPassword,
        user.password,
      );

      if (!passwordEquals) {
        throw new UnauthorizedException({ message: 'Incorrect password' });
      }

      const isSamePassword = await bcrypt.compare(dto.password, user.password);
      if (isSamePassword) {
        throw new ConflictException({
          message: 'New password must be different from the current password',
        });
      }

      const hashPassword = await bcrypt.hash(dto.password, 10);
      updatedUser.password = hashPassword;
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        email: dto.email,
      });

      if (existingUser) {
        throw new ConflictException({ message: 'Email is already taken' });
      }
    }

    const updatedUserEntity = await this.userRepository.findOneAndUpdate(
      { _id: id },
      { $set: updatedUser },
      { new: true },
    );

    const payload = {
      email: updatedUserEntity.email,
      id: updatedUserEntity._id,
    };

    const newToken = this.jwtService.sign(payload);

    return { user: user, token: newToken };
  }

  async addMovieToFavorites(userId: string, movieId: string) {
    if (!userId || !movieId) {
      throw new BadRequestException('userId or movieId not provided');
    }

    const user = await this.userRepository.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    const movie = await this.movieRepository.findOne({
      _id: new mongoose.Types.ObjectId(movieId),
    });

    if (user && movie) {
      if (!user.movies.includes(movie._id)) {
        user.movies.push(movie._id);
        await user.save();
        return { message: 'Movie added to favorites', user };
      } else {
        throw new BadRequestException('Movie already in favorites');
      }
    } else {
      throw new NotFoundException('User or Movie not found');
    }
  }

  async removeMovieFromFavorites(userId: string, movieId: string) {
    if (!userId || !movieId) {
      throw new BadRequestException('userId or movieId not provided');
    }

    const user = await this.userRepository.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const movieObjectId = new mongoose.Types.ObjectId(movieId);

    const movieIndex = user.movies.indexOf(movieObjectId);
    if (movieIndex > -1) {
      user.movies.splice(movieIndex, 1);
      await user.save();
      return { message: 'Movie removed from favorites', user };
    } else {
      throw new NotFoundException("Movie not found in user's favorites");
    }
  }

  async addActorToFavorites(userId: string, actorId: string) {
    if (!userId || !actorId) {
      throw new BadRequestException('userId or actorId not provided');
    }

    const user = await this.userRepository.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    const actor = await this.actorRepository.findOne({
      _id: new mongoose.Types.ObjectId(actorId),
    });

    if (user && actor) {
      if (!user.actors.includes(actor._id)) {
        user.actors.push(actor._id);
        await user.save();
        return { message: 'Actor added to favorites', user };
      } else {
        throw new BadRequestException('Actor already in favorites');
      }
    } else {
      throw new NotFoundException('User or Actor not found');
    }
  }

  async removeActorFromFavorites(userId: string, actorId: string) {
    if (!userId || !actorId) {
      throw new BadRequestException('userId or actorId not provided');
    }

    const user = await this.userRepository.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const actorObjectId = new mongoose.Types.ObjectId(actorId);

    const actorIndex = user.actors.indexOf(actorObjectId);
    if (actorIndex > -1) {
      user.actors.splice(actorIndex, 1);
      await user.save();
      return { message: 'Actor removed from favorites', user };
    } else {
      throw new NotFoundException("Actor not found in user's favorites");
    }
  }

  async addDirectorToFavorites(userId: string, directorId: string) {
    if (!userId || !directorId) {
      throw new BadRequestException('userId or directorId not provided');
    }

    const user = await this.userRepository.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    const director = await this.directorRepository.findOne({
      _id: new mongoose.Types.ObjectId(directorId),
    });

    if (user && director) {
      if (!user.directors.includes(director._id)) {
        user.directors.push(director._id);
        await user.save();
        return { message: 'Director added to favorites', user };
      } else {
        throw new BadRequestException('Director already in favorites');
      }
    } else {
      throw new NotFoundException('User or Movie not found');
    }
  }

  async removeDirectorFromFavorites(userId: string, directorId: string) {
    if (!userId || !directorId) {
      throw new BadRequestException('userId or directorId not provided');
    }

    const user = await this.userRepository.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const directorObjectId = new mongoose.Types.ObjectId(directorId);

    const directorIndex = user.directors.indexOf(directorObjectId);
    if (directorIndex > -1) {
      user.directors.splice(directorIndex, 1);
      await user.save();
      return { message: 'Director removed from favorites', user };
    } else {
      throw new NotFoundException("Director not found in user's favorites");
    }
  }

  async getFavoritesMovies(userId: string) {
    const user = await this.userRepository
      .findOne({ _id: new mongoose.Types.ObjectId(userId) })
      .populate('movies');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.movies;
  }

  async getFavoritesActors(userId: string) {
    const user = await this.userRepository
      .findOne({ _id: new mongoose.Types.ObjectId(userId) })
      .populate('actors');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.actors;
  }

  async getFavoritesDirectors(userId: string) {
    const user = await this.userRepository
      .findOne({ _id: new mongoose.Types.ObjectId(userId) })
      .populate('directors');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.directors;
  }
}
