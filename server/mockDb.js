const mockDb = {
  users: [],
  study_sessions: [],
  quiz_scores: [],
  query: jest.fn((text, params) => {
    if (text.includes('INSERT INTO users')) {
      const newUser = { 
        id: mockDb.users.length + 1, 
        username: params[0],
        email: params[1],
        password: params[2]
      };
      mockDb.users.push(newUser);
      return { rows: [newUser] };
    }
    if (text.includes('INSERT INTO study_sessions')) {
      const newSession = { 
        id: mockDb.study_sessions.length + 1, 
        user_id: params[0],
        start_time: params[1],
        end_time: params[2],
        subject: params[3]
      };
      mockDb.study_sessions.push(newSession);
      return { rows: [newSession] };
    }
    if (text.includes('INSERT INTO quiz_scores')) {
      const newQuizScore = {
        id: mockDb.quiz_scores.length + 1,
        user_id: params[0],
        subject: params[1],
        score: params[2],
        date: params[3]
      };
      mockDb.quiz_scores.push(newQuizScore);
      return { rows: [newQuizScore] };
    }
    if (text.includes('SELECT * FROM study_sessions')) {
      return { rows: mockDb.study_sessions.filter(session => session.user_id === parseInt(params[0])) };
    }
    if (text.includes('SELECT * FROM quiz_scores')) {
      return { rows: mockDb.quiz_scores.filter(score => score.user_id === parseInt(params[0])) };
    }
    return { rows: [] };
  }),
};

module.exports = mockDb;