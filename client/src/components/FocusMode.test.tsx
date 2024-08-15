// study-buddy/client/src/components/FocusMode.test.tsx
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FocusMode from './FocusMode';
import { ChatAnthropic } from "langchain/chat_models/anthropic";

jest.mock("langchain/chat_models/anthropic");

describe('FocusMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders timer and controls', () => {
    render(<FocusMode initialWorkDuration={1500} initialBreakDuration={300} />);
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  test('starts and pauses timer', () => {
    render(<FocusMode initialWorkDuration={1500} initialBreakDuration={300} />);
    const startButton = screen.getByText('Start');

    act(() => {
      fireEvent.click(startButton);
    });
    expect(startButton.textContent).toBe('Pause');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('24:59')).toBeInTheDocument();

    act(() => {
      fireEvent.click(startButton);
    });
    expect(startButton.textContent).toBe('Start');
  });

  test('resets timer', () => {
    render(<FocusMode initialWorkDuration={1500} initialBreakDuration={300} />);
    const startButton = screen.getByText('Start');
    const resetButton = screen.getByText('Reset');

    fireEvent.click(startButton);
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    fireEvent.click(resetButton);
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(startButton.textContent).toBe('Start');
  });

  test('switches to break after work session', () => {
    render(<FocusMode initialWorkDuration={5} initialBreakDuration={3} />);
    const startButton = screen.getByText('Start');

    fireEvent.click(startButton);
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByText('Break')).toBeInTheDocument();
    expect(screen.getByText('00:03')).toBeInTheDocument();
  });

  test('processes feedback and adjusts durations', async () => {
    const mockResponse = { text: JSON.stringify({ adjustedWorkDuration: 1800, adjustedBreakDuration: 360 }) };
    const mockCall = jest.fn().mockResolvedValue(mockResponse);
    
    (ChatAnthropic as jest.MockedClass<typeof ChatAnthropic>).mockImplementation(() => ({
      call: mockCall,
    } as any));

    render(<FocusMode initialWorkDuration={1500} initialBreakDuration={300} />);
    const feedbackInput = screen.getByPlaceholderText('Provide feedback on your focus session');
    const submitButton = screen.getByText('Submit Feedback');

    fireEvent.change(feedbackInput, { target: { value: 'Work duration too short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('30:00')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(mockCall).toHaveBeenCalled();
  });
});