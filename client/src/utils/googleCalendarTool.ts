import { Tool } from "langchain/tools";
import { google } from 'googleapis';

export class GoogleCalendarTool extends Tool {
  name = "Google Calendar";
  description = "A tool for interacting with Google Calendar. Use this to list, create, and update events.";
  private auth: any;

  constructor() {
    super();
    this.initializeAuth();
  }

  private async initializeAuth() {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
    const redirectUri = 'http://localhost:3000/oauth2callback';

    this.auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    // TODO: Implement proper OAuth flow
    // For now, we'll use a refresh token (this is not secure for production)
    this.auth.setCredentials({
      refresh_token: process.env.REACT_APP_GOOGLE_REFRESH_TOKEN,
    });
  }

  async _call(action: string, args: any): Promise<string> {
    switch (action) {
      case 'listEvents':
        return this.listEvents();
      case 'createEvent':
        return this.createEvent(args.event);
      case 'updateEvent':
        return this.updateEvent(args.eventId, args.event);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async listEvents(): Promise<string> {
    const calendar = google.calendar({ version: 'v3', auth: this.auth });
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = res.data.items;
    if (!events || events.length === 0) {
      return 'No upcoming events found.';
    }
    return JSON.stringify(events);
  }

  async createEvent(event: any): Promise<string> {
    const calendar = google.calendar({ version: 'v3', auth: this.auth });
    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    return `Event created: ${res.data.htmlLink}`;
  }

  async updateEvent(eventId: string, event: any): Promise<string> {
    const calendar = google.calendar({ version: 'v3', auth: this.auth });
    const res = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: event,
    });
    return `Event updated: ${res.data.htmlLink}`;
  }
}