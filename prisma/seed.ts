import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { phone: '9999999999' },
    update: {},
    create: {
      id: 'admin-1',
      name: 'Admin User',
      phone: '9999999999',
      email: 'admin@swasthyamitra.gov.in',
      role: 'admin',
      language: 'hi',
      district: 'Delhi',
      state: 'Delhi'
    }
  });
  console.log('Created admin user:', admin.name);

  // Create doctor users
  const doctors = await Promise.all([
    prisma.user.upsert({
      where: { phone: '8888888888' },
      update: {},
      create: {
        id: 'doctor-1',
        name: 'Dr. Rajesh Kumar',
        phone: '8888888888',
        email: 'rajesh.kumar@hospital.gov.in',
        role: 'doctor',
        language: 'hi',
        district: 'Delhi',
        state: 'Delhi'
      }
    }),
    prisma.user.upsert({
      where: { phone: '8888888887' },
      update: {},
      create: {
        id: 'doctor-2',
        name: 'Dr. Priya Sharma',
        phone: '8888888887',
        email: 'priya.sharma@hospital.gov.in',
        role: 'doctor',
        language: 'hi',
        district: 'Delhi',
        state: 'Delhi'
      }
    })
  ]);
  console.log('Created doctors:', doctors.length);

  // Create health workers
  const healthWorkers = await Promise.all([
    prisma.user.upsert({
      where: { phone: '7777777777' },
      update: {},
      create: {
        id: 'hw-1',
        name: 'Sunita Devi (ANM)',
        phone: '7777777777',
        role: 'health_worker',
        language: 'hi',
        district: 'Delhi',
        state: 'Delhi'
      }
    }),
    prisma.user.upsert({
      where: { phone: '7777777776' },
      update: {},
      create: {
        id: 'hw-2',
        name: 'Ramesh Singh (ASHA)',
        phone: '7777777776',
        role: 'health_worker',
        language: 'hi',
        district: 'Delhi',
        state: 'Delhi'
      }
    }),
    prisma.user.upsert({
      where: { phone: '7777777775' },
      update: {},
      create: {
        id: 'hw-3',
        name: 'Meera Kumari (ANM)',
        phone: '7777777775',
        role: 'health_worker',
        language: 'hi',
        district: 'Delhi',
        state: 'Delhi'
      }
    })
  ]);
  console.log('Created health workers:', healthWorkers.length);

  // Create citizen users
  const citizens = await Promise.all([
    prisma.user.upsert({
      where: { phone: '6666666666' },
      update: {},
      create: {
        id: 'citizen-1',
        name: 'Amit Verma',
        phone: '6666666666',
        role: 'citizen',
        language: 'hi',
        district: 'Delhi',
        state: 'Delhi'
      }
    }),
    prisma.user.upsert({
      where: { phone: '6666666665' },
      update: {},
      create: {
        id: 'citizen-2',
        name: 'Sunita Sharma',
        phone: '6666666665',
        role: 'citizen',
        language: 'hi',
        district: 'Delhi',
        state: 'Delhi'
      }
    })
  ]);
  console.log('Created citizens:', citizens.length);

  // Create health facilities
  const facilities = await Promise.all([
    prisma.healthFacility.upsert({
      where: { id: 'facility-1' },
      update: {},
      create: {
        id: 'facility-1',
        name: 'Sadar District Hospital',
        type: 'District Hospital',
        address: 'Civil Lines, District HQ, New Delhi',
        district: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        latitude: 28.6139,
        longitude: 77.2090,
        phone: '011-23456789',
        emergencyPhone: '108',
        email: 'sadar.hospital@delhi.gov.in',
        services: JSON.stringify(['Emergency', 'Surgery', 'Maternity', 'Pediatrics', 'Cardiology', 'Orthopedics', 'Lab Services', 'X-Ray', 'CT Scan']),
        specialties: JSON.stringify(['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics']),
        bedCapacity: 500,
        availableBeds: 120,
        crowdLevel: 'moderate',
        isOpen: true
      }
    }),
    prisma.healthFacility.upsert({
      where: { id: 'facility-2' },
      update: {},
      create: {
        id: 'facility-2',
        name: 'Community Health Center - Block A',
        type: 'CHC',
        address: 'Main Road, Block A, Delhi',
        district: 'Delhi',
        state: 'Delhi',
        pincode: '110002',
        latitude: 28.6520,
        longitude: 77.2310,
        phone: '011-23456790',
        emergencyPhone: '108',
        services: JSON.stringify(['General Medicine', 'Maternity', 'Pediatrics', 'Vaccination', 'Lab Services']),
        specialties: JSON.stringify(['General Medicine', 'Pediatrics']),
        bedCapacity: 50,
        availableBeds: 15,
        crowdLevel: 'low',
        isOpen: true
      }
    }),
    prisma.healthFacility.upsert({
      where: { id: 'facility-3' },
      update: {},
      create: {
        id: 'facility-3',
        name: 'Primary Health Center - Village 1',
        type: 'PHC',
        address: 'Gram Panchayat, Village 1, Delhi',
        district: 'Delhi',
        state: 'Delhi',
        pincode: '110003',
        latitude: 28.6800,
        longitude: 77.2500,
        phone: '011-23456791',
        services: JSON.stringify(['General Medicine', 'Vaccination', 'First Aid', 'Maternity']),
        bedCapacity: 10,
        availableBeds: 5,
        crowdLevel: 'low',
        isOpen: true
      }
    }),
    prisma.healthFacility.upsert({
      where: { id: 'facility-4' },
      update: {},
      create: {
        id: 'facility-4',
        name: 'Primary Health Center - Village 2',
        type: 'PHC',
        address: 'Village Center, Village 2, Delhi',
        district: 'Delhi',
        state: 'Delhi',
        pincode: '110004',
        latitude: 28.7000,
        longitude: 77.2700,
        phone: '011-23456792',
        services: JSON.stringify(['General Medicine', 'Vaccination', 'First Aid']),
        bedCapacity: 10,
        availableBeds: 8,
        crowdLevel: 'low',
        isOpen: true
      }
    }),
    prisma.healthFacility.upsert({
      where: { id: 'facility-5' },
      update: {},
      create: {
        id: 'facility-5',
        name: 'AIIMS Delhi',
        type: 'District Hospital',
        address: 'Ansari Nagar, New Delhi',
        district: 'Delhi',
        state: 'Delhi',
        pincode: '110029',
        latitude: 28.5675,
        longitude: 77.2106,
        phone: '011-26588500',
        emergencyPhone: '1066',
        email: 'admin@aiims.edu',
        services: JSON.stringify(['Emergency', 'Surgery', 'Maternity', 'Pediatrics', 'Cardiology', 'Neurology', 'Cancer Treatment', 'Organ Transplant', 'Lab Services']),
        specialties: JSON.stringify(['Cardiology', 'Neurology', 'Oncology', 'Nephrology', 'Gastroenterology']),
        bedCapacity: 2000,
        availableBeds: 350,
        crowdLevel: 'high',
        isOpen: true
      }
    })
  ]);
  console.log('Created facilities:', facilities.length);

  // Create doctor profiles
  const doctorProfiles = await Promise.all([
    prisma.doctor.upsert({
      where: { id: 'doctor-profile-1' },
      update: {},
      create: {
        id: 'doctor-profile-1',
        userId: 'doctor-1',
        name: 'Dr. Rajesh Kumar',
        phone: '8888888888',
        email: 'rajesh.kumar@hospital.gov.in',
        specialization: 'General Medicine',
        qualifications: JSON.stringify(['MBBS', 'MD']),
        yearsOfExperience: 15,
        facilityId: 'facility-1',
        consultationFee: 500,
        languages: JSON.stringify(['Hindi', 'English']),
        availability: JSON.stringify({
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '09:00', end: '13:00' }
        }),
        isAvailableOnline: true,
        videoConsultFee: 700,
        rating: 4.8,
        totalReviews: 125,
        isVerified: true,
        totalConsultations: 450
      }
    }),
    prisma.doctor.upsert({
      where: { id: 'doctor-profile-2' },
      update: {},
      create: {
        id: 'doctor-profile-2',
        userId: 'doctor-2',
        name: 'Dr. Priya Sharma',
        phone: '8888888887',
        email: 'priya.sharma@hospital.gov.in',
        specialization: 'Pediatrics',
        qualifications: JSON.stringify(['MBBS', 'MD Pediatrics']),
        yearsOfExperience: 10,
        facilityId: 'facility-1',
        consultationFee: 600,
        languages: JSON.stringify(['Hindi', 'English']),
        availability: JSON.stringify({
          monday: { start: '10:00', end: '18:00' },
          tuesday: { start: '10:00', end: '18:00' },
          wednesday: { start: '10:00', end: '18:00' },
          thursday: { start: '10:00', end: '18:00' },
          friday: { start: '10:00', end: '18:00' }
        }),
        isAvailableOnline: true,
        videoConsultFee: 800,
        rating: 4.9,
        totalReviews: 89,
        isVerified: true,
        totalConsultations: 320
      }
    })
  ]);
  console.log('Created doctor profiles:', doctorProfiles.length);

  // Create patients
  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { id: 'patient-1' },
      update: {},
      create: {
        id: 'patient-1',
        userId: 'citizen-1',
        name: 'Amit Verma',
        age: 35,
        gender: 'Male',
        phone: '6666666666',
        village: 'Village 1',
        district: 'Delhi',
        state: 'Delhi',
        pincode: '110003',
        latitude: 28.6800,
        longitude: 77.2500,
        bloodGroup: 'B+',
        allergies: 'None',
        chronicConditions: 'None',
        isHighRisk: false,
        healthWorkerId: 'hw-1'
      }
    }),
    prisma.patient.upsert({
      where: { id: 'patient-2' },
      update: {},
      create: {
        id: 'patient-2',
        userId: 'citizen-2',
        name: 'Sunita Sharma',
        age: 28,
        gender: 'Female',
        phone: '6666666665',
        village: 'Village 2',
        district: 'Delhi',
        state: 'Delhi',
        pincode: '110004',
        latitude: 28.7000,
        longitude: 77.2700,
        bloodGroup: 'O+',
        allergies: 'Penicillin',
        chronicConditions: 'None',
        isHighRisk: true,
        pregnancyDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        healthWorkerId: 'hw-2'
      }
    }),
    prisma.patient.upsert({
      where: { id: 'patient-3' },
      update: {},
      create: {
        id: 'patient-3',
        name: 'Ramesh Kumar',
        age: 65,
        gender: 'Male',
        phone: '6666666664',
        village: 'Village 1',
        district: 'Delhi',
        state: 'Delhi',
        bloodGroup: 'A+',
        allergies: 'None',
        chronicConditions: 'Diabetes, Hypertension',
        isHighRisk: true,
        healthWorkerId: 'hw-1'
      }
    }),
    prisma.patient.upsert({
      where: { id: 'patient-4' },
      update: {},
      create: {
        id: 'patient-4',
        name: 'Baby Priya',
        age: 2,
        gender: 'Female',
        phone: '6666666663',
        village: 'Village 1',
        district: 'Delhi',
        state: 'Delhi',
        bloodGroup: 'B+',
        allergies: 'None',
        chronicConditions: 'None',
        isHighRisk: true,
        healthWorkerId: 'hw-3'
      }
    })
  ]);
  console.log('Created patients:', patients.length);

  // Create government schemes
  const schemes = await Promise.all([
    prisma.governmentScheme.upsert({
      where: { id: 'scheme-1' },
      update: {},
      create: {
        id: 'scheme-1',
        name: 'Ayushman Bharat - PMJAY',
        description: 'Pradhan Mantri Jan Arogya Yojana (PMJAY) provides health coverage of up to Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization.',
        shortDescription: 'Free health coverage up to Rs. 5 lakhs per family',
        eligibilityCriteria: JSON.stringify({
          income: 'Below poverty line or deprived household',
          categories: ['SC/ST', 'Landless laborers', 'Manual scavengers', 'Tribal groups', 'Urban poor']
        }),
        benefits: JSON.stringify([
          'Cashless hospitalization up to Rs. 5 lakhs',
          'Coverage for pre-existing diseases',
          'Pre and post hospitalization expenses',
          'Day care procedures covered'
        ]),
        documents: JSON.stringify(['Aadhaar Card', 'Ration Card', 'Income Certificate']),
        coverageAmount: 'Rs. 5,00,000',
        coverageType: 'family',
        targetGroups: JSON.stringify(['BPL families', 'Poor families', 'Vulnerable groups']),
        officialWebsite: 'https://pmjay.gov.in',
        helpline: '14555'
      }
    }),
    prisma.governmentScheme.upsert({
      where: { id: 'scheme-2' },
      update: {},
      create: {
        id: 'scheme-2',
        name: 'Janani Suraksha Yojana',
        description: 'A safe motherhood intervention targeting reduction of maternal and neonatal mortality by promoting institutional delivery among poor pregnant women.',
        shortDescription: 'Financial assistance for institutional delivery',
        eligibilityCriteria: JSON.stringify({
          beneficiary: 'Pregnant women from BPL families',
          states: 'All states with special focus on LPS states'
        }),
        benefits: JSON.stringify([
          'Cash assistance for institutional delivery',
          'Rs. 1400 in rural areas',
          'Rs. 1000 in urban areas',
          'Free delivery at government hospitals'
        ]),
        documents: JSON.stringify(['BPL Card', 'Aadhaar Card', 'Antenatal check-up records']),
        coverageAmount: 'Rs. 1400',
        coverageType: 'individual',
        targetGroups: JSON.stringify(['Pregnant women', 'BPL families']),
        officialWebsite: 'https://nhm.gov.in',
        helpline: '1800-180-1104'
      }
    }),
    prisma.governmentScheme.upsert({
      where: { id: 'scheme-3' },
      update: {},
      create: {
        id: 'scheme-3',
        name: 'Rashtriya Bal Swasthya Karyakram',
        description: 'Child Health Screening and Early Intervention Services for children from birth to 18 years covering 4 Ds - Defects at birth, Diseases, Deficiencies and Development delays.',
        shortDescription: 'Free health screening for children 0-18 years',
        eligibilityCriteria: JSON.stringify({
          age: '0-18 years',
          coverage: 'All children in India'
        }),
        benefits: JSON.stringify([
          'Free health screening',
          'Early detection of birth defects',
          'Treatment of childhood diseases',
          'Nutritional deficiency screening',
          'Development delay intervention'
        ]),
        documents: JSON.stringify(['Aadhaar Card', 'Birth Certificate']),
        coverageAmount: 'Free screening and treatment',
        coverageType: 'individual',
        targetGroups: JSON.stringify(['Children 0-18 years', 'School children']),
        officialWebsite: 'https://rbsk.gov.in',
        helpline: '104'
      }
    })
  ]);
  console.log('Created government schemes:', schemes.length);

  // Create vaccination records
  const vaccinations = await Promise.all([
    prisma.vaccinationRecord.create({
      data: {
        patientId: 'patient-4',
        vaccineName: 'BCG',
        doseNumber: 1,
        totalDoses: 1,
        administeredDate: new Date(Date.now() - 700 * 24 * 60 * 60 * 1000),
        facilityId: 'facility-3',
        batchNumber: 'BCG-2024-001'
      }
    }),
    prisma.vaccinationRecord.create({
      data: {
        patientId: 'patient-4',
        vaccineName: 'DPT',
        doseNumber: 1,
        totalDoses: 3,
        administeredDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        facilityId: 'facility-3',
        batchNumber: 'DPT-2024-001'
      }
    }),
    prisma.vaccinationRecord.create({
      data: {
        patientId: 'patient-4',
        vaccineName: 'OPV',
        doseNumber: 1,
        totalDoses: 5,
        administeredDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        facilityId: 'facility-3',
        batchNumber: 'OPV-2024-001'
      }
    })
  ]);
  console.log('Created vaccination records:', vaccinations.length);

  // Create alerts
  const alerts = await Promise.all([
    prisma.alert.create({
      data: {
        title: 'Dengue Outbreak Alert',
        message: 'Increased cases of dengue reported in the district. Take preventive measures against mosquito breeding.',
        type: 'outbreak',
        priority: 'high',
        targetType: 'district',
        district: 'Delhi',
        createdBy: 'admin-1'
      }
    }),
    prisma.alert.create({
      data: {
        title: 'COVID-19 Vaccination Camp',
        message: 'Free COVID-19 vaccination camp at PHC Village 1 on 15th of this month. All eligible citizens are requested to participate.',
        type: 'vaccination',
        priority: 'medium',
        targetType: 'all'
      }
    }),
    prisma.alert.create({
      data: {
        title: 'Medicine Stock Alert',
        message: 'Low stock of Paracetamol and ORS at CHC Block A. Replenishment requested.',
        type: 'stock_alert',
        priority: 'medium',
        targetType: 'facility',
        targetId: 'facility-2'
      }
    })
  ]);
  console.log('Created alerts:', alerts.length);

  // Create health camps
  const healthCamps = await Promise.all([
    prisma.healthCamp.create({
      data: {
        title: 'Free Health Checkup Camp',
        description: 'General health checkup including BP, blood sugar, and BMI screening for all age groups.',
        organizer: 'District Health Department',
        organizerType: 'government',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        startTime: '09:00',
        endTime: '17:00',
        venue: 'Community Center, Block A',
        address: 'Main Road, Block A, Delhi',
        district: 'Delhi',
        state: 'Delhi',
        pincode: '110002',
        services: JSON.stringify(['General Checkup', 'Blood Pressure', 'Blood Sugar', 'Eye Checkup', 'Dental Checkup']),
        capacity: 500,
        registered: 150,
        contactPerson: 'Dr. Rajesh Kumar',
        contactPhone: '8888888888',
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.healthCamp.create({
      data: {
        title: 'Women & Child Health Camp',
        description: 'Special health camp focusing on maternal and child health services including prenatal checkups and immunization.',
        organizer: 'State Health Mission',
        organizerType: 'government',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        startTime: '10:00',
        endTime: '16:00',
        venue: 'PHC Village 1',
        address: 'Gram Panchayat, Village 1, Delhi',
        district: 'Delhi',
        state: 'Delhi',
        pincode: '110003',
        services: JSON.stringify(['Prenatal Checkup', 'Immunization', 'Nutrition Counseling', 'Health Education']),
        capacity: 200,
        registered: 75,
        contactPerson: 'Sunita Devi (ANM)',
        contactPhone: '7777777777',
        registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
      }
    })
  ]);
  console.log('Created health camps:', healthCamps.length);

  // Create medicines
  const medicines = await Promise.all([
    prisma.medicine.create({
      data: {
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        brand: 'Crocin',
        category: 'tablet',
        strength: '500mg',
        form: 'tablet',
        mrp: 25,
        discountPercent: 10,
        inStock: true,
        stockQuantity: 1000,
        requiresPrescription: false,
        uses: JSON.stringify(['Fever', 'Headache', 'Body ache', 'Cold symptoms']),
        sideEffects: JSON.stringify(['Nausea', 'Stomach pain', 'Allergic reaction (rare)'])
      }
    }),
    prisma.medicine.create({
      data: {
        name: 'ORS Powder',
        genericName: 'Oral Rehydration Salts',
        brand: 'Electral',
        category: 'powder',
        form: 'powder',
        mrp: 20,
        discountPercent: 5,
        inStock: true,
        stockQuantity: 500,
        requiresPrescription: false,
        uses: JSON.stringify(['Dehydration', 'Diarrhea', 'Vomiting', 'Heat exhaustion']),
        sideEffects: JSON.stringify(['None when used as directed'])
      }
    }),
    prisma.medicine.create({
      data: {
        name: 'Azithromycin 500mg',
        genericName: 'Azithromycin',
        brand: 'Azee',
        category: 'tablet',
        strength: '500mg',
        form: 'tablet',
        mrp: 120,
        discountPercent: 15,
        inStock: true,
        stockQuantity: 200,
        requiresPrescription: true,
        uses: JSON.stringify(['Bacterial infections', 'Respiratory infections', 'Skin infections']),
        sideEffects: JSON.stringify(['Diarrhea', 'Nausea', 'Stomach pain', 'Headache'])
      }
    })
  ]);
  console.log('Created medicines:', medicines.length);

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\nSample Login Credentials:');
  console.log('- Admin: 9999999999 (any password)');
  console.log('- Doctor: 8888888888 (any password)');
  console.log('- Health Worker: 7777777777 (any password)');
  console.log('- Citizen: 6666666666 (any password)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
