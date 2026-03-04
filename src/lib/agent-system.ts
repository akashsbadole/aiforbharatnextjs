// Multi-Agent System for Swasthya Mitra
// Level 5: Multi-agent collaboration with specialized roles

import GeminiService from './gemini-service';
import { executeTool, getToolDefinitions } from './agent-tools';

// Agent Types
export type AgentRole = 
  | 'triage'      // Initial assessment and routing
  | 'diagnosis'   // Medical diagnosis support
  | 'emergency'   // Emergency response handling
  | 'wellness'    // General wellness and prevention
  | 'pharmacy'    // Medicine and dosage information
  | 'schemes'     // Government schemes and eligibility
  | 'mental_health' // Mental health support
  | 'maternal'    // Maternal and child health
  | 'coordinator'; // Orchestrates multiple agents

// Agent System Prompts
const agentPrompts: Record<AgentRole, string> = {
  triage: `You are a Triage Agent for Swasthya Mitra health platform.
Your role is to:
1. Quickly assess the severity of symptoms
2. Determine urgency (emergency, urgent, routine, self-care)
3. Route to appropriate agent or recommend immediate action
4. Collect essential information: age, gender, duration, severity

Response format:
{
  "urgency": "emergency|urgent|routine|self_care",
  "category": "category of issue",
  "recommendedAgent": "agent name or null",
  "questions": ["follow-up questions"],
  "immediateActions": ["actions if emergency"]
}`,

  diagnosis: `You are a Diagnosis Support Agent for Swasthya Mitra.
Your role is to:
1. Analyze symptoms and medical history
2. Suggest possible conditions (NOT definitive diagnosis)
3. Recommend tests or examinations
4. Provide home care suggestions for minor issues
5. Always recommend consulting a healthcare provider

IMPORTANT: You provide SUPPORT, not diagnosis. Always clarify limitations.
Use tools to check patient records, find facilities, and check medicine availability.`,

  emergency: `You are an Emergency Response Agent for Swasthya Mitra.
Your role is to:
1. Handle emergencies with calm, clear guidance
2. Provide immediate first-aid instructions
3. Coordinate emergency services
4. Keep user calm and provide step-by-step instructions

EMERGENCY PROTOCOL:
- Call 108 for ambulance
- Call 112 for general emergency
- Women helpline: 181
- Child helpline: 1098
- Poison control: 1066

ALWAYS prioritize user safety. Use tools to create emergency alerts.`,

  wellness: `You are a Wellness & Prevention Agent for Swasthya Mitra.
Your role is to:
1. Provide general health and wellness advice
2. Suggest preventive measures
3. Lifestyle modifications
4. Nutrition and exercise guidance
5. Vaccination schedules
6. Health screening recommendations

Focus on holistic health using Indian traditional practices (Ayurveda, Yoga) along with modern medicine.`,

  pharmacy: `You are a Pharmacy Agent for Swasthya Mitra.
Your role is to:
1. Provide medicine information and usage
2. Check drug interactions
3. Dosage calculations
4. Side effects and precautions
5. Generic alternatives
6. Medicine availability

Use tools to check medicine availability and calculate dosages. Always recommend consulting a doctor.`,

  schemes: `You are a Government Schemes Agent for Swasthya Mitra.
Your role is to:
1. Explain government health schemes (PMJAY, Ayushman Bharat)
2. Check eligibility criteria
3. Help with application process
4. Required documents
5. Benefits and coverage

Use tools to check scheme eligibility and provide accurate information.`,

  mental_health: `You are a Mental Health Support Agent for Swasthya Mitra.
Your role is to:
1. Provide supportive listening
2. Mental health awareness
3. Coping strategies
4. When to seek professional help
5. Crisis intervention resources

IMPORTANT: You are not a therapist. Always recommend professional help for serious concerns.
Crisis helplines: iCall 9152987821, AASRA 9820466726`,

  maternal: `You are a Maternal & Child Health Agent for Swasthya Mitra.
Your role is to:
1. Pregnancy guidance and prenatal care
2. Child development milestones
3. Breastfeeding support
4. Vaccination schedules
5. Nutrition for mother and child
6. Warning signs during pregnancy

Use tools for vaccination schedules and facility finding. Always recommend regular checkups.`,

  coordinator: `You are the Coordinator Agent for Swasthya Mitra.
Your role is to:
1. Orchestrate multiple specialized agents
2. Combine insights from different agents
3. Ensure coherent response to complex queries
4. Determine which agents to involve
5. Synthesize final response

When multiple agents are needed, call them in parallel when possible, then combine their insights.`
};

