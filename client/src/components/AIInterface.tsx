import React, { useState } from 'react';
import { ChatAnthropic } from "langchain/chat_models/anthropic";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { Anthropic } from "@anthropic-ai/sdk";
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
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY, // Make sure to set this in your .env file
      });

      const chatModel = new ChatAnthropic({
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        modelName: "claude-3-5-sonnet-20240620", // or whichever model you prefer
      });

      const messages = [
        new SystemChatMessage("You are a helpful AI assistant."),
        new HumanChatMessage(userInput),
      ];

      const response = await chatModel.call(messages);
      
      setAiResponse(response.text);
    } catch (error) {
      console.error('Error processing user input:', error);
      setError('An error occurred while processing your request. Please try again.');
      setAiResponse(''); // Clear any previous response
    } finally {
      setIsLoading(false);
    }
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
        <button type="submit" disabled={isLoading}>
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