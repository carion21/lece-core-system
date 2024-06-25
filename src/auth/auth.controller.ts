import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SignInDto } from './dto/sign-in.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { applyRbac } from 'utilities/functions';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { Request } from 'express';

@ApiTags("Authentification et autorisation")
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() request: Request) {
    let userAuthenticated = request['user'];
    applyRbac(userAuthenticated, 'change_password');
    let userId = userAuthenticated['id'];

    return this.authService.changePassword(changePasswordDto, userAuthenticated);
  }
}
