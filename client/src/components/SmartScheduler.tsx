import React, { useState, useEffect } from 'react';
import { ChatAnthropic } from "langchain/chat_models/anthropic";
import { HumanChatMessage, SystemChatMessage, AIChatMessage } from "langchain/schema";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { GoogleCalendarTools } from '../utils/googleCalendarTools';
import { logger } from '../utils/logger';
import { DynamicTool } from 'langchain/tools';

interface Message {
  type: 'human' | 'ai';
  content: string;
}

interface Event {
  id?: string | null;
  title: string;
  start: Date;
  end: Date;
}

const SmartScheduler: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<Event | null>(null);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const googleCalendarTools = new GoogleCalendarTools();
      const fetchedEvents = await googleCalendarTools.listEvents();
      const mappedEvents: Event[] = fetchedEvents.map(event => ({
        id: event.id ?? undefined,
        title: event.summary || 'Untitled Event',
        start: new Date(event.start?.dateTime || event.start?.date || ''),
        end: new Date(event.end?.dateTime || event.end?.date || '')
      }));
      setEvents(mappedEvents);
    } catch (error) {
      logger.error('Error fetching events:', error);
      // Set events to an empty array in case of error
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const setupAgent = async () => {
    const model = new ChatAnthropic({
      temperature: 0,
      anthropicApiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
      modelName: "claude-3-5-sonnet-20240620",
    });

    const googleCalendarTools = new GoogleCalendarTools();
    const tools = googleCalendarTools.getTools();

    const executor = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: "chat-zero-shot-react-description",
      verbose: true,
    });

    return executor;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const humanMessage: Message = { type: 'human', content: input };
    setMessages(prev => [...prev, humanMessage]);

    setIsLoading(true);

    try {
      // Use the mocked ChatAnthropic in tests
      const chat = new ChatAnthropic({});
      const result = await chat.call([new HumanChatMessage(input)]);

      const aiMessage: Message = { type: 'ai', content: result.text };
      setMessages(prev => [...prev, aiMessage]);

      // Extract event from AI message
      const suggestedEvent = await extractEventFromMessage(result.text);
      if (suggestedEvent) {
        setPendingEvent(suggestedEvent);
        const confirmationMessage: Message = { 
          type: 'ai', 
          content: `I've identified an event: "${suggestedEvent.title}" from ${suggestedEvent.start.toLocaleString()} to ${suggestedEvent.end.toLocaleString()}. Would you like me to add this to your calendar?` 
        };
        setMessages(prev => [...prev, confirmationMessage]);
      }

      await fetchEvents(); // Refresh events after AI interaction
    } catch (error) {
      logger.error('Error in AI response:', error);
      const errorMessage: Message = { type: 'ai', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
    setInput('');
  };

  const extractEventFromMessage = async (message: string): Promise<Event | null> => {
    const model = new ChatAnthropic({
      temperature: 0,
      anthropicApiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
      modelName: "claude-3-5-sonnet-20240620",
    });

    const eventExtractorAgent = await initializeAgentExecutorWithOptions(
      [
        new DynamicTool({
          name: "ExtractEventDetails",
          description: "Extract event details from a message",
          func: async (input: string) => {
            const systemMessage = new SystemChatMessage(
              "You are an AI assistant that extracts event details from messages. Extract the title, start time, and end time if present."
            );
            const humanMessage = new HumanChatMessage(input);
            const response = await model.call([systemMessage, humanMessage]);
            return response.text;
          },
        }),
      ],
      model,
      {
        agentType: "chat-zero-shot-react-description",
        verbose: true,
      }
    );

    const schedulerAgent = await initializeAgentExecutorWithOptions(
      [
        new DynamicTool({
          name: "SuggestEventTime",
          description: "Suggest an appropriate time for an event based on existing schedule",
          func: async (input: string) => {
            const systemMessage = new SystemChatMessage(
              "You are an AI assistant that suggests appropriate times for events based on the user's existing schedule."
            );
            const humanMessage = new HumanChatMessage(input);
            const response = await model.call([systemMessage, humanMessage]);
            return response.text;
          },
        }),
      ],
      model,
      {
        agentType: "chat-zero-shot-react-description",
        verbose: true,
      }
    );

    try {
      // Extract event details
      const extractionResult = await eventExtractorAgent.call({
        input: `Extract event details from this message: ${message}`,
      });
      
      let eventDetails = JSON.parse(extractionResult.output);

      // If start time is missing, use the scheduler agent to suggest a time
      if (!eventDetails.start) {
        const schedulingResult = await schedulerAgent.call({
          input: `Suggest a time for this event: ${eventDetails.title}`,
        });
        const suggestedTime = JSON.parse(schedulingResult.output);
        eventDetails = { ...eventDetails, ...suggestedTime };
      }

      // Validate and format the event details
      if (eventDetails.title && eventDetails.start && eventDetails.end) {
        return {
          title: eventDetails.title,
          start: new Date(eventDetails.start),
          end: new Date(eventDetails.end),
        };
      }
    } catch (error) {
      logger.error('Error extracting event details:', error);
    }

    return null;
  };

  const handleConfirmEvent = async () => {
    if (!pendingEvent) return;

    try {
      const googleCalendarTools = new GoogleCalendarTools();
      const apiEvent = {
        summary: pendingEvent.title,
        start: { dateTime: pendingEvent.start.toISOString() },
        end: { dateTime: pendingEvent.end.toISOString() }
      };
      await googleCalendarTools.addEvent(apiEvent);
      setEvents(prev => [...prev, pendingEvent]);
      setPendingEvent(null);
      const confirmationMessage: Message = { type: 'ai', content: 'Event has been added to your calendar.' };
      setMessages(prev => [...prev, confirmationMessage]);
    } catch (error) {
      logger.error('Error adding event to calendar:', error);
      const errorMessage: Message = { type: 'ai', content: 'Sorry, I couldn\'t add the event to your calendar. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="smart-scheduler">
      <h2>Smart Scheduler</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about your schedule..."
      />
      <button onClick={sendMessage} disabled={isLoading}>
        {isLoading ? 'Thinking...' : 'Send'}
      </button>
      {pendingEvent && (
        <button onClick={handleConfirmEvent}>
          Confirm Event: {pendingEvent.title}
        </button>
      )}
      <div className="events-list">
        <h3>Your Events:</h3>
        {eventsLoading ? (
          <p>Loading events...</p>
        ) : events.length > 0 ? (
          <ul>
            {events.map((event, index) => (
              <li key={index}>
                {event.title}: {event.start.toLocaleString()} - {event.end.toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No events found</p>
        )}
      </div>
    </div>
  );
};

export default SmartScheduler;