import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List medicines
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const prescription = searchParams.get('prescription');
    
    const where: Record<string, unknown> = { isActive: true };
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { genericName: { contains: search } },
        { brand: { contains: search } }
      ];
    }
    if (category) {
      where.category = category;
    }
    if (prescription === 'false') {
      where.requiresPrescription = false;
    }
    
    const medicines = await db.medicine.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50
    });
    
    // Mock data if empty
    const result = medicines.length > 0 ? medicines : [
      {
        id: 'med_001',
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        brand: 'Crocin',
        category: 'tablet',
        strength: '500mg',
        mrp: 25,
        discountPercent: 10,
        inStock: true,
        stockQuantity: 500,
        requiresPrescription: false,
        description: 'Used for fever and mild pain relief',
        uses: JSON.stringify(['Fever', 'Headache', 'Mild pain']),
        sideEffects: JSON.stringify(['Nausea', 'Allergic reaction in rare cases'])
      },
      {
        id: 'med_002',
        name: 'Cetirizine',
        genericName: 'Cetirizine Hydrochloride',
        brand: 'Cetcip',
        category: 'tablet',
        strength: '10mg',
        mrp: 35,
        discountPercent: 5,
        inStock: true,
        stockQuantity: 300,
        requiresPrescription: false,
        description: 'Antihistamine for allergies',
        uses: JSON.stringify(['Allergies', 'Cold symptoms', 'Itching']),
        sideEffects: JSON.stringify(['Drowsiness', 'Dry mouth'])
      },
      {
        id: 'med_003',
        name: 'Amoxicillin',
        genericName: 'Amoxicillin Trihydrate',
        brand: 'Mox',
        category: 'capsule',
        strength: '500mg',
        mrp: 85,
        discountPercent: 0,
        inStock: true,
        stockQuantity: 200,
        requiresPrescription: true,
        description: 'Antibiotic for bacterial infections',
        uses: JSON.stringify(['Bacterial infections', 'Respiratory infections', 'Ear infections']),
        sideEffects: JSON.stringify(['Diarrhea', 'Nausea', 'Allergic reaction'])
      },
      {
        id: 'med_004',
        name: 'Omeprazole',
        genericName: 'Omeprazole',
        brand: 'Omez',
        category: 'capsule',
        strength: '20mg',
        mrp: 65,
        discountPercent: 15,
        inStock: true,
        stockQuantity: 250,
        requiresPrescription: false,
        description: 'Proton pump inhibitor for acid reflux',
        uses: JSON.stringify(['Acid reflux', 'Heartburn', 'Stomach ulcers']),
        sideEffects: JSON.stringify(['Headache', 'Stomach pain', 'Nausea'])
      },
      {
        id: 'med_005',
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        brand: 'Glycomet',
        category: 'tablet',
        strength: '500mg',
        mrp: 45,
        discountPercent: 0,
        inStock: true,
        stockQuantity: 400,
        requiresPrescription: true,
        description: 'For type 2 diabetes management',
        uses: JSON.stringify(['Type 2 Diabetes', 'PCOS']),
        sideEffects: JSON.stringify(['Stomach upset', 'Diarrhea', 'Nausea'])
      }
    ];
    
    return NextResponse.json({ success: true, medicines: result });
    
  } catch (error) {
    console.error('Get medicines error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch medicines' }, { status: 500 });
  }
}

// POST - Add medicine (admin only)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, genericName, brand, category, strength, mrp, discountPercent, description, uses, sideEffects, requiresPrescription, stockQuantity } = data;
    
    if (!name || !category || mrp === undefined) {
      return NextResponse.json({ success: false, error: 'Name, category, and MRP are required' }, { status: 400 });
    }
    
    const medicine = await db.medicine.create({
      data: {
        name,
        genericName,
        brand,
        category,
        strength,
        mrp,
        discountPercent: discountPercent || 0,
        description,
        uses: uses ? JSON.stringify(uses) : undefined,
        sideEffects: sideEffects ? JSON.stringify(sideEffects) : undefined,
        requiresPrescription: requiresPrescription || false,
        stockQuantity: stockQuantity || 0,
        inStock: (stockQuantity || 0) > 0
      }
    });
    
    return NextResponse.json({ success: true, medicine });
    
  } catch (error) {
    console.error('Create medicine error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create medicine' }, { status: 500 });
  }
}

// PUT - Update medicine
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Medicine ID required' }, { status: 400 });
    }
    
    if (updateData.uses && typeof updateData.uses !== 'string') {
      updateData.uses = JSON.stringify(updateData.uses);
    }
    if (updateData.sideEffects && typeof updateData.sideEffects !== 'string') {
      updateData.sideEffects = JSON.stringify(updateData.sideEffects);
    }
    if (updateData.stockQuantity !== undefined) {
      updateData.inStock = updateData.stockQuantity > 0;
    }
    
    const medicine = await db.medicine.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, medicine });
    
  } catch (error) {
    console.error('Update medicine error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update medicine' }, { status: 500 });
  }
}

// DELETE - Delete medicine
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Medicine ID required' }, { status: 400 });
    }
    
    await db.medicine.update({
      where: { id },
      data: { isActive: false }
    });
    
    return NextResponse.json({ success: true, message: 'Medicine deactivated' });
    
  } catch (error) {
    console.error('Delete medicine error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete medicine' }, { status: 500 });
  }
}
