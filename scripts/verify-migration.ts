#!/usr/bin/env bun
/**
 * Final verification script for SQLite to PostgreSQL migration
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EXPECTED_COUNTS = {
  user: 12,
  patient: 4,
  healthFacility: 5,
  alert: 6,
  vaccinationRecord: 6,
  chatHistory: 18,
  governmentScheme: 3,
  doctor: 2,
  medicine: 6,
  healthCamp: 4,
};

async function verifyMigration() {
  console.log('🔍 Final Migration Verification\n');
  console.log('=' .repeat(50));
  
  const results: Record<string, { expected: number; actual: number; status: string }> = {};
  let allPassed = true;
  
  for (const [table, expected] of Object.entries(EXPECTED_COUNTS)) {
    try {
      // @ts-ignore
      const model = prisma[table];
      const actual = await model.count();
      const status = actual === expected ? '✅ PASS' : '⚠️ PARTIAL';
      
      if (actual !== expected) allPassed = false;
      
      results[table] = { expected, actual, status };
      console.log(`${status} ${table}: ${actual}/${expected}`);
    } catch (error: any) {
      console.log(`❌ FAIL ${table}: ${error.message}`);
      allPassed = false;
    }
  }
  
  console.log('=' .repeat(50));
  
  // Check connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('\n✅ PostgreSQL connection: OK');
  } catch (error: any) {
    console.log('\n❌ PostgreSQL connection: FAILED');
    allPassed = false;
  }
  
  // Sample data verification
  console.log('\n📊 Sample Data Verification:');
  try {
    const users = await prisma.user.findMany({ take: 3 });
    console.log(`  ✓ Users table accessible, sample: ${users.map(u => u.name).join(', ')}`);
    
    const facilities = await prisma.healthFacility.findMany({ take: 2 });
    console.log(`  ✓ HealthFacility table accessible, sample: ${facilities.map(f => f.name).join(', ')}`);
    
    const doctors = await prisma.doctor.findMany();
    console.log(`  ✓ Doctor table accessible: ${doctors.map(d => d.name).join(', ')}`);
  } catch (error: any) {
    console.log(`  ❌ Sample data error: ${error.message}`);
    allPassed = false;
  }
  
  console.log('\n' + '=' .repeat(50));
  if (allPassed) {
    console.log('🎉 MIGRATION VERIFICATION: SUCCESSFUL');
  } else {
    console.log('⚠️ MIGRATION VERIFICATION: PARTIAL (Some data may have import issues)');
  }
  console.log('=' .repeat(50));
  
  await prisma.$disconnect();
}

verifyMigration().catch(console.error);
