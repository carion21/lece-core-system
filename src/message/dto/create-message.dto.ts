import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateMessageDto {

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    readonly subject: string;

    @IsString()
    @IsNotEmpty()
    readonly content: string;

}
