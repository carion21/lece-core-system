import { IsBoolean, IsNotEmpty } from "class-validator";

export class ChangeStatusGenreDto {

    @IsBoolean()
    @IsNotEmpty()
    readonly status: boolean;

}
