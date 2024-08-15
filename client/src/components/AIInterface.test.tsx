import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIInterface from './AIInterface';
import { ChatAnthropic } from "langchain/chat_models/anthropic";

jest.mock('langchain/chat_models/anthropic');

describe('AIInterface', () => {
  beforeEach(() => {
    (ChatAnthropic as jest.MockedClass<typeof ChatAnthropic>).mockImplementation(() => ({
      call: jest.fn().mockResolvedValue({ text: 'AI response' }),
    } as any));
  });

  test('renders input field and submit button', () => {
    render(<AIInterface />);
    expect(screen.getByPlaceholderText('Ask me anything...')).toBeInTheDocument();
    expect(screen.getByTestId('ai-submit-button')).toBeInTheDocument();
  });

  test('handles user input and displays AI response', async () => {
    render(<AIInterface />);
    
    const input = screen.getByPlaceholderText('Ask me anything...');
    const submitButton = screen.getByTestId('ai-submit-button');

    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('AI response')).toBeInTheDocument();
    });
  });

  test('displays error message on API failure', async () => {
    (ChatAnthropic as jest.MockedClass<typeof ChatAnthropic>).mockImplementation(() => ({
      call: jest.fn().mockRejectedValue(new Error('API Error')),
    } as any));

    render(<AIInterface />);
    
    const input = screen.getByPlaceholderText('Ask me anything...');
    const submitButton = screen.getByTestId('ai-submit-button');

    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('An error occurred while processing your request. Please try again.')).toBeInTheDocument();
    });
  });
});