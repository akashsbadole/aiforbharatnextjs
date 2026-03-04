import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch lab test requirements
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');
    const district = searchParams.get('district');
    const status = searchParams.get('status');

    // Get all open requirements (for labs to see)
    if (type === 'open') {
      const requirements = await db.labTestRequirement.findMany({
        where: {
          status: 'open',
          ...(district && { district })
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      return NextResponse.json({
        success: true,
        requirements: requirements.length > 0 ? requirements : getMockRequirements()
      });
    }

    // Get user's submitted requirements
    if (type === 'my-requirements' && userId) {
      const requirements = await db.labTestRequirement.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        requirements: requirements.length > 0 ? requirements : []
      });
    }

    // Get referrer's earned requirements
    if (type === 'referrer-requirements' && userId) {
      const requirements = await db.labTestRequirement.findMany({
        where: { referrerId: userId },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        requirements
      });
    }

    // Get test catalog
    if (type === 'catalog') {
      const catalog = await db.labTestCatalog.findMany({
        where: { isActive: true },
        orderBy: [{ isPopular: 'desc' }, { testName: 'asc' }]
      });

      return NextResponse.json({
        success: true,
        catalog: catalog.length > 0 ? catalog : getMockTestCatalog()
      });
    }

    // Get test categories
    if (type === 'categories') {
      return NextResponse.json({
        success: true,
        categories: [
          { id: 'blood', name: 'Blood Tests', icon: 'Droplets', tests: ['CBC', 'Lipid Profile', 'Blood Sugar', 'Liver Function', 'Kidney Function'] },
          { id: 'urine', name: 'Urine Tests', icon: 'FlaskConical', tests: ['Urine Complete', 'Urine Culture', 'Urine Protein'] },
          { id: 'thyroid', name: 'Thyroid Tests', icon: 'Activity', tests: ['TSH', 'T3', 'T4', 'Thyroid Profile'] },
          { id: 'diabetes', name: 'Diabetes Panel', icon: 'Droplet', tests: ['Fasting Sugar', 'HbA1c', 'PPBS', 'Insulin'] },
          { id: 'cardiac', name: 'Cardiac Tests', icon: 'Heart', tests: ['Troponin', 'BNP', 'ECG', 'Echo'] },
          { id: 'imaging', name: 'Imaging', icon: 'Scan', tests: ['X-Ray', 'Ultrasound', 'CT Scan', 'MRI'] },
          { id: 'pathology', name: 'Pathology', icon: 'Microscope', tests: ['Biopsy', 'Cytology', 'Histopathology'] },
          { id: 'vitamin', name: 'Vitamin Tests', icon: 'Pill', tests: ['Vitamin D', 'Vitamin B12', 'Iron Studies', 'Folate'] },
          { id: 'hormone', name: 'Hormone Panel', icon: 'Zap', tests: ['Testosterone', 'Cortisol', 'FSH', 'LH', 'Prolactin'] },
          { id: 'cancer', name: 'Cancer Markers', icon: 'AlertCircle', tests: ['PSA', 'CA-125', 'CEA', 'AFP'] }
        ]
      });
    }

    // Get specific requirement by ID
    if (type === 'requirement' && searchParams.get('id')) {
      const requirement = await db.labTestRequirement.findUnique({
        where: { id: searchParams.get('id')! }
      });

      return NextResponse.json({
        success: true,
        requirement
      });
    }

    // Get earnings summary for lab requirements
    if (type === 'earnings' && userId) {
      const requirements = await db.labTestRequirement.findMany({
        where: { referrerId: userId }
      });

      const totalEarnings = requirements.reduce((sum: number, r: { commissionEarned: number }) => sum + (r.commissionEarned || 0), 0);
      const pendingEarnings = requirements
        .filter((r: { status: string }) => r.status === 'confirmed' || r.status === 'responding')
        .reduce((sum: number, r: { commissionEarned: number }) => sum + (r.commissionEarned || 0), 0);
      const completedRequirements = requirements.filter((r: { status: string }) => r.status === 'completed').length;
      const openRequirements = requirements.filter((r: { status: string }) => r.status === 'open' || r.status === 'responding').length;

      return NextResponse.json({
        success: true,
        stats: {
          totalRequirements: requirements.length,
          openRequirements,
          completedRequirements,
          totalEarnings,
          pendingEarnings,
          avgCommission: requirements.length > 0 ? totalEarnings / requirements.length : 0
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });

  } catch (error) {
    console.error('Lab requirements fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}

// POST - Create lab test requirement
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { type } = data;

    // Create new lab test requirement
    if (type === 'create_requirement') {
      const {
        userId, referrerId, referrerName,
        patientName, patientPhone, patientAge, patientGender, patientAddress,
        district, state, pincode, latitude, longitude,
        testCategory, tests, urgency, preferredDate, homeCollection,
        prescriptionUrl, symptoms, notes, budget
      } = data;

      // Set expiry to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const requirement = await db.labTestRequirement.create({
        data: {
          userId,
          referrerId,
          referrerName,
          patientName,
          patientPhone,
          patientAge,
          patientGender,
          patientAddress,
          district,
          state,
          pincode,
          latitude,
          longitude,
          testCategory,
          tests: JSON.stringify(tests),
          urgency: urgency || 'normal',
          preferredDate: preferredDate ? new Date(preferredDate) : null,
          homeCollection: homeCollection || false,
          prescriptionUrl,
          symptoms: symptoms ? JSON.stringify(symptoms) : null,
          notes,
          budget,
          status: 'open',
          expiresAt,
          commissionRate: 10
        }
      });

      return NextResponse.json({
        success: true,
        requirement,
        message: 'Lab test requirement created! Nearby labs will contact you soon.'
      });
    }

    // Lab responds to a requirement
    if (type === 'lab_response') {
      const { requirementId, labId, labName, quotedPrice, message } = data;

      const requirement = await db.labTestRequirement.findUnique({
        where: { id: requirementId }
      });

      if (!requirement) {
        return NextResponse.json({ success: false, error: 'Requirement not found' }, { status: 404 });
      }

      // Add lab response to the array
      const existingResponses = JSON.parse(requirement.labResponses || '[]');
      existingResponses.push({
        labId,
        labName,
        quotedPrice,
        message,
        respondedAt: new Date().toISOString()
      });

      const updated = await db.labTestRequirement.update({
        where: { id: requirementId },
        data: {
          labResponses: JSON.stringify(existingResponses),
          status: 'responding'
        }
      });

      return NextResponse.json({
        success: true,
        requirement: updated,
        message: 'Your quote has been sent to the patient.'
      });
    }

    // User selects a lab
    if (type === 'select_lab') {
      const { requirementId, labId, labName, quotedPrice } = data;

      const requirement = await db.labTestRequirement.findUnique({
        where: { id: requirementId }
      });

      if (!requirement) {
        return NextResponse.json({ success: false, error: 'Requirement not found' }, { status: 404 });
      }

      // Calculate commission
      const commissionRate = 10;
      const commissionEarned = Math.round((quotedPrice * commissionRate) / 100);
      const platformFee = Math.round(commissionEarned * 0.3);

      const updated = await db.labTestRequirement.update({
        where: { id: requirementId },
        data: {
          selectedLabId: labId,
          selectedLabName: labName,
          quotedPrice,
          status: 'confirmed',
          commissionEarned,
          platformFee,
          confirmedAt: new Date()
        }
      });

      // Update referrer's wallet if exists
      if (requirement.referrerId) {
        await updateWallet(requirement.referrerId, commissionEarned - platformFee, true);
      }

      return NextResponse.json({
        success: true,
        requirement: updated,
        message: `Lab selected! ${requirement.referrerName ? `You will earn ₹${commissionEarned - platformFee} when test is completed.` : ''}`
      });
    }

    // Mark requirement as completed
    if (type === 'complete') {
      const { requirementId } = data;

      const requirement = await db.labTestRequirement.findUnique({
        where: { id: requirementId }
      });

      if (!requirement) {
        return NextResponse.json({ success: false, error: 'Requirement not found' }, { status: 404 });
      }

      const updated = await db.labTestRequirement.update({
        where: { id: requirementId },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      });

      // Credit to wallet if not already done
      if (requirement.referrerId && requirement.commissionEarned > 0) {
        await updateWallet(requirement.referrerId, requirement.commissionEarned - requirement.platformFee, false);
      }

      return NextResponse.json({
        success: true,
        requirement: updated,
        message: 'Lab test completed!'
      });
    }

    // Cancel requirement
    if (type === 'cancel') {
      const { requirementId, reason } = data;

      const updated = await db.labTestRequirement.update({
        where: { id: requirementId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          notes: reason
        }
      });

      return NextResponse.json({
        success: true,
        requirement: updated,
        message: 'Requirement cancelled.'
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });

  } catch (error) {
    console.error('Lab requirement error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper function to update wallet
async function updateWallet(userId: string, amount: number, isPending: boolean = false) {
  try {
    const existing = await db.userWallet.findUnique({
      where: { userId }
    });

    if (existing) {
      await db.userWallet.update({
        where: { userId },
        data: {
          pendingBalance: isPending ? { increment: amount } : existing.pendingBalance,
          availableBalance: !isPending ? { increment: amount } : existing.availableBalance,
          totalEarned: { increment: amount }
        }
      });
    } else {
      await db.userWallet.create({
        data: {
          userId,
          pendingBalance: isPending ? amount : 0,
          availableBalance: !isPending ? amount : 0,
          totalEarned: amount
        }
      });
    }
  } catch (error) {
    console.error('Update wallet error:', error);
  }
}

// Mock data functions
function getMockRequirements() {
  return [
    {
      id: 'req-1',
      patientName: 'Ramesh Kumar',
      patientPhone: '+91-98765****',
      patientAge: 45,
      patientGender: 'male',
      patientAddress: 'Sector 15, Noida',
      district: 'Gautam Buddha Nagar',
      state: 'Uttar Pradesh',
      testCategory: 'blood',
      tests: '["Lipid Profile", "Blood Sugar Fasting", "Liver Function"]',
      urgency: 'normal',
      homeCollection: true,
      status: 'open',
      labResponses: '[]',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'req-2',
      patientName: 'Priya Sharma',
      patientPhone: '+91-98765****',
      patientAge: 32,
      patientGender: 'female',
      patientAddress: 'Koramangala',
      district: 'Bangalore',
      state: 'Karnataka',
      testCategory: 'thyroid',
      tests: '["TSH", "T3", "T4", "Thyroid Antibodies"]',
      urgency: 'normal',
      homeCollection: true,
      status: 'open',
      labResponses: '[]',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      id: 'req-3',
      patientName: 'Amit Verma',
      patientPhone: '+91-98765****',
      patientAge: 55,
      patientGender: 'male',
      patientAddress: 'Andheri West',
      district: 'Mumbai',
      state: 'Maharashtra',
      testCategory: 'cardiac',
      tests: '["Troponin", "BNP", "ECG", "Echo"]',
      urgency: 'urgent',
      homeCollection: false,
      status: 'open',
      labResponses: '[]',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  ];
}

function getMockTestCatalog() {
  return [
    { id: 'tc-1', testName: 'Complete Blood Count (CBC)', category: 'blood', minPrice: 150, maxPrice: 350, avgPrice: 200, homeCollectionAvailable: true, reportsIn: '24 hours', isPopular: true },
    { id: 'tc-2', testName: 'Lipid Profile', category: 'blood', minPrice: 300, maxPrice: 600, avgPrice: 400, homeCollectionAvailable: true, reportsIn: '24 hours', isPopular: true },
    { id: 'tc-3', testName: 'Thyroid Profile (T3, T4, TSH)', category: 'thyroid', minPrice: 400, maxPrice: 800, avgPrice: 500, homeCollectionAvailable: true, reportsIn: '24-48 hours', isPopular: true },
    { id: 'tc-4', testName: 'HbA1c (Glycated Hemoglobin)', category: 'diabetes', minPrice: 300, maxPrice: 600, avgPrice: 400, homeCollectionAvailable: true, reportsIn: '24 hours', isPopular: true },
    { id: 'tc-5', testName: 'Liver Function Test (LFT)', category: 'blood', minPrice: 250, maxPrice: 500, avgPrice: 350, homeCollectionAvailable: true, reportsIn: '24 hours', isPopular: false },
    { id: 'tc-6', testName: 'Kidney Function Test (KFT)', category: 'blood', minPrice: 300, maxPrice: 550, avgPrice: 400, homeCollectionAvailable: true, reportsIn: '24 hours', isPopular: false },
    { id: 'tc-7', testName: 'Vitamin D Total', category: 'vitamin', minPrice: 600, maxPrice: 1200, avgPrice: 800, homeCollectionAvailable: true, reportsIn: '24-48 hours', isPopular: true },
    { id: 'tc-8', testName: 'Vitamin B12', category: 'vitamin', minPrice: 500, maxPrice: 900, avgPrice: 650, homeCollectionAvailable: true, reportsIn: '24-48 hours', isPopular: true },
    { id: 'tc-9', testName: 'Urine Complete Examination', category: 'urine', minPrice: 100, maxPrice: 200, avgPrice: 150, homeCollectionAvailable: true, reportsIn: '24 hours', isPopular: false },
    { id: 'tc-10', testName: 'Iron Studies', category: 'blood', minPrice: 400, maxPrice: 700, avgPrice: 500, homeCollectionAvailable: true, reportsIn: '24 hours', isPopular: false },
    { id: 'tc-11', testName: 'ECG (Electrocardiogram)', category: 'cardiac', minPrice: 150, maxPrice: 300, avgPrice: 200, homeCollectionAvailable: false, reportsIn: 'Same day', isPopular: false },
    { id: 'tc-12', testName: 'Troponin I/T', category: 'cardiac', minPrice: 400, maxPrice: 800, avgPrice: 600, homeCollectionAvailable: true, reportsIn: '6 hours', isPopular: false },
    { id: 'tc-13', testName: 'PSA (Prostate Specific Antigen)', category: 'cancer', minPrice: 500, maxPrice: 1000, avgPrice: 700, homeCollectionAvailable: true, reportsIn: '24-48 hours', isPopular: false },
    { id: 'tc-14', testName: 'CA-125', category: 'cancer', minPrice: 800, maxPrice: 1500, avgPrice: 1000, homeCollectionAvailable: true, reportsIn: '24-48 hours', isPopular: false },
    { id: 'tc-15', testName: 'X-Ray Chest', category: 'imaging', minPrice: 200, maxPrice: 400, avgPrice: 300, homeCollectionAvailable: false, reportsIn: 'Same day', isPopular: false },
    { id: 'tc-16', testName: 'Ultrasound Abdomen', category: 'imaging', minPrice: 600, maxPrice: 1200, avgPrice: 800, homeCollectionAvailable: false, reportsIn: 'Same day', isPopular: true }
  ];
}
