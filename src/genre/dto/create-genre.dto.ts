import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateGenreDto {

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    readonly description: string;

}
