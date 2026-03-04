import { NextRequest, NextResponse } from 'next/server';
import GeminiService, { GeminiMessage } from '@/lib/gemini-service';

// Store conversation sessions (in production, use Redis or database)
const sessions = new Map<string, Array<GeminiMessage>>();

export async function POST(req: NextRequest) {
  try {
    const { message, language, context, sessionId } = await req.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Initialize Gemini Service
    const gemini = await GeminiService.create();

    // Get or create conversation history
    const sid = sessionId || `session_${Date.now()}`;
    let history = sessions.get(sid) || [];

    // System prompt based on context
    const systemPrompt = `You are Swasthya Mitra, an AI Health Assistant for India's community health platform. You help citizens with:

1. Health queries and symptom understanding
2. Information about government health schemes (Ayushman Bharat, PMJAY)
3. Guidance on required documents (Aadhaar, BPL card, etc.)
4. Finding nearby health facilities
5. Preventive health tips and vaccination schedules
6. Emergency guidance and first aid instructions

Important guidelines:
- Respond in the user's language (Hindi, Tamil, Bengali, Telugu, Marathi, etc.)
- Always recommend consulting healthcare professionals for medical advice
- Be empathetic and clear in your responses
- For emergencies, clearly state emergency steps and provide helpline numbers (108 for ambulance)
- Provide locally relevant information for India

Remember: You are NOT a doctor. Always clarify this is general guidance, not medical diagnosis.`;

    // Build messages array
    const messages: GeminiMessage[] = [
      { role: 'assistant', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    // Get AI response
    const completion = await gemini.chatCompletionsCreate(messages);

    const response = completion.choices[0]?.message?.content || 'I apologize, I could not process your request. Please try again.';

    // Update conversation history
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: response });
    
    // Keep only last 20 messages to manage context
    if (history.length > 20) {
      history = history.slice(-20);
    }
    sessions.set(sid, history);

    return NextResponse.json({
      success: true,
      response,
      sessionId: sid,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process your message. Please try again.',
      response: 'I apologize, I encountered an error. Please try your question again. For emergencies, call 108.'
    }, { status: 500 });
  }
}

// Clear session
export async function DELETE(req: NextRequest) {
  const { sessionId } = await req.json();
  
  if (sessionId) {
    sessions.delete(sessionId);
  }
  
  return NextResponse.json({ success: true });
}
