import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import GeminiService from '@/lib/gemini-service';

interface EligibilityProfile {
  income?: string;
  category?: string; // SC, ST, OBC, General
  familySize?: number;
  age?: number;
  gender?: string;
  rural?: boolean;
  occupation?: string;
  hasDisability?: boolean;
  isPregnant?: boolean;
  hasChildren?: boolean;
  state?: string;
  district?: string;
  bplStatus?: boolean;
}

interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibilityCriteria: Record<string, unknown>;
  benefits: string[];
  documents: string[];
  matchScore?: number;
  eligibilityReason?: string;
}

// POST - AI-powered eligibility check
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { profile, userId, schemeId } = data as {
      profile: EligibilityProfile;
      userId?: string;
      schemeId?: string;
    };

    if (!profile) {
      return NextResponse.json({
        success: false,
        error: 'Profile data is required'
      }, { status: 400 });
    }

    // Get schemes from database
    let schemes: Scheme[] = [];
    
    try {
      const dbSchemes = schemeId 
        ? await db.governmentScheme.findMany({ where: { id: schemeId, isActive: true } })
        : await db.governmentScheme.findMany({ where: { isActive: true } });

      schemes = dbSchemes.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        eligibilityCriteria: JSON.parse(s.eligibilityCriteria),
        benefits: JSON.parse(s.benefits),
        documents: JSON.parse(s.documents)
      }));
    } catch {
      // Use mock schemes if database fails
      schemes = getMockSchemes();
    }

    // Use AI to analyze eligibility
    let eligibilityResults: Scheme[] = [];
    
    try {
      const gemini = await GeminiService.create();
      
      const prompt = `You are an expert in Indian government health schemes eligibility. Analyze the following user profile and determine their eligibility for each scheme.

User Profile:
- Income Level: ${profile.income || 'Not specified'}
- Social Category: ${profile.category || 'Not specified'}
- Family Size: ${profile.familySize || 'Not specified'}
- Age: ${profile.age || 'Not specified'}
- Gender: ${profile.gender || 'Not specified'}
- Location: ${profile.rural ? 'Rural' : 'Urban'}
- Occupation: ${profile.occupation || 'Not specified'}
- Has Disability: ${profile.hasDisability ? 'Yes' : 'No'}
- Is Pregnant: ${profile.isPregnant ? 'Yes' : 'No'}
- Has Children: ${profile.hasChildren ? 'Yes' : 'No'}
- State: ${profile.state || 'Not specified'}
- BPL Status: ${profile.bplStatus ? 'Below Poverty Line' : 'Not BPL'}

Schemes to check:
${schemes.map((s, i) => `${i + 1}. ${s.name}: ${s.description}`).join('\n')}

For each scheme, provide:
1. Match score (0-100)
2. Whether user is eligible (true/false)
3. Reason for eligibility/ineligibility
4. Missing criteria if any

Respond in JSON format:
{
  "results": [
    {
      "schemeName": "scheme name",
      "matchScore": 85,
      "isEligible": true,
      "reason": "explanation",
      "missingCriteria": []
    }
  ]
}`;

      const completion = await gemini.chatCompletionsCreate([
        {
          role: 'system',
          content: 'You are a government schemes eligibility expert. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], { temperature: 0.3 });

      const responseContent = completion.choices[0]?.message?.content;
      
      if (responseContent) {
        try {
          // Try to extract JSON from the response
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            
            eligibilityResults = schemes.map(scheme => {
              const aiResult = parsed.results?.find(
                (r: { schemeName: string }) => r.schemeName.toLowerCase().includes(scheme.name.toLowerCase().split(' ')[0])
              );
              
              return {
                ...scheme,
                matchScore: aiResult?.matchScore || 50,
                eligibilityReason: aiResult?.reason || 'Based on profile analysis',
                isEligible: aiResult?.isEligible ?? true
              };
            }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
          }
        } catch {
          // Fallback to rule-based matching
          eligibilityResults = performRuleBasedMatching(schemes, profile);
        }
      } else {
        eligibilityResults = performRuleBasedMatching(schemes, profile);
      }
    } catch {
      // Fallback to rule-based matching
      eligibilityResults = performRuleBasedMatching(schemes, profile);
    }

    // Get nearby empaneled hospitals if PMJAY is recommended
    let nearbyHospitals: unknown[] = [];
    const pmjayResult = eligibilityResults.find(
      s => s.name.toLowerCase().includes('pmjay') || s.name.toLowerCase().includes('ayushman')
    );
    
    if (pmjayResult && pmjayResult.matchScore && pmjayResult.matchScore > 50) {
      try {
        const facilities = await db.healthFacility.findMany({
          take: 5
        });
        
        nearbyHospitals = facilities.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          address: f.address,
          phone: f.phone,
          services: JSON.parse(f.services)
        }));
      } catch {
        // Return mock hospital data
        nearbyHospitals = [
          {
            id: '1',
            name: 'District Hospital',
            type: 'Government Hospital',
            address: 'Civil Lines, District HQ',
            phone: '+91-1234567890',
            services: ['Emergency', 'Surgery', 'Maternity']
          },
          {
            id: '2',
            name: 'Community Health Center',
            type: 'CHC',
            address: 'Block Road',
            phone: '+91-1234567891',
            services: ['General Medicine', 'Maternity']
          }
        ];
      }
    }

    // Save eligibility check result
    if (userId) {
      try {
        for (const result of eligibilityResults) {
          await db.schemeEligibility.upsert({
            where: {
              id: `${userId}-${result.id}`
            },
            create: {
              userId,
              schemeName: result.name,
              eligibilityStatus: result.isEligible ? 'eligible' : 'ineligible',
              documents: JSON.stringify(result.documents)
            },
            update: {
              eligibilityStatus: result.isEligible ? 'eligible' : 'ineligible'
            }
          });
        }
      } catch {
        // Ignore save errors
      }
    }

    return NextResponse.json({
      success: true,
      profile,
      recommendations: eligibilityResults.slice(0, 5), // Top 5 recommendations
      nearbyHospitals,
      summary: {
        totalSchemesChecked: schemes.length,
        eligibleCount: eligibilityResults.filter(r => r.isEligible).length,
        topRecommendation: eligibilityResults[0] || null
      }
    });

  } catch (error) {
    console.error('Eligibility check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check eligibility'
    }, { status: 500 });
  }
}

