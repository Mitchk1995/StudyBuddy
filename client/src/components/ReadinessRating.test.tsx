import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import ReadinessRating from './ReadinessRating';
import { ChatAnthropic } from "langchain/chat_models/anthropic";

jest.mock('axios');
jest.mock("langchain/chat_models/anthropic");

describe('ReadinessRating', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders readiness rating component', () => {
    render(<ReadinessRating userId={1} />);
    expect(screen.getByText('Readiness Rating')).toBeInTheDocument();
    expect(screen.getByText('Recalculate Readiness')).toBeInTheDocument();
  });

  test('calculates readiness score and displays feedback', async () => {
    const mockStudySessions = [
      { id: 1, user_id: 1, start_time: '2023-05-01T10:00:00Z', end_time: '2023-05-01T12:00:00Z', subject: 'Math' }
    ];
    const mockQuizScores = [
      { id: 1, user_id: 1, subject: 'Math', score: 80, date: '2023-05-01T13:00:00Z' }
    ];
    
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('sessions')) {
        return Promise.resolve({ data: mockStudySessions });
      } else if (url.includes('quiz-scores')) {
        return Promise.resolve({ data: mockQuizScores });
      }
    });

    const mockAIResponse = { text: JSON.stringify({ refinedScore: 85, feedback: 'Good progress!' }) };
    const mockCall = jest.fn().mockResolvedValue(mockAIResponse);
    (ChatAnthropic as jest.MockedClass<typeof ChatAnthropic>).mockImplementation(() => ({
      call: mockCall,
    } as any));

    render(<ReadinessRating userId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Your current readiness score: 85.00')).toBeInTheDocument();
      expect(screen.getByText('Feedback: Good progress!')).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(mockCall).toHaveBeenCalled();
  });

  test('handles errors when calculating readiness', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<ReadinessRating userId={1} />);

    await waitFor(() => {
      expect(screen.getByText('An error occurred while calculating your readiness. Please try again.')).toBeInTheDocument();
    });
  });
});