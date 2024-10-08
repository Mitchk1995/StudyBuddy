import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SmartScheduler from './components/SmartScheduler';
import FocusMode from './components/FocusMode';
import ReadinessRating from './components/ReadinessRating';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <h1>Study Buddy</h1>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/scheduler">Smart Scheduler</Link></li>
            <li><Link to="/focus">Focus Mode</Link></li>
            <li><Link to="/readiness">Readiness Rating</Link></li>
          </ul>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scheduler" element={<SmartScheduler />} />
            <Route path="/focus" element={<FocusMode initialWorkDuration={1500} initialBreakDuration={300} />} />
            <Route path="/readiness" element={<ReadinessRating userId={1} />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2023 Study Buddy. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="home">
      <h2>Welcome to Study Buddy</h2>
      <p>Your personal AI-powered study assistant.</p>
      <div className="feature-list">
        <div className="feature">
          <h3>Smart Scheduler</h3>
          <p>Optimize your study time with AI-driven scheduling.</p>
        </div>
        <div className="feature">
          <h3>Focus Mode</h3>
          <p>Stay on track with our Pomodoro-inspired focus sessions.</p>
        </div>
        <div className="feature">
          <h3>Readiness Rating</h3>
          <p>Get insights on your exam preparedness.</p>
        </div>
      </div>
    </div>
  );
}

export default App;