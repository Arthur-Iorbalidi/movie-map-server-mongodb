import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type MovieDocument = HydratedDocument<Movie>;

@Schema()
export class Movie {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  creationDate: string;

  @Prop({ required: true })
  genre: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: true })
  budget: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Actor' })
  actors: mongoose.Types.ObjectId[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Director' })
  directors: mongoose.Types.ObjectId[];
}

export const MovieSchema = SchemaFactory.createForClass(Movie);