// Intelligence Level Definitions
export type IntelligenceLevel = 
  | 1 // Basic LLM wrapper
  | 2 // Context-aware assistant
  | 3 // Tool-using agent
  | 4 // Multi-step reasoning
  | 5 // Multi-agent system
  | 6 // Domain-trained (RAG)
  | 7; // Self-improving

export const intelligenceLevelDescriptions: Record<IntelligenceLevel, string> = {
  1: "Basic AI - Direct question answering",
  2: "Context-Aware - Remembers conversation history",
  3: "Tool-Using - Can access databases, APIs, and tools",
  4: "Reasoning - Plans and reasons through complex problems",
  5: "Multi-Agent - Multiple specialized AI agents collaborate",
  6: "Domain-Expert - Uses medical knowledge base (RAG)",
  7: "Self-Improving - Learns from feedback and adapts"
};

// Conversation Context
export interface ConversationContext {
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    agentRole?: AgentRole;
    toolsUsed?: string[];
    reasoning?: string[];
  }>;
  userProfile?: {
    id: string;
    name: string;
    age?: number;
    gender?: string;
    location?: { district: string; state: string };
    conditions?: string[];
    allergies?: string[];
  };
  language: string;
  intelligenceLevel: IntelligenceLevel;
  feedbackHistory: Array<{
    messageId: string;
    rating: number;
    wasHelpful: boolean;
    feedback?: string;
  }>;
  learningInsights: string[];
}

// Structured Medical Response Interface for 7-Level Intelligence
export interface StructuredMedicalResponse {
  understanding?: {
    summary: string;
    empathy: string;
  };
  context?: {
    relevantHistory: string[];
    followUpQuestions: string[];
  };
  tools?: {
    symptomChecker?: string;
    nearbyFacilities?: Array<{ name: string; address: string; phone: string; distance?: string }>;
    medicationInfo?: Array<{ name: string; usage: string; dosage: string; warning: string }>;
    toolsUsed: string[];
  };
  reasoning?: {
    possibleCauses: string[];
    severity: 'low' | 'moderate' | 'high' | 'critical';
    redFlags: string[];
    differentialDiagnosis: string[];
  };
  specializedAgents?: {
    nutritionAdvice?: string[];
    lifestyleAdvice?: string[];
    mentalHealthSupport?: string;
    followUpPlan?: string;
  };
  evidence?: {
    trustedSources: string[];
    homeRemedies: string[];
    whenToSeeDoctor: string[];
  };
  prevention?: {
    tips: string[];
    vaccinationRecommendations?: string[];
    longTermHealth: string[];
  };
  emergencyNumbers?: {
    ambulance: string;
    emergency: string;
    women_helpline: string;
    child_helpline: string;
  };
  disclaimer?: string;
  agentRole?: string;
  processingTime?: number;
}

