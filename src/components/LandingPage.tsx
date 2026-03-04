"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, Activity, Pill, Building2, CreditCard, FileText, 
  Syringe, Bell, MessageSquare, Trophy, Calendar, HandHeart,
  AlertTriangle, Phone, ChevronRight, CheckCircle2, Star, Users,
  Heart, Shield, Globe, Zap, Award, Clock, MapPin, ArrowRight,
  Play, Menu, X, LogIn, UserPlus, Mic, Camera, Brain, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

// Language options
const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
  { code: "mr", name: "मराठी" },
  { code: "ta", name: "தமிழ்" },
  { code: "bn", name: "বাংলা" },
  { code: "te", name: "తెలుగు" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "kn", name: "ಕನ್ನಡ" }
];

// Translations
const translations: Record<string, Record<string, string>> = {
  en: {
    heroTitle: "Your AI Health Companion",
    heroSubtitle: "India's First 7-Level Intelligent Health Platform",
    heroDescription: "Get instant health guidance, consult doctors online, order medicines, and access government health schemes - all in your language.",
    getStarted: "Get Started Free",
    learnMore: "Learn More",
    alreadyUser: "Already a user? Login",
    featuresTitle: "Complete Healthcare Solution",
    featuresSubtitle: "12+ integrated features for all your health needs",
    howItWorks: "How It Works",
    step1Title: "Describe Your Symptoms",
    step1Desc: "Type, speak, or upload an image of your health concern",
    step2Title: "AI Analyzes & Guides",
    step2Desc: "Our 7-level AI provides personalized recommendations",
    step3Title: "Connect & Care",
    step3Desc: "Consult doctors, order medicines, or find nearby facilities",
    statsUsers: "Users Served",
    statsConsultations: "Consultations",
    statsDistricts: "Districts Covered",
    statsRating: "User Rating",
    whyChooseUs: "Why Choose Swasthya Mitra?",
    testimonial1: "Swasthya Mitra helped me understand my symptoms at 2 AM when no doctor was available. The AI guidance was so accurate!",
    testimonial2: "Finally, a health app that speaks my language! The voice feature helps my grandmother access healthcare easily.",
    testimonial3: "Found the nearest government hospital and checked my PMJAY eligibility in minutes. Life changing for rural India!",
    ctaTitle: "Start Your Health Journey Today",
    ctaSubtitle: "Join millions of Indians getting quality healthcare access",
    emergencyTitle: "Emergency Numbers",
    footerAbout: "About Swasthya Mitra",
    footerFeatures: "Features",
    footerSupport: "Support",
    footerContact: "Contact Us",
    // Additional UI translations
    navFeatures: "Features",
    navAbout: "About",
    navContact: "Contact",
    navFaq: "FAQ",
    navLogin: "Login",
    navSignUp: "Sign Up",
    trustFree: "100% Free to Start",
    trustSecure: "Data Secure",
    trustLanguages: "8 Languages",
    badgePlatform: "India's #1 Health Platform",
    testCredentials: "Test Credentials",
    passwordHint: "Password: test123 (Admin: admin123)",
    loginTitle: "Login",
    registerTitle: "Create Account",
    loginDesc: "Access your account",
    registerDesc: "Create your free account",
    phoneLabel: "Phone Number",
    passwordLabel: "Password",
    fullNameLabel: "Full Name",
    emailLabel: "Email (Optional)",
    confirmPasswordLabel: "Confirm Password",
    districtLabel: "District",
    loginBtn: "Login",
    registerBtn: "Create Account",
    allRightsReserved: "All rights reserved.",
    helpCenter: "Help Center",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service"
  },
  hi: {
    heroTitle: "आपका AI स्वास्थ्य साथी",
    heroSubtitle: "भारत का पहला 7-स्तरीय बुद्धिमान स्वास्थ्य प्लेटफॉर्म",
    heroDescription: "तुरंत स्वास्थ्य मार्गदर्शन प्राप्त करें, डॉक्टरों से ऑनलाइन परामर्श करें, दवाएं ऑर्डर करें, और सरकारी स्वास्थ्य योजनाओं तक पहुंचें - सब आपकी भाषा में।",
    getStarted: "मुफ्त शुरू करें",
    learnMore: "और जानें",
    alreadyUser: "पहले से उपयोगकर्ता? लॉगिन करें",
    featuresTitle: "संपूर्ण स्वास्थ्य समाधान",
    featuresSubtitle: "आपकी सभी स्वास्थ्य जरूरतों के लिए 12+ एकीकृत सुविधाएं",
    howItWorks: "यह कैसे काम करता है",
    step1Title: "अपने लक्षण बताएं",
    step1Desc: "अपनी स्वास्थ्य समस्या टाइप करें, बोलें, या फोटो अपलोड करें",
    step2Title: "AI विश्लेषण और मार्गदर्शन",
    step2Desc: "हमारा 7-स्तरीय AI व्यक्तिगत सिफारिशें देता है",
    step3Title: "जुड़ें और देखभाल करें",
    step3Desc: "डॉक्टरों से परामर्श करें, दवाएं ऑर्डर करें, या नजदीकी सुविधाएं खोजें",
    statsUsers: "उपयोगकर्ता सेवाएं",
    statsConsultations: "परामर्श",
    statsDistricts: "जिले कवर",
    statsRating: "उपयोगकर्ता रेटिंग",
    whyChooseUs: "स्वास्थ्य मित्र क्यों चुनें?",
    testimonial1: "स्वास्थ्य मित्र ने मुझे रात 2 बजे मेरे लक्षणों को समझने में मदद की जब कोई डॉक्टर उपलब्ध नहीं था। AI मार्गदर्शन बहुत सटीक था!",
    testimonial2: "आखिरकार, एक स्वास्थ्य ऐप जो मेरी भाषा बोलता है! वॉइस फीचर मेरी दादी को आसानी से स्वास्थ्य सेवाओं तक पहुंचने में मदद करता है।",
    testimonial3: "नजदीकी सरकारी अस्पताल मिला और मिनटों में अपनी PMJAY पात्रता जांची। ग्रामीण भारत के लिए जीवन बदलने वाला!",
    ctaTitle: "आज ही अपनी स्वास्थ्य यात्रा शुरू करें",
    ctaSubtitle: "गुणवत्तापूर्ण स्वास्थ्य सेवा प्राप्त करने वाले लाखों भारतीयों से जुड़ें",
    emergencyTitle: "आपातकालीन नंबर",
    footerAbout: "स्वास्थ्य मित्र के बारे में",
    footerFeatures: "सुविधाएं",
    footerSupport: "सहायता",
    footerContact: "संपर्क करें",
    // Additional UI translations
    navFeatures: "सुविधाएं",
    navAbout: "हमारे बारे में",
    navContact: "संपर्क करें",
    navFaq: "सवाल-जवाब",
    navLogin: "लॉगिन",
    navSignUp: "पंजीकरण",
    trustFree: "100% मुफ्त शुरू",
    trustSecure: "डेटा सुरक्षित",
    trustLanguages: "8 भाषाएं",
    badgePlatform: "भारत का #1 स्वास्थ्य प्लेटफॉर्म",
    testCredentials: "परीक्षण क्रेडेंशियल",
    passwordHint: "पासवर्ड: test123 (Admin: admin123)",
    loginTitle: "लॉगिन करें",
    registerTitle: "पंजीकरण करें",
    loginDesc: "अपने खाते में प्रवेश करें",
    registerDesc: "मुफ्त में खाता बनाएं",
    phoneLabel: "फोन नंबर",
    passwordLabel: "पासवर्ड",
    fullNameLabel: "पूरा नाम",
    emailLabel: "ईमेल (वैकल्पिक)",
    confirmPasswordLabel: "पासवर्ड पुष्टि",
    districtLabel: "जिला",
    loginBtn: "लॉगिन करें",
    registerBtn: "पंजीकरण करें",
    allRightsReserved: "सर्वाधिकार सुरक्षित।",
    helpCenter: "सहायता केंद्र",
    privacyPolicy: "गोपनीयता नीति",
    termsOfService: "नियत शर्तें"
  },
  mr: {
    heroTitle: "तुमचा AI आरोग्य साथी",
    heroSubtitle: "भारताचा पहिला 7-स्तरीय बुद्धिमान आरोग्य प्लॅटफॉर्म",
    heroDescription: "तात्काळ आरोग्य मार्गदर्शन मिळवा, डॉक्टरांशी ऑनलाइन सल्लामसलत करा, औषधे ऑर्डर करा आणि सरकारी आरोग्य योजनांमध्ये प्रवेश मिळवा - सर्व तुमच्या भाषेत.",
    getStarted: "विनामूल्य सुरू करा",
    learnMore: "अधिक जाणून घ्या",
    alreadyUser: "आधीच वापरकर्ता? लॉगिन करा",
    featuresTitle: "संपूर्ण आरोग्य उपाय",
    featuresSubtitle: "तुमच्या सर्व आरोग्य गरजांसाठी 12+ एकत्रित वैशिष्ट्ये",
    howItWorks: "हे कसे कार्य करते",
    step1Title: "तुमची लक्षणे सांगा",
    step1Desc: "तुमची आरोग्य समस्या टाइप करा, बोला किंवा फोटो अपलोड करा",
    step2Title: "AI विश्लेषण आणि मार्गदर्शन",
    step2Desc: "आमचा 7-स्तरीय AI वैयक्तिकृत शिफारसी देतो",
    step3Title: "जोडा आणि काळजी घ्या",
    step3Desc: "डॉक्टरांशी सल्लामसलत करा, औषधे ऑर्डर करा किंवा जवळची सुविधा शोधा",
    statsUsers: "वापरकर्ते सेवा",
    statsConsultations: "सल्लामसलत",
    statsDistricts: "जिल्हे कव्हर",
    statsRating: "वापरकर्ता रेटिंग",
    whyChooseUs: "स्वास्थ्य मित्र का निवडावे?",
    testimonial1: "स्वास्थ्य मित्राने रात्री 2 वाजता माझी लक्षणे समजून घेण्यास मदत केली जेव्हा कोणताही डॉक्टर उपलब्ध नव्हता. AI मार्गदर्शन खूप अचूक होते!",
    testimonial2: "शेवटी, एक आरोग्य अॅप जो माझी भाषा बोलतो! व्हॉइस फीचर माझ्या आजीला आरोग्य सेवांमध्ये सहज प्रवेश करण्यास मदत करतो.",
    testimonial3: "जवळचे सरकारी रुग्णालय सापडले आणि मिनिटांत माझी PMJAY पात्रता तपासली. ग्रामीण भारतासाठी जीवन बदलणारे!",
    ctaTitle: "आजच तुमचा आरोग्य प्रवास सुरू करा",
    ctaSubtitle: "गुणवत्तापूर्ण आरोग्य सेवा मिळवणाऱ्या लाखो भारतीयांशी जोडा",
    emergencyTitle: "आपत्कालीन नंबर",
    footerAbout: "स्वास्थ्य मित्राबद्दल",
    footerFeatures: "वैशिष्ट्ये",
    footerSupport: "समर्थन",
    footerContact: "संपर्क करा"
  },
  ta: {
    heroTitle: "உங்கள் AI சுகாதார துணை",
    heroSubtitle: "இந்தியாவின் முதல் 7-நிலை அறிவுள்ள சுகாதார தளம்",
    heroDescription: "உடனடி சுகாதார வழிகாட்டலைப் பெறுங்கள், மருத்துவர்களுடன் ஆன்லைனில் கலந்துரையாடுங்கள், மருந்துகளை ஆர்டர் செய்யுங்கள், அரசாங்க சுகாதார திட்டங்களை அணுகுங்கள் - அனைத்தும் உங்கள் மொழியில்.",
    getStarted: "இலவசமாக தொடங்குங்கள்",
    learnMore: "மேலும் அறிக",
    alreadyUser: "ஏற்கனவே பயனரா? உள்நுழையவும்",
    featuresTitle: "முழுமையான சுகாதார தீர்வு",
    featuresSubtitle: "உங்கள் அனைத்து சுகாதார தேவைகளுக்கும் 12+ ஒருங்கிணைந்த அம்சங்கள்",
    howItWorks: "இது எவ்வாறு செயல்படுகிறது",
    step1Title: "உங்கள் அறிகுறிகளை விவரியுங்கள்",
    step1Desc: "உங்கள் சுகாதார கவலையை தட்டச்சு செய்யுங்கள், பேசுங்கள் அல்லது படத்தைப் பதிவேற்றுங்கள்",
    step2Title: "AI பகுப்பாய்வு மற்றும் வழிகாட்டல்",
    step2Desc: "எங்கள் 7-நிலை AI தனிப்பயனாக்கப்பட்ட பரிந்துரைகளை வழங்குகிறது",
    step3Title: "இணைந்து கவனித்துக்கொள்ளுங்கள்",
    step3Desc: "மருத்துவர்களுடன் கலந்துரையாடுங்கள், மருந்துகளை ஆர்டர் செய்யுங்கள் அல்லது அருகிலுள்ள வசதிகளைக் கண்டறியுங்கள்",
    statsUsers: "பயனர்கள் சேவை",
    statsConsultations: "கலந்துரையாடல்கள்",
    statsDistricts: "மாவட்டங்கள் கவர்",
    statsRating: "பயனர் மதிப்பீடு",
    whyChooseUs: "ஸ்வஸ்த்ய மித்ராவை ஏன் தேர்வு செய்ய வேண்டும்?",
    testimonial1: "ஸ்வஸ்த்ய மித்ரா இரவு 2 மணிக்கு என் அறிகுறிகளைப் புரிந்துகொள்ள உதவியது, அப்போது எந்த மருத்துவரும் கிடைக்கவில்லை. AI வழிகாட்டல் மிகவும் துல்லியமாக இருந்தது!",
    testimonial2: "இறுதியாக, என் மொழியைப் பேசும் ஒரு சுகாதார செயலி! வாய்ஸ் அம்சம் என் பாட்டிக்கு சுகாதார சேவைகளை எளிதாக அணுக உதவுகிறது.",
    testimonial3: "அருகிலுள்ள அரசு மருத்துவமனையைக் கண்டுபிடித்து, நிமிடங்களில் என் PMJAY தகுதியை சரிபார்த்தேன். கிராமப்புற இந்தியாவுக்கு வாழ்க்கையை மாற்றுகிறது!",
    ctaTitle: "இன்றே உங்கள் சுகாதார பயணத்தைத் தொடங்குங்கள்",
    ctaSubtitle: "தரமான சுகாதார சேவைகளைப் பெறும் லட்சக்கணக்கான இந்தியர்களுடன் இணைந்திருங்கள்",
    emergencyTitle: "அவசர எண்கள்",
    footerAbout: "ஸ்வஸ்த்ய மித்ரா பற்றி",
    footerFeatures: "அம்சங்கள்",
    footerSupport: "ஆதரவு",
    footerContact: "தொடர்பு கொள்ளுங்கள்"
  },
  bn: {
    heroTitle: "আপনার AI স্বাস্থ্য সঙ্গী",
    heroSubtitle: "ভারতের প্রথম 7-স্তরের বুদ্ধিমান স্বাস্থ্য প্ল্যাটফর্ম",
    heroDescription: "তাৎক্ষণিক স্বাস্থ্য নির্দেশিকা পান, ডাক্তারদের সাথে অনলাইনে পরামর্শ করুন, ওষুধ অর্ডার করুন এবং সরকারি স্বাস্থ্য স্কিমগুলি অ্যাক্সেস করুন - সব আপনার ভাষায়।",
    getStarted: "বিনামূল্যে শুরু করুন",
    learnMore: "আরও জানুন",
    alreadyUser: "ইতিমধ্যে ব্যবহারকারী? লগইন করুন",
    featuresTitle: "সম্পূর্ণ স্বাস্থ্য সমাধান",
    featuresSubtitle: "আপনার সমস্ত স্বাস্থ্য প্রয়োজনের জন্য 12+ সংহত বৈশিষ্ট্য",
    howItWorks: "এটি কীভাবে কাজ করে",
    step1Title: "আপনার লক্ষণগুলি বর্ণনা করুন",
    step1Desc: "আপনার স্বাস্থ্য সমস্যা টাইপ করুন, বলুন বা ছবি আপলোড করুন",
    step2Title: "AI বিশ্লেষণ ও নির্দেশিকা",
    step2Desc: "আমাদের 7-স্তরের AI ব্যক্তিগত সুপারিশ প্রদান করে",
    step3Title: "সংযোগ করুন এবং যত্ন নিন",
    step3Desc: "ডাক্তারদের সাথে পরামর্শ করুন, ওষুধ অর্ডার করুন বা কাছাকাছি সুবিধাগুলি খুঁজুন",
    statsUsers: "ব্যবহারকারী সেবা",
    statsConsultations: "পরামর্শ",
    statsDistricts: "জেলা কভার",
    statsRating: "ব্যবহারকারী রেটিং",
    whyChooseUs: "স্বাস্থ্য মিত্রকে কেন বেছে নেবেন?",
    testimonial1: "স্বাস্থ্য মিত্র রাত ২টায় আমার লক্ষণগুলি বুঝতে সাহায্য করেছে যখন কোনো ডাক্তার পাওয়া যাচ্ছিল না। AI নির্দেশিকা অত্যন্ত সঠিক ছিল!",
    testimonial2: "অবশেষে, একটি স্বাস্থ্য অ্যাপ যা আমার ভাষায় কথা বলে! ভয়েস ফিচার আমার ঠাকুমাকে স্বাস্থ্য সেবায় সহজে প্রবেশ করতে সাহায্য করে।",
    testimonial3: "কাছের সরকারি হাসপাতাল পেয়েছি এবং মিনিটের মধ্যে আমার PMJAY যোগ্যতা পরীক্ষা করেছি। গ্রামীণ ভারতের জন্য জীবন বদলে দেওয়া!",
    ctaTitle: "আজই আপনার স্বাস্থ্য যাত্রা শুরু করুন",
    ctaSubtitle: "মানসম্মত স্বাস্থ্য সেবা পাওয়া লাখ লাখ ভারতীয়দের সাথে যোগ দিন",
    emergencyTitle: "জরুরি নম্বর",
    footerAbout: "স্বাস্থ্য মিত্র সম্পর্কে",
    footerFeatures: "বৈশিষ্ট্য",
    footerSupport: "সমর্থন",
    footerContact: "যোগাযোগ করুন"
  },
  te: {
    heroTitle: "మీ AI ఆరోగ్య సహచరుడు",
    heroSubtitle: "భారతదేశపు మొట్టమొదటి 7-స్థాయి తెలివైన ఆరోగ్య ప్లాట్‌ఫారమ్",
    heroDescription: "తక్షణ ఆరోగ్య మార్గదర్శకత్వం పొందండి, డాక్టర్లతో ఆన్‌లైన్‌లో సంప్రదించండి, మందులు ఆర్డర్ చేయండి, ప్రభుత్వ ఆరోగ్య పథకాలను యాక్సెస్ చేయండి - అన్నీ మీ భాషలో.",
    getStarted: "ఉచితంగా ప్రారంభించండి",
    learnMore: "మరింత తెలుసుకోండి",
    alreadyUser: "ఇప్పటికే వినియోగదారుడా? లాగిన్ అవ్వండి",
    featuresTitle: "పూర్తి ఆరోగ్య పరిష్కారం",
    featuresSubtitle: "మీ అన్ని ఆరోగ్య అవసరాలకు 12+ సమగ్ర ఫీచర్లు",
    howItWorks: "ఇది ఎలా పనిచేస్తుంది",
    step1Title: "మీ లక్షణాలను వివరించండి",
    step1Desc: "మీ ఆరోగ్య సమస్యను టైప్ చేయండి, మాట్లాడండి లేదా ఫోటో అప్‌లోడ్ చేయండి",
    step2Title: "AI విశ్లేషణ & మార్గదర్శకత్వం",
    step2Desc: "మా 7-స్థాయి AI వ్యక్తిగత సిఫార్సులను అందిస్తుంది",
    step3Title: "కనెక్ట్ అవ్వండి & సంరక్షించండి",
    step3Desc: "డాక్టర్లతో సంప్రదించండి, మందులు ఆర్డర్ చేయండి లేదా సమీప సౌకర్యాలను కనుగొనండి",
    statsUsers: "వినియోగదారుల సేవ",
    statsConsultations: "సంప్రదింపులు",
    statsDistricts: "జిల్లాలు కవర్",
    statsRating: "వినియోగదారు రేటింగ్",
    whyChooseUs: "స్వాస్థ్య మిత్రను ఎందుకు ఎంచుకోవాలి?",
    testimonial1: "స్వాస్థ్య మిత్ర అర్ధరాత్రి 2 గంటలకు నా లక్షణాలను అర్థం చేసుకోవడానికి సహాయం చేసింది, అప్పుడు ఏ డాక్టర్ అందుబాటులో లేరు. AI మార్గదర్శకత్వం చాలా కచ్చితంగా ఉంది!",
    testimonial2: "చివరకు, నా భాష మాట్లాడే ఆరోగ్య యాప్! వాయిస్ ఫీచర్ నా అమ్మమ్మకు ఆరోగ్య సేవలను సులభంగా యాక్సెస్ చేయడానికి సహాయపడుతుంది.",
    testimonial3: "సమీప ప్రభుత్వ ఆసుపత్రి కనుగొని నిమిషాల్లో నా PMJAY అర్హతను తనిఖీ చేశాను. గ్రామీణ భారతదేశానికి జీవితాన్ని మార్చేది!",
    ctaTitle: "ఈరోజే మీ ఆరోగ్య ప్రయాణాన్ని ప్రారంభించండి",
    ctaSubtitle: "నాణ్యమైన ఆరోగ్య సంరక్షణ పొందుతున్న లక్షల మంది భారతీయులతో చేరండి",
    emergencyTitle: "అత్యవసర నంబర్లు",
    footerAbout: "స్వాస్థ్య మిత్ర గురించి",
    footerFeatures: "ఫీచర్లు",
    footerSupport: "మద్దతు",
    footerContact: "సంప్రదించండి"
  },
  gu: {
    heroTitle: "તમારો AI સ્વાસ્થ્ય સાથી",
    heroSubtitle: "ભારતનો પ્રથમ 7-સ્તરીય બુદ્ધિશાળી સ્વાસ્થ્ય પ્લેટફોર્મ",
    heroDescription: "તાત્કાલિક સ્વાસ્થ્ય માર્ગદર્શન મેળવો, ડોક્ટરો સાથે ઓનલાઈન કન્સલ્ટ કરો, દવાઓ ઓર્ડર કરો અને સરકારી સ્વાસ્થ્ય યોજનાઓને ઍક્સેસ કરો - બધું તમારી ભાષામાં.",
    getStarted: "મફત શરૂ કરો",
    learnMore: "વધુ જાણો",
    alreadyUser: "પહેલેથી વપરાશકર્તા? લૉગિન કરો",
    featuresTitle: "સંપૂર્ણ સ્વાસ્થ્ય ઉકેલ",
    featuresSubtitle: "તમારી બધી સ્વાસ્થ્ય જરૂરિયાતો માટે 12+ સંકલિત સુવિધાઓ",
    howItWorks: "આ કેવી રીતે કામ કરે છે",
    step1Title: "તમારા લક્ષણો વર્ણવો",
    step1Desc: "તમારી સ્વાસ્થ્ય સમસ્યા ટાઇપ કરો, બોલો અથવા ફોટો અપલોડ કરો",
    step2Title: "AI વિશ્લેષણ અને માર્ગદર્શન",
    step2Desc: "અમારું 7-સ્તરીય AI વ્યક્તિગત ભલામણો આપે છે",
    step3Title: "જોડાઓ અને સંભાળ લો",
    step3Desc: "ડોક્ટરો સાથે કન્સલ્ટ કરો, દવાઓ ઓર્ડર કરો અથવા નજીકની સુવિધાઓ શોધો",
    statsUsers: "વપરાશકર્તા સેવા",
    statsConsultations: "કન્સલ્ટેશન",
    statsDistricts: "જિલ્લાઓ કવર",
    statsRating: "વપરાશકર્તા રેટિંગ",
    whyChooseUs: "સ્વાસ્થ્ય મિત્ર કેમ પસંદ કરવું?",
    testimonial1: "સ્વાસ્થ્ય મિત્રે રાત્રે 2 વાગ્યે મારા લક્ષણો સમજવામાં મદદ કરી જ્યારે કોઈ ડોક્ટર ઉપલબ્ધ ન હતા. AI માર્ગદર્શન ખૂબ ચોક્કસ હતું!",
    testimonial2: "અંતે, એક સ્વાસ્થ્ય એપ જે મારી ભાષા બોલે છે! વૉઇસ ફીચર મારી દાદીને સ્વાસ્થ્ય સેવાઓમાં સરળતાથી પ્રવેશવામાં મદદ કરે છે.",
    testimonial3: "નજીકની સરકારી હોસ્પિટલ મળી અને મિનિટોમાં મારી PMJAY પાત્રતા તપાસી. ગ્રામીણ ભારત માટે જીવન બદલનાર!",
    ctaTitle: "આજે જ તમારી સ્વાસ્થ્ય યાત્રા શરૂ કરો",
    ctaSubtitle: "ગુણવત્તાવાળી સ્વાસ્થ્ય સંભાળ મેળવતા લાખો ભારતીયો સાથે જોડાઓ",
    emergencyTitle: "ઇમર્જન્સી નંબર",
    footerAbout: "સ્વાસ્થ્ય મિત્ર વિશે",
    footerFeatures: "સુવિધાઓ",
    footerSupport: "સપોર્ટ",
    footerContact: "સંપર્ક કરો"
  },
  kn: {
    heroTitle: "ನಿಮ್ಮ AI ಆರೋಗ್ಯ ಸಹಚರ",
    heroSubtitle: "ಭಾರತದ ಮೊದಲ 7-ಹಂತದ ಬುದ್ಧಿವಂತ ಆರೋಗ್ಯ ವೇದಿಕೆ",
    heroDescription: "ತಕ್ಷಣದ ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನವನ್ನು ಪಡೆಯಿರಿ, ವೈದ್ಯರೊಂದಿಗೆ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಸಮಾಲೋಚಿಸಿ, ಔಷಧಿಗಳನ್ನು ಆದೇಶಿಸಿ ಮತ್ತು ಸರ್ಕಾರಿ ಆರೋಗ್ಯ ಯೋಜನೆಗಳನ್ನು ಪ್ರವೇಶಿಸಿ - ಎಲ್ಲವೂ ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ.",
    getStarted: "ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ",
    learnMore: "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ",
    alreadyUser: "ಈಗಾಗಲೇ ಬಳಕೆದಾರರೇ? ಲಾಗಿನ್ ಮಾಡಿ",
    featuresTitle: "ಸಂಪೂರ್ಣ ಆರೋಗ್ಯ ಪರಿಹಾರ",
    featuresSubtitle: "ನಿಮ್ಮ ಎಲ್ಲಾ ಆರೋಗ್ಯ ಅವಶ್ಯಕತೆಗಳಿಗೆ 12+ ಸಂಯೋಜಿತ ವೈಶಿಷ್ಟ್ಯಗಳು",
    howItWorks: "ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
    step1Title: "ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ",
    step1Desc: "ನಿಮ್ಮ ಆರೋಗ್ಯ ಕಾಳಜಿಯನ್ನು ಟೈಪ್ ಮಾಡಿ, ಮಾತನಾಡಿ ಅಥವಾ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    step2Title: "AI ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ",
    step2Desc: "ನಮ್ಮ 7-ಹಂತದ AI ವೈಯಕ್ತಿಕ ಶಿಫಾರಸುಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ",
    step3Title: "ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ಆರೈಕೆ ಮಾಡಿ",
    step3Desc: "ವೈದ್ಯರೊಂದಿಗೆ ಸಮಾಲೋಚಿಸಿ, ಔಷಧಿಗಳನ್ನು ಆದೇಶಿಸಿ ಅಥವಾ ಹತ್ತಿರದ ಸೌಲಭ್ಯಗಳನ್ನು ಹುಡುಕಿ",
    statsUsers: "ಬಳಕೆದಾರರ ಸೇವೆ",
    statsConsultations: "ಸಮಾಲೋಚನೆಗಳು",
    statsDistricts: "ಜಿಲ್ಲೆಗಳು ಕವರ್",
    statsRating: "ಬಳಕೆದಾರ ರೇಟಿಂಗ್",
    whyChooseUs: "ಸ್ವಸ್ಥ್ಯ ಮಿತ್ರವನ್ನು ಏಕೆ ಆರಿಸಬೇಕು?",
    testimonial1: "ಸ್ವಸ್ಥ್ಯ ಮಿತ್ರ ರಾತ್ರಿ 2 ಗಂಟೆಗೆ ನನ್ನ ಲಕ್ಷಣಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡಿತು ಯಾವಾಗ ಯಾವುದೇ ವೈದ್ಯರು ಲಭ್ಯವಿರಲಿಲ್ಲ. AI ಮಾರ್ಗದರ್ಶನ ತುಂಬಾ ನಿಖರವಾಗಿತ್ತು!",
    testimonial2: "ಕೊನೆಗೆ, ನನ್ನ ಭಾಷೆ ಮಾತನಾಡುವ ಆರೋಗ್ಯ ಅಪ್ಲಿಕೇಶನ್! ವಾಯ್ಸ್ ಫೀಚರ್ ನನ್ನ ಅಜ್ಜಿಗೆ ಆರೋಗ್ಯ ಸೇವೆಗಳನ್ನು ಸುಲಭವಾಗಿ ಪ್ರವೇಶಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
    testimonial3: "ಹತ್ತಿರದ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆ ಕಂಡುಹಿಡಿದು ನಿಮಿಷಗಳಲ್ಲಿ ನನ್ನ PMJAY ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿದೆ. ಗ್ರಾಮೀಣ ಭಾರತಕ್ಕೆ ಜೀವನ ಬದಲಾವಣೆ!",
    ctaTitle: "ಇಂದೇ ನಿಮ್ಮ ಆರೋಗ್ಯ ಪ್ರಯಾಣವನ್ನು ಪ್ರಾರಂಭಿಸಿ",
    ctaSubtitle: "ಗುಣಮಟ್ಟದ ಆರೋಗ್ಯ ಆರೈಕೆ ಪಡೆಯುತ್ತಿರುವ ಲಕ್ಷಾಂತರ ಭಾರತೀಯರೊಂದಿಗೆ ಸೇರಿ",
    emergencyTitle: "ತುರ್ತು ಸಂಖ್ಯೆಗಳು",
    footerAbout: "ಸ್ವಸ್ಥ್ಯ ಮಿತ್ರದ ಬಗ್ಗೆ",
    footerFeatures: "ವೈಶಿಷ್ಟ್ಯಗಳು",
    footerSupport: "ಬೆಂಬಲ",
    footerContact: "ಸಂಪರ್ಕಿಸಿ"
  }
};

