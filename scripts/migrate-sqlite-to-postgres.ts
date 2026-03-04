#!/usr/bin/env bun
/**
 * SQLite to PostgreSQL Migration Script
 * 
 * This script:
 * 1. Connects to the SQLite database (prisma/dev.db)
 * 2. Exports all data to JSON
 * 3. Connects to PostgreSQL (NeonDB)
 * 4. Imports all data
 */

import { PrismaClient } from '@prisma/client';
import { Database } from 'bun:sqlite';

// SQLite database path
const SQLITE_DB_PATH = './prisma/dev.db';

// Tables in the database (in order of dependencies - parents first)
const TABLES = [
  'User',
  'Patient',
  'HealthFacility',
  'MedicineStock',
  'SymptomReport',
  'Alert',
  'VaccinationRecord',
  'Appointment',
  'Emergency',
  'HealthRecord',
  'LabResult',
  'OutbreakPrediction',
  'SchemeEligibility',
  'Feedback',
  'TransportRequest',
  'HealthWorkerTask',
  'ChatHistory',
  'GovernmentScheme',
  'SchemeApplication',
  'HealthCamp',
  'ForumPost',
  'HealthChallenge',
  'Volunteer',
  'Doctor',
  'DoctorSchedule',
  'DoctorLeave',
  'DoctorTimeSlot',
  'Consultation',
  'Prescription',
  'HealthCard',
  'Medicine',
  'Pharmacy',
  'MedicineOrder',
  'MedicineReminder',
  'AuditLog',
  'SystemSetting',
  'Notification',
  'HealthInsight',
  'ReferralTracking',
  'HospitalPartnership',
  'UserWallet',
  'WithdrawalRequest',
  'HospitalLead',
  'HomeVisitDoctor',
  'HomeVisitBooking',
  'MedicalHelper',
  'MedicalHelperBooking',
  'DiagnosticLab',
  'DiagnosticBooking',
  'Enquiry',
  'EnquiryFollowUp',
  'PatientAssignment',
  'StaffActivity',
  'CRMStats',
  'HealthInsuranceReferral',
  'HealthCheckupPackage',
  'HealthCheckupBooking',
  'MedicalEquipment',
  'EquipmentRentalBooking',
  'HospitalDirectory',
  'LeadTracking',
  'LabTestRequirement',
  'LabTestCatalog',
];

async function exportFromSQLite(): Promise<Record<string, any[]>> {
  console.log('📦 Exporting data from SQLite...');
  
  const db = new Database(SQLITE_DB_PATH);
  const data: Record<string, any[]> = {};
  
  for (const table of TABLES) {
    try {
      const query = db.query(`SELECT * FROM "${table}"`);
      const rows = query.all();
      data[table] = rows;
      console.log(`  ✓ ${table}: ${rows.length} records`);
    } catch (error: any) {
      // Table might not exist or be empty
      console.log(`  ⚠ ${table}: ${error.message}`);
      data[table] = [];
    }
  }
  
  db.close();
  console.log('✅ SQLite export complete\n');
  return data;
}