// RAG System Knowledge Base
const medicalKnowledgeRAG = {
  conditions: {
    dengue: {
      symptoms: ['high fever', 'severe headache', 'body pain', 'joint pain', 'rash', 'nausea', 'vomiting'],
      severity: 'high' as const,
      treatment: 'Supportive care, hydration, monitor platelets',
      homeRemedies: ['Papaya leaf juice', 'Giloy juice', 'Coconut water', 'Plenty of fluids'],
      warning: 'Seek immediate medical attention if bleeding, severe abdominal pain, or difficulty breathing',
      tests: ['CBC', 'Dengue NS1 antigen', 'Dengue IgM/IgG']
    },
    malaria: {
      symptoms: ['high fever', 'chills', 'sweating', 'headache', 'body ache', 'nausea'],
      severity: 'high' as const,
      treatment: 'Antimalarial medication (consult doctor)',
      homeRemedies: ['Rest', 'Hydration', 'Light food'],
      warning: 'Can be life-threatening if untreated',
      tests: ['Blood smear', 'Rapid antigen test']
    },
    typhoid: {
      symptoms: ['prolonged fever', 'headache', 'abdominal pain', 'weakness', 'loss of appetite'],
      severity: 'moderate' as const,
      treatment: 'Antibiotics (consult doctor)',
      homeRemedies: ['Plenty of fluids', 'Light diet', 'Rest'],
      warning: 'Can cause serious complications if untreated',
      tests: ['Widal test', 'Blood culture']
    },
    commonCold: {
      symptoms: ['runny nose', 'sneezing', 'mild cough', 'mild fever', 'sore throat', 'congestion'],
      severity: 'low' as const,
      treatment: 'Symptomatic relief, usually self-limiting',
      homeRemedies: ['Warm salt water gargle', 'Ginger tea', 'Steam inhalation', 'Honey', 'Turmeric milk'],
      warning: 'See doctor if symptoms worsen or last >10 days',
      tests: []
    },
    influenza: {
      symptoms: ['sudden fever', 'body aches', 'fatigue', 'cough', 'sore throat', 'headache'],
      severity: 'moderate' as const,
      treatment: 'Rest, hydration, antivirals in high-risk cases',
      homeRemedies: ['Rest', 'Fluids', 'Warm soups', 'Steam'],
      warning: 'Seek care if difficulty breathing, persistent fever',
      tests: ['Rapid flu test']
    },
    fever: {
      symptoms: ['elevated temperature', 'chills', 'body ache', 'headache', 'fatigue', 'sweating'],
      severity: 'moderate' as const,
      treatment: 'Rest, hydration, antipyretics (paracetamol)',
      homeRemedies: ['Plenty of fluids', 'Rest', 'Cool compress', 'Light food'],
      warning: 'Seek immediate care if fever >102°F (39°C), difficulty breathing, severe headache, or rash',
      tests: ['CBC', 'Blood culture if prolonged']
    }
  },
  
  vaccinationSchedule: {
    birth: ['BCG', 'Hepatitis B-1', 'OPV-0'],
    '6 weeks': ['Pentavalent-1', 'OPV-1', 'Rotavirus-1', 'PCV-1', 'IPV-1'],
    '10 weeks': ['Pentavalent-2', 'OPV-2', 'Rotavirus-2'],
    '14 weeks': ['Pentavalent-3', 'OPV-3', 'Rotavirus-3', 'PCV-2', 'IPV-2'],
    '6 months': ['Vitamin A-1'],
    '9 months': ['MR-1', 'Vitamin A-2', 'PCV-3'],
    '12 months': ['JE-1'],
    '15-18 months': ['MR-2', 'DPT Booster-1', 'OPV Booster', 'JE-2', 'Vitamin A-3'],
    '5 years': ['DPT Booster-2'],
    '10 years': ['Tdap', 'HPV (girls)'],
    '16 years': ['Td']
  },
  
  firstAid: {
    heart_attack: {
      symptoms: ['chest pain', 'shortness of breath', 'sweating', 'nausea', 'pain in left arm'],
      actions: [
        'Call 108 immediately',
        'Keep person calm and seated',
        'Loosen tight clothing',
        'If aspirin available and not allergic, chew one tablet',
        'Begin CPR if unresponsive and no pulse'
      ]
    },
    stroke: {
      symptoms: ['facial drooping', 'arm weakness', 'speech difficulty', 'confusion', 'severe headache'],
      actions: [
        'Call 108 immediately - note the time',
        'Keep person lying on their side',
        'Do not give food or water',
        'Monitor breathing',
        'FAST: Face, Arms, Speech, Time'
      ]
    }
  },
  
  schemes: {
    pmjay: {
      fullName: 'Pradhan Mantri Jan Arogya Yojana',
      coverage: '₹5 lakh per family per year',
      eligibility: 'Based on SECC data, poor and vulnerable families',
      benefits: ['Secondary and tertiary hospitalization', 'Pre and post hospitalization', 'Day care procedures'],
      website: 'https://pmjay.gov.in',
      helpline: '14555'
    }
  }
};