// All Features Data
const allFeatures = [
  {
    id: "ai-assistant",
    icon: Brain,
    title: { en: "7-Level AI Health Assistant", hi: "7-स्तरीय AI स्वास्थ्य सहायक" },
    description: { 
      en: "World's first progressive AI that understands context, uses tools, reasons through problems, and learns from feedback. Voice & image support included.", 
      hi: "दुनिया का पहला प्रोग्रेसिव AI जो संदर्भ समझता है, टूल्स उपयोग करता है, समस्याओं का समाधान करता है, और प्रतिक्रिया से सीखता है।" 
    },
    capabilities: { 
      en: ["Voice input & TTS", "Image analysis", "Multi-language", "Medical knowledge base"], 
      hi: ["वॉइस इनपुट और TTS", "छवि विश्लेषण", "बहु-भाषा", "चिकित्सा ज्ञान आधार"] 
    },
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50"
  },
  {
    id: "telemedicine",
    icon: Activity,
    title: { en: "Telemedicine & Video Consult", hi: "टेलीमेडिसिन और वीडियो परामर्श" },
    description: { 
      en: "Connect with verified doctors via HD video calls. Get e-prescriptions instantly. Consult specialists from the comfort of your home.", 
      hi: "HD वीडियो कॉल के माध्यम से सत्यापित डॉक्टरों से जुड़ें। तुरंत ई-प्रिस्क्रिप्शन प्राप्त करें।" 
    },
    capabilities: { 
      en: ["Video consultations", "Audio calls", "E-prescriptions", "Multiple specializations"], 
      hi: ["वीडियो परामर्श", "ऑडियो कॉल", "ई-प्रिस्क्रिप्शन", "कई विशेषज्ञता"] 
    },
    color: "bg-indigo-400",
    bgColor: "bg-indigo-50"
  },
  {
    id: "e-pharmacy",
    icon: Pill,
    title: { en: "E-Pharmacy & Medicine Delivery", hi: "ई-फार्मेसी और दवा डिलीवरी" },
    description: { 
      en: "Order medicines online with 20% discount on generics. Upload prescription, check drug interactions, and get home delivery.", 
      hi: "जेनेरिक पर 20% छूट के साथ ऑनलाइन दवाएं ऑर्डर करें। प्रिस्क्रिप्शन अपलोड करें, ड्रग इंटरैक्शन जांचें।" 
    },
    capabilities: { 
      en: ["Generic alternatives", "Drug interaction check", "Home delivery", "Prescription upload"], 
      hi: ["जेनेरिक विकल्प", "दवा प्रतिक्रिया जांच", "घर डिलीवरी", "प्रिस्क्रिप्शन अपलोड"] 
    },
    color: "bg-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    id: "facilities",
    icon: Building2,
    title: { en: "Health Facility Finder", hi: "स्वास्थ्य सुविधा खोजें" },
    description: { 
      en: "Find nearby hospitals, PHCs, CHCs, and diagnostic labs. Check bed availability, crowd levels, and services in real-time.", 
      hi: "नजदीकी अस्पताल, PHC, CHC और डायग्नोस्टिक लैब खोजें। बिस्ता उपलब्धता, भीड़ स्तर और सेवाएं वास्तविक समय में जांचें।" 
    },
    capabilities: { 
      en: ["Real-time bed status", "Service details", "GPS navigation", "Contact info"], 
      hi: ["वास्तविक समय बिस्ता स्थिति", "सेवा विवरण", "GPS नेविगेशन", "संपर्क जानकारी"] 
    },
    color: "bg-violet-500",
    bgColor: "bg-violet-50"
  },
  {
    id: "health-card",
    icon: CreditCard,
    title: { en: "Digital Health Card", hi: "डिजिटल स्वास्थ्य कार्ड" },
    description: { 
      en: "Your complete health identity with QR code. Blood group, allergies, chronic conditions, emergency contacts - all in one card.", 
      hi: "QR कोड के साथ आपकी पूर्ण स्वास्थ्य पहचान। रक्त समूह, एलर्जी, पुरानी स्थितियां, आपातकालीन संपर्क - सब एक कार्ड में।" 
    },
    capabilities: { 
      en: ["QR health summary", "Emergency info", "Vaccination records", "Insurance linkage"], 
      hi: ["QR स्वास्थ्य सारांश", "आपातकालीन जानकारी", "टीकाकरण रिकॉर्ड", "बीमा लिंकेज"] 
    },
    color: "bg-indigo-700",
    bgColor: "bg-indigo-50"
  },
  {
    id: "govt-schemes",
    icon: FileText,
    title: { en: "Government Health Schemes", hi: "सरकारी स्वास्थ्य योजनाएं" },
    description: { 
      en: "Check eligibility for PMJAY, Ayushman Bharat, and state schemes. Get application help and document guidance.", 
      hi: "PMJAY, आयुष्मान भारत और राज्य योजनाओं के लिए पात्रता जांचें। आवेदन सहायता और दस्तावेज मार्गदर्शन प्राप्त करें।" 
    },
    capabilities: { 
      en: ["PMJAY eligibility", "Ayushman Bharat", "Application help", "Document checklist"], 
      hi: ["PMJAY पात्रता", "आयुष्मान भारत", "आवेदन सहायता", "दस्तावेज चेकलिस्ट"] 
    },
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50"
  },
  {
    id: "vaccination",
    icon: Syringe,
    title: { en: "Vaccination Tracking", hi: "टीकाकरण ट्रैकिंग" },
    description: { 
      en: "Complete vaccination management with reminders. National immunization schedule for children and adults.", 
      hi: "अनुस्मारक के साथ पूर्ण टीकाकरण प्रबंधन। बच्चों और वयस्कों के लिए राष्ट्रीय टीकाकरण अनुसूची।" 
    },
    capabilities: { 
      en: ["Due date alerts", "Certificate generation", "Child & adult schedule", "SMS reminders"], 
      hi: ["नियत तारीख अलर्ट", "प्रमाण पत्र जनरेशन", "बाल और वयस्क अनुसूची", "SMS अनुस्मारक"] 
    },
    color: "bg-indigo-400",
    bgColor: "bg-indigo-50"
  },
  {
    id: "reminders",
    icon: Bell,
    title: { en: "Medicine Reminders", hi: "दवा अनुस्मारक" },
    description: { 
      en: "Never miss a dose with smart reminders. Track medicine intake, get refill alerts, and manage family medications.", 
      hi: "स्मार्ट रिमाइंडर के साथ कभी खुराक न भूलें। दवा सेवन ट्रैक करें, रिफिल अलर्ट प्राप्त करें।" 
    },
    capabilities: { 
      en: ["Flexible scheduling", "Refill alerts", "Family management", "Dose tracking"], 
      hi: ["लचीली अनुसूची", "रिफिल अलर्ट", "परिवार प्रबंधन", "खुराक ट्रैकिंग"] 
    },
    color: "bg-violet-500",
    bgColor: "bg-violet-50"
  },
  {
    id: "community",
    icon: MessageSquare,
    title: { en: "Health Community Forum", hi: "स्वास्थ्य समुदाय मंच" },
    description: { 
      en: "Connect with others, share experiences, ask questions anonymously. Get expert responses from verified doctors.", 
      hi: "दूसरों से जुड़ें, अनुभव साझा करें, गुमनाम रूप से सवाल पूछें। सत्यापित डॉक्टरों से विशेषज्ञ प्रतिक्रियाएं प्राप्त करें।" 
    },
    capabilities: { 
      en: ["Anonymous posting", "Expert answers", "Health categories", "Like & bookmark"], 
      hi: ["गुमनाम पोस्टिंग", "विशेषज्ञ उत्तर", "स्वास्थ्य श्रेणियां", "पसंद और बुकमार्क"] 
    },
    color: "bg-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    id: "challenges",
    icon: Trophy,
    title: { en: "Health Challenges & Rewards", hi: "स्वास्थ्य चुनौतियां और पुरस्कार" },
    description: { 
      en: "Join health challenges, track progress, earn points and badges. Compete with friends on the leaderboard.", 
      hi: "स्वास्थ्य चुनौतियों में शामिल हों, प्रगति ट्रैक करें, अंक और बैज अर्जित करें।" 
    },
    capabilities: { 
      en: ["Daily challenges", "Points & badges", "Leaderboard", "Health tracking"], 
      hi: ["दैनिक चुनौतियां", "अंक और बैज", "लीडरबोर्ड", "स्वास्थ्य ट्रैकिंग"] 
    },
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50"
  },
  {
    id: "health-camps",
    icon: Calendar,
    title: { en: "Health Camps & Events", hi: "स्वास्थ्य शिविर और कार्यक्रम" },
    description: { 
      en: "Discover free health camps nearby. Register for eye camps, blood donation, vaccination drives, and health checkups.", 
      hi: "नजदीकी मुफ्त स्वास्थ्य शिविर खोजें। आंख शिविर, रक्तदान, टीकाकरण अभियान और स्वास्थ्य जांच के लिए रजिस्टर करें।" 
    },
    capabilities: { 
      en: ["Camp discovery", "Online registration", "SMS reminders", "Multiple camp types"], 
      hi: ["शिविर खोज", "ऑनलाइन पंजीकरण", "SMS अनुस्मारक", "कई शिविर प्रकार"] 
    },
    color: "bg-violet-500",
    bgColor: "bg-violet-50"
  },
  {
    id: "volunteers",
    icon: HandHeart,
    title: { en: "Volunteer Health Network", hi: "स्वास्थ्य स्वयंसेवक नेटवर्क" },
    description: { 
      en: "Connect with trained volunteers for first aid, transport, translation, and health education. Verified and rated by community.", 
      hi: "प्राथमिक चिकित्सा, परिवहन, अनुवाद और स्वास्थ्य शिक्षा के लिए प्रशिक्षित स्वयंसेवकों से जुड़ें।" 
    },
    capabilities: { 
      en: ["First aid support", "Transport help", "Translation", "Verified volunteers"], 
      hi: ["प्राथमिक चिकित्सा सहायता", "परिवहन सहायता", "अनुवाद", "सत्यापित स्वयंसेवक"] 
    },
    color: "bg-indigo-400",
    bgColor: "bg-indigo-50"
  },
  {
    id: "emergency",
    icon: AlertTriangle,
    title: { en: "Emergency SOS System", hi: "आपातकालीन SOS प्रणाली" },
    description: { 
      en: "One-tap SOS activation with GPS location sharing. Instantly alert ambulance (108), police (112), family, and nearby volunteers.", 
      hi: "GPS लोकेशन शेयरिंग के साथ वन-टैप SOS एक्टिवेशन। तुरंत एम्बुलेंस (108), पुलिस (112), परिवार और नजदीकी स्वयंसेवकों को अलर्ट करें।" 
    },
    capabilities: { 
      en: ["One-tap SOS", "GPS tracking", "AI first aid", "Instant alerts"], 
      hi: ["वन-टैप SOS", "GPS ट्रैकिंग", "AI प्राथमिक चिकित्सा", "तत्काल अलर्ट"] 
    },
    color: "bg-red-500",
    bgColor: "bg-red-50"
  }
];

