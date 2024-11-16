export class CreateMovieDto {
  readonly title: string;
  readonly description?: string;
  readonly creationDate: string;
  readonly genre: string;
  readonly budget: string;
}