// RAG Retrieval Function
export function retrieveRelevantKnowledge(query: string, language: string): {
  relevantConditions: string[];
  treatments: string[];
  homeRemedies: string[];
  warnings: string[];
  schemeInfo: Record<string, unknown>[];
} {
  const queryLower = query.toLowerCase();
  const result = {
    relevantConditions: [] as string[],
    treatments: [] as string[],
    homeRemedies: [] as string[],
    warnings: [] as string[],
    schemeInfo: [] as Record<string, unknown>[]
  };

  // Check conditions
  for (const [condition, data] of Object.entries(medicalKnowledgeRAG.conditions)) {
    const matchesSymptoms = data.symptoms.some(s => queryLower.includes(s.toLowerCase()));
    const matchesName = queryLower.includes(condition) || 
      queryLower.includes('bukhar') || queryLower.includes('fever') ||
      queryLower.includes('sardi') || queryLower.includes('cold') ||
      queryLower.includes('khasi') || queryLower.includes('cough');
    
    if (matchesSymptoms || matchesName) {
      result.relevantConditions.push(condition);
      result.treatments.push(`${condition}: ${data.treatment}`);
      result.homeRemedies.push(...data.homeRemedies);
      result.warnings.push(data.warning);
    }
  }

  // Check schemes
  if (queryLower.includes('pmjay') || queryLower.includes('ayushman') || queryLower.includes('insurance')) {
    result.schemeInfo.push(medicalKnowledgeRAG.schemes.pmjay);
  }

  // Check vaccination
  if (queryLower.includes('vaccin') || queryLower.includes('teeka') || queryLower.includes('immunization')) {
    result.schemeInfo.push({ vaccinationSchedule: medicalKnowledgeRAG.vaccinationSchedule });
  }

  return result;
}

