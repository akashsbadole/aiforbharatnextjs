# Swasthya Mitra - Earning & Revenue Model Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Business Philosophy](#business-philosophy)
3. [Revenue Streams](#revenue-streams)
4. [Private Hospital Partnership System](#private-hospital-partnership-system)
5. [Commission Structure](#commission-structure)
6. [Patient Transport Commission System](#patient-transport-commission-system)
7. [Home Visit Doctor Booking](#home-visit-doctor-booking)
8. [Medical Helper/Assistant Marketplace](#medical-helper-assistant-marketplace)
9. [Diagnostic Lab Booking Commission](#diagnostic-lab-booking-commission)
10. [User Wallet & Withdrawal System](#user-wallet--withdrawal-system)
11. [Earnings Dashboard](#earnings-dashboard)
12. [Revenue Projections](#revenue-projections)
13. [Implementation Status](#implementation-status)
14. [Database Schema](#database-schema)
15. [API Endpoints](#api-endpoints)

---

## Overview

Swasthya Mitra is an AI-powered healthcare platform designed for the Indian market. This document outlines the comprehensive earning and revenue model that enables sustainable growth while keeping core healthcare services accessible to all users.

### Key Principles

- **B2B Revenue Model**: Charge hospitals and service providers, not patients
- **Lead Generation Focus**: Monetize by connecting patients with healthcare providers
- **Commission-Based Earnings**: Earn from successful referrals and bookings
- **Freemium for Users**: Core healthcare features remain free for citizens

---

## Business Philosophy

### Target Market Analysis

| Segment | Size in India | Revenue Potential |
|---------|---------------|-------------------|
| Private Hospitals | 45,000+ | ₹2,500 Crore/year |
| Diagnostic Labs | 1,50,000+ | ₹500 Crore/year |
| Medical Helpers | 10,00,000+ | ₹200 Crore/year |
| Ambulance Services | 50,000+ | ₹150 Crore/year |
| Home Healthcare | 5,000+ providers | ₹100 Crore/year |

### Competitive Advantage

1. **AI-Powered Triage**: Better patient-hospital matching
2. **Rural Reach**: Strong presence in underserved areas
3. **Health Worker Network**: 10,000+ ASHA workers connected
4. **Government Integration**: PMJAY & Ayushman Bharat compatible
5. **Multi-language Support**: 12 Indian languages

---

## Revenue Streams

### Primary Revenue Sources

```
┌─────────────────────────────────────────────────────────────────┐
│                    REVENUE BREAKDOWN                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Hospital Partnership ────────────── 45% (₹1.18 Cr/yr)      │
│     • Listing fees                                               │
│     • Lead generation commissions                               │
│     • Premium placement fees                                    │
│                                                                 │
│  2. Diagnostic Lab Commission ───────── 20% (₹52.6 L/yr)       │
│     • Test booking commissions                                  │
│     • Package referral fees                                     │
│                                                                 │
│  3. Transport Commission ────────────── 15% (₹39.5 L/yr)       │
│     • Ambulance booking fee                                     │
│     • Patient transport service                                 │
│                                                                 │
│  4. Home Healthcare ──────────────────── 12% (₹31.5 L/yr)      │
│     • Doctor home visits                                        │
│     • Nursing services                                          │
│                                                                 │
│  5. Medical Helper Marketplace ───────── 8% (₹21 L/yr)         │
│     • Booking fees                                              │
│     • Verification fees                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Private Hospital Partnership System

### Partnership Tiers

#### 🥉 Starter Plan - ₹12,000/year

**Ideal for**: Small clinics and nursing homes

| Feature | Included |
|---------|----------|
| Basic hospital listing | ✅ |
| Contact information display | ✅ |
| Services listing | ✅ |
| OPD lead generation | 20 leads/month |
| Dashboard access | Basic |
| Analytics | ❌ |
| Priority placement | ❌ |
| API access | ❌ |

**Commission Structure**: 8% on converted leads

---

#### 🥈 Growth Plan - ₹36,000/year

**Ideal for**: Multi-specialty clinics, medium hospitals

| Feature | Included |
|---------|----------|
| Enhanced hospital listing | ✅ |
| Photo gallery (up to 10) | ✅ |
| Doctor profiles | ✅ |
| OPD lead generation | 50 leads/month |
| IPD lead generation | 10 leads/month |
| Dashboard access | Advanced |
| Analytics | ✅ Monthly reports |
| Priority placement | District level |
| API access | ❌ |

**Commission Structure**: 6% on converted leads

---

#### 🥇 Enterprise Plan - ₹1,20,000/year

**Ideal for**: Large hospitals, hospital chains

| Feature | Included |
|---------|----------|
| Premium hospital listing | ✅ |
| Photo gallery (unlimited) | ✅ |
| Doctor profiles with videos | ✅ |
| OPD lead generation | Unlimited |
| IPD lead generation | Unlimited |
| Surgery lead generation | 20/month |
| Dashboard access | Full |
| Analytics | ✅ Real-time |
| Priority placement | State level |
| API access | ✅ |
| Dedicated account manager | ✅ |

**Commission Structure**: 5% on converted leads

---

#### 💎 Platinum Plan - ₹3,60,000/year

**Ideal for**: Top-tier hospital chains, medical tourism

| Feature | Included |
|---------|----------|
| Exclusive premium listing | ✅ |
| Virtual hospital tour | ✅ |
| Video consultations integration | ✅ |
| All lead types | Unlimited |
| Dashboard access | White-label option |
| Analytics | ✅ Custom reports |
| Priority placement | National + Exclusive pincode |
| API access | ✅ Priority support |
| Dedicated team | ✅ 24/7 support |
| Medical tourism integration | ✅ |
| International patient handling | ✅ |

**Commission Structure**: 4% on converted leads

---

### Lead Types & Pricing

| Lead Type | Description | Hospital Pays |
|-----------|-------------|---------------|
| **OPD Appointment** | Patient books outpatient consultation | ₹75/lead |
| **IPD Admission** | Patient requires hospitalization | ₹500/lead |
| **Surgery** | Patient needs surgical procedure | ₹2,500/lead |
| **Emergency** | Urgent medical attention needed | ₹300/lead |
| **Diagnostic** | Lab tests or imaging required | ₹50/lead |
| **Health Checkup** | Preventive health package | ₹25/lead |

### Lead Conversion Tracking

```
Lead Status Flow:
─────────────────────────────────────────────────────────────────

[NEW LEAD] → [Contacted] → [Appointment Fixed] → [Visited] → [Converted]
     │              │              │                 │            │
     │              │              │                 │            └─→ Commission Earned
     │              │              │                 │
     └──────────────┴──────────────┴─────────────────┴─→ [Not Converted] (No charge)
```

---

## Commission Structure

### By Service Category

#### Hospital Services Commission

| Service | Base Price Range | Commission % | Platform Earns |
|---------|-----------------|--------------|----------------|
| General Consultation | ₹300-800 | 5-8% | ₹15-64 |
| Specialist Consultation | ₹500-2000 | 6-10% | ₹30-200 |
| Diagnostic Tests | ₹500-5000 | 10-15% | ₹50-750 |
| Minor Procedures | ₹5,000-25,000 | 5-8% | ₹250-2000 |
| Major Surgery | ₹50,000-5,00,000 | 3-5% | ₹1,500-25,000 |
| ICU Admission | ₹25,000-1,00,000/day | 4-6% | ₹1,000-6,000/day |
| Room Rent (Private) | ₹2,000-10,000/day | 5% | ₹100-500/day |

#### Facility Type Commission Rates

| Facility Type | Commission Rate | Reasoning |
|---------------|-----------------|-----------|
| Private Hospital | 12% | Higher margins, competitive market |
| District Hospital | 8% | Government rates, volume focus |
| CHC (Community Health Center) | 6% | Semi-government, accessibility focus |
| PHC (Primary Health Center) | 5% | Government facility, minimal |
| Diagnostic Center | 15% | High margin services |
| Nursing Home | 10% | Mid-tier pricing |
| Clinic | 10% | Small scale operations |

---

## Patient Transport Commission System

### Transport Service Types

| Vehicle Type | Base Fare | Per KM | Platform Commission |
|--------------|-----------|--------|---------------------|
| 108 Ambulance | Free (Govt) | - | ₹0 (Social service) |
| Private Ambulance | ₹2,000 | ₹15/km | ₹50 + 5% |
| Advanced Life Support | ₹5,000 | ₹25/km | ₹200 + 8% |
| Auto Rickshaw | ₹50 | ₹8/km | ₹10 + 10% |
| Volunteer Vehicle | ₹100 | ₹5/km | ₹20 flat |
| Wheelchair Van | ₹500 | ₹10/km | ₹75 + 5% |

### Commission Calculation Examples

```
Example 1: Private Ambulance - 20km trip
─────────────────────────────────────────
Base fare: ₹2,000
Distance charge: 20km × ₹15 = ₹300
Total fare: ₹2,300

Platform commission:
  Base commission: ₹50
  Percentage: 5% of ₹2,300 = ₹115
  Total commission: ₹165

Example 2: Auto Rickshaw - 5km trip
─────────────────────────────────────
Base fare: ₹50
Distance charge: 5km × ₹8 = ₹40
Total fare: ₹90

Platform commission: ₹10 + 10% of ₹90 = ₹19
```

### Transport Partner Benefits

| Partner Type | Commission Split | Monthly Bonus |
|--------------|------------------|---------------|
| Individual Driver | 70% to driver | - |
| Fleet Owner (5+ vehicles) | 75% to owner | ₹5,000 |
| Hospital Partner | 80% to hospital | ₹10,000 |
| Government Integrated | 100% (no commission) | - |

---

## Home Visit Doctor Booking

### Service Structure

| Service Type | Duration | Patient Pays | Doctor Earns | Platform Fee |
|--------------|----------|--------------|--------------|--------------|
| General Checkup | 30 min | ₹500 | ₹400 | ₹100 |
| Specialist Visit | 45 min | ₹1,000 | ₹800 | ₹200 |
| Post-Surgery Care | 60 min | ₹1,500 | ₹1,200 | ₹300 |
| Elderly Care | 45 min | ₹800 | ₹650 | ₹150 |
| Pediatric Visit | 30 min | ₹600 | ₹480 | ₹120 |
| Emergency Visit | 45 min | ₹2,000 | ₹1,600 | ₹400 |

### Doctor Verification Requirements

```
┌─────────────────────────────────────────────────────────────────┐
│                 DOCTOR ONBOARDING REQUIREMENTS                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ MCI/State Medical Council Registration                      │
│  ✅ MBBS/MD/MS Degree Certificate                               │
│  ✅ Identity Proof (Aadhaar/PAN)                                │
│  ✅ Address Proof                                               │
│  ✅ Professional Indemnity Insurance                            │
│  ✅ Background Verification                                     │
│  ✅ Minimum 3 Years Experience                                  │
│  ✅ Clean Disciplinary Record                                   │
│                                                                 │
│  VERIFICATION FEE: ₹2,000 (One-time)                           │
│  RENEWAL: ₹500/year                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Home Visit Commission Tiers

| Doctor Tier | Experience | Platform Commission |
|-------------|------------|---------------------|
| Junior | 3-5 years | 15% |
| Mid-Level | 5-10 years | 12% |
| Senior | 10-15 years | 10% |
| Expert | 15+ years | 8% |

---

## Medical Helper/Assistant Marketplace

### Service Categories

| Category | Services Included | Hourly Rate | Platform Fee |
|----------|-------------------|-------------|--------------|
| Nursing Care | Wound dressing, injections, vitals | ₹300-500/hr | 10% |
| Physiotherapy | Exercise therapy, rehabilitation | ₹400-800/hr | 12% |
| Elderly Care | Daily assistance, medication reminder | ₹250-400/hr | 8% |
| Post-Operative | Surgical wound care, mobility support | ₹350-600/hr | 10% |
| Mother & Child | Newborn care, lactation support | ₹300-500/hr | 10% |
| Mental Health | Counseling, therapy support | ₹500-1000/hr | 15% |

### Helper Verification Process

```
VERIFICATION LEVELS:
─────────────────────────────────────────────────────────────────

BRONZE (Basic) - ₹500 verification fee
├── Identity verification
├── Address verification
└── Basic background check

SILVER (Standard) - ₹1,000 verification fee
├── All Bronze features
├── Qualification verification
├── Work experience check
└── Reference verification

GOLD (Premium) - ₹2,000 verification fee
├── All Silver features
├── Police verification
├── Medical fitness certificate
├── Professional insurance verified
└── Priority listing
```

### Commission Structure by Service

| Service Duration | Helper Earns | Platform Earns |
|------------------|--------------|----------------|
| 1-2 hours | 85% | 15% |
| 3-4 hours | 87% | 13% |
| 5-8 hours | 90% | 10% |
| Daily (8+ hours) | 92% | 8% |
| Weekly package | 93% | 7% |
| Monthly contract | 95% | 5% |

---

## Diagnostic Lab Booking Commission

### Lab Partnership Tiers

| Tier | Annual Fee | Benefits | Commission |
|------|------------|----------|------------|
| Basic | ₹5,000 | Listing, online booking | 15% |
| Standard | ₹15,000 | Priority listing, reports integration | 12% |
| Premium | ₹50,000 | Top placement, home collection, API | 10% |

### Test Categories & Commission

| Test Category | Average Price | Commission % | Platform Earns |
|---------------|---------------|--------------|----------------|
| Blood Tests | ₹200-2,000 | 15% | ₹30-300 |
| Urine Tests | ₹100-500 | 15% | ₹15-75 |
| Imaging (X-Ray) | ₹300-1,500 | 12% | ₹36-180 |
| CT Scan | ₹2,000-15,000 | 10% | ₹200-1,500 |
| MRI | ₹3,000-25,000 | 8% | ₹240-2,000 |
| Ultrasound | ₹500-3,000 | 12% | ₹60-360 |
| ECG | ₹200-500 | 15% | ₹30-75 |
| Full Body Checkup | ₹2,000-15,000 | 12% | ₹240-1,800 |

### Health Package Commissions

| Package Type | Price Range | Commission | Lead Value |
|--------------|-------------|------------|------------|
| Basic Health Check | ₹999-1,500 | ₹100 flat | ₹50 |
| Comprehensive | ₹2,500-5,000 | 12% | ₹100 |
| Executive | ₹5,000-10,000 | 10% | ₹150 |
| Premium | ₹10,000-25,000 | 8% | ₹250 |
| Corporate Package | ₹15,000+ | Custom | ₹500 |

---

## User Wallet & Withdrawal System

### Wallet Features

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER WALLET SYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  EARNING SOURCES:                                               │
│  ├── Hospital referrals (₹50-2,500 per lead)                   │
│  ├── Transport bookings (₹10-200 per trip)                     │
│  ├── Lab test referrals (₹25-500 per booking)                  │
│  ├── Doctor appointments (₹50-200 per booking)                 │
│  └── Helper connections (₹20-100 per connection)               │
│                                                                 │
│  WALLET OPERATIONS:                                             │
│  ├── Add money (UPI, Card, Net Banking)                        │
│  ├── Withdraw to bank (Min ₹500)                               │
│  ├── Pay for services                                          │
│  └── Transfer to other users                                   │
│                                                                 │
│  SECURITY:                                                      │
│  ├── PIN protection                                            │
│  ├── OTP verification for withdrawals                          │
│  └── Transaction limits                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Withdrawal Rules

| User Type | Min Withdrawal | Max/Day | Processing Time | Fee |
|-----------|---------------|---------|-----------------|-----|
| Basic User | ₹500 | ₹5,000 | 3-5 days | 2% |
| Verified User | ₹200 | ₹25,000 | 1-2 days | 1% |
| Partner User | ₹100 | ₹1,00,000 | Same day | 0.5% |
| Health Worker | ₹100 | ₹50,000 | Same day | Free |

### Wallet Transaction Types

```typescript
enum TransactionType {
  // Earnings
  REFERRAL_BONUS = 'referral_bonus',
  COMMISSION_EARNED = 'commission_earned',
  CASHBACK = 'cashback',
  
  // Spending
  SERVICE_PAYMENT = 'service_payment',
  WALLET_TRANSFER = 'wallet_transfer',
  
  // Withdrawals
  BANK_WITHDRAWAL = 'bank_withdrawal',
  UPI_WITHDRAWAL = 'upi_withdrawal',
  
  // Additions
  UPI_DEPOSIT = 'upi_deposit',
  CARD_DEPOSIT = 'card_deposit',
  REFUND = 'refund'
}

enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}
```

---

## Earnings Dashboard

### Dashboard Components

#### 1. Overview Cards

```
┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Total Earnings │ │ Pending Amount │ │ This Month     │ │ Total Referrals│
│    ₹45,230     │ │    ₹3,500      │ │    ₹12,450     │ │      156       │
│   +15% ↑      │ │   5 pending    │ │   +22% ↑      │ │   This month   │
└────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘
```

#### 2. Earnings Breakdown Chart

| Category | This Month | Last Month | Change |
|----------|------------|------------|--------|
| Hospital Referrals | ₹7,500 | ₹5,200 | +44% |
| Transport Bookings | ₹2,500 | ₹1,800 | +39% |
| Lab Referrals | ₹1,850 | ₹1,200 | +54% |
| Doctor Appointments | ₹600 | ₹450 | +33% |

#### 3. Recent Transactions Table

| Date | Type | Description | Amount | Status |
|------|------|-------------|--------|--------|
| 15 Jan | Referral | Apollo Hospital - OPD | ₹75 | Completed |
| 14 Jan | Transport | Ambulance booking | ₹50 | Completed |
| 13 Jan | Referral | Medanta - Surgery | ₹2,500 | Pending |
| 12 Jan | Withdrawal | Bank transfer | -₹5,000 | Processing |

#### 4. Partner Performance

```
TOP PERFORMING PARTNERS:
─────────────────────────────────────────────────────────────────

Apollo Hospital
├── Referrals this month: 45
├── Conversion rate: 68%
├── Earnings: ₹8,500
└── Rank: #1 in your district

Medanta Medicity
├── Referrals this month: 32
├── Conversion rate: 72%
├── Earnings: ₹6,200
└── Rank: #2 in your district
```

### Analytics Features

| Metric | Description | Use Case |
|--------|-------------|----------|
| Conversion Rate | Leads converted / Total leads | Optimize targeting |
| Earnings Per Referral | Total earnings / Referrals | Identify best partners |
| Average Response Time | Time to lead acknowledgment | Improve service |
| Customer Satisfaction | Rating from referred patients | Quality control |
| Peak Hours | Most active referral times | Staff planning |

---

## Revenue Projections

### Year 1 Projections (Conservative)

| Revenue Stream | Monthly | Quarterly | Annual |
|----------------|---------|-----------|--------|
| Hospital Partnerships (Starter) | ₹40,000 | ₹1,20,000 | ₹4,80,000 |
| Hospital Partnerships (Growth) | ₹90,000 | ₹2,70,000 | ₹10,80,000 |
| Hospital Partnerships (Enterprise) | ₹3,00,000 | ₹9,00,000 | ₹36,00,000 |
| Hospital Partnerships (Platinum) | ₹6,00,000 | ₹18,00,000 | ₹72,00,000 |
| OPD Lead Commissions | ₹50,000 | ₹1,50,000 | ₹6,00,000 |
| IPD Lead Commissions | ₹1,00,000 | ₹3,00,000 | ₹12,00,000 |
| Surgery Lead Commissions | ₹2,00,000 | ₹6,00,000 | ₹24,00,000 |
| Transport Commissions | ₹30,000 | ₹90,000 | ₹3,60,000 |
| Lab Booking Commissions | ₹45,000 | ₹1,35,000 | ₹5,40,000 |
| Home Healthcare | ₹25,000 | ₹75,000 | ₹3,00,000 |
| Helper Marketplace | ₹15,000 | ₹45,000 | ₹1,80,000 |
| **TOTAL** | **₹14,95,000** | **₹44,85,000** | **₹1,79,40,000** |

### Year 3 Projections (Growth Scenario)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Partner Hospitals | 50 | 200 | 500 |
| Monthly Active Users | 50,000 | 2,00,000 | 5,00,000 |
| Monthly Leads | 5,000 | 25,000 | 75,000 |
| Annual Revenue | ₹1.79 Cr | ₹8.5 Cr | ₹26.3 Cr |
| Profit Margin | 15% | 25% | 35% |

### Revenue Mix Target

```
Year 3 Revenue Distribution:
─────────────────────────────────────────────────────────────────

Hospital Partnerships     ████████████████████████████   45%
Lab Commissions          ████████████                   20%
Transport Services       █████████                      15%
Home Healthcare          ███████                        12%
Helper Marketplace       █████                          8%
```

---

## Implementation Status

### ✅ Completed

- [x] Database schema design (ReferralTracking, HospitalPartnership, UserWallet, WithdrawalRequest)
- [x] API endpoints for partnerships
- [x] Commission calculation logic
- [x] Mock data for hospital listings
- [x] Transport request system
- [x] Base earning stats calculation

### 🔄 In Progress

- [ ] Hospital partnership listing UI
- [ ] Lead generation forms
- [ ] Earnings dashboard frontend
- [ ] Wallet management interface
- [ ] Withdrawal processing system

### 📋 Planned

- [ ] Automated lead assignment
- [ ] Real-time conversion tracking
- [ ] Payment gateway integration (Razorpay)
- [ ] GST invoice generation
- [ ] Partner mobile app
- [ ] Advanced analytics dashboard
- [ ] AI-based lead scoring

---

## Database Schema

### Core Models

```prisma
// Referral Tracking
model ReferralTracking {
  id              String    @id @default(cuid())
  referrerId      String    // User who referred
  type            String    // hospital, transport, appointment, lab
  targetId        String?   // Hospital/Doctor/Lab ID
  targetName      String    // Display name
  patientName     String?
  patientPhone    String?
  serviceType     String?   // OPD, IPD, surgery, etc.
  commissionRate  Float     // Percentage
  commissionEarned Float    // Actual amount earned
  status          String    @default("pending") // pending, completed, cancelled
  metadata        String?   // JSON for additional data
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// Hospital Partnership
model HospitalPartnership {
  id              String    @id @default(cuid())
  hospitalId      String    @unique
  hospitalName    String
  partnershipTier String    // starter, growth, enterprise, platinum
  annualFee       Float
  startDate       DateTime
  endDate         DateTime
  leadQuota       Int       // Monthly lead limit
  leadsUsed       Int       @default(0)
  commissionRate  Float
  totalReferrals  Int       @default(0)
  totalEarnings   Float     @default(0)
  status          String    @default("active")
  contactPerson   String?
  contactPhone    String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// User Wallet
model UserWallet {
  id              String    @id @default(cuid())
  userId          String    @unique
  balance         Float     @default(0)
  totalEarned     Float     @default(0)
  totalWithdrawn  Float     @default(0)
  pendingBalance  Float     @default(0)
  accountNumber   String?   // Bank account
  ifscCode        String?
  upiId           String?
  isVerified      Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// Withdrawal Requests
model WithdrawalRequest {
  id              String    @id @default(cuid())
  userId          String
  amount          Float
  withdrawalType  String    // bank, upi
  accountDetails  String    // JSON
  status          String    @default("pending")
  transactionId   String?
  processedAt     DateTime?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// Wallet Transactions
model WalletTransaction {
  id              String    @id @default(cuid())
  walletId        String
  type            String    // referral_bonus, commission, withdrawal, deposit
  amount          Float
  description     String
  referenceId     String?   // Related referral/booking ID
  status          String    @default("completed")
  balanceAfter    Float
  createdAt       DateTime  @default(now())
}
```

---

## API Endpoints

### Partnerships API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/partnerships?type=hospitals` | List partner hospitals |
| GET | `/api/partnerships?type=stats&userId=xxx` | Get earning stats |
| GET | `/api/partnerships?type=referrals&userId=xxx` | Get referral history |
| GET | `/api/partnerships?partnershipId=xxx` | Get partnership details |
| POST | `/api/partnerships` | Create referral/booking |
| PUT | `/api/partnerships` | Update referral status |

### Wallet API (Planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet` | Get wallet balance |
| POST | `/api/wallet/deposit` | Add money to wallet |
| POST | `/api/wallet/withdraw` | Request withdrawal |
| GET | `/api/wallet/transactions` | Transaction history |

### Lead Management API (Planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | Get leads for hospital |
| POST | `/api/leads` | Create new lead |
| PUT | `/api/leads/[id]` | Update lead status |
| POST | `/api/leads/[id]/convert` | Mark lead as converted |

---

## Commission Calculation Examples

### Example 1: OPD Appointment Referral

```typescript
// Input
const lead = {
  type: 'OPD',
  hospitalType: 'Private Hospital',
  estimatedValue: 1000, // ₹1,000 consultation
  hospitalTier: 'growth'
};

// Calculation
const baseCommission = 75; // ₹75 per OPD lead
const percentageCommission = 1000 * 0.06; // 6% for Growth tier
const totalCommission = baseCommission; // Flat rate for OPD

// Output
{
  leadType: 'OPD',
  hospitalPays: 75, // ₹75 to platform
  referrerEarns: 25, // ₹25 to referrer (health worker)
  platformKeeps: 50 // ₹50 platform revenue
}
```

### Example 2: Surgery Lead

```typescript
// Input
const lead = {
  type: 'Surgery',
  hospitalType: 'Private Hospital',
  estimatedValue: 200000, // ₹2,00,000 surgery
  surgeryType: 'Cardiac'
};

// Calculation
const surgeryLeadFee = 2500; // ₹2,500 per surgery lead
const percentageCommission = 200000 * 0.05; // 5% commission
const totalCommission = Math.max(surgeryLeadFee, percentageCommission);

// Output
{
  leadType: 'Surgery',
  hospitalPays: 10000, // ₹10,000 (5% of surgery cost)
  referrerEarns: 2000, // ₹2,000 to referrer
  platformKeeps: 8000 // ₹8,000 platform revenue
}
```

---

## Security & Compliance

### Data Protection

- All patient data encrypted at rest (AES-256)
- TLS 1.3 for data in transit
- PII masked in logs
- GDPR & DPDP Act compliant

### Financial Security

- PCI-DSS compliance for payments
- RBI guidelines for wallet operations
- Automated fraud detection
- Transaction limits and monitoring

### Partner Verification

- GST verification for hospitals
- Medical council registration check
- Background verification for individuals
- Regular compliance audits

---

## Support & Resources

### Partner Support

| Tier | Response Time | Support Channel |
|------|---------------|-----------------|
| Starter | 48 hours | Email |
| Growth | 24 hours | Email + Phone |
| Enterprise | 4 hours | Dedicated line |
| Platinum | 1 hour | 24/7 dedicated team |

### Training Resources

- Partner onboarding videos
- Lead management best practices
- Dashboard usage guide
- API documentation
- Monthly webinars

---

*Last Updated: January 2025*
*Version: 1.0*
*Document Owner: Swasthya Mitra Product Team*
