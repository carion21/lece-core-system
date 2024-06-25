import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateSubscriberDto {

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

}
