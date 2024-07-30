import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateBookSubmissionDto {

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    readonly phone: string;

    @IsString()
    @IsNotEmpty()
    readonly title: string;

    @IsString()
    @IsNotEmpty()
    readonly summary: string;
}