// Why Choose Us reasons
const whyChooseReasons = [
  { icon: Globe, title: { en: "8 Indian Languages", hi: "8 भारतीय भाषाएं" }, description: { en: "Access healthcare in your mother tongue", hi: "अपनी मातृभाषा में स्वास्थ्य सेवाएं प्राप्त करें" } },
  { icon: Mic, title: { en: "Voice Enabled", hi: "वॉइस सक्षम" }, description: { en: "Speak your symptoms, get instant help", hi: "अपने लक्षण बोलें, तुरंत मदद प्राप्त करें" } },
  { icon: Shield, title: { en: "Government Verified", hi: "सरकार द्वारा सत्यापित" }, description: { en: "Integrated with NHM & ABDM", hi: "NHM और ABDM के साथ एकीकृत" } },
  { icon: Zap, title: { en: "Instant Response", hi: "तत्काल प्रतिक्रिया" }, description: { en: "AI assistance available 24/7", hi: "AI सहायता 24/7 उपलब्ध" } },
  { icon: Users, title: { en: "For All Indians", hi: "सभी भारतीयों के लिए" }, description: { en: "Rural, urban, young, and old", hi: "ग्रामीण, शहरी, युवा और वृद्ध" } },
  { icon: Award, title: { en: "Trusted Platform", hi: "विश्वसनीय प्लेटफॉर्म" }, description: { en: "4.8★ rating from 1 lakh+ users", hi: "1 लाख+ उपयोगकर्ताओं से 4.8★ रेटिंग" } }
];

