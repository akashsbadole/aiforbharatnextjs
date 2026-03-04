import { NextRequest, NextResponse } from 'next/server';
import GeminiService from '@/lib/gemini-service';
import { db } from '@/lib/db';
import {
  processWithIntelligence,
  generateStructuredResponse,
  ConversationContext,
  IntelligenceLevel,
  intelligenceLevelDescriptions,
  AgentRole,
  StructuredMedicalResponse
} from '@/lib/agent-system';
import { executeTool } from '@/lib/agent-tools';

// Session storage for conversations (in-memory, consider Redis for production)
const sessions = new Map<string, ConversationContext>();

// Language-specific system prompts
const languagePrompts: Record<string, string> = {
  hi: `आप स्वास्थ्य मित्र हैं, भारत के लिए एक AI स्वास्थ्य सहायक।
  
आपकी क्षमताएं:
1. लक्षण विश्लेषण - बुखार, सर्दी, खांसी आदि का विश्लेषण
2. घरेलू उपचार - आयुर्वेदिक और घरेलू नुस्खे
3. आपातकालीन मार्गदर्शन - आपातकालीन स्थिति में 108 पर कॉल करें
4. सरकारी योजनाएं - आयुष्मान भारत, PMJAY की जानकारी
5. टीकाकरण - बच्चों और वयस्कों के टीके
6. स्वास्थ्य केंद्र - नजदीकी अस्पताल और PHC की जानकारी

महत्वपूर्ण:
- आप डॉक्टर नहीं हैं, हमेशा डॉक्टर से मिलने की सलाह दें
- आपातकालीन स्थिति में "🚨 तुरंत 108 पर कॉल करें" बोलें
- स्थानीय भाषा में सरल शब्दों में जवाब दें
- भारतीय संदर्भ के अनुसार उपचार सुझाएं`,

  mr: `तुम्ही स्वास्थ्य मित्र आहात, भारतासाठी एक AI आरोग्य सहायक.

तुमच्या क्षमता:
1. लक्षणे विश्लेषण - ताप, सर्दी, खोकला यांचे विश्लेषण
2. घरगुती उपचार - आयुर्वेदिक आणि घरगुती उपाय
3. आपत्कालीन मार्गदर्शन - आपत्कालीन परिस्थितीत 108 वर कॉल करा
4. सरकारी योजना - आयुष्मान भारत, PMJAY माहिती
5. लसीकरण - मुलांच्या आणि प्रौढांच्या लसी
6. आरोग्य केंद्र - जवळचे हॉस्पिटल आणि PHC माहिती

महत्त्वाचे:
- तुम्ही डॉक्टर नाही, नेहमी डॉक्टरांना भेटण्याचा सल्ला द्या
- आपत्कालीन परिस्थितीत "🚨 लगेच 108 वर कॉल करा" म्हणा
- मराठीत सोप्या शब्दात उत्तर द्या
- भारतीय संदर्भानुसार उपचार सुचवा`,

  ta: `நீங்கள் சுவாஸ்திய மித்ரா, இந்தியாவிற்கான AI சுகாதார உதவியாளர்.

உங்கள் திறன்கள்:
1. அறிகுறி பகுப்பாய்வு - காய்ச்சல், சளி, இருமல் பகுப்பாய்வு
2. வீட்டு மருத்துவம் - ஆயுர்வேத மற்றும் வீட்டு வைத்தியம்
3. அவசர வழிகாட்டுதல் - அவசர சூழ்நிலையில் 108 ஐ அழைக்கவும்
4. அரசு திட்டங்கள் - ஆயுஷ்மான் பாரத், PMJAY தகவல்
5. தடுப்பூசி - குழந்தைகள் மற்றும் பெரியவர்களுக்கான தடுப்பூசிகள்
6. சுகாதார மையங்கள் - அருகிலுள்ள மருத்துவமனை மற்றும் PHC தகவல்

முக்கியமானவை:
- நீங்கள் மருத்துவர் அல்ல, எப்போதும் மருத்துவரை சந்திக்க அறிவுறுத்துங்கள்
- அவசர சூழ்நிலையில் "🚨 உடனடியாக 108 ஐ அழைக்கவும்" என்று சொல்லுங்கள்
- தமிழில் எளிய சொற்களில் பதிலளியுங்கள்
- இந்திய சூழலுக்கு ஏற்ற சிகிச்சைகளை பரிந்துரையுங்கள்`,

  en: `You are Swasthya Mitra, an AI Health Assistant for India.

Key capabilities:
1. Symptom Analysis - Analyze fever, cold, cough, and other symptoms
2. Home Remedies - Ayurvedic and home remedies
3. Emergency Guidance - Call 108 for emergencies
4. Government Schemes - Ayushman Bharat, PMJAY information
5. Vaccination - Child and adult vaccines
6. Health Centers - Nearby hospital and PHC information

IMPORTANT:
- You are NOT a doctor, always recommend consulting a doctor
- For emergencies, say "🚨 CALL 108 IMMEDIATELY"
- Respond in simple, clear language
- Suggest treatments appropriate for Indian context`
};

