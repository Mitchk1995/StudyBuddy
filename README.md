# Study Buddy: Personalized Study Assistant

Study Buddy is an AI-powered study assistant designed to help users manage their studies effectively. It features intelligent scheduling, focus management, and readiness tracking to optimize your learning experience.

## Current Functionality

1. **Smart Scheduler**
   - Add events to your calendar
   - AI-powered study session scheduling around existing events
   - Automatic conflict resolution and alternative time suggestions
   - Dynamic schedule adjustment as new events are added

2. **Focus Mode (Pomodoro Technique)**
   - Customizable work and break durations
   - Timer with start, pause, and reset functionality
   - AI-driven adjustments based on user feedback
   - Session completion tracking

3. **Readiness Rating**
   - Calculates a readiness score based on study history and quiz performance
   - Provides personalized feedback on study progress
   - AI-refined scoring for more accurate assessments

4. **AI Integration**
   - Utilizes Claude AI model via LangChain for intelligent features
   - Customizable AI prompts for personalized interactions

5. **Error Handling and Logging**
   - Comprehensive error handling for API interactions and scheduling conflicts
   - Logging system for debugging and improvement

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/study-buddy.git
   cd study-buddy
   ```

2. Install dependencies for both client and server:
   ```
   cd client && npm install
   cd ../server && npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in both the `client` and `server` directories
   - In `client/.env`, add:
     ```
     REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here
     REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
     REACT_APP_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
     ```
   - In `server/.env`, add:
     ```
     DB_USER=your_database_user
     DB_PASSWORD=your_database_password
     DB_NAME=studybuddy
     DB_HOST=localhost
     DB_PORT=5432
     ```

4. Set up the database:
   - Create a PostgreSQL database named `studybuddy`
   - Run the SQL scripts in `server/db/schema.sql` to set up the tables

5. Start the development servers:
   - In one terminal, run the client:
     ```
     cd client && npm start
     ```
   - In another terminal, run the server:
     ```
     cd server && npm start
     ```

## How to Use

1. **Smart Scheduler**
   - Navigate to the Smart Scheduler page
   - Add your events using the form provided
   - Click "Schedule Study Sessions" to generate an optimized study plan
   - Use "Adjust Schedule" to refine your plan as needed

2. **Focus Mode**
   - Go to the Focus Mode page
   - Set your desired work and break durations
   - Click "Start" to begin a focus session
   - Use "Pause" and "Reset" as needed
   - Provide feedback after sessions to help the AI adjust to your needs

3. **Readiness Rating**
   - Visit the Readiness Rating page
   - Your current readiness score and feedback will be displayed
   - Click "Recalculate Readiness" to update your score based on recent activity

## Contributing

This project is currently in active development. If you'd like to contribute, please reach out to the project maintainers or submit a pull request.

## License

[MIT License](LICENSE)