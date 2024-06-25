import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateBookDto {

    @IsNumber()
    @IsNotEmpty()
    readonly authorId: number;

    @IsString()
    @IsNotEmpty()
    readonly title: string;

    @IsString()
    @IsNotEmpty()
    readonly summary: string;

    @IsArray()
    @IsNotEmpty()
    readonly genres: number[];

}
