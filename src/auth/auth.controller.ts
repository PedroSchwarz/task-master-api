import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import RegisterDto from './dto/register.dto';
import LoginDto from './dto/login.dto';
import CredentialsDto from './dto/credentials.dto';
import { AuthGuard } from './guards/auth.guard';
import RefreshTokenDto from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<CredentialsDto> {
        return await this.authService.register(registerDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() loginDto: LoginDto): Promise<CredentialsDto> {
        return await this.authService.login(loginDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh-token')
    async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<CredentialsDto> {
        return await this.authService.refreshAccessToken(refreshTokenDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('sign-out')
    async signOut(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ message: string }> {
        await this.authService.revokeRefreshToken(refreshTokenDto.refresh_token);
        return { message: 'Logged out successfully' };
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
