import { NextRequest, NextResponse } from 'next/server';
import GeminiService from '@/lib/gemini-service';

// TTS - Text to Speech
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { text, speed = 1.0, voice = 'tongtong' } = data;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Text is required'
      }, { status: 400 });
    }

    // Limit text to 1024 characters (API constraint)
    const truncatedText = text.slice(0, 1024);

    const gemini = await GeminiService.create();

    // Generate TTS audio (mock implementation - Gemini doesn't support TTS natively)
    const response = await gemini.audio.tts.create({
      input: truncatedText,
      voice: voice,
      speed: Math.min(Math.max(speed, 0.5), 2.0), // Clamp speed between 0.5 and 2.0
      response_format: 'wav',
      stream: false
    });

    // Get array buffer from Response object
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    // Return audio as response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('TTS error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate speech'
    }, { status: 500 });
  }
}

// GET endpoint to check TTS availability
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'TTS API is available',
    voices: ['tongtong', 'chuichui', 'xiaochen', 'jam', 'kazi', 'douji', 'luodo'],
    speedRange: { min: 0.5, max: 2.0, default: 1.0 },
    maxTextLength: 1024
  });
}
