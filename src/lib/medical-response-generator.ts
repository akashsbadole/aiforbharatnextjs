// Medical Response Generator for Swasthya Mitra
// Generates structured 7-level intelligence responses

import GeminiService from './gemini-service';
import { executeTool, getToolDefinitions } from './agent-tools';
import { retrieveRelevantKnowledge } from './agent-system';

export interface StructuredMedicalResponse {
  // Level 1: LLM
  understanding: {
    summary: string;
    empathy: string;
  };
  
  // Level 2: Memory
  context: {
    relevantHistory: string[];
    followUpQuestions: string[];
  };
  
  // Level 3: Tools
  tools: {
    symptomChecker?: string;
    nearbyFacilities?: Array<{ name: string; address: string; phone: string; distance?: string }>;
    medicationInfo?: Array<{ name: string; usage: string; dosage: string; warning: string }>;
    toolsUsed: string[];
  };
  
  // Level 4: Reasoning
  reasoning: {
    possibleCauses: string[];
    severity: 'low' | 'moderate' | 'high' | 'critical';
    redFlags: string[];
    differentialDiagnosis: string[];
  };
  
  // Level 5: Agents
  specializedAgents: {
    nutritionAdvice?: string[];
    lifestyleAdvice?: string[];
    mentalHealthSupport?: string;
    followUpPlan?: string;
  };
  
  // Level 6: RAG
  evidence: {
    trustedSources: string[];
    homeRemedies: string[];
    whenToSeeDoctor: string[];
  };
  
  // Level 7: Learning
  prevention: {
    tips: string[];
    vaccinationRecommendations?: string[];
    longTermHealth: string[];
  };
  
  // Emergency Info
  emergencyNumbers: {
    ambulance: string;
    emergency: string;
    women_helpline: string;
    child_helpline: string;
  };
  
  // Disclaimer
  disclaimer: string;
  
  // Metadata
  agentRole: string;
  processingTime: number;
}

