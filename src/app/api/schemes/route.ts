import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all schemes or user's applications
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'schemes' or 'applications'
    const schemeId = searchParams.get('schemeId');

    // Get specific scheme details
    if (schemeId) {
      const scheme = await db.governmentScheme.findUnique({
        where: { id: schemeId },
        include: {
          applications: userId ? {
            where: { userId }
          } : undefined
        }
      });

      if (!scheme) {
        return NextResponse.json({
          success: false,
          error: 'Scheme not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        scheme: {
          ...scheme,
          eligibilityCriteria: JSON.parse(scheme.eligibilityCriteria),
          benefits: JSON.parse(scheme.benefits),
          documents: JSON.parse(scheme.documents),
          targetGroups: scheme.targetGroups ? JSON.parse(scheme.targetGroups) : []
        }
      });
    }

    // Get user's applications
    if (type === 'applications' && userId) {
      const applications = await db.schemeApplication.findMany({
        where: { userId },
        include: {
          scheme: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        applications: applications.map(app => ({
          ...app,
          documents: JSON.parse(app.documents),
          scheme: {
            ...app.scheme,
            eligibilityCriteria: JSON.parse(app.scheme.eligibilityCriteria),
            benefits: JSON.parse(app.scheme.benefits),
            documents: JSON.parse(app.scheme.documents)
          }
        }))
      });
    }

    // Get all active schemes
    const schemes = await db.governmentScheme.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      schemes: schemes.map(scheme => ({
        ...scheme,
        eligibilityCriteria: JSON.parse(scheme.eligibilityCriteria),
        benefits: JSON.parse(scheme.benefits),
        documents: JSON.parse(scheme.documents),
        targetGroups: scheme.targetGroups ? JSON.parse(scheme.targetGroups) : []
      })),
      total: schemes.length
    });

  } catch (error) {
    console.error('Schemes fetch error:', error);
    
    // Return mock data if database fails
    return NextResponse.json({
      success: true,
      schemes: getMockSchemes(),
      total: getMockSchemes().length
    });
  }
}

// POST - Create new scheme application
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, schemeId, documents } = data;

    if (!userId || !schemeId) {
      return NextResponse.json({
        success: false,
        error: 'User ID and Scheme ID are required'
      }, { status: 400 });
    }

    // Check if scheme exists
    const scheme = await db.governmentScheme.findUnique({
      where: { id: schemeId }
    });

    if (!scheme) {
      return NextResponse.json({
        success: false,
        error: 'Scheme not found'
      }, { status: 404 });
    }

    // Check for existing application
    const existingApplication = await db.schemeApplication.findFirst({
      where: { userId, schemeId }
    });

    if (existingApplication) {
      return NextResponse.json({
        success: false,
        error: 'You have already applied for this scheme',
        application: existingApplication
      }, { status: 400 });
    }

    // Create application
    const application = await db.schemeApplication.create({
      data: {
        userId,
        schemeId,
        documents: JSON.stringify(documents || []),
        status: 'draft',
        appliedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        documents: JSON.parse(application.documents)
      }
    });

  } catch (error) {
    console.error('Create application error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create application'
    }, { status: 500 });
  }
}

// PUT - Update application status or submit
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { applicationId, status, documents, submitted } = data;

    if (!applicationId) {
      return NextResponse.json({
        success: false,
        error: 'Application ID is required'
      }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
    }

    if (documents) {
      updateData.documents = JSON.stringify(documents);
    }

    if (submitted) {
      updateData.status = 'submitted';
      updateData.appliedAt = new Date();
    }

    const application = await db.schemeApplication.update({
      where: { id: applicationId },
      data: updateData,
      include: { scheme: true }
    });

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        documents: JSON.parse(application.documents)
      }
    });

  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update application'
    }, { status: 500 });
  }
}

// DELETE - Delete draft application
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({
        success: false,
        error: 'Application ID is required'
      }, { status: 400 });
    }

    // Check if application is in draft status
    const application = await db.schemeApplication.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      return NextResponse.json({
        success: false,
        error: 'Application not found'
      }, { status: 404 });
    }

    if (application.status !== 'draft') {
      return NextResponse.json({
        success: false,
        error: 'Only draft applications can be deleted'
      }, { status: 400 });
    }

    await db.schemeApplication.delete({
      where: { id: applicationId }
    });

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Delete application error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete application'
    }, { status: 500 });
  }
}

