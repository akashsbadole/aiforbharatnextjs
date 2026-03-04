"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, MapPin, Users, AlertTriangle, Syringe, BarChart3,
  Phone, MessageCircle, Mic, Camera, Send, Heart, Activity,
  Building2, Car, Pill, Calendar, Bell, FileText, Shield, Globe,
  ChevronRight, Clock, Thermometer, Brain, Cross, Ambulance, Baby,
  Bug, Droplets, Wind, UserCheck, CheckCircle2, XCircle, AlertCircle,
  Info, Search, Filter, Plus, Eye, Ear, Hand, Loader2, LogIn, LogOut,
  User, Settings, Menu, X, Home, UserPlus, Lock, Mail, MapPinned,
  Square, Volume2, VolumeX, Star, Trash2, Edit, CreditCard, Package,
  QrCode, ExternalLink, Download, Share2, ClipboardList, ShieldCheck,
  FileCheck, Award, TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw,
  MessageSquare, Trophy, Target, Flame, Zap, Medal, Crown, HandHeart,
  ThumbsUp, Bookmark, Flag, Map, Navigation, Moon, BookOpen, Upload
} from "lucide-react";
import LandingPage from "@/components/LandingPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Types
interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'citizen' | 'health_worker' | 'doctor' | 'admin';
  language: string;
  district?: string;
  state?: string;
}

interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  brand?: string;
  category: string;
  strength?: string;
  mrp: number;
  discountPercent?: number;
  inStock?: boolean;
  requiresPrescription?: boolean;
  description?: string;
}

interface CartItem extends Medicine {
  quantity: number;
}

interface Doctor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  photo?: string;
  specialization: string;
  qualifications?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  videoConsultFee?: number;
  followUpFee?: number;
  isAvailableOnline?: boolean;
  isAvailableInPerson?: boolean;
  facilityId?: string;
  facilityName?: string;
  rating?: number;
  totalReviews?: number;
  totalConsultations?: number;
  totalPatients?: number;
  isVerified?: boolean;
  languages?: string;
  bio?: string;
  availability?: string;
  slotDuration?: number;
  bufferTime?: number;
  status?: string;
  registrationNumber?: string;
  registrationCouncil?: string;
  gender?: string;
}

interface Consultation {
  id: string;
  doctorId: string;
  doctor?: Doctor;
  scheduledDate: Date | string;
  scheduledTime: string;
  duration?: number;
  type: string;
  reason?: string;
  fee: number;
  status: string;
  videoLink?: string;
  roomCode?: string;
}

interface Scheme {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  eligibilityCriteria: Record<string, unknown>;
  benefits: string[];
  documents: string[];
  coverageAmount?: string;
  coverageType?: string;
  targetGroups?: string[];
  isActive?: boolean;
  officialWebsite?: string;
  helpline?: string;
}

// Structured Medical Response for 7-Level Intelligence
interface StructuredMedicalResponse {
  understanding?: {
    summary: string;
    empathy: string;
  };
  context?: {
    relevantHistory: string[];
    followUpQuestions: string[];
  };
  tools?: {
    symptomChecker?: string;
    nearbyFacilities?: Array<{ name: string; address: string; phone: string; distance?: string }>;
    medicationInfo?: Array<{ name: string; usage: string; dosage: string; warning: string }>;
    toolsUsed: string[];
  };
  reasoning?: {
    possibleCauses: string[];
    severity: 'low' | 'moderate' | 'high' | 'critical';
    redFlags: string[];
    differentialDiagnosis: string[];
  };
  specializedAgents?: {
    nutritionAdvice?: string[];
    lifestyleAdvice?: string[];
    mentalHealthSupport?: string;
    followUpPlan?: string;
  };
  evidence?: {
    trustedSources: string[];
    homeRemedies: string[];
    whenToSeeDoctor: string[];
  };
  prevention?: {
    tips: string[];
    vaccinationRecommendations?: string[];
    longTermHealth: string[];
  };
  emergencyNumbers?: {
    ambulance: string;
    emergency: string;
    women_helpline: string;
    child_helpline: string;
  };
  disclaimer?: string;
  agentRole?: string;
  processingTime?: number;
}

interface HealthCard {
  id: string;
  cardNumber: string;
  cardType?: string;
  qrData?: string;
  bloodGroup?: string;
  allergies?: string;
  chronicConditions?: string;
  emergencyContact?: string;
  issuedAt?: Date | string;
  validUntil?: Date | string;
  status?: string;
}

interface Reminder {
  id: string;
  medicineName: string;
  dosage?: string;
  instructions?: string;
  frequency: string;
  times: string;
  startDate: Date | string;
  endDate?: Date | string;
  days?: string;
  isActive?: boolean;
  dosesTaken?: number;
  dosesMissed?: number;
  lastTakenAt?: Date | string;
}

interface Vaccination {
  id: string;
  vaccineName: string;
  doseNumber: number;
  totalDoses: number;
  administeredDate: Date | string;
  nextDueDate?: Date | string;
  facilityId?: string;
  batchNumber?: string;
}

interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  district: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  services?: string;
  bedCapacity?: number;
  availableBeds?: number;
  isOpen?: boolean;
  crowdLevel?: string;
}

interface AlertData {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  status?: string;
  createdAt?: Date | string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  authorName?: string;
  likesCount?: number;
  repliesCount?: number;
  isPinned?: boolean;
  createdAt: Date | string;
  replies?: ForumReply[];
}

interface ForumReply {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName?: string;
  likesCount?: number;
  createdAt: Date | string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  targetValue: number;
  unit: string;
  startDate: Date | string;
  endDate: Date | string;
  points: number;
  badge?: string;
  participantsCount?: number;
  userProgress?: number;
  isJoined?: boolean;
}

interface HealthCamp {
  id: string;
  name: string;
  description?: string;
  district: string;
  state: string;
  address: string;
  services: string;
  capacity?: number;
  registeredCount?: number;
  campDate: Date | string;
  startTime: string;
  endTime: string;
  contactPhone?: string;
  contactEmail?: string;
  isActive?: boolean;
  isRegistered?: boolean;
}

interface Volunteer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  skills: string;
  availability: string;
  district?: string;
  state?: string;
  rating?: number;
  totalServices?: number;
  isVerified?: boolean;
  userId?: string;
}

// Auth Context - Simple implementation
const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('session_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch {
      // Ignore auth check errors
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        localStorage.setItem('session_token', data.token);
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: data.error || 'Login failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    role?: string;
    language?: string;
    district?: string;
  }) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success && result.user && result.token) {
        localStorage.setItem('session_token', result.token);
        setUser(result.user);
        return { success: true };
      }

      return { success: false, error: result.error || 'Registration failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } catch {
      // Ignore
    }
    localStorage.removeItem('session_token');
    setUser(null);
  };

  return { user, isAuthenticated: !!user, isLoading, login, register, logout };
};

// Language options
const languages = [
  { code: "hi", name: "हिंदी" },
  { code: "mr", name: "मराठी" },
  { code: "ta", name: "தமிழ்" },
  { code: "en", name: "English" },
  { code: "bn", name: "বাংলা" },
  { code: "te", name: "తెలుగు" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "kn", name: "ಕನ್ನಡ" }
];

