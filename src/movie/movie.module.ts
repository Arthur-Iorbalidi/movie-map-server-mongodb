import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { Movie, MovieSchema } from './movie.model';
import { FilesModule } from 'src/files/files.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [MovieController],
  providers: [MovieService],
  imports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    FilesModule,
  ],
  exports: [MovieService],
})
export class MovieModule {}
