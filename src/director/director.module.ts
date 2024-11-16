import { Module } from '@nestjs/common';
import { DirectorService } from './director.service';
import { DirectorController } from './director.controller';
import { Director, DirectorSchema } from './director.model';
import { FilesModule } from 'src/files/files.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [DirectorController],
  providers: [DirectorService],
  imports: [
    MongooseModule.forFeature([{ name: Director.name, schema: DirectorSchema }]),
    FilesModule,
  ],
  exports: [DirectorService],
})
export class DirectorModule {}
