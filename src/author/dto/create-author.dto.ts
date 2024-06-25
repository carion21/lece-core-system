import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateAuthorDto {

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    readonly biography: string;

}