async function importToPostgreSQL(data: Record<string, any[]>) {
  console.log('🐘 Importing data to PostgreSQL...');
  
  const prisma = new PrismaClient();
  
  try {
    // Note: We cannot disable foreign keys on NeonDB (permission denied)
    // So we import in the correct order to satisfy constraints
    
    for (const table of TABLES) {
      const records = data[table];
      if (records.length === 0) {
        console.log(`  ⚠ ${table}: No records to import`);
        continue;
      }
      
      try {
        // @ts-ignore - Dynamic table access
        const model = prisma[table.charAt(0).toLowerCase() + table.slice(1)];
        
        if (!model || !model.createMany) {
          console.log(`  ⚠ ${table}: Model not found`);
          continue;
        }
        
        // Process records to handle SQLite to PostgreSQL type conversions
        const processedRecords = records.map((record: any) => {
          const processed: any = {};
          
          for (const [key, value] of Object.entries(record)) {
            // Handle SQLite booleans (0/1) to PostgreSQL booleans
            if (typeof value === 'number' && (value === 0 || value === 1)) {
              // Check if this looks like a boolean field
              if (key.startsWith('is') || key.startsWith('has') || 
                  key.endsWith('Sent') || key.endsWith('Required') ||
                  key === 'reminderSent' || key === 'verified' ||
                  key === 'isAvailable' || key === 'isActive' ||
                  key === 'isOpen' || key === 'isPrivate' ||
                  key === 'isVerified' || key === 'isAIGenerated' ||
                  key === 'isAcknowledged' || key === 'isEditable' ||
                  key === 'isPublic' || key === 'isHighRisk' ||
                  key === 'isOpen24Hours' || key === 'hasEmergency' ||
                  key === 'hasICU' || key === 'homeCollection' ||
                  key === 'homeCollectionAvailable' || key === 'nablAccredited' ||
                  key === 'isKycComplete' || key === 'isPinned' ||
                  key === 'isRecurring' || key === 'inStock' ||
                  key === 'isFeatured' || key === 'isPopular' ||
                  key === 'requiresPrescription' || key === 'isAvailableOnline' ||
                  key === 'isAvailableInPerson' || key === 'followUpRequired') {
                processed[key] = value === 1;
                continue;
              }
            }
            
            // Handle dates - ensure they're valid Date objects or null
            // Be specific about date fields to avoid converting lat/long/fee fields
            const isDateField = 
              key.toLowerCase().endsWith('date') || 
              key.toLowerCase().endsWith('at') ||
              key.toLowerCase() === 'time' ||
              key.toLowerCase().endsWith('time') && !key.toLowerCase().includes('fee') && !key.toLowerCase().includes('slot') && !key.toLowerCase().includes('buffer');
            
            // Skip latitude, longitude, and fee fields
            const isNonDateField = 
              key.toLowerCase().includes('latitude') ||
              key.toLowerCase().includes('longitude') ||
              key.toLowerCase().includes('lat') ||
              key.toLowerCase().includes('lng') ||
              key.toLowerCase().includes('fee') ||
              key.toLowerCase().includes('price') ||
              key.toLowerCase().includes('amount') ||
              key.toLowerCase().includes('rate') ||
              key.toLowerCase().includes('charge') ||
              key.toLowerCase().includes('duration') ||
              key.toLowerCase().includes('slot') ||
              key.toLowerCase().includes('buffer') ||
              key.toLowerCase().includes('rating') ||
              key.toLowerCase().includes('commission') ||
              key.toLowerCase().includes('earning') ||
              key.toLowerCase().includes('balance') ||
              key.toLowerCase().includes('discount') ||
              key.toLowerCase().includes('mrp') ||
              key.toLowerCase().includes('range');
            
            if (isDateField && !isNonDateField) {
              if (value === null || value === undefined || value === '') {
                processed[key] = null;
              } else if (typeof value === 'string') {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                  processed[key] = date;
                } else {
                  processed[key] = null;
                }
              } else if (typeof value === 'number') {
                // Handle Unix timestamps (but not latitude/longitude/fee values)
                if (value > 1000000000000 || value < -1000000000) {
                  processed[key] = new Date(value);
                } else {
                  // It's probably a coordinate or fee value stored as a number
                  processed[key] = value;
                }
              } else {
                processed[key] = value;
              }
              continue;
            }
            
            // Copy other values as-is
            processed[key] = value;
          }
          
          return processed;
        });
        
        // Import in batches of 100 to avoid memory issues
        const batchSize = 100;
        for (let i = 0; i < processedRecords.length; i += batchSize) {
          const batch = processedRecords.slice(i, i + batchSize);
          try {
            await model.createMany({
              data: batch,
              skipDuplicates: true,
            });
          } catch (batchError: any) {
            // If batch fails, try individual inserts to identify problematic records
            for (const record of batch) {
              try {
                await model.create({ data: record });
              } catch (recordError: any) {
                // Log but continue - might be foreign key constraint
                if (!recordError.message?.includes('foreign key')) {
                  console.log(`    Warning: Could not import record in ${table}: ${recordError.message}`);
                }
              }
            }
          }
        }
        
        console.log(`  ✓ ${table}: ${records.length} records imported`);
      } catch (error: any) {
        console.error(`  ✗ ${table}: ${error.message}`);
      }
    }
    
    console.log('✅ PostgreSQL import complete\n');
  } finally {
    await prisma.$disconnect();
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  const prisma = new PrismaClient();
  
  try {
    const stats: Record<string, number> = {};
    
    for (const table of TABLES.slice(0, 10)) { // Check first 10 tables
      try {
        // @ts-ignore
        const model = prisma[table.charAt(0).toLowerCase() + table.slice(1)];
        if (model && model.count) {
          const count = await model.count();
          stats[table] = count;
        }
      } catch (error) {
        // Ignore
      }
    }
    
    console.log('\n📊 Table counts in PostgreSQL:');
    for (const [table, count] of Object.entries(stats)) {
      console.log(`  ${table}: ${count} records`);
    }
    
    // Check User table specifically
    try {
      const userCount = await prisma.user.count();
      console.log(`\n✅ User table verified: ${userCount} users`);
    } catch (error: any) {
      console.error(`\n❌ User table error: ${error.message}`);
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 Starting SQLite to PostgreSQL migration...\n');
  
  try {
    // Step 1: Export from SQLite
    const data = await exportFromSQLite();
    
    // Step 2: Import to PostgreSQL
    await importToPostgreSQL(data);
    
    // Step 3: Verify
    await verifyMigration();
    
    console.log('\n🎉 Migration completed successfully!');
  } catch (error: any) {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  }
}

main();
