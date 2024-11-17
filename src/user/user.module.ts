import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './user.model';
import { AuthModule } from 'src/auth/auth.module';
import { MovieModule } from 'src/movie/movie.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from 'src/movie/movie.model';
import { Actor, ActorSchema } from 'src/actor/actor.model';
import { Director, DirectorSchema } from 'src/director/director.model';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Movie.name, schema: MovieSchema },
      { name: Actor.name, schema: ActorSchema },
      { name: Director.name, schema: DirectorSchema },
    ]),
    forwardRef(() => AuthModule),
    MovieModule,
  ],
  exports: [UserService],
})
export class UserModule {}