// Emergency detection
function detectEmergency(message: string, language: string): { isEmergency: boolean; severity: string } {
  const emergencyKeywords = {
    en: ['emergency', 'help me', "can't breathe", 'chest pain', 'bleeding', 'unconscious', 'heart attack', 'stroke', 'severe pain', 'suicide', 'overdose'],
    hi: ['आपातकालीन', 'सांस नहीं', 'सीने में दर्द', 'दिल का दौरा', 'बहुत दर्द', 'बेहोश', 'खून', 'आत्महत्या'],
    mr: ['आपत्कालीन', 'श्वास घेता', 'छातीत दुखणे', 'हृदयविकार', 'रक्तस्त्राव', 'बेशुद्ध'],
    ta: ['அவசரம்', 'மூச்சு விட', 'மார்பு வலி', 'மாரடைப்பு', 'இரத்தம்', 'மயக்கம்']
  };
  
  const lowerMessage = message.toLowerCase();
  const keywords = [...(emergencyKeywords[language] || []), ...emergencyKeywords.en];
  
  for (const keyword of keywords) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      // Determine severity
      const criticalKeywords = ["can't breathe", 'heart attack', 'stroke', 'unconscious', 'severe bleeding'];
      const isCritical = criticalKeywords.some(k => lowerMessage.includes(k));
      
      return {
        isEmergency: true,
        severity: isCritical ? 'critical' : 'high'
      };
    }
  }
  
  return { isEmergency: false, severity: 'low' };
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { 
      message, 
      sessionId, 
      language = 'hi', 
      userId, 
      imageBase64,
      intelligenceLevel = 5, // Default to multi-agent
      feedback // Optional feedback for previous message
    } = data;

    // Support Hindi, Marathi, Tamil, and English
    const supportedLanguages = ['hi', 'mr', 'ta', 'en'];
    const lang = supportedLanguages.includes(language) ? language : 'hi';
    const intelLevel = Math.min(Math.max(intelligenceLevel, 1), 7) as IntelligenceLevel;

    // Handle feedback submission
    if (feedback && sessionId) {
      const session = sessions.get(sessionId);
      if (session) {
        session.feedbackHistory.push({
          messageId: feedback.messageId,
          rating: feedback.rating,
          wasHelpful: feedback.wasHelpful,
          feedback: feedback.text
        });
        
        // Save to database
        try {
          await db.feedback.create({
            data: {
              type: 'feedback',
              subject: `Chat Feedback - ${feedback.rating}/5 stars`,
              description: feedback.text || `Rating: ${feedback.rating}/5, Helpful: ${feedback.wasHelpful}`,
              userId: userId || null,
              status: 'pending'
            }
          });
        } catch {
          // Feedback save failed, continue
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Thank you for your feedback!' 
        });
      }
    }

    if (!message && !imageBase64) {
      return NextResponse.json({ 
        success: false, 
        error: 'Message or image is required' 
      }, { status: 400 });
    }

    // Get or create session
    const sid = sessionId || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let session = sessions.get(sid);

    if (!session || Date.now() - new Date(session.messages[0]?.role === 'system' ? 0 : Date.now()).getTime() > 30 * 60 * 1000) {
      session = {
        sessionId: sid,
        messages: [],
        language: lang,
        intelligenceLevel: intelLevel,
        feedbackHistory: [],
        learningInsights: []
      };
    }

    // Update session settings
    session.language = lang;
    session.intelligenceLevel = intelLevel;

    // Get user profile if authenticated
    if (userId && !session.userProfile) {
      try {
        const user = await db.user.findUnique({
          where: { id: userId },
          include: {
            patients: { take: 1 }
          }
        });
        
        if (user) {
          session.userProfile = {
            id: user.id,
            name: user.name,
            location: user.district ? { district: user.district, state: user.state || '' } : undefined
          };
        }
      } catch {
        // User lookup failed
      }
    }

    // Detect emergency
    const emergencyCheck = detectEmergency(message || '', lang);
    const isEmergency = emergencyCheck.isEmergency;

    // Process with intelligence system - generate structured response
    const result = await generateStructuredResponse(
      message || 'Analyze this health-related image',
      session,
      imageBase64
    );

    // Update session
    session.messages.push(
      { role: 'user', content: message || '[Image uploaded]' },
      { 
        role: 'assistant', 
        content: result.response,
        agentRole: result.agentRole,
        toolsUsed: result.toolsUsed,
        reasoning: result.reasoning
      }
    );
    sessions.set(sid, session);

    // Save to database if user is authenticated
    if (userId) {
      try {
        await db.chatHistory.create({
          data: {
            sessionId: sid,
            userId,
            role: 'user',
            content: message || '[Image uploaded]',
            inputType: imageBase64 ? 'image' : 'text'
          }
        });
        await db.chatHistory.create({
          data: {
            sessionId: sid,
            userId,
            role: 'assistant',
            content: result.response
          }
        });
      } catch {
        // Chat history save failed, continue
      }
    }

    // Prepare response with structured medical data
    const responseData = {
      success: true,
      response: result.response,
      structuredResponse: result.structuredResponse,
      sessionId: sid,
      language: lang,
      intelligenceLevel: intelLevel,
      intelligenceLevelDescription: intelligenceLevelDescriptions[intelLevel],
      agentRole: result.agentRole,
      toolsUsed: result.toolsUsed,
      reasoning: result.reasoning,
      insights: result.insights,
      isEmergency,
      emergencySeverity: emergencyCheck.severity,
      suggestedActions: getSuggestedActions(result.response, lang, isEmergency),
      emergencyNumbers: {
        ambulance: '108',
        emergency: '112',
        women_helpline: '181',
        child_helpline: '1098',
        poison_control: '1066',
        mental_health: '9152987821'
      },
      messageId: `${sid}-${session.messages.length - 1}`,
      availableIntelligenceLevels: Object.entries(intelligenceLevelDescriptions).map(([level, desc]) => ({
        level: Number(level),
        description: desc
      }))
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Chat error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process your request',
      fallbackResponse: {
        hi: 'क्षमा करें, मुझे कुछ समस्या हो रही है। आपातकालीन स्थिति में 108 पर कॉल करें।',
        mr: 'क्षमा करा, मला काही समस्या येत आहे. आपत्कालीन परिस्थितीत 108 वर कॉल करा.',
        ta: 'மன்னிக்கவும், சில சிக்கல் ஏற்பட்டது. அவசர சூழ்நிலையில் 108 ஐ அழைக்கவும்.',
        en: 'Sorry, I encountered an issue. For emergencies, call 108.'
      },
      emergencyNumbers: { 
        ambulance: '108', 
        emergency: '112',
        women_helpline: '181',
        child_helpline: '1098'
      }
    }, { status: 500 });
  }
}

