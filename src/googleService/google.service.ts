import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleService {
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  // Step 1: Generate Auth URL
  generateAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
    });
  }

  // Step 2: Exchange code for tokens
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  // Step 3: Create Google Meet Event
  async createGoogleMeetEvent(accessToken: string, refreshToken: string) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const event = {
      summary: 'Test Meeting with Hamza',
      description: 'Discussion about project milestones.',
      start: {
        dateTime: new Date().toISOString(),
        timeZone: 'Asia/Karachi',
      },
      end: {
        dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // +1 hour
        timeZone: 'Asia/Karachi',
      },
      conferenceData: {
        createRequest: {
          requestId: 'random-string-' + Date.now(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
    });

    return response.data;
  }
}
