import { IsBoolean, IsNotEmpty } from "class-validator";

export class ChangeStatusAdminDto {

    @IsBoolean()
    @IsNotEmpty()
    readonly status: boolean;

}
