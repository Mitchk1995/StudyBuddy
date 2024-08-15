import React, { useState } from 'react';
import { ChatAnthropic } from "langchain/chat_models/anthropic";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import SmartScheduler from './SmartScheduler';
import FocusMode from './FocusMode';

const AIInterface: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUserInput = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await callAI(userInput);
      setAiResponse(response);
    } catch (error) {
      console.error('Error processing user input:', error);
      setError('An error occurred while processing your request. Please try again.');
      setAiResponse('');
    } finally {
      setIsLoading(false);
    }
  };

  const callAI = async (input: string): Promise<string> => {
    const chatModel = new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      modelName: "claude-3-5-sonnet-20240620",
    });

    const messages = [
      new SystemChatMessage("You are a helpful AI assistant."),
      new HumanChatMessage(input),
    ];

    const response = await chatModel.call(messages);
    return response.text;
  };

  return (
    <div>
      <form onSubmit={handleUserInput}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} data-testid="ai-submit-button">
          {isLoading ? 'Processing...' : 'Send'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {aiResponse && <p>{aiResponse}</p>}
      <SmartScheduler />
      <FocusMode initialWorkDuration={1500} initialBreakDuration={300} />
    </div>
  );
};

export default AIInterface;