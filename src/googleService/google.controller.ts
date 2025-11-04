import { Controller, Get, Query } from '@nestjs/common';
import { GoogleService } from './google.service';

@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  // Step 1: Redirect user to Google
  @Get('auth')
  getAuthUrl() {
    return { url: this.googleService.generateAuthUrl() };
  }

  // Step 2: Handle redirect from Google
  @Get('redirect')
  async handleRedirect(@Query('code') code: string) {
    const tokens = await this.googleService.getTokens(code);
    return {
      message: 'Tokens received successfully',
      tokens,
    };
  }

  // Step 3: Create Google Meet
  @Get('create-meeting')
  async createMeeting() {
    const accessToken = process.env.ACCESS_TOKEN;
    const refreshToken = process.env.REFRESH_TOKEN;

    const event = await this.googleService.createGoogleMeetEvent(
      accessToken,
      refreshToken,
    );
    return { meetLink: event.hangoutLink, event };
  }
}
