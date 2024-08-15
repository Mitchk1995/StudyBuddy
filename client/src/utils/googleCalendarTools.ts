import { DynamicTool } from "langchain/tools";
import { google, calendar_v3 } from 'googleapis';

export class GoogleCalendarTools {
  private auth: any;
  private calendar: calendar_v3.Calendar;

  constructor() {
    this.initializeAuth();
    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  private initializeAuth() {
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

  getTools(): DynamicTool[] {
    return [
      new DynamicTool({
        name: "ListEvents",
        description: "List events from Google Calendar",
        func: async () => JSON.stringify(await this.listEvents()),
      }),
      new DynamicTool({
        name: "AddEvent",
        description: "Add an event to Google Calendar",
        func: async (eventDetails: string) => {
          const event = JSON.parse(eventDetails);
          return JSON.stringify(await this.addEvent(event));
        },
      }),
      new DynamicTool({
        name: "UpdateEvent",
        description: "Update an event in Google Calendar",
        func: async (args: string) => {
          const { eventId, eventDetails } = JSON.parse(args);
          return JSON.stringify(await this.updateEvent(eventId, eventDetails));
        },
      }),
    ];
  }

  async listEvents(): Promise<calendar_v3.Schema$Event[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });
      return response.data.items || [];
    } catch (error) {
      console.error('Error listing events:', error);
      throw error;
    }
  }

  async addEvent(event: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, event: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: event,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }
}