// Mock schemes data
function getMockSchemes() {
  return [
    {
      id: 'pmjay-1',
      name: 'PMJAY - Ayushman Bharat',
      description: 'Pradhan Mantri Jan Arogya Yojana (PMJAY) is the world\'s largest health insurance scheme fully financed by the government. It offers a sum insured of ₹5 lakh per family for secondary and tertiary care hospitalization.',
      shortDescription: '₹5 lakh health cover for eligible families',
      eligibilityCriteria: {
        rural: [
          'Households with no adult member between 16-59 years',
          'Households with no able-bodied adult member',
          'Households having at least one disabled member',
          'SC/ST households',
          'Landless households deriving major income from manual labour',
          'Households with no literate adult above 25 years'
        ],
        urban: [
          'Rag pickers',
          'Beggars',
          'Domestic workers',
          'Street vendors',
          'Cobblers/shoe makers',
          'Construction workers',
          'Sweepers/malins'
        ],
        income: 'Family income should be below the poverty line or as per SECC data'
      },
      benefits: [
        '₹5 lakh per family per year for secondary and tertiary care hospitalization',
        'Cashless and paperless treatment at empaneled hospitals',
        'Coverage for pre-existing diseases from day one',
        'Pre and post hospitalization expenses covered',
        'All pre-existing conditions covered',
        'No cap on family size'
      ],
      documents: [
        'Aadhaar Card',
        'Ration Card',
        'Proof of Residence',
        'Passport Size Photo',
        'Mobile Number linked with Aadhaar'
      ],
      coverageAmount: '₹5,00,000',
      coverageType: 'family',
      targetGroups: ['BPL families', 'SC/ST', 'Landless labourers', 'Urban poor'],
      isActive: true,
      officialWebsite: 'https://pmjay.gov.in',
      helpline: '14555'
    },
    {
      id: 'pmjka-2',
      name: 'Pradhan Mantri Janani Suraksha Yojana',
      description: 'A safe motherhood intervention under the National Health Mission aimed at reducing maternal and neonatal mortality. It provides cash assistance for institutional delivery.',
      shortDescription: 'Cash assistance for institutional delivery',
      eligibilityCriteria: {
        pregnancy: 'Pregnant women registered at government health facilities',
        income: 'BPL families',
        age: 'Above 19 years',
        place: 'Delivery at government or empaneled private hospital'
      },
      benefits: [
        '₹1400 for rural areas for institutional delivery',
        '₹1000 for urban areas for institutional delivery',
        'Additional assistance for C-section delivery',
        'Free ambulance service for delivery'
      ],
      documents: [
        'Aadhaar Card',
        'BPL Card / Ration Card',
        'Antenatal Check-up Card',
        'Hospital Discharge Certificate',
        'Bank Passbook'
      ],
      coverageAmount: '₹1,400 - ₹1,500',
      coverageType: 'individual',
      targetGroups: ['Pregnant women', 'BPL families'],
      isActive: true,
      officialWebsite: 'https://nhm.gov.in',
      helpline: '104'
    },
    {
      id: 'rbsk-3',
      name: 'Rashtriya Bal Swasthya Karyakram',
      description: 'Child health screening and early intervention services for children from birth to 18 years. Covers 4 Ds - Defects at birth, Diseases, Deficiencies, and Development delays.',
      shortDescription: 'Free health screening for children 0-18 years',
      eligibilityCriteria: {
        age: '0-18 years',
        coverage: 'All children including those in government schools'
      },
      benefits: [
        'Free health screening at schools and Anganwadi centers',
        'Detection of 30 selected health conditions',
        'Free treatment at District Early Intervention Centers',
        'Surgery for birth defects',
        'Follow-up treatment and support'
      ],
      documents: [
        'Child\'s Birth Certificate',
        'Aadhaar Card of Parents',
        'School ID (if applicable)',
        'Vaccination Card'
      ],
      coverageAmount: 'Variable based on condition',
      coverageType: 'individual',
      targetGroups: ['Children 0-18 years', 'School children'],
      isActive: true,
      officialWebsite: 'https://rbsk.gov.in',
      helpline: '104'
    },
    {
      id: 'ndhm-4',
      name: 'National Digital Health Mission',
      description: 'Create a digital health ecosystem with a unique health ID for every citizen, enabling access to health records across healthcare providers.',
      shortDescription: 'Digital Health ID for all citizens',
      eligibilityCriteria: {
        citizenship: 'Indian citizen',
        age: 'Any age',
        documents: 'Valid identity proof'
      },
      benefits: [
        'Unique Health ID (ABHA)',
        'Digital health records accessible anywhere',
        'Easy appointment booking',
        'Access to verified doctors and hospitals',
        'Secure sharing of health records'
      ],
      documents: [
        'Aadhaar Card',
        'Driving License',
        'or any valid identity proof'
      ],
      coverageAmount: 'N/A',
      coverageType: 'individual',
      targetGroups: ['All citizens'],
      isActive: true,
      officialWebsite: 'https://healthid.ndhm.gov.in',
      helpline: '14447'
    }
  ];
}