// Rule-based matching as fallback
function performRuleBasedMatching(schemes: Scheme[], profile: EligibilityProfile): Scheme[] {
  return schemes.map(scheme => {
    let score = 50;
    const criteria = scheme.eligibilityCriteria as Record<string, unknown>;
    let isEligible = true;
    const reasons: string[] = [];

    // Check PMJAY criteria
    if (scheme.name.toLowerCase().includes('pmjay') || scheme.name.toLowerCase().includes('ayushman')) {
      if (profile.bplStatus) {
        score += 30;
        reasons.push('BPL status makes you eligible');
      }
      if (profile.category === 'SC' || profile.category === 'ST') {
        score += 20;
        reasons.push('SC/ST category is eligible');
      }
      if (profile.rural) {
        score += 10;
        reasons.push('Rural residents have priority');
      }
      if (profile.income && profile.income.toLowerCase().includes('below')) {
        score += 25;
      }
      if (!profile.bplStatus && profile.category === 'General' && profile.income?.includes('above')) {
        isEligible = false;
        reasons.push('Income above threshold for this category');
      }
    }

    // Check Janani Suraksha criteria
    if (scheme.name.toLowerCase().includes('janani')) {
      if (profile.isPregnant) {
        score += 40;
        reasons.push('Pregnancy makes you eligible');
      } else if (profile.gender !== 'female') {
        isEligible = false;
        reasons.push('Only for pregnant women');
      }
      if (profile.bplStatus) {
        score += 20;
      }
      if (profile.age && profile.age >= 19) {
        score += 10;
      }
    }

    // Check RBSK criteria
    if (scheme.name.toLowerCase().includes('bal') || scheme.name.toLowerCase().includes('rbsk')) {
      if (profile.hasChildren) {
        score += 30;
        reasons.push('Having children makes you eligible');
      }
      if (profile.age && profile.age < 18) {
        score += 40;
        reasons.push('Children under 18 are covered');
      }
    }

    // Check NDHM criteria (for all)
    if (scheme.name.toLowerCase().includes('digital') || scheme.name.toLowerCase().includes('ndhm')) {
      score = 100;
      reasons.push('Available for all Indian citizens');
      isEligible = true;
    }

    // Ensure score is within bounds
    score = Math.min(100, Math.max(0, score));

    return {
      ...scheme,
      matchScore: score,
      isEligible: score >= 50 && isEligible,
      eligibilityReason: reasons.length > 0 ? reasons.join('. ') : 'Based on general eligibility criteria'
    };
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

// GET - Get documents checklist for a scheme
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schemeId = searchParams.get('schemeId');

    if (!schemeId) {
      return NextResponse.json({
        success: false,
        error: 'Scheme ID is required'
      }, { status: 400 });
    }

    const scheme = await db.governmentScheme.findUnique({
      where: { id: schemeId }
    });

    if (!scheme) {
      return NextResponse.json({
        success: false,
        error: 'Scheme not found'
      }, { status: 404 });
    }

    const documents = JSON.parse(scheme.documents);
    const eligibilityCriteria = JSON.parse(scheme.eligibilityCriteria);

    return NextResponse.json({
      success: true,
      documents,
      eligibilityCriteria,
      scheme: {
        id: scheme.id,
        name: scheme.name,
        description: scheme.description
      }
    });

  } catch (error) {
    console.error('Get documents error:', error);
    
    // Return mock data
    return NextResponse.json({
      success: true,
      documents: [
        { name: 'Aadhaar Card', required: true, description: 'Valid Aadhaar card with photo' },
        { name: 'Ration Card', required: true, description: 'Current year ration card' },
        { name: 'Proof of Residence', required: true, description: 'Utility bill or voter ID' },
        { name: 'Passport Size Photo', required: true, description: 'Recent passport size photograph' },
        { name: 'Mobile Number', required: true, description: 'Linked with Aadhaar' }
      ],
      eligibilityCriteria: {
        rural: ['BPL families', 'SC/ST households', 'Landless labourers'],
        urban: ['Slum dwellers', 'Informal sector workers']
      }
    });
  }
}

function getMockSchemes(): Scheme[] {
  return [
    {
      id: 'pmjay-1',
      name: 'PMJAY - Ayushman Bharat',
      description: 'Pradhan Mantri Jan Arogya Yojana - World\'s largest health insurance scheme',
      eligibilityCriteria: {
        income: 'Below poverty line',
        category: ['SC', 'ST', 'OBC'],
        rural: true
      },
      benefits: ['₹5 lakh coverage', 'Cashless treatment', 'Pre-existing diseases covered'],
      documents: ['Aadhaar Card', 'Ration Card', 'Proof of Residence', 'Photo']
    },
    {
      id: 'jsy-2',
      name: 'Janani Suraksha Yojana',
      description: 'Safe motherhood intervention for institutional delivery',
      eligibilityCriteria: {
        pregnancy: true,
        bpl: true,
        age: 'Above 19'
      },
      benefits: ['Cash assistance', 'Free delivery', 'Transport support'],
      documents: ['Aadhaar Card', 'BPL Card', 'ANC Card', 'Bank Passbook']
    },
    {
      id: 'rbsk-3',
      name: 'Rashtriya Bal Swasthya Karyakram',
      description: 'Child health screening for children 0-18 years',
      eligibilityCriteria: {
        age: '0-18 years'
      },
      benefits: ['Free screening', 'Early detection', 'Treatment support'],
      documents: ['Birth Certificate', 'Parent\'s Aadhaar', 'School ID']
    },
    {
      id: 'ndhm-4',
      name: 'National Digital Health Mission',
      description: 'Digital Health ID for all citizens',
      eligibilityCriteria: {
        citizenship: 'Indian'
      },
      benefits: ['Unique Health ID', 'Digital records', 'Easy access'],
      documents: ['Aadhaar Card or Driving License']
    }
  ];
}