export async function generateStructuredMedicalResponse(
  query: string,
  language: string = 'en',
  userId?: string,
  intelligenceLevel: number = 7
): Promise<StructuredMedicalResponse> {
  const startTime = Date.now();
  const gemini = await GeminiService.create();
  
  // Default response structure
  const response: StructuredMedicalResponse = {
    understanding: {
      summary: '',
      empathy: ''
    },
    context: {
      relevantHistory: [],
      followUpQuestions: []
    },
    tools: {
      toolsUsed: []
    },
    reasoning: {
      possibleCauses: [],
      severity: 'low',
      redFlags: [],
      differentialDiagnosis: []
    },
    specializedAgents: {},
    evidence: {
      trustedSources: [],
      homeRemedies: [],
      whenToSeeDoctor: []
    },
    prevention: {
      tips: [],
      longTermHealth: []
    },
    emergencyNumbers: {
      ambulance: '108',
      emergency: '112',
      women_helpline: '181',
      child_helpline: '1098'
    },
    disclaimer: 'This information is for educational purposes only and is not a substitute for professional medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.',
    agentRole: 'triage',
    processingTime: 0
  };
  
  try {
    // Get RAG knowledge
    const ragKnowledge = retrieveRelevantKnowledge(query, language);
    
    // Build comprehensive prompt for structured response
    const systemPrompt = `You are Swasthya Mitra, an AI health assistant for India. Respond in ${language} language.

Generate a comprehensive medical response with ALL of the following sections. Be thorough and informative.

AVAILABLE KNOWLEDGE:
${JSON.stringify(ragKnowledge, null, 2)}

Respond in JSON format with this exact structure:
{
  "understanding": {
    "summary": "Brief summary of what the user is experiencing",
    "empathy": "A caring, empathetic message"
  },
  "context": {
    "relevantHistory": ["Questions about relevant medical history"],
    "followUpQuestions": ["Specific follow-up questions to ask the user"]
  },
  "reasoning": {
    "possibleCauses": ["List of possible causes"],
    "severity": "low|moderate|high|critical",
    "redFlags": ["Warning signs that need immediate attention"],
    "differentialDiagnosis": ["Other conditions to consider"]
  },
  "specializedAgents": {
    "nutritionAdvice": ["Diet and nutrition recommendations"],
    "lifestyleAdvice": ["Lifestyle modifications"],
    "mentalHealthSupport": "Mental health aspect if relevant",
    "followUpPlan": "Recommended follow-up actions"
  },
  "evidence": {
    "trustedSources": ["References to WHO, CDC, ICMR guidelines"],
    "homeRemedies": ["Evidence-based home remedies"],
    "whenToSeeDoctor": ["Specific conditions when to seek medical help"]
  },
  "prevention": {
    "tips": ["Prevention tips"],
    "vaccinationRecommendations": ["Relevant vaccines"],
    "longTermHealth": ["Long-term health recommendations"]
  },
  "agentRole": "triage|diagnosis|emergency|wellness|pharmacy|schemes|mental_health|maternal"
}`;

    const completion = await gemini.chatCompletionsCreate([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query }
    ]);
    
    const content = completion.choices[0]?.message?.content || '';
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Merge parsed response with defaults
        if (parsed.understanding) response.understanding = { ...response.understanding, ...parsed.understanding };
        if (parsed.context) response.context = { ...response.context, ...parsed.context };
        if (parsed.reasoning) response.reasoning = { ...response.reasoning, ...parsed.reasoning };
        if (parsed.specializedAgents) response.specializedAgents = { ...response.specializedAgents, ...parsed.specializedAgents };
        if (parsed.evidence) response.evidence = { ...response.evidence, ...parsed.evidence };
        if (parsed.prevention) response.prevention = { ...response.prevention, ...parsed.prevention };
        if (parsed.agentRole) response.agentRole = parsed.agentRole;
      } catch {
        // If JSON parsing fails, use the raw content as understanding
        response.understanding.summary = content;
      }
    }
    
    // Level 3: Execute tools if needed
    if (intelligenceLevel >= 3) {
      // Check for facility search intent
      if (query.toLowerCase().includes('hospital') || query.toLowerCase().includes('clinic') || 
          query.toLowerCase().includes('अस्पताल') || query.toLowerCase().includes('doctor')) {
        try {
          const facilityResult = await executeTool('find_nearby_facilities', { limit: 3 });
          if (facilityResult && typeof facilityResult === 'object' && 'facilities' in facilityResult) {
            response.tools.nearbyFacilities = (facilityResult as any).facilities.map((f: any) => ({
              name: f.name,
              address: f.address,
              phone: f.phone,
              distance: f.distance || 'Nearby'
            }));
            response.tools.toolsUsed.push('find_nearby_facilities');
          }
        } catch {
          // Tool execution failed
        }
      }
      
      // Check for medicine info intent
      if (query.toLowerCase().includes('medicine') || query.toLowerCase().includes('दवा') || 
          query.toLowerCase().includes('tablet') || query.toLowerCase().includes('pill')) {
        // Add general medicine info
        response.tools.medicationInfo = [
          {
            name: 'Paracetamol',
            usage: 'For fever and mild pain relief',
            dosage: '500-1000mg every 4-6 hours, max 4g/day',
            warning: 'Do not exceed recommended dose. Consult doctor for children.'
          }
        ];
        response.tools.toolsUsed.push('medication_info');
      }
      
      // Check for scheme eligibility
      if (query.toLowerCase().includes('pmjay') || query.toLowerCase().includes('scheme') || 
          query.toLowerCase().includes('ayushman') || query.toLowerCase().includes('yojana')) {
        try {
          const schemeResult = await executeTool('check_scheme_eligibility', { schemeName: 'PMJAY' });
          if (schemeResult) {
            response.tools.toolsUsed.push('check_scheme_eligibility');
          }
        } catch {
          // Tool execution failed
        }
      }
      
      // Symptom checker tool
      if (query.toLowerCase().includes('symptom') || query.toLowerCase().includes('लक्षण')) {
        response.tools.symptomChecker = 'Based on your symptoms, I recommend monitoring your temperature and seeking medical attention if it exceeds 102°F (39°C) or persists for more than 3 days.';
        response.tools.toolsUsed.push('symptom_analysis');
      }
    }
    
  } catch (error) {
    console.error('Error generating structured response:', error);
    response.understanding.summary = language === 'hi' 
      ? 'मैं आपकी सहायता के लिए यहाँ हूं। कृपया अपने लक्षणों के बारे में और बताएं।'
      : 'I am here to help you. Please tell me more about your symptoms.';
  }
  
  response.processingTime = Date.now() - startTime;
  return response;
}

