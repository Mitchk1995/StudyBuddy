// study-buddy/client/src/components/FocusMode.tsx
import React, { useState, useEffect } from 'react';
import { ChatAnthropic } from "langchain/chat_models/anthropic";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { logger } from '../utils/logger'; // Assume we have a logger utility

interface FocusModeProps {
  initialWorkDuration: number;
  initialBreakDuration: number;
}

const FocusMode: React.FC<FocusModeProps> = ({ initialWorkDuration, initialBreakDuration }) => {
  const [workDuration, setWorkDuration] = useState(initialWorkDuration);
  const [breakDuration, setBreakDuration] = useState(initialBreakDuration);
  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isWorking, setIsWorking] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (isWorking) {
        logger.info(`Work session completed. Starting break for ${breakDuration} seconds.`);
        setTimeLeft(breakDuration);
        setIsWorking(false);
      } else {
        logger.info(`Break completed. Starting work session for ${workDuration} seconds.`);
        setTimeLeft(workDuration);
        setIsWorking(true);
        setCycles((c) => {
          logger.info(`Completed cycle ${c + 1}`);
          return c + 1;
        });
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isWorking, workDuration, breakDuration]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    logger.info(`Timer ${isActive ? 'paused' : 'started'}`);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsWorking(true);
    setTimeLeft(workDuration);
    setCycles(0);
    logger.info('Timer reset');
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFeedback = async () => {
    logger.info('Processing user feedback');
    try {
      const chatModel = new ChatAnthropic({
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        modelName: "claude-3-5-sonnet-20240620",
      });

      const messages = [
        new SystemChatMessage("You are an AI assistant that helps adjust focus sessions based on user feedback."),
        new HumanChatMessage(`Please suggest adjustments to the focus session based on this feedback: ${feedback}. Current work duration: ${workDuration}, break duration: ${breakDuration}.`),
      ];

      logger.debug(`Sending feedback to AI: ${JSON.stringify(messages)}`);
      const response = await chatModel.call(messages);
      logger.debug(`Received response from AI: ${response.text}`);
      
      const parsedResponse = JSON.parse(response.text);
      if (parsedResponse.adjustedWorkDuration) {
        logger.info(`Adjusting work duration from ${workDuration} to ${parsedResponse.adjustedWorkDuration}`);
        setWorkDuration(parsedResponse.adjustedWorkDuration);
        if (isWorking) {
          setTimeLeft(parsedResponse.adjustedWorkDuration);
        }
      }
      if (parsedResponse.adjustedBreakDuration) {
        logger.info(`Adjusting break duration from ${breakDuration} to ${parsedResponse.adjustedBreakDuration}`);
        setBreakDuration(parsedResponse.adjustedBreakDuration);
        if (!isWorking) {
          setTimeLeft(parsedResponse.adjustedBreakDuration);
        }
      }
      
      setFeedback('');
    } catch (error) {
      const errorMessage = 'Error processing feedback: ' + (error instanceof Error ? error.message : String(error));
      logger.error(errorMessage);
    }
  };

  return (
    <div className="focus-mode">
      <h2>Focus Mode (Pomodoro Technique)</h2>
      <div className="timer">{formatTime(timeLeft)}</div>
      <div className="status">{isWorking ? 'Work' : 'Break'}</div>
      <div className="cycles">Completed Cycles: {cycles}</div>
      <input
        type="text"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Provide feedback on your focus session"
      />
      <button onClick={handleFeedback}>Submit Feedback</button>
      <button onClick={toggleTimer}>{isActive ? 'Pause' : 'Start'}</button>
      <button onClick={resetTimer}>Reset</button>
    </div>
  );
};

export default FocusMode;