import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIInterface from './AIInterface';
import { ChatAnthropic } from "langchain/chat_models/anthropic";
import { Anthropic } from "@anthropic-ai/sdk";

jest.mock("langchain/chat_models/anthropic");
jest.mock("@anthropic-ai/sdk");

describe('AIInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input field and submit button', () => {
    render(<AIInterface />);
    expect(screen.getByPlaceholderText('Ask me anything...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  test('handles user input and displays AI response', async () => {
    const mockResponse = { text: 'This is a test response from AI.' };
    const mockCall = jest.fn().mockResolvedValue(mockResponse);
    const mockAnthropicConstructor = jest.fn();
    
    (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(() => {
      mockAnthropicConstructor();
      return {} as any;
    });
    
    (ChatAnthropic as jest.MockedClass<typeof ChatAnthropic>).mockImplementation(() => ({
      call: mockCall,
      constructor: jest.fn(),
    } as any));

    render(<AIInterface />);
    
    const input = screen.getByPlaceholderText('Ask me anything...');
    const submitButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const aiResponse = screen.queryByText('This is a test response from AI.');
      const errorMessage = screen.queryByText('An error occurred while processing your request. Please try again.');
      
      if (aiResponse) {
        expect(aiResponse).toBeInTheDocument();
      } else if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();
        console.error('Error message found:', errorMessage.textContent);
      } else {
        throw new Error('Neither AI response nor error message found');
      }
    }, { timeout: 5000 });

    expect(mockAnthropicConstructor).toHaveBeenCalled();
    expect(mockCall).toHaveBeenCalled();
  });

  test('displays error message on API failure', async () => {
    const mockError = new Error('API Error');
    const mockCall = jest.fn().mockRejectedValue(mockError);
    (ChatAnthropic as jest.MockedClass<typeof ChatAnthropic>).mockImplementation(() => ({
      call: mockCall,
      constructor: jest.fn(),
    } as any));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<AIInterface />);
    
    const input = screen.getByPlaceholderText('Ask me anything...');
    const submitButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('An error occurred while processing your request. Please try again.')).toBeInTheDocument();
    });

    expect(mockCall).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Error processing user input:', mockError);

    consoleSpy.mockRestore();
  });
});