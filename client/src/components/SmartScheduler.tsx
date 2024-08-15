import React, { useState, useEffect } from 'react';
import { ChatAnthropic } from "langchain/chat_models/anthropic";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { logger } from '../utils/logger'; // Assume we have a logger utility

interface Event {
  title: string;
  start: Date;
  end: Date;
}

const SmartScheduler: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Event>({ title: '', start: new Date(), end: new Date() });
  const [scheduledSessions, setScheduledSessions] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    logger.info(`Adding new event: ${JSON.stringify(newEvent)}`);
    setEvents([...events, newEvent]);
    setNewEvent({ title: '', start: new Date(), end: new Date() });
  };

  const handleScheduleSessions = async () => {
    setIsLoading(true);
    setError(null);
    logger.info('Starting session scheduling');

    try {
      const chatModel = new ChatAnthropic({
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        modelName: "claude-3-5-sonnet-20240620",
      });

      const messages = [
        new SystemChatMessage("You are an AI assistant that helps schedule study sessions. Please consider conflicts and suggest alternative times if needed."),
        new HumanChatMessage(`Please schedule study sessions around these events: ${JSON.stringify(events)}. If there are conflicts, suggest alternative times.`),
      ];

      logger.debug(`Sending request to AI: ${JSON.stringify(messages)}`);
      const response = await chatModel.call(messages);
      logger.debug(`Received response from AI: ${response.text}`);
      
      const parsedResponse = JSON.parse(response.text);
      setScheduledSessions(parsedResponse.sessions);
      logger.info(`Scheduled sessions: ${JSON.stringify(parsedResponse.sessions)}`);
      
      if (parsedResponse.conflicts) {
        const conflictMessage = `Some conflicts were detected. ${parsedResponse.conflicts}`;
        setError(conflictMessage);
        logger.warn(conflictMessage);
      }
    } catch (error) {
      const errorMessage = 'Error scheduling sessions: ' + (error instanceof Error ? error.message : String(error));
      logger.error(errorMessage);
      setError('An error occurred while scheduling sessions. Please try again.');
    } finally {
      setIsLoading(false);
      logger.info('Session scheduling completed');
    }
  };

  const handleDynamicAdjustment = async () => {
    setIsLoading(true);
    setError(null);
    logger.info('Starting dynamic schedule adjustment');

    try {
      const chatModel = new ChatAnthropic({
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        modelName: "claude-3-5-sonnet-20240620",
      });

      const messages = [
        new SystemChatMessage("You are an AI assistant that helps adjust study schedules dynamically."),
        new HumanChatMessage(`Please adjust the study sessions based on these events: ${JSON.stringify(events)} and these scheduled sessions: ${JSON.stringify(scheduledSessions)}. Consider any new conflicts or opportunities for optimization.`),
      ];

      logger.debug(`Sending adjustment request to AI: ${JSON.stringify(messages)}`);
      const response = await chatModel.call(messages);
      logger.debug(`Received adjustment response from AI: ${response.text}`);
      
      const parsedResponse = JSON.parse(response.text);
      setScheduledSessions(parsedResponse.adjustedSessions);
      logger.info(`Adjusted sessions: ${JSON.stringify(parsedResponse.adjustedSessions)}`);
      
      if (parsedResponse.adjustments) {
        const adjustmentMessage = `Schedule adjusted: ${parsedResponse.adjustments}`;
        setError(adjustmentMessage);
        logger.info(adjustmentMessage);
      }
    } catch (error) {
      const errorMessage = 'Error adjusting schedule: ' + (error instanceof Error ? error.message : String(error));
      logger.error(errorMessage);
      setError('An error occurred while adjusting the schedule. Please try again.');
    } finally {
      setIsLoading(false);
      logger.info('Dynamic schedule adjustment completed');
    }
  };

  useEffect(() => {
    if (events.length > 0 && scheduledSessions.length > 0) {
      logger.info('Events changed, triggering dynamic adjustment');
      handleDynamicAdjustment();
    }
  }, [events]);

  return (
    <div>
      <h2>Smart Scheduler</h2>
      <form onSubmit={handleAddEvent}>
        <input
          type="text"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          placeholder="Event title"
        />
        <input
          type="datetime-local"
          value={newEvent.start.toISOString().slice(0, 16)}
          onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
        />
        <input
          type="datetime-local"
          value={newEvent.end.toISOString().slice(0, 16)}
          onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
        />
        <button type="submit">Add Event</button>
      </form>
      <button onClick={handleScheduleSessions} disabled={isLoading}>
        {isLoading ? 'Scheduling...' : 'Schedule Study Sessions'}
      </button>
      <button onClick={handleDynamicAdjustment} disabled={isLoading}>
        {isLoading ? 'Adjusting...' : 'Adjust Schedule'}
      </button>
      {error && <p className="error">{error}</p>}
      <div>
        <h3>Events:</h3>
        <ul>
          {events.map((event, index) => (
            <li key={index}>{event.title}: {event.start.toLocaleString()} - {event.end.toLocaleString()}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Scheduled Study Sessions:</h3>
        <ul>
          {scheduledSessions.map((session, index) => (
            <li key={index}>
              {session.title}: {new Date(session.start).toLocaleString()} - {new Date(session.end).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SmartScheduler;