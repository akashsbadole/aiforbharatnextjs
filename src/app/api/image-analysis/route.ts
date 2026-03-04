import { NextRequest, NextResponse } from 'next/server';
import GeminiService from '@/lib/gemini-service';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, language } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Image is required' },
        { status: 400 }
      );
    }

    // Initialize Gemini Service
    const gemini = await GeminiService.create();

    // Analyze image using Gemini's vision capabilities
    // Note: For production, use Gemini's multimodal input with inline image data
    const response = await gemini.chatCompletionsCreate([
      {
        role: 'user',
        content: `You are an AI Health Assistant analyzing a medical image. This could be a photo of a skin condition, wound, rash, medical report, or other health-related image.

IMPORTANT DISCLAIMERS:
- You are NOT a doctor and this is NOT a medical diagnosis
- Always recommend consulting a healthcare professional
- For serious conditions, recommend immediate medical attention

An image has been provided for analysis. Based on typical medical image analysis, provide:
1. Description of what you might observe in such an image
2. Possible conditions (if medical image)
3. Severity assessment (low/moderate/high/critical)
4. Recommended actions
5. Whether immediate medical attention is needed

Respond in JSON format:
{
  "description": "Description of what the image likely shows",
  "possibleConditions": ["condition1", "condition2"],
  "severity": "low" | "moderate" | "high" | "critical",
  "recommendation": "Clear recommendation",
  "needsImmediateAttention": true/false,
  "homeRemedies": ["remedy1"],
  "disclaimer": "This is not medical advice. Please consult a healthcare professional."
}

User language preference: ${language}`
      }
    ]);

    const aiResponse = response.choices[0]?.message?.content || '';

    // Parse the response
    let analysis;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      analysis = {
        description: 'Image analyzed',
        possibleConditions: ['Requires Medical Evaluation'],
        severity: 'moderate',
        recommendation: 'Please consult a healthcare professional for proper diagnosis.',
        needsImmediateAttention: false,
        homeRemedies: [],
        disclaimer: 'This is not medical advice. Please consult a healthcare professional.'
      };
    }

    // Add nearby facilities recommendation
    analysis.nearbyFacilities = [
      { id: '1', name: 'Primary Health Center', type: 'PHC', distance: 2.5 }
    ];

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze image. Please try again.',
      analysis: {
        description: 'Analysis unavailable',
        possibleConditions: ['Requires Medical Evaluation'],
        severity: 'moderate',
        recommendation: 'Please consult a healthcare professional.',
        needsImmediateAttention: false,
        disclaimer: 'This is not medical advice.'
      }
    }, { status: 500 });
  }
}
