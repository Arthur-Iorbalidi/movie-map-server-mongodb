import { Module } from '@nestjs/common';
import { ActorService } from './actor.service';
import { ActorController } from './actor.controller';
import { Actor, ActorSchema } from './actor.model';
import { FilesModule } from 'src/files/files.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [ActorController],
  providers: [ActorService],
  imports: [
    MongooseModule.forFeature([{ name: Actor.name, schema: ActorSchema }]),
    FilesModule,
  ],
  exports: [ActorService],
})
export class ActorModule {}
