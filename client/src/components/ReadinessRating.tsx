import React, { useState, useEffect } from 'react';
import { ChatAnthropic } from "langchain/chat_models/anthropic";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { logger } from '../utils/logger';
import axios from 'axios';

interface StudySession {
  id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  subject: string;
}

interface QuizScore {
  id: number;
  user_id: number;
  subject: string;
  score: number;
  date: string;
}

interface ReadinessRatingProps {
  userId: number;
}

const ReadinessRating: React.FC<ReadinessRatingProps> = ({ userId }) => {
  const [readinessScore, setReadinessScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    calculateReadiness();
  }, [userId]);

  const calculateReadiness = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const studySessions = await fetchStudySessions(userId);
      const quizScores = await fetchQuizScores(userId);

      const initialScore = calculateInitialScore(studySessions, quizScores);

      const { refinedScore, aiFeedback } = await getAIRefinedScore(initialScore, studySessions, quizScores);

      setReadinessScore(refinedScore);
      setFeedback(aiFeedback);
    } catch (error) {
      logger.error('Error calculating readiness:', error);
      setError('An error occurred while calculating your readiness. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudySessions = async (userId: number): Promise<StudySession[]> => {
    try {
      const response = await axios.get(`/api/sessions/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching study sessions:', error);
      throw error;
    }
  };

  const fetchQuizScores = async (userId: number): Promise<QuizScore[]> => {
    try {
      const response = await axios.get(`/api/quiz-scores/${userId}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching quiz scores:', error);
      throw error;
    }
  };

  const calculateInitialScore = (studySessions: StudySession[], quizScores: QuizScore[]): number => {
    // Calculate total study time
    const totalStudyTime = studySessions.reduce((total, session) => {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Convert to hours
    }, 0);

    // Calculate average quiz score
    const averageQuizScore = quizScores.reduce((total, quiz) => total + quiz.score, 0) / quizScores.length;

    // Calculate initial score (50% study time, 50% quiz scores)
    const studyTimeScore = Math.min(totalStudyTime / 10, 1); // Cap at 10 hours
    const quizScore = averageQuizScore / 100;

    return (studyTimeScore * 0.5 + quizScore * 0.5) * 100; // Scale to 0-100
  };

  const getAIRefinedScore = async (initialScore: number, studySessions: StudySession[], quizScores: QuizScore[]) => {
    const chatModel = new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      modelName: "claude-3-5-sonnet-20240620",
    });

    const messages = [
      new SystemChatMessage("You are an AI assistant that helps refine readiness scores and provide personalized feedback for students."),
      new HumanChatMessage(`Given an initial readiness score of ${initialScore}, study sessions: ${JSON.stringify(studySessions)}, and quiz scores: ${JSON.stringify(quizScores)}, please refine the readiness score and provide personalized feedback. Consider factors such as study consistency, performance trends, and subject coverage. Return your response as a JSON object with 'refinedScore' and 'feedback' properties.`),
    ];

    try {
      const response = await chatModel.call(messages);
      const parsedResponse = JSON.parse(response.text);

      return {
        refinedScore: parsedResponse.refinedScore,
        aiFeedback: parsedResponse.feedback,
      };
    } catch (error) {
      logger.error('Error getting AI refined score:', error);
      throw error;
    }
  };

  return (
    <div className="readiness-rating">
      <h2>Readiness Rating</h2>
      {isLoading && <p>Calculating your readiness...</p>}
      {error && <p className="error">{error}</p>}
      {readinessScore !== null && (
        <>
          <p>Your current readiness score: {readinessScore.toFixed(2)}</p>
          <p>Feedback: {feedback}</p>
        </>
      )}
      <button onClick={calculateReadiness} disabled={isLoading}>
        Recalculate Readiness
      </button>
    </div>
  );
};

export default ReadinessRating;