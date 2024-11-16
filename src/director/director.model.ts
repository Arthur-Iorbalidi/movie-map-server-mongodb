import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type DirectorDocument = HydratedDocument<Director>;

@Schema()
export class Director {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surname: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  birthday: string;

  @Prop({ required: false })
  dateOfDeath: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: true })
  placeOfBirth: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Movie' })
  movies: mongoose.Types.ObjectId[];
}

export const DirectorSchema = SchemaFactory.createForClass(Director);