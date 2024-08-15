process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../index');
const mockDb = require('../mockDb');

describe('API Routes', () => {
  beforeEach(() => {
    mockDb.users = [];
    mockDb.study_sessions = [];
    mockDb.quiz_scores = [];
  });

  describe('GET /', () => {
    it('should return a welcome message', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('Study Buddy API is running');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      const res = await request(app)
        .post('/api/users')
        .send(newUser);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('username', newUser.username);
      expect(res.body).toHaveProperty('email', newUser.email);
    });
  });

  describe('POST /api/sessions', () => {
    it('should create a new study session', async () => {
      // First, create a user
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      const userRes = await request(app)
        .post('/api/users')
        .send(newUser);
      
      const newSession = {
        user_id: userRes.body.id,
        start_time: '2023-05-01T10:00:00Z',
        end_time: '2023-05-01T11:00:00Z',
        subject: 'Mathematics'
      };
      const res = await request(app)
        .post('/api/sessions')
        .send(newSession);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user_id', newSession.user_id);
      expect(res.body).toHaveProperty('subject', newSession.subject);
    });
  });

  describe('GET /api/sessions/:userId', () => {
    it('should retrieve study sessions for a user', async () => {
      // First, create a user
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      const userRes = await request(app)
        .post('/api/users')
        .send(newUser);
      
      // Then, create a session for this user
      const newSession = {
        user_id: userRes.body.id,
        start_time: '2023-05-01T10:00:00Z',
        end_time: '2023-05-01T11:00:00Z',
        subject: 'Mathematics'
      };
      await request(app)
        .post('/api/sessions')
        .send(newSession);

      const res = await request(app).get(`/api/sessions/${userRes.body.id}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('user_id', userRes.body.id);
    });
  });

  describe('POST /api/quiz-scores', () => {
    it('should create a new quiz score', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      const userRes = await request(app)
        .post('/api/users')
        .send(newUser);
      
      const newQuizScore = {
        user_id: userRes.body.id,
        subject: 'Mathematics',
        score: 85,
        date: '2023-05-01T10:00:00Z'
      };
      const res = await request(app)
        .post('/api/quiz-scores')
        .send(newQuizScore);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user_id', newQuizScore.user_id);
      expect(res.body).toHaveProperty('subject', newQuizScore.subject);
      expect(res.body).toHaveProperty('score', newQuizScore.score);
    });
  });

  describe('GET /api/quiz-scores/:userId', () => {
    it('should retrieve quiz scores for a user', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      const userRes = await request(app)
        .post('/api/users')
        .send(newUser);
      
      const newQuizScore = {
        user_id: userRes.body.id,
        subject: 'Mathematics',
        score: 85,
        date: '2023-05-01T10:00:00Z'
      };
      await request(app)
        .post('/api/quiz-scores')
        .send(newQuizScore);

      const res = await request(app).get(`/api/quiz-scores/${userRes.body.id}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('user_id', userRes.body.id);
    });
  });

  describe('GET /api/readiness/:userId', () => {
    it('should retrieve readiness data for a user', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      const userRes = await request(app)
        .post('/api/users')
        .send(newUser);
      
      const newSession = {
        user_id: userRes.body.id,
        start_time: '2023-05-01T10:00:00Z',
        end_time: '2023-05-01T11:00:00Z',
        subject: 'Mathematics'
      };
      await request(app)
        .post('/api/sessions')
        .send(newSession);

      const newQuizScore = {
        user_id: userRes.body.id,
        subject: 'Mathematics',
        score: 85,
        date: '2023-05-01T12:00:00Z'
      };
      await request(app)
        .post('/api/quiz-scores')
        .send(newQuizScore);

      const res = await request(app).get(`/api/readiness/${userRes.body.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('readinessScore');
      expect(res.body).toHaveProperty('studySessions');
      expect(res.body).toHaveProperty('quizScores');
      expect(Array.isArray(res.body.studySessions)).toBe(true);
      expect(Array.isArray(res.body.quizScores)).toBe(true);
    });
  });
});