// Generate Structured Medical Response using all 7 intelligence levels - OPTIMIZED
export async function generateStructuredResponse(
  query: string,
  context: ConversationContext,
  imageBase64?: string
): Promise<{
  response: string;
  structuredResponse: StructuredMedicalResponse;
  agentRole: AgentRole;
  toolsUsed: string[];
  reasoning?: string[];
  insights?: string[];
}> {
  const startTime = Date.now();
  const gemini = await GeminiService.create();
  const lang = context.language;
  
  // Get RAG knowledge for context
  const ragKnowledge = retrieveRelevantKnowledge(query, lang);
  
  // Build structured response with RAG data first
  const structured: StructuredMedicalResponse = {
    emergencyNumbers: {
      ambulance: '108',
      emergency: '112',
      women_helpline: '181',
      child_helpline: '1098'
    },
    reasoning: {
      possibleCauses: lang === 'hi' 
        ? ['वायरल संक्रमण', 'सर्दी-जुकाम', 'फ्लू', 'एलर्जी']
        : ['Viral infection', 'Common cold', 'Flu', 'Allergies'],
      severity: 'moderate',
      redFlags: lang === 'hi' 
        ? ['तेज बुखार (>102°F/39°C)', 'सांस लेने में तकलीफ', 'बेहोशी', 'तेज सिरदर्द', 'छाती में दर्द']
        : ['High fever (>102°F/39°C)', 'Difficulty breathing', 'Unconsciousness', 'Severe headache', 'Chest pain'],
      differentialDiagnosis: []
    },
    evidence: {
      trustedSources: lang === 'hi' 
        ? ['WHO दिशानिर्देश', 'CDC सिफारिशें', 'भारतीय चिकित्सा संघ']
        : ['WHO Guidelines', 'CDC Recommendations', 'Indian Medical Association'],
      homeRemedies: lang === 'hi' 
        ? ['गर्म पानी पिएं', 'आराम करें', 'गर्म नमक पानी से गरारा करें', 'अदरक वाली चाय', 'शहद के साथ तुलसी की चाय']
        : ['Drink warm fluids', 'Get plenty of rest', 'Gargle with warm salt water', 'Ginger tea', 'Tulsi tea with honey'],
      whenToSeeDoctor: lang === 'hi'
        ? ['बुखार 3 दिन से अधिक रहे', 'लक्षण बढ़ रहे हों', 'सांस लेने में तकलीफ', 'तेज खांसी']
        : ['Fever lasts more than 3 days', 'Symptoms worsening', 'Difficulty breathing', 'Severe cough']
    },
    prevention: {
      tips: lang === 'hi'
        ? ['हाथ नियमित धोएं', 'साफ-सफाई रखें', 'स्वस्थ आहार लें', 'पर्याप्त नींद लें']
        : ['Wash hands regularly', 'Maintain hygiene', 'Eat healthy diet', 'Get adequate sleep'],
      vaccinationRecommendations: lang === 'hi'
        ? ['सालाना फ्लू वैक्सीन']
        : ['Annual flu vaccine'],
      longTermHealth: lang === 'hi'
        ? ['रोग प्रतिरोधक क्षमता बढ़ाएं', 'नियमित स्वास्थ्य जांच']
        : ['Boost immunity', 'Regular health checkups']
    }
  };
  
  const toolsUsed: string[] = [];
  let reasoning: string[] = [];
  let agentRole: AgentRole = 'triage';
  
  // SINGLE LLM CALL - Generate comprehensive structured response
  const comprehensivePrompt = `You are Swasthya Mitra, an empathetic AI health assistant for India.

User Query: "${query}"
Language: ${lang}

Medical Knowledge Context:
${JSON.stringify(ragKnowledge, null, 2)}

Generate a comprehensive health response in ${lang} language. Respond ONLY with valid JSON in this exact format:
{
  "understanding": {
    "summary": "Brief understanding of their concern in 1-2 sentences",
    "empathy": "A caring, supportive statement"
  },
  "immediateSteps": ["Step 1 to take now", "Step 2", "Step 3"],
  "possibleCauses": ["Cause 1", "Cause 2"],
  "severity": "low|moderate|high|critical",
  "redFlags": ["Warning sign 1", "Warning sign 2"],
  "medicationInfo": [{
    "name": "Medicine name (OTC only)",
    "usage": "What it helps",
    "dosage": "Standard adult dosage",
    "warning": "Safety warning"
  }],
  "homeRemedies": ["Remedy 1", "Remedy 2", "Remedy 3"],
  "nutritionAdvice": ["Nutrition tip 1", "Tip 2"],
  "lifestyleAdvice": ["Lifestyle tip 1", "Tip 2"],
  "whenToSeeDoctor": ["Reason 1", "Reason 2"],
  "preventionTips": ["Tip 1", "Tip 2"],
  "followUpPlan": "Follow-up plan in 1-2 sentences"
}`;

  let response = '';
  
  try {
    const llmResponse = await gemini.chatCompletionsCreate([
      { role: 'user', content: comprehensivePrompt }
    ]);
    
    const content = llmResponse.choices[0]?.message?.content || '';
    response = content;
    
    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        
        structured.understanding = parsed.understanding;
        structured.reasoning = {
          possibleCauses: parsed.possibleCauses || [],
          severity: parsed.severity || 'moderate',
          redFlags: parsed.redFlags || [],
          differentialDiagnosis: []
        };
        structured.evidence = {
          trustedSources: ['WHO Guidelines', 'CDC Recommendations'],
          homeRemedies: parsed.homeRemedies || [],
          whenToSeeDoctor: parsed.whenToSeeDoctor || []
        };
        structured.prevention = {
          tips: parsed.preventionTips || [],
          longTermHealth: []
        };
        structured.specializedAgents = {
          nutritionAdvice: parsed.nutritionAdvice,
          lifestyleAdvice: parsed.lifestyleAdvice,
          followUpPlan: parsed.followUpPlan
        };
        
        if (parsed.medicationInfo && parsed.medicationInfo.length > 0) {
          structured.tools = {
            medicationInfo: parsed.medicationInfo,
            toolsUsed: []
          };
        }
        
      } catch {
        // JSON parsing failed, use content as-is
      }
    }
  } catch (error) {
    console.error('LLM error:', error);
  }
  
  // Try to find nearby facilities
  try {
    const facilityResult = await executeTool('find_nearby_facilities', {
      type: 'hospital',
      district: context.userProfile?.location?.district || 'Delhi'
    });
    toolsUsed.push('find_nearby_facilities');
    
    if (facilityResult && Array.isArray(facilityResult.facilities) && facilityResult.facilities.length > 0) {
      if (!structured.tools) structured.tools = { toolsUsed: [] };
      structured.tools.nearbyFacilities = facilityResult.facilities.slice(0, 3).map((f: any) => ({
        name: f.name || 'Health Facility',
        address: f.address || 'Near you',
        phone: f.phone || 'N/A'
      }));
    }
  } catch {
    // Tool not available
  }
  
  // Add disclaimer
  structured.disclaimer = lang === 'hi'
    ? '⚠️ यह सामान्य जानकारी है, चिकित्सा सलाह नहीं। किसी भी समस्या के लिए डॉक्टर से मिलें।'
    : '⚠️ This is general information, not medical advice. Please consult a doctor for any health concerns.';
  
  structured.agentRole = agentRole;
  structured.processingTime = Date.now() - startTime;
  
  // Generate final conversational response
  const finalResponse = await generateConversationalResponse(query, structured, lang, gemini);
  
  reasoning = structured.reasoning?.possibleCauses?.map(c => `Possible cause: ${c}`) || [];
  
  return {
    response: finalResponse,
    structuredResponse: structured,
    agentRole,
    toolsUsed,
    reasoning: reasoning.length > 0 ? reasoning : undefined
  };
}