// Format structured response for display
export function formatStructuredResponse(response: StructuredMedicalResponse, language: string): string {
  const sections: string[] = [];
  
  // Level 1: Understanding
  sections.push(`## 💬 Understanding\n${response.understanding.summary}`);
  if (response.understanding.empathy) {
    sections.push(`*${response.understanding.empathy}*`);
  }
  
  // Level 2: Context
  if (response.context.followUpQuestions.length > 0) {
    sections.push(`\n## 🧠 Context Questions\n${response.context.followUpQuestions.map(q => `• ${q}`).join('\n')}`);
  }
  
  // Level 4: Reasoning
  if (response.reasoning.possibleCauses.length > 0) {
    sections.push(`\n## 📊 Analysis\n**Possible Causes:**\n${response.reasoning.possibleCauses.map(c => `• ${c}`).join('\n')}`);
    
    if (response.reasoning.redFlags.length > 0) {
      sections.push(`\n⚠️ **Red Flags (Seek Immediate Care):**\n${response.reasoning.redFlags.map(r => `• ${r}`).join('\n')}`);
    }
  }
  
  // Level 3: Tools
  if (response.tools.nearbyFacilities && response.tools.nearbyFacilities.length > 0) {
    sections.push(`\n## 🔧 Nearby Facilities\n${response.tools.nearbyFacilities.map(f => `• **${f.name}** - ${f.address} 📞 ${f.phone}`).join('\n')}`);
  }
  
  if (response.tools.medicationInfo && response.tools.medicationInfo.length > 0) {
    sections.push(`\n## 💊 Medication Guide\n${response.tools.medicationInfo.map(m => `• **${m.name}**: ${m.usage}\n  Dosage: ${m.dosage}\n  ⚠️ ${m.warning}`).join('\n')}`);
  }
  
  // Level 5: Specialized Agents
  if (response.specializedAgents.nutritionAdvice && response.specializedAgents.nutritionAdvice.length > 0) {
    sections.push(`\n## 🤖 Nutrition Advice\n${response.specializedAgents.nutritionAdvice.map(n => `• ${n}`).join('\n')}`);
  }
  
  if (response.specializedAgents.lifestyleAdvice && response.specializedAgents.lifestyleAdvice.length > 0) {
    sections.push(`\n## 🤖 Lifestyle Recommendations\n${response.specializedAgents.lifestyleAdvice.map(l => `• ${l}`).join('\n')}`);
  }
  
  // Level 6: Evidence
  if (response.evidence.homeRemedies.length > 0) {
    sections.push(`\n## 📚 Home Remedies (Evidence-Based)\n${response.evidence.homeRemedies.map(h => `• ${h}`).join('\n')}`);
  }
  
  if (response.evidence.whenToSeeDoctor.length > 0) {
    sections.push(`\n## 📚 When to See a Doctor\n${response.evidence.whenToSeeDoctor.map(w => `• ${w}`).join('\n')}`);
  }
  
  // Level 7: Prevention
  if (response.prevention.tips.length > 0) {
    sections.push(`\n## 🎓 Prevention Tips\n${response.prevention.tips.map(p => `• ${p}`).join('\n')}`);
  }
  
  // Emergency Numbers
  sections.push(`\n## 🚨 Emergency Numbers\n📞 Ambulance: **108** | Emergency: **112** | Women Helpline: **181**`);
  
  // Disclaimer
  sections.push(`\n---\n*${response.disclaimer}*`);
  
  return sections.join('\n');
}
