import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UpdateAdminDto {

    @IsString()
    @IsNotEmpty()
    readonly lastname: string;

    @IsString()
    @IsNotEmpty()
    readonly firstname: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsString()
    readonly phone: string;

}
