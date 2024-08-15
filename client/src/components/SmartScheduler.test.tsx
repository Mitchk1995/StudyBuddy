// study-buddy/client/src/components/SmartScheduler.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import SmartScheduler from './SmartScheduler';
import { GoogleCalendarTools } from '../utils/googleCalendarTools';
import { ChatAnthropic } from "langchain/chat_models/anthropic";

// Mock the modules
jest.mock('../utils/googleCalendarTools');
jest.mock('langchain/chat_models/anthropic');

describe('SmartScheduler', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();

    // Mock the ChatAnthropic
    (ChatAnthropic as jest.MockedClass<typeof ChatAnthropic>).mockImplementation(() => ({
      call: jest.fn().mockResolvedValue({ text: 'AI response' }),
    } as any));

    // Mock the GoogleCalendarTools
    (GoogleCalendarTools.prototype.listEvents as jest.Mock).mockResolvedValue([
      {
        id: '1',
        summary: 'Test Event',
        start: { dateTime: '2024-08-15T01:56:30.000Z' },
        end: { dateTime: '2024-08-15T02:56:30.000Z' }
      }
    ]);
  });

  test('fetches and displays events', async () => {
    await act(async () => {
      render(<SmartScheduler />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading events...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Test Event/)).toBeInTheDocument();
  });
});