// FAQs
const faqs = [
  { 
    question: { en: "Is Swasthya Mitra free to use?", hi: "क्या स्वास्थ्य मित्र उपयोग करना मुफ्त है?" },
    answer: { en: "Yes! Basic features like AI health assistant, facility finder, and government scheme information are completely free. Premium features like unlimited doctor consultations require a subscription.", hi: "हाँ! AI स्वास्थ्य सहायक, सुविधा खोजक और सरकारी योजना जानकारी जैसी बुनियादी सुविधाएं पूरी तरह से मुफ्त हैं।" }
  },
  { 
    question: { en: "How accurate is the AI health advice?", hi: "AI स्वास्थ्य सलाह कितनी सटीक है?" },
    answer: { en: "Our 7-level AI uses WHO guidelines and Indian medical standards. However, it's meant for guidance only - always consult a doctor for serious conditions.", hi: "हमारा 7-स्तरीय AI WHO दिशानिर्देशों और भारतीय चिकित्सा मानकों का उपयोग करता है। हालांकि, यह केवल मार्गदर्शन के लिए है।" }
  },
  { 
    question: { en: "Can I use it without internet?", hi: "क्या मैं इंटरनेट के बिना उपयोग कर सकता हूं?" },
    answer: { en: "Limited offline features are available. You can access your health card, saved reminders, and emergency numbers without internet.", hi: "सीमित ऑफलाइन सुविधाएं उपलब्ध हैं। आप इंटरनेट के बिना अपना स्वास्थ्य कार्ड, सहेजे गए रिमाइंडर और आपातकालीन नंबरों तक पहुंच सकते हैं।" }
  },
  { 
    question: { en: "Is my health data secure?", hi: "क्या मेरा स्वास्थ्य डेटा सुरक्षित है?" },
    answer: { en: "Absolutely! We follow DPDP Act guidelines, use end-to-end encryption, and never share your data without consent.", hi: "बिल्कुल! हम DPDP अधिनियम दिशानिर्देशों का पालन करते हैं, एंड-टू-एंड एन्क्रिप्शन का उपयोग करते हैं।" }
  }
];

