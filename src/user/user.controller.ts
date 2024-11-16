import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './user.model';
import { JwtAuthGuard } from 'src/Guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Getting Users' })
  @ApiResponse({ status: 200, type: User })
  @Get()
  getAll() {
    return this.userService.getAllUsers();
  }

  @ApiOperation({ summary: 'Getting User by id' })
  @ApiResponse({ status: 200, type: User })
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @ApiOperation({ summary: 'User creation' })
  @ApiResponse({ status: 201, type: User })
  @Post()
  createUser(@Body() userDto: CreateUserDto) {
    return this.userService.createUser(userDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    const userId = req.user.id;

    if (userId !== id) {
      throw new ForbiddenException('You can update only your own profile');
    }

    return this.userService.updateUser(userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorites/movie/:id')
  addFavoriteMovie(@Req() req, @Param('id') id: string) {
    const userId: string = req.user.id;

    return this.userService.addMovieToFavorites(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('favorites/movie/:id')
  removeFavoriteMovie(@Req() req, @Param('id') id: string) {
    const userId: string = req.user.id;

    return this.userService.removeMovieFromFavorites(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites/movies')
  getFavoritesMovies(@Req() req) {
    const userId: string = req.user.id;

    return this.userService.getFavoritesMovies(userId);
  }
}
