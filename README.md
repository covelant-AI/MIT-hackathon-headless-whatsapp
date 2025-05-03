# WhatsApp Spam Detection System

This project implements an automated spam detection system for WhatsApp using headless browser technology. It monitors messages in real-time, analyzes patterns, and helps identify potential spam content using advanced detection algorithms.

## Architecture

The system uses a headless browser approach with the following key components:

- **Headless WhatsApp Integration**: Uses `whatsapp-web.js` to interact with WhatsApp Web in a headless environment, allowing for automated message monitoring without a visible browser window
- **Spam Detection Engine**: 
  - Real-time message analysis
  - Pattern recognition for spam indicators
  - Message frequency monitoring
  - Content analysis using AI/ML models
- **Database**: PostgreSQL database for storing:
  - Message history
  - Spam patterns
  - Detection rules
  - User configurations
- **Translation**: Google Cloud Translation API for multi-language spam detection
- **Text-to-Speech**: Google Cloud Text-to-Speech API for accessibility features
- **Web Interface**: Express.js server for monitoring and control

## Scam Detection Process

The system implements a comprehensive scam detection process through the following steps:

1. **URL Analysis**:
   - Scans messages for URLs using regex pattern matching
   - Checks detected URLs against Google Safe Browsing API
   - Identifies potentially malicious or scam websites

2. **Message Translation**:
   - Automatically detects message language
   - Translates non-English messages to English for analysis
   - Uses Google Cloud Translation API for accurate translations

3. **Content Analysis**:
   - Processes messages through AI/ML models
   - Classifies messages as "SAFE", "SCAM", or "SUSPICIOUS"
   - Generates detailed explanations for flagged messages

4. **Response Generation**:
   - For safe messages: Returns a simple confirmation
   - For scam/suspicious messages:
     - Provides classification result
     - Generates detailed explanation
     - Translates explanation back to original language
     - Creates audio version of the explanation using text-to-speech

5. **Integration Points**:
   - Google Safe Browsing API for URL verification
   - Google Cloud Translation API for language processing
   - Google Cloud Text-to-Speech for audio generation
   - Custom AI endpoint for message classification

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- Google Cloud credentials (for translation and text-to-speech features)
- PostgreSQL (handled via Docker)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd headless-automation
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=5433
PGADMIN_EMAIL=your_email
PGADMIN_PASSWORD=your_password
PGADMIN_PORT=5050
GOOGLE_API_KEY=your_google_api_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
AI_ENDPOINT=your_ai_endpoint
```

4. Start the database using Docker Compose:
```bash
docker-compose up -d
```

5. Start the application:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Available Scripts

- `npm start`: Start the main spam detection system
- `npm run dev`: Start the application in development mode with auto-reload
- `npm run monitor`: Start the message monitoring service
- `npm run qr`: Generate QR code for WhatsApp Web authentication

## Database Management

The project uses PostgreSQL with pgAdmin for database management:

- PostgreSQL runs on port 5433 (configurable via .env)
- pgAdmin interface is available at http://localhost:5050
- Database credentials are configured in the .env file

## Features

- **Spam Detection**:
  - Real-time message monitoring
  - Pattern-based spam identification
  - Message frequency analysis
  - Content analysis
  - Multi-language support
- **Monitoring**:
  - Headless WhatsApp Web integration
  - Automated message tracking
  - Spam alert system
- **Analysis**:
  - Message translation capabilities
  - Text-to-speech conversion
  - Historical data analysis
- **Management**:
  - Web interface for monitoring and control
  - Customizable detection rules
  - Spam pattern database

## Security Notes

- Keep your `.env` file secure and never commit it to version control
- Store Google Cloud credentials securely
- Regularly update dependencies for security patches
- Ensure WhatsApp session data is properly secured
- Follow WhatsApp's terms of service and API usage guidelines

## Troubleshooting

If you encounter issues with the headless browser:
1. Ensure you have the latest version of Chrome/Chromium installed
2. Check the `.wwebjs_cache` directory for any cached data that might need clearing
3. Verify that all environment variables are properly set
4. Check WhatsApp Web session status
5. Verify database connection and permissions

## License

[Add your license information here]
