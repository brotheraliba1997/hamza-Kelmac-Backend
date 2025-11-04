// google.provider.ts
import { google } from 'googleapis';

export const GoogleOAuthProvider = {
  provide: 'GOOGLE_OAUTH2_CLIENT',
  useFactory: () => {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
  },
};