function getSuggestedActions(response: string, lang: string, isEmergency: boolean): Array<{ action: string; label: string; icon: string }> {
  const labels = {
    hi: {
      call_108: '108 पर कॉल करें',
      find_hospital: 'अस्पताल खोजें',
      book_appointment: 'डॉक्टर से मिलें',
      check_symptoms: 'लक्षण जांचें',
      view_remedies: 'घरेलू उपाय'
    },
    mr: {
      call_108: '108 वर कॉल करा',
      find_hospital: 'हॉस्पिटल शोधा',
      book_appointment: 'डॉक्टरांना भेटा',
      check_symptoms: 'लक्षणे तपासा',
      view_remedies: 'घरगुती उपाय'
    },
    ta: {
      call_108: '108 ஐ அழைக்கவும்',
      find_hospital: 'மருத்துவமனை கண்டறியவும்',
      book_appointment: 'மருத்துவரை சந்திக்கவும்',
      check_symptoms: 'அறிகுறிகளை சரிபார்க்கவும்',
      view_remedies: 'வீட்டு வைத்தியம்'
    },
    en: {
      call_108: 'Call 108',
      find_hospital: 'Find Hospital',
      book_appointment: 'See Doctor',
      check_symptoms: 'Check Symptoms',
      view_remedies: 'Home Remedies'
    }
  };
  
  const l = labels[lang as keyof typeof labels] || labels.en;
  const actions: Array<{ action: string; label: string; icon: string }> = [];
  
  if (isEmergency) {
    actions.push({ action: 'call_108', label: l.call_108, icon: 'phone' });
  }
  
  actions.push({ action: 'find_hospital', label: l.find_hospital, icon: 'map' });
  actions.push({ action: 'book_appointment', label: l.book_appointment, icon: 'calendar' });
  
  if (response.toLowerCase().includes('remedy') || response.includes('उपाय') || response.includes('उपचार')) {
    actions.push({ action: 'view_remedies', label: l.view_remedies, icon: 'heart' });
  }
  
  return actions;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json({
      success: false,
      error: 'Session ID required'
    }, { status: 400 });
  }
  
  const session = sessions.get(sessionId);
  
  return NextResponse.json({
    success: !!session,
    session: session ? {
      messages: session.messages,
      language: session.language,
      intelligenceLevel: session.intelligenceLevel,
      userProfile: session.userProfile
    } : null
  });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  
  if (sessionId) {
    sessions.delete(sessionId);
  }
  
  return NextResponse.json({ success: true });
}
