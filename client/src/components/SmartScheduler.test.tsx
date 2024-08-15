// study-buddy/client/src/components/SmartScheduler.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SmartScheduler from './SmartScheduler';
import { ChatAnthropic } from "langchain/chat_models/anthropic";

jest.mock("langchain/chat_models/anthropic");

describe('SmartScheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders add event form and schedule button', () => {
    render(<SmartScheduler />);
    expect(screen.getByPlaceholderText('Event title')).toBeInTheDocument();
    expect(screen.getByText('Add Event')).toBeInTheDocument();
    expect(screen.getByText('Schedule Study Sessions')).toBeInTheDocument();
  });

  test('adds new event when form is submitted', () => {
    render(<SmartScheduler />);
    const titleInput = screen.getByPlaceholderText('Event title');
    const addButton = screen.getByText('Add Event');

    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.click(addButton);

    expect(screen.getByText(/Test Event/)).toBeInTheDocument();
  });

  test('schedules sessions when button is clicked', async () => {
    const mockResponse = { text: JSON.stringify({ sessions: [{ title: 'Study Session', start: '2023-05-01T10:00:00', end: '2023-05-01T11:00:00' }] }) };
    const mockCall = jest.fn().mockResolvedValue(mockResponse);
    
    (ChatAnthropic as jest.MockedClass<typeof ChatAnthropic>).mockImplementation(() => ({
      call: mockCall,
    } as any));

    render(<SmartScheduler />);
    const scheduleButton = screen.getByText('Schedule Study Sessions');

    fireEvent.click(scheduleButton);

    await waitFor(() => {
      expect(screen.getByText(/Study Session/)).toBeInTheDocument();
    });

    expect(mockCall).toHaveBeenCalled();
  });

  test('handles errors when scheduling sessions', async () => {
    const mockCall = jest.fn().mockRejectedValue(new Error('API Error'));
    
    (ChatAnthropic as jest.MockedClass<typeof ChatAnthropic>).mockImplementation(() => ({
      call: mockCall,
    } as any));

    render(<SmartScheduler />);
    const scheduleButton = screen.getByText('Schedule Study Sessions');

    fireEvent.click(scheduleButton);

    await waitFor(() => {
      expect(screen.getByText('An error occurred while scheduling sessions. Please try again.')).toBeInTheDocument();
    });
  });
});