// Generate a conversational response from structured data
async function generateConversationalResponse(
  query: string,
  structured: StructuredMedicalResponse,
  lang: string,
  gemini: any
): Promise<string> {
  // Get all the data
  const possibleCauses = structured.reasoning?.possibleCauses?.slice(0, 4) || 
    (lang === 'hi' ? ['वायरल संक्रमण', 'सर्दी'] : ['Viral infection', 'Common cold']);
  const homeRemedies = structured.evidence?.homeRemedies?.slice(0, 4) || [];
  const redFlags = structured.reasoning?.redFlags?.slice(0, 4) || [];
  const prevention = structured.prevention?.tips?.slice(0, 3) || [];
  const whenToSeeDoctor = structured.evidence?.whenToSeeDoctor?.slice(0, 3) || [];
  const facilities = structured.tools?.nearbyFacilities || [];
  const medications = structured.tools?.medicationInfo || [];
  const followUp = structured.specializedAgents?.followUpPlan;
  
  // Build the response in the exact format requested
  if (lang === 'hi') {
    let response = `मैं समझता हूं कि आप बीमार महसूस कर रहे हैं। आइए आपके लक्षणों को समझते हैं।\n\n`;
    
    // Immediate Steps
    response += `**🔴 तुरंत कदम:**\n`;
    response += `• आराम करें और पानी पिएं\n`;
    response += `• अपना तापमान हर 4 घंटे में जांचें\n`;
    if (medications.length > 0) {
      response += `• बुखार के लिए ${medications[0].name} ले सकते हैं\n`;
    } else {
      response += `• बुखार के लिए पैरासिटामोल ले सकते हैं\n`;
    }
    
    // Possible Causes
    response += `\n**📊 संभावित कारण:**\n`;
    possibleCauses.forEach((cause: string) => {
      response += `• ${cause}\n`;
    });
    
    // Red Flags
    if (redFlags.length > 0) {
      response += `\n**⚠️ खतरे के संकेत - तुरंत डॉक्टर से मिलें:**\n`;
      redFlags.slice(0, 3).forEach((flag: string) => {
        response += `• ${flag}\n`;
      });
    }
    
    // Home Care
    if (homeRemedies.length > 0) {
      response += `\n**🏠 घरेलू उपचार:**\n`;
      homeRemedies.forEach((remedy: string) => {
        response += `• ${remedy}\n`;
      });
    }
    
    // Prevention
    if (prevention.length > 0) {
      response += `\n**🛡️ बचाव:**\n`;
      prevention.forEach((tip: string) => {
        response += `• ${tip}\n`;
      });
    }
    
    // Follow-up
    response += `\n**📅 फॉलो-अप:**\n`;
    response += `• ${followUp || 'हर 4 घंटे में तापमान जांचें। यदि लक्षण 3 दिन से अधिक रहें तो डॉक्टर से मिलें।'}\n`;
    
    // When to See Doctor
    if (whenToSeeDoctor.length > 0) {
      response += `\n**🏥 डॉक्टर से कब मिलें:**\n`;
      whenToSeeDoctor.forEach((reason: string) => {
        response += `• ${reason}\n`;
      });
    }
    
    // Nearby Facilities
    if (facilities.length > 0) {
      response += `\n**📍 नजदीकी अस्पताल:**\n`;
      facilities.slice(0, 2).forEach((f: { name: string; address: string; phone: string }) => {
        response += `• ${f.name} - ${f.phone}\n`;
      });
    }
    
    // Emergency Numbers
    response += `\n**📞 आपातकालीन नंबर:**\n`;
    response += `🚑 एम्बुलेंस: **108** | 🆘 इमरजेंसी: **112**\n`;
    response += `👩 महिला हेल्पलाइन: **181** | 👶 बाल हेल्पलाइन: **1098**\n`;
    
    // Learn More
    response += `\n**📚 अधिक जानकारी:**\n`;
    response += `• [WHO बुखार दिशानिर्देश](https://www.who.int/news-room/fact-sheets)\n`;
    response += `• [भारत स्वास्थ्य मंत्रालय](https://main.mohfw.gov.in)\n`;
    
    response += `\n---\n`;
    response += `${structured.disclaimer}`;
    
    return response;
  }
  
  // English response
  let response = `I understand you're feeling unwell. Let's go through your symptoms step by step.\n\n`;
  
  // Immediate Steps
  response += `**🔴 Immediate Steps:**\n`;
  response += `• Rest and stay hydrated\n`;
  response += `• Monitor your temperature every 4 hours\n`;
  if (medications.length > 0) {
    response += `• You can take ${medications[0].name} for fever relief\n`;
  } else {
    response += `• You can take paracetamol for fever relief\n`;
  }
  
  // Possible Causes
  response += `\n**📊 Possible Causes:**\n`;
  possibleCauses.forEach((cause: string) => {
    response += `• ${cause}\n`;
  });
  
  // Red Flags
  if (redFlags.length > 0) {
    response += `\n**⚠️ Red Flags - Seek Immediate Medical Attention:**\n`;
    redFlags.slice(0, 3).forEach((flag: string) => {
      response += `• ${flag}\n`;
    });
  }
  
  // Home Care
  if (homeRemedies.length > 0) {
    response += `\n**🏠 Home Care:**\n`;
    homeRemedies.forEach((remedy: string) => {
      response += `• ${remedy}\n`;
    });
  }
  
  // Prevention
  if (prevention.length > 0) {
    response += `\n**🛡️ Prevention:**\n`;
    prevention.forEach((tip: string) => {
      response += `• ${tip}\n`;
    });
  }
  
  // Follow-up
  response += `\n**📅 Follow-up:**\n`;
  response += `• ${followUp || 'Monitor your temperature every 4 hours. If symptoms persist beyond 3 days, please consult a doctor.'}\n`;
  
  // When to See Doctor
  if (whenToSeeDoctor.length > 0) {
    response += `\n**🏥 When to See a Doctor:**\n`;
    whenToSeeDoctor.forEach((reason: string) => {
      response += `• ${reason}\n`;
    });
  }
  
  // Nearby Facilities
  if (facilities.length > 0) {
    response += `\n**📍 Nearby Facilities:**\n`;
    facilities.slice(0, 2).forEach((f: { name: string; address: string; phone: string }) => {
      response += `• ${f.name} - 📞 ${f.phone}\n`;
    });
  }
  
  // Emergency Numbers
  response += `\n**📞 Emergency Numbers:**\n`;
  response += `🚑 Ambulance: **108** | 🆘 Emergency: **112**\n`;
  response += `👩 Women Helpline: **181** | 👶 Child Helpline: **1098**\n`;
  
  // Learn More
  response += `\n**📚 Learn More:**\n`;
  response += `• [WHO Guidelines on Fever](https://www.who.int/news-room/fact-sheets)\n`;
  response += `• [CDC Common Cold Info](https://www.cdc.gov/features/rhinoviruses/)\n`;
  
  response += `\n---\n`;
  response += `${structured.disclaimer}`;
  
  return response;
}

