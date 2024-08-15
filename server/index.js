const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Use mock database for testing, real database for production
const pool = process.env.NODE_ENV === 'test' ? require('./mockDb') : require('./db');

// Routes
app.get('/', (req, res) => {
  res.send('Study Buddy API is running');
});

// User routes
app.post('/api/users', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, password]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Study session routes
app.post('/api/sessions', async (req, res) => {
  try {
    const { user_id, start_time, end_time, subject } = req.body;
    const newSession = await pool.query(
      'INSERT INTO study_sessions (user_id, start_time, end_time, subject) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, start_time, end_time, subject]
    );
    res.json(newSession.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get study sessions for a user
app.get('/api/sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await pool.query(
      'SELECT * FROM study_sessions WHERE user_id = $1 ORDER BY start_time DESC',
      [userId]
    );
    res.json(sessions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Quiz score routes
app.post('/api/quiz-scores', async (req, res) => {
  try {
    const { user_id, subject, score, date } = req.body;
    const newQuizScore = await pool.query(
      'INSERT INTO quiz_scores (user_id, subject, score, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, subject, score, date]
    );
    res.json(newQuizScore.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/quiz-scores/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const quizScores = await pool.query(
      'SELECT * FROM quiz_scores WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    res.json(quizScores.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Readiness rating route
app.get('/api/readiness/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const studySessions = await pool.query(
      'SELECT * FROM study_sessions WHERE user_id = $1 ORDER BY start_time DESC',
      [userId]
    );
    const quizScores = await pool.query(
      'SELECT * FROM quiz_scores WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    
    // Here you would implement the logic to calculate the readiness score
    // For now, we'll return a placeholder score and the raw data
    const readinessScore = 0.75; // Placeholder score
    
    res.json({
      readinessScore,
      studySessions: studySessions.rows,
      quizScores: quizScores.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;