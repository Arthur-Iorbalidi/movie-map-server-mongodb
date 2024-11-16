import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { Movie, MovieSchema } from './movie.model';
import { FilesModule } from 'src/files/files.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Actor, ActorSchema } from 'src/actor/actor.model';
import { Director, DirectorSchema } from 'src/director/director.model';

@Module({
  controllers: [MovieController],
  providers: [MovieService],
  imports: [
    MongooseModule.forFeature([
      { name: Movie.name, schema: MovieSchema },
      { name: Actor.name, schema: ActorSchema },
      { name: Director.name, schema: DirectorSchema },
    ]),
    FilesModule,
  ],
  exports: [MovieService],
})
export class MovieModule {}
