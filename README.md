# Study Buddy: Personalized Study Assistant

This project is a personalized study assistant application designed to help users manage their studies effectively. It features AI-driven scheduling and adaptive learning capabilities.

## Current Functionality

1. **Smart Scheduler**
   - Add events to a calendar
   - Automatically schedule study sessions around existing events
   - AI-powered conflict resolution and alternative time suggestions
   - Dynamic schedule adjustment as new events are added

2. **AI Integration**
   - Uses Claude AI model via LangChain for intelligent scheduling

3. **Error Handling and Logging**
   - Comprehensive error handling for API interactions and scheduling conflicts
   - Logging system for debugging and improvement

## Setup and Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Anthropic API key:
     ```
     ANTHROPIC_API_KEY=your_api_key_here
     ```
5. Start the development server:
   ```
   npm start
   ```

## Available Scripts

In the project directory, you can run:

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production

## Future Development

- Implement focus mode with Pomodoro technique
- Add note summarization and management features
- Develop flashcard and quiz generation
- Create a progress dashboard
- Integrate real-time communication features

For more details on the development roadmap, please refer to the `DevelopmentGuide.txt` file.

## Contributing

This project is currently in active development. If you'd like to contribute, please reach out to the project maintainers.

## License

[MIT License](LICENSE)