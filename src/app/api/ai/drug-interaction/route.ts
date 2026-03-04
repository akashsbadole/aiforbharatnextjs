import { NextRequest, NextResponse } from 'next/server';
import GeminiService from '@/lib/gemini-service';

// GET - Get drug interaction info
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const medicines = searchParams.get('medicines');
    
    if (!medicines) {
      return NextResponse.json({ success: false, error: 'Medicines list required' }, { status: 400 });
    }
    
    const medicineList = medicines.split(',').map(m => m.trim()).filter(Boolean);
    
    // Use AI to check interactions
    const gemini = await GeminiService.create();

    const prompt = `Check for drug interactions between these medicines: ${medicineList.join(', ')}

Respond in JSON format:
{
  "hasInteractions": boolean,
  "interactions": [
    {
      "medicines": ["drug1", "drug2"],
      "severity": "minor|moderate|major",
      "description": "Interaction description",
      "recommendation": "What to do"
    }
  ],
  "generalAdvice": "Overall advice for taking these medicines",
  "safeToTake": boolean
}

If no interactions, return hasInteractions: false with empty interactions array.`;

    const completion = await gemini.chatCompletionsCreate([
      { role: 'user', content: prompt }
    ]);
    
    const response = completion.choices[0]?.message?.content || '';
    
    let result;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = {
          hasInteractions: false,
          interactions: [],
          generalAdvice: 'No known interactions found, but always consult your doctor.',
          safeToTake: true
        };
      }
    } catch {
      result = {
        hasInteractions: false,
        interactions: [],
        generalAdvice: 'Unable to check interactions. Please consult your pharmacist.',
        safeToTake: true
      };
    }
    
    return NextResponse.json({ 
      success: true, 
      medicines: medicineList,
      ...result,
      checkedAt: new Date()
    });
    
  } catch (error) {
    console.error('Drug interaction check error:', error);
    return NextResponse.json({ success: false, error: 'Failed to check interactions' }, { status: 500 });
  }
}

// POST - Check drug interactions (alternative)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { medicines } = data;
    
    if (!medicines || !Array.isArray(medicines) || medicines.length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'At least 2 medicines required for interaction check' 
      }, { status: 400 });
    }
    
    const gemini = await GeminiService.create();

    const prompt = `Analyze potential drug interactions between these medicines: ${medicines.join(', ')}

Provide a comprehensive analysis including:
1. Known interactions (major, moderate, minor)
2. Foods to avoid
3. Timing recommendations
4. Monitoring suggestions

Respond in JSON format with full details.`;

    const completion = await gemini.chatCompletionsCreate([
      { role: 'user', content: prompt }
    ]);
    
    const response = completion.choices[0]?.message?.content || '';
    
    let result;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: response };
    } catch {
      result = { analysis: response };
    }
    
    return NextResponse.json({ 
      success: true, 
      medicines,
      analysis: result,
      disclaimer: 'This is AI-generated information. Always consult a healthcare professional.'
    });
    
  } catch (error) {
    console.error('Drug interaction analysis error:', error);
    return NextResponse.json({ success: false, error: 'Failed to analyze interactions' }, { status: 500 });
  }
}
