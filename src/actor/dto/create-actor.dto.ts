export class CreateActorDto {
  readonly name: string;
  readonly surname: string;
  readonly description?: string;
  readonly height: number;
  readonly birthday: string;
  readonly dateOfDeath?: string;
  readonly image?: string;
  readonly placeOfBirth: string;
}