interface LandingPageProps {
  language: string;
  setLanguage: (lang: string) => void;
  onLogin: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onRegister: (data: { name: string; phone: string; email?: string; password: string; role?: string; language?: string; district?: string }) => Promise<{ success: boolean; error?: string }>;
}

export default function LandingPage({ language, setLanguage, onLogin, onRegister }: LandingPageProps) {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerData, setRegisterData] = useState({
    name: "", phone: "", email: "", password: "", confirmPassword: "", role: "citizen", district: ""
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = translations[language] || translations.en;

  const handleLogin = async () => {
    if (!loginPhone || !loginPassword) {
      toast.error(language === 'hi' ? 'फोन और पासवर्ड दर्ज करें' : 'Please enter phone and password');
      return;
    }
    setIsLoading(true);
    const result = await onLogin(loginPhone, loginPassword);
    setIsLoading(false);
    if (result.success) {
      setShowLoginDialog(false);
      toast.success(language === 'hi' ? 'सफलतापूर्वक लॉगिन!' : 'Logged in successfully!');
    } else {
      toast.error(result.error || (language === 'hi' ? 'लॉगिन विफल' : 'Login failed'));
    }
  };

  const handleRegister = async () => {
    if (!registerData.name || !registerData.phone || !registerData.password) {
      toast.error(language === 'hi' ? 'सभी आवश्यक फील्ड भरें' : 'Please fill all required fields');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      toast.error(language === 'hi' ? 'पासवर्ड मेल नहीं खाते' : 'Passwords do not match');
      return;
    }
    setIsLoading(true);
    const result = await onRegister({
      name: registerData.name,
      phone: registerData.phone,
      email: registerData.email || undefined,
      password: registerData.password,
      role: registerData.role,
      language,
      district: registerData.district || undefined
    });
    setIsLoading(false);
    if (result.success) {
      setShowLoginDialog(false);
      toast.success(language === 'hi' ? 'पंजीकरण सफल!' : 'Registration successful!');
    } else {
      toast.error(result.error || (language === 'hi' ? 'पंजीकरण विफल' : 'Registration failed'));
    }
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-indigo-600">
                  Swasthya Mitra
                </span>
                <span className="hidden sm:block text-xs text-muted-foreground">சுகாதார நண்பர் / ఆరోగ్య మిత్రుడు / स्वास्थ्य मित्र</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={scrollToFeatures} className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                {t.navFeatures}
              </button>
              <button onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                {t.navAbout}
              </button>
              <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                {t.navContact}
              </button>
              <button onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                {t.navFaq}
              </button>

              {/* Language Selector */}
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-28 h-8 text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  <SelectValue>
                    {languages.find(l => l.code === language)?.name || language}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code} className="text-xs">{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Auth Buttons */}
              <Button 
                onClick={() => { setLoginMode('login'); setShowLoginDialog(true); }}
                variant="ghost"
                className="text-sm"
              >
                <LogIn className="w-4 h-4 mr-1" />
                {t.navLogin}
              </Button>
              <Button 
                onClick={() => { setLoginMode('register'); setShowLoginDialog(true); }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                {t.navSignUp}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue>
                    {languages.find(l => l.code === language)?.name || language}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code} className="text-xs">{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b"
            >
              <div className="px-4 py-4 space-y-3">
                <button onClick={scrollToFeatures} className="block w-full text-left text-gray-600 hover:text-indigo-600 py-2">
                  {t.navFeatures}
                </button>
                <Button 
                  onClick={() => { setLoginMode('login'); setShowLoginDialog(true); setMobileMenuOpen(false); }}
                  variant="outline"
                  className="w-full"
                >
                  <LogIn className="w-4 w-4 mr-2" />
                  {t.navLogin}
                </Button>
                <Button 
                  onClick={() => { setLoginMode('register'); setShowLoginDialog(true); setMobileMenuOpen(false); }}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t.navSignUp}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                <Sparkles className="w-3 h-3 mr-1" />
                {t.badgePlatform}
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                {t.heroTitle}
                <span className="block mt-2 text-indigo-600">
                  {t.heroSubtitle}
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                {t.heroDescription}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Button 
                  size="lg"
                  onClick={() => { setLoginMode('register'); setShowLoginDialog(true); }}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-lg px-8 py-6"
                >
                  {t.getStarted}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={scrollToFeatures}
                  className="text-lg px-8 py-6"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {t.learnMore}
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                  <span>{t.trustFree}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span>{t.trustSecure}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span>{t.trustLanguages}</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-indigo-500 rounded-3xl p-1">
                <div className="bg-white rounded-3xl p-6 space-y-4">
                  {/* Mock Chat Interface */}
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">Swasthya Mitra AI</div>
                      <div className="text-xs text-indigo-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        {language === 'hi' ? '7-स्तरीय AI सक्रिय' : '7-Level AI Active'}
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-3 min-h-[200px]">
                    <div className="flex justify-end">
                      <div className="bg-indigo-100 text-indigo-900 rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%] text-sm">
                        {language === 'hi' ? 'मुझे बुखार और सिरदर्द है' : 'I have fever and headache'}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[90%] text-sm space-y-2">
                        <p className="font-medium">{language === 'hi' ? 'मैं समझता हूं...' : 'I understand...'}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2 rounded-lg border">
                            <span className="font-medium">🌡️ {language === 'hi' ? 'तापमान जांचें' : 'Check Temperature'}</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border">
                            <span className="font-medium">💧 {language === 'hi' ? 'पानी पिएं' : 'Stay Hydrated'}</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border">
                            <span className="font-medium">🏥 {language === 'hi' ? 'नजदीकी अस्पताल' : 'Nearby Hospital'}</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border">
                            <span className="font-medium">💊 {language === 'hi' ? 'दवा जानकारी' : 'Medicine Info'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Mic className="w-5 h-5 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Camera className="w-5 h-5 text-gray-500" />
                    </Button>
                    <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-400">
                      {language === 'hi' ? 'अपना सवाल पूछें...' : 'Ask your question...'}
                    </div>
                    <Button className="rounded-full bg-indigo-500 hover:bg-indigo-600">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 hidden sm:block"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-xs">
                    <div className="font-medium">{language === 'hi' ? 'सटीक निदान' : 'Accurate Diagnosis'}</div>
                    <div className="text-gray-500">AI-Powered</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 hidden sm:block"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xs">
                    <div className="font-medium">1M+ {language === 'hi' ? 'उपयोगकर्ता' : 'Users'}</div>
                    <div className="text-gray-500">{language === 'hi' ? 'भरोसेमंद' : 'Trusted'}</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-indigo-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '1M+', label: t.statsUsers, icon: Users },
              { value: '500K+', label: t.statsConsultations, icon: Activity },
              { value: '700+', label: t.statsDistricts, icon: MapPin },
              { value: '4.8★', label: t.statsRating, icon: Star }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center text-white"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="text-3xl sm:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t.howItWorks}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'hi' 
                ? 'तीन सरल चरणों में गुणवत्तापूर्ण स्वास्थ्य सेवा प्राप्त करें' 
                : 'Get quality healthcare in three simple steps'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: t.step1Title, description: t.step1Desc, icon: MessageSquare, color: "bg-indigo-400" },
              { step: 2, title: t.step2Title, description: t.step2Desc, icon: Brain, color: "bg-purple-500" },
              { step: 3, title: t.step3Title, description: t.step3Desc, icon: Heart, color: "bg-indigo-600" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="relative"
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center font-bold text-indigo-600">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 -translate-x-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700">
              {language === 'hi' ? '12+ एकीकृत सुविधाएं' : '12+ Integrated Features'}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.featuresTitle}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t.featuresSubtitle}</p>
          </div>

          {/* Category Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 bg-white p-2 rounded-xl shadow-sm h-auto">
              <TabsTrigger value="all" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg">
                {language === 'hi' ? 'सभी' : 'All'}
              </TabsTrigger>
              <TabsTrigger value="consult" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg">
                {language === 'hi' ? 'परामर्श' : 'Consult'}
              </TabsTrigger>
              <TabsTrigger value="pharmacy" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg">
                {language === 'hi' ? 'फार्मेसी' : 'Pharmacy'}
              </TabsTrigger>
              <TabsTrigger value="records" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg">
                {language === 'hi' ? 'रिकॉर्ड' : 'Records'}
              </TabsTrigger>
              <TabsTrigger value="community" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg">
                {language === 'hi' ? 'समुदाय' : 'Community'}
              </TabsTrigger>
              <TabsTrigger value="emergency" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg">
                {language === 'hi' ? 'आपातकाल' : 'Emergency'}
              </TabsTrigger>
            </TabsList>

            {/* All Features */}
            <TabsContent value="all" className="mt-0">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allFeatures.map((feature, i) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all border-2 hover:border-indigo-300 cursor-pointer group">
                      <CardContent className="p-5">
                        <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">
                          {feature.title[language as keyof typeof feature.title] || feature.title.en}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {feature.description[language as keyof typeof feature.description] || feature.description.en}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(feature.capabilities[language as keyof typeof feature.capabilities] || feature.capabilities.en).slice(0, 2).map((cap: string, j: number) => (
                            <Badge key={j} variant="secondary" className="text-xs">{cap}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Consultation Features */}
            <TabsContent value="consult" className="mt-0">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allFeatures.filter(f => ['ai-assistant', 'telemedicine', 'facilities'].includes(f.id)).map((feature, i) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all border-2 hover:border-indigo-300">
                      <CardContent className="p-5">
                        <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">
                          {feature.title[language as keyof typeof feature.title] || feature.title.en}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {feature.description[language as keyof typeof feature.description] || feature.description.en}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(feature.capabilities[language as keyof typeof feature.capabilities] || feature.capabilities.en).map((cap: string, j: number) => (
                            <Badge key={j} variant="secondary" className="text-xs">{cap}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Pharmacy Features */}
            <TabsContent value="pharmacy" className="mt-0">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allFeatures.filter(f => ['e-pharmacy', 'reminders', 'vaccination'].includes(f.id)).map((feature, i) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all border-2 hover:border-indigo-300">
                      <CardContent className="p-5">
                        <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">
                          {feature.title[language as keyof typeof feature.title] || feature.title.en}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {feature.description[language as keyof typeof feature.description] || feature.description.en}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(feature.capabilities[language as keyof typeof feature.capabilities] || feature.capabilities.en).map((cap: string, j: number) => (
                            <Badge key={j} variant="secondary" className="text-xs">{cap}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Records Features */}
            <TabsContent value="records" className="mt-0">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allFeatures.filter(f => ['health-card', 'govt-schemes'].includes(f.id)).map((feature, i) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all border-2 hover:border-indigo-300">
                      <CardContent className="p-5">
                        <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">
                          {feature.title[language as keyof typeof feature.title] || feature.title.en}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {feature.description[language as keyof typeof feature.description] || feature.description.en}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(feature.capabilities[language as keyof typeof feature.capabilities] || feature.capabilities.en).map((cap: string, j: number) => (
                            <Badge key={j} variant="secondary" className="text-xs">{cap}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Community Features */}
            <TabsContent value="community" className="mt-0">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allFeatures.filter(f => ['community', 'challenges', 'health-camps', 'volunteers'].includes(f.id)).map((feature, i) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all border-2 hover:border-indigo-300">
                      <CardContent className="p-5">
                        <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">
                          {feature.title[language as keyof typeof feature.title] || feature.title.en}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {feature.description[language as keyof typeof feature.description] || feature.description.en}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(feature.capabilities[language as keyof typeof feature.capabilities] || feature.capabilities.en).map((cap: string, j: number) => (
                            <Badge key={j} variant="secondary" className="text-xs">{cap}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Emergency Features */}
            <TabsContent value="emergency" className="mt-0">
              <div className="grid sm:grid-cols-2 gap-4">
                {allFeatures.filter(f => ['emergency'].includes(f.id)).map((feature, i) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all border-2 hover:border-red-300">
                      <CardContent className="p-5">
                        <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-2">
                          {feature.title[language as keyof typeof feature.title] || feature.title.en}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {feature.description[language as keyof typeof feature.description] || feature.description.en}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(feature.capabilities[language as keyof typeof feature.capabilities] || feature.capabilities.en).map((cap: string, j: number) => (
                            <Badge key={j} variant="secondary" className="text-xs">{cap}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {/* Emergency Numbers Card */}
                <Card className="bg-red-50 border-2 border-red-200">
                  <CardContent className="p-5">
                    <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center mb-4">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{language === 'hi' ? 'आपातकालीन हेल्पलाइन' : 'Emergency Helplines'}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <span className="text-sm">{language === 'hi' ? 'एम्बुलेंस' : 'Ambulance'}</span>
                        <Badge className="bg-red-500">108</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <span className="text-sm">{language === 'hi' ? 'आपातकालीन' : 'Emergency'}</span>
                        <Badge className="bg-orange-500">112</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <span className="text-sm">{language === 'hi' ? 'महिला हेल्पलाइन' : 'Women Helpline'}</span>
                        <Badge className="bg-pink-500">181</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <span className="text-sm">{language === 'hi' ? 'बाल हेल्पलाइन' : 'Child Helpline'}</span>
                        <Badge className="bg-blue-500">1098</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.whyChooseUs}</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseReasons.map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                      <reason.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold mb-2">
                      {reason.title[language as keyof typeof reason.title] || reason.title.en}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {reason.description[language as keyof typeof reason.description] || reason.description.en}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {language === 'hi' ? 'लोग क्या कहते हैं' : 'What People Say'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: t.testimonial1, name: language === 'hi' ? 'सुनीता शर्मा' : 'Sunita Sharma', role: language === 'hi' ? 'गृहिणी, दिल्ली' : 'Homemaker, Delhi', rating: 5 },
              { quote: t.testimonial2, name: language === 'hi' ? 'राजेश कुमार' : 'Rajesh Kumar', role: language === 'hi' ? 'किसान, उत्तर प्रदेश' : 'Farmer, UP', rating: 5 },
              { quote: t.testimonial3, name: language === 'hi' ? 'प्रिया पटेल' : 'Priya Patel', role: language === 'hi' ? 'शिक्षक, गुजरात' : 'Teacher, Gujarat', rating: 5 }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="font-semibold text-indigo-600">{testimonial.name[0]}</span>
                      </div>
                      <div>
                        <div className="font-medium">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {language === 'hi' ? 'हमसे संपर्क करें' : 'Contact Us'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'hi' 
                ? 'किसी भी सवाल या सहायता के लिए हमसे संपर्क करें। हमारी टीम जल्द ही आपसे संपर्क करेगी।' 
                : 'Have a question or need help? Our team will get back to you within 24 hours.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="p-6">
              <CardContent className="space-y-4 pt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'hi' ? 'नाम *' : 'Name *'}</Label>
                    <Input placeholder={language === 'hi' ? 'आपका नाम' : 'Your name'} id="enquiry-name" />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'hi' ? 'फोन नंबर *' : 'Phone Number *'}</Label>
                    <Input placeholder="9876543210" id="enquiry-phone" type="tel" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'hi' ? 'ईमेल (वैकल्पिक)' : 'Email (Optional)'}</Label>
                  <Input placeholder="email@example.com" id="enquiry-email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'hi' ? 'श्रेणी' : 'Category'}</Label>
                  <Select defaultValue="general">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{language === 'hi' ? 'सामान्य पूछताछ' : 'General Enquiry'}</SelectItem>
                      <SelectItem value="support">{language === 'hi' ? 'तकनीकी सहायता' : 'Technical Support'}</SelectItem>
                      <SelectItem value="feedback">{language === 'hi' ? 'प्रतिक्रिया' : 'Feedback'}</SelectItem>
                      <SelectItem value="partnership">{language === 'hi' ? 'साझेदारी' : 'Partnership'}</SelectItem>
                      <SelectItem value="complaint">{language === 'hi' ? 'शिकायत' : 'Complaint'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'hi' ? 'विषय *' : 'Subject *'}</Label>
                  <Input placeholder={language === 'hi' ? 'अपना विषय लिखें' : 'Enter your subject'} id="enquiry-subject" />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'hi' ? 'संदेश *' : 'Message *'}</Label>
                  <textarea 
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={language === 'hi' ? 'अपना संदेश यहाँ लिखें...' : 'Type your message here...'}
                    id="enquiry-message"
                  />
                </div>
                <Button 
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                  onClick={async () => {
                    const name = (document.getElementById('enquiry-name') as HTMLInputElement)?.value;
                    const phone = (document.getElementById('enquiry-phone') as HTMLInputElement)?.value;
                    const email = (document.getElementById('enquiry-email') as HTMLInputElement)?.value;
                    const subject = (document.getElementById('enquiry-subject') as HTMLInputElement)?.value;
                    const message = (document.getElementById('enquiry-message') as HTMLTextAreaElement)?.value;
                    const categorySelect = document.querySelector('[data-state]') as HTMLElement;
                    const category = 'general'; // Default

                    if (!name || !phone || !subject || !message) {
                      toast.error(language === 'hi' ? 'कृपया सभी आवश्यक फील्ड भरें' : 'Please fill all required fields');
                      return;
                    }

                    try {
                      const response = await fetch('/api/enquiries', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, phone, email, subject, message, category })
                      });
                      const data = await response.json();
                      if (data.success) {
                        toast.success(language === 'hi' ? 'आपकी पूछताछ दर्ज हो गई है। हम जल्द ही संपर्क करेंगे।' : 'Your enquiry has been submitted. We will contact you soon.');
                        // Clear form
                        (document.getElementById('enquiry-name') as HTMLInputElement).value = '';
                        (document.getElementById('enquiry-phone') as HTMLInputElement).value = '';
                        (document.getElementById('enquiry-email') as HTMLInputElement).value = '';
                        (document.getElementById('enquiry-subject') as HTMLInputElement).value = '';
                        (document.getElementById('enquiry-message') as HTMLTextAreaElement).value = '';
                      } else {
                        toast.error(data.error || (language === 'hi' ? 'त्रुटि हुई' : 'An error occurred'));
                      }
                    } catch {
                      toast.error(language === 'hi' ? 'त्रुटि हुई' : 'An error occurred');
                    }
                  }}
                >
                  {language === 'hi' ? 'जमा करें' : 'Submit'}
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="p-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5 text-indigo-500" />
                    {language === 'hi' ? 'हेल्पलाइन नंबर' : 'Helpline Numbers'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'hi' ? 'टोल फ्री' : 'Toll Free'}</span>
                      <span className="font-medium">1800-XXX-XXXX</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'hi' ? 'समर्थन' : 'Support'}</span>
                      <span className="font-medium">+91-XXXX-XXX-XXX</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-500" />
                    {language === 'hi' ? 'कार्य समय' : 'Working Hours'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'hi' ? 'सोमवार - शुक्रवार' : 'Monday - Friday'}</span>
                      <span className="font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'hi' ? 'शनिवार' : 'Saturday'}</span>
                      <span className="font-medium">9:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'hi' ? 'रविवार' : 'Sunday'}</span>
                      <span className="font-medium text-red-500">{language === 'hi' ? 'बंद' : 'Closed'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                    {language === 'hi' ? 'ईमेल' : 'Email'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'hi' ? 'सामान्य पूछताछ' : 'General Enquiry'}</span>
                      <span className="font-medium">info@swasthyamitra.in</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'hi' ? 'सहायता' : 'Support'}</span>
                      <span className="font-medium">support@swasthyamitra.in</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-indigo-500" />
                    {language === 'hi' ? 'पता' : 'Address'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <p>Swasthya Mitra Health Tech Pvt. Ltd.</p>
                  <p>Tech Park, Sector 15, Noida</p>
                  <p>Uttar Pradesh - 201301, India</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-lg px-6 border">
                <AccordionTrigger className="hover:no-underline">
                  {faq.question[language as keyof typeof faq.question] || faq.question.en}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer[language as keyof typeof faq.answer] || faq.answer.en}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Emergency Numbers Banner */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-red-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white mb-4">
            <h3 className="text-xl font-bold">{t.emergencyTitle}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: language === 'hi' ? 'एम्बुलेंस' : 'Ambulance', number: '108', icon: '🚑' },
              { name: language === 'hi' ? 'आपातकालीन' : 'Emergency', number: '112', icon: '🆘' },
              { name: language === 'hi' ? 'महिला हेल्पलाइन' : 'Women Helpline', number: '181', icon: '👩' },
              { name: language === 'hi' ? 'बाल हेल्पलाइन' : 'Child Helpline', number: '1098', icon: '👶' }
            ].map((emergency, i) => (
              <div key={i} className="bg-white/20 backdrop-blur rounded-xl p-4 text-center text-white">
                <div className="text-2xl mb-1">{emergency.icon}</div>
                <div className="font-bold text-2xl">{emergency.number}</div>
                <div className="text-sm opacity-90">{emergency.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-indigo-500 rounded-3xl p-8 sm:p-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.ctaTitle}</h2>
            <p className="text-white/80 mb-8 text-lg">{t.ctaSubtitle}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => { setLoginMode('register'); setShowLoginDialog(true); }}
                className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-6"
              >
                {t.getStarted}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => { setLoginMode('login'); setShowLoginDialog(true); }}
                className="border-white text-black! hover:bg-white/10 text-lg px-8 py-6"
              >
                <LogIn className="w-5 h-5 mr-2" />
                {t.alreadyUser}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">Swasthya Mitra</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                {language === 'hi' 
                  ? 'भारत का पहला 7-स्तरीय AI स्वास्थ्य प्लेटफॉर्म। गुणवत्तापूर्ण स्वास्थ्य सेवा सबके लिए।'
                  : 'India\'s first 7-level AI health platform. Quality healthcare for all.'}
              </p>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold mb-4">{t.footerFeatures}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer">{language === 'hi' ? 'AI सहायक' : 'AI Assistant'}</li>
                <li className="hover:text-white cursor-pointer">{language === 'hi' ? 'टेलीमेडिसिन' : 'Telemedicine'}</li>
                <li className="hover:text-white cursor-pointer">{language === 'hi' ? 'ई-फार्मेसी' : 'E-Pharmacy'}</li>
                <li className="hover:text-white cursor-pointer">{language === 'hi' ? 'स्वास्थ्य कार्ड' : 'Health Card'}</li>
                <li className="hover:text-white cursor-pointer">{language === 'hi' ? 'सरकारी योजनाएं' : 'Govt Schemes'}</li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">{t.footerSupport}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer">{language === 'hi' ? 'सहायता केंद्र' : 'Help Center'}</li>
                <li className="hover:text-white cursor-pointer">{language === 'hi' ? 'संपर्क करें' : 'Contact Us'}</li>
                <li className="hover:text-white cursor-pointer">{language === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}</li>
                <li className="hover:text-white cursor-pointer">{language === 'hi' ? 'नियत शर्तें' : 'Terms of Service'}</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">{t.footerContact}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  1800-XXX-XXXX
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  support@swasthyamitra.in
                </li>
              </ul>
              <div className="flex gap-4 mt-4">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 Swasthya Mitra. {language === 'hi' ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>

      {/* Login/Register Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {loginMode === 'login' ? t.loginTitle : t.registerTitle}
            </DialogTitle>
            <DialogDescription>
              {loginMode === 'login' ? t.loginDesc : t.registerDesc}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={loginMode} onValueChange={(v) => setLoginMode(v as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t.navLogin}</TabsTrigger>
              <TabsTrigger value="register">{t.navSignUp}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              {/* Test Credentials */}
              <div className="bg-indigo-50 dark:bg-indigo-950 rounded-lg p-3 border border-indigo-200">
                <p className="text-xs font-medium text-indigo-700 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {t.testCredentials}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button 
                    onClick={() => { setLoginPhone('9876543210'); setLoginPassword('test123'); }}
                    className="text-left p-2 bg-white rounded border hover:border-indigo-400 transition-colors"
                  >
                    <span className="font-medium text-indigo-600">Citizen</span>
                    <br />
                    <span className="text-gray-500">9876543210</span>
                  </button>
                  <button 
                    onClick={() => { setLoginPhone('9876543211'); setLoginPassword('test123'); }}
                    className="text-left p-2 bg-white rounded border hover:border-indigo-400 transition-colors"
                  >
                    <span className="font-medium text-indigo-600">Health Worker</span>
                    <br />
                    <span className="text-gray-500">9876543211</span>
                  </button>
                  <button 
                    onClick={() => { setLoginPhone('9876543212'); setLoginPassword('test123'); }}
                    className="text-left p-2 bg-white rounded border hover:border-indigo-400 transition-colors"
                  >
                    <span className="font-medium text-indigo-600">Doctor</span>
                    <br />
                    <span className="text-gray-500">9876543212</span>
                  </button>
                  <button 
                    onClick={() => { setLoginPhone('9876543213'); setLoginPassword('admin123'); }}
                    className="text-left p-2 bg-white rounded border hover:border-indigo-400 transition-colors"
                  >
                    <span className="font-medium text-indigo-600">Admin</span>
                    <br />
                    <span className="text-gray-500">9876543213</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">{t.passwordHint}</p>
              </div>

              <div className="space-y-2">
                <Label>{t.phoneLabel}</Label>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.passwordLabel}</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t.loginBtn}
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t.fullNameLabel} *</Label>
                <Input
                  placeholder={language === 'hi' ? 'आपका नाम' : 'Your name'}
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.phoneLabel} *</Label>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.emailLabel}</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.passwordLabel} *</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.confirmPasswordLabel} *</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.districtLabel}</Label>
                <Input
                  placeholder={language === 'hi' ? 'आपका जिला' : 'Your district'}
                  value={registerData.district}
                  onChange={(e) => setRegisterData({ ...registerData, district: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t.registerBtn}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Loading spinner component
function Loader2({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
