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

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<User>,
    @InjectModel(Movie.name) private movieRepository: Model<Movie>,
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

      const passwordEquals = await bcrypt.compare(dto.oldPassword, user.password);

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
      const existingUser = await this.userRepository.findOne({ email: dto.email });

      if (existingUser) {
        throw new ConflictException({ message: 'Email is already taken' });
      }
    }

    const updatedUserEntity = await this.userRepository.findOneAndUpdate(
      { _id: id },
      { $set: updatedUser },
      { new: true }
    );

    const payload = { email: updatedUserEntity.email, id: updatedUserEntity._id };

    const newToken = this.jwtService.sign(payload);

    return { user: user, token: newToken };
  }

  async addMovieToFavorites(userId: string, movieId: string) {
    if (!userId || !movieId) {
      throw new BadRequestException('userId or movieId not provided');
    }

    const user = await this.userRepository.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    const movie = await this.movieRepository.findOne({ _id: new mongoose.Types.ObjectId(movieId) });

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

    const user = await this.userRepository.findOne({ _id: new mongoose.Types.ObjectId(userId) });

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
      throw new NotFoundException('Movie not found in user\'s favorites');
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
}
