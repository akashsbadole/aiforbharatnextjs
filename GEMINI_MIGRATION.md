# Gemini Migration Guide

This document outlines the migration from `z-ai-web-dev-sdk` to Google's Gemini API in the Swasthya Mitra project.

## Overview

The project has been successfully migrated from using `z-ai-web-dev-sdk` to Google's Gemini API for all AI-powered features including:

- Medical response generation
- Multi-agent system processing
- Chat API functionality
- Structured medical responses

## Changes Made

### 1. Dependencies
- **Removed**: `z-ai-web-dev-sdk`
- **Added**: `@google/generative-ai`

### 2. New Files Created
- `src/lib/gemini-service.ts` - Gemini service wrapper that provides a similar interface for easier migration

### 3. Updated Files
- `src/lib/medical-response-generator.ts` - Updated to use Gemini service
- `src/lib/agent-system.ts` - Updated to use Gemini service
- `src/app/api/ai/chat/route.ts` - Updated to use Gemini service
- `.env.example` - Added Gemini API key configuration

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following configuration:

```bash
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration
DATABASE_URL="file:./dev.db"

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Development
NODE_ENV=development
```

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on "Get API Key" or navigate to the API keys section
4. Create a new API key
5. Copy the API key and add it to your `.env` file as `GEMINI_API_KEY`

## Benefits of Gemini

- **Better Medical Understanding**: Gemini is trained on more recent medical data
- **Multilingual Support**: Excellent Hindi, Marathi, Tamil, and English support
- **Structured Output**: Can generate JSON responses reliably
- **Cost-Effective**: Competitive pricing with good performance
- **Google Ecosystem**: Better integration potential

## API Usage

The Gemini service wrapper maintains a similar interface to the original 

```typescript
import GeminiService from './gemini-service';

// Create a new instance
const gemini = await GeminiService.create();

// Generate responses
const response = await gemini.chatCompletionsCreate([
  { role: 'user', content: 'Your message here' }
]);
```

## Error Handling

The Gemini service includes built-in error handling and fallback responses:

- API failures return a fallback message
- Invalid API keys are handled gracefully
- Network errors are caught and logged

## Testing

To test the migration:

1. Set up your Gemini API key in the `.env` file
2. Run the development server: `bun dev`
3. Test the chat functionality in the application
4. Verify that all AI-powered features work correctly

## Troubleshooting

### Common Issues

1. **API Key Not Found**: Ensure `GEMINI_API_KEY` is set in your `.env` file
2. **Network Errors**: Check your internet connection and API key validity
3. **Rate Limits**: Gemini has rate limits; consider implementing retry logic for production

### Debugging

Enable debug logging by adding this to your Gemini service:

```typescript
// In gemini-service.ts
console.log('Gemini API request:', messages);
console.log('Gemini API response:', response);
```

## Future Enhancements

Consider these improvements for production use:

1. **Redis Integration**: Replace in-memory session storage with Redis
2. **Rate Limiting**: Implement rate limiting for API calls
3. **Caching**: Add response caching for better performance
4. **Monitoring**: Add monitoring and alerting for API usage
5. **Multiple Models**: Support for different Gemini models (gemini-pro, gemini-ultra)

## Support

For issues related to the Gemini API:
- [Google AI Studio Documentation](https://ai.google.dev/docs)
- [Gemini API Reference](https://ai.google.dev/api)

For project-specific issues, please refer to the project documentation or create an issue in the repository.