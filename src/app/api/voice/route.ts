import { NextRequest, NextResponse } from 'next/server';
import GeminiService from '@/lib/gemini-service';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get('audio') as File;
    const language = formData.get('language') as string || 'hi';

    if (!audio) {
      return NextResponse.json(
        { success: false, error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Convert audio to base64
    const audioBuffer = await audio.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    // Initialize Gemini Service
    const gemini = await GeminiService.create();

    // Transcribe audio using ASR
    const response = await gemini.audio.asr.create({
      file_base64: base64Audio
    });

    const transcription = response.text;

    // Optionally, translate/transliterate for better understanding
    // For now, return the transcription as-is

    return NextResponse.json({
      success: true,
      transcription,
      language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Voice transcription error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to transcribe audio. Please try again.',
      transcription: ''
    }, { status: 500 });
  }
}

// TTS endpoint for voice responses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text');
    const voice = searchParams.get('voice') || 'tongtong';
    const speed = parseFloat(searchParams.get('speed') || '1.0');

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    // Initialize Gemini Service
    const gemini = await GeminiService.create();

    // Generate speech using TTS
    const response = await gemini.audio.tts.create({
      input: text.substring(0, 1024), // Limit to 1024 chars
      voice: voice as 'tongtong' | 'chuichui' | 'xiaochen' | 'jam' | 'kazi' | 'douji' | 'luodo',
      speed,
      response_format: 'wav',
      stream: false
    });

    // Get audio buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    // Return audio file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('TTS error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate speech'
    }, { status: 500 });
  }
}
