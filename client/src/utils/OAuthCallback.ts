import { google } from 'googleapis';

export const handleOAuthCallback = async (code: string): Promise<void> => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
  const redirectUri = 'http://localhost:3000/oauth2callback';

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store the tokens securely (this is just an example, use a more secure method in production)
    localStorage.setItem('googleAccessToken', tokens.access_token || '');
    localStorage.setItem('googleRefreshToken', tokens.refresh_token || '');

    // You might want to update your app's state or redirect the user
    console.log('Successfully authenticated with Google');
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    throw error;
  }
};