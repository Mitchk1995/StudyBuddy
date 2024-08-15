import React from 'react';

const Home: React.FC = () => {
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
};

export default Home;