import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Gemini Service Wrapper
// Provides a similar interface to z-ai-web-dev-sdk for easier migration

export interface GeminiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GeminiCompletion {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface GeminiCreateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

// TTS/ASR interfaces for compatibility
export interface TTSOptions {
  input: string;
  voice?: string;
  speed?: number;
  response_format?: string;
  stream?: boolean;
}

export interface ASROptions {
  file_base64: string;
  language?: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(apiKey: string, options: GeminiCreateOptions = {}) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = options.model || 'gemini-pro';
    this.temperature = options.temperature || 0.7;
    this.maxTokens = options.maxTokens || 2048;
  }

  async create(options: GeminiCreateOptions = {}): Promise<GeminiService> {
    // Return a new instance with the same configuration
    return new GeminiService(process.env.GEMINI_API_KEY || '', {
      ...this,
      ...options
    });
  }

  async chatCompletionsCreate(messages: GeminiMessage[], options: GeminiCreateOptions = {}): Promise<GeminiCompletion> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });

      // Configure safety settings
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      // Convert messages to Gemini format
      const geminiMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const result = await model.generateContent({
        contents: geminiMessages,
        generationConfig: {
          temperature: this.temperature,
          topP: options.topP || 1,
          topK: options.topK || 1,
          maxOutputTokens: this.maxTokens,
        },
        safetySettings
      });

      const response = await result.response;
      const text = response.text();

      return {
        choices: [{
          message: {
            content: text
          }
        }]
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Return fallback response
      return {
        choices: [{
          message: {
            content: 'I apologize, but I encountered an error while processing your request. Please try again later.'
          }
        }]
      };
    }
  }

  static async create(apiKey?: string, options?: GeminiCreateOptions): Promise<GeminiService> {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('Gemini API key is required. Please set GEMINI_API_KEY environment variable.');
    }
    return new GeminiService(key, options);
  }

  // Audio property for TTS/ASR compatibility (mock implementations)
  get audio() {
    return {
      // Text-to-Speech - Mock implementation (returns empty audio buffer)
      tts: {
        create: async (options: TTSOptions): Promise<Response> => {
          console.warn('TTS not supported by Gemini. Using mock implementation.');
          // Return empty WAV file (44 bytes header for empty mono 8kHz WAV)
          const wavHeader = Buffer.from([
            0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
            0x66, 0x6D, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
            0x40, 0x1F, 0x00, 0x00, 0x40, 0x1F, 0x00, 0x00, 0x01, 0x00, 0x08, 0x00,
            0x64, 0x61, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00
          ]);
          return new Response(wavHeader, {
            headers: { 'Content-Type': 'audio/wav' }
          });
        }
      },
      // Automatic Speech Recognition - Mock implementation
      asr: {
        create: async (options: ASROptions): Promise<{ text: string }> => {
          console.warn('ASR not supported by Gemini. Using mock implementation.');
          return { text: '' };
        }
      }
    };
  }
}

// Export default instance for backward compatibility
export default GeminiService;