// Navigation items with proper role-based access control
const getNavItems = (role: string) => {
  const baseItems = [
    // === CITIZEN FEATURES ===
    { id: "assistant", label: "AI Assistant", icon: Stethoscope, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "telemedicine", label: "Telemedicine", icon: Activity, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "appointments", label: "Appointments", icon: Calendar, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "emr", label: "Health Records", icon: FileText, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "pharmacy", label: "E-Pharmacy", icon: Pill, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "facilities", label: "Facilities", icon: Building2, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "healthcard", label: "Health Card", icon: CreditCard, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "schemes", label: "Govt Schemes", icon: FileText, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "vaccination", label: "Vaccination", icon: Syringe, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "reminders", label: "Reminders", icon: Bell, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "community", label: "Community", icon: MessageSquare, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "challenges", label: "Challenges", icon: Trophy, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "healthcamps", label: "Health Camps", icon: Calendar, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "volunteers", label: "Volunteers", icon: HandHeart, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "emergency", label: "Emergency", icon: AlertTriangle, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    { id: "transport", label: "Transport", icon: Ambulance, roles: ['citizen', 'health_worker', 'doctor', 'admin'] },
    
    // === HEALTH WORKER FEATURES (not for citizen) ===
    { id: "earnings", label: "Earnings", icon: Trophy, roles: ['health_worker', 'doctor', 'admin'] },
    { id: "doctors", label: "Doctors", icon: UserCheck, roles: ['health_worker', 'doctor', 'admin'] },
    { id: "enquiries", label: "Enquiries", icon: MessageCircle, roles: ['health_worker', 'doctor', 'admin'] },
    { id: "worker", label: "Worker Panel", icon: Users, roles: ['health_worker', 'doctor', 'admin'] },
    { id: "analytics", label: "Analytics", icon: BarChart3, roles: ['health_worker', 'doctor', 'admin'] },
    
    // === ADMIN ONLY ===
    { id: "admin", label: "Admin", icon: Settings, roles: ['admin'] }
  ];
  
  return baseItems.filter(item => item.roles.includes(role));
};

// Role-based access control for tabs
const canAccessTab = (tabId: string, role: string): boolean => {
  const tabRoles: Record<string, string[]> = {
    // Citizen accessible
    'assistant': ['citizen', 'health_worker', 'doctor', 'admin'],
    'telemedicine': ['citizen', 'health_worker', 'doctor', 'admin'],
    'appointments': ['citizen', 'health_worker', 'doctor', 'admin'],
    'emr': ['citizen', 'health_worker', 'doctor', 'admin'],
    'pharmacy': ['citizen', 'health_worker', 'doctor', 'admin'],
    'facilities': ['citizen', 'health_worker', 'doctor', 'admin'],
    'healthcard': ['citizen', 'health_worker', 'doctor', 'admin'],
    'schemes': ['citizen', 'health_worker', 'doctor', 'admin'],
    'vaccination': ['citizen', 'health_worker', 'doctor', 'admin'],
    'reminders': ['citizen', 'health_worker', 'doctor', 'admin'],
    'community': ['citizen', 'health_worker', 'doctor', 'admin'],
    'challenges': ['citizen', 'health_worker', 'doctor', 'admin'],
    'healthcamps': ['citizen', 'health_worker', 'doctor', 'admin'],
    'volunteers': ['citizen', 'health_worker', 'doctor', 'admin'],
    'emergency': ['citizen', 'health_worker', 'doctor', 'admin'],
    'transport': ['citizen', 'health_worker', 'doctor', 'admin'],
    // Health Worker+ only
    'earnings': ['health_worker', 'doctor', 'admin'],
    'doctors': ['health_worker', 'doctor', 'admin'],
    'enquiries': ['health_worker', 'doctor', 'admin'],
    'worker': ['health_worker', 'doctor', 'admin'],
    'analytics': ['health_worker', 'doctor', 'admin'],
    // Admin only
    'admin': ['admin']
  };
  
  return tabRoles[tabId]?.includes(role) ?? false;
};

// Structured Response Display Component - Shows all 7 intelligence levels
function StructuredResponseDisplay({ response, language }: { response: StructuredMedicalResponse; language: string }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['understanding', 'reasoning', 'tools', 'prevention']));
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };
  
  const labels = {
    hi: {
      understanding: 'समझ',
      context: 'संदर्भ',
      tools: 'उपकरण',
      reasoning: 'विश्लेषण',
      specializedAgents: 'विशेषज्ञ सलाह',
      evidence: 'साक्ष्यात्मक जानकारी',
      prevention: 'रोकथाम',
      homeRemedies: 'घरेलू उपाय',
      emergency: 'आपातकालीन',
      disclaimer: 'अस्वीकरण'
    },
    en: {
      understanding: 'Understanding',
      context: 'Context',
      tools: 'Tools & Resources',
      reasoning: 'Medical Analysis',
      specializedAgents: 'Specialized Advice',
      evidence: 'Evidence-Based Info',
      prevention: 'Prevention & Tips',
      homeRemedies: 'Home Remedies',
      emergency: 'Emergency',
      disclaimer: 'Disclaimer'
    }
  };
  
  const l = labels[language as keyof typeof labels] || labels.en;
  
  return (
    <div className="mt-3 space-y-2 border rounded-lg p-3 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-gray-900">
      {/* Level 1: Understanding */}
      {response.understanding && expandedSections.has('understanding') && (
        <div className="p-2 rounded bg-white dark:bg-gray-800 border">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('understanding')}>
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <span className="font-medium text-sm text-indigo-600">{l.understanding}</span>
              <Badge variant="outline" className="text-xs">L1</Badge>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.has('understanding') ? 'rotate-90' : ''}`} />
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            <p className="font-medium">{response.understanding.summary}</p>
            {response.understanding.empathy && (
              <p className="mt-1 italic text-muted-foreground text-xs">"{response.understanding.empathy}"</p>
            )}
          </div>
        </div>
      )}
      
      {/* Level 2: Context */}
      {response.context?.followUpQuestions && response.context.followUpQuestions.length > 0 && expandedSections.has('context') && (
        <div className="p-2 rounded bg-white dark:bg-gray-800 border">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('context')}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <span className="font-medium text-sm text-indigo-600">{l.context}</span>
              <Badge variant="outline" className="text-xs">L2</Badge>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.has('context') ? 'rotate-90' : ''}`} />
          </div>
          <div className="mt-2 space-y-1">
            {response.context.followUpQuestions.map((q, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="text-indigo-500">•</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Level 3: Tools */}
      {(response.tools?.nearbyFacilities || response.tools?.medicationInfo) && expandedSections.has('tools') && (
        <div className="p-2 rounded bg-white dark:bg-gray-800 border">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('tools')}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔧</span>
              <span className="font-medium text-sm text-indigo-600">{l.tools}</span>
              <Badge variant="outline" className="text-xs">L3</Badge>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.has('tools') ? 'rotate-90' : ''}`} />
          </div>
          <div className="mt-2 space-y-2">
            {response.tools.nearbyFacilities && response.tools.nearbyFacilities.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">🏥 Nearby Facilities:</p>
                {response.tools.nearbyFacilities.map((f, i) => (
                  <div key={i} className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded text-xs">
                    <p className="font-medium">{f.name}</p>
                    <p className="text-muted-foreground">{f.address}</p>
                    <p className="text-indigo-600">📞 {f.phone}</p>
                  </div>
                ))}
              </div>
            )}
            {response.tools.medicationInfo && response.tools.medicationInfo.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">💊 Medication Guide:</p>
                {response.tools.medicationInfo.map((m, i) => (
                  <div key={i} className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded text-xs">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-muted-foreground">{m.usage}</p>
                    <p className="text-indigo-600">Dosage: {m.dosage}</p>
                    <p className="text-rose-600 text-xs mt-1">⚠️ {m.warning}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Level 4: Reasoning */}
      {response.reasoning && expandedSections.has('reasoning') && (
        <div className="p-2 rounded bg-white dark:bg-gray-800 border">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('reasoning')}>
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span className="font-medium text-sm text-indigo-600">{l.reasoning}</span>
              <Badge variant="outline" className="text-xs">L4</Badge>
              {response.reasoning.severity && (
                <Badge className={`text-xs ${
                  response.reasoning.severity === 'critical' ? 'bg-rose-500' :
                  response.reasoning.severity === 'high' ? 'bg-indigo-500' :
                  response.reasoning.severity === 'moderate' ? 'bg-indigo-500' : 'bg-indigo-500'
                }`}>
                  {response.reasoning.severity}
                </Badge>
              )}
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.has('reasoning') ? 'rotate-90' : ''}`} />
          </div>
          <div className="mt-2 space-y-2">
            {response.reasoning.possibleCauses && response.reasoning.possibleCauses.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Possible Causes:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {response.reasoning.possibleCauses.map((c, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
            )}
            {response.reasoning.redFlags && response.reasoning.redFlags.length > 0 && (
              <div className="p-2 bg-rose-50 dark:bg-rose-950 rounded border border-rose-200">
                <p className="text-xs font-medium text-rose-700 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Red Flags - Seek Immediate Care:
                </p>
                <ul className="mt-1 space-y-1 text-xs text-rose-600">
                  {response.reasoning.redFlags.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Level 5: Specialized Agents */}
      {response.specializedAgents && expandedSections.has('specializedAgents') && (
        <div className="p-2 rounded bg-white dark:bg-gray-800 border">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('specializedAgents')}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="font-medium text-sm text-indigo-600">{l.specializedAgents}</span>
              <Badge variant="outline" className="text-xs">L5</Badge>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.has('specializedAgents') ? 'rotate-90' : ''}`} />
          </div>
          <div className="mt-2 space-y-2 text-xs">
            {response.specializedAgents.nutritionAdvice && (
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded">
                <p className="font-medium text-indigo-700">🍎 Nutrition:</p>
                <ul className="mt-1 space-y-1">
                  {response.specializedAgents.nutritionAdvice.map((n, i) => (
                    <li key={i}>• {n}</li>
                  ))}
                </ul>
              </div>
            )}
            {response.specializedAgents.lifestyleAdvice && (
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded">
                <p className="font-medium text-indigo-600">🏃 Lifestyle:</p>
                <ul className="mt-1 space-y-1">
                  {response.specializedAgents.lifestyleAdvice.map((l, i) => (
                    <li key={i}>• {l}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Level 6: Evidence (RAG) */}
      {response.evidence && expandedSections.has('evidence') && (
        <div className="p-2 rounded bg-white dark:bg-gray-800 border">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('evidence')}>
            <div className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <span className="font-medium text-sm text-indigo-600">{l.evidence}</span>
              <Badge variant="outline" className="text-xs">L6</Badge>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.has('evidence') ? 'rotate-90' : ''}`} />
          </div>
          <div className="mt-2 space-y-2 text-xs">
            {response.evidence.homeRemedies && response.evidence.homeRemedies.length > 0 && (
              <div>
                <p className="font-medium text-muted-foreground">🏠 {l.homeRemedies}:</p>
                <ul className="mt-1 space-y-1">
                  {response.evidence.homeRemedies.map((h, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <CheckCircle2 className="h-3 w-3 text-indigo-500 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {response.evidence.whenToSeeDoctor && response.evidence.whenToSeeDoctor.length > 0 && (
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded">
                <p className="font-medium text-indigo-700">🏥 When to See a Doctor:</p>
                <ul className="mt-1 space-y-1">
                  {response.evidence.whenToSeeDoctor.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Level 7: Prevention */}
      {response.prevention && expandedSections.has('prevention') && (
        <div className="p-2 rounded bg-white dark:bg-gray-800 border">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('prevention')}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎓</span>
              <span className="font-medium text-sm text-indigo-600">{l.prevention}</span>
              <Badge variant="outline" className="text-xs">L7</Badge>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.has('prevention') ? 'rotate-90' : ''}`} />
          </div>
          <div className="mt-2 space-y-2 text-xs">
            {response.prevention.tips && response.prevention.tips.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {response.prevention.tips.map((t, i) => (
                  <Badge key={i} variant="outline" className="bg-indigo-50 dark:bg-indigo-950">
                    ✓ {t}
                  </Badge>
                ))}
              </div>
            )}
            {response.prevention.vaccinationRecommendations && (
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded">
                <p className="font-medium text-indigo-700">💉 Vaccinations:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {response.prevention.vaccinationRecommendations.map((v, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{v}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Emergency Numbers */}
      {response.emergencyNumbers && (
        <div className="p-2 bg-rose-50 dark:bg-rose-950 rounded border border-rose-200">
          <p className="text-xs font-medium text-rose-700 flex items-center gap-1">
            <Phone className="h-3 w-3" /> {l.emergency} Numbers
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className="bg-rose-500">🚑 Ambulance: 108</Badge>
            <Badge className="bg-indigo-500">📞 Emergency: 112</Badge>
            <Badge className="bg-indigo-500">👩 Women: 181</Badge>
            <Badge className="bg-indigo-500">👶 Child: 1098</Badge>
          </div>
        </div>
      )}
      
      {/* Disclaimer */}
      {response.disclaimer && (
        <div className="text-xs text-muted-foreground italic p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <AlertCircle className="h-3 w-3 inline mr-1" />
          {response.disclaimer}
        </div>
      )}
    </div>
  );
}

// Main App Component
export default function HealthPlatform() {
  // Auth
  const { user, isAuthenticated, isLoading: authLoading, login, register, logout } = useAuthState();
  
  // UI State
  const [activeTab, setActiveTab] = useState("assistant");
  const [language, setLanguage] = useState("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  
  // Form states
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerData, setRegisterData] = useState({
    name: "", phone: "", email: "", password: "", role: "citizen", language: "en", district: ""
  });

  // AI Chat states
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string; hasImage?: boolean; id?: string; structured?: StructuredMedicalResponse }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [chatImagePreview, setChatImagePreview] = useState<string | null>(null);
  const [intelligenceLevel, setIntelligenceLevel] = useState(7);
  const [feedbackRatings, setFeedbackRatings] = useState<Record<string, { rating: number; wasHelpful: boolean }>>({});
  const [chatMetadata, setChatMetadata] = useState<Record<string, { agentRole?: string; toolsUsed?: string[]; reasoning?: string[] }>>({});
  
  // Voice states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isPlayingTTS, setIsPlayingTTS] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({});
  
  // Data states
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [healthCard, setHealthCard] = useState<HealthCard | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  // New feature states
  const [forums, setForums] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [healthCamps, setHealthCamps] = useState<HealthCamp[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [showEnquiryDialog, setShowEnquiryDialog] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [enquiryStatus, setEnquiryStatus] = useState<string>('all');
  
  // Filter states
  const [forumCategory, setForumCategory] = useState<string>('all');
  const [challengeType, setChallengeType] = useState<string>('all');
  const [campDistrict, setCampDistrict] = useState<string>('');
  const [volunteerSkill, setVolunteerSkill] = useState<string>('all');
  
  // Dialog states
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const [showCampDialog, setShowCampDialog] = useState(false);
  const [showVolunteerDialog, setShowVolunteerDialog] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Dialog states
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showSchemeDialog, setShowSchemeDialog] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [showVaccinationDialog, setShowVaccinationDialog] = useState(false);
  const [sosActivated, setSosActivated] = useState(false);
  
  // Doctor Management states
  const [showAddDoctorDialog, setShowAddDoctorDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDoctorProfileDialog, setShowDoctorProfileDialog] = useState(false);
  const [selectedDoctorForEdit, setSelectedDoctorForEdit] = useState<Doctor | null>(null);
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [doctorSearchQuery, setDoctorSearchQuery] = useState<string>('');
  const [doctorSchedule, setDoctorSchedule] = useState<any[]>([]);
  const [doctorLeaves, setDoctorLeaves] = useState<any[]>([]);
  const [isLoadingDoctorData, setIsLoadingDoctorData] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    name: '', phone: '', email: '', specialization: '', qualifications: [] as string[],
    consultationFee: 0, videoConsultFee: 0, followUpFee: 0, yearsOfExperience: 0,
    registrationNumber: '', registrationCouncil: '', facilityName: '', bio: '',
    isAvailableOnline: true, isAvailableInPerson: true, slotDuration: 15, bufferTime: 5,
    languages: [] as string[], gender: '', status: 'active'
  });
  const [leaveForm, setLeaveForm] = useState({
    startDate: '', endDate: '', leaveType: 'full_day', reason: ''
  });
  
  // Appointment Booking states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [appointmentFilter, setAppointmentFilter] = useState<string>('all');
  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: '', patientName: '', patientPhone: '', patientAge: '',
    patientGender: 'male', appointmentDate: '', appointmentTime: '',
    type: 'checkup', mode: 'in_person', reason: '', notes: '',
    symptoms: [] as string[], followUpRequired: false
  });
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [appointmentStats, setAppointmentStats] = useState({
    today: 0, upcoming: 0, completed: 0, cancelled: 0
  });
  
  // EMR (Electronic Medical Records) states
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showRecordDetail, setShowRecordDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [recordFilter, setRecordFilter] = useState<string>('all');
  const [recordTypeFilter, setRecordTypeFilter] = useState<string>('all');
  const [recordForm, setRecordForm] = useState({
    type: 'prescription', category: '', title: '', description: '',
    diagnosis: '', symptoms: [] as string[], prescription: [] as string[],
    bloodPressureSystolic: '', bloodPressureDiastolic: '',
    heartRate: '', temperature: '', oxygenSaturation: '',
    weight: '', height: '', bloodGroup: '',
    doctorId: '', doctorName: '', facilityId: '', facilityName: '',
    followUpRequired: false, followUpDate: '', followUpNotes: '',
    recordDate: new Date().toISOString().split('T')[0]
  });
  const [recordStats, setRecordStats] = useState({
    total: 0, prescriptions: 0, labReports: 0, followUps: 0
  });
  
  // Patient Transport states
  const [transports, setTransports] = useState<any[]>([]);
  const [showTransportDialog, setShowTransportDialog] = useState(false);
  const [showTransportDetail, setShowTransportDetail] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<any | null>(null);
  const [transportFilter, setTransportFilter] = useState<string>('all');
  const [transportForm, setTransportForm] = useState({
    pickupLocation: '',
    pickupLat: 0,
    pickupLng: 0,
    dropLocation: '',
    dropLat: 0,
    dropLng: 0,
    vehicleType: 'ambulance',
    patientName: '',
    patientPhone: '',
    emergencyType: 'medical',
    notes: ''
  });
  const [transportStats, setTransportStats] = useState({
    total: 0, requested: 0, inTransit: 0, completed: 0
  });
  
  // Government Schemes states
  const [schemeApplications, setSchemeApplications] = useState<any[]>([]);
  const [showEligibilityDialog, setShowEligibilityDialog] = useState(false);
  const [showSchemeApplyDialog, setShowSchemeApplyDialog] = useState(false);
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);
  const [selectedSchemeForApply, setSelectedSchemeForApply] = useState<any | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [eligibilityProfile, setEligibilityProfile] = useState({
    income: '',
    category: '',
    familySize: 4,
    age: 30,
    gender: 'male',
    rural: true,
    occupation: '',
    hasDisability: false,
    isPregnant: false,
    hasChildren: false,
    state: '',
    bplStatus: false
  });
  const [eligibilityResults, setEligibilityResults] = useState<any[]>([]);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [schemeStats, setSchemeStats] = useState({
    total: 0, applied: 0, approved: 0, pending: 0
  });
  
  // Earnings & Monetization states
  const [earningsStats, setEarningsStats] = useState({
    totalEarnings: 0,
    pendingBalance: 0,
    availableBalance: 0,
    totalLeads: 0,
    pendingLeads: 0,
    completedLeads: 0,
    opdLeads: 0,
    ipdLeads: 0,
    surgeryLeads: 0,
    diagnosticLeads: 0
  });
  const [userWallet, setUserWallet] = useState<any>(null);
  const [partnerHospitals, setPartnerHospitals] = useState<any[]>([]);
  const [homeVisitDoctors, setHomeVisitDoctors] = useState<any[]>([]);
  const [medicalHelpers, setMedicalHelpers] = useState<any[]>([]);
  const [diagnosticLabs, setDiagnosticLabs] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [showHomeVisitDialog, setShowHomeVisitDialog] = useState(false);
  const [showHelperBookingDialog, setShowHelperBookingDialog] = useState(false);
  const [showLabBookingDialog, setShowLabBookingDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(500);
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [selectedDoctorForHomeVisit, setSelectedDoctorForHomeVisit] = useState<any | null>(null);
  const [selectedHelper, setSelectedHelper] = useState<any | null>(null);
  const [selectedLab, setSelectedLab] = useState<any | null>(null);
  const [leadForm, setLeadForm] = useState({
    hospitalId: '',
    hospitalName: '',
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: 'male',
    leadType: 'opd_consultation',
    department: '',
    estimatedValue: 500
  });
  const [homeVisitForm, setHomeVisitForm] = useState({
    doctorId: '',
    patientName: '',
    patientPhone: '',
    patientAddress: '',
    visitType: 'general',
    scheduledDate: '',
    scheduledTime: '',
    symptoms: ''
  });
  const [helperBookingForm, setHelperBookingForm] = useState({
    helperId: '',
    patientName: '',
    patientPhone: '',
    patientAddress: '',
    serviceType: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 1,
    hourlyRate: 0
  });
  const [labBookingForm, setLabBookingForm] = useState({
    labId: '',
    patientName: '',
    patientPhone: '',
    patientAddress: '',
    tests: [] as string[],
    homeCollection: false,
    scheduledDate: ''
  });
  const [earningsTab, setEarningsTab] = useState('overview');
  
  // New earning method states
  const [healthCheckupPackages, setHealthCheckupPackages] = useState<any[]>([]);
  const [medicalEquipment, setMedicalEquipment] = useState<any[]>([]);
  const [hospitalDirectory, setHospitalDirectory] = useState<any[]>([]);
  const [hospitalSearchQuery, setHospitalSearchQuery] = useState('');
  const [hospitalTypeFilter, setHospitalTypeFilter] = useState('all');
  const [showCheckupBookingDialog, setShowCheckupBookingDialog] = useState(false);
  const [showEquipmentRentalDialog, setShowEquipmentRentalDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<any | null>(null);
  const [checkupBookingForm, setCheckupBookingForm] = useState({
    packageId: '',
    packageName: '',
    customerName: '',
    customerPhone: '',
    scheduledDate: '',
    homeCollection: false,
    address: ''
  });
  const [equipmentRentalForm, setEquipmentRentalForm] = useState({
    equipmentId: '',
    equipmentName: '',
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    startDate: '',
    endDate: '',
    rentalDays: 1
  });
  
  // Lab Test Requirements states
  const [labRequirements, setLabRequirements] = useState<any[]>([]);
  const [labTestCatalog, setLabTestCatalog] = useState<any[]>([]);
  const [labTestCategories, setLabTestCategories] = useState<any[]>([]);
  const [showLabRequirementDialog, setShowLabRequirementDialog] = useState(false);
  const [showLabResponsesDialog, setShowLabResponsesDialog] = useState(false);
  const [selectedLabRequirement, setSelectedLabRequirement] = useState<any | null>(null);
  const [labRequirementForm, setLabRequirementForm] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: '',
    patientAddress: '',
    district: '',
    testCategory: '',
    tests: [] as string[],
    urgency: 'normal',
    preferredDate: '',
    homeCollection: true,
    notes: ''
  });
  
  // AI Chatbot states
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [knowledgeBaseData, setKnowledgeBaseData] = useState<any>(null);
  
  // Loading states
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  // Intelligence levels
  const intelligenceLevels = [
    { level: 1, name: "Basic AI", description: "Direct question answering", icon: "💬" },
    { level: 2, name: "Context-Aware", description: "Remembers conversation", icon: "🧠" },
    { level: 3, name: "Tool-Using", description: "Access to databases & APIs", icon: "🔧" },
    { level: 4, name: "Reasoning", description: "Plans through problems", icon: "📊" },
    { level: 5, name: "Multi-Agent", description: "Specialized AI agents collaborate", icon: "🤖" },
    { level: 6, name: "Domain-Expert", description: "Medical knowledge base", icon: "📚" },
    { level: 7, name: "Self-Improving", description: "Learns from feedback", icon: "🎓" }
  ];

  // Fetch data on mount
  useEffect(() => {
    fetchFacilities();
    fetchDoctors();
    fetchMedicines();
    fetchSchemes();
    fetchForums();
    fetchChallenges();
    fetchHealthCamps();
    fetchVolunteers();
    fetchLeaderboard();
    
    if (isAuthenticated) {
      fetchHealthCard();
      fetchReminders();
      fetchVaccinations();
      fetchConsultations();
      fetchAppointments();
      fetchHealthRecords();
      fetchTransports();
      fetchEarningsData();
      
      if (['health_worker', 'doctor', 'admin'].includes(user?.role || '')) {
        fetchAlerts();
        fetchEnquiries();
      }
      if (['doctor', 'admin'].includes(user?.role || '')) {
        fetchAnalytics();
      }
    }
  }, [isAuthenticated, user?.role]);

  // Validate activeTab based on user role
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const navItems = getNavItems(user.role);
      const validTabs = navItems.map(item => item.id);
      if (!validTabs.includes(activeTab)) {
        setActiveTab('assistant'); // Reset to default tab if current tab is not accessible
      }
    }
  }, [isAuthenticated, user?.role, activeTab]);

  // API Functions
  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities');
      const data = await response.json();
      if (data.success) setFacilities(data.facilities);
    } catch (error) {
      console.error('Fetch facilities error:', error);
    }
  };

  const fetchDoctors = async (search?: string) => {
    try {
      let url = '/api/doctors';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (specializationFilter !== 'all') params.append('specialization', specializationFilter);
      if (doctorFilter === 'online') params.append('online', 'true');
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) setDoctors(data.doctors);
    } catch (error) {
      console.error('Fetch doctors error:', error);
    }
  };

  // Doctor CRUD operations
  const createDoctor = async () => {
    if (!doctorForm.name || !doctorForm.phone || !doctorForm.specialization) {
      toast.error(language === 'hi' ? 'कृपया आवश्यक फ़ील्ड भरें' : 'Please fill required fields');
      return;
    }
    
    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorForm)
      });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'डॉक्टर जोड़ा गया!' : 'Doctor added successfully!');
        fetchDoctors();
        setShowAddDoctorDialog(false);
        resetDoctorForm();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Create doctor error:', error);
      toast.error(language === 'hi' ? 'डॉक्टर जोड़ने में त्रुटि' : 'Failed to add doctor');
    }
  };

  const updateDoctor = async () => {
    if (!selectedDoctorForEdit) return;
    
    try {
      const response = await fetch('/api/doctors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedDoctorForEdit.id, ...doctorForm })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'डॉक्टर अपडेट हो गया!' : 'Doctor updated successfully!');
        fetchDoctors();
        setShowAddDoctorDialog(false);
        setSelectedDoctorForEdit(null);
        resetDoctorForm();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Update doctor error:', error);
      toast.error(language === 'hi' ? 'अपडेट में त्रुटि' : 'Failed to update doctor');
    }
  };

  const deleteDoctor = async (doctorId: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप वाकई इस डॉक्टर को निष्क्रिय करना चाहते हैं?' : 'Are you sure you want to deactivate this doctor?')) return;
    
    try {
      const response = await fetch(`/api/doctors?id=${doctorId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'डॉक्टर निष्क्रिय किया गया' : 'Doctor deactivated');
        fetchDoctors();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Delete doctor error:', error);
      toast.error(language === 'hi' ? 'त्रुटि हुई' : 'Failed to deactivate');
    }
  };

  const fetchDoctorSchedule = async (doctorId: string) => {
    setIsLoadingDoctorData(true);
    try {
      const response = await fetch(`/api/doctors/schedule?doctorId=${doctorId}`);
      const data = await response.json();
      if (data.success) {
        setDoctorSchedule(data.schedules || []);
      }
    } catch (error) {
      console.error('Fetch schedule error:', error);
    } finally {
      setIsLoadingDoctorData(false);
    }
  };

  const updateDoctorSchedule = async (doctorId: string, schedules: any[]) => {
    try {
      const response = await fetch('/api/doctors/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, schedules })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'शेड्यूल अपडेट हो गया!' : 'Schedule updated!');
        fetchDoctorSchedule(doctorId);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Update schedule error:', error);
      toast.error(language === 'hi' ? 'शेड्यूल अपडेट में त्रुटि' : 'Failed to update schedule');
    }
  };

  const fetchDoctorLeaves = async (doctorId: string) => {
    try {
      const response = await fetch(`/api/doctors/leaves?doctorId=${doctorId}`);
      const data = await response.json();
      if (data.success) {
        setDoctorLeaves(data.leaves || []);
      }
    } catch (error) {
      console.error('Fetch leaves error:', error);
    }
  };

  const createDoctorLeave = async (doctorId: string) => {
    if (!leaveForm.startDate || !leaveForm.endDate) {
      toast.error(language === 'hi' ? 'कृपया तारीख चुनें' : 'Please select dates');
      return;
    }
    
    try {
      const response = await fetch('/api/doctors/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, ...leaveForm })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'छुट्टी जोड़ी गई!' : 'Leave added!');
        fetchDoctorLeaves(doctorId);
        setShowLeaveDialog(false);
        setLeaveForm({ startDate: '', endDate: '', leaveType: 'full_day', reason: '' });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Create leave error:', error);
      toast.error(language === 'hi' ? 'छुट्टी जोड़ने में त्रुटि' : 'Failed to add leave');
    }
  };

  const resetDoctorForm = () => {
    setDoctorForm({
      name: '', phone: '', email: '', specialization: '', qualifications: [],
      consultationFee: 0, videoConsultFee: 0, followUpFee: 0, yearsOfExperience: 0,
      registrationNumber: '', registrationCouncil: '', facilityName: '', bio: '',
      isAvailableOnline: true, isAvailableInPerson: true, slotDuration: 15, bufferTime: 5,
      languages: [], gender: '', status: 'active'
    });
  };

  const openEditDoctorDialog = (doctor: Doctor) => {
    setSelectedDoctorForEdit(doctor);
    setDoctorForm({
      name: doctor.name || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
      specialization: doctor.specialization || '',
      qualifications: doctor.qualifications ? JSON.parse(doctor.qualifications as string || '[]') : [],
      consultationFee: doctor.consultationFee || 0,
      videoConsultFee: doctor.videoConsultFee || 0,
      followUpFee: doctor.followUpFee || 0,
      yearsOfExperience: doctor.yearsOfExperience || 0,
      registrationNumber: doctor.registrationNumber || '',
      registrationCouncil: doctor.registrationCouncil || '',
      facilityName: doctor.facilityName || '',
      bio: doctor.bio || '',
      isAvailableOnline: doctor.isAvailableOnline ?? true,
      isAvailableInPerson: doctor.isAvailableInPerson ?? true,
      slotDuration: doctor.slotDuration || 15,
      bufferTime: doctor.bufferTime || 5,
      languages: doctor.languages ? JSON.parse(doctor.languages as string || '[]') : [],
      gender: doctor.gender || '',
      status: doctor.status || 'active'
    });
    setShowAddDoctorDialog(true);
  };

  const openScheduleDialog = async (doctor: Doctor) => {
    setSelectedDoctorForEdit(doctor);
    await fetchDoctorSchedule(doctor.id);
    await fetchDoctorLeaves(doctor.id);
    setShowScheduleDialog(true);
  };

  // Appointment Booking functions
  const fetchAppointments = async (filter?: string) => {
    try {
      const params = new URLSearchParams();
      if (user?.role === 'citizen') params.append('userId', user.id);
      if (filter && filter !== 'all') params.append('status', filter);
      params.append('limit', '50');
      
      const response = await fetch(`/api/appointments?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments || []);
        // Calculate stats
        const today = new Date().toDateString();
        setAppointmentStats({
          today: (data.appointments || []).filter((a: any) => new Date(a.appointmentDate).toDateString() === today).length,
          upcoming: (data.appointments || []).filter((a: any) => ['scheduled', 'confirmed'].includes(a.status) && new Date(a.appointmentDate) >= new Date()).length,
          completed: (data.appointments || []).filter((a: any) => a.status === 'completed').length,
          cancelled: (data.appointments || []).filter((a: any) => a.status === 'cancelled').length
        });
      }
    } catch (error) {
      console.error('Fetch appointments error:', error);
    }
  };

  const fetchAvailableSlots = async (doctorId: string, date: string) => {
    setIsLoadingSlots(true);
    try {
      const response = await fetch(`/api/doctors/slots?doctorId=${doctorId}&date=${date}&status=available`);
      const data = await response.json();
      if (data.success) {
        setAvailableSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Fetch slots error:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const createAppointment = async () => {
    if (!appointmentForm.doctorId || !appointmentForm.appointmentDate || !appointmentForm.appointmentTime) {
      toast.error(language === 'hi' ? 'कृपया आवश्यक फ़ील्ड भरें' : 'Please fill required fields');
      return;
    }

    try {
      const selectedSlot = availableSlots.find(s => s.startTime === appointmentForm.appointmentTime);
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...appointmentForm,
          timeSlotId: selectedSlot?.id,
          userId: user?.id,
          fee: doctors.find(d => d.id === appointmentForm.doctorId)?.consultationFee || 0
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'अपॉइंटमेंट बुक हो गया!' : 'Appointment booked successfully!');
        toast.info(`Confirmation Code: ${data.confirmationCode}`);
        fetchAppointments();
        setShowAppointmentDialog(false);
        resetAppointmentForm();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Create appointment error:', error);
      toast.error(language === 'hi' ? 'अपॉइंटमेंट बुक करने में त्रुटि' : 'Failed to book appointment');
    }
  };

  const updateAppointmentStatus = async (id: string, action: string, extraData?: any) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, ...extraData })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'अपॉइंटमेंट अपडेट हो गया!' : 'Appointment updated!');
        fetchAppointments(appointmentFilter);
        if (selectedAppointment?.id === id) {
          setSelectedAppointment(data.appointment);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Update appointment error:', error);
      toast.error(language === 'hi' ? 'अपडेट में त्रुटि' : 'Failed to update');
    }
  };

  const resetAppointmentForm = () => {
    setAppointmentForm({
      doctorId: '', patientName: '', patientPhone: '', patientAge: '',
      patientGender: 'male', appointmentDate: '', appointmentTime: '',
      type: 'checkup', mode: 'in_person', reason: '', notes: '',
      symptoms: [], followUpRequired: false
    });
    setAvailableSlots([]);
    setSelectedDate('');
  };

  // EMR (Health Records) functions
  const fetchHealthRecords = async (type?: string) => {
    try {
      const params = new URLSearchParams();
      if (user?.role === 'citizen') params.append('userId', user.id);
      if (type && type !== 'all') params.append('type', type);
      params.append('limit', '50');
      
      const response = await fetch(`/api/health-records?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setHealthRecords(data.records || []);
        const records = data.records || [];
        setRecordStats({
          total: records.length,
          prescriptions: records.filter((r: any) => r.type === 'prescription').length,
          labReports: records.filter((r: any) => r.type === 'lab_report').length,
          followUps: records.filter((r: any) => r.followUpRequired).length
        });
      }
    } catch (error) {
      console.error('Fetch health records error:', error);
    }
  };

  const createHealthRecord = async () => {
    if (!recordForm.title || !recordForm.type) {
      toast.error(language === 'hi' ? 'कृपया शीर्षक और प्रकार भरें' : 'Please fill title and type');
      return;
    }

    try {
      const response = await fetch('/api/health-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recordForm,
          userId: user?.id,
          bloodPressureSystolic: recordForm.bloodPressureSystolic ? parseInt(recordForm.bloodPressureSystolic) : null,
          bloodPressureDiastolic: recordForm.bloodPressureDiastolic ? parseInt(recordForm.bloodPressureDiastolic) : null,
          heartRate: recordForm.heartRate ? parseInt(recordForm.heartRate) : null,
          weight: recordForm.weight ? parseFloat(recordForm.weight) : null,
          height: recordForm.height ? parseFloat(recordForm.height) : null,
          temperature: recordForm.temperature ? parseFloat(recordForm.temperature) : null,
          oxygenSaturation: recordForm.oxygenSaturation ? parseInt(recordForm.oxygenSaturation) : null
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'रिकॉर्ड जोड़ा गया!' : 'Record added successfully!');
        fetchHealthRecords(recordTypeFilter);
        setShowRecordDialog(false);
        resetRecordForm();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Create health record error:', error);
      toast.error(language === 'hi' ? 'रिकॉर्ड जोड़ने में त्रुटि' : 'Failed to add record');
    }
  };

  const deleteHealthRecord = async (id: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप इस रिकॉर्ड को हटाना चाहते हैं?' : 'Delete this record?')) return;
    
    try {
      const response = await fetch(`/api/health-records?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'रिकॉर्ड हटाया गया' : 'Record deleted');
        fetchHealthRecords(recordTypeFilter);
        setShowRecordDetail(false);
      }
    } catch (error) {
      console.error('Delete health record error:', error);
      toast.error(language === 'hi' ? 'त्रुटि हुई' : 'Error occurred');
    }
  };

  const resetRecordForm = () => {
    setRecordForm({
      type: 'prescription', category: '', title: '', description: '',
      diagnosis: '', symptoms: [], prescription: [],
      bloodPressureSystolic: '', bloodPressureDiastolic: '',
      heartRate: '', temperature: '', oxygenSaturation: '',
      weight: '', height: '', bloodGroup: '',
      doctorId: '', doctorName: '', facilityId: '', facilityName: '',
      followUpRequired: false, followUpDate: '', followUpNotes: '',
      recordDate: new Date().toISOString().split('T')[0]
    });
  };

  // Patient Transport functions
  const fetchTransports = async (filter?: string) => {
    try {
      const params = new URLSearchParams();
      if (filter && filter !== 'all') params.append('status', filter);
      params.append('limit', '50');
      
      const response = await fetch(`/api/transport?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setTransports(data.transports || []);
        const transportList = data.transports || [];
        setTransportStats({
          total: transportList.length,
          requested: transportList.filter((t: any) => t.status === 'requested' || t.status === 'assigned').length,
          inTransit: transportList.filter((t: any) => t.status === 'in_transit').length,
          completed: transportList.filter((t: any) => t.status === 'completed').length
        });
      }
    } catch (error) {
      console.error('Fetch transports error:', error);
    }
  };

  const createTransportRequest = async () => {
    if (!transportForm.pickupLocation || !transportForm.dropLocation) {
      toast.error(language === 'hi' ? 'कृपया पिकअप और ड्रॉप लोकेशन भरें' : 'Please fill pickup and drop locations');
      return;
    }

    try {
      const response = await fetch('/api/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transportForm,
          patientId: user?.id
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'परिवहन अनुरोध भेजा गया!' : 'Transport request sent!');
        toast.info(`${language === 'hi' ? 'ड्राइवर: ' : 'Driver: '}${data.driver?.name} (${data.driver?.phone})`);
        fetchTransports();
        setShowTransportDialog(false);
        resetTransportForm();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Create transport error:', error);
      toast.error(language === 'hi' ? 'परिवहन अनुरोध में त्रुटि' : 'Failed to request transport');
    }
  };

  const updateTransportStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/transport', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'स्थिति अपडेट हो गई!' : 'Status updated!');
        fetchTransports(transportFilter);
        if (selectedTransport?.id === id) {
          setSelectedTransport(data.transport);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Update transport error:', error);
      toast.error(language === 'hi' ? 'अपडेट में त्रुटि' : 'Failed to update');
    }
  };

  const cancelTransport = async (id: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप इस अनुरोध को रद्द करना चाहते हैं?' : 'Cancel this request?')) return;
    
    try {
      const response = await fetch(`/api/transport?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'अनुरोध रद्द किया गया' : 'Request cancelled');
        fetchTransports(transportFilter);
        setShowTransportDetail(false);
      }
    } catch (error) {
      console.error('Cancel transport error:', error);
      toast.error(language === 'hi' ? 'त्रुटि हुई' : 'Error occurred');
    }
  };

  const resetTransportForm = () => {
    setTransportForm({
      pickupLocation: '',
      pickupLat: 0,
      pickupLng: 0,
      dropLocation: '',
      dropLat: 0,
      dropLng: 0,
      vehicleType: 'ambulance',
      patientName: '',
      patientPhone: '',
      emergencyType: 'medical',
      notes: ''
    });
  };

  // Government Schemes functions
  const fetchSchemeApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.id) params.append('userId', user.id);
      params.append('type', 'applications');
      
      const response = await fetch(`/api/schemes?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setSchemeApplications(data.applications || []);
        const apps = data.applications || [];
        setSchemeStats({
          total: schemes.length,
          applied: apps.length,
          approved: apps.filter((a: any) => a.status === 'approved').length,
          pending: apps.filter((a: any) => a.status === 'submitted' || a.status === 'under_review').length
        });
      }
    } catch (error) {
      console.error('Fetch scheme applications error:', error);
    }
  };

  const checkEligibility = async () => {
    setIsCheckingEligibility(true);
    try {
      const response = await fetch('/api/schemes/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: eligibilityProfile,
          userId: user?.id
        })
      });

      const data = await response.json();
      if (data.success) {
        setEligibilityResults(data.recommendations || []);
        toast.success(language === 'hi' ? `${data.summary.eligibleCount} योजनाओं के लिए पात्र` : `Eligible for ${data.summary.eligibleCount} schemes`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Eligibility check error:', error);
      toast.error(language === 'hi' ? 'पात्रता जांच में त्रुटि' : 'Failed to check eligibility');
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const applyForScheme = async (schemeId: string, documents: string[] = []) => {
    try {
      const response = await fetch('/api/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          schemeId,
          documents
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'आवेदन शुरू किया गया!' : 'Application started!');
        fetchSchemeApplications();
        setShowSchemeApplyDialog(false);
      } else if (data.application) {
        toast.info(language === 'hi' ? 'आप पहले से आवेदन कर चुके हैं' : 'You have already applied');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Apply for scheme error:', error);
      toast.error(language === 'hi' ? 'आवेदन में त्रुटि' : 'Failed to apply');
    }
  };

  const submitApplication = async (applicationId: string) => {
    try {
      const response = await fetch('/api/schemes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          submitted: true
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'आवेदन जमा किया गया!' : 'Application submitted!');
        fetchSchemeApplications();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Submit application error:', error);
      toast.error(language === 'hi' ? 'जमा करने में त्रुटि' : 'Failed to submit');
    }
  };

  const deleteApplication = async (applicationId: string) => {
    if (!confirm(language === 'hi' ? 'क्या आप यह आवेदन हटाना चाहते हैं?' : 'Delete this application?')) return;
    
    try {
      const response = await fetch(`/api/schemes?applicationId=${applicationId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'आवेदन हटाया गया' : 'Application deleted');
        fetchSchemeApplications();
        setShowApplicationDetail(false);
      }
    } catch (error) {
      console.error('Delete application error:', error);
      toast.error(language === 'hi' ? 'त्रुटि हुई' : 'Error occurred');
    }
  };

  const fetchMedicines = async (search?: string) => {
    try {
      const url = search ? `/api/medicines?search=${search}` : '/api/medicines';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) setMedicines(data.medicines);
    } catch (error) {
      console.error('Fetch medicines error:', error);
    }
  };

  const fetchSchemes = async () => {
    try {
      const response = await fetch('/api/schemes');
      const data = await response.json();
      if (data.success) setSchemes(data.schemes);
    } catch (error) {
      console.error('Fetch schemes error:', error);
    }
  };

  const fetchHealthCard = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/health-card', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setHealthCard(data.healthCard);
    } catch (error) {
      console.error('Fetch health card error:', error);
    }
  };

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/medicine-reminders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setReminders(data.reminders);
    } catch (error) {
      console.error('Fetch reminders error:', error);
    }
  };

  const fetchVaccinations = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/vaccination', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setVaccinations(data.records);
    } catch (error) {
      console.error('Fetch vaccinations error:', error);
    }
  };

  const fetchConsultations = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch(`/api/consultations?userId=${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setConsultations(data.consultations);
    } catch (error) {
      console.error('Fetch consultations error:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAlerts(data.alerts);
    } catch (error) {
      console.error('Fetch alerts error:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAnalytics(data);
    } catch (error) {
      console.error('Fetch analytics error:', error);
    }
  };

  // Earnings & Monetization functions
  const fetchEarningsData = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch(`/api/monetization?type=earnings&userId=${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setEarningsStats(data.stats);
        setUserWallet(data.wallet);
        setRecentLeads(data.recentLeads || []);
      }
    } catch (error) {
      console.error('Fetch earnings error:', error);
    }
  };

  const fetchPartnerHospitals = async () => {
    try {
      const response = await fetch('/api/monetization?type=hospitals');
      const data = await response.json();
      if (data.success) setPartnerHospitals(data.hospitals);
    } catch (error) {
      console.error('Fetch partner hospitals error:', error);
    }
  };

  const fetchHomeVisitDoctors = async () => {
    try {
      const response = await fetch('/api/monetization?type=home-visit-doctors');
      const data = await response.json();
      if (data.success) setHomeVisitDoctors(data.doctors);
    } catch (error) {
      console.error('Fetch home visit doctors error:', error);
    }
  };

  const fetchMedicalHelpers = async () => {
    try {
      const response = await fetch('/api/monetization?type=medical-helpers');
      const data = await response.json();
      if (data.success) setMedicalHelpers(data.helpers);
    } catch (error) {
      console.error('Fetch medical helpers error:', error);
    }
  };

  const fetchDiagnosticLabs = async () => {
    try {
      const response = await fetch('/api/monetization?type=diagnostic-labs');
      const data = await response.json();
      if (data.success) setDiagnosticLabs(data.labs);
    } catch (error) {
      console.error('Fetch diagnostic labs error:', error);
    }
  };

  const createHospitalLead = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/monetization', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'hospital_lead',
          ...leadForm,
          referrerId: user?.id,
          referrerName: user?.name
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setShowLeadDialog(false);
        fetchEarningsData();
      } else {
        toast.error(data.error || 'Failed to create lead');
      }
    } catch (error) {
      console.error('Create lead error:', error);
      toast.error('Failed to create lead');
    }
  };

  const createHomeVisitBooking = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/monetization', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'home_visit_booking',
          ...homeVisitForm,
          userId: user?.id
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setShowHomeVisitDialog(false);
        fetchEarningsData();
      } else {
        toast.error(data.error || 'Failed to book home visit');
      }
    } catch (error) {
      console.error('Create home visit booking error:', error);
      toast.error('Failed to book home visit');
    }
  };

  const createHelperBooking = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/monetization', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'helper_booking',
          ...helperBookingForm,
          userId: user?.id
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setShowHelperBookingDialog(false);
        fetchEarningsData();
      } else {
        toast.error(data.error || 'Failed to book helper');
      }
    } catch (error) {
      console.error('Create helper booking error:', error);
      toast.error('Failed to book helper');
    }
  };

  const createDiagnosticBooking = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/monetization', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'diagnostic_booking',
          ...labBookingForm,
          userId: user?.id
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setShowLabBookingDialog(false);
        fetchEarningsData();
      } else {
        toast.error(data.error || 'Failed to book lab test');
      }
    } catch (error) {
      console.error('Create diagnostic booking error:', error);
      toast.error('Failed to book lab test');
    }
  };

  const requestWithdrawal = async (amount: number) => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          amount
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Withdrawal request submitted!');
        setShowWithdrawDialog(false);
        fetchEarningsData();
      } else {
        toast.error(data.error || 'Failed to request withdrawal');
      }
    } catch (error) {
      console.error('Withdrawal request error:', error);
      toast.error('Failed to request withdrawal');
    }
  };

  // New earning method functions
  const fetchHealthCheckupPackages = async () => {
    try {
      const response = await fetch('/api/monetization?type=health-checkups');
      const data = await response.json();
      if (data.success) setHealthCheckupPackages(data.packages);
    } catch (error) {
      console.error('Fetch health checkups error:', error);
    }
  };

  const fetchMedicalEquipment = async () => {
    try {
      const response = await fetch('/api/monetization?type=medical-equipment');
      const data = await response.json();
      if (data.success) setMedicalEquipment(data.equipment);
    } catch (error) {
      console.error('Fetch medical equipment error:', error);
    }
  };

  const fetchHospitalDirectory = async (search?: string, type?: string) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (type && type !== 'all') params.append('type', type);
      
      const response = await fetch(`/api/hospital-directory?${params.toString()}`);
      const data = await response.json();
      if (data.success) setHospitalDirectory(data.hospitals);
    } catch (error) {
      console.error('Fetch hospital directory error:', error);
    }
  };

  const createHealthCheckupBooking = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/monetization', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'health_checkup_booking',
          ...checkupBookingForm,
          referrerId: user?.id
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setShowCheckupBookingDialog(false);
        fetchEarningsData();
      } else {
        toast.error(data.error || 'Failed to book health checkup');
      }
    } catch (error) {
      console.error('Create checkup booking error:', error);
      toast.error('Failed to book health checkup');
    }
  };

  const createEquipmentRental = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const rentalDays = Math.ceil((new Date(equipmentRentalForm.endDate).getTime() - new Date(equipmentRentalForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const response = await fetch('/api/monetization', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'equipment_rental',
          ...equipmentRentalForm,
          rentalDays,
          referrerId: user?.id
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setShowEquipmentRentalDialog(false);
        fetchEarningsData();
      } else {
        toast.error(data.error || 'Failed to book equipment rental');
      }
    } catch (error) {
      console.error('Create equipment rental error:', error);
      toast.error('Failed to book equipment rental');
    }
  };

  // Lab Test Requirements functions
  const fetchLabRequirements = async (type: string = 'open') => {
    try {
      const response = await fetch(`/api/lab-requirements?type=${type}&userId=${user?.id}`);
      const data = await response.json();
      if (data.success) {
        setLabRequirements(data.requirements);
      }
    } catch (error) {
      console.error('Fetch lab requirements error:', error);
    }
  };

  const fetchLabTestCatalog = async () => {
    try {
      const response = await fetch('/api/lab-requirements?type=catalog');
      const data = await response.json();
      if (data.success) {
        setLabTestCatalog(data.catalog);
      }
    } catch (error) {
      console.error('Fetch lab catalog error:', error);
    }
  };

  const fetchLabTestCategories = async () => {
    try {
      const response = await fetch('/api/lab-requirements?type=categories');
      const data = await response.json();
      if (data.success) {
        setLabTestCategories(data.categories);
      }
    } catch (error) {
      console.error('Fetch lab categories error:', error);
    }
  };

  const createLabRequirement = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/lab-requirements', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'create_requirement',
          ...labRequirementForm,
          patientAge: labRequirementForm.patientAge ? parseInt(labRequirementForm.patientAge) : null,
          userId: user?.id,
          referrerId: user?.id,
          referrerName: user?.name,
          state: user?.state,
          district: user?.district || labRequirementForm.district
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setShowLabRequirementDialog(false);
        setLabRequirementForm({
          patientName: '',
          patientPhone: '',
          patientAge: '',
          patientGender: '',
          patientAddress: '',
          district: '',
          testCategory: '',
          tests: [],
          urgency: 'normal',
          preferredDate: '',
          homeCollection: true,
          notes: ''
        });
        fetchLabRequirements('my-requirements');
        fetchEarningsData();
      } else {
        toast.error(data.error || 'Failed to create requirement');
      }
    } catch (error) {
      console.error('Create lab requirement error:', error);
      toast.error('Failed to create requirement');
    }
  };

  const selectLabForRequirement = async (requirementId: string, labId: string, labName: string, quotedPrice: number) => {
    try {
      const response = await fetch('/api/lab-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'select_lab',
          requirementId,
          labId,
          labName,
          quotedPrice
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setShowLabResponsesDialog(false);
        fetchLabRequirements('my-requirements');
        fetchEarningsData();
      } else {
        toast.error(data.error || 'Failed to select lab');
      }
    } catch (error) {
      console.error('Select lab error:', error);
      toast.error('Failed to select lab');
    }
  };

  const fetchEnquiries = async (status?: string) => {
    try {
      const url = status && status !== 'all' ? `/api/enquiries?status=${status}` : '/api/enquiries';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) setEnquiries(data.enquiries || []);
    } catch (error) {
      console.error('Fetch enquiries error:', error);
    }
  };

  const updateEnquiry = async (id: string, updateData: any) => {
    try {
      const response = await fetch('/api/enquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updateData, staffId: user?.id, staffName: user?.name })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'अपडेट हो गया!' : 'Updated successfully!');
        fetchEnquiries(enquiryStatus);
        setShowEnquiryDialog(false);
      }
    } catch (error) {
      console.error('Update enquiry error:', error);
      toast.error(language === 'hi' ? 'त्रुटि हुई' : 'Error occurred');
    }
  };

  // Forum functions
  const fetchForums = async (category?: string) => {
    try {
      const url = category && category !== 'all' ? `/api/forums?category=${category}` : '/api/forums';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) setForums(data.posts || []);
    } catch (error) {
      console.error('Fetch forums error:', error);
    }
  };

  const createForumPost = async (title: string, content: string, category: string) => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/forums', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, category, userId: user?.id })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'पोस्ट बनाया गया!' : 'Post created!');
        fetchForums(forumCategory);
        setShowPostDialog(false);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Create post error:', error);
      toast.error(language === 'hi' ? 'पोस्ट बनाने में त्रुटि' : 'Failed to create post');
    }
  };

  const likeForumPost = async (postId: string) => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/forums', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId, action: 'like', userId: user?.id })
      });
      const data = await response.json();
      if (data.success) {
        fetchForums(forumCategory);
      }
    } catch (error) {
      console.error('Like post error:', error);
    }
  };

  const addReply = async (postId: string, content: string) => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/forums', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId, action: 'reply', content, userId: user?.id })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'जवाब जोड़ा गया!' : 'Reply added!');
        fetchForums(forumCategory);
        if (selectedPost?.id === postId) {
          setSelectedPost({ ...selectedPost, replies: data.replies });
        }
      }
    } catch (error) {
      console.error('Reply error:', error);
      toast.error(language === 'hi' ? 'जवाब जोड़ने में त्रुटि' : 'Failed to add reply');
    }
  };

  // Challenge functions
  const fetchChallenges = async (type?: string) => {
    try {
      const url = type && type !== 'all' ? `/api/challenges?type=${type}` : '/api/challenges';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Fetch challenges error:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ challengeId, userId: user?.id, action: 'join' })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'चुनौती में शामिल हो गए!' : 'Joined challenge!');
        fetchChallenges(challengeType);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Join challenge error:', error);
      toast.error(language === 'hi' ? 'शामिल होने में त्रुटि' : 'Failed to join');
    }
  };

  const updateChallengeProgress = async (challengeId: string, progress: number) => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ challengeId, userId: user?.id, action: 'progress', progress })
      });
      const data = await response.json();
      if (data.success) {
        fetchChallenges(challengeType);
      }
    } catch (error) {
      console.error('Update progress error:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/challenges?leaderboard=true');
      const data = await response.json();
      if (data.success) setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Fetch leaderboard error:', error);
    }
  };

  // Health Camp functions
  const fetchHealthCamps = async (district?: string) => {
    try {
      const url = district ? `/api/health-camps?district=${district}` : '/api/health-camps';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) setHealthCamps(data.camps || []);
    } catch (error) {
      console.error('Fetch health camps error:', error);
    }
  };

  const registerForCamp = async (campId: string) => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/health-camps', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ campId, userId: user?.id })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'पंजीकरण हो गया!' : 'Registered successfully!');
        fetchHealthCamps(campDistrict);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Camp registration error:', error);
      toast.error(language === 'hi' ? 'पंजीकरण में त्रुटि' : 'Registration failed');
    }
  };

  // Volunteer functions
  const fetchVolunteers = async (skill?: string) => {
    try {
      const url = skill && skill !== 'all' ? `/api/volunteers?skill=${skill}` : '/api/volunteers';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) setVolunteers(data.volunteers || []);
    } catch (error) {
      console.error('Fetch volunteers error:', error);
    }
  };

  const registerAsVolunteer = async (volunteerData: Partial<Volunteer>) => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...volunteerData, userId: user?.id })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hi' ? 'स्वयंसेवक के रूप में पंजीकृत!' : 'Registered as volunteer!');
        fetchVolunteers();
        setShowVolunteerDialog(false);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Volunteer registration error:', error);
      toast.error(language === 'hi' ? 'पंजीकरण में त्रुटि' : 'Registration failed');
    }
  };

  // Auth handlers
  const handleLogin = async () => {
    if (!loginPhone || !loginPassword) {
      toast.error("Please fill all fields");
      return;
    }
    
    const result = await login(loginPhone, loginPassword);
    if (result.success) {
      toast.success("Login successful!");
      setShowLoginDialog(false);
      setLoginPhone("");
      setLoginPassword("");
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  const handleRegister = async () => {
    if (!registerData.name || !registerData.phone || !registerData.password) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const result = await register({ ...registerData, language });
    if (result.success) {
      toast.success("Registration successful!");
      setShowLoginDialog(false);
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  // Chat functions
  const sendChatMessage = async () => {
    if ((!chatInput.trim() && !chatImage) || isLoadingChat) return;

    const userMessage = chatInput;
    const hasImage = !!chatImage;
    const messageId = `${Date.now()}`;
    
    setChatMessages(prev => [...prev, { 
      role: "user", 
      content: hasImage ? (userMessage || "📷 Image uploaded") : userMessage,
      hasImage,
      id: messageId
    }]);
    
    setChatInput("");
    setChatImage(null);
    setChatImagePreview(null);
    setIsLoadingChat(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          language,
          sessionId,
          imageBase64: chatImage,
          userId: user?.id,
          intelligenceLevel,
          structuredResponse: true
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const responseId = `resp-${Date.now()}`;
        
        // Check if we have structured medical response
        if (data.structuredResponse) {
          setChatMessages(prev => [...prev, { 
            role: "assistant", 
            content: data.response, 
            id: responseId,
            structured: data.structuredResponse
          }]);
        } else {
          setChatMessages(prev => [...prev, { 
            role: "assistant", 
            content: data.response, 
            id: responseId 
          }]);
        }
        
        setSessionId(data.sessionId);
        
        if (data.agentRole || data.toolsUsed) {
          setChatMetadata(prev => ({
            ...prev,
            [responseId]: {
              agentRole: data.agentRole,
              toolsUsed: data.toolsUsed,
              reasoning: data.reasoning
            }
          }));
        }
        
        if (data.isEmergency) {
          toast.error(language === 'hi' ? '🚨 आपातकालीन! 108 पर कॉल करें' : '🚨 Emergency! Call 108');
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const fallbackResponses: Record<string, string> = {
        hi: "मैं आपकी चिंता समझता हूं। कृपया अपने लक्षणों के आधार पर, उचित मूल्यांकन के लिए अपने नजदीकी स्वास्थ्य केंद्र जाएं।",
        mr: "मी तुमची काळजी समजतो. कृपया योग्य मूल्यांकनासाठी तुमच्या जवळच्या आरोग्य केंद्रात जा.",
        ta: "உங்கள் கவலையை நான் புரிந்துகொள்கிறேன். சரியான மதிப்பீட்டிற்கு உங்கள் அருகிலுள்ள சுகாதார மையத்திற்குச் செல்லவும்.",
        en: "I understand your concern. Based on your symptoms, I recommend visiting your nearest health facility for proper evaluation."
      };
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        content: fallbackResponses[language] || fallbackResponses.en,
        id: `resp-${Date.now()}`
      }]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleChatImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setChatImage(base64);
        setChatImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitFeedback = async (messageId: string, rating: number, wasHelpful: boolean) => {
    try {
      await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messageId,
          rating,
          wasHelpful,
          userId: user?.id,
          intelligenceLevel
        })
      });
      
      setFeedbackRatings(prev => ({ ...prev, [messageId]: { rating, wasHelpful } }));
      toast.success(language === 'hi' ? 'प्रतिक्रिया के लिए धन्यवाद!' : 'Thank you for your feedback!');
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  // Voice functions
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          
          try {
            const response = await fetch('/api/ai/voice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Data, language })
            });
            
            const data = await response.json();
            if (data.success && data.text) {
              setChatInput(data.text);
              toast.success(language === 'hi' ? 'आवाज़ पहचानी गई!' : 'Voice recognized!');
            }
          } catch (error) {
            console.error('ASR error:', error);
            toast.error(language === 'hi' ? 'आवाज़ पहचानने में त्रुटि' : 'Voice recognition failed');
          }
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.info(language === 'hi' ? 'रिकॉर्डिंग शुरू... बोलें' : 'Recording... Speak now');
    } catch (error) {
      console.error('Microphone access error:', error);
      toast.error(language === 'hi' ? 'माइक्रोफोन एक्सेस नहीं मिला' : 'Microphone access denied');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const playTTS = async (text: string, messageId: string) => {
    try {
      if (isPlayingTTS && audioElements[isPlayingTTS]) {
        audioElements[isPlayingTTS].pause();
        setIsPlayingTTS(null);
      }

      if (isPlayingTTS === messageId) return;

      setIsPlayingTTS(messageId);
      
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 500), speed: 1.0 })
      });

      if (!response.ok) throw new Error('TTS failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlayingTTS(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlayingTTS(null);
        toast.error('Could not play audio');
      };

      setAudioElements(prev => ({ ...prev, [messageId]: audio }));
      await audio.play();
      
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlayingTTS(null);
      toast.error('Speech failed');
    }
  };

  // Booking consultation
  const bookConsultation = async (doctorId: string, date: string, time: string, reason: string) => {
    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          userId: user?.id,
          scheduledDate: date,
          scheduledTime: time,
          type: 'video',
          reason
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Consultation booked successfully!');
        fetchConsultations();
        setShowBookingDialog(false);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book consultation');
    }
  };

  // Cart functions
  const addToCart = (medicine: Medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      if (existing) {
        return prev.map(item => 
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
    toast.success(`Added ${medicine.name} to cart`);
  };

  const removeFromCart = (medicineId: string) => {
    setCart(prev => prev.filter(item => item.id !== medicineId));
  };

  const updateCartQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
    } else {
      setCart(prev => prev.map(item => 
        item.id === medicineId ? { ...item, quantity } : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.mrp * (1 - (item.discountPercent || 0) / 100);
      return total + price * item.quantity;
    }, 0);
  };

  // Create medicine order
  const createMedicineOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place order');
      return;
    }
    
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/medicine-orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          items: JSON.stringify(cart.map(item => ({
            medicineId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.mrp * (1 - (item.discountPercent || 0) / 100)
          }))),
          subtotal: getCartTotal(),
          deliveryCharges: getCartTotal() > 500 ? 0 : 40,
          totalAmount: getCartTotal() + (getCartTotal() > 500 ? 0 : 40),
          deliveryAddress: 'Default Address',
          deliveryPincode: '000000',
          recipientName: user?.name || 'User',
          recipientPhone: user?.phone || ''
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Order placed successfully!');
        setCart([]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order');
    }
  };

  // Create reminder
  const createReminder = async (reminderData: Partial<Reminder>) => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/medicine-reminders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          ...reminderData
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Reminder created!');
        fetchReminders();
        setShowReminderDialog(false);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Reminder error:', error);
      toast.error('Failed to create reminder');
    }
  };

  // Mark dose taken
  const markDoseTaken = async (reminderId: string) => {
    try {
      const response = await fetch('/api/medicine-reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reminderId, action: 'taken' })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Dose marked as taken!');
        fetchReminders();
      }
    } catch (error) {
      console.error('Mark dose error:', error);
      toast.error('Failed to update');
    }
  };

  // Create vaccination record
  const createVaccination = async (vaccineData: Partial<Vaccination>) => {
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch('/api/vaccination', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          ...vaccineData
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Vaccination record added!');
        fetchVaccinations();
        setShowVaccinationDialog(false);
      }
    } catch (error) {
      console.error('Vaccination error:', error);
      toast.error('Failed to add record');
    }
  };

  // Emergency SOS
  const activateSOS = async () => {
    setSosActivated(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });

      await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'medical',
          description: 'SOS activated by user',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          userId: user?.id
        })
      });

      toast.success("Emergency alert sent with your location!");
    } catch {
      toast.success("Emergency alert sent!");
    }

    setTimeout(() => {
      window.open("tel:108", "_self");
    }, 2000);
  };

  // Utility functions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-indigo-500";
      case "moderate": return "bg-indigo-500";
      case "high": return "bg-indigo-500";
      case "critical": return "bg-rose-500";
      default: return "bg-gray-500";
    }
  };

  const getCrowdColor = (level: string) => {
    switch (level) {
      case "low": return "text-indigo-500";
      case "moderate": return "text-indigo-500";
      case "high": return "text-rose-500";
      default: return "text-gray-500";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "outbreak": return Bug;
      case "emergency": return AlertTriangle;
      case "vaccination": return Syringe;
      case "stock_alert": return Pill;
      default: return Bell;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-indigo-600 animate-pulse" />
          <p className="text-muted-foreground">Loading Swasthya Mitra...</p>
        </div>
      </div>
    );
  }

  // Only show assistant tab for non-logged-in users
  const navItems = isAuthenticated 
    ? getNavItems(user?.role || 'citizen')
    : [{ id: "assistant", label: "AI Assistant", icon: Stethoscope, roles: ['citizen'] }];

  // Show landing page for non-authenticated users
  if (!isAuthenticated && !authLoading) {
    return (
      <LandingPage 
        language={language}
        setLanguage={setLanguage}
        onLogin={login}
        onRegister={register}
      />
    );
  }

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading Swasthya Mitra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-indigo-700 bg-clip-text text-transparent">
                  Swasthya Mitras
                </h1>
                <p className="text-xs text-muted-foreground">AI Health Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[100px] hidden sm:flex">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Cart Badge - Only for logged in users */}
              {isAuthenticated && cart.length > 0 && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="relative"
                  onClick={() => setActiveTab('pharmacy')}
                >
                  <Package className="h-4 w-4" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {cart.length}
                  </Badge>
                </Button>
              )}

              {/* User Menu or Login */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="hidden sm:flex items-center gap-1">
                    {user?.role === 'admin' ? '👑' : user?.role === 'doctor' ? '👨‍⚕️' : user?.role === 'health_worker' ? '🏥' : '👤'} 
                    <span className="max-w-[80px] truncate">{user?.name}</span>
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={logout}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-indigo-600">
                      <LogIn className="h-4 w-4" />
                      <span className="hidden sm:inline">Login</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{loginMode === 'login' ? 'Login' : 'Register'}</DialogTitle>
                      <DialogDescription>
                        {loginMode === 'login' ? 'Login to access all features' : 'Create a new account'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {loginMode === 'login' ? (
                        <>
                          <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input 
                              placeholder="Enter 10-digit phone" 
                              value={loginPhone}
                              onChange={(e) => setLoginPhone(e.target.value)}
                              maxLength={10}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Password</Label>
                            <Input 
                              type="password" 
                              placeholder="Enter password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                            />
                          </div>
                          <Button className="w-full bg-indigo-600" onClick={handleLogin}>
                            Login
                          </Button>
                          
                          {/* Demo Credentials */}
                          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg border border-indigo-200">
                            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              Quick Login (Demo)
                            </p>
                            <div className="grid gap-2">
                              {[
                                { role: '👑 Admin', phone: '9999999999', color: 'bg-indigo-100 text-indigo-700' },
                                { role: '👨‍⚕️ Doctor', phone: '8888888888', color: 'bg-indigo-100 text-indigo-600' },
                                { role: '🏥 Health Worker', phone: '7777777777', color: 'bg-indigo-100 text-indigo-700' },
                                { role: '👤 Citizen', phone: '6666666666', color: 'bg-indigo-100 text-indigo-700' },
                              ].map((cred) => (
                                <button
                                  key={cred.phone}
                                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all hover:scale-[1.02] ${cred.color}`}
                                  onClick={() => {
                                    setLoginPhone(cred.phone);
                                    setLoginPassword('demo123');
                                  }}
                                >
                                  <span>{cred.role}</span>
                                  <span className="font-mono text-xs">{cred.phone}</span>
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                              Click to auto-fill • Any password works
                            </p>
                          </div>
                          
                          <p className="text-center text-sm text-muted-foreground">
                            Don&apos;t have an account?{' '}
                            <Button variant="link" className="p-0" onClick={() => setLoginMode('register')}>
                              Register
                            </Button>
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label>Full Name *</Label>
                            <Input 
                              placeholder="Enter your name"
                              value={registerData.name}
                              onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone Number *</Label>
                            <Input 
                              placeholder="10-digit phone number"
                              value={registerData.phone}
                              onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                              maxLength={10}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Password *</Label>
                            <Input 
                              type="password"
                              placeholder="Create password"
                              value={registerData.password}
                              onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Select 
                              value={registerData.role} 
                              onValueChange={(v) => setRegisterData({...registerData, role: v})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="citizen">Citizen</SelectItem>
                                <SelectItem value="health_worker">Health Worker</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button className="w-full bg-indigo-600" onClick={handleRegister}>
                            Register
                          </Button>
                          <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Button variant="link" className="p-0" onClick={() => setLoginMode('login')}>
                              Login
                            </Button>
                          </p>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-2 mt-4">
                    {navItems.map(item => (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? "default" : "ghost"}
                        className={`justify-start gap-2 ${activeTab === item.id ? "bg-indigo-600" : ""}`}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop - Only for logged in users */}
          {isAuthenticated && (
            <aside className="hidden md:flex flex-col w-56 shrink-0">
              <nav className="space-y-1 sticky top-24">
                {navItems.map(item => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start gap-2 ${activeTab === item.id ? "bg-indigo-600 text-white" : ""}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </aside>
          )}

          {/* Main Panel */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {/* AI Health Assistant */}
              {activeTab === "assistant" && (
                <motion.div
                  key="assistant"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Unified AI Header with Language */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Brain className="h-6 w-6 text-indigo-600" />
                        Swasthya AI
                        <Badge className="ml-2 bg-rose-500 text-white">Unified</Badge>
                      </h2>
                      <p className="text-muted-foreground">One AI with all 7 intelligence levels</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => setShowLanguageDialog(true)}
                      >
                        <Globe className="h-4 w-4" />
                        {languages.find(l => l.code === language)?.name || language}
                      </Button>
                      {isAuthenticated && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}
                        >
                          <BookOpen className="h-4 w-4" />
                          Knowledge Base
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Login Prompt for Guests */}
                  {!isAuthenticated && (
                    <Card className="border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-950 dark:to-indigo-950">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900">
                              <LogIn className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium">{language === 'hi' ? 'अधिक सुविधाओं के लिए लॉगिन करें' : 'Login for more features'}</p>
                              <p className="text-xs text-muted-foreground">
                                {language === 'hi' 
                                  ? 'टेलीमेडिसिन, फार्मेसी, हेल्थ कार्ड और बहुत कुछ'
                                  : 'Telemedicine, Pharmacy, Health Card and more'}
                              </p>
                            </div>
                          </div>
                          <Button 
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => setShowLoginDialog(true)}
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            {language === 'hi' ? 'लॉगिन करें' : 'Login / Sign Up'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Knowledge Base Panel - Only for logged in users */}
                  {isAuthenticated && showKnowledgeBase && (
                    <Card className="border-2 border-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-indigo-600" />
                          Medical Knowledge Base (RAG)
                        </CardTitle>
                        <CardDescription>
                          AI has access to this medical knowledge for accurate responses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="conditions">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="conditions">Conditions</TabsTrigger>
                            <TabsTrigger value="vaccines">Vaccines</TabsTrigger>
                            <TabsTrigger value="schemes">Schemes</TabsTrigger>
                            <TabsTrigger value="firstaid">First Aid</TabsTrigger>
                          </TabsList>
                          <TabsContent value="conditions" className="mt-2">
                            <ScrollArea className="h-48">
                              <div className="grid gap-2">
                                {[
                                  { name: 'Dengue', symptoms: 'High fever, severe headache, body pain, rash', severity: 'high' },
                                  { name: 'Malaria', symptoms: 'High fever, chills, sweating, headache', severity: 'high' },
                                  { name: 'Typhoid', symptoms: 'Prolonged fever, abdominal pain, weakness', severity: 'moderate' },
                                  { name: 'Common Cold', symptoms: 'Runny nose, sneezing, mild cough', severity: 'low' },
                                  { name: 'Diabetes', symptoms: 'Increased thirst, frequent urination, fatigue', severity: 'chronic' },
                                  { name: 'Hypertension', symptoms: 'Headache, dizziness, blurred vision', severity: 'chronic' },
                                ].map((condition, i) => (
                                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800 border">
                                    <div>
                                      <p className="font-medium text-sm">{condition.name}</p>
                                      <p className="text-xs text-muted-foreground">{condition.symptoms}</p>
                                    </div>
                                    <Badge variant={condition.severity === 'high' ? 'destructive' : condition.severity === 'moderate' ? 'default' : 'secondary'} className="text-xs">
                                      {condition.severity}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </TabsContent>
                          <TabsContent value="vaccines" className="mt-2">
                            <ScrollArea className="h-48">
                              <div className="space-y-2 text-sm">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border">
                                  <p className="font-medium">Birth</p>
                                  <p className="text-xs text-muted-foreground">BCG, Hepatitis B-1, OPV-0</p>
                                </div>
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border">
                                  <p className="font-medium">6 Weeks</p>
                                  <p className="text-xs text-muted-foreground">Pentavalent-1, OPV-1, Rotavirus-1, PCV-1</p>
                                </div>
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border">
                                  <p className="font-medium">9 Months</p>
                                  <p className="text-xs text-muted-foreground">MR-1, Vitamin A-2, PCV-3</p>
                                </div>
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border">
                                  <p className="font-medium">5 Years</p>
                                  <p className="text-xs text-muted-foreground">DPT Booster-2</p>
                                </div>
                              </div>
                            </ScrollArea>
                          </TabsContent>
                          <TabsContent value="schemes" className="mt-2">
                            <ScrollArea className="h-48">
                              <div className="space-y-2">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border">
                                  <p className="font-medium text-sm">PMJAY - Ayushman Bharat</p>
                                  <p className="text-xs text-muted-foreground">₹5 lakh coverage per family</p>
                                  <Badge variant="outline" className="mt-1 text-xs">Helpline: 14555</Badge>
                                </div>
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border">
                                  <p className="font-medium text-sm">Janani Suraksha Yojana</p>
                                  <p className="text-xs text-muted-foreground">Maternal benefits for institutional delivery</p>
                                </div>
                              </div>
                            </ScrollArea>
                          </TabsContent>
                          <TabsContent value="firstaid" className="mt-2">
                            <ScrollArea className="h-48">
                              <div className="space-y-2 text-sm">
                                <div className="p-2 bg-rose-50 dark:bg-rose-950 rounded-lg border border-rose-200">
                                  <p className="font-medium text-rose-700">🚨 Heart Attack</p>
                                  <p className="text-xs text-muted-foreground">Call 108, keep person calm, chew aspirin if available</p>
                                </div>
                                <div className="p-2 bg-rose-50 dark:bg-rose-950 rounded-lg border border-rose-200">
                                  <p className="font-medium text-rose-700">🚨 Stroke (FAST)</p>
                                  <p className="text-xs text-muted-foreground">Face drooping, Arm weakness, Speech difficulty, Time to call 108</p>
                                </div>
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg border border-indigo-200">
                                  <p className="font-medium text-indigo-700">🔥 Burns</p>
                                  <p className="text-xs text-muted-foreground">Cool running water 20 min, don't apply ice or toothpaste</p>
                                </div>
                              </div>
                            </ScrollArea>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  )}

                  {/* Unified AI Capabilities Card */}
                  <Card className="border-2 border-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="h-4 w-4 text-rose-500" />
                        {isAuthenticated ? 'Unified AI Brain - All Capabilities' : 'Swasthya AI - Health Assistant'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isAuthenticated ? (
                        <>
                          <div className="grid grid-cols-7 gap-1 mb-3">
                            {intelligenceLevels.map((il, idx) => (
                              <div 
                                key={il.level}
                                className={`text-center p-2 rounded-lg transition-all cursor-pointer ${
                                  idx < intelligenceLevel 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                }`}
                                title={il.description}
                                onClick={() => setIntelligenceLevel(il.level)}
                              >
                                <div className="text-lg">{il.icon}</div>
                                <div className="text-[10px] font-medium mt-1">L{il.level}</div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Current: <span className="font-semibold text-indigo-600">{intelligenceLevels[intelligenceLevel - 1]?.name}</span> - 
                            {intelligenceLevels[intelligenceLevel - 1]?.description}
                          </p>
                        </>
                      ) : (
                        <div className="text-center py-2">
                          <div className="flex justify-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-white dark:bg-gray-800">💬 LLM</Badge>
                            <Badge variant="outline" className="bg-white dark:bg-gray-800">🧠 Memory</Badge>
                            <Badge variant="outline" className="bg-white dark:bg-gray-800">🔧 Tools</Badge>
                            <Badge variant="outline" className="bg-white dark:bg-gray-800">📚 RAG</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {language === 'hi' 
                              ? 'AI आपके स्वास्थ्य सवालों का जवाब देने के लिए तैयार है'
                              : 'AI is ready to answer your health questions'}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Chat Interface */}
                  <Card className="border-2 border-indigo-200 dark:border-indigo-800">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <MessageCircle className="h-5 w-5 text-indigo-600" />
                          Chat with Unified AI
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => {
                              setChatMessages([]);
                              setSessionId('');
                              setFeedbackRatings({});
                              setChatMetadata({});
                            }}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Clear
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        ONE chatbot with ALL capabilities - just ask anything!
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[350px] pr-4 mb-4">
                        {chatMessages.length === 0 ? (
                          <div className="text-center text-muted-foreground py-6">
                            <div className="relative inline-block mb-4">
                              <Brain className="h-16 w-16 mx-auto text-indigo-600" />
                              <div className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs">
                                7
                              </div>
                            </div>
                            <p className="font-medium mb-1">Your Unified Health AI</p>
                            <p className="text-xs mb-4 text-muted-foreground">
                              All 7 intelligence levels in ONE chatbot
                            </p>
                            
                            {/* Quick Topic Buttons */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                              {[
                                { q: 'Fever & Symptoms', icon: '🤒', color: 'bg-rose-100 text-rose-700 hover:bg-red-200' },
                                { q: 'Find Hospital', icon: '🏥', color: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' },
                                { q: 'Govt Schemes', icon: '📋', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
                                { q: 'Vaccination', icon: '💉', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
                                { q: 'Medicines', icon: '💊', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
                                { q: 'Child Health', icon: '👶', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
                                { q: 'Women Health', icon: '🤰', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
                                { q: 'Mental Health', icon: '🧘', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
                              ].map((item, i) => (
                                <Button
                                  key={i}
                                  variant="outline"
                                  size="sm"
                                  className={`h-auto py-2 flex-col gap-1 ${item.color} border-none`}
                                  onClick={() => setChatInput(item.q)}
                                >
                                  <span className="text-lg">{item.icon}</span>
                                  <span className="text-xs">{item.q}</span>
                                </Button>
                              ))}
                            </div>
                            
                            {/* Sample Questions */}
                            <div className="text-left p-3 bg-white dark:bg-gray-800 rounded-lg border mb-3">
                              <p className="font-medium text-xs mb-2 text-muted-foreground">Try asking:</p>
                              <div className="flex flex-wrap gap-1">
                                {[
                                  'मुझे बुखार है और शरीर में दर्द है',
                                  'I have cold and cough',
                                  'नजदीकी अस्पताल बताओ',
                                  'PMJAY scheme eligibility',
                                ].map((q, i) => (
                                  <Button
                                    key={i}
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto py-1 px-2 text-xs"
                                    onClick={() => setChatInput(q)}
                                  >
                                    "{q}"
                                  </Button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="text-xs text-muted-foreground p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                              <p className="font-medium mb-1">💡 How it works:</p>
                              <p>The AI automatically uses the right combination of tools, agents, and knowledge based on your question. No need to select anything!</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {chatMessages.map((msg, i) => (
                              <div
                                key={msg.id || i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                              >
                                <div className={`max-w-[85%] ${msg.role === "assistant" ? "w-full" : ""}`}>
                                  <div
                                    className={`rounded-lg px-4 py-2 ${
                                      msg.role === "user"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-muted"
                                    }`}
                                  >
                                    {msg.hasImage && msg.role === "user" && (
                                      <div className="mb-2 text-xs opacity-70">📷 Photo uploaded</div>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                  </div>
                                  
                                  {/* Structured Medical Response Display */}
                                  {msg.role === "assistant" && msg.structured && (
                                    <StructuredResponseDisplay response={msg.structured} language={language} />
                                  )}
                                  
                                  {/* AI Processing Info - Shows what happened behind the scenes */}
                                  {msg.role === "assistant" && !msg.structured && chatMetadata[msg.id || ''] && (
                                    <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg text-xs">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {chatMetadata[msg.id || '']?.agentRole && (
                                          <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                                            🤖 {chatMetadata[msg.id || '']?.agentRole} agent
                                          </Badge>
                                        )}
                                        {(chatMetadata[msg.id || '']?.toolsUsed?.length ?? 0) > 0 && (
                                          <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                                            🤖 {chatMetadata[msg.id || '']?.toolsUsed?.length} tools used
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {msg.role === "assistant" && !msg.structured && (
                                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                                      {/* Feedback Stars */}
                                      {!feedbackRatings[msg.id || ''] && (
                                        <div className="flex items-center gap-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Button
                                              key={star}
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0"
                                              onClick={() => submitFeedback(msg.id || '', star, star >= 4)}
                                            >
                                              <Star className="h-4 w-4 text-indigo-400" />
                                            </Button>
                                          ))}
                                        </div>
                                      )}
                                      
                                      {/* TTS Button */}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => {
                                          if (isPlayingTTS === msg.id) {
                                            if (audioElements[msg.id || '']) {
                                              audioElements[msg.id || ''].pause();
                                            }
                                            setIsPlayingTTS(null);
                                          } else {
                                            playTTS(msg.content, msg.id || '');
                                          }
                                        }}
                                      >
                                        {isPlayingTTS === msg.id ? (
                                          <VolumeX className="h-3 w-3 mr-1" />
                                        ) : (
                                          <Volume2 className="h-3 w-3 mr-1" />
                                        )}
                                        {isPlayingTTS === msg.id ? 'Stop' : 'Listen'}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {isLoadingChat && (
                              <div className="flex justify-start">
                                <div className="bg-muted rounded-lg px-4 py-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm font-medium">AI Processing...</span>
                                  </div>
                                  <div className="flex gap-1 text-xs text-muted-foreground">
                                    <span className="animate-pulse">Analyzing</span>
                                    <span>→</span>
                                    <span className="animate-pulse delay-100">Planning</span>
                                    <span>→</span>
                                    <span className="animate-pulse delay-200">Responding</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </ScrollArea>
                      
                      {/* Image Preview */}
                      {chatImagePreview && (
                        <div className="mb-3 relative inline-block">
                          <img 
                            src={chatImagePreview} 
                            alt="Upload preview" 
                            className="h-20 w-20 object-cover rounded-lg border"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-5 w-5"
                            onClick={() => { setChatImage(null); setChatImagePreview(null); }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Chat Input */}
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleChatImageSelect}
                          className="hidden"
                          id="chat-image-input"
                        />
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => document.getElementById('chat-image-input')?.click()}
                          title="Upload photo (Vision AI)"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant={isRecording ? "destructive" : "outline"}
                          size="icon"
                          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                          title={isRecording ? 'Stop recording' : 'Voice input (Speech AI)'}
                          className={isRecording ? "animate-pulse" : ""}
                        >
                          {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        
                        <Input
                          placeholder={language === 'hi' ? 'कुछ भी पूछें...' : language === 'mr' ? 'काहीही विचारा...' : 'Ask anything...'}
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                          className="flex-1"
                        />
                        <Button 
                          onClick={sendChatMessage} 
                          disabled={isLoadingChat} 
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Language Selection Dialog */}
                  <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-indigo-600" />
                          Select Your Language
                        </DialogTitle>
                        <DialogDescription>
                          Choose your preferred language for AI responses
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-2 py-4">
                        {languages.map((lang) => (
                          <Button
                            key={lang.code}
                            variant={language === lang.code ? "default" : "outline"}
                            className={`h-auto py-3 ${language === lang.code ? "bg-indigo-600" : ""}`}
                            onClick={() => {
                              setLanguage(lang.code);
                              setShowLanguageDialog(false);
                            }}
                          >
                            <span className="text-lg font-medium">{lang.name}</span>
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        The AI will respond in your selected language
                      </p>
                    </DialogContent>
                  </Dialog>
                </motion.div>
              )}

              {/* Telemedicine */}
              {activeTab === "telemedicine" && (
                <motion.div
                  key="telemedicine"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Telemedicine</h2>
                      <p className="text-muted-foreground">Video consultations with certified doctors</p>
                    </div>
                  </div>

                  {/* Doctor Specialties */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['General Medicine', 'Pediatrics', 'Gynecology', 'Cardiology'].map((spec, i) => (
                      <Card key={i} className="cursor-pointer hover:border-indigo-500 transition-colors">
                        <CardContent className="pt-4 pb-4 text-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mx-auto mb-2">
                            <Stethoscope className="h-5 w-5 text-indigo-600" />
                          </div>
                          <p className="text-sm font-medium">{spec}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Available Doctors */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Doctors</CardTitle>
                      <CardDescription>Book video consultation with verified doctors</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="max-h-[400px]">
                        <div className="space-y-3">
                          {(doctors.length > 0 ? doctors : [
                            { id: '1', name: 'Dr. Rajesh Kumar', specialization: 'General Medicine', yearsOfExperience: 15, rating: 4.8, videoConsultFee: 500, isAvailableOnline: true, isVerified: true },
                            { id: '2', name: 'Dr. Priya Sharma', specialization: 'Pediatrics', yearsOfExperience: 10, rating: 4.9, videoConsultFee: 600, isAvailableOnline: true, isVerified: true },
                            { id: '3', name: 'Dr. Amit Verma', specialization: 'Cardiology', yearsOfExperience: 20, rating: 4.7, videoConsultFee: 1000, isAvailableOnline: true, isVerified: true },
                            { id: '4', name: 'Dr. Sunita Patel', specialization: 'Gynecology', yearsOfExperience: 12, rating: 4.9, videoConsultFee: 700, isAvailableOnline: true, isVerified: true }
                          ]).map((doctor) => (
                            <div key={doctor.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                  {(doctor.name || 'D').split(' ').map((n) => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{doctor.name}</p>
                                  <p className="text-xs text-muted-foreground">{doctor.specialization} • {doctor.yearsOfExperience} yrs</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">⭐ {doctor.rating}</Badge>
                                    {doctor.isVerified && (
                                      <Badge variant="outline" className="text-xs text-indigo-600">✓ Verified</Badge>
                                    )}
                                    <Badge variant={doctor.isAvailableOnline ? "default" : "secondary"} className="text-xs">
                                      {doctor.isAvailableOnline ? 'Available' : 'Offline'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-indigo-600">₹{doctor.videoConsultFee || doctor.consultationFee}</p>
                                <Button 
                                  size="sm" 
                                  className="mt-1"
                                  disabled={!doctor.isAvailableOnline}
                                  onClick={() => {
                                    setSelectedDoctor(doctor);
                                    setShowBookingDialog(true);
                                  }}
                                >
                                  Book
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* My Consultations */}
                  {isAuthenticated && consultations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>My Consultations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {consultations.slice(0, 3).map((cons) => (
                            <div key={cons.id} className="p-3 rounded-lg border">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{cons.doctor?.name || 'Doctor'}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(cons.scheduledDate)} at {cons.scheduledTime}
                                  </p>
                                </div>
                                <Badge variant={cons.status === 'completed' ? 'default' : 'secondary'}>
                                  {cons.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Appointments */}
              {activeTab === "appointments" && (
                <motion.div
                  key="appointments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-indigo-500" />
                        {language === 'hi' ? 'अपॉइंटमेंट बुकिंग' : 'Appointment Booking'}
                      </h2>
                      <p className="text-muted-foreground">
                        {language === 'hi' ? 'डॉक्टर के साथ अपॉइंटमेंट बुक करें और प्रबंधित करें' : 'Book and manage appointments with doctors'}
                      </p>
                    </div>
                    <Button 
                      className="bg-indigo-500 hover:bg-indigo-600"
                      onClick={() => { resetAppointmentForm(); setShowAppointmentDialog(true); }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {language === 'hi' ? 'नया अपॉइंटमेंट' : 'Book Appointment'}
                    </Button>
                  </div>

                  {/* Appointment Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{appointmentStats.today}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'आज के' : "Today's"}</p>
                          </div>
                          <Calendar className="h-8 w-8 text-indigo-400 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{appointmentStats.upcoming}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'आगामी' : 'Upcoming'}</p>
                          </div>
                          <Clock className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{appointmentStats.completed}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'पूर्ण' : 'Completed'}</p>
                          </div>
                          <CheckCircle2 className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-rose-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{appointmentStats.cancelled}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'रद्द' : 'Cancelled'}</p>
                          </div>
                          <XCircle className="h-8 w-8 text-rose-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Filters */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap gap-2">
                        <Select value={appointmentFilter} onValueChange={(v) => { setAppointmentFilter(v); fetchAppointments(v); }}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder={language === 'hi' ? 'स्थिति' : 'Status'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{language === 'hi' ? 'सभी' : 'All'}</SelectItem>
                            <SelectItem value="scheduled">{language === 'hi' ? 'निर्धारित' : 'Scheduled'}</SelectItem>
                            <SelectItem value="confirmed">{language === 'hi' ? 'पुष्टि' : 'Confirmed'}</SelectItem>
                            <SelectItem value="completed">{language === 'hi' ? 'पूर्ण' : 'Completed'}</SelectItem>
                            <SelectItem value="cancelled">{language === 'hi' ? 'रद्द' : 'Cancelled'}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => fetchAppointments(appointmentFilter)}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          {language === 'hi' ? 'रिफ्रेश' : 'Refresh'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Calendar View */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        {language === 'hi' ? 'इस सप्ताह का कैलेंडर' : 'This Week\'s Calendar'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
                          const date = new Date();
                          date.setDate(date.getDate() + (i - date.getDay()));
                          const isToday = i === new Date().getDay();
                          const dayAppointments = appointments.filter((a: any) => 
                            new Date(a.appointmentDate).toDateString() === date.toDateString()
                          );
                          
                          return (
                            <div 
                              key={i}
                              className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${
                                isToday ? 'bg-indigo-500 text-white' : 
                                dayAppointments.length > 0 ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-300' : 
                                'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100'
                              }`}
                            >
                              <p className="text-xs font-medium">{day}</p>
                              <p className="text-lg font-bold">{date.getDate()}</p>
                              {dayAppointments.length > 0 && (
                                <Badge variant="secondary" className="text-xs mt-1">{dayAppointments.length}</Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Book - Available Doctors */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{language === 'hi' ? 'जल्दी बुक करें - उपलब्ध डॉक्टर' : 'Quick Book - Available Doctors'}</CardTitle>
                      <CardDescription>
                        {language === 'hi' ? 'ऑनलाइन परामर्श के लिए उपलब्ध डॉक्टर' : 'Doctors available for online consultation'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="max-h-[200px]">
                        <div className="flex gap-3 pb-2">
                          {doctors.filter(d => d.isAvailableOnline).slice(0, 6).map((doctor) => (
                            <div key={doctor.id} className="flex-shrink-0 w-56 p-3 border rounded-lg hover:border-indigo-400 transition-colors cursor-pointer"
                              onClick={() => {
                                setAppointmentForm({...appointmentForm, doctorId: doctor.id});
                                setShowAppointmentDialog(true);
                              }}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                  {(doctor.name || 'D').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{doctor.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{doctor.specialization}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-indigo-500 fill-yellow-500" />
                                  <span className="text-xs">{doctor.rating}</span>
                                </div>
                                <p className="font-bold text-indigo-500 text-sm">₹{doctor.videoConsultFee || doctor.consultationFee}</p>
                              </div>
                              <Button size="sm" className="w-full mt-2">
                                {language === 'hi' ? 'बुक करें' : 'Book Now'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* My Appointments */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{language === 'hi' ? 'मेरे अपॉइंटमेंट' : 'My Appointments'}</CardTitle>
                        <Badge variant="outline">{appointments.length} {language === 'hi' ? 'कुल' : 'total'}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {appointments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>{language === 'hi' ? 'कोई अपॉइंटमेंट नहीं' : 'No appointments found'}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => { resetAppointmentForm(); setShowAppointmentDialog(true); }}
                          >
                            {language === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book an Appointment'}
                          </Button>
                        </div>
                      ) : (
                        <ScrollArea className="max-h-[400px]">
                          <div className="space-y-3">
                            {appointments.map((apt: any) => (
                              <div 
                                key={apt.id} 
                                className={`p-4 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${
                                  apt.status === 'completed' ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200' :
                                  apt.status === 'cancelled' ? 'bg-rose-50 dark:bg-rose-950 border-rose-200 opacity-60' :
                                  apt.status === 'confirmed' ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200' :
                                  'bg-card'
                                }`}
                                onClick={() => { setSelectedAppointment(apt); setShowAppointmentDetail(true); }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                      {apt.doctorId ? 'D' : 'H'}
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">
                                        {apt.facility?.name || apt.doctorId || 'Appointment'}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {apt.reason || apt.type}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(apt.appointmentDate)}
                                        <Clock className="h-3 w-3 ml-2" />
                                        {apt.appointmentTime}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <Badge variant={
                                      apt.status === 'confirmed' ? 'default' :
                                      apt.status === 'completed' ? 'secondary' :
                                      apt.status === 'cancelled' ? 'destructive' : 'outline'
                                    } className={apt.status === 'confirmed' ? 'bg-indigo-500' : ''}>
                                      {apt.status}
                                    </Badge>
                                    {apt.confirmationCode && (
                                      <p className="text-xs text-muted-foreground font-mono">
                                        #{apt.confirmationCode}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {apt.patient && (
                                  <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                                    <User className="h-3 w-3 inline mr-1" />
                                    {apt.patient.name} • {apt.patient.phone}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>

                  {/* Appointment Types Info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{language === 'hi' ? 'अपॉइंटमेंट के प्रकार' : 'Appointment Types'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { type: 'checkup', icon: Stethoscope, label: language === 'hi' ? 'जांच' : 'Checkup', color: 'bg-indigo-100 text-indigo-600' },
                          { type: 'followup', icon: FileText, label: language === 'hi' ? 'फॉलो-अप' : 'Follow-up', color: 'bg-indigo-100 text-indigo-700' },
                          { type: 'vaccination', icon: Syringe, label: language === 'hi' ? 'टीकाकरण' : 'Vaccination', color: 'bg-indigo-100 text-indigo-700' },
                          { type: 'consultation', icon: Activity, label: language === 'hi' ? 'परामर्श' : 'Consultation', color: 'bg-indigo-100 text-indigo-700' }
                        ].map((item) => (
                          <div key={item.type} className={`p-3 rounded-lg text-center ${item.color}`}>
                            <item.icon className="h-5 w-5 mx-auto mb-1" />
                            <p className="text-sm font-medium">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* E-Pharmacy */}
              {activeTab === "pharmacy" && (
                <motion.div
                  key="pharmacy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">E-Pharmacy</h2>
                      <p className="text-muted-foreground">Order medicines with home delivery</p>
                    </div>
                    {cart.length > 0 && (
                      <Badge className="bg-indigo-600">
                        {cart.length} items in cart • ₹{getCartTotal().toFixed(0)}
                      </Badge>
                    )}
                  </div>

                  {/* Search */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Search medicines..." 
                          className="flex-1"
                          onChange={(e) => fetchMedicines(e.target.value)}
                        />
                        <Button className="bg-indigo-600">
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cart */}
                  {cart.length > 0 && (
                    <Card className="border-indigo-200 dark:border-indigo-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="h-5 w-5 text-indigo-600" />
                          Your Cart ({cart.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="max-h-[200px]">
                          <div className="space-y-2">
                            {cart.map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-2 rounded border">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    ₹{(item.mrp * (1 - (item.discountPercent || 0) / 100)).toFixed(0)} x {item.quantity}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                  >
                                    -
                                  </Button>
                                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                  >
                                    +
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-rose-500"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        <Separator className="my-3" />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">Total: ₹{getCartTotal().toFixed(0)}</p>
                            <p className="text-xs text-muted-foreground">
                              {getCartTotal() > 500 ? 'Free delivery' : '+₹40 delivery'}
                            </p>
                          </div>
                          <Button 
                            className="bg-indigo-600"
                            onClick={createMedicineOrder}
                          >
                            Place Order
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Medicine List */}
                  <div className="grid gap-3">
                    {(medicines.length > 0 ? medicines : [
                      { id: '1', name: 'Paracetamol', genericName: 'Acetaminophen', category: 'tablet', strength: '500mg', mrp: 25, discountPercent: 10, inStock: true, requiresPrescription: false },
                      { id: '2', name: 'Cetirizine', genericName: 'Cetirizine HCl', category: 'tablet', strength: '10mg', mrp: 35, discountPercent: 5, inStock: true, requiresPrescription: false },
                      { id: '3', name: 'Amoxicillin', genericName: 'Amoxicillin', category: 'capsule', strength: '500mg', mrp: 85, discountPercent: 0, inStock: true, requiresPrescription: true },
                      { id: '4', name: 'Omeprazole', genericName: 'Omeprazole', category: 'capsule', strength: '20mg', mrp: 65, discountPercent: 15, inStock: true, requiresPrescription: false },
                      { id: '5', name: 'Metformin', genericName: 'Metformin HCl', category: 'tablet', strength: '500mg', mrp: 45, discountPercent: 0, inStock: true, requiresPrescription: true }
                    ]).map((medicine) => (
                      <Card key={medicine.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{medicine.name}</p>
                                {medicine.requiresPrescription && (
                                  <Badge variant="outline" className="text-xs text-indigo-600">Rx</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {medicine.genericName} • {medicine.strength}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <p className="font-bold text-indigo-600">
                                  ₹{(medicine.mrp * (1 - (medicine.discountPercent || 0) / 100)).toFixed(0)}
                                </p>
                                {medicine.discountPercent && medicine.discountPercent > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {medicine.discountPercent}% off
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground line-through">
                                  ₹{medicine.mrp}
                                </span>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => addToCart(medicine)}
                              disabled={!medicine.inStock}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* EMR / Health Records */}
              {activeTab === "emr" && (
                <motion.div
                  key="emr"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6 text-indigo-500" />
                        {language === 'hi' ? 'इलेक्ट्रॉनिक मेडिकल रिकॉर्ड्स' : 'Electronic Medical Records'}
                      </h2>
                      <p className="text-muted-foreground">
                        {language === 'hi' ? 'अपने सभी चिकित्सा रिकॉर्ड एक जगह प्रबंधित करें' : 'Manage all your medical records in one place'}
                      </p>
                    </div>
                    {isAuthenticated && (
                      <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => { resetRecordForm(); setShowRecordDialog(true); }}>
                        <Plus className="h-4 w-4 mr-1" />
                        {language === 'hi' ? 'रिकॉर्ड जोड़ें' : 'Add Record'}
                      </Button>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{recordStats.total}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'कुल रिकॉर्ड' : 'Total Records'}</p>
                          </div>
                          <FileText className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{recordStats.prescriptions}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'प्रिस्क्रिप्शन' : 'Prescriptions'}</p>
                          </div>
                          <ClipboardList className="h-8 w-8 text-indigo-400 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{recordStats.labReports}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'लैब रिपोर्ट' : 'Lab Reports'}</p>
                          </div>
                          <Activity className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{recordStats.followUps}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'फॉलो-अप' : 'Follow-ups'}</p>
                          </div>
                          <Calendar className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Record Types */}
                  <Tabs defaultValue="all" value={recordTypeFilter} onValueChange={(v) => { setRecordTypeFilter(v); fetchHealthRecords(v); }}>
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="all">{language === 'hi' ? 'सभी' : 'All'}</TabsTrigger>
                      <TabsTrigger value="prescription">{language === 'hi' ? 'प्रिस्क्रिप्शन' : 'Prescriptions'}</TabsTrigger>
                      <TabsTrigger value="lab_report">{language === 'hi' ? 'लैब' : 'Lab'}</TabsTrigger>
                      <TabsTrigger value="vitals">{language === 'hi' ? 'वाइटल्स' : 'Vitals'}</TabsTrigger>
                      <TabsTrigger value="imaging">{language === 'hi' ? 'इमेजिंग' : 'Imaging'}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-4 space-y-4">
                      {/* Recent Records from API */}
                      <Card>
                        <CardHeader>
                          <CardTitle>{language === 'hi' ? 'हाल के रिकॉर्ड' : 'Recent Records'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {healthRecords.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                              <p>{language === 'hi' ? 'कोई रिकॉर्ड नहीं' : 'No records found'}</p>
                              <Button variant="outline" size="sm" className="mt-2" onClick={() => { resetRecordForm(); setShowRecordDialog(true); }}>
                                {language === 'hi' ? 'रिकॉर्ड जोड़ें' : 'Add Record'}
                              </Button>
                            </div>
                          ) : (
                            <ScrollArea className="max-h-[400px]">
                              <div className="space-y-3">
                                {healthRecords.map((record: any) => (
                                  <div 
                                    key={record.id} 
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                                    onClick={() => { setSelectedRecord(record); setShowRecordDetail(true); }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                        record.type === 'prescription' ? 'bg-indigo-100 text-indigo-500' :
                                        record.type === 'lab_report' ? 'bg-indigo-100 text-indigo-600' :
                                        record.type === 'vitals' ? 'bg-indigo-100 text-indigo-600' :
                                        'bg-indigo-100 text-indigo-600'
                                      }`}>
                                        {record.type === 'prescription' ? <ClipboardList className="h-5 w-5" /> :
                                         record.type === 'lab_report' ? <Activity className="h-5 w-5" /> :
                                         record.type === 'vitals' ? <Heart className="h-5 w-5" /> :
                                         <FileText className="h-5 w-5" />}
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">{record.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {record.doctorName || record.facilityName || 'Self'} • {formatDate(record.recordDate)}
                                        </p>
                                        {record.diagnosis && (
                                          <Badge variant="outline" className="mt-1 text-xs">{record.diagnosis}</Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className={
                                        record.type === 'prescription' ? 'border-indigo-300 text-indigo-500' :
                                        record.type === 'lab_report' ? 'border-indigo-300 text-indigo-600' :
                                        record.type === 'vitals' ? 'border-indigo-300 text-indigo-600' :
                                        'border-indigo-300 text-indigo-600'
                                      }>
                                        {record.type}
                                      </Badge>
                                      <Eye className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="prescription" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>{language === 'hi' ? 'प्रिस्क्रिप्शन' : 'Prescriptions'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {healthRecords.filter((r: any) => r.type === 'prescription').map((record: any) => (
                              <div key={record.id} className="p-3 rounded-lg border cursor-pointer hover:bg-accent/50" onClick={() => { setSelectedRecord(record); setShowRecordDetail(true); }}>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-medium">{record.title}</p>
                                  <Badge variant="outline">{formatDate(record.recordDate)}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{record.doctorName || 'Doctor'}</p>
                                {record.diagnosis && <Badge variant="secondary" className="text-xs">{record.diagnosis}</Badge>}
                              </div>
                            ))}
                            {healthRecords.filter((r: any) => r.type === 'prescription').length === 0 && (
                              <p className="text-center text-muted-foreground py-4">{language === 'hi' ? 'कोई प्रिस्क्रिप्शन नहीं' : 'No prescriptions'}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="lab_report" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>{language === 'hi' ? 'लैब रिपोर्ट' : 'Lab Reports'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {healthRecords.filter((r: any) => r.type === 'lab_report').map((record: any) => (
                              <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent/50" onClick={() => { setSelectedRecord(record); setShowRecordDetail(true); }}>
                                <div>
                                  <p className="font-medium">{record.title}</p>
                                  <p className="text-xs text-muted-foreground">{record.facilityName || 'Lab'} • {formatDate(record.recordDate)}</p>
                                </div>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </div>
                            ))}
                            {healthRecords.filter((r: any) => r.type === 'lab_report').length === 0 && (
                              <p className="text-center text-muted-foreground py-4">{language === 'hi' ? 'कोई लैब रिपोर्ट नहीं' : 'No lab reports'}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="vitals" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>{language === 'hi' ? 'वाइटल साइन्स इतिहास' : 'Vital Signs History'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {healthRecords.filter((r: any) => r.type === 'vitals' || r.heartRate).map((record: any) => (
                              <div key={record.id} className="p-3 rounded-lg border cursor-pointer hover:bg-accent/50" onClick={() => { setSelectedRecord(record); setShowRecordDetail(true); }}>
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline">{formatDate(record.recordDate)}</Badge>
                                </div>
                                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                                  <div>
                                    <p className="text-muted-foreground">BP</p>
                                    <p className="font-bold">{record.bloodPressureSystolic}/{record.bloodPressureDiastolic}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">HR</p>
                                    <p className="font-bold">{record.heartRate || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Temp</p>
                                    <p className="font-bold">{record.temperature || '-'}°F</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">SpO2</p>
                                    <p className="font-bold">{record.oxygenSaturation || '-'}%</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Weight</p>
                                    <p className="font-bold">{record.weight || '-'} kg</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {healthRecords.filter((r: any) => r.type === 'vitals' || r.heartRate).length === 0 && (
                              <p className="text-center text-muted-foreground py-4">{language === 'hi' ? 'कोई वाइटल्स नहीं' : 'No vitals'}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="imaging" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>{language === 'hi' ? 'इमेजिंग रिपोर्ट' : 'Imaging Reports'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                            <p>{language === 'hi' ? 'कोई इमेजिंग रिपोर्ट नहीं' : 'No imaging reports'}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {/* Upload Section */}
                  {isAuthenticated && (
                    <Card className="border-dashed border-2">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                          <p className="font-medium">{language === 'hi' ? 'रिकॉर्ड अपलोड करें' : 'Upload Medical Records'}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {language === 'hi' ? 'PDF, छवियाँ, या दस्तावेज़ खींचें और छोड़ें' : 'Drag and drop PDF, images, or documents'}
                          </p>
                          <Button variant="outline" className="mt-4">
                            {language === 'hi' ? 'फ़ाइल चुनें' : 'Select Files'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Health Facilities */}
              {activeTab === "facilities" && (
                <motion.div
                  key="facilities"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Health Facilities</h2>
                      <p className="text-muted-foreground">Find nearby hospitals, PHCs, and CHCs</p>
                    </div>
                  </div>

                  {/* Search */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex gap-2">
                        <Input placeholder="Search facilities..." className="flex-1" />
                        <Select defaultValue="all">
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="PHC">PHC</SelectItem>
                            <SelectItem value="CHC">CHC</SelectItem>
                            <SelectItem value="hospital">Hospital</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Facility List */}
                  <div className="grid gap-3">
                    {(facilities.length > 0 ? facilities : [
                      { id: '1', name: 'Sadar Hospital', type: 'District Hospital', address: 'Civil Lines', district: 'Main', phone: '+91-1234567890', crowdLevel: 'moderate', isOpen: true },
                      { id: '2', name: 'Community Health Center', type: 'CHC', address: 'Block Road', district: 'Block A', phone: '+91-1234567891', crowdLevel: 'low', isOpen: true },
                      { id: '3', name: 'Primary Health Center', type: 'PHC', address: 'Village Center', district: 'Village B', phone: '+91-1234567892', crowdLevel: 'low', isOpen: true }
                    ]).map((facility) => (
                      <Card key={facility.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">{facility.name}</h3>
                              <p className="text-sm text-muted-foreground">{facility.type}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={facility.isOpen ? "bg-indigo-500" : "bg-rose-500"}>
                                {facility.isOpen ? "Open" : "Closed"}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {facility.address}, {facility.district}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {facility.phone}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs">Crowd:</span>
                            <Badge variant="outline" className={getCrowdColor(facility.crowdLevel || 'low')}>
                              {facility.crowdLevel || 'low'}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => window.open(`tel:${facility.phone}`)}>
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                            <Button size="sm" variant="outline">
                              <MapPin className="h-3 w-3 mr-1" />
                              Directions
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Health Card */}
              {activeTab === "healthcard" && (
                <motion.div
                  key="healthcard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Digital Health Card</h2>
                      <p className="text-muted-foreground">Your health ID and medical summary</p>
                    </div>
                  </div>

                  {isAuthenticated ? (
                    <Card className="border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden">
                      <div className="bg-indigo-700 p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs opacity-80">Swasthya Mitra Health Card</p>
                            <p className="text-lg font-bold mt-1">{user?.name}</p>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                            <QrCode className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-xs opacity-80">Card Number</p>
                          <p className="font-mono font-bold">
                            {healthCard?.cardNumber || 'IN-' + Date.now().toString(36).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Blood Group</p>
                            <p className="font-semibold">{healthCard?.bloodGroup || 'Not set'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Valid Until</p>
                            <p className="font-semibold">
                              {healthCard?.validUntil ? formatDate(healthCard.validUntil) : '5 years'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Allergies</p>
                            <p className="font-semibold text-sm">
                              {healthCard?.allergies ? JSON.parse(healthCard.allergies).join(', ') : 'None'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <Badge className="bg-indigo-500">Active</Badge>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-indigo-600">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground mb-4">Login to view your health card</p>
                        <Button onClick={() => setShowLoginDialog(true)} className="bg-indigo-600">
                          Login Now
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Government Schemes */}
              {activeTab === "schemes" && (
                <motion.div
                  key="schemes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6 text-indigo-600" />
                        {language === 'hi' ? 'सरकारी स्वास्थ्य योजनाएं' : 'Government Health Schemes'}
                      </h2>
                      <p className="text-muted-foreground">
                        {language === 'hi' ? 'पात्रता जांचें और योजनाओं के लिए आवेदन करें' : 'Check eligibility and apply for schemes'}
                      </p>
                    </div>
                    <Button 
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => setShowEligibilityDialog(true)}
                    >
                      <Award className="h-4 w-4 mr-1" />
                      {language === 'hi' ? 'पात्रता जांचें' : 'Check Eligibility'}
                    </Button>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-violet-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{schemes.length}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'उपलब्ध योजनाएं' : 'Available Schemes'}</p>
                          </div>
                          <FileText className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{schemeApplications.length}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'मेरे आवेदन' : 'My Applications'}</p>
                          </div>
                          <FileCheck className="h-8 w-8 text-indigo-400 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{schemeApplications.filter((a: any) => a.status === 'submitted' || a.status === 'under_review').length}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'लंबित' : 'Pending'}</p>
                          </div>
                          <Clock className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{schemeApplications.filter((a: any) => a.status === 'approved').length}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'स्वीकृत' : 'Approved'}</p>
                          </div>
                          <CheckCircle2 className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Eligibility Results Banner */}
                  {eligibilityResults.length > 0 && (
                    <Card className="border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Award className="h-4 w-4 text-indigo-600" />
                          {language === 'hi' ? 'पात्रता परिणाम' : 'Eligibility Results'}
                        </CardTitle>
                        <CardDescription>
                          {language === 'hi' 
                            ? `${eligibilityResults.filter((r: any) => r.isEligible).length} योजनाओं के लिए पात्र`
                            : `Eligible for ${eligibilityResults.filter((r: any) => r.isEligible).length} schemes`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="max-h-[150px]">
                          <div className="space-y-2">
                            {eligibilityResults.slice(0, 3).map((result: any) => (
                              <div key={result.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Badge className={result.isEligible ? "bg-indigo-500" : "bg-rose-500"}>
                                    {result.matchScore}%
                                  </Badge>
                                  <span className="text-sm font-medium">{result.name}</span>
                                </div>
                                {result.isEligible && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => {
                                      setSelectedSchemeForApply(result);
                                      setShowSchemeApplyDialog(true);
                                    }}
                                  >
                                    {language === 'hi' ? 'आवेदन करें' : 'Apply'}
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}

                  {/* Featured Schemes */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {(schemes.length > 0 ? schemes : [
                      { id: 'pmjay', name: 'PMJAY - Ayushman Bharat', shortDescription: '₹5 lakh health cover for eligible families', coverageAmount: '₹5,00,000', helpline: '14555', targetGroups: ['BPL families', 'SC/ST'] },
                      { id: 'jsy', name: 'Janani Suraksha Yojana', shortDescription: 'Cash assistance for institutional delivery', coverageAmount: '₹1,400', helpline: '104', targetGroups: ['Pregnant women'] },
                      { id: 'rbsk', name: 'Rashtriya Bal Swasthya Karyakram', shortDescription: 'Free health screening for children 0-18 years', coverageAmount: 'Free', helpline: '104', targetGroups: ['Children 0-18'] },
                      { id: 'ndhm', name: 'National Digital Health Mission', shortDescription: 'Digital Health ID for all citizens', coverageAmount: 'N/A', helpline: '14447', targetGroups: ['All citizens'] }
                    ]).slice(0, 4).map((scheme) => (
                      <Card key={scheme.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{scheme.name}</CardTitle>
                            <Badge className="bg-indigo-600">{scheme.coverageAmount}</Badge>
                          </div>
                          <CardDescription>{scheme.shortDescription || scheme.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {/* Target Groups */}
                          {scheme.targetGroups && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {scheme.targetGroups.slice(0, 3).map((group: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">{group}</Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            {scheme.helpline && (
                              <div className="flex items-center gap-1 cursor-pointer hover:text-indigo-600" onClick={() => window.open(`tel:${scheme.helpline}`)}>
                                <Phone className="h-3 w-3" />
                                {scheme.helpline}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedSchemeForApply(scheme);
                                setShowSchemeApplyDialog(true);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {language === 'hi' ? 'विवरण' : 'Details'}
                            </Button>
                            <Button 
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700"
                              onClick={() => {
                                setSelectedSchemeForApply(scheme);
                                setShowSchemeApplyDialog(true);
                              }}
                            >
                              <FileCheck className="h-3 w-3 mr-1" />
                              {language === 'hi' ? 'आवेदन करें' : 'Apply'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* My Applications */}
                  {schemeApplications.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{language === 'hi' ? 'मेरे आवेदन' : 'My Applications'}</CardTitle>
                          <Badge variant="outline">{schemeApplications.length} {language === 'hi' ? 'कुल' : 'total'}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="max-h-[300px]">
                          <div className="space-y-3">
                            {schemeApplications.map((app: any) => (
                              <div 
                                key={app.id} 
                                className={`p-4 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${
                                  app.status === 'approved' ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200' :
                                  app.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-950 border-rose-200 opacity-60' :
                                  'bg-card'
                                }`}
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setShowApplicationDetail(true);
                                }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                      <FileCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{app.scheme?.name || 'Scheme'}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {language === 'hi' ? 'आवेदन आईडी:' : 'Application ID:'} {app.applicationId || app.id.slice(0, 8)}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(app.appliedAt || app.createdAt)}
                                      </div>
                                    </div>
                                  </div>
                                  <Badge variant={
                                    app.status === 'approved' ? 'default' :
                                    app.status === 'rejected' ? 'destructive' :
                                    app.status === 'under_review' ? 'secondary' : 'outline'
                                  } className={app.status === 'approved' ? 'bg-indigo-500' : app.status === 'submitted' ? 'bg-indigo-500' : ''}>
                                    {app.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Vaccination */}
              {activeTab === "vaccination" && (
                <motion.div
                  key="vaccination"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Vaccination Tracker</h2>
                      <p className="text-muted-foreground">Track and schedule vaccinations</p>
                    </div>
                    {isAuthenticated && (
                      <Button 
                        className="bg-indigo-600"
                        onClick={() => setShowVaccinationDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Record
                      </Button>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <Card>
                      <CardContent className="pt-4 pb-4 text-center">
                        <p className="text-2xl font-bold text-indigo-600">
                          {vaccinations.filter(v => v.doseNumber === v.totalDoses).length || 12}
                        </p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 pb-4 text-center">
                        <p className="text-2xl font-bold text-indigo-600">3</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 pb-4 text-center">
                        <p className="text-2xl font-bold text-rose-600">1</p>
                        <p className="text-xs text-muted-foreground">Overdue</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Vaccination Records */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Vaccination Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="max-h-[300px]">
                        <div className="space-y-3">
                          {(vaccinations.length > 0 ? vaccinations : [
                            { id: '1', vaccineName: 'COVID-19', doseNumber: 2, totalDoses: 2, administeredDate: new Date('2024-01-15') },
                            { id: '2', vaccineName: 'Tetanus', doseNumber: 2, totalDoses: 3, administeredDate: new Date('2024-02-20'), nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
                            { id: '3', vaccineName: 'Hepatitis B', doseNumber: 1, totalDoses: 3, administeredDate: new Date('2024-03-01') }
                          ]).map((vaccine) => {
                            const isComplete = vaccine.doseNumber === vaccine.totalDoses;
                            const progress = (vaccine.doseNumber / vaccine.totalDoses) * 100;
                            
                            return (
                              <div key={vaccine.id} className="p-3 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-full ${isComplete ? 'bg-indigo-100' : 'bg-indigo-100'}`}>
                                      <Syringe className={`h-3 w-3 ${isComplete ? 'text-indigo-600' : 'text-indigo-600'}`} />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{vaccine.vaccineName}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {vaccine.doseNumber} of {vaccine.totalDoses} doses
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className={isComplete ? 'bg-indigo-500' : 'bg-indigo-500'}>
                                    {isComplete ? 'Complete' : 'In Progress'}
                                  </Badge>
                                </div>
                                <Progress value={progress} className="h-1.5" />
                                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                  <span>Given: {formatDate(vaccine.administeredDate)}</span>
                                  {vaccine.nextDueDate && (
                                    <span>Next: {formatDate(vaccine.nextDueDate)}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Medicine Reminders */}
              {activeTab === "reminders" && (
                <motion.div
                  key="reminders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Medicine Reminders</h2>
                      <p className="text-muted-foreground">Never miss a dose</p>
                    </div>
                    {isAuthenticated && (
                      <Button 
                        className="bg-indigo-600"
                        onClick={() => setShowReminderDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Reminder
                      </Button>
                    )}
                  </div>

                  {/* Active Reminders */}
                  <div className="grid gap-3">
                    {(reminders.length > 0 ? reminders.filter(r => r.isActive) : [
                      { id: '1', medicineName: 'Metformin', dosage: '500mg', frequency: 'twice', times: JSON.stringify(['08:00', '20:00']), dosesTaken: 12, dosesMissed: 2, isActive: true },
                      { id: '2', medicineName: 'Vitamin D3', dosage: '60000 IU', frequency: 'once', times: JSON.stringify(['09:00']), dosesTaken: 4, dosesMissed: 0, isActive: true }
                    ]).map((reminder) => {
                      const times = typeof reminder.times === 'string' ? JSON.parse(reminder.times) : reminder.times;
                      
                      return (
                        <Card key={reminder.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900">
                                    <Pill className="h-4 w-4 text-indigo-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold">{reminder.medicineName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {reminder.dosage} • {reminder.frequency} daily
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex gap-1">
                                    {times.map((time: string, i: number) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {time}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-indigo-600" />
                                    {reminder.dosesTaken || 0} taken
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <XCircle className="h-3 w-3 text-rose-600" />
                                    {reminder.dosesMissed || 0} missed
                                  </span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="bg-indigo-600"
                                onClick={() => markDoseTaken(reminder.id)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Take
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Community Forums */}
              {activeTab === "community" && (
                <motion.div
                  key="community"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-indigo-600" />
                        {language === 'hi' ? 'समुदाय मंच' : 'Community Forum'}
                      </h2>
                      <p className="text-muted-foreground">
                        {language === 'hi' ? 'अन्य उपयोगकर्ताओं से जुड़ें और स्वास्थ्य विषयों पर चर्चा करें' : 'Connect with others and discuss health topics'}
                      </p>
                    </div>
                    {isAuthenticated && (
                      <Button 
                        className="bg-indigo-600"
                        onClick={() => setShowPostDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {language === 'hi' ? 'नई पोस्ट' : 'New Post'}
                      </Button>
                    )}
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: language === 'hi' ? 'सभी' : 'All' },
                      { id: 'general', label: language === 'hi' ? 'सामान्य' : 'General' },
                      { id: 'pregnancy', label: language === 'hi' ? 'गर्भावस्था' : 'Pregnancy' },
                      { id: 'child_health', label: language === 'hi' ? 'बाल स्वास्थ्य' : 'Child Health' },
                      { id: 'chronic_disease', label: language === 'hi' ? 'पुरानी बीमारी' : 'Chronic Disease' },
                      { id: 'mental_health', label: language === 'hi' ? 'मानसिक स्वास्थ्य' : 'Mental Health' },
                      { id: 'nutrition', label: language === 'hi' ? 'पोषण' : 'Nutrition' }
                    ].map((cat) => (
                      <Button
                        key={cat.id}
                        variant={forumCategory === cat.id ? "default" : "outline"}
                        size="sm"
                        className={forumCategory === cat.id ? "bg-indigo-600" : ""}
                        onClick={() => {
                          setForumCategory(cat.id);
                          fetchForums(cat.id);
                        }}
                      >
                        {cat.label}
                      </Button>
                    ))}
                  </div>

                  {/* Posts List */}
                  <div className="grid gap-3">
                    {(forums.length > 0 ? forums : [
                      { id: '1', title: 'डेंगू के लक्षण क्या हैं?', content: 'मुझे बुखार है और शरीर में दर्द है। क्या यह डेंगू हो सकता है?', category: 'general', authorName: 'राहुल', likesCount: 12, repliesCount: 5, createdAt: new Date() },
                      { id: '2', title: 'गर्भावस्था में आहार', content: 'गर्भवती महिलाओं के लिए कौन से आहार फायदेमंद हैं?', category: 'pregnancy', authorName: 'प्रिया', likesCount: 25, repliesCount: 8, createdAt: new Date() },
                      { id: '3', title: 'बच्चों के लिए टीकाकरण', content: 'बच्चों के लिए अनिवार्य टीके कौन से हैं?', category: 'child_health', authorName: 'अमित', likesCount: 18, repliesCount: 10, createdAt: new Date() }
                    ]).map((post) => (
                      <Card key={post.id} className="cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => { setSelectedPost(post); setShowPostDetail(true); }}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{post.title}</p>
                                {post.isPinned && (
                                  <Badge variant="outline" className="text-xs">📌</Badge>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs mt-1">
                                {post.category}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {post.authorName || 'Anonymous'}
                              </span>
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {post.likesCount || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {post.repliesCount || 0}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Health Challenges */}
              {activeTab === "challenges" && (
                <motion.div
                  key="challenges"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-indigo-500" />
                        {language === 'hi' ? 'स्वास्थ्य चुनौतियां' : 'Health Challenges'}
                      </h2>
                      <p className="text-muted-foreground">
                        {language === 'hi' ? 'भाग लें और अपना स्वास्थ्य बेहतर बनाएं' : 'Participate and improve your health'}
                      </p>
                    </div>
                  </div>

                  {/* Challenge Type Filter */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: language === 'hi' ? 'सभी' : 'All', icon: Target },
                      { id: 'steps', label: language === 'hi' ? 'कदम' : 'Steps', icon: Target },
                      { id: 'water', label: language === 'hi' ? 'पानी' : 'Water', icon: Droplets },
                      { id: 'sleep', label: language === 'hi' ? 'नींद' : 'Sleep', icon: Moon },
                      { id: 'exercise', label: language === 'hi' ? 'व्यायाम' : 'Exercise', icon: Zap },
                      { id: 'nutrition', label: language === 'hi' ? 'पोषण' : 'Nutrition', icon: Heart },
                      { id: 'meditation', label: language === 'hi' ? 'ध्यान' : 'Meditation', icon: Brain }
                    ].map((type) => (
                      <Button
                        key={type.id}
                        variant={challengeType === type.id ? "default" : "outline"}
                        size="sm"
                        className={challengeType === type.id ? "bg-indigo-600" : ""}
                        onClick={() => {
                          setChallengeType(type.id);
                          fetchChallenges(type.id);
                        }}
                      >
                        <type.icon className="h-3 w-3 mr-1" />
                        {type.label}
                      </Button>
                    ))}
                  </div>

                  {/* Active Challenges */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {(challenges.length > 0 ? challenges : [
                      { id: '1', title: '10,000 Steps Daily', description: 'Walk 10,000 steps every day for 30 days', type: 'steps', difficulty: 'medium', targetValue: 10000, unit: 'steps', points: 500, badge: '🚶', participantsCount: 1250, userProgress: 6500, isJoined: true },
                      { id: '2', title: '8 Glasses Water', description: 'Drink 8 glasses of water daily', type: 'water', difficulty: 'easy', targetValue: 8, unit: 'glasses', points: 200, badge: '💧', participantsCount: 2100, userProgress: 6, isJoined: true },
                      { id: '3', title: '30-Day Meditation', description: 'Meditate for 15 minutes daily', type: 'meditation', difficulty: 'hard', targetValue: 15, unit: 'minutes', points: 800, badge: '🧘', participantsCount: 850, userProgress: 0, isJoined: false },
                      { id: '4', title: 'Sleep Champion', description: 'Get 7-8 hours of sleep for 2 weeks', type: 'sleep', difficulty: 'medium', targetValue: 7, unit: 'hours', points: 600, badge: '😴', participantsCount: 1500, userProgress: 7, isJoined: true }
                    ]).map((challenge) => (
                      <Card key={challenge.id} className={`overflow-hidden ${challenge.isJoined ? 'border-indigo-500' : ''}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{challenge.badge}</span>
                              <div>
                                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={`text-xs ${
                                    challenge.difficulty === 'easy' ? 'border-indigo-500 text-indigo-600' :
                                    challenge.difficulty === 'medium' ? 'border-indigo-500 text-indigo-600' :
                                    'border-red-500 text-rose-600'
                                  }`}>
                                    {challenge.difficulty}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <Award className="h-3 w-3 mr-1" />
                                    {challenge.points} pts
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                          
                          {challenge.isJoined && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>{language === 'hi' ? 'प्रगति' : 'Progress'}</span>
                                <span className="font-medium">{challenge.userProgress}/{challenge.targetValue} {challenge.unit}</span>
                              </div>
                              <Progress value={((challenge.userProgress || 0) / challenge.targetValue) * 100} className="h-2" />
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {challenge.participantsCount} {language === 'hi' ? 'प्रतिभागी' : 'participants'}
                            </span>
                            {challenge.isJoined ? (
                              <Badge className="bg-indigo-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {language === 'hi' ? 'शामिल' : 'Joined'}
                              </Badge>
                            ) : (
                              <Button 
                                size="sm"
                                className="bg-indigo-600"
                                onClick={() => joinChallenge(challenge.id)}
                              >
                                {language === 'hi' ? 'शामिल हों' : 'Join'}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Leaderboard */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Crown className="h-5 w-5 text-indigo-500" />
                        {language === 'hi' ? 'लीडरबोर्ड' : 'Leaderboard'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(leaderboard.length > 0 ? leaderboard : [
                          { rank: 1, name: 'Priya S.', points: 12500, badge: '🥇' },
                          { rank: 2, name: 'Rahul K.', points: 11800, badge: '🥈' },
                          { rank: 3, name: 'Amit V.', points: 10500, badge: '🥉' },
                          { rank: 4, name: 'Sunita P.', points: 9200, badge: '' },
                          { rank: 5, name: 'Vikram S.', points: 8500, badge: '' }
                        ]).map((entry, i) => (
                          <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${i < 3 ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-950' : 'bg-muted/50'}`}>
                            <div className="flex items-center gap-3">
                              <span className="text-lg w-8 text-center">{entry.badge || `#${entry.rank}`}</span>
                              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                                {entry.name.charAt(0)}
                              </div>
                              <span className="font-medium text-sm">{entry.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Medal className="h-4 w-4 text-indigo-500" />
                              <span className="font-bold text-sm">{entry.points.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Health Camps */}
              {activeTab === "healthcamps" && (
                <motion.div
                  key="healthcamps"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-indigo-600" />
                        {language === 'hi' ? 'स्वास्थ्य शिविर' : 'Health Camps'}
                      </h2>
                      <p className="text-muted-foreground">
                        {language === 'hi' ? 'आसन्न स्वास्थ्य शिविरों में पंजीकरण करें' : 'Register for upcoming health camps'}
                      </p>
                    </div>
                  </div>

                  {/* Filters */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap gap-2">
                        <Input 
                          placeholder={language === 'hi' ? 'जिला खोजें...' : 'Search district...'}
                          className="max-w-[200px]"
                          value={campDistrict}
                          onChange={(e) => setCampDistrict(e.target.value)}
                        />
                        <Button 
                          variant="outline"
                          onClick={() => fetchHealthCamps(campDistrict)}
                        >
                          <Search className="h-4 w-4 mr-1" />
                          {language === 'hi' ? 'खोजें' : 'Search'}
                        </Button>
                        <Button 
                          variant="ghost"
                          onClick={() => { setCampDistrict(''); fetchHealthCamps(); }}
                        >
                          {language === 'hi' ? 'सभी दिखाएं' : 'Show All'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Camps List */}
                  <div className="grid gap-4">
                    {(healthCamps.length > 0 ? healthCamps : [
                      { id: '1', name: 'मुफ्त स्वास्थ्य जांच शिविर', description: 'सभी उम्र के लिए मुफ्त स्वास्थ्य जांच', district: 'Lucknow', state: 'Uttar Pradesh', address: 'Community Center, Aliganj', services: 'BP, Sugar, Eye Checkup', capacity: 200, registeredCount: 150, campDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), startTime: '09:00', endTime: '17:00', contactPhone: '+91-9876543210', isActive: true },
                      { id: '2', name: 'महिला स्वास्थ्य शिविर', description: 'महिलाओं के लिए विशेष स्वास्थ्य जांच', district: 'Kanpur', state: 'Uttar Pradesh', address: 'PHC, Civil Lines', services: 'Gynecology, Breast Cancer Screening', capacity: 100, registeredCount: 80, campDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), startTime: '10:00', endTime: '16:00', contactPhone: '+91-9876543211', isActive: true },
                      { id: '3', name: 'बाल स्वास्थ्य शिविर', description: 'बच्चों के लिए टीकाकरण और जांच', district: 'Varanasi', state: 'Uttar Pradesh', address: 'CHC, Lanka', services: 'Vaccination, Growth Monitoring', capacity: 150, registeredCount: 100, campDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), startTime: '08:00', endTime: '14:00', contactPhone: '+91-9876543212', isActive: true }
                    ]).map((camp) => (
                      <Card key={camp.id} className="overflow-hidden">
                        <div className="bg-indigo-600 p-3 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{camp.name}</h3>
                              <p className="text-sm opacity-90">{camp.description}</p>
                            </div>
                            <Badge className="bg-white/20 text-white">
                              {camp.isActive ? (language === 'hi' ? 'सक्रिय' : 'Active') : (language === 'hi' ? 'समाप्त' : 'Ended')}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-indigo-600" />
                                <span>{camp.address}, {camp.district}, {camp.state}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-indigo-600" />
                                <span>{formatDate(camp.campDate)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-indigo-600" />
                                <span>{camp.startTime} - {camp.endTime}</span>
                              </div>
                              {camp.contactPhone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-indigo-600" />
                                  <span>{camp.contactPhone}</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">{language === 'hi' ? 'सेवाएं' : 'Services'}</p>
                                <div className="flex flex-wrap gap-1">
                                  {(Array.isArray(camp.services) ? camp.services : (camp.services || '').split(',').filter(Boolean)).map((service: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">{typeof service === 'string' ? service.trim() : service}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">{language === 'hi' ? 'क्षमता' : 'Capacity'}</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={(camp.registeredCount || 0) / (camp.capacity || 1) * 100} className="flex-1 h-2" />
                                  <span className="text-xs">{camp.registeredCount}/{camp.capacity}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              className="flex-1 bg-indigo-600"
                              onClick={() => registerForCamp(camp.id)}
                              disabled={!isAuthenticated}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              {language === 'hi' ? 'पंजीकरण करें' : 'Register'}
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`tel:${camp.contactPhone}`)}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              {language === 'hi' ? 'संपर्क' : 'Contact'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Volunteers */}
              {activeTab === "volunteers" && (
                <motion.div
                  key="volunteers"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <HandHeart className="h-6 w-6 text-indigo-500" />
                        {language === 'hi' ? 'स्वयंसेवक' : 'Volunteers'}
                      </h2>
                      <p className="text-muted-foreground">
                        {language === 'hi' ? 'स्वास्थ्य सेवाओं में मदद करने वाले स्वयंसेवक' : 'Volunteers helping with health services'}
                      </p>
                    </div>
                    {isAuthenticated && (
                      <Button 
                        className="bg-rose-600"
                        onClick={() => setShowVolunteerDialog(true)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        {language === 'hi' ? 'स्वयंसेवक बनें' : 'Become Volunteer'}
                      </Button>
                    )}
                  </div>

                  {/* Skills Filter */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: language === 'hi' ? 'सभी' : 'All' },
                      { id: 'first_aid', label: language === 'hi' ? 'प्राथमिक चिकित्सा' : 'First Aid' },
                      { id: 'counseling', label: language === 'hi' ? 'परामर्श' : 'Counseling' },
                      { id: 'transport', label: language === 'hi' ? 'परिवहन' : 'Transport' },
                      { id: 'translation', label: language === 'hi' ? 'अनुवाद' : 'Translation' }
                    ].map((skill) => (
                      <Button
                        key={skill.id}
                        variant={volunteerSkill === skill.id ? "default" : "outline"}
                        size="sm"
                        className={volunteerSkill === skill.id ? "bg-indigo-600" : ""}
                        onClick={() => {
                          setVolunteerSkill(skill.id);
                          fetchVolunteers(skill.id);
                        }}
                      >
                        {skill.label}
                      </Button>
                    ))}
                  </div>

                  {/* Volunteers List */}
                  <div className="grid gap-3 md:grid-cols-2">
                    {(volunteers.length > 0 ? volunteers : [
                      { id: '1', name: 'राम शर्मा', phone: '+91-9876543210', skills: 'first_aid, counseling', availability: 'weekends', district: 'Lucknow', rating: 4.8, totalServices: 45, isVerified: true },
                      { id: '2', name: 'सीता देवी', phone: '+91-9876543211', skills: 'translation, counseling', availability: 'weekdays', district: 'Kanpur', rating: 4.9, totalServices: 62, isVerified: true },
                      { id: '3', name: 'अमित कुमार', phone: '+91-9876543212', skills: 'transport, first_aid', availability: 'evenings', district: 'Varanasi', rating: 4.7, totalServices: 38, isVerified: false },
                      { id: '4', name: 'प्रिया सिंह', phone: '+91-9876543213', skills: 'counseling', availability: 'flexible', district: 'Allahabad', rating: 4.6, totalServices: 28, isVerified: true }
                    ]).map((volunteer) => (
                      <Card key={volunteer.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-lg">
                              {volunteer.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{volunteer.name}</p>
                                {volunteer.isVerified && (
                                  <Badge variant="outline" className="text-xs text-indigo-600">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    {language === 'hi' ? 'सत्यापित' : 'Verified'}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3" />
                                <span>{volunteer.district}</span>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>{volunteer.availability}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(Array.isArray(volunteer.skills) ? volunteer.skills : (volunteer.skills || '').split(',').filter(Boolean)).map((skill: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {typeof skill === 'string' ? skill.trim() : skill}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-indigo-500" />
                                    {volunteer.rating}
                                  </span>
                                  <span>{volunteer.totalServices} {language === 'hi' ? 'सेवाएं' : 'services'}</span>
                                </div>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(`tel:${volunteer.phone}`)}
                                >
                                  <Phone className="h-3 w-3 mr-1" />
                                  {language === 'hi' ? 'संपर्क' : 'Contact'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Emergency SOS */}
              {activeTab === "emergency" && (
                <motion.div
                  key="emergency"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-rose-600">Emergency SOS</h2>
                      <p className="text-muted-foreground">Critical care and emergency services</p>
                    </div>
                  </div>

                  {/* SOS Button */}
                  <Card className="border-2 border-rose-200 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-950/20">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        {!sosActivated ? (
                          <Button
                            variant="destructive"
                            size="lg"
                            className="w-40 h-40 rounded-full text-xl animate-pulse"
                            onClick={activateSOS}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <AlertTriangle className="h-10 w-10" />
                              <span>SOS</span>
                              <span className="text-xs">TAP FOR EMERGENCY</span>
                            </div>
                          </Button>
                        ) : (
                          <div className="text-center space-y-4">
                            <div className="p-4 rounded-full bg-rose-100 mx-auto w-fit animate-pulse">
                              <CheckCircle2 className="h-12 w-12 text-rose-600" />
                            </div>
                            <p className="font-semibold text-lg">Emergency Alert Sent!</p>
                            <p className="text-sm text-muted-foreground">
                              Help is on the way. Stay calm.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emergency Contacts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { name: "Ambulance", number: "108", icon: Ambulance, color: "bg-rose-500" },
                      { name: "Women Helpline", number: "181", icon: Phone, color: "bg-indigo-500" },
                      { name: "Child Helpline", number: "1098", icon: Baby, color: "bg-indigo-500" },
                      { name: "Disaster", number: "1070", icon: AlertTriangle, color: "bg-indigo-500" }
                    ].map((contact, i) => (
                      <Card key={i} className="overflow-hidden cursor-pointer" onClick={() => window.open(`tel:${contact.number}`)}>
                        <div className={`${contact.color} p-3 text-white text-center`}>
                          <contact.icon className="h-6 w-6 mx-auto mb-1" />
                          <p className="font-bold text-lg">{contact.number}</p>
                        </div>
                        <CardContent className="pt-2 pb-2 text-center">
                          <p className="text-xs font-medium">{contact.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* First Aid Guide */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Cross className="h-5 w-5 text-indigo-600" />
                        First Aid Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {[
                          { title: "Heart Attack", content: "1. Call 108 immediately\n2. Keep person calm\n3. Give aspirin if available\n4. Start CPR if unconscious" },
                          { title: "Stroke", content: "1. Call 108 immediately\n2. Note time of symptoms\n3. Keep person lying on side\n4. Do not give food or water" },
                          { title: "Severe Bleeding", content: "1. Apply firm pressure\n2. Elevate the wound\n3. Do not remove cloth\n4. Call 108 if bleeding continues" },
                          { title: "Burns", content: "1. Cool under running water\n2. Cover with clean material\n3. Do not apply ice or butter\n4. Seek medical help" }
                        ].map((item, i) => (
                          <AccordionItem key={i} value={`item-${i}`}>
                            <AccordionTrigger className="text-sm">{item.title}</AccordionTrigger>
                            <AccordionContent>
                              <pre className="whitespace-pre-wrap text-xs bg-muted p-3 rounded-lg">
                                {item.content}
                              </pre>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Patient Transport */}
              {activeTab === "transport" && (
                <motion.div
                  key="transport"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Ambulance className="h-6 w-6 text-indigo-600" />
                        {language === 'hi' ? 'रोगी परिवहन' : 'Patient Transport'}
                      </h2>
                      <p className="text-muted-foreground">
                        {language === 'hi' ? 'अस्पताल परिवहन और एम्बुलेंस सेवाएं' : 'Hospital transport and ambulance services'}
                      </p>
                    </div>
                    <Button 
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => { resetTransportForm(); setShowTransportDialog(true); }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {language === 'hi' ? 'परिवहन अनुरोध' : 'Request Transport'}
                    </Button>
                  </div>

                  {/* Transport Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-amber-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{transportStats.total}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'कुल अनुरोध' : 'Total Requests'}</p>
                          </div>
                          <Ambulance className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{transportStats.requested}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'लंबित' : 'Pending'}</p>
                          </div>
                          <Clock className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{transportStats.inTransit}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'प्रगति में' : 'In Transit'}</p>
                          </div>
                          <Navigation className="h-8 w-8 text-indigo-400 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{transportStats.completed}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'पूर्ण' : 'Completed'}</p>
                          </div>
                          <CheckCircle2 className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { name: language === 'hi' ? '108 एम्बुलेंस' : '108 Ambulance', number: '108', icon: Ambulance, color: 'bg-rose-500' },
                      { name: language === 'hi' ? 'आपातकालीन' : 'Emergency', number: '112', icon: AlertTriangle, color: 'bg-indigo-500' },
                      { name: language === 'hi' ? 'महिला हेल्पलाइन' : 'Women Helpline', number: '181', icon: Phone, color: 'bg-indigo-500' },
                      { name: language === 'hi' ? 'बाल हेल्पलाइन' : 'Child Helpline', number: '1098', icon: Baby, color: 'bg-indigo-500' }
                    ].map((contact, i) => (
                      <Card key={i} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.open(`tel:${contact.number}`)}>
                        <div className={`${contact.color} p-3 text-white text-center`}>
                          <contact.icon className="h-6 w-6 mx-auto mb-1" />
                          <p className="font-bold text-lg">{contact.number}</p>
                        </div>
                        <CardContent className="pt-2 pb-2 text-center">
                          <p className="text-xs font-medium">{contact.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Filters */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap gap-2">
                        <Select value={transportFilter} onValueChange={(v) => { setTransportFilter(v); fetchTransports(v); }}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder={language === 'hi' ? 'स्थिति' : 'Status'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{language === 'hi' ? 'सभी' : 'All'}</SelectItem>
                            <SelectItem value="requested">{language === 'hi' ? 'अनुरोधित' : 'Requested'}</SelectItem>
                            <SelectItem value="assigned">{language === 'hi' ? 'आवंटित' : 'Assigned'}</SelectItem>
                            <SelectItem value="in_transit">{language === 'hi' ? 'प्रगति में' : 'In Transit'}</SelectItem>
                            <SelectItem value="completed">{language === 'hi' ? 'पूर्ण' : 'Completed'}</SelectItem>
                            <SelectItem value="cancelled">{language === 'hi' ? 'रद्द' : 'Cancelled'}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => fetchTransports(transportFilter)}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          {language === 'hi' ? 'रिफ्रेश' : 'Refresh'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Available Vehicles */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Ambulance className="h-4 w-4 text-indigo-600" />
                        {language === 'hi' ? 'उपलब्ध वाहन' : 'Available Vehicles'}
                      </CardTitle>
                      <CardDescription>
                        {language === 'hi' ? 'आपके क्षेत्र में उपलब्ध' : 'Available in your area'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { type: 'ambulance', name: language === 'hi' ? 'एम्बुलेंस' : 'Ambulance', count: 3, eta: '10-15 min', icon: Ambulance, price: '₹500+' },
                          { type: 'auto', name: language === 'hi' ? 'ऑटो रिक्शा' : 'Auto Rickshaw', count: 8, eta: '5-10 min', icon: Car, price: '₹50+' },
                          { type: 'volunteer', name: language === 'hi' ? 'स्वयंसेवक' : 'Volunteer', count: 2, eta: '15-20 min', icon: HandHeart, price: language === 'hi' ? 'मुफ्त' : 'Free' }
                        ].map((vehicle) => (
                          <div 
                            key={vehicle.type}
                            className="p-4 border rounded-lg hover:border-indigo-500 transition-colors cursor-pointer"
                            onClick={() => {
                              setTransportForm({...transportForm, vehicleType: vehicle.type});
                              setShowTransportDialog(true);
                            }}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                <vehicle.icon className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="font-medium">{vehicle.name}</p>
                                <p className="text-xs text-muted-foreground">{vehicle.count} {language === 'hi' ? 'उपलब्ध' : 'available'}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">ETA: {vehicle.eta}</span>
                              <span className="font-bold text-indigo-600">{vehicle.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* My Transport Requests */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{language === 'hi' ? 'मेरे अनुरोध' : 'My Requests'}</CardTitle>
                        <Badge variant="outline">{transports.length} {language === 'hi' ? 'कुल' : 'total'}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {transports.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Ambulance className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>{language === 'hi' ? 'कोई परिवहन अनुरोध नहीं' : 'No transport requests'}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => { resetTransportForm(); setShowTransportDialog(true); }}
                          >
                            {language === 'hi' ? 'अनुरोध करें' : 'Request Transport'}
                          </Button>
                        </div>
                      ) : (
                        <ScrollArea className="max-h-[400px]">
                          <div className="space-y-3">
                            {transports.map((transport: any) => (
                              <div 
                                key={transport.id} 
                                className={`p-4 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${
                                  transport.status === 'completed' ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200' :
                                  transport.status === 'cancelled' ? 'bg-rose-50 dark:bg-rose-950 border-rose-200 opacity-60' :
                                  transport.status === 'in_transit' ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200' :
                                  'bg-card'
                                }`}
                                onClick={() => { setSelectedTransport(transport); setShowTransportDetail(true); }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                      <Ambulance className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm capitalize">{transport.vehicleType}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {transport.pickupLocation} → {transport.dropLocation}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {formatDate(transport.createdAt)}
                                        {transport.estimatedTime && (
                                          <>
                                            <span className="mx-1">•</span>
                                            <span>ETA: {transport.estimatedTime} min</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <Badge variant={
                                      transport.status === 'in_transit' ? 'default' :
                                      transport.status === 'completed' ? 'secondary' :
                                      transport.status === 'cancelled' ? 'destructive' : 'outline'
                                    } className={transport.status === 'in_transit' ? 'bg-indigo-500' : transport.status === 'assigned' ? 'bg-indigo-500' : ''}>
                                      {transport.status}
                                    </Badge>
                                    {transport.driverId && (
                                      <p className="text-xs text-muted-foreground">
                                        {language === 'hi' ? 'ड्राइवर:' : 'Driver:'} {transport.driverId}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Earnings & Monetization Dashboard */}
              {activeTab === "earnings" && canAccessTab('earnings', user?.role || 'citizen') && (
                <motion.div
                  key="earnings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-indigo-600" />
                        {language === 'hi' ? 'कमाई डैशबोर्ड' : 'Earnings Dashboard'}
                      </h2>
                      <p className="text-muted-foreground">
                        {language === 'hi' ? 'अस्पताल भागीदारी और कमीशन ट्रैकिंग' : 'Hospital partnerships & commission tracking'}
                      </p>
                    </div>
                    <Button 
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => { fetchEarningsData(); fetchPartnerHospitals(); fetchHomeVisitDoctors(); fetchMedicalHelpers(); fetchDiagnosticLabs(); }}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      {language === 'hi' ? 'रिफ्रेश' : 'Refresh'}
                    </Button>
                  </div>

                  {/* Earnings Overview Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-950 dark:to-gray-900">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'उपलब्ध बैलेंस' : 'Available Balance'}</p>
                            <p className="text-2xl font-bold text-indigo-600">₹{earningsStats.availableBalance.toLocaleString()}</p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                            <Award className="h-5 w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'लंबित कमाई' : 'Pending Earnings'}</p>
                            <p className="text-2xl font-bold text-indigo-600">₹{earningsStats.pendingBalance.toLocaleString()}</p>
                          </div>
                          <Clock className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'कुल लीड' : 'Total Leads'}</p>
                            <p className="text-2xl font-bold">{earningsStats.totalLeads}</p>
                          </div>
                          <Building2 className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'पूर्ण लीड' : 'Completed Leads'}</p>
                            <p className="text-2xl font-bold text-indigo-500">{earningsStats.completedLeads}</p>
                          </div>
                          <CheckCircle2 className="h-8 w-8 text-indigo-400 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => { fetchPartnerHospitals(); setEarningsTab('hospitals'); }}>
                      <CardContent className="pt-4 text-center">
                        <Building2 className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                        <p className="font-medium text-sm">{language === 'hi' ? 'अस्पताल भागीदारी' : 'Hospital Partners'}</p>
                        <p className="text-xs text-muted-foreground">{partnerHospitals.length} {language === 'hi' ? 'सक्रिय' : 'active'}</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:border-indigo-400 transition-colors" onClick={() => { fetchHomeVisitDoctors(); setEarningsTab('home-visit'); }}>
                      <CardContent className="pt-4 text-center">
                        <Stethoscope className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
                        <p className="font-medium text-sm">{language === 'hi' ? 'होम विज़िट डॉक्टर' : 'Home Visit Doctors'}</p>
                        <p className="text-xs text-muted-foreground">{homeVisitDoctors.length} {language === 'hi' ? 'उपलब्ध' : 'available'}</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => { fetchMedicalHelpers(); setEarningsTab('helpers'); }}>
                      <CardContent className="pt-4 text-center">
                        <HandHeart className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                        <p className="font-medium text-sm">{language === 'hi' ? 'मेडिकल हेल्पर' : 'Medical Helpers'}</p>
                        <p className="text-xs text-muted-foreground">{medicalHelpers.length} {language === 'hi' ? 'सेवाएं' : 'services'}</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:border-indigo-400 transition-colors" onClick={() => { fetchDiagnosticLabs(); setEarningsTab('labs'); }}>
                      <CardContent className="pt-4 text-center">
                        <Activity className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                        <p className="font-medium text-sm">{language === 'hi' ? 'डायग्नोस्टिक लैब' : 'Diagnostic Labs'}</p>
                        <p className="text-xs text-muted-foreground">{diagnosticLabs.length} {language === 'hi' ? 'पार्टनर' : 'partners'}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabs for different earning sources */}
                  <Tabs value={earningsTab} onValueChange={setEarningsTab}>
                    <TabsList className="grid w-full grid-cols-5 md:grid-cols-9 h-auto">
                      <TabsTrigger value="overview" className="text-xs md:text-sm">{language === 'hi' ? 'अवलोकन' : 'Overview'}</TabsTrigger>
                      <TabsTrigger value="directory" className="text-xs md:text-sm">{language === 'hi' ? 'खोजें' : 'Directory'}</TabsTrigger>
                      <TabsTrigger value="hospitals" className="text-xs md:text-sm">{language === 'hi' ? 'अस्पताल' : 'Hospitals'}</TabsTrigger>
                      <TabsTrigger value="home-visit" className="text-xs md:text-sm">{language === 'hi' ? 'होम विज़िट' : 'Home Visit'}</TabsTrigger>
                      <TabsTrigger value="helpers" className="text-xs md:text-sm">{language === 'hi' ? 'हेल्पर' : 'Helpers'}</TabsTrigger>
                      <TabsTrigger value="labs" className="text-xs md:text-sm">{language === 'hi' ? 'लैब' : 'Labs'}</TabsTrigger>
                      <TabsTrigger value="lab-requirements" className="text-xs md:text-sm bg-gradient-to-r from-indigo-500 to-indigo-500 text-white">{language === 'hi' ? 'लैब डायरेक्टरी' : 'Lab Directory'}</TabsTrigger>
                      <TabsTrigger value="checkups" className="text-xs md:text-sm">{language === 'hi' ? 'चेकअप' : 'Checkups'}</TabsTrigger>
                      <TabsTrigger value="equipment" className="text-xs md:text-sm">{language === 'hi' ? 'उपकरण' : 'Equipment'}</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-4 space-y-4">
                      {/* Lead Stats by Type */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{language === 'hi' ? 'लीड प्रकार अनुसार' : 'Leads by Type'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-center">
                              <p className="text-2xl font-bold text-indigo-500">{earningsStats.opdLeads}</p>
                              <p className="text-xs text-muted-foreground">OPD {language === 'hi' ? 'परामर्श' : 'Consultation'}</p>
                              <p className="text-xs text-indigo-600">₹75/{language === 'hi' ? 'लीड' : 'lead'}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-center">
                              <p className="text-2xl font-bold text-indigo-600">{earningsStats.ipdLeads}</p>
                              <p className="text-xs text-muted-foreground">IPD {language === 'hi' ? 'भर्ती' : 'Admission'}</p>
                              <p className="text-xs text-indigo-600">₹500/{language === 'hi' ? 'लीड' : 'lead'}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950 text-center">
                              <p className="text-2xl font-bold text-rose-600">{earningsStats.surgeryLeads}</p>
                              <p className="text-xs text-muted-foreground">{language === 'hi' ? 'सर्जरी' : 'Surgery'}</p>
                              <p className="text-xs text-indigo-600">₹2500/{language === 'hi' ? 'लीड' : 'lead'}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-center">
                              <p className="text-2xl font-bold text-indigo-600">{earningsStats.diagnosticLeads}</p>
                              <p className="text-xs text-muted-foreground">{language === 'hi' ? 'डायग्नोस्टिक' : 'Diagnostic'}</p>
                              <p className="text-xs text-indigo-600">₹150/{language === 'hi' ? 'लीड' : 'lead'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recent Leads */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{language === 'hi' ? 'हाल के लीड' : 'Recent Leads'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {recentLeads.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                              <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                              <p className="text-sm">{language === 'hi' ? 'कोई लीड नहीं' : 'No leads yet'}</p>
                              <p className="text-xs mt-1">{language === 'hi' ? 'अस्पताल भागीदारी से शुरुआत करें' : 'Start with hospital partnerships'}</p>
                            </div>
                          ) : (
                            <ScrollArea className="max-h-[200px]">
                              <div className="space-y-2">
                                {recentLeads.map((lead: any) => (
                                  <div key={lead.id} className="flex items-center justify-between p-2 rounded-lg border">
                                    <div>
                                      <p className="font-medium text-sm">{lead.patientName}</p>
                                      <p className="text-xs text-muted-foreground">{lead.hospitalName}</p>
                                    </div>
                                    <div className="text-right">
                                      <Badge variant={lead.status === 'completed' ? 'default' : 'secondary'}>
                                        {lead.leadType}
                                      </Badge>
                                      <p className="text-xs text-indigo-600 mt-1">₹{lead.commissionEarned}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          )}
                        </CardContent>
                      </Card>

                      {/* Withdraw Section */}
                      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-950 dark:to-gray-900">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-indigo-600" />
                            {language === 'hi' ? 'वित्तोड़न' : 'Withdraw'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">{language === 'hi' ? 'न्यूनतम वित्तोड़न: ₹500' : 'Minimum withdrawal: ₹500'}</p>
                              <p className="text-xs text-muted-foreground mt-1">{language === 'hi' ? 'बैंक खाता आवश्यक' : 'Bank account required'}</p>
                            </div>
                            <Button 
                              className="bg-indigo-600 hover:bg-indigo-700"
                              disabled={earningsStats.availableBalance < 500}
                              onClick={() => setShowWithdrawDialog(true)}
                            >
                              {language === 'hi' ? 'वित्तोड़न करें' : 'Withdraw'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Hospital Partners Tab */}
                    <TabsContent value="hospitals" className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{language === 'hi' ? 'प्रीमियम अस्पताल पार्टनर' : 'Premium Hospital Partners'}</h3>
                        <Badge variant="outline">{partnerHospitals.length} {language === 'hi' ? 'पार्टनर' : 'partners'}</Badge>
                      </div>
                      <div className="grid gap-4">
                        {partnerHospitals.map((hospital: any) => (
                          <Card key={hospital.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    {hospital.name}
                                    {hospital.partnershipTier === 'Enterprise' && (
                                      <Badge className="bg-indigo-500">Enterprise</Badge>
                                    )}
                                  </CardTitle>
                                  <CardDescription>{hospital.type} • {hospital.district}</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-indigo-600 border-indigo-300">
                                  {hospital.partnershipTier}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {/* Lead Pricing */}
                              <div className="grid grid-cols-4 gap-2 mb-4">
                                <div className="text-center p-2 rounded bg-indigo-50 dark:bg-indigo-950">
                                  <p className="text-xs text-muted-foreground">OPD</p>
                                  <p className="font-bold text-indigo-500">₹{hospital.leadPricing?.opd || 50}</p>
                                </div>
                                <div className="text-center p-2 rounded bg-indigo-50 dark:bg-indigo-950">
                                  <p className="text-xs text-muted-foreground">IPD</p>
                                  <p className="font-bold text-indigo-600">₹{hospital.leadPricing?.ipd || 400}</p>
                                </div>
                                <div className="text-center p-2 rounded bg-rose-50 dark:bg-rose-950">
                                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'सर्जरी' : 'Surgery'}</p>
                                  <p className="font-bold text-rose-600">₹{hospital.leadPricing?.surgery || 1500}</p>
                                </div>
                                <div className="text-center p-2 rounded bg-indigo-50 dark:bg-indigo-950">
                                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'लैब' : 'Lab'}</p>
                                  <p className="font-bold text-indigo-600">₹{hospital.leadPricing?.diagnostic || 80}</p>
                                </div>
                              </div>

                              {/* Services */}
                              {hospital.services && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {hospital.services.slice(0, 5).map((service: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-xs">{service}</Badge>
                                  ))}
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                  onClick={() => {
                                    setSelectedHospital(hospital);
                                    setLeadForm({
                                      ...leadForm,
                                      hospitalId: hospital.id,
                                      hospitalName: hospital.name
                                    });
                                    setShowLeadDialog(true);
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  {language === 'hi' ? 'लीड बनाएं' : 'Create Lead'}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => window.open(`tel:${hospital.phone}`)}>
                                  <Phone className="h-3 w-3 mr-1" />
                                  {language === 'hi' ? 'कॉल' : 'Call'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Home Visit Doctors Tab */}
                    <TabsContent value="home-visit" className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{language === 'hi' ? 'होम विज़िट डॉक्टर' : 'Home Visit Doctors'}</h3>
                        <Badge variant="outline">{homeVisitDoctors.length} {language === 'hi' ? 'उपलब्ध' : 'available'}</Badge>
                      </div>
                      <div className="grid gap-4">
                        {homeVisitDoctors.map((doctor: any) => (
                          <Card key={doctor.id} className="overflow-hidden">
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                    {doctor.name.split(' ').map((n: string) => n[0]).join('')}
                                  </div>
                                  <div>
                                    <p className="font-semibold">{doctor.name}</p>
                                    <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <Star className="h-3 w-3 text-indigo-500 fill-yellow-500" />
                                      <span className="text-xs">{doctor.rating} ({doctor.totalVisits} {language === 'hi' ? 'विज़िट' : 'visits'})</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-lg text-indigo-600">₹{doctor.consultationFee}</p>
                                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'प्रति विज़िट' : 'per visit'}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-indigo-500 hover:bg-indigo-600"
                                  onClick={() => {
                                    setSelectedDoctorForHomeVisit(doctor);
                                    setHomeVisitForm({...homeVisitForm, doctorId: doctor.id});
                                    setShowHomeVisitDialog(true);
                                  }}
                                >
                                  {language === 'hi' ? 'बुक करें' : 'Book Visit'}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => window.open(`tel:${doctor.phone}`)}>
                                  <Phone className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Medical Helpers Tab */}
                    <TabsContent value="helpers" className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{language === 'hi' ? 'मेडिकल हेल्पर' : 'Medical Helpers'}</h3>
                        <Badge variant="outline">{medicalHelpers.length} {language === 'hi' ? 'सेवाएं' : 'services'}</Badge>
                      </div>
                      <div className="grid gap-4">
                        {medicalHelpers.map((helper: any) => (
                          <Card key={helper.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                    <HandHeart className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="font-semibold">{helper.name}</p>
                                    <p className="text-sm text-muted-foreground capitalize">{helper.helperType}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <Star className="h-3 w-3 text-indigo-500 fill-yellow-500" />
                                      <span className="text-xs">{helper.rating} ({helper.totalServices} {language === 'hi' ? 'सेवाएं' : 'services'})</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-indigo-600">₹{helper.hourlyRate}/{language === 'hi' ? 'घंटा' : 'hr'}</p>
                                  <p className="text-xs text-muted-foreground">{helper.city}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {helper.services?.slice(0, 4).map((service: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{service}</Badge>
                                ))}
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => {
                                  setSelectedHelper(helper);
                                  setHelperBookingForm({...helperBookingForm, helperId: helper.id, hourlyRate: helper.hourlyRate});
                                  setShowHelperBookingDialog(true);
                                }}
                              >
                                {language === 'hi' ? 'बुक करें' : 'Book Now'}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Diagnostic Labs Tab */}
                    <TabsContent value="labs" className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{language === 'hi' ? 'डायग्नोस्टिक लैब' : 'Diagnostic Labs'}</h3>
                        <Badge variant="outline">{diagnosticLabs.length} {language === 'hi' ? 'पार्टनर' : 'partners'}</Badge>
                      </div>
                      <div className="grid gap-4">
                        {diagnosticLabs.map((lab: any) => (
                          <Card key={lab.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-lg">{lab.name}</CardTitle>
                                  <CardDescription>{lab.city} • {lab.address}</CardDescription>
                                </div>
                                {lab.nablAccredited && (
                                  <Badge className="bg-indigo-500">NABL</Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center gap-4 mb-3 text-sm">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-indigo-500 fill-yellow-500" />
                                  <span>{lab.rating}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>{lab.totalBookings} {language === 'hi' ? 'बुकिंग' : 'bookings'}</span>
                                </div>
                                {lab.homeCollection && (
                                  <Badge variant="outline" className="text-xs">Home Collection</Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {lab.tests?.slice(0, 5).map((test: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{test}</Badge>
                                ))}
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => {
                                  setSelectedLab(lab);
                                  setLabBookingForm({...labBookingForm, labId: lab.id});
                                  setShowLabBookingDialog(true);
                                }}
                              >
                                {language === 'hi' ? 'टेस्ट बुक करें' : 'Book Test'}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Hospital Directory Tab */}
                    <TabsContent value="directory" className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{language === 'hi' ? 'अस्पताल निर्देशिका' : 'Hospital Directory'}</h3>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => fetchHospitalDirectory(hospitalSearchQuery, hospitalTypeFilter)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          {language === 'hi' ? 'खोजें' : 'Search'}
                        </Button>
                      </div>
                      
                      {/* Search and Filters */}
                      <div className="flex gap-2 flex-wrap">
                        <Input
                          placeholder={language === 'hi' ? 'अस्पताल, शहर, विशेषज्ञता खोजें...' : 'Search hospitals, city, specialty...'}
                          value={hospitalSearchQuery}
                          onChange={(e) => setHospitalSearchQuery(e.target.value)}
                          className="flex-1 min-w-[200px]"
                        />
                        <Select value={hospitalTypeFilter} onValueChange={(v) => { setHospitalTypeFilter(v); fetchHospitalDirectory(hospitalSearchQuery, v); }}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{language === 'hi' ? 'सभी प्रकार' : 'All Types'}</SelectItem>
                            <SelectItem value="private">{language === 'hi' ? 'निजी' : 'Private'}</SelectItem>
                            <SelectItem value="government">{language === 'hi' ? 'सरकारी' : 'Government'}</SelectItem>
                            <SelectItem value="trust">{language === 'hi' ? 'ट्रस्ट' : 'Trust'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-4">
                        {(hospitalDirectory.length > 0 ? hospitalDirectory : []).slice(0, 5).map((hospital: any) => (
                          <Card key={hospital.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    {hospital.name}
                                    {hospital.partnershipStatus === 'active' && (
                                      <Badge className={hospital.partnershipTier === 'platinum' ? 'bg-indigo-500' : hospital.partnershipTier === 'enterprise' ? 'bg-indigo-500' : 'bg-indigo-500'}>
                                        {hospital.partnershipTier}
                                      </Badge>
                                    )}
                                  </CardTitle>
                                  <CardDescription>
                                    {hospital.type === 'private' ? '🏛️' : hospital.type === 'government' ? '🏛️' : '🏥'} {hospital.category} • {hospital.city}, {hospital.state}
                                  </CardDescription>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-indigo-500 fill-yellow-500" />
                                    <span className="font-medium">{hospital.rating}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{hospital.totalLeads} leads</p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {hospital.departments?.slice(0, 6).map((dept: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{dept}</Badge>
                                ))}
                              </div>
                              <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                                <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-950">
                                  <p className="font-medium text-indigo-500">OPD {hospital.opdCommission}%</p>
                                </div>
                                <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-950">
                                  <p className="font-medium text-indigo-600">IPD {hospital.ipdCommission}%</p>
                                </div>
                                <div className="p-2 rounded bg-rose-50 dark:bg-rose-950">
                                  <p className="font-medium text-rose-600">Surgery {hospital.surgeryCommission}%</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                  onClick={() => {
                                    setSelectedHospital(hospital);
                                    setLeadForm({
                                      ...leadForm,
                                      hospitalId: hospital.id,
                                      hospitalName: hospital.name
                                    });
                                    setShowLeadDialog(true);
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  {language === 'hi' ? 'लीड बनाएं' : 'Create Lead'}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => window.open(`tel:${hospital.phone}`)}>
                                  <Phone className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {hospitalDirectory.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p>{language === 'hi' ? 'अस्पताल खोजने के लिए खोजें' : 'Search to find hospitals'}</p>
                            <Button 
                              variant="link" 
                              onClick={() => fetchHospitalDirectory()}
                              className="mt-2"
                            >
                              {language === 'hi' ? 'सभी दिखाएं' : 'Show All'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Health Checkups Tab */}
                    <TabsContent value="checkups" className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{language === 'hi' ? 'स्वास्थ्य जांच पैकेज' : 'Health Checkup Packages'}</h3>
                        <Button size="sm" variant="outline" onClick={fetchHealthCheckupPackages}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          {language === 'hi' ? 'रिफ्रेश' : 'Refresh'}
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {healthCheckupPackages.map((pkg: any) => (
                          <Card key={pkg.id} className={pkg.isFeatured ? 'border-indigo-500 border-2' : ''}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                {pkg.isFeatured && <Badge className="bg-indigo-500">Featured</Badge>}
                              </div>
                              <CardDescription>{pkg.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {pkg.tests?.slice(0, 4).map((test: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{test}</Badge>
                                ))}
                                {pkg.tests?.length > 4 && (
                                  <Badge variant="outline" className="text-xs">+{pkg.tests.length - 4} more</Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <span className="text-lg font-bold text-indigo-600">₹{pkg.discountedPrice}</span>
                                  <span className="text-sm line-through text-muted-foreground ml-2">₹{pkg.mrp}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Star className="h-4 w-4 text-indigo-500 fill-yellow-500" />
                                  <span>{pkg.rating}</span>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => {
                                  setSelectedPackage(pkg);
                                  setCheckupBookingForm({
                                    ...checkupBookingForm,
                                    packageId: pkg.id,
                                    packageName: pkg.name
                                  });
                                  setShowCheckupBookingDialog(true);
                                }}
                              >
                                {language === 'hi' ? 'बुक करें' : 'Book Now'} - ₹{pkg.discountedPrice}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Medical Equipment Tab */}
                    <TabsContent value="equipment" className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{language === 'hi' ? 'मेडिकल उपकरण किराया' : 'Medical Equipment Rental'}</h3>
                        <Button size="sm" variant="outline" onClick={fetchMedicalEquipment}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          {language === 'hi' ? 'रिफ्रेश' : 'Refresh'}
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {medicalEquipment.map((equip: any) => (
                          <Card key={equip.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">{equip.name}</CardTitle>
                              <CardDescription>{equip.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline">{equip.category}</Badge>
                                <Badge variant="secondary">{equip.availableUnits} {language === 'hi' ? 'उपलब्ध' : 'available'}</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2 mb-3 text-center text-sm">
                                <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-950">
                                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'दैनिक' : 'Daily'}</p>
                                  <p className="font-bold text-indigo-600">₹{equip.dailyRate}</p>
                                </div>
                                <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-950">
                                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'साप्ताहिक' : 'Weekly'}</p>
                                  <p className="font-bold text-indigo-500">₹{equip.weeklyRate || equip.dailyRate * 6}</p>
                                </div>
                                <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-950">
                                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'मासिक' : 'Monthly'}</p>
                                  <p className="font-bold text-indigo-600">₹{equip.monthlyRate || equip.dailyRate * 20}</p>
                                </div>
                              </div>
                              {equip.depositAmount > 0 && (
                                <p className="text-xs text-muted-foreground mb-3">
                                  {language === 'hi' ? 'जमा राशि' : 'Deposit'}: ₹{equip.depositAmount}
                                </p>
                              )}
                              <Button 
                                size="sm" 
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => {
                                  setSelectedEquipment(equip);
                                  setEquipmentRentalForm({
                                    ...equipmentRentalForm,
                                    equipmentId: equip.id,
                                    equipmentName: equip.name
                                  });
                                  setShowEquipmentRentalDialog(true);
                                }}
                                disabled={equip.availableUnits === 0}
                              >
                                {equip.availableUnits === 0 ? (language === 'hi' ? 'उपलब्ध नहीं' : 'Not Available') : (language === 'hi' ? 'किराए पर लें' : 'Rent Now')}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Lab Test Requirements Directory Tab */}
                    <TabsContent value="lab-requirements" className="mt-4 space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-500" />
                            {language === 'hi' ? 'लैब टेस्ट डायरेक्टरी' : 'Lab Test Directory'}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {language === 'hi' ? 'अपनी आवश्यकता जमा करें, नजदीकी लैब आपसे संपर्क करेंगी' : 'Submit your requirement, nearby labs will contact you'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => { fetchLabRequirements('open'); fetchLabTestCategories(); }}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            {language === 'hi' ? 'रिफ्रेश' : 'Refresh'}
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-indigo-500 hover:bg-indigo-600"
                            onClick={() => { 
                              fetchLabTestCategories();
                              setShowLabRequirementDialog(true); 
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {language === 'hi' ? 'आवश्यकता जमा करें' : 'Submit Requirement'}
                          </Button>
                        </div>
                      </div>

                      {/* How it works */}
                      <Card className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-950 dark:to-indigo-950 border-indigo-200">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                            <div className="p-3">
                              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white mx-auto mb-2">
                                <FileText className="h-5 w-5" />
                              </div>
                              <p className="text-sm font-medium">{language === 'hi' ? '1. आवश्यकता जमा करें' : '1. Submit Requirement'}</p>
                              <p className="text-xs text-muted-foreground">{language === 'hi' ? 'टेस्ट चुनें और विवरण भरें' : 'Select tests & fill details'}</p>
                            </div>
                            <div className="p-3">
                              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white mx-auto mb-2">
                                <Building2 className="h-5 w-5" />
                              </div>
                              <p className="text-sm font-medium">{language === 'hi' ? '2. लैब्स प्रतिक्रिया दें' : '2. Labs Respond'}</p>
                              <p className="text-xs text-muted-foreground">{language === 'hi' ? 'नजदीकी लैब्स कोट भेजेंगी' : 'Nearby labs send quotes'}</p>
                            </div>
                            <div className="p-3">
                              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white mx-auto mb-2">
                                <CheckCircle2 className="h-5 w-5" />
                              </div>
                              <p className="text-sm font-medium">{language === 'hi' ? '3. लैब चुनें' : '3. Choose Lab'}</p>
                              <p className="text-xs text-muted-foreground">{language === 'hi' ? 'कीमत और रेटिंग देखकर चुनें' : 'Compare price & ratings'}</p>
                            </div>
                            <div className="p-3">
                              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white mx-auto mb-2">
                                <Trophy className="h-5 w-5" />
                              </div>
                              <p className="text-sm font-medium">{language === 'hi' ? '4. कमाई' : '4. Earn'}</p>
                              <p className="text-xs text-muted-foreground">{language === 'hi' ? 'हर बुकिंग पर 10% कमीशन' : '10% commission per booking'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Test Categories */}
                      {labTestCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {labTestCategories.slice(0, 8).map((cat: any) => (
                            <Badge 
                              key={cat.id} 
                              variant="outline"
                              className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950"
                              onClick={() => {
                                setLabRequirementForm({...labRequirementForm, testCategory: cat.id, tests: cat.tests?.slice(0, 3) || []});
                                setShowLabRequirementDialog(true);
                              }}
                            >
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Open Requirements */}
                      <div className="grid gap-4">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Bell className="h-4 w-4 text-indigo-500" />
                          {language === 'hi' ? 'खुली आवश्यकताएं' : 'Open Requirements'}
                          <Badge variant="secondary">{labRequirements.filter((r: any) => r.status === 'open').length}</Badge>
                        </h4>
                        
                        {labRequirements.length === 0 ? (
                          <Card className="border-dashed">
                            <CardContent className="pt-8 pb-8 text-center">
                              <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                              <p className="text-muted-foreground">
                                {language === 'hi' ? 'कोई खुली आवश्यकता नहीं' : 'No open requirements'}
                              </p>
                              <Button 
                                variant="link" 
                                onClick={() => { fetchLabTestCategories(); setShowLabRequirementDialog(true); }}
                                className="mt-2"
                              >
                                {language === 'hi' ? 'पहली आवश्यकता जमा करें' : 'Submit first requirement'}
                              </Button>
                            </CardContent>
                          </Card>
                        ) : (
                          labRequirements.filter((r: any) => r.status === 'open' || r.status === 'responding').slice(0, 5).map((req: any) => (
                            <Card key={req.id} className="overflow-hidden">
                              <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                      {req.patientName}
                                      {req.urgency === 'urgent' && (
                                        <Badge className="bg-rose-500">{language === 'hi' ? 'तत्काल' : 'Urgent'}</Badge>
                                      )}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                      <MapPin className="h-3 w-3" />
                                      {req.district}, {req.state}
                                    </CardDescription>
                                  </div>
                                  <Badge variant={req.status === 'responding' ? 'default' : 'secondary'}>
                                    {req.status === 'open' ? (language === 'hi' ? 'खुला' : 'Open') : (language === 'hi' ? 'प्रतिक्रिया' : 'Responding')}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {JSON.parse(req.tests || '[]').slice(0, 5).map((test: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">{test}</Badge>
                                  ))}
                                  {JSON.parse(req.tests || '[]').length > 5 && (
                                    <Badge variant="secondary" className="text-xs">+{JSON.parse(req.tests || '[]').length - 5}</Badge>
                                  )}
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(req.createdAt).toLocaleDateString()}
                                  </span>
                                  {req.homeCollection && (
                                    <Badge variant="outline" className="text-xs">{language === 'hi' ? 'होम कलेक्शन' : 'Home Collection'}</Badge>
                                  )}
                                </div>
                                {req.labResponses && JSON.parse(req.labResponses || '[]').length > 0 && (
                                  <Button 
                                    size="sm" 
                                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                                    onClick={() => {
                                      setSelectedLabRequirement(req);
                                      setShowLabResponsesDialog(true);
                                    }}
                                  >
                                    {language === 'hi' ? 'लैब प्रतिक्रियाएं देखें' : 'View Lab Responses'} ({JSON.parse(req.labResponses || '[]').length})
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}

              {/* Health Worker Dashboard */}
              {activeTab === "worker" && isAuthenticated && ['health_worker', 'doctor', 'admin'].includes(user?.role || '') && (
                <motion.div
                  key="worker"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Worker Dashboard</h2>
                      <p className="text-muted-foreground">Manage patients and tasks</p>
                    </div>
                    <Button className="bg-indigo-600">
                      <Plus className="h-4 w-4 mr-1" />
                      New Task
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: "Total Patients", value: "156", icon: Users, color: "text-indigo-500" },
                      { label: "High Risk", value: "12", icon: AlertTriangle, color: "text-rose-600" },
                      { label: "Pending Visits", value: "8", icon: Calendar, color: "text-indigo-600" },
                      { label: "Completed", value: "5", icon: CheckCircle2, color: "text-indigo-600" }
                    ].map((stat, i) => (
                      <Card key={i}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">{stat.label}</p>
                              <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                            <stat.icon className={`h-6 w-6 ${stat.color} opacity-30`} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Alerts */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Bell className="h-5 w-5 text-indigo-600" />
                        Active Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="max-h-[200px]">
                        <div className="space-y-2">
                          {(alerts.length > 0 ? alerts : [
                            { id: '1', title: 'Dengue Outbreak Alert', message: 'Increased cases in area', type: 'outbreak', priority: 'high' },
                            { id: '2', title: 'Vaccination Due', message: 'DPT booster due this week', type: 'vaccination', priority: 'medium' }
                          ]).map((alert) => {
                            const Icon = getAlertIcon(alert.type);
                            return (
                              <div key={alert.id} className="flex items-start gap-2 p-2 rounded border">
                                <div className={`p-1.5 rounded-full ${alert.priority === 'high' ? 'bg-indigo-100' : 'bg-indigo-100'}`}>
                                  <Icon className={`h-3 w-3 ${alert.priority === 'high' ? 'text-indigo-600' : 'text-indigo-600'}`} />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{alert.title}</p>
                                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">{alert.priority}</Badge>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Analytics Dashboard */}
              {activeTab === "analytics" && isAuthenticated && ['health_worker', 'doctor', 'admin'].includes(user?.role || '') && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Health Analytics</h2>
                      <p className="text-muted-foreground">Outbreak prediction and insights</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchAnalytics}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: "Consultations", value: analytics?.stats?.totalConsultations || "2,456", change: "+12%", positive: true },
                      { label: "Emergency Cases", value: analytics?.stats?.emergencyCases || "89", change: "-5%", positive: true },
                      { label: "Vaccinations", value: analytics?.stats?.vaccinations || "1,234", change: "+23%", positive: true },
                      { label: "Outbreak Alerts", value: "3", change: "+2", positive: false }
                    ].map((metric, i) => (
                      <Card key={i}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">{metric.label}</span>
                            {metric.positive ? (
                              <TrendingUp className="h-3 w-3 text-indigo-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-rose-500" />
                            )}
                          </div>
                          <p className="text-xl font-bold">{metric.value}</p>
                          <Badge variant={metric.positive ? "default" : "destructive"} className="text-xs mt-1">
                            {metric.change}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Outbreak Prediction */}
                  <Card className="border-2 border-rose-200 dark:border-rose-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-rose-600 text-lg">
                        <Bug className="h-5 w-5" />
                        AI Outbreak Prediction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(analytics?.outbreakPredictions || [
                          { disease: "Dengue", risk: "High", probability: 78 },
                          { disease: "Malaria", risk: "Moderate", probability: 45 },
                          { disease: "Chikungunya", risk: "Low", probability: 23 }
                        ]).map((outbreak: any, i: number) => (
                          <div key={i} className="p-3 rounded-lg border bg-rose-50/50 dark:bg-rose-950/20">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{outbreak.disease}</p>
                                <Badge className={
                                  outbreak.risk === "High" ? "bg-rose-500" :
                                  outbreak.risk === "Moderate" ? "bg-indigo-500" : "bg-indigo-500"
                                }>
                                  {outbreak.risk}
                                </Badge>
                              </div>
                              <p className="text-xs font-medium">{outbreak.probability}%</p>
                            </div>
                            <Progress value={outbreak.probability} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Doctor Management */}
              {activeTab === "doctors" && isAuthenticated && ['health_worker', 'doctor', 'admin'].includes(user?.role || '') && (
                <motion.div
                  key="doctors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <UserCheck className="h-6 w-6 text-indigo-600" />
                        {language === 'hi' ? 'डॉक्टर प्रबंधन' : 'Doctor Management'}
                      </h2>
                      <p className="text-muted-foreground">
                        {language === 'hi' ? 'डॉक्टर प्रोफाइल, शेड्यूल और उपलब्धता प्रबंधित करें' : 'Manage doctor profiles, schedules, and availability'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder={language === 'hi' ? 'डॉक्टर खोजें...' : 'Search doctors...'} 
                        className="w-48"
                        value={doctorSearchQuery}
                        onChange={(e) => { setDoctorSearchQuery(e.target.value); fetchDoctors(e.target.value); }}
                      />
                      {user?.role === 'admin' && (
                        <Button 
                          className="bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => { resetDoctorForm(); setSelectedDoctorForEdit(null); setShowAddDoctorDialog(true); }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {language === 'hi' ? 'नया डॉक्टर' : 'Add Doctor'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Doctor Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{doctors.length}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'कुल डॉक्टर' : 'Total Doctors'}</p>
                          </div>
                          <Stethoscope className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{doctors.filter(d => d.isAvailableOnline).length}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'ऑनलाइन उपलब्ध' : 'Online Available'}</p>
                          </div>
                          <Activity className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{doctors.filter(d => d.isVerified).length}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'सत्यापित' : 'Verified'}</p>
                          </div>
                          <ShieldCheck className="h-8 w-8 text-indigo-400 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-violet-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{[...new Set(doctors.map(d => d.specialization))].length}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'विशेषज्ञता' : 'Specializations'}</p>
                          </div>
                          <Award className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Filters */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap gap-2">
                        <Select value={specializationFilter} onValueChange={(v) => { setSpecializationFilter(v); fetchDoctors(); }}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder={language === 'hi' ? 'विशेषज्ञता' : 'Specialization'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{language === 'hi' ? 'सभी' : 'All'}</SelectItem>
                            <SelectItem value="General Medicine">{language === 'hi' ? 'सामान्य चिकित्सा' : 'General Medicine'}</SelectItem>
                            <SelectItem value="Pediatrics">{language === 'hi' ? 'बाल रोग' : 'Pediatrics'}</SelectItem>
                            <SelectItem value="Cardiology">{language === 'hi' ? 'हृदय रोग' : 'Cardiology'}</SelectItem>
                            <SelectItem value="Gynecology">{language === 'hi' ? 'स्त्री रोग' : 'Gynecology'}</SelectItem>
                            <SelectItem value="Orthopedics">{language === 'hi' ? 'अस्थि रोग' : 'Orthopedics'}</SelectItem>
                            <SelectItem value="Dermatology">{language === 'hi' ? 'त्वचा रोग' : 'Dermatology'}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={doctorFilter} onValueChange={(v) => { setDoctorFilter(v); fetchDoctors(); }}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder={language === 'hi' ? 'स्थिति' : 'Status'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{language === 'hi' ? 'सभी' : 'All'}</SelectItem>
                            <SelectItem value="active">{language === 'hi' ? 'सक्रिय' : 'Active'}</SelectItem>
                            <SelectItem value="on_leave">{language === 'hi' ? 'छुट्टी पर' : 'On Leave'}</SelectItem>
                            <SelectItem value="online">{language === 'hi' ? 'ऑनलाइन' : 'Online'}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => fetchDoctors()}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          {language === 'hi' ? 'रिफ्रेश' : 'Refresh'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Doctor Cards Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {(doctors.length > 0 ? doctors : [
                      { id: '1', name: 'Dr. Rajesh Kumar', specialization: 'General Medicine', yearsOfExperience: 15, rating: 4.8, consultationFee: 300, videoConsultFee: 500, isAvailableOnline: true, isVerified: true, totalConsultations: 1250, totalPatients: 890, facilityName: 'City Hospital', status: 'active' },
                      { id: '2', name: 'Dr. Priya Sharma', specialization: 'Pediatrics', yearsOfExperience: 10, rating: 4.9, consultationFee: 400, videoConsultFee: 600, isAvailableOnline: true, isVerified: true, totalConsultations: 890, totalPatients: 650, facilityName: 'Children Care Hospital', status: 'active' },
                      { id: '3', name: 'Dr. Amit Verma', specialization: 'Cardiology', yearsOfExperience: 20, rating: 4.7, consultationFee: 800, videoConsultFee: 1000, isAvailableOnline: true, isVerified: true, totalConsultations: 2100, totalPatients: 1200, facilityName: 'Heart Care Center', status: 'active' },
                      { id: '4', name: 'Dr. Sunita Patel', specialization: 'Gynecology', yearsOfExperience: 12, rating: 4.9, consultationFee: 500, videoConsultFee: 700, isAvailableOnline: true, isVerified: true, totalConsultations: 1800, totalPatients: 1100, facilityName: 'Women Wellness Center', status: 'active' },
                      { id: '5', name: 'Dr. Mohammed Khan', specialization: 'Orthopedics', yearsOfExperience: 18, rating: 4.6, consultationFee: 600, videoConsultFee: 800, isAvailableOnline: false, isVerified: true, totalConsultations: 950, totalPatients: 720, facilityName: 'Bone & Joint Hospital', status: 'active' },
                      { id: '6', name: 'Dr. Anjali Reddy', specialization: 'Dermatology', yearsOfExperience: 8, rating: 4.8, consultationFee: 500, videoConsultFee: 700, isAvailableOnline: true, isVerified: true, totalConsultations: 1100, totalPatients: 850, facilityName: 'Skin Care Clinic', status: 'active' }
                    ]).map((doctor) => (
                      <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                {(doctor.name || 'D').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {doctor.name}
                                  {doctor.isVerified && (
                                    <Badge variant="outline" className="text-xs text-indigo-500 border-indigo-300">
                                      <ShieldCheck className="h-3 w-3 mr-1" />
                                      {language === 'hi' ? 'सत्यापित' : 'Verified'}
                                    </Badge>
                                  )}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                  {doctor.specialization} • {doctor.yearsOfExperience} {language === 'hi' ? 'वर्ष' : 'yrs'}
                                </CardDescription>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setSelectedDoctorForEdit(doctor); setShowDoctorProfileDialog(true); }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  {language === 'hi' ? 'प्रोफाइल देखें' : 'View Profile'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openScheduleDialog(doctor)}>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  {language === 'hi' ? 'शेड्यूल प्रबंधित करें' : 'Manage Schedule'}
                                </DropdownMenuItem>
                                {user?.role === 'admin' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => openEditDoctorDialog(doctor)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      {language === 'hi' ? 'संपादित करें' : 'Edit'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-rose-600" onClick={() => deleteDoctor(doctor.id)}>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      {language === 'hi' ? 'निष्क्रिय करें' : 'Deactivate'}
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {/* Stats Row */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-indigo-500 fill-yellow-500" />
                                  {doctor.rating}
                                </span>
                                <span className="text-muted-foreground">|</span>
                                <span className="text-muted-foreground">
                                  <Users className="h-3 w-3 inline mr-1" />
                                  {doctor.totalPatients} {language === 'hi' ? 'रोगी' : 'patients'}
                                </span>
                              </div>
                              <Badge variant={doctor.isAvailableOnline ? "default" : "secondary"} className={doctor.isAvailableOnline ? "bg-indigo-500" : ""}>
                                {doctor.isAvailableOnline 
                                  ? (language === 'hi' ? 'ऑनलाइन' : 'Online')
                                  : (language === 'hi' ? 'ऑफलाइन' : 'Offline')
                                }
                              </Badge>
                            </div>

                            {/* Facility */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-4 w-4" />
                              {doctor.facilityName || 'Not assigned'}
                            </div>

                            {/* Fees */}
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">{language === 'hi' ? 'परामर्श:' : 'Consult:'}</span>
                                <span className="font-semibold ml-1">₹{doctor.consultationFee}</span>
                              </div>
                              {doctor.videoConsultFee && (
                                <div>
                                  <span className="text-muted-foreground">{language === 'hi' ? 'वीडियो:' : 'Video:'}</span>
                                  <span className="font-semibold ml-1">₹{doctor.videoConsultFee}</span>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => openScheduleDialog(doctor)}>
                                <Calendar className="h-4 w-4 mr-1" />
                                {language === 'hi' ? 'शेड्यूल' : 'Schedule'}
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => openScheduleDialog(doctor)}>
                                <Activity className="h-4 w-4 mr-1" />
                                {language === 'hi' ? 'उपलब्धता' : 'Availability'}
                              </Button>
                              <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => { setSelectedDoctorForEdit(doctor); setShowDoctorProfileDialog(true); }}>
                                <Eye className="h-4 w-4 mr-1" />
                                {language === 'hi' ? 'देखें' : 'View'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Schedule Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        {language === 'hi' ? 'आज की उपलब्धता' : "Today's Availability"}
                      </CardTitle>
                      <CardDescription>
                        {language === 'hi' ? 'डॉक्टरों की आज की शेड्यूल स्थिति' : 'Current day schedule status of doctors'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <div className="flex gap-3 pb-2">
                          {(doctors.length > 0 ? doctors.slice(0, 6) : [
                            { id: '1', name: 'Dr. Rajesh Kumar', specialization: 'General Medicine' },
                            { id: '2', name: 'Dr. Priya Sharma', specialization: 'Pediatrics' },
                            { id: '3', name: 'Dr. Amit Verma', specialization: 'Cardiology' }
                          ]).map((doctor) => (
                            <div key={doctor.id} className="flex-shrink-0 w-48 p-3 border rounded-lg cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => openScheduleDialog(doctor)}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                  {(doctor.name || 'D').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium truncate">{doctor.name?.split(' ').slice(0, 2).join(' ')}</p>
                                  <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">09:00 - 13:00</span>
                                  <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">Available</Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">14:00 - 17:00</span>
                                  <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">3 slots</Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* CRM & Enquiries Dashboard */}
              {activeTab === "enquiries" && isAuthenticated && ['health_worker', 'doctor', 'admin'].includes(user?.role || '') && (
                <motion.div
                  key="enquiries"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <MessageCircle className="h-6 w-6 text-indigo-600" />
                        {language === 'hi' ? 'CRM डैशबोर्ड' : 'CRM Dashboard'}
                      </h2>
                      <p className="text-muted-foreground">
                        {language === 'hi' ? 'पूछताछ और रोगी प्रबंधन' : 'Enquiries & Patient Management'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Select value={enquiryStatus} onValueChange={(v) => { setEnquiryStatus(v); fetchEnquiries(v); }}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{language === 'hi' ? 'सभी' : 'All'}</SelectItem>
                          <SelectItem value="pending">{language === 'hi' ? 'लंबित' : 'Pending'}</SelectItem>
                          <SelectItem value="in_progress">{language === 'hi' ? 'प्रगति में' : 'In Progress'}</SelectItem>
                          <SelectItem value="resolved">{language === 'hi' ? 'हल किया' : 'Resolved'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* CRM Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-amber-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{enquiries.filter(e => e.status === 'pending').length}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'लंबित पूछताछ' : 'Pending Enquiries'}</p>
                          </div>
                          <Clock className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{enquiries.filter(e => e.status === 'in_progress').length}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'प्रगति में' : 'In Progress'}</p>
                          </div>
                          <Activity className="h-8 w-8 text-indigo-400 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{enquiries.filter(e => e.status === 'resolved').length}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'हल किया' : 'Resolved'}</p>
                          </div>
                          <CheckCircle2 className="h-8 w-8 text-indigo-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-rose-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{enquiries.filter(e => e.priority === 'urgent').length}</p>
                            <p className="text-xs text-muted-foreground">{language === 'hi' ? 'तत्काल' : 'Urgent'}</p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-rose-500 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Enquiries List */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {language === 'hi' ? 'पूछताछ सूची' : 'Enquiries List'}
                        </CardTitle>
                        <Badge variant="outline">{enquiries.length} {language === 'hi' ? 'कुल' : 'total'}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {enquiries.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>{language === 'hi' ? 'कोई पूछताछ नहीं' : 'No enquiries found'}</p>
                        </div>
                      ) : (
                        <ScrollArea className="max-h-[400px]">
                          <div className="space-y-3">
                            {enquiries.map((enquiry: any) => (
                              <div 
                                key={enquiry.id} 
                                className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => { setSelectedEnquiry(enquiry); setShowEnquiryDialog(true); }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium">{enquiry.name}</p>
                                      <Badge className={`text-xs ${
                                        enquiry.priority === 'urgent' ? 'bg-rose-500' :
                                        enquiry.priority === 'high' ? 'bg-indigo-500' : 'bg-gray-500'
                                      }`}>
                                        {enquiry.priority}
                                      </Badge>
                                      <Badge variant="outline" className={
                                        enquiry.status === 'pending' ? 'border-indigo-500 text-indigo-700' :
                                        enquiry.status === 'in_progress' ? 'border-indigo-400 text-indigo-600' :
                                        enquiry.status === 'resolved' ? 'border-indigo-500 text-indigo-700' : ''
                                      }>
                                        {enquiry.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{enquiry.subject}</p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {enquiry.phone}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDate(enquiry.createdAt)}
                                      </span>
                                      {enquiry.category && (
                                        <Badge variant="secondary" className="text-xs">{enquiry.category}</Badge>
                                      )}
                                    </div>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                                {enquiry.assignedTo && (
                                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {language === 'hi' ? 'सौंपा गया:' : 'Assigned to:'} {enquiry.assignedTo}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Admin Panel */}
              {activeTab === "admin" && isAuthenticated && user?.role === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Admin Panel</h2>
                      <p className="text-muted-foreground">System administration</p>
                    </div>
                  </div>

                  {/* Admin Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: "Total Users", value: "4,521", icon: Users },
                      { label: "Active Sessions", value: "234", icon: Activity },
                      { label: "System Health", value: "98%", icon: Heart },
                      { label: "Pending Tasks", value: "12", icon: ClipboardList }
                    ].map((stat, i) => (
                      <Card key={i}>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2">
                            <stat.icon className="h-5 w-5 text-indigo-600" />
                            <div>
                              <p className="text-xl font-bold">{stat.value}</p>
                              <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Button variant="outline" className="justify-start gap-2">
                          <Users className="h-4 w-4" />
                          Manage Users
                        </Button>
                        <Button variant="outline" className="justify-start gap-2">
                          <Building2 className="h-4 w-4" />
                          Facilities
                        </Button>
                        <Button variant="outline" className="justify-start gap-2">
                          <Shield className="h-4 w-4" />
                          Permissions
                        </Button>
                        <Button variant="outline" className="justify-start gap-2">
                          <Settings className="h-4 w-4" />
                          Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Consultation</DialogTitle>
            <DialogDescription>
              Schedule a video consultation with {selectedDoctor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" id="booking-date" />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason for consultation</Label>
              <Textarea placeholder="Describe your symptoms or concern..." id="booking-reason" />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm">Consultation Fee</span>
                <span className="font-bold text-indigo-600">₹{selectedDoctor?.videoConsultFee || selectedDoctor?.consultationFee || 500}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>Cancel</Button>
            <Button 
              className="bg-indigo-600"
              onClick={() => {
                const date = (document.getElementById('booking-date') as HTMLInputElement)?.value;
                const reason = (document.getElementById('booking-reason') as HTMLTextAreaElement)?.value;
                if (selectedDoctor && date) {
                  bookConsultation(selectedDoctor.id, date, '10:00', reason);
                }
              }}
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medicine Reminder</DialogTitle>
            <DialogDescription>
              Set up daily medicine reminders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Medicine Name</Label>
              <Input placeholder="e.g., Paracetamol" id="reminder-medicine" />
            </div>
            <div className="space-y-2">
              <Label>Dosage</Label>
              <Input placeholder="e.g., 500mg" id="reminder-dosage" />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once daily</SelectItem>
                  <SelectItem value="twice">Twice daily</SelectItem>
                  <SelectItem value="thrice">Three times daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Instructions</Label>
              <Input placeholder="e.g., Take after meals" id="reminder-instructions" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>Cancel</Button>
            <Button 
              className="bg-indigo-600"
              onClick={() => {
                const medicine = (document.getElementById('reminder-medicine') as HTMLInputElement)?.value;
                const dosage = (document.getElementById('reminder-dosage') as HTMLInputElement)?.value;
                const instructions = (document.getElementById('reminder-instructions') as HTMLInputElement)?.value;
                if (medicine) {
                  createReminder({
                    medicineName: medicine,
                    dosage,
                    instructions,
                    frequency: 'twice',
                    times: JSON.stringify(['08:00', '20:00']),
                    startDate: new Date()
                  });
                }
              }}
            >
              Create Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vaccination Dialog */}
      <Dialog open={showVaccinationDialog} onOpenChange={setShowVaccinationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vaccination Record</DialogTitle>
            <DialogDescription>
              Record a new vaccination
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Vaccine Name</Label>
              <Input placeholder="e.g., COVID-19" id="vaccine-name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dose Number</Label>
                <Input type="number" min="1" placeholder="1" id="vaccine-dose" />
              </div>
              <div className="space-y-2">
                <Label>Total Doses</Label>
                <Input type="number" min="1" placeholder="2" id="vaccine-total" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date Administered</Label>
              <Input type="date" id="vaccine-date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVaccinationDialog(false)}>Cancel</Button>
            <Button 
              className="bg-indigo-600"
              onClick={() => {
                const vaccineName = (document.getElementById('vaccine-name') as HTMLInputElement)?.value;
                const doseNumber = parseInt((document.getElementById('vaccine-dose') as HTMLInputElement)?.value || '1');
                const totalDoses = parseInt((document.getElementById('vaccine-total') as HTMLInputElement)?.value || '1');
                const administeredDate = (document.getElementById('vaccine-date') as HTMLInputElement)?.value;
                if (vaccineName && administeredDate) {
                  createVaccination({
                    vaccineName,
                    doseNumber,
                    totalDoses,
                    administeredDate: new Date(administeredDate)
                  });
                }
              }}
            >
              Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scheme Dialog */}
      <Dialog open={showSchemeDialog} onOpenChange={setShowSchemeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedScheme?.name}</DialogTitle>
            <DialogDescription>
              {selectedScheme?.shortDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedScheme?.benefits && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4 text-indigo-600" />
                  Benefits
                </h4>
                <ul className="space-y-1">
                  {selectedScheme.benefits.slice(0, 5).map((benefit, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedScheme?.documents && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  Required Documents
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedScheme.documents.slice(0, 5).map((doc, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{doc}</Badge>
                  ))}
                </div>
              </div>
            )}
            {selectedScheme?.helpline && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                <p className="text-sm">
                  <span className="font-semibold">Helpline:</span> {selectedScheme.helpline}
                </p>
                {selectedScheme.officialWebsite && (
                  <a 
                    href={selectedScheme.officialWebsite} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    Visit Official Website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSchemeDialog(false)}>Close</Button>
            <Button 
              className="bg-indigo-600"
              onClick={() => {
                if (selectedScheme) {
                  applyForScheme(selectedScheme.id);
                  setShowSchemeDialog(false);
                }
              }}
            >
              Apply Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Eligibility Check Dialog */}
      <Dialog open={showEligibilityDialog} onOpenChange={setShowEligibilityDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" />
              {language === 'hi' ? 'पात्रता जाँचें' : 'Check Eligibility'}
            </DialogTitle>
            <DialogDescription>
              {language === 'hi' ? 'अपनी प्रोफाइल भरें और जानें किन योजनाओं के लिए पात्र हैं' : 'Fill your profile to see which schemes you qualify for'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Personal Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'आयु' : 'Age'}</Label>
                <Input 
                  type="number" 
                  value={eligibilityProfile.age}
                  onChange={(e) => setEligibilityProfile({...eligibilityProfile, age: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'लिंग' : 'Gender'}</Label>
                <Select value={eligibilityProfile.gender} onValueChange={(v) => setEligibilityProfile({...eligibilityProfile, gender: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{language === 'hi' ? 'पुरुष' : 'Male'}</SelectItem>
                    <SelectItem value="female">{language === 'hi' ? 'महिला' : 'Female'}</SelectItem>
                    <SelectItem value="other">{language === 'hi' ? 'अन्य' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category & Income */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'सामाजिक वर्ग' : 'Social Category'}</Label>
                <Select value={eligibilityProfile.category} onValueChange={(v) => setEligibilityProfile({...eligibilityProfile, category: v})}>
                  <SelectTrigger><SelectValue placeholder={language === 'hi' ? 'वर्ग चुनें' : 'Select category'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="OBC">OBC</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'आय स्तर' : 'Income Level'}</Label>
                <Select value={eligibilityProfile.income} onValueChange={(v) => setEligibilityProfile({...eligibilityProfile, income: v})}>
                  <SelectTrigger><SelectValue placeholder={language === 'hi' ? 'आय चुनें' : 'Select income'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below_1_lakh">{language === 'hi' ? '₹1 लाख से कम' : 'Below ₹1 Lakh'}</SelectItem>
                    <SelectItem value="1_2_lakh">₹1-2 Lakh</SelectItem>
                    <SelectItem value="2_5_lakh">₹2-5 Lakh</SelectItem>
                    <SelectItem value="above_5_lakh">{language === 'hi' ? '₹5 लाख से अधिक' : 'Above ₹5 Lakh'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location & Family */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'निवास' : 'Residence'}</Label>
                <Select value={eligibilityProfile.rural ? 'rural' : 'urban'} onValueChange={(v) => setEligibilityProfile({...eligibilityProfile, rural: v === 'rural'})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rural">{language === 'hi' ? 'ग्रामीण' : 'Rural'}</SelectItem>
                    <SelectItem value="urban">{language === 'hi' ? 'शहरी' : 'Urban'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'परिवार के सदस्य' : 'Family Size'}</Label>
                <Input 
                  type="number" 
                  value={eligibilityProfile.familySize}
                  onChange={(e) => setEligibilityProfile({...eligibilityProfile, familySize: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>

            {/* BPL Status */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <input 
                type="checkbox" 
                id="bpl-status"
                checked={eligibilityProfile.bplStatus}
                onChange={(e) => setEligibilityProfile({...eligibilityProfile, bplStatus: e.target.checked})}
                className="h-4 w-4"
              />
              <Label htmlFor="bpl-status" className="text-sm">
                {language === 'hi' ? 'गरीबी रेखा से नीचे (BPL)' : 'Below Poverty Line (BPL)'}
              </Label>
            </div>

            {/* Special Conditions */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'विशेष परिस्थितियां' : 'Special Conditions'}</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <input 
                    type="checkbox" 
                    id="has-disability"
                    checked={eligibilityProfile.hasDisability}
                    onChange={(e) => setEligibilityProfile({...eligibilityProfile, hasDisability: e.target.checked})}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="has-disability" className="text-sm">{language === 'hi' ? 'विकलांगता' : 'Disability'}</Label>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <input 
                    type="checkbox" 
                    id="is-pregnant"
                    checked={eligibilityProfile.isPregnant}
                    onChange={(e) => setEligibilityProfile({...eligibilityProfile, isPregnant: e.target.checked})}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is-pregnant" className="text-sm">{language === 'hi' ? 'गर्भवती' : 'Pregnant'}</Label>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <input 
                    type="checkbox" 
                    id="has-children"
                    checked={eligibilityProfile.hasChildren}
                    onChange={(e) => setEligibilityProfile({...eligibilityProfile, hasChildren: e.target.checked})}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="has-children" className="text-sm">{language === 'hi' ? 'बच्चे हैं' : 'Has Children'}</Label>
                </div>
              </div>
            </div>

            {/* Results */}
            {eligibilityResults.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label className="text-base font-semibold">
                  {language === 'hi' ? 'पात्रता परिणाम' : 'Eligibility Results'}
                </Label>
                <ScrollArea className="max-h-[200px]">
                  <div className="space-y-2">
                    {eligibilityResults.map((result: any) => (
                      <div key={result.id} className={`p-3 rounded-lg border ${result.isEligible ? 'border-indigo-200 bg-indigo-50 dark:bg-indigo-950' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={result.isEligible ? "bg-indigo-500" : "bg-gray-500"}>
                              {result.matchScore}%
                            </Badge>
                            <span className="font-medium">{result.name}</span>
                          </div>
                          {result.isEligible && (
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedSchemeForApply(result);
                                setShowSchemeApplyDialog(true);
                                setShowEligibilityDialog(false);
                              }}
                            >
                              {language === 'hi' ? 'आवेदन करें' : 'Apply'}
                            </Button>
                          )}
                        </div>
                        {result.eligibilityReason && (
                          <p className="text-xs text-muted-foreground mt-1">{result.eligibilityReason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEligibilityDialog(false)}>
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={checkEligibility}
              disabled={isCheckingEligibility}
            >
              {isCheckingEligibility ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  {language === 'hi' ? 'जाँच हो रही है...' : 'Checking...'}
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-1" />
                  {language === 'hi' ? 'पात्रता जाँचें' : 'Check Eligibility'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scheme Apply Dialog */}
      <Dialog open={showSchemeApplyDialog} onOpenChange={setShowSchemeApplyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-indigo-600" />
              {language === 'hi' ? 'योजना के लिए आवेदन करें' : 'Apply for Scheme'}
            </DialogTitle>
            <DialogDescription>
              {selectedSchemeForApply?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedSchemeForApply && (
            <div className="py-4 space-y-4">
              {/* Coverage */}
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                <p className="text-sm text-muted-foreground">{language === 'hi' ? 'कवरेज' : 'Coverage'}</p>
                <p className="font-bold text-lg text-indigo-600">{selectedSchemeForApply.coverageAmount}</p>
              </div>

              {/* Benefits */}
              {selectedSchemeForApply.benefits && selectedSchemeForApply.benefits.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{language === 'hi' ? 'लाभ' : 'Benefits'}</Label>
                  <ul className="space-y-1">
                    {selectedSchemeForApply.benefits.slice(0, 4).map((benefit: string, i: number) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Documents */}
              {selectedSchemeForApply.documents && selectedSchemeForApply.documents.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{language === 'hi' ? 'आवश्यक दस्तावेज' : 'Required Documents'}</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSchemeForApply.documents.map((doc: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">{doc}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Groups */}
              {selectedSchemeForApply.targetGroups && selectedSchemeForApply.targetGroups.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{language === 'hi' ? 'लक्षित समूह' : 'Target Groups'}</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSchemeForApply.targetGroups.map((group: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">{group}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg text-sm">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                  <Info className="h-4 w-4" />
                  <span>{language === 'hi' ? 'आवेदन करने के बाद आपको आवश्यक दस्तावेज जमा करने होंगे' : 'After applying, you will need to submit required documents'}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSchemeApplyDialog(false)}>
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => selectedSchemeForApply && applyForScheme(selectedSchemeForApply.id)}
            >
              <FileCheck className="h-4 w-4 mr-1" />
              {language === 'hi' ? 'आवेदन करें' : 'Apply Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Detail Dialog */}
      <Dialog open={showApplicationDetail} onOpenChange={setShowApplicationDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              {language === 'hi' ? 'आवेदन विवरण' : 'Application Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={
                  selectedApplication.status === 'approved' ? 'default' :
                  selectedApplication.status === 'rejected' ? 'destructive' :
                  selectedApplication.status === 'under_review' ? 'secondary' : 'outline'
                } className={selectedApplication.status === 'approved' ? 'bg-indigo-500' : selectedApplication.status === 'submitted' ? 'bg-indigo-500' : ''}>
                  {selectedApplication.status.toUpperCase()}
                </Badge>
                <p className="text-sm text-muted-foreground">{formatDate(selectedApplication.appliedAt || selectedApplication.createdAt)}</p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">{language === 'hi' ? 'योजना' : 'Scheme'}</p>
                <p className="font-semibold">{selectedApplication.scheme?.name || 'Scheme'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'आवेदन आईडी' : 'Application ID'}</p>
                  <p className="font-medium font-mono">{selectedApplication.applicationId || selectedApplication.id.slice(0, 8)}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'एनरोलमेंट आईडी' : 'Enrollment ID'}</p>
                  <p className="font-medium">{selectedApplication.enrollmentId || '-'}</p>
                </div>
              </div>

              {/* Documents */}
              {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{language === 'hi' ? 'दस्तावेज' : 'Documents'}</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.documents.map((doc: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">{doc}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedApplication.status === 'draft' && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => deleteApplication(selectedApplication.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {language === 'hi' ? 'हटाएं' : 'Delete'}
                  </Button>
                  <Button 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => submitApplication(selectedApplication.id)}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    {language === 'hi' ? 'जमा करें' : 'Submit'}
                  </Button>
                </div>
              )}

              {selectedApplication.status === 'approved' && selectedApplication.enrollmentId && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    {language === 'hi' ? 'बधाई! आपका आवेदन स्वीकृत हो गया है।' : 'Congratulations! Your application has been approved.'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'hi' ? 'एनरोलमेंट आईडी: ' : 'Enrollment ID: '}{selectedApplication.enrollmentId}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplicationDetail(false)}>
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Post Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'hi' ? 'नई पोस्ट बनाएं' : 'Create New Post'}</DialogTitle>
            <DialogDescription>
              {language === 'hi' ? 'समुदाय के साथ अपना अनुभव साझा करें' : 'Share your experience with the community'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'शीर्षक' : 'Title'}</Label>
              <Input placeholder={language === 'hi' ? 'अपना शीर्षक लिखें...' : 'Enter your title...'} id="post-title" />
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'श्रेणी' : 'Category'}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'hi' ? 'श्रेणी चुनें' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{language === 'hi' ? 'सामान्य' : 'General'}</SelectItem>
                  <SelectItem value="pregnancy">{language === 'hi' ? 'गर्भावस्था' : 'Pregnancy'}</SelectItem>
                  <SelectItem value="child_health">{language === 'hi' ? 'बाल स्वास्थ्य' : 'Child Health'}</SelectItem>
                  <SelectItem value="chronic_disease">{language === 'hi' ? 'पुरानी बीमारी' : 'Chronic Disease'}</SelectItem>
                  <SelectItem value="mental_health">{language === 'hi' ? 'मानसिक स्वास्थ्य' : 'Mental Health'}</SelectItem>
                  <SelectItem value="nutrition">{language === 'hi' ? 'पोषण' : 'Nutrition'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'विवरण' : 'Content'}</Label>
              <Textarea placeholder={language === 'hi' ? 'अपना विवरण लिखें...' : 'Write your content...'} id="post-content" rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostDialog(false)}>
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button 
              className="bg-indigo-600"
              onClick={() => {
                const title = (document.getElementById('post-title') as HTMLInputElement)?.value;
                const content = (document.getElementById('post-content') as HTMLTextAreaElement)?.value;
                const categorySelect = document.querySelector('[data-state]') as HTMLElement;
                const category = 'general'; // Default category
                if (title && content) {
                  createForumPost(title, content, category);
                } else {
                  toast.error(language === 'hi' ? 'सभी फ़ील्ड भरें' : 'Fill all fields');
                }
              }}
            >
              {language === 'hi' ? 'पोस्ट करें' : 'Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Detail Dialog */}
      <Dialog open={showPostDetail} onOpenChange={setShowPostDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Badge variant="outline">{selectedPost?.category}</Badge>
              <span className="text-xs">{selectedPost?.authorName} • {selectedPost?.createdAt ? formatDate(selectedPost.createdAt) : ''}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">{selectedPost?.content}</p>
            <Separator />
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => selectedPost && likeForumPost(selectedPost.id)}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {selectedPost?.likesCount || 0}
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-1" />
                {selectedPost?.repliesCount || 0}
              </Button>
            </div>
            <Separator />
            
            {/* Replies Section */}
            <div>
              <h4 className="font-semibold mb-3">{language === 'hi' ? 'जवाब' : 'Replies'}</h4>
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-3">
                  {(selectedPost?.replies || [
                    { id: '1', content: 'धन्यवाद, यह जानकारी बहुत उपयोगी है!', authorName: 'रवि', createdAt: new Date() },
                    { id: '2', content: 'मुझे भी यही समस्या है। डॉक्टर से मिलना चाहिए।', authorName: 'नीता', createdAt: new Date() }
                  ]).map((reply: any) => (
                    <div key={reply.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">
                          {reply.authorName?.charAt(0) || 'A'}
                        </div>
                        <span className="text-sm font-medium">{reply.authorName}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{reply.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Add Reply */}
              {isAuthenticated && (
                <div className="flex gap-2 mt-3">
                  <Input placeholder={language === 'hi' ? 'अपना जवाब लिखें...' : 'Write your reply...'} id="reply-content" />
                  <Button 
                    className="bg-indigo-600"
                    onClick={() => {
                      const content = (document.getElementById('reply-content') as HTMLInputElement)?.value;
                      if (content && selectedPost) {
                        addReply(selectedPost.id, content);
                        (document.getElementById('reply-content') as HTMLInputElement).value = '';
                      }
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Volunteer Registration Dialog */}
      <Dialog open={showVolunteerDialog} onOpenChange={setShowVolunteerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'hi' ? 'स्वयंसेवक बनें' : 'Become a Volunteer'}</DialogTitle>
            <DialogDescription>
              {language === 'hi' ? 'स्वास्थ्य सेवाओं में योगदान दें' : 'Contribute to health services'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'नाम' : 'Name'}</Label>
              <Input placeholder={language === 'hi' ? 'अपना नाम' : 'Your name'} id="vol-name" defaultValue={user?.name || ''} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'फोन नंबर' : 'Phone Number'}</Label>
              <Input placeholder={language === 'hi' ? 'फोन नंबर' : 'Phone number'} id="vol-phone" defaultValue={user?.phone || ''} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'कौशल' : 'Skills'}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'hi' ? 'कौशल चुनें' : 'Select skills'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_aid">{language === 'hi' ? 'प्राथमिक चिकित्सा' : 'First Aid'}</SelectItem>
                  <SelectItem value="counseling">{language === 'hi' ? 'परामर्श' : 'Counseling'}</SelectItem>
                  <SelectItem value="transport">{language === 'hi' ? 'परिवहन' : 'Transport'}</SelectItem>
                  <SelectItem value="translation">{language === 'hi' ? 'अनुवाद' : 'Translation'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'उपलब्धता' : 'Availability'}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'hi' ? 'उपलब्धता चुनें' : 'Select availability'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekdays">{language === 'hi' ? 'सप्ताह के दिन' : 'Weekdays'}</SelectItem>
                  <SelectItem value="weekends">{language === 'hi' ? 'सप्ताहांत' : 'Weekends'}</SelectItem>
                  <SelectItem value="evenings">{language === 'hi' ? 'शाम' : 'Evenings'}</SelectItem>
                  <SelectItem value="flexible">{language === 'hi' ? 'लचीला' : 'Flexible'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'जिला' : 'District'}</Label>
              <Input placeholder={language === 'hi' ? 'जिला' : 'District'} id="vol-district" defaultValue={user?.district || ''} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVolunteerDialog(false)}>
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button 
              className="bg-rose-600"
              onClick={() => {
                const name = (document.getElementById('vol-name') as HTMLInputElement)?.value;
                const phone = (document.getElementById('vol-phone') as HTMLInputElement)?.value;
                const district = (document.getElementById('vol-district') as HTMLInputElement)?.value;
                if (name && phone) {
                  registerAsVolunteer({
                    name,
                    phone,
                    district,
                    skills: 'first_aid',
                    availability: 'flexible'
                  });
                } else {
                  toast.error(language === 'hi' ? 'सभी फ़ील्ड भरें' : 'Fill all fields');
                }
              }}
            >
              {language === 'hi' ? 'पंजीकरण करें' : 'Register'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enquiry Detail Dialog */}
      <Dialog open={showEnquiryDialog} onOpenChange={setShowEnquiryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-indigo-600" />
              {language === 'hi' ? 'पूछताछ विवरण' : 'Enquiry Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedEnquiry?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">{language === 'hi' ? 'नाम' : 'Name'}</p>
                <p className="font-medium">{selectedEnquiry?.name}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">{language === 'hi' ? 'फोन' : 'Phone'}</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{selectedEnquiry?.phone}</p>
                  <a href={`tel:${selectedEnquiry?.phone}`}>
                    <Button size="sm" variant="outline" className="h-7 px-2">
                      <Phone className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'स्थिति' : 'Status'}</Label>
                <Select 
                  value={selectedEnquiry?.status || 'pending'}
                  onValueChange={(v) => setSelectedEnquiry(prev => prev ? { ...prev, status: v } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{language === 'hi' ? 'लंबित' : 'Pending'}</SelectItem>
                    <SelectItem value="in_progress">{language === 'hi' ? 'प्रगति में' : 'In Progress'}</SelectItem>
                    <SelectItem value="resolved">{language === 'hi' ? 'हल किया' : 'Resolved'}</SelectItem>
                    <SelectItem value="closed">{language === 'hi' ? 'बंद' : 'Closed'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'प्राथमिकता' : 'Priority'}</Label>
                <Select 
                  value={selectedEnquiry?.priority || 'normal'}
                  onValueChange={(v) => setSelectedEnquiry(prev => prev ? { ...prev, priority: v } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{language === 'hi' ? 'कम' : 'Low'}</SelectItem>
                    <SelectItem value="normal">{language === 'hi' ? 'सामान्य' : 'Normal'}</SelectItem>
                    <SelectItem value="high">{language === 'hi' ? 'उच्च' : 'High'}</SelectItem>
                    <SelectItem value="urgent">{language === 'hi' ? 'तत्काल' : 'Urgent'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Message */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{language === 'hi' ? 'संदेश' : 'Message'}</p>
              <p className="text-sm">{selectedEnquiry?.message}</p>
            </div>

            {/* Resolution Notes */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'फॉलो-अप नोट्स' : 'Follow-up Notes'}</Label>
              <Textarea 
                placeholder={language === 'hi' ? 'फॉलो-अप नोट्स यहाँ लिखें...' : 'Enter follow-up notes here...'}
                id="enquiry-resolution"
                defaultValue={selectedEnquiry?.resolution || ''}
                rows={3}
              />
            </div>

            {/* Previous Follow-ups */}
            {selectedEnquiry?.followUps && selectedEnquiry.followUps.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">{language === 'hi' ? 'पिछले फॉलो-अप' : 'Previous Follow-ups'}</p>
                <ScrollArea className="max-h-[150px]">
                  <div className="space-y-2">
                    {selectedEnquiry.followUps.map((followUp: any, i: number) => (
                      <div key={i} className="p-2 bg-muted/50 rounded-lg text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{followUp.staffName}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(followUp.createdAt)}</span>
                        </div>
                        <p className="text-muted-foreground">{followUp.notes}</p>
                        {followUp.actionTaken && (
                          <Badge variant="outline" className="mt-1 text-xs">{followUp.actionTaken}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEnquiryDialog(false)}>
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                if (selectedEnquiry) {
                  updateEnquiry(selectedEnquiry.id, {
                    status: 'in_progress',
                    assignedTo: user?.id,
                    staffId: user?.id,
                    staffName: user?.name
                  });
                }
              }}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              {language === 'hi' ? 'स्वयं सौंपें' : 'Assign to Me'}
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                const resolution = (document.getElementById('enquiry-resolution') as HTMLTextAreaElement)?.value;
                if (selectedEnquiry) {
                  updateEnquiry(selectedEnquiry.id, {
                    status: selectedEnquiry.status,
                    priority: selectedEnquiry.priority,
                    resolution,
                    staffId: user?.id,
                    staffName: user?.name
                  });
                }
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {language === 'hi' ? 'अपडेट करें' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Doctor Management Dialogs */}
      {/* Add/Edit Doctor Dialog */}
      <Dialog open={showAddDoctorDialog} onOpenChange={setShowAddDoctorDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-indigo-600" />
              {selectedDoctorForEdit ? (language === 'hi' ? 'डॉक्टर संपादित करें' : 'Edit Doctor') : (language === 'hi' ? 'नया डॉक्टर जोड़ें' : 'Add New Doctor')}
            </DialogTitle>
            <DialogDescription>
              {language === 'hi' ? 'डॉक्टर की जानकारी भरें' : 'Fill in the doctor\'s information'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'नाम *' : 'Name *'}</Label>
                <Input value={doctorForm.name} onChange={(e) => setDoctorForm({...doctorForm, name: e.target.value})} placeholder="Dr. Name" />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'फोन *' : 'Phone *'}</Label>
                <Input value={doctorForm.phone} onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})} placeholder="10-digit number" maxLength={10} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'ईमेल' : 'Email'}</Label>
                <Input type="email" value={doctorForm.email} onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})} placeholder="doctor@hospital.com" />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'विशेषज्ञता *' : 'Specialization *'}</Label>
                <Select value={doctorForm.specialization} onValueChange={(v) => setDoctorForm({...doctorForm, specialization: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Medicine">General Medicine</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Gynecology">Gynecology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Dermatology">Dermatology</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'परामर्श शुल्क' : 'Consultation Fee'}</Label>
                <Input type="number" value={doctorForm.consultationFee} onChange={(e) => setDoctorForm({...doctorForm, consultationFee: parseInt(e.target.value) || 0})} placeholder="300" />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'वीडियो शुल्क' : 'Video Fee'}</Label>
                <Input type="number" value={doctorForm.videoConsultFee} onChange={(e) => setDoctorForm({...doctorForm, videoConsultFee: parseInt(e.target.value) || 0})} placeholder="500" />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'अनुभव (वर्ष)' : 'Experience (yrs)'}</Label>
                <Input type="number" value={doctorForm.yearsOfExperience} onChange={(e) => setDoctorForm({...doctorForm, yearsOfExperience: parseInt(e.target.value) || 0})} placeholder="10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'पंजीकरण संख्या' : 'Registration Number'}</Label>
                <Input value={doctorForm.registrationNumber} onChange={(e) => setDoctorForm({...doctorForm, registrationNumber: e.target.value})} placeholder="Medical Council Reg." />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'अस्पताल/क्लिनिक' : 'Hospital/Clinic'}</Label>
                <Input value={doctorForm.facilityName} onChange={(e) => setDoctorForm({...doctorForm, facilityName: e.target.value})} placeholder="Facility name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'परिचय' : 'Bio'}</Label>
              <Textarea value={doctorForm.bio} onChange={(e) => setDoctorForm({...doctorForm, bio: e.target.value})} placeholder="Brief introduction..." rows={2} />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="onlineCheck" checked={doctorForm.isAvailableOnline} onChange={(e) => setDoctorForm({...doctorForm, isAvailableOnline: e.target.checked})} className="h-4 w-4" />
                <Label htmlFor="onlineCheck" className="text-sm">{language === 'hi' ? 'ऑनलाइन उपलब्ध' : 'Available Online'}</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="inpersonCheck" checked={doctorForm.isAvailableInPerson} onChange={(e) => setDoctorForm({...doctorForm, isAvailableInPerson: e.target.checked})} className="h-4 w-4" />
                <Label htmlFor="inpersonCheck" className="text-sm">{language === 'hi' ? 'व्यक्तिगत उपलब्ध' : 'Available In-Person'}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDoctorDialog(false)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={selectedDoctorForEdit ? updateDoctor : createDoctor}>
              {selectedDoctorForEdit ? (language === 'hi' ? 'अपडेट करें' : 'Update') : (language === 'hi' ? 'जोड़ें' : 'Add Doctor')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Doctor Schedule Management Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              {language === 'hi' ? 'शेड्यूल प्रबंधन' : 'Schedule Management'}
              {selectedDoctorForEdit && <span className="text-muted-foreground font-normal">- {selectedDoctorForEdit.name}</span>}
            </DialogTitle>
            <DialogDescription>
              {language === 'hi' ? 'साप्ताहिक शेड्यूल और छुट्टियाँ प्रबंधित करें' : 'Manage weekly schedule and leaves'}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDoctorData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="py-4 space-y-6">
              {/* Weekly Schedule */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {language === 'hi' ? 'साप्ताहिक शेड्यूल' : 'Weekly Schedule'}
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">{language === 'hi' ? 'दिन' : 'Day'}</th>
                        <th className="p-2 text-left">{language === 'hi' ? 'प्रारंभ' : 'Start'}</th>
                        <th className="p-2 text-left">{language === 'hi' ? 'समाप्त' : 'End'}</th>
                        <th className="p-2 text-left">{language === 'hi' ? 'ब्रेक' : 'Break'}</th>
                        <th className="p-2 text-center">{language === 'hi' ? 'सक्रिय' : 'Active'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => {
                        const daySchedule = doctorSchedule.find((s: any) => s.dayOfWeek === idx) || { startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: idx !== 0 && idx !== 6 };
                        return (
                          <tr key={day} className="border-t">
                            <td className="p-2 font-medium">{day}</td>
                            <td className="p-2"><Input type="time" defaultValue={daySchedule.startTime} className="w-28 h-8" id={`start-${idx}`} /></td>
                            <td className="p-2"><Input type="time" defaultValue={daySchedule.endTime} className="w-28 h-8" id={`end-${idx}`} /></td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                <Input type="time" defaultValue={daySchedule.breakStart} className="w-24 h-8" id={`break-start-${idx}`} />
                                <span className="text-muted-foreground self-center">-</span>
                                <Input type="time" defaultValue={daySchedule.breakEnd} className="w-24 h-8" id={`break-end-${idx}`} />
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <input type="checkbox" defaultChecked={daySchedule.isActive} className="h-4 w-4" id={`active-${idx}`} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Button 
                  className="mt-3 bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => {
                    const schedules = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => ({
                      dayOfWeek: idx,
                      startTime: (document.getElementById(`start-${idx}`) as HTMLInputElement)?.value || '09:00',
                      endTime: (document.getElementById(`end-${idx}`) as HTMLInputElement)?.value || '17:00',
                      breakStart: (document.getElementById(`break-start-${idx}`) as HTMLInputElement)?.value || '13:00',
                      breakEnd: (document.getElementById(`break-end-${idx}`) as HTMLInputElement)?.value || '14:00',
                      isActive: (document.getElementById(`active-${idx}`) as HTMLInputElement)?.checked || false
                    }));
                    if (selectedDoctorForEdit) updateDoctorSchedule(selectedDoctorForEdit.id, schedules);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {language === 'hi' ? 'शेड्यूल सहेजें' : 'Save Schedule'}
                </Button>
              </div>

              {/* Leave Management */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {language === 'hi' ? 'छुट्टियाँ' : 'Leaves & Time Off'}
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setShowLeaveDialog(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    {language === 'hi' ? 'छुट्टी जोड़ें' : 'Add Leave'}
                  </Button>
                </div>
                
                {doctorLeaves.length > 0 ? (
                  <div className="space-y-2">
                    {doctorLeaves.slice(0, 5).map((leave: any) => (
                      <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</p>
                          <p className="text-sm text-muted-foreground">{leave.reason || leave.leaveType}</p>
                        </div>
                        <Badge variant={leave.status === 'approved' ? 'default' : leave.status === 'pending' ? 'secondary' : 'destructive'}>
                          {leave.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm p-4 border rounded-lg text-center">
                    {language === 'hi' ? 'कोई छुट्टी निर्धारित नहीं' : 'No leaves scheduled'}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Leave Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'hi' ? 'छुट्टी जोड़ें' : 'Add Leave'}</DialogTitle>
            <DialogDescription>{language === 'hi' ? 'डॉक्टर की छुट्टी की जानकारी' : 'Doctor\'s leave details'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'प्रारंभ तिथि' : 'Start Date'}</Label>
                <Input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'समाप्ति तिथि' : 'End Date'}</Label>
                <Input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'छुट्टी का प्रकार' : 'Leave Type'}</Label>
              <Select value={leaveForm.leaveType} onValueChange={(v) => setLeaveForm({...leaveForm, leaveType: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_day">{language === 'hi' ? 'पूरा दिन' : 'Full Day'}</SelectItem>
                  <SelectItem value="half_day_morning">{language === 'hi' ? 'आधा दिन (सुबह)' : 'Half Day (Morning)'}</SelectItem>
                  <SelectItem value="half_day_evening">{language === 'hi' ? 'आधा दिन (शाम)' : 'Half Day (Evening)'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'कारण' : 'Reason'}</Label>
              <Textarea value={leaveForm.reason} onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})} placeholder="Optional reason..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
            <Button className="bg-indigo-600" onClick={() => selectedDoctorForEdit && createDoctorLeave(selectedDoctorForEdit.id)}>
              {language === 'hi' ? 'जोड़ें' : 'Add Leave'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Doctor Profile Dialog */}
      <Dialog open={showDoctorProfileDialog} onOpenChange={setShowDoctorProfileDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              {language === 'hi' ? 'डॉक्टर प्रोफाइल' : 'Doctor Profile'}
            </DialogTitle>
          </DialogHeader>
          {selectedDoctorForEdit && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                  {selectedDoctorForEdit.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedDoctorForEdit.name}</h3>
                  <p className="text-muted-foreground">{selectedDoctorForEdit.specialization}</p>
                  {selectedDoctorForEdit.isVerified && (
                    <Badge variant="outline" className="text-indigo-500 border-indigo-300 mt-1">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      {language === 'hi' ? 'सत्यापित' : 'Verified'}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{selectedDoctorForEdit.rating || '-'}</p>
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'रेटिंग' : 'Rating'}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{selectedDoctorForEdit.totalPatients || 0}</p>
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'रोगी' : 'Patients'}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{selectedDoctorForEdit.yearsOfExperience || 0}</p>
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'वर्ष' : 'Years'}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedDoctorForEdit.phone}</span>
                </div>
                {selectedDoctorForEdit.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedDoctorForEdit.email}</span>
                  </div>
                )}
                {selectedDoctorForEdit.facilityName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedDoctorForEdit.facilityName}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{language === 'hi' ? 'परामर्श:' : 'Consult:'}</span>
                  <span className="font-semibold ml-1">₹{selectedDoctorForEdit.consultationFee}</span>
                </div>
                {selectedDoctorForEdit.videoConsultFee && (
                  <div>
                    <span className="text-muted-foreground">{language === 'hi' ? 'वीडियो:' : 'Video:'}</span>
                    <span className="font-semibold ml-1">₹{selectedDoctorForEdit.videoConsultFee}</span>
                  </div>
                )}
              </div>

              {selectedDoctorForEdit.bio && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="text-muted-foreground">{selectedDoctorForEdit.bio}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDoctorProfileDialog(false)}>
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </Button>
            {user?.role === 'admin' && selectedDoctorForEdit && (
              <Button className="bg-indigo-600" onClick={() => { setShowDoctorProfileDialog(false); openEditDoctorDialog(selectedDoctorForEdit); }}>
                <Edit className="h-4 w-4 mr-1" />
                {language === 'hi' ? 'संपादित करें' : 'Edit'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Booking Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              {language === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment'}
            </DialogTitle>
            <DialogDescription>
              {language === 'hi' ? 'डॉक्टर और समय चुनें' : 'Select doctor and time slot'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Doctor Selection */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'डॉक्टर चुनें *' : 'Select Doctor *'}</Label>
              <Select value={appointmentForm.doctorId} onValueChange={(v) => setAppointmentForm({...appointmentForm, doctorId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'hi' ? 'डॉक्टर चुनें' : 'Select a doctor'} />
                </SelectTrigger>
                <SelectContent>
                  {doctors.filter(d => d.isAvailableOnline).map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization} (₹{doctor.videoConsultFee || doctor.consultationFee})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'रोगी का नाम' : 'Patient Name'}</Label>
                <Input value={appointmentForm.patientName} onChange={(e) => setAppointmentForm({...appointmentForm, patientName: e.target.value})} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'फोन नंबर' : 'Phone Number'}</Label>
                <Input value={appointmentForm.patientPhone} onChange={(e) => setAppointmentForm({...appointmentForm, patientPhone: e.target.value})} placeholder="10-digit number" maxLength={10} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'आयु' : 'Age'}</Label>
                <Input type="number" value={appointmentForm.patientAge} onChange={(e) => setAppointmentForm({...appointmentForm, patientAge: e.target.value})} placeholder="Age" />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'लिंग' : 'Gender'}</Label>
                <Select value={appointmentForm.patientGender} onValueChange={(v) => setAppointmentForm({...appointmentForm, patientGender: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{language === 'hi' ? 'पुरुष' : 'Male'}</SelectItem>
                    <SelectItem value="female">{language === 'hi' ? 'महिला' : 'Female'}</SelectItem>
                    <SelectItem value="other">{language === 'hi' ? 'अन्य' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'अपॉइंटमेंट प्रकार' : 'Appointment Type'}</Label>
                <Select value={appointmentForm.type} onValueChange={(v) => setAppointmentForm({...appointmentForm, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkup">{language === 'hi' ? 'जांच' : 'Checkup'}</SelectItem>
                    <SelectItem value="followup">{language === 'hi' ? 'फॉलो-अप' : 'Follow-up'}</SelectItem>
                    <SelectItem value="consultation">{language === 'hi' ? 'परामर्श' : 'Consultation'}</SelectItem>
                    <SelectItem value="vaccination">{language === 'hi' ? 'टीकाकरण' : 'Vaccination'}</SelectItem>
                    <SelectItem value="emergency">{language === 'hi' ? 'आपातकालीन' : 'Emergency'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'तारीख *' : 'Date *'}</Label>
                <Input 
                  type="date" 
                  value={appointmentForm.appointmentDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setAppointmentForm({...appointmentForm, appointmentDate: e.target.value, appointmentTime: ''});
                    if (appointmentForm.doctorId && e.target.value) {
                      fetchAvailableSlots(appointmentForm.doctorId, e.target.value);
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'समय *' : 'Time *'}</Label>
                {isLoadingSlots ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">{language === 'hi' ? 'स्लॉट लोड हो रहे...' : 'Loading slots...'}</span>
                  </div>
                ) : (
                  <Select value={appointmentForm.appointmentTime} onValueChange={(v) => setAppointmentForm({...appointmentForm, appointmentTime: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'hi' ? 'समय चुनें' : 'Select time'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.length > 0 ? availableSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.startTime}>
                          {slot.startTime} - {slot.endTime}
                        </SelectItem>
                      )) : (
                        <SelectItem value="no-slots" disabled>
                          {language === 'hi' ? 'कोई स्लॉट उपलब्ध नहीं' : 'No slots available'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Consultation Mode */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'परामर्श मोड' : 'Consultation Mode'}</Label>
              <div className="flex gap-4">
                {[
                  { value: 'in_person', label: language === 'hi' ? 'व्यक्तिगत' : 'In-Person', icon: User },
                  { value: 'video', label: language === 'hi' ? 'वीडियो कॉल' : 'Video Call', icon: Activity },
                  { value: 'audio', label: language === 'hi' ? 'ऑडियो कॉल' : 'Audio Call', icon: Phone }
                ].map((mode) => (
                  <Button
                    key={mode.value}
                    type="button"
                    variant={appointmentForm.mode === mode.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAppointmentForm({...appointmentForm, mode: mode.value})}
                    className={appointmentForm.mode === mode.value ? "bg-indigo-500" : ""}
                  >
                    <mode.icon className="h-4 w-4 mr-1" />
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'अपॉइंटमेंट का कारण' : 'Reason for Appointment'}</Label>
              <Textarea 
                value={appointmentForm.reason} 
                onChange={(e) => setAppointmentForm({...appointmentForm, reason: e.target.value})} 
                placeholder={language === 'hi' ? 'लक्षण या कारण बताएं...' : 'Describe symptoms or reason...'} 
                rows={2} 
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'अतिरिक्त नोट' : 'Additional Notes'}</Label>
              <Textarea 
                value={appointmentForm.notes} 
                onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})} 
                placeholder={language === 'hi' ? 'कोई विशेष निर्देश...' : 'Any special instructions...'} 
                rows={2} 
              />
            </div>

            {/* Fee Display */}
            {appointmentForm.doctorId && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{language === 'hi' ? 'परामर्श शुल्क' : 'Consultation Fee'}</span>
                  <span className="font-bold text-indigo-500">
                    ₹{doctors.find(d => d.id === appointmentForm.doctorId)?.videoConsultFee || 
                       doctors.find(d => d.id === appointmentForm.doctorId)?.consultationFee || 0}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppointmentDialog(false)}>
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button className="bg-indigo-500 hover:bg-indigo-600" onClick={createAppointment}>
              {language === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Detail Dialog */}
      <Dialog open={showAppointmentDetail} onOpenChange={setShowAppointmentDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              {language === 'hi' ? 'अपॉइंटमेंट विवरण' : 'Appointment Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={
                  selectedAppointment.status === 'confirmed' ? 'default' :
                  selectedAppointment.status === 'completed' ? 'secondary' :
                  selectedAppointment.status === 'cancelled' ? 'destructive' : 'outline'
                } className={selectedAppointment.status === 'confirmed' ? 'bg-indigo-500' : ''}>
                  {selectedAppointment.status.toUpperCase()}
                </Badge>
                {selectedAppointment.confirmationCode && (
                  <p className="text-sm text-muted-foreground font-mono">
                    #{selectedAppointment.confirmationCode}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs">{language === 'hi' ? 'तारीख' : 'Date'}</p>
                  <p className="font-semibold">{formatDate(selectedAppointment.appointmentDate)}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs">{language === 'hi' ? 'समय' : 'Time'}</p>
                  <p className="font-semibold">{selectedAppointment.appointmentTime}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs">{language === 'hi' ? 'प्रकार' : 'Type'}</p>
                  <p className="font-semibold capitalize">{selectedAppointment.type}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs">{language === 'hi' ? 'मोड' : 'Mode'}</p>
                  <p className="font-semibold capitalize">{selectedAppointment.mode?.replace('_', ' ')}</p>
                </div>
              </div>

              {selectedAppointment.reason && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs mb-1">{language === 'hi' ? 'कारण' : 'Reason'}</p>
                  <p className="text-sm">{selectedAppointment.reason}</p>
                </div>
              )}

              {selectedAppointment.patient && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-xs mb-1">{language === 'hi' ? 'रोगी' : 'Patient'}</p>
                  <p className="font-medium">{selectedAppointment.patient.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.patient.phone}</p>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                <span className="text-sm">{language === 'hi' ? 'शुल्क' : 'Fee'}</span>
                <span className="font-bold text-indigo-500">₹{selectedAppointment.fee || 0}</span>
              </div>

              {/* Action Buttons based on status */}
              {['scheduled', 'confirmed'].includes(selectedAppointment.status) && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'cancel', { cancelledBy: user?.id })}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </Button>
                  <Button 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'confirm')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {language === 'hi' ? 'पुष्टि करें' : 'Confirm'}
                  </Button>
                </div>
              )}

              {selectedAppointment.status === 'completed' && !selectedAppointment.patientRating && (
                <div className="space-y-2">
                  <Label>{language === 'hi' ? 'रेटिंग दें' : 'Rate this appointment'}</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="icon"
                        onClick={() => updateAppointmentStatus(selectedAppointment.id, 'rate', { patientRating: star })}
                      >
                        <Star className="h-6 w-6 text-indigo-500" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppointmentDetail(false)}>
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Health Record Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              {language === 'hi' ? 'चिकित्सा रिकॉर्ड जोड़ें' : 'Add Medical Record'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Record Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'रिकॉर्ड प्रकार *' : 'Record Type *'}</Label>
                <Select value={recordForm.type} onValueChange={(v) => setRecordForm({...recordForm, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prescription">{language === 'hi' ? 'प्रिस्क्रिप्शन' : 'Prescription'}</SelectItem>
                    <SelectItem value="lab_report">{language === 'hi' ? 'लैब रिपोर्ट' : 'Lab Report'}</SelectItem>
                    <SelectItem value="vitals">{language === 'hi' ? 'वाइटल्स' : 'Vitals'}</SelectItem>
                    <SelectItem value="imaging">{language === 'hi' ? 'इमेजिंग' : 'Imaging'}</SelectItem>
                    <SelectItem value="discharge_summary">{language === 'hi' ? 'डिस्चार्ज सारांश' : 'Discharge Summary'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'तारीख' : 'Date'}</Label>
                <Input type="date" value={recordForm.recordDate} onChange={(e) => setRecordForm({...recordForm, recordDate: e.target.value})} />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'शीर्षक *' : 'Title *'}</Label>
              <Input value={recordForm.title} onChange={(e) => setRecordForm({...recordForm, title: e.target.value})} placeholder="Record title" />
            </div>

            {/* Doctor & Facility */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'डॉक्टर' : 'Doctor'}</Label>
                <Input value={recordForm.doctorName} onChange={(e) => setRecordForm({...recordForm, doctorName: e.target.value})} placeholder="Doctor name" />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'अस्पताल/प्रयोगशाला' : 'Facility/Lab'}</Label>
                <Input value={recordForm.facilityName} onChange={(e) => setRecordForm({...recordForm, facilityName: e.target.value})} placeholder="Facility name" />
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'निदान' : 'Diagnosis'}</Label>
              <Input value={recordForm.diagnosis} onChange={(e) => setRecordForm({...recordForm, diagnosis: e.target.value})} placeholder="Primary diagnosis" />
            </div>

            {/* Vitals Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{language === 'hi' ? 'वाइटल साइन्स' : 'Vital Signs'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">BP {language === 'hi' ? 'सिस्टोलिक' : 'Systolic'}</Label>
                    <Input value={recordForm.bloodPressureSystolic} onChange={(e) => setRecordForm({...recordForm, bloodPressureSystolic: e.target.value})} placeholder="120" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">BP {language === 'hi' ? 'डायस्टोलिक' : 'Diastolic'}</Label>
                    <Input value={recordForm.bloodPressureDiastolic} onChange={(e) => setRecordForm({...recordForm, bloodPressureDiastolic: e.target.value})} placeholder="80" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{language === 'hi' ? 'हृदय गति' : 'Heart Rate'}</Label>
                    <Input value={recordForm.heartRate} onChange={(e) => setRecordForm({...recordForm, heartRate: e.target.value})} placeholder="72" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{language === 'hi' ? 'तापमान (°F)' : 'Temp (°F)'}</Label>
                    <Input value={recordForm.temperature} onChange={(e) => setRecordForm({...recordForm, temperature: e.target.value})} placeholder="98.6" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">SpO2 %</Label>
                    <Input value={recordForm.oxygenSaturation} onChange={(e) => setRecordForm({...recordForm, oxygenSaturation: e.target.value})} placeholder="98" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{language === 'hi' ? 'वजन (kg)' : 'Weight (kg)'}</Label>
                    <Input value={recordForm.weight} onChange={(e) => setRecordForm({...recordForm, weight: e.target.value})} placeholder="70" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{language === 'hi' ? 'ऊंचाई (cm)' : 'Height (cm)'}</Label>
                    <Input value={recordForm.height} onChange={(e) => setRecordForm({...recordForm, height: e.target.value})} placeholder="170" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{language === 'hi' ? 'रक्त समूह' : 'Blood Group'}</Label>
                    <Select value={recordForm.bloodGroup} onValueChange={(v) => setRecordForm({...recordForm, bloodGroup: v})}>
                      <SelectTrigger><SelectValue placeholder="--" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Follow-up */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="followUpCheck" checked={recordForm.followUpRequired} onChange={(e) => setRecordForm({...recordForm, followUpRequired: e.target.checked})} className="h-4 w-4" />
                <Label htmlFor="followUpCheck">{language === 'hi' ? 'फॉलो-अप आवश्यक' : 'Follow-up Required'}</Label>
              </div>
              {recordForm.followUpRequired && (
                <Input type="date" value={recordForm.followUpDate} onChange={(e) => setRecordForm({...recordForm, followUpDate: e.target.value})} className="w-40" />
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'नोट्स' : 'Notes'}</Label>
              <Textarea value={recordForm.description} onChange={(e) => setRecordForm({...recordForm, description: e.target.value})} placeholder="Additional notes..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordDialog(false)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={createHealthRecord}>{language === 'hi' ? 'रिकॉर्ड सहेजें' : 'Save Record'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Detail Dialog */}
      <Dialog open={showRecordDetail} onOpenChange={setShowRecordDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              {language === 'hi' ? 'रिकॉर्ड विवरण' : 'Record Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{selectedRecord.type}</Badge>
                <p className="text-sm text-muted-foreground">{formatDate(selectedRecord.recordDate)}</p>
              </div>

              <h3 className="font-semibold text-lg">{selectedRecord.title}</h3>

              {selectedRecord.diagnosis && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'निदान' : 'Diagnosis'}</p>
                  <p className="font-medium">{selectedRecord.diagnosis}</p>
                </div>
              )}

              {(selectedRecord.doctorName || selectedRecord.facilityName) && (
                <div className="flex gap-4 text-sm">
                  {selectedRecord.doctorName && <div><User className="h-3 w-3 inline mr-1" />{selectedRecord.doctorName}</div>}
                  {selectedRecord.facilityName && <div><Building2 className="h-3 w-3 inline mr-1" />{selectedRecord.facilityName}</div>}
                </div>
              )}

              {/* Vitals display */}
              {(selectedRecord.heartRate || selectedRecord.bloodPressureSystolic) && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {selectedRecord.bloodPressureSystolic && (
                    <div className="p-2 bg-rose-50 dark:bg-rose-950 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">BP</p>
                      <p className="font-bold">{selectedRecord.bloodPressureSystolic}/{selectedRecord.bloodPressureDiastolic}</p>
                    </div>
                  )}
                  {selectedRecord.heartRate && (
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">HR</p>
                      <p className="font-bold">{selectedRecord.heartRate} bpm</p>
                    </div>
                  )}
                  {selectedRecord.temperature && (
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Temp</p>
                      <p className="font-bold">{selectedRecord.temperature}°F</p>
                    </div>
                  )}
                  {selectedRecord.oxygenSaturation && (
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">SpO2</p>
                      <p className="font-bold">{selectedRecord.oxygenSaturation}%</p>
                    </div>
                  )}
                  {selectedRecord.weight && (
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="font-bold">{selectedRecord.weight} kg</p>
                    </div>
                  )}
                  {selectedRecord.bloodGroup && (
                    <div className="p-2 bg-rose-50 dark:bg-rose-950 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Blood</p>
                      <p className="font-bold">{selectedRecord.bloodGroup}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedRecord.description && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="text-muted-foreground">{selectedRecord.description}</p>
                </div>
              )}

              {selectedRecord.followUpRequired && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm">
                    {language === 'hi' ? 'फॉलो-अप: ' : 'Follow-up: '}
                    {selectedRecord.followUpDate ? formatDate(selectedRecord.followUpDate) : 'Scheduled'}
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRecordDetail(false)}>{language === 'hi' ? 'बंद करें' : 'Close'}</Button>
            {selectedRecord && (
              <Button variant="destructive" onClick={() => deleteHealthRecord(selectedRecord.id)}>
                <Trash2 className="h-4 w-4 mr-1" />
                {language === 'hi' ? 'हटाएं' : 'Delete'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transport Request Dialog */}
      <Dialog open={showTransportDialog} onOpenChange={setShowTransportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ambulance className="h-5 w-5 text-indigo-600" />
              {language === 'hi' ? 'परिवहन अनुरोध' : 'Request Transport'}
            </DialogTitle>
            <DialogDescription>
              {language === 'hi' ? 'पिकअप और ड्रॉप लोकेशन भरें' : 'Enter pickup and drop locations'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Vehicle Type */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'वाहन का प्रकार' : 'Vehicle Type'}</Label>
              <Select value={transportForm.vehicleType} onValueChange={(v) => setTransportForm({...transportForm, vehicleType: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambulance">{language === 'hi' ? 'एम्बुलेंस' : 'Ambulance'}</SelectItem>
                  <SelectItem value="auto">{language === 'hi' ? 'ऑटो रिक्शा' : 'Auto Rickshaw'}</SelectItem>
                  <SelectItem value="volunteer">{language === 'hi' ? 'स्वयंसेवक वाहन' : 'Volunteer Vehicle'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pickup Location */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'पिकअप लोकेशन *' : 'Pickup Location *'}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-indigo-600" />
                <Input 
                  value={transportForm.pickupLocation}
                  onChange={(e) => setTransportForm({...transportForm, pickupLocation: e.target.value})}
                  placeholder={language === 'hi' ? 'पिकअप पता' : 'Pickup address'}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Drop Location */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'ड्रॉप लोकेशन *' : 'Drop Location *'}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-rose-600" />
                <Input 
                  value={transportForm.dropLocation}
                  onChange={(e) => setTransportForm({...transportForm, dropLocation: e.target.value})}
                  placeholder={language === 'hi' ? 'ड्रॉप पता (अस्पताल)' : 'Drop address (hospital)'}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'रोगी का नाम' : 'Patient Name'}</Label>
                <Input 
                  value={transportForm.patientName}
                  onChange={(e) => setTransportForm({...transportForm, patientName: e.target.value})}
                  placeholder={user?.name || 'Name'}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'फोन नंबर' : 'Phone Number'}</Label>
                <Input 
                  value={transportForm.patientPhone}
                  onChange={(e) => setTransportForm({...transportForm, patientPhone: e.target.value})}
                  placeholder={user?.phone || 'Phone'}
                  maxLength={10}
                />
              </div>
            </div>

            {/* Emergency Type */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'आपातकालीन प्रकार' : 'Emergency Type'}</Label>
              <Select value={transportForm.emergencyType} onValueChange={(v) => setTransportForm({...transportForm, emergencyType: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">{language === 'hi' ? 'चिकित्सा' : 'Medical'}</SelectItem>
                  <SelectItem value="pregnancy">{language === 'hi' ? 'गर्भावस्था' : 'Pregnancy'}</SelectItem>
                  <SelectItem value="accident">{language === 'hi' ? 'दुर्घटना' : 'Accident'}</SelectItem>
                  <SelectItem value="disaster">{language === 'hi' ? 'आपदा' : 'Disaster'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'अतिरिक्त नोट' : 'Additional Notes'}</Label>
              <Textarea 
                value={transportForm.notes}
                onChange={(e) => setTransportForm({...transportForm, notes: e.target.value})}
                placeholder={language === 'hi' ? 'कोई विशेष निर्देश...' : 'Any special instructions...'}
                rows={2}
              />
            </div>

            {/* Info */}
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg text-sm">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <Info className="h-4 w-4" />
                <span>{language === 'hi' ? 'आपातकालीन स्थिति में 108 पर कॉल करें' : 'For emergencies, call 108 directly'}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransportDialog(false)}>
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={createTransportRequest}>
              <Ambulance className="h-4 w-4 mr-1" />
              {language === 'hi' ? 'अनुरोध भेजें' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transport Detail Dialog */}
      <Dialog open={showTransportDetail} onOpenChange={setShowTransportDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ambulance className="h-5 w-5 text-indigo-600" />
              {language === 'hi' ? 'परिवहन विवरण' : 'Transport Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedTransport && (
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={
                  selectedTransport.status === 'in_transit' ? 'default' :
                  selectedTransport.status === 'completed' ? 'secondary' :
                  selectedTransport.status === 'cancelled' ? 'destructive' : 'outline'
                } className={selectedTransport.status === 'in_transit' ? 'bg-indigo-500' : selectedTransport.status === 'assigned' ? 'bg-indigo-500' : ''}>
                  {selectedTransport.status.toUpperCase()}
                </Badge>
                <p className="text-sm text-muted-foreground">{formatDate(selectedTransport.createdAt)}</p>
              </div>

              {/* Route */}
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{language === 'hi' ? 'पिकअप' : 'Pickup'}</p>
                    <p className="font-medium">{selectedTransport.pickupLocation}</p>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-dashed border-muted-foreground/30 h-4" />
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-indigo-900 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{language === 'hi' ? 'ड्रॉप' : 'Drop'}</p>
                    <p className="font-medium">{selectedTransport.dropLocation}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'वाहन' : 'Vehicle'}</p>
                  <p className="font-medium capitalize">{selectedTransport.vehicleType}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'ETA' : 'ETA'}</p>
                  <p className="font-medium">{selectedTransport.estimatedTime || 15} min</p>
                </div>
              </div>

              {/* Driver Info */}
              {selectedTransport.driverPhone && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{language === 'hi' ? 'ड्राइवर जानकारी' : 'Driver Info'}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedTransport.driverId || 'Driver'}</p>
                      <p className="text-sm text-muted-foreground">{selectedTransport.driverPhone}</p>
                    </div>
                    <Button size="sm" onClick={() => window.open(`tel:${selectedTransport.driverPhone}`)}>
                      <Phone className="h-4 w-4 mr-1" />
                      {language === 'hi' ? 'कॉल' : 'Call'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {['requested', 'assigned'].includes(selectedTransport.status) && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => cancelTransport(selectedTransport.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </Button>
                  {['health_worker', 'admin'].includes(user?.role || '') && (
                    <Button 
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600"
                      onClick={() => updateTransportStatus(selectedTransport.id, 'in_transit')}
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      {language === 'hi' ? 'प्रगति में' : 'Start Transit'}
                    </Button>
                  )}
                </div>
              )}

              {selectedTransport.status === 'in_transit' && ['health_worker', 'admin'].includes(user?.role || '') && (
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => updateTransportStatus(selectedTransport.id, 'completed')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {language === 'hi' ? 'यात्रा पूर्ण' : 'Complete Trip'}
                </Button>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransportDetail(false)}>
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hospital Lead Dialog */}
      <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              {language === 'hi' ? 'अस्पताल लीड बनाएं' : 'Create Hospital Lead'}
            </DialogTitle>
            <DialogDescription>
              {selectedHospital?.name} - {language === 'hi' ? 'मरीज की जानकारी भरें' : 'Fill patient details'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'मरीज का नाम *' : 'Patient Name *'}</Label>
                <Input value={leadForm.patientName} onChange={(e) => setLeadForm({...leadForm, patientName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'फोन नंबर *' : 'Phone Number *'}</Label>
                <Input value={leadForm.patientPhone} onChange={(e) => setLeadForm({...leadForm, patientPhone: e.target.value})} maxLength={10} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'उम्र' : 'Age'}</Label>
                <Input type="number" value={leadForm.patientAge} onChange={(e) => setLeadForm({...leadForm, patientAge: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'लिंग' : 'Gender'}</Label>
                <Select value={leadForm.patientGender} onValueChange={(v) => setLeadForm({...leadForm, patientGender: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{language === 'hi' ? 'पुरुष' : 'Male'}</SelectItem>
                    <SelectItem value="female">{language === 'hi' ? 'महिला' : 'Female'}</SelectItem>
                    <SelectItem value="other">{language === 'hi' ? 'अन्य' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'लीड प्रकार *' : 'Lead Type *'}</Label>
                <Select value={leadForm.leadType} onValueChange={(v) => setLeadForm({...leadForm, leadType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opd_consultation">OPD {language === 'hi' ? 'परामर्श' : 'Consultation'}</SelectItem>
                    <SelectItem value="ipd_admission">IPD {language === 'hi' ? 'भर्ती' : 'Admission'}</SelectItem>
                    <SelectItem value="surgery">{language === 'hi' ? 'सर्जरी' : 'Surgery'}</SelectItem>
                    <SelectItem value="diagnostic">{language === 'hi' ? 'डायग्नोस्टिक' : 'Diagnostic'}</SelectItem>
                    <SelectItem value="emergency">{language === 'hi' ? 'आपातकालीन' : 'Emergency'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'विभाग' : 'Department'}</Label>
                <Input value={leadForm.department} onChange={(e) => setLeadForm({...leadForm, department: e.target.value})} placeholder="e.g., Cardiology" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'अनुमानित मूल्य (₹)' : 'Estimated Value (₹)'}</Label>
              <Input type="number" value={leadForm.estimatedValue} onChange={(e) => setLeadForm({...leadForm, estimatedValue: parseInt(e.target.value) || 0})} />
              <p className="text-xs text-muted-foreground">
                {language === 'hi' ? 'आपकी कमीशन: ₹' : 'Your commission: ₹'}
                {Math.round((leadForm.estimatedValue || 500) * (leadForm.leadType === 'surgery' ? 5 : leadForm.leadType === 'ipd_admission' ? 8 : 15) / 100 * 0.7)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeadDialog(false)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={createHospitalLead}>
              {language === 'hi' ? 'लीड बनाएं' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Home Visit Booking Dialog */}
      <Dialog open={showHomeVisitDialog} onOpenChange={setShowHomeVisitDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-indigo-500" />
              {language === 'hi' ? 'होम विज़िट बुक करें' : 'Book Home Visit'}
            </DialogTitle>
            <DialogDescription>
              {selectedDoctorForHomeVisit?.name} - ₹{selectedDoctorForHomeVisit?.consultationFee} {language === 'hi' ? 'प्रति विज़िट' : 'per visit'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'मरीज का नाम *' : 'Patient Name *'}</Label>
                <Input value={homeVisitForm.patientName} onChange={(e) => setHomeVisitForm({...homeVisitForm, patientName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'फोन नंबर *' : 'Phone Number *'}</Label>
                <Input value={homeVisitForm.patientPhone} onChange={(e) => setHomeVisitForm({...homeVisitForm, patientPhone: e.target.value})} maxLength={10} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'पता *' : 'Address *'}</Label>
              <Textarea value={homeVisitForm.patientAddress} onChange={(e) => setHomeVisitForm({...homeVisitForm, patientAddress: e.target.value})} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'तारीख *' : 'Date *'}</Label>
                <Input type="date" value={homeVisitForm.scheduledDate} onChange={(e) => setHomeVisitForm({...homeVisitForm, scheduledDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'समय *' : 'Time *'}</Label>
                <Input type="time" value={homeVisitForm.scheduledTime} onChange={(e) => setHomeVisitForm({...homeVisitForm, scheduledTime: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'लक्षण' : 'Symptoms'}</Label>
              <Textarea value={homeVisitForm.symptoms} onChange={(e) => setHomeVisitForm({...homeVisitForm, symptoms: e.target.value})} rows={2} placeholder="Brief description of symptoms" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHomeVisitDialog(false)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
            <Button className="bg-indigo-500 hover:bg-indigo-600" onClick={createHomeVisitBooking}>
              {language === 'hi' ? 'बुक करें' : 'Book Visit'} - ₹{selectedDoctorForHomeVisit?.consultationFee || 500}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medical Helper Booking Dialog */}
      <Dialog open={showHelperBookingDialog} onOpenChange={setShowHelperBookingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HandHeart className="h-5 w-5 text-indigo-600" />
              {language === 'hi' ? 'हेल्पर बुक करें' : 'Book Helper'}
            </DialogTitle>
            <DialogDescription>
              {selectedHelper?.name} - ₹{selectedHelper?.hourlyRate}/{language === 'hi' ? 'घंटा' : 'hr'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'मरीज का नाम *' : 'Patient Name *'}</Label>
                <Input value={helperBookingForm.patientName} onChange={(e) => setHelperBookingForm({...helperBookingForm, patientName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'फोन नंबर *' : 'Phone Number *'}</Label>
                <Input value={helperBookingForm.patientPhone} onChange={(e) => setHelperBookingForm({...helperBookingForm, patientPhone: e.target.value})} maxLength={10} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'पता *' : 'Address *'}</Label>
              <Textarea value={helperBookingForm.patientAddress} onChange={(e) => setHelperBookingForm({...helperBookingForm, patientAddress: e.target.value})} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'सेवा प्रकार *' : 'Service Type *'}</Label>
              <Select value={helperBookingForm.serviceType} onValueChange={(v) => setHelperBookingForm({...helperBookingForm, serviceType: v})}>
                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                <SelectContent>
                  {selectedHelper?.services?.map((s: string, i: number) => (
                    <SelectItem key={i} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'तारीख *' : 'Date *'}</Label>
                <Input type="date" value={helperBookingForm.scheduledDate} onChange={(e) => setHelperBookingForm({...helperBookingForm, scheduledDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'समय *' : 'Time *'}</Label>
                <Input type="time" value={helperBookingForm.scheduledTime} onChange={(e) => setHelperBookingForm({...helperBookingForm, scheduledTime: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'घंटे' : 'Hours'}</Label>
                <Input type="number" value={helperBookingForm.duration} onChange={(e) => setHelperBookingForm({...helperBookingForm, duration: parseInt(e.target.value) || 1})} min={1} max={12} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHelperBookingDialog(false)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={createHelperBooking}>
              {language === 'hi' ? 'बुक करें' : 'Book'} - ₹{(selectedHelper?.hourlyRate || 300) * (helperBookingForm.duration || 1)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diagnostic Lab Booking Dialog */}
      <Dialog open={showLabBookingDialog} onOpenChange={setShowLabBookingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              {language === 'hi' ? 'लैब टेस्ट बुक करें' : 'Book Lab Test'}
            </DialogTitle>
            <DialogDescription>
              {selectedLab?.name} {selectedLab?.nablAccredited && '- NABL Accredited'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'मरीज का नाम *' : 'Patient Name *'}</Label>
                <Input value={labBookingForm.patientName} onChange={(e) => setLabBookingForm({...labBookingForm, patientName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'फोन नंबर *' : 'Phone Number *'}</Label>
                <Input value={labBookingForm.patientPhone} onChange={(e) => setLabBookingForm({...labBookingForm, patientPhone: e.target.value})} maxLength={10} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'पता' : 'Address'}</Label>
              <Textarea value={labBookingForm.patientAddress} onChange={(e) => setLabBookingForm({...labBookingForm, patientAddress: e.target.value})} rows={2} placeholder="For home collection" />
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'टेस्ट चुनें *' : 'Select Tests *'}</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                {['CBC', 'Lipid Profile', 'Thyroid', 'Diabetes', 'Liver Function', 'Kidney Function', 'Vitamin D', 'Vitamin B12'].map((test) => (
                  <div key={test} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id={test} 
                      checked={labBookingForm.tests.includes(test)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLabBookingForm({...labBookingForm, tests: [...labBookingForm.tests, test]});
                        } else {
                          setLabBookingForm({...labBookingForm, tests: labBookingForm.tests.filter(t => t !== test)});
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <label htmlFor={test} className="text-sm">{test}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="homeCollection" 
                  checked={labBookingForm.homeCollection}
                  onChange={(e) => setLabBookingForm({...labBookingForm, homeCollection: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="homeCollection">{language === 'hi' ? 'होम कलेक्शन (+₹50)' : 'Home Collection (+₹50)'}</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'तारीख *' : 'Date *'}</Label>
              <Input type="date" value={labBookingForm.scheduledDate} onChange={(e) => setLabBookingForm({...labBookingForm, scheduledDate: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLabBookingDialog(false)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={createDiagnosticBooking}>
              {language === 'hi' ? 'बुक करें' : 'Book Test'} - ₹{labBookingForm.tests.length * 300 + (labBookingForm.homeCollection ? 50 : 0)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              {language === 'hi' ? 'वित्तोड़न करें' : 'Request Withdrawal'}
            </DialogTitle>
            <DialogDescription>
              {language === 'hi' ? 'उपलब्ध बैलेंस:' : 'Available Balance:'} ₹{earningsStats.availableBalance.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'राशि *' : 'Amount *'}</Label>
              <Input 
                type="number" 
                value={withdrawAmount} 
                onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)} 
                min={500} 
                max={earningsStats.availableBalance}
              />
              <p className="text-xs text-muted-foreground">
                {language === 'hi' ? 'न्यूनतम ₹500, प्रोसेसिंग शुल्क: ₹0' : 'Minimum ₹500, Processing fee: ₹0'}
              </p>
            </div>
            <div className="flex gap-2">
              {[500, 1000, 2000, 5000].map((amt) => (
                <Button 
                  key={amt} 
                  size="sm" 
                  variant={withdrawAmount === amt ? "default" : "outline"}
                  onClick={() => setWithdrawAmount(amt)}
                  disabled={amt > earningsStats.availableBalance}
                >
                  ₹{amt}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700" 
              onClick={() => requestWithdrawal(withdrawAmount)}
              disabled={withdrawAmount < 500 || withdrawAmount > earningsStats.availableBalance}
            >
              {language === 'hi' ? 'अनुरोध भेजें' : 'Request'} ₹{withdrawAmount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Health Checkup Booking Dialog */}
      <Dialog open={showCheckupBookingDialog} onOpenChange={setShowCheckupBookingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-indigo-600" />
              {language === 'hi' ? 'स्वास्थ्य जांच बुक करें' : 'Book Health Checkup'}
            </DialogTitle>
            <DialogDescription>
              {selectedPackage?.name} - ₹{selectedPackage?.discountedPrice}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'नाम *' : 'Name *'}</Label>
                <Input value={checkupBookingForm.customerName} onChange={(e) => setCheckupBookingForm({...checkupBookingForm, customerName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'फोन *' : 'Phone *'}</Label>
                <Input value={checkupBookingForm.customerPhone} onChange={(e) => setCheckupBookingForm({...checkupBookingForm, customerPhone: e.target.value})} maxLength={10} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'जांच की तारीख *' : 'Test Date *'}</Label>
              <Input type="date" value={checkupBookingForm.scheduledDate} onChange={(e) => setCheckupBookingForm({...checkupBookingForm, scheduledDate: e.target.value})} />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="homeCollectionCheckup" 
                checked={checkupBookingForm.homeCollection}
                onChange={(e) => setCheckupBookingForm({...checkupBookingForm, homeCollection: e.target.checked})}
                className="h-4 w-4"
              />
              <Label htmlFor="homeCollectionCheckup">{language === 'hi' ? 'होम कलेक्शन' : 'Home Collection'}</Label>
            </div>
            {checkupBookingForm.homeCollection && (
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'पता' : 'Address'}</Label>
                <Textarea value={checkupBookingForm.address} onChange={(e) => setCheckupBookingForm({...checkupBookingForm, address: e.target.value})} rows={2} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckupBookingDialog(false)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={createHealthCheckupBooking}>
              {language === 'hi' ? 'बुक करें' : 'Book'} - ₹{selectedPackage?.discountedPrice || 1999}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Equipment Rental Dialog */}
      <Dialog open={showEquipmentRentalDialog} onOpenChange={setShowEquipmentRentalDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              {language === 'hi' ? 'उपकरण किराए पर लें' : 'Rent Equipment'}
            </DialogTitle>
            <DialogDescription>
              {selectedEquipment?.name} - ₹{selectedEquipment?.dailyRate}/{language === 'hi' ? 'दिन' : 'day'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'नाम *' : 'Name *'}</Label>
                <Input value={equipmentRentalForm.customerName} onChange={(e) => setEquipmentRentalForm({...equipmentRentalForm, customerName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'फोन *' : 'Phone *'}</Label>
                <Input value={equipmentRentalForm.customerPhone} onChange={(e) => setEquipmentRentalForm({...equipmentRentalForm, customerPhone: e.target.value})} maxLength={10} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'पता *' : 'Address *'}</Label>
              <Textarea value={equipmentRentalForm.deliveryAddress} onChange={(e) => setEquipmentRentalForm({...equipmentRentalForm, deliveryAddress: e.target.value})} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'शुरू तारीख *' : 'Start Date *'}</Label>
                <Input type="date" value={equipmentRentalForm.startDate} onChange={(e) => setEquipmentRentalForm({...equipmentRentalForm, startDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'समाप्ति तारीख *' : 'End Date *'}</Label>
                <Input type="date" value={equipmentRentalForm.endDate} onChange={(e) => setEquipmentRentalForm({...equipmentRentalForm, endDate: e.target.value})} />
              </div>
            </div>
            {equipmentRentalForm.startDate && equipmentRentalForm.endDate && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                <p className="text-sm">
                  {language === 'hi' ? 'अनुमानित कुल' : 'Estimated Total'}: ₹
                  {((selectedEquipment?.dailyRate || 200) * 
                    (Math.ceil((new Date(equipmentRentalForm.endDate).getTime() - new Date(equipmentRentalForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1) + 
                    (selectedEquipment?.depositAmount || 0))}
                  {selectedEquipment?.depositAmount ? ` (${language === 'hi' ? 'जमा सहित' : 'incl. deposit'})` : ''}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEquipmentRentalDialog(false)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={createEquipmentRental}>
              {language === 'hi' ? 'बुक करें' : 'Book Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lab Test Requirement Dialog */}
      <Dialog open={showLabRequirementDialog} onOpenChange={setShowLabRequirementDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              {language === 'hi' ? 'लैब टेस्ट आवश्यकता जमा करें' : 'Submit Lab Test Requirement'}
            </DialogTitle>
            <DialogDescription>
              {language === 'hi' ? 'नजदीकी लैब्स आपसे संपर्क करेंगी' : 'Nearby labs will contact you with quotes'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Patient Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'रोगी का नाम *' : 'Patient Name *'}</Label>
                <Input value={labRequirementForm.patientName} onChange={(e) => setLabRequirementForm({...labRequirementForm, patientName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'फोन *' : 'Phone *'}</Label>
                <Input value={labRequirementForm.patientPhone} onChange={(e) => setLabRequirementForm({...labRequirementForm, patientPhone: e.target.value})} maxLength={10} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'आयु' : 'Age'}</Label>
                <Input type="number" value={labRequirementForm.patientAge} onChange={(e) => setLabRequirementForm({...labRequirementForm, patientAge: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'लिंग' : 'Gender'}</Label>
                <Select value={labRequirementForm.patientGender} onValueChange={(v) => setLabRequirementForm({...labRequirementForm, patientGender: v})}>
                  <SelectTrigger><SelectValue placeholder={language === 'hi' ? 'चुनें' : 'Select'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{language === 'hi' ? 'पुरुष' : 'Male'}</SelectItem>
                    <SelectItem value="female">{language === 'hi' ? 'महिला' : 'Female'}</SelectItem>
                    <SelectItem value="other">{language === 'hi' ? 'अन्य' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'पता *' : 'Address *'}</Label>
                <Textarea value={labRequirementForm.patientAddress} onChange={(e) => setLabRequirementForm({...labRequirementForm, patientAddress: e.target.value})} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'जिला *' : 'District *'}</Label>
                <Input value={labRequirementForm.district} onChange={(e) => setLabRequirementForm({...labRequirementForm, district: e.target.value})} />
              </div>
            </div>

            {/* Test Selection */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'टेस्ट श्रेणी *' : 'Test Category *'}</Label>
              <Select value={labRequirementForm.testCategory} onValueChange={(v) => {
                const category = labTestCategories.find((c: any) => c.id === v);
                setLabRequirementForm({
                  ...labRequirementForm, 
                  testCategory: v,
                  tests: category?.tests?.slice(0, 3) || []
                });
              }}>
                <SelectTrigger><SelectValue placeholder={language === 'hi' ? 'श्रेणी चुनें' : 'Select category'} /></SelectTrigger>
                <SelectContent>
                  {labTestCategories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{language === 'hi' ? 'टेस्ट चुनें *' : 'Select Tests *'}</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
                {labRequirementForm.tests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{language === 'hi' ? 'टेस्ट चुनने के लिए ऊपर श्रेणी चुनें' : 'Select a category above to choose tests'}</p>
                ) : (
                  labRequirementForm.tests.map((test, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-rose-100" onClick={() => {
                      setLabRequirementForm({
                        ...labRequirementForm,
                        tests: labRequirementForm.tests.filter((_, idx) => idx !== i)
                      });
                    }}>
                      {test} ✕
                    </Badge>
                  ))
                )}
              </div>
              {labTestCatalog.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {labTestCatalog.filter((t: any) => t.category === labRequirementForm.testCategory || !labRequirementForm.testCategory).slice(0, 8).map((test: any) => (
                    <Badge 
                      key={test.id} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-indigo-50"
                      onClick={() => {
                        if (!labRequirementForm.tests.includes(test.testName)) {
                          setLabRequirementForm({...labRequirementForm, tests: [...labRequirementForm.tests, test.testName]});
                        }
                      }}
                    >
                      + {test.testName}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'तत्कालता' : 'Urgency'}</Label>
                <Select value={labRequirementForm.urgency} onValueChange={(v) => setLabRequirementForm({...labRequirementForm, urgency: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">{language === 'hi' ? 'सामान्य' : 'Routine'}</SelectItem>
                    <SelectItem value="normal">{language === 'hi' ? 'मध्यम' : 'Normal'}</SelectItem>
                    <SelectItem value="urgent">{language === 'hi' ? 'तत्काल' : 'Urgent'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'पसंदीदा तारीख' : 'Preferred Date'}</Label>
                <Input type="date" value={labRequirementForm.preferredDate} onChange={(e) => setLabRequirementForm({...labRequirementForm, preferredDate: e.target.value})} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input 
                  type="checkbox" 
                  id="homeCollection" 
                  checked={labRequirementForm.homeCollection}
                  onChange={(e) => setLabRequirementForm({...labRequirementForm, homeCollection: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="homeCollection">{language === 'hi' ? 'होम कलेक्शन' : 'Home Collection'}</Label>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'अतिरिक्त नोट' : 'Additional Notes'}</Label>
              <Textarea value={labRequirementForm.notes} onChange={(e) => setLabRequirementForm({...labRequirementForm, notes: e.target.value})} rows={2} placeholder={language === 'hi' ? 'कोई विशेष निर्देश...' : 'Any special instructions...'} />
            </div>

            {/* Earning info */}
            <div className="p-3 bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-950 dark:to-indigo-950 rounded-lg border border-indigo-200">
              <p className="text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-indigo-600" />
                {language === 'hi' ? 'जब कोई लैब चुनी जाएगी, आप कमाएंगे:' : 'When a lab is selected, you will earn:'} 
                <span className="font-bold text-indigo-600">10% {language === 'hi' ? 'कमीशन' : 'commission'}</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLabRequirementDialog(false)}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
            <Button className="bg-indigo-500 hover:bg-indigo-600" onClick={createLabRequirement} disabled={!labRequirementForm.patientName || !labRequirementForm.patientPhone || labRequirementForm.tests.length === 0}>
              {language === 'hi' ? 'आवश्यकता जमा करें' : 'Submit Requirement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lab Responses Dialog */}
      <Dialog open={showLabResponsesDialog} onOpenChange={setShowLabResponsesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              {language === 'hi' ? 'लैब प्रतिक्रियाएं' : 'Lab Responses'}
            </DialogTitle>
            <DialogDescription>
              {language === 'hi' ? 'एक लैब चुनें आगे बढ़ने के लिए' : 'Select a lab to proceed'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
            {selectedLabRequirement && JSON.parse(selectedLabRequirement.labResponses || '[]').length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>{language === 'hi' ? 'अभी कोई प्रतिक्रिया नहीं' : 'No responses yet'}</p>
                <p className="text-xs mt-1">{language === 'hi' ? 'लैब्स जल्द ही प्रतिक्रिया देंगी' : 'Labs will respond soon'}</p>
              </div>
            ) : (
              selectedLabRequirement && JSON.parse(selectedLabRequirement.labResponses || '[]').map((response: any, i: number) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{response.labName}</CardTitle>
                      <p className="text-lg font-bold text-indigo-600">₹{response.quotedPrice}</p>
                    </div>
                    <CardDescription>{new Date(response.respondedAt).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {response.message && (
                      <p className="text-sm text-muted-foreground mb-3">{response.message}</p>
                    )}
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => selectLabForRequirement(
                        selectedLabRequirement.id, 
                        response.labId, 
                        response.labName, 
                        response.quotedPrice
                      )}
                    >
                      {language === 'hi' ? 'यह लैब चुनें' : 'Select This Lab'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLabResponsesDialog(false)}>{language === 'hi' ? 'बंद करें' : 'Close'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t py-4 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Swasthya Mitra - AI Health Platform for India</p>
          <p className="text-xs mt-1">Made with ❤️ for better healthcare access</p>
        </div>
      </footer>
    </div>
  );
}
