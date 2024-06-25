import { IsBoolean, IsNotEmpty } from "class-validator";

export class ChangeStatusAuthorDto {

    @IsBoolean()
    @IsNotEmpty()
    readonly status: boolean;

}
