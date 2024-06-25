import { IsBoolean, IsNotEmpty } from "class-validator";

export class ChangeStatusBookDto {

    @IsBoolean()
    @IsNotEmpty()
    readonly status: boolean;

}
