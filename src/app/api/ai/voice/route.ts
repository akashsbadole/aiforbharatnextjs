import { NextRequest, NextResponse } from 'next/server';
import GeminiService from '@/lib/gemini-service';

// ASR - Speech to Text
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { audioBase64, language = 'hi' } = data;

    if (!audioBase64) {
      return NextResponse.json({
        success: false,
        error: 'Audio data is required'
      }, { status: 400 });
    }

    const gemini = await GeminiService.create();

    // Transcribe audio using ASR (mock implementation - Gemini doesn't support ASR natively)
    const response = await gemini.audio.asr.create({
      file_base64: audioBase64
    });

    const transcribedText = response.text || '';

    // Language-specific response
    const messages = {
      hi: 'ऑडियो सफलतापूर्वक टेक्स्ट में बदला गया',
      mr: 'ऑडिओ यशस्वीरित्या मजकूरात रूपांतरित',
      ta: 'ஆடியோ வெற்றிகரமாக உரையாக மாற்றப்பட்டது',
      en: 'Audio successfully transcribed'
    };

    return NextResponse.json({
      success: true,
      text: transcribedText,
      message: messages[language as keyof typeof messages] || messages.en,
      wordCount: transcribedText.split(/\s+/).filter(Boolean).length
    });

  } catch (error) {
    console.error('ASR error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to transcribe audio'
    }, { status: 500 });
  }
}
