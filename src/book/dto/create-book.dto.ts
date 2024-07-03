import { IsArray, IsDate, IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

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

    @IsNumber()
    @IsNotEmpty()
    readonly pages: number;

    @IsString()
    @IsNotEmpty()
    readonly releaseDate: Date;

    @IsArray()
    @IsNotEmpty()
    readonly genres: number[];

}
