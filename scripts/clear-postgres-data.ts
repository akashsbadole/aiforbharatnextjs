#!/usr/bin/env bun
/**
 * Clear all data from PostgreSQL tables (in reverse dependency order)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tables in reverse order of dependencies (children first)
const TABLES_REVERSE = [
  'LabTestCatalog',
  'LabTestRequirement',
  'LeadTracking',
  'HospitalDirectory',
  'EquipmentRentalBooking',
  'MedicalEquipment',
  'HealthCheckupBooking',
  'HealthCheckupPackage',
  'HealthInsuranceReferral',
  'CRMStats',
  'StaffActivity',
  'PatientAssignment',
  'EnquiryFollowUp',
  'Enquiry',
  'DiagnosticBooking',
  'DiagnosticLab',
  'MedicalHelperBooking',
  'MedicalHelper',
  'HomeVisitBooking',
  'HomeVisitDoctor',
  'HospitalLead',
  'WithdrawalRequest',
  'UserWallet',
  'HospitalPartnership',
  'ReferralTracking',
  'HealthInsight',
  'Notification',
  'SystemSetting',
  'AuditLog',
  'MedicineReminder',
  'MedicineOrder',
  'Pharmacy',
  'Medicine',
  'HealthCard',
  'Prescription',
  'Consultation',
  'DoctorTimeSlot',
  'DoctorLeave',
  'DoctorSchedule',
  'Doctor',
  'Volunteer',
  'HealthChallenge',
  'ForumPost',
  'HealthCamp',
  'SchemeApplication',
  'GovernmentScheme',
  'ChatHistory',
  'HealthWorkerTask',
  'TransportRequest',
  'Feedback',
  'SchemeEligibility',
  'OutbreakPrediction',
  'LabResult',
  'HealthRecord',
  'Emergency',
  'Appointment',
  'VaccinationRecord',
  'Alert',
  'SymptomReport',
  'MedicineStock',
  'HealthFacility',
  'Patient',
  'User',
];

async function clearData() {
  console.log('🗑️ Clearing PostgreSQL data...\n');
  
  for (const table of TABLES_REVERSE) {
    try {
      // @ts-ignore
      const model = prisma[table.charAt(0).toLowerCase() + table.slice(1)];
      if (model && model.deleteMany) {
        const result = await model.deleteMany({});
        console.log(`  ✓ ${table}: ${result.count} records deleted`);
      }
    } catch (error: any) {
      console.log(`  ⚠ ${table}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Data cleared successfully');
}

clearData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