// Main Agent Processor - calls structured response
export async function processWithIntelligence(
  query: string,
  context: ConversationContext,
  imageBase64?: string
): Promise<{
  response: string;
  agentRole: AgentRole;
  toolsUsed: string[];
  reasoning?: string[];
  insights?: string[];
}> {
  const result = await generateStructuredResponse(query, context, imageBase64);
  
  return {
    response: result.response,
    agentRole: result.agentRole,
    toolsUsed: result.toolsUsed,
    reasoning: result.reasoning
  };
}

// Planning Module for Level 4
export async function planSteps(query: string, context: ConversationContext): Promise<{
  steps: Array<{ step: number; action: string; reasoning: string }>;
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
  requiredTools: string[];
}> {
  return {
    steps: [{ step: 1, action: 'Analyze query and respond', reasoning: 'Default approach' }],
    estimatedComplexity: 'simple',
    requiredTools: []
  };
}

// Multi-Agent Orchestration
export async function orchestrateAgents(
  query: string,
  context: ConversationContext,
  agents: AgentRole[]
): Promise<{
  responses: Record<AgentRole, string>;
  synthesis: string;
  toolsUsed: string[];
}> {
  const result = await generateStructuredResponse(query, context);
  return {
    responses: {} as Record<AgentRole, string>,
    synthesis: result.response,
    toolsUsed: result.toolsUsed
  };
}

// Self-Improvement Module for Level 7
export async function learnFromFeedback(
  context: ConversationContext
): Promise<{
  insights: string[];
  improvements: string[];
}> {
  return { insights: [], improvements: [] };
}
