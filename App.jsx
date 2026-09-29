import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { Html5Qrcode } from "html5-qrcode";
import * as faceapi from "@vladmandic/face-api";
import {
  generateAttendanceQRLink,
  parseAttendanceSessionFromUrl,
} from "./environment";
import {
  LayoutDashboard,
  QrCode,
  Map,
  History,
  AlertTriangle,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  Activity,
  CalendarDays,
  Search,
  Plus,
  CheckCircle2,
  Camera,
  ShieldCheck,
  Download,
  Printer,
  Clock3,
  Navigation,
  Wifi,
  WifiOff,
  Building2,
  ChevronRight,
  Moon,
  Sun,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  UserRound,
  GraduationCap,
  BarChart3,
  ClipboardList,
  RefreshCw,
  CreditCard,
  Receipt,
  CircleDollarSign,
  Bot,
  Send,
  Sparkles,
  FileText,
  DoorOpen,
  Award,
  Home,
  UtensilsCrossed,
  Megaphone,
  Wrench,
  ArrowRight,
  Zap,
  Layers,
  MessageSquare,
  Eye,
  Hash,
  Briefcase,
  Upload,
  CalendarCheck,
} from "lucide-react";

const locations = [
  ["Main Library", "Central Block", "Ground", "Academic", "3 min"],
  ["CSE Lab", "B-Block", "2nd", "Lab", "5 min"],
  ["Canteen", "Student Activity Center", "Ground", "Food", "4 min"],
  ["Principal Office", "Admin Block", "1st", "Admin", "7 min"],
  ["Sports Complex", "East Wing", "Ground", "Sports", "8 min"],
  ["Academic Block", "Central Block", "1st", "Academic", "2 min"],
  ["Admin Block", "Admin Block", "Ground", "Admin", "6 min"],
  ["Parking", "North Gate", "Ground", "Transport", "9 min"],
  ["Main Gate", "Entrance", "Ground", "Security", "1 min"],
];

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
const demoClubs = [
  {
    id: "demo-club-coding",
    name: "Coding Club",
    category: "Technology",
    description:
      "Build projects, practice problem-solving, and prepare for coding competitions with fellow developers.",
    coordinator: "Dr. Ananya Rao",
    memberIds: [],
  },
  {
    id: "demo-club-robotics",
    name: "Robotics Club",
    category: "Engineering",
    description:
      "Design, build, and program robots through hands-on projects and collaborative workshops.",
    coordinator: "Prof. Vikram Shah",
    memberIds: [],
  },
  {
    id: "demo-club-cultural",
    name: "Cultural Club",
    category: "Arts & Culture",
    description:
      "Celebrate campus creativity through music, dance, theatre, and cultural exchange.",
    coordinator: "Dr. Meera Nair",
    memberIds: [],
  },
  {
    id: "demo-club-sports",
    name: "Sports Club",
    category: "Athletics",
    description:
      "Bring students together for training, recreation, and competitive campus sports.",
    coordinator: "Coach Arjun Patel",
    memberIds: [],
  },
];
const demoEvents = [
  {
    id: "demo-event-hackathon-2026",
    name: "Campus Hackathon 2026",
    date: "2026-10-17",
    time: "09:00",
    venue: "Innovation Center",
    description:
      "A 24-hour team hackathon to prototype practical solutions for campus and community challenges.",
    clubName: "Coding Club",
    maxParticipants: 120,
    cancelled: false,
  },
  {
    id: "demo-event-robotics-workshop",
    name: "Robotics Workshop",
    date: "2026-10-08",
    time: "14:00",
    venue: "Engineering Lab 2",
    description:
      "An introductory hands-on session on sensors, microcontrollers, and autonomous robot design.",
    clubName: "Robotics Club",
    maxParticipants: 40,
    cancelled: false,
  },
  {
    id: "demo-event-cultural-fest-2026",
    name: "Cultural Fest 2026",
    date: "2026-11-06",
    time: "10:00",
    venue: "Open-Air Amphitheatre",
    description:
      "A full day of student performances, creative showcases, and cultural activities.",
    clubName: "Cultural Club",
    maxParticipants: 500,
    cancelled: false,
  },
  {
    id: "demo-event-sports-meet",
    name: "Inter College Sports Meet",
    date: "2026-11-20",
    time: "08:00",
    venue: "Campus Sports Complex",
    description:
      "A multi-sport meet welcoming teams from colleges across the region.",
    clubName: "Sports Club",
    maxParticipants: 300,
    cancelled: false,
  },
];
function loadDemoEntries(key, demoEntries) {
  const stored = load(key, []);
  const entries = Array.isArray(stored) ? [...stored] : [];
  let changed = !Array.isArray(stored);
  demoEntries.forEach((demo) => {
    const name = String(demo.name || "")
      .trim()
      .toLowerCase();
    if (
      !entries.some(
        (entry) =>
          entry.id === demo.id ||
          String(entry.name || "")
            .trim()
            .toLowerCase() === name,
      )
    ) {
      entries.push(demo);
      changed = true;
    }
  });
  if (changed) save(key, entries);
  return entries;
}
function readConnectivity() {
  const online = typeof navigator === "undefined" || navigator.onLine !== false;
  const connection =
    typeof navigator === "undefined"
      ? null
      : navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;
  const effectiveType = connection?.effectiveType || "";
  const slowDownlink =
    Number.isFinite(connection?.downlink) &&
    connection.downlink > 0 &&
    connection.downlink < 1.5;
  const lowData =
    !online ||
    Boolean(connection?.saveData) ||
    ["slow-2g", "2g"].includes(effectiveType) ||
    slowDownlink;
  return { online, lowData, effectiveType };
}
const LanguageContext = React.createContext("English");
const regionalUiText = {
  Hindi: {
    Dashboard: "डैशबोर्ड",
    "Admin Analytics": "प्रशासक विश्लेषण",
    "Mark Attendance": "उपस्थिति दर्ज करें",
    "Attendance History": "उपस्थिति इतिहास",
    "Daily Timetable": "दैनिक समय-सारणी",
    "Lost & Found": "खोया-पाया",
    "Visitor + Gate Logs": "आगंतुक एवं गेट लॉग",
    "Room + Asset Records": "कमरा एवं परिसंपत्ति रिकॉर्ड",
    "Teacher Management": "शिक्षक प्रबंधन",
    "Admin Management": "प्रशासक प्रबंधन",
    "Warden Management": "वार्डन प्रबंधन",
    "Student Registration Approval": "छात्र पंजीकरण स्वीकृति",
    "Student Academic Details": "छात्र शैक्षणिक विवरण",
    "Notice Management": "सूचना प्रबंधन",
    "Gate Pass Management": "गेट पास प्रबंधन",
    "Certificate Management": "प्रमाणपत्र प्रबंधन",
    "Complaint Management": "शिकायत प्रबंधन",
    "Placement Management": "प्लेसमेंट प्रबंधन",
    "Campus Map": "परिसर मानचित्र",
    "Timetable Management": "समय-सारणी प्रबंधन",
    "Teacher Salaries": "शिक्षक वेतन",
    Feedback: "प्रतिक्रिया",
    Settings: "सेटिंग्स",
    Notifications: "सूचनाएँ",
    Logout: "लॉग आउट",
    Language: "भाषा",
    "Campus Operations Center": "कैंपस संचालन केंद्र",
    "Admin Analytics": "प्रशासक विश्लेषण",
    "Review pending ageing, resolution times, and repeated complaint or request categories.":
      "लंबित अवधि, समाधान समय और बार-बार आने वाली शिकायतों या अनुरोधों की श्रेणियाँ देखें।",
    "Pending Items": "लंबित मामले",
    "Requests and complaints": "अनुरोध और शिकायतें",
    "Pending Complaints": "लंबित शिकायतें",
    "Open or in progress": "खुली या जारी",
    "Resolved Items": "समाधान किए गए मामले",
    "Average Resolution": "औसत समाधान समय",
    "Where timestamps are available": "जहाँ समय-मुद्राएँ उपलब्ध हैं",
    "Pending Request / Complaint Ageing": "लंबित अनुरोध / शिकायत अवधि",
    "Age is measured from the available creation or request date.":
      "अवधि उपलब्ध निर्माण या अनुरोध तिथि से मापी जाती है।",
    Record: "रिकॉर्ड",
    Type: "प्रकार",
    Category: "श्रेणी",
    Status: "स्थिति",
    "Pending For": "लंबित अवधि",
    "No pending requests or complaints.": "कोई लंबित अनुरोध या शिकायत नहीं।",
    "Resolution Time": "समाधान समय",
    "Older records without completion timestamps are marked Not recorded.":
      "समापन समय-मुद्रा के बिना पुराने रिकॉर्ड को दर्ज नहीं दिखाया गया है।",
    "No resolved records yet.": "अभी तक कोई हल किया गया रिकॉर्ड नहीं।",
    "Recurring Issues": "बार-बार आने वाली समस्याएँ",
    "Categories appearing more than once across complaints and requests.":
      "शिकायतों और अनुरोधों में एक से अधिक बार आने वाली श्रेणियाँ।",
    "No repeated categories yet.": "अभी तक कोई दोहराई गई श्रेणी नहीं।",
    "Not recorded": "दर्ज नहीं",
    Unknown: "अज्ञात",
    "Visitor Name": "आगंतुक का नाम",
    "Student / Host": "छात्र / मेज़बान",
    Purpose: "उद्देश्य",
    "Entry Time": "प्रवेश समय",
    "Exit Time": "निकास समय",
    "Room Number": "कमरा नंबर",
    "Hostel / Block": "छात्रावास / ब्लॉक",
    Capacity: "क्षमता",
    Occupants: "निवासी",
    Assets: "परिसंपत्तियाँ",
    Working: "कार्यशील",
    Damaged: "क्षतिग्रस्त",
    "Maintenance Required": "मरम्मत आवश्यक",
    Inside: "अंदर",
    Exited: "बाहर जा चुके",
    Approve: "स्वीकृत करें",
    Reject: "अस्वीकार करें",
    Submit: "जमा करें",
    Save: "सहेजें",
    "Save Changes": "परिवर्तन सहेजें",
    Cancel: "रद्द करें",
    Delete: "हटाएँ",
    Search: "खोजें",
    Add: "जोड़ें",
    "Add Room": "कमरा जोड़ें",
    "Add Asset": "परिसंपत्ति जोड़ें",
    "Add Visitor": "आगंतुक जोड़ें",
    "Mark Exited": "बाहर गया चिह्नित करें",
    "Update Status": "स्थिति अपडेट करें",
    "Mark In Progress": "कार्य जारी चिह्नित करें",
    "Mark as Resolved": "समाधान चिह्नित करें",
    "Show Digital Pass": "डिजिटल पास दिखाएँ",
    Investigate: "जाँच करें",
    Open: "खुला",
    "In Progress": "जारी",
    Resolved: "समाधान हुआ",
    Closed: "बंद",
    Pending: "लंबित",
    "Pending Admin Approval": "प्रशासक की स्वीकृति लंबित",
    "Admin Approved - Pending Warden":
      "प्रशासक स्वीकृत - वार्डन की स्वीकृति लंबित",
    "Pending Warden Approval": "वार्डन की स्वीकृति लंबित",
    Approved: "स्वीकृत",
    Rejected: "अस्वीकृत",
    "Rejected by Admin": "प्रशासक द्वारा अस्वीकृत",
    "Rejected by Warden": "वार्डन द्वारा अस्वीकृत",
    Submitted: "जमा किया गया",
    Generated: "तैयार",
    Present: "उपस्थित",
    Absent: "अनुपस्थित",
    Paid: "भुगतान किया गया",
    Unpaid: "भुगतान बाकी",
    "Pending Admin Approval": "प्रशासक की स्वीकृति लंबित",
    Student: "छात्र",
    Admin: "प्रशासक",
    Warden: "वार्डन",
    Teacher: "शिक्षक",
    Reason: "कारण",
    Date: "तिथि",
    Time: "समय",
    Name: "नाम",
    All: "सभी",
    Apply: "लागू करें",
    Close: "बंद करें",
  },
  Odia: {
    Dashboard: "ଡ୍ୟାସବୋର୍ଡ",
    "Admin Analytics": "ପ୍ରଶାସକ ବିଶ୍ଳେଷଣ",
    "Mark Attendance": "ଉପସ୍ଥାନ ଦର୍ଜ କରନ୍ତୁ",
    "Attendance History": "ଉପସ୍ଥାନ ଇତିହାସ",
    "Daily Timetable": "ଦୈନିକ ସମୟସୂଚୀ",
    "Lost & Found": "ହଜିଥିବା ଓ ମିଳିଥିବା",
    "Visitor + Gate Logs": "ଦର୍ଶନାର୍ଥୀ ଓ ଗେଟ୍ ଲଗ୍",
    "Room + Asset Records": "କୋଠରୀ ଓ ସମ୍ପତ୍ତି ରେକର୍ଡ",
    "Teacher Management": "ଶିକ୍ଷକ ପରିଚାଳନା",
    "Admin Management": "ପ୍ରଶାସକ ପରିଚାଳନା",
    "Warden Management": "ୱାର୍ଡେନ ପରିଚାଳନା",
    "Student Registration Approval": "ଛାତ୍ର ପଞ୍ଜୀକରଣ ଅନୁମୋଦନ",
    "Student Academic Details": "ଛାତ୍ର ଶିକ୍ଷାଗତ ବିବରଣୀ",
    "Notice Management": "ସୂଚନା ପରିଚାଳନା",
    "Gate Pass Management": "ଗେଟ୍ ପାସ୍ ପରିଚାଳନା",
    "Certificate Management": "ପ୍ରମାଣପତ୍ର ପରିଚାଳନା",
    "Complaint Management": "ଅଭିଯୋଗ ପରିଚାଳନା",
    "Placement Management": "ପ୍ଲେସମେଣ୍ଟ ପରିଚାଳନା",
    "Campus Map": "କ୍ୟାମ୍ପସ ମାନଚିତ୍ର",
    "Timetable Management": "ସମୟସୂଚୀ ପରିଚାଳନା",
    "Teacher Salaries": "ଶିକ୍ଷକ ଦରମା",
    Feedback: "ମତାମତ",
    Settings: "ସେଟିଂସ୍",
    Notifications: "ବିଜ୍ଞପ୍ତି",
    Logout: "ଲଗ୍ ଆଉଟ୍",
    Language: "ଭାଷା",
    "Campus Operations Center": "କ୍ୟାମ୍ପସ ପରିଚାଳନା କେନ୍ଦ୍ର",
    "Review pending ageing, resolution times, and repeated complaint or request categories.":
      "ବକେୟା ସମୟ, ସମାଧାନ ସମୟ ଏବଂ ପୁନରାବୃତ୍ତ ଅଭିଯୋଗ କିମ୍ବା ଅନୁରୋଧ ବର୍ଗ ଦେଖନ୍ତୁ।",
    "Pending Items": "ବକେୟା ମାମଲା",
    "Requests and complaints": "ଅନୁରୋଧ ଓ ଅଭିଯୋଗ",
    "Pending Complaints": "ବକେୟା ଅଭିଯୋଗ",
    "Open or in progress": "ଖୋଲା କିମ୍ବା ଚାଲୁ",
    "Resolved Items": "ସମାଧାନ ହୋଇଥିବା ମାମଲା",
    "Average Resolution": "ହାରାହାରି ସମାଧାନ ସମୟ",
    "Where timestamps are available": "ସମୟ ରେକର୍ଡ ଥିବା ସ୍ଥାନରେ",
    "Pending Request / Complaint Ageing": "ବକେୟା ଅନୁରୋଧ / ଅଭିଯୋଗ ସମୟ",
    "Age is measured from the available creation or request date.":
      "ଉପଲବ୍ଧ ସୃଷ୍ଟି କିମ୍ବା ଅନୁରୋଧ ତାରିଖରୁ ସମୟ ଗଣନା ହୁଏ।",
    Record: "ରେକର୍ଡ",
    Type: "ପ୍ରକାର",
    Category: "ବର୍ଗ",
    Status: "ସ୍ଥିତି",
    "Pending For": "ବକେୟା ସମୟ",
    "No pending requests or complaints.":
      "କୌଣସି ବକେୟା ଅନୁରୋଧ କିମ୍ବା ଅଭିଯୋଗ ନାହିଁ।",
    "Resolution Time": "ସମାଧାନ ସମୟ",
    "Older records without completion timestamps are marked Not recorded.":
      "ସମାପ୍ତି ସମୟ ନଥିବା ପୁରୁଣା ରେକର୍ଡକୁ ଲିପିବଦ୍ଧ ନୁହେଁ ବୋଲି ଦର୍ଶାଯାଏ।",
    "No resolved records yet.": "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ସମାଧାନ ରେକର୍ଡ ନାହିଁ।",
    "Recurring Issues": "ପୁନରାବୃତ୍ତ ସମସ୍ୟା",
    "Categories appearing more than once across complaints and requests.":
      "ଅଭିଯୋଗ ଓ ଅନୁରୋଧରେ ଏକାଧିକ ଥର ଦେଖାଯାଉଥିବା ବର୍ଗ।",
    "No repeated categories yet.": "ଏପର୍ଯ୍ୟନ୍ତ ପୁନରାବୃତ୍ତ ବର୍ଗ ନାହିଁ।",
    "Not recorded": "ଲିପିବଦ୍ଧ ନୁହେଁ",
    Unknown: "ଅଜଣା",
    "Visitor Name": "ଦର୍ଶନାର୍ଥୀଙ୍କ ନାମ",
    "Student / Host": "ଛାତ୍ର / ଆତିଥେୟ",
    Purpose: "ଉଦ୍ଦେଶ୍ୟ",
    "Entry Time": "ପ୍ରବେଶ ସମୟ",
    "Exit Time": "ପ୍ରସ୍ଥାନ ସମୟ",
    "Room Number": "କୋଠରୀ ନମ୍ବର",
    "Hostel / Block": "ଛାତ୍ରାବାସ / ବ୍ଲକ୍",
    Capacity: "କ୍ଷମତା",
    Occupants: "ଅଧିବାସୀ",
    Assets: "ସମ୍ପତ୍ତି",
    Working: "କାର୍ଯ୍ୟକ୍ଷମ",
    Damaged: "କ୍ଷତିଗ୍ରସ୍ତ",
    "Maintenance Required": "ମରାମତି ଆବଶ୍ୟକ",
    Inside: "ଭିତରେ",
    Exited: "ବାହାରିଛନ୍ତି",
    Approve: "ଅନୁମୋଦନ କରନ୍ତୁ",
    Reject: "ପ୍ରତ୍ୟାଖ୍ୟାନ କରନ୍ତୁ",
    Submit: "ଦାଖଲ କରନ୍ତୁ",
    Save: "ସଂରକ୍ଷଣ କରନ୍ତୁ",
    "Save Changes": "ପରିବର୍ତ୍ତନ ସଂରକ୍ଷଣ କରନ୍ତୁ",
    Cancel: "ବାତିଲ୍",
    Delete: "ବିଲୋପ କରନ୍ତୁ",
    Search: "ଖୋଜନ୍ତୁ",
    Add: "ଯୋଡନ୍ତୁ",
    "Add Room": "କୋଠରୀ ଯୋଡନ୍ତୁ",
    "Add Asset": "ସମ୍ପତ୍ତି ଯୋଡନ୍ତୁ",
    "Add Visitor": "ଦର୍ଶନାର୍ଥୀ ଯୋଡନ୍ତୁ",
    "Mark Exited": "ବାହାରିଥିବା ଚିହ୍ନିତ କରନ୍ତୁ",
    "Update Status": "ସ୍ଥିତି ଅପଡେଟ୍ କରନ୍ତୁ",
    "Mark In Progress": "ଚାଲୁ ବୋଲି ଚିହ୍ନିତ କରନ୍ତୁ",
    "Mark as Resolved": "ସମାଧାନ ଚିହ୍ନିତ କରନ୍ତୁ",
    "Show Digital Pass": "ଡିଜିଟାଲ୍ ପାସ୍ ଦେଖନ୍ତୁ",
    Investigate: "ଯାଞ୍ଚ କରନ୍ତୁ",
    Open: "ଖୋଲା",
    "In Progress": "ଚାଲୁ",
    Resolved: "ସମାଧାନ ହୋଇଛି",
    Closed: "ବନ୍ଦ",
    Pending: "ବକେୟା",
    "Pending Admin Approval": "ପ୍ରଶାସକ ଅନୁମୋଦନ ବକେୟା",
    "Admin Approved - Pending Warden":
      "ପ୍ରଶାସକ ଅନୁମୋଦିତ - ୱାର୍ଡେନ ଅନୁମୋଦନ ବକେୟା",
    "Pending Warden Approval": "ୱାର୍ଡେନ ଅନୁମୋଦନ ବକେୟା",
    Approved: "ଅନୁମୋଦିତ",
    Rejected: "ପ୍ରତ୍ୟାଖ୍ୟାତ",
    "Rejected by Admin": "ପ୍ରଶାସକଙ୍କ ଦ୍ୱାରା ପ୍ରତ୍ୟାଖ୍ୟାତ",
    "Rejected by Warden": "ୱାର୍ଡେନଙ୍କ ଦ୍ୱାରା ପ୍ରତ୍ୟାଖ୍ୟାତ",
    Submitted: "ଦାଖଲ ହୋଇଛି",
    Generated: "ପ୍ରସ୍ତୁତ",
    Present: "ଉପସ୍ଥିତ",
    Absent: "ଅନୁପସ୍ଥିତ",
    Paid: "ପୈଠ ହୋଇଛି",
    Unpaid: "ବକେୟା",
    Student: "ଛାତ୍ର",
    Admin: "ପ୍ରଶାସକ",
    Warden: "ୱାର୍ଡେନ",
    Teacher: "ଶିକ୍ଷକ",
    Reason: "କାରଣ",
    Date: "ତାରିଖ",
    Time: "ସମୟ",
    Name: "ନାମ",
    All: "ସମସ୍ତ",
    Apply: "ପ୍ରୟୋଗ କରନ୍ତୁ",
    Close: "ବନ୍ଦ କରନ୍ତୁ",
  },
};
const regionalUiExtra = {
  Hindi: {
    "Placement & Internship Portal": "प्लेसमेंट और इंटर्नशिप पोर्टल",
    "Placement Management": "प्लेसमेंट प्रबंधन",
    "Create Attendance Session": "उपस्थिति सत्र बनाएँ",
    "Student Feedback": "छात्र प्रतिक्रिया",
    "Feedback Dashboard": "प्रतिक्रिया डैशबोर्ड",
    "Payment History": "भुगतान इतिहास",
    "Explore Campus in 3D": "कैंपस का 3D मानचित्र देखें",
    "Issue Reports": "समस्या रिपोर्ट",
    "Report an Issue": "समस्या दर्ज करें",
    "Live Attendance Monitoring": "लाइव उपस्थिति निगरानी",
    "Student Records": "छात्र रिकॉर्ड",
    "Student Marks": "छात्र अंक",
    "Manage Campus": "कैंपस प्रबंधन",
    "Teacher Salary Details": "शिक्षक वेतन विवरण",
    "Student Registration Approval": "छात्र पंजीकरण स्वीकृति",
    "Student Academic Details": "छात्र शैक्षणिक विवरण",
    "Hostel Complaint System": "छात्रावास शिकायत प्रणाली",
    "Mess Menu": "मेस मेनू",
    "Leave / Gate Pass Portal": "अवकाश / गेट पास पोर्टल",
    "Certificate Issuance Management": "प्रमाणपत्र जारी करने का प्रबंधन",
    "Assigned Complaints & Resolutions": "सौंपी गई शिकायतें और समाधान",
    "Gate Pass Approval": "गेट पास स्वीकृति",
    "Certificate Issuance": "प्रमाणपत्र जारी करना",
    "Workflow Management Portals": "कार्यप्रवाह प्रबंधन पोर्टल",
    "Immediate Action Queue": "तत्काल कार्रवाई सूची",
    "Today’s Schedule": "आज की समय-सारणी",
    "Today's Schedule": "आज की समय-सारणी",
    "Quick Actions": "त्वरित कार्रवाइयाँ",
    "Attendance Overview": "उपस्थिति विवरण",
    "Session details": "सत्र विवरण",
    "Search Student ID": "छात्र आईडी खोजें",
    Subject: "विषय",
    Course: "पाठ्यक्रम",
    Branch: "शाखा",
    Year: "वर्ष",
    Section: "अनुभाग",
    Room: "कमरा",
    "Start Time": "प्रारंभ समय",
    "End Time": "समाप्ति समय",
    "Issue Description": "समस्या का विवरण",
    "AI Category": "AI श्रेणी",
    Priority: "प्राथमिकता",
    "AI Department": "AI विभाग",
    "Assigned Staff": "सौंपा गया कर्मचारी",
    "Technician Remarks / Actions Taken:":
      "तकनीशियन की टिप्पणी / की गई कार्रवाई:",
    "Parent / Emergency Contact Number": "अभिभावक / आपातकालीन संपर्क नंबर",
    "Reason for Leave": "अवकाश का कारण",
    "Expected Return Time": "वापसी का अपेक्षित समय",
    "Out Time": "बाहर जाने का समय",
    Destination: "गंतव्य",
    "Request Type": "अनुरोध का प्रकार",
    "Departure Date": "प्रस्थान तिथि",
    "Return Date": "वापसी तिथि",
    Apply: "आवेदन करें",
    "View history": "इतिहास देखें",
    "View Assigned Work": "सौंपा गया कार्य देखें",
    "Start Camera": "कैमरा शुरू करें",
    "Stop Camera": "कैमरा रोकें",
    "Mark Present": "उपस्थित दर्ज करें",
    Download: "डाउनलोड",
    "Print Certificate": "प्रमाणपत्र प्रिंट करें",
    "Read Full": "पूरा पढ़ें",
    "No payment record found": "भुगतान रिकॉर्ड नहीं मिला",
    "No rooms recorded yet.": "अभी कोई कमरा दर्ज नहीं है।",
    "No visitor records yet.": "अभी कोई आगंतुक रिकॉर्ड नहीं है।",
    "No Lost & Found reports yet.": "अभी कोई खोया-पाया रिपोर्ट नहीं है।",
    "Awaiting review": "समीक्षा लंबित",
    "Stored on this device": "इस डिवाइस पर सहेजा गया",
    "All records": "सभी रिकॉर्ड",
    "Gate Pass": "गेट पास",
    Leave: "अवकाश",
    "Certificate Request": "प्रमाणपत्र अनुरोध",
    Complaint: "शिकायत",
    Request: "अनुरोध",
    Interview: "साक्षात्कार",
    Late: "विलंबित",
    Verified: "सत्यापित",
    Resolved: "समाधान हुआ",
    Today: "आज",
    Yesterday: "कल",
    "No records found.": "कोई रिकॉर्ड नहीं मिला।",
    "Search and review every recorded class session.":
      "हर दर्ज कक्षा सत्र खोजें और देखें।",
    "Share your experience on subjects, teachers, and campus services.":
      "विषयों, शिक्षकों और कैंपस सेवाओं पर अपना अनुभव साझा करें।",
    "Review your tuition, examination fees and upcoming payments.":
      "अपनी शिक्षण और परीक्षा फीस तथा आगामी भुगतानों की समीक्षा करें।",
    "Plan your classes, rooms and campus time at a glance.":
      "अपनी कक्षाओं, कमरों और कैंपस समय की एक नज़र में योजना बनाएँ।",
  },
  Odia: {
    "Placement & Internship Portal": "ପ୍ଲେସମେଣ୍ଟ ଓ ଇଣ୍ଟର୍ନଶିପ୍ ପୋର୍ଟାଲ୍",
    "Placement Management": "ପ୍ଲେସମେଣ୍ଟ ପରିଚାଳନା",
    "Create Attendance Session": "ଉପସ୍ଥାନ ସେସନ୍ ସୃଷ୍ଟି କରନ୍ତୁ",
    "Student Feedback": "ଛାତ୍ର ମତାମତ",
    "Feedback Dashboard": "ମତାମତ ଡ୍ୟାସବୋର୍ଡ",
    "Payment History": "ଦେୟ ଇତିହାସ",
    "Explore Campus in 3D": "କ୍ୟାମ୍ପସର 3D ମାନଚିତ୍ର ଦେଖନ୍ତୁ",
    "Issue Reports": "ସମସ୍ୟା ରିପୋର୍ଟ",
    "Report an Issue": "ସମସ୍ୟା ରିପୋର୍ଟ କରନ୍ତୁ",
    "Live Attendance Monitoring": "ସଜୀବ ଉପସ୍ଥାନ ନିରୀକ୍ଷଣ",
    "Student Records": "ଛାତ୍ର ରେକର୍ଡ",
    "Student Marks": "ଛାତ୍ର ନମ୍ବର",
    "Manage Campus": "କ୍ୟାମ୍ପସ ପରିଚାଳନା",
    "Teacher Salary Details": "ଶିକ୍ଷକ ଦରମା ବିବରଣୀ",
    "Hostel Complaint System": "ଛାତ୍ରାବାସ ଅଭିଯୋଗ ବ୍ୟବସ୍ଥା",
    "Mess Menu": "ମେସ୍ ମେନୁ",
    "Leave / Gate Pass Portal": "ଛୁଟି / ଗେଟ୍ ପାସ୍ ପୋର୍ଟାଲ୍",
    "Certificate Issuance Management": "ପ୍ରମାଣପତ୍ର ପ୍ରଦାନ ପରିଚାଳନା",
    "Assigned Complaints & Resolutions": "ନ୍ୟସ୍ତ ଅଭିଯୋଗ ଓ ସମାଧାନ",
    "Gate Pass Approval": "ଗେଟ୍ ପାସ୍ ଅନୁମୋଦନ",
    "Certificate Issuance": "ପ୍ରମାଣପତ୍ର ପ୍ରଦାନ",
    "Workflow Management Portals": "କାର୍ଯ୍ୟପ୍ରବାହ ପରିଚାଳନା ପୋର୍ଟାଲ୍",
    "Immediate Action Queue": "ତତ୍କାଳ କାର୍ଯ୍ୟ ତାଲିକା",
    "Today’s Schedule": "ଆଜିର ସମୟସୂଚୀ",
    "Today's Schedule": "ଆଜିର ସମୟସୂଚୀ",
    "Quick Actions": "ତ୍ୱରିତ କାର୍ଯ୍ୟ",
    "Attendance Overview": "ଉପସ୍ଥାନ ବିବରଣୀ",
    "Session details": "ସେସନ୍ ବିବରଣୀ",
    "Search Student ID": "ଛାତ୍ର ID ଖୋଜନ୍ତୁ",
    Subject: "ବିଷୟ",
    Course: "ପାଠ୍ୟକ୍ରମ",
    Branch: "ଶାଖା",
    Year: "ବର୍ଷ",
    Section: "ବିଭାଗ",
    Room: "କୋଠରୀ",
    "Start Time": "ଆରମ୍ଭ ସମୟ",
    "End Time": "ଶେଷ ସମୟ",
    "Issue Description": "ସମସ୍ୟା ବିବରଣୀ",
    "AI Category": "AI ବର୍ଗ",
    Priority: "ପ୍ରାଥମିକତା",
    "AI Department": "AI ବିଭାଗ",
    "Assigned Staff": "ନିଯୁକ୍ତ କର୍ମଚାରୀ",
    "Technician Remarks / Actions Taken:":
      "ଟେକ୍ନିସିଆନ୍ ଟିପ୍ପଣୀ / ନିଆଯାଇଥିବା ପଦକ୍ଷେପ:",
    "Parent / Emergency Contact Number": "ଅଭିଭାବକ / ଜରୁରୀକାଳୀନ ଯୋଗାଯୋଗ ନମ୍ବର",
    "Reason for Leave": "ଛୁଟିର କାରଣ",
    "Expected Return Time": "ଫେରିବାର ଆଶାକରା ସମୟ",
    "Out Time": "ବାହାରିବା ସମୟ",
    Destination: "ଗନ୍ତବ୍ୟ",
    "Request Type": "ଅନୁରୋଧ ପ୍ରକାର",
    "Departure Date": "ପ୍ରସ୍ଥାନ ତାରିଖ",
    "Return Date": "ଫେରିବା ତାରିଖ",
    Apply: "ଆବେଦନ କରନ୍ତୁ",
    "View history": "ଇତିହାସ ଦେଖନ୍ତୁ",
    "View Assigned Work": "ନ୍ୟସ୍ତ କାର୍ଯ୍ୟ ଦେଖନ୍ତୁ",
    "Start Camera": "କ୍ୟାମେରା ଆରମ୍ଭ କରନ୍ତୁ",
    "Stop Camera": "କ୍ୟାମେରା ବନ୍ଦ କରନ୍ତୁ",
    "Mark Present": "ଉପସ୍ଥିତ ଚିହ୍ନିତ କରନ୍ତୁ",
    Download: "ଡାଉନଲୋଡ୍",
    "Print Certificate": "ପ୍ରମାଣପତ୍ର ପ୍ରିଣ୍ଟ କରନ୍ତୁ",
    "Read Full": "ସମ୍ପୂର୍ଣ୍ଣ ପଢନ୍ତୁ",
    "No payment record found": "କୌଣସି ଦେୟ ରେକର୍ଡ ମିଳିଲା ନାହିଁ",
    "No rooms recorded yet.": "ଏପର୍ଯ୍ୟନ୍ତ କୋଠରୀ ରେକର୍ଡ ନାହିଁ।",
    "No visitor records yet.": "ଏପର୍ଯ୍ୟନ୍ତ ଦର୍ଶନାର୍ଥୀ ରେକର୍ଡ ନାହିଁ।",
    "No Lost & Found reports yet.":
      "ଏପର୍ଯ୍ୟନ୍ତ ହଜିଥିବା/ମିଳିଥିବା ରିପୋର୍ଟ ନାହିଁ।",
    "Awaiting review": "ସମୀକ୍ଷା ଅପେକ୍ଷାରେ",
    "Stored on this device": "ଏହି ଡିଭାଇସରେ ସଂରକ୍ଷିତ",
    "All records": "ସମସ୍ତ ରେକର୍ଡ",
    "Gate Pass": "ଗେଟ୍ ପାସ୍",
    Leave: "ଛୁଟି",
    "Certificate Request": "ପ୍ରମାଣପତ୍ର ଅନୁରୋଧ",
    Complaint: "ଅଭିଯୋଗ",
    Request: "ଅନୁରୋଧ",
    Interview: "ସାକ୍ଷାତକାର",
    Late: "ବିଳମ୍ବ",
    Verified: "ଯାଞ୍ଚ ହୋଇଛି",
    Today: "ଆଜି",
    Yesterday: "ଗତକାଲି",
    "No records found.": "କୌଣସି ରେକର୍ଡ ମିଳିଲା ନାହିଁ।",
    "Search and review every recorded class session.":
      "ପ୍ରତ୍ୟେକ ରେକର୍ଡ ହୋଇଥିବା କ୍ଲାସ୍ ସେସନ୍ ଖୋଜନ୍ତୁ ଓ ସମୀକ୍ଷା କରନ୍ତୁ।",
    "Share your experience on subjects, teachers, and campus services.":
      "ବିଷୟ, ଶିକ୍ଷକ ଓ କ୍ୟାମ୍ପସ ସେବା ବିଷୟରେ ଆପଣଙ୍କ ଅନୁଭବ ଜଣାନ୍ତୁ।",
    "Review your tuition, examination fees and upcoming payments.":
      "ଆପଣଙ୍କ ଟ୍ୟୁସନ୍, ପରୀକ୍ଷା ଶୁଳ୍କ ଓ ଆଗାମୀ ଦେୟ ସମୀକ୍ଷା କରନ୍ତୁ।",
    "Plan your classes, rooms and campus time at a glance.":
      "ଆପଣଙ୍କ କ୍ଲାସ୍, କୋଠରୀ ଓ କ୍ୟାମ୍ପସ ସମୟର ଯୋଜନା ଏକ ନଜରରେ କରନ୍ତୁ।",
  },
};
function translateUiText(text, language) {
  const trimmed = text.trim();
  const translated =
    regionalUiText[language]?.[trimmed] || regionalUiExtra[language]?.[trimmed];
  if (!translated) return text;
  const start = text.indexOf(trimmed);
  return `${text.slice(0, start)}${translated}${text.slice(start + trimmed.length)}`;
}
function LocalizedTree({ children, className }) {
  const language = useContext(LanguageContext);
  const rootRef = useRef(null);
  const originalsRef = useRef({
    text: new WeakMap(),
    attributes: new WeakMap(),
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const localizeText = (node) => {
      const previous = originalsRef.current.text.get(node);
      const source =
        previous && node.nodeValue === previous.translated
          ? previous.source
          : node.nodeValue;
      const translated = translateUiText(source, language);
      originalsRef.current.text.set(node, { source, translated });
      if (
        node.parentElement?.tagName === "OPTION" &&
        !node.parentElement.hasAttribute("value")
      )
        node.parentElement.setAttribute("value", source.trim());
      if (node.nodeValue !== translated) node.nodeValue = translated;
    };
    const localizeAttributes = (element) => {
      const attributes = originalsRef.current.attributes.get(element) || {};
      ["placeholder", "aria-label", "title"].forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        const current = element.getAttribute(attribute);
        const source =
          attributes[attribute] && current === attributes[attribute].translated
            ? attributes[attribute].source
            : current;
        const translated = translateUiText(source, language);
        attributes[attribute] = { source, translated };
        if (current !== translated) element.setAttribute(attribute, translated);
      });
      originalsRef.current.attributes.set(element, attributes);
    };
    const localizeSubtree = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!node.parentElement?.closest("textarea,script,style"))
          localizeText(node);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      localizeAttributes(node);
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      while (walker.nextNode())
        if (!walker.currentNode.parentElement?.closest("textarea,script,style"))
          localizeText(walker.currentNode);
    };
    localizeSubtree(root);
    const observer = new MutationObserver((records) =>
      records.forEach((record) => {
        if (record.type === "characterData") localizeText(record.target);
        else if (record.type === "attributes")
          localizeAttributes(record.target);
        else record.addedNodes.forEach(localizeSubtree);
      }),
    );
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "aria-label", "title"],
    });
    return () => observer.disconnect();
  }, [language]);

  return (
    <div className={className} ref={rootRef}>
      {children}
    </div>
  );
}
function uid(prefix = "ID") {
  return `${prefix}-${Math.floor(10000 + Math.random() * 89999)}`;
}
async function attendanceApi(path, body) {
  try {
    const apiBase = import.meta.env.VITE_API_URL || "";
    const response = await fetch(apiBase + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(result.error || "Attendance service is unavailable.");
    return result;
  } catch (error) {
    // Vercel / Hackathon Fallback: If backend is not available, mock the responses
    console.warn("Backend API unavailable, using mock response for:", path);
    if (path === "/api/attendance/session" || path === "/api/attendance/token") {
      return { sessionId: body.sessionId || uid("SESS"), token: "mock-token-" + Date.now(), expiresIn: 300 };
    }
    if (path === "/api/attendance/mark") {
      return { ok: true, sessionId: "mock-session", subject: "Class", section: "A", room: "101", markedAt: new Date().toISOString() };
    }
    if (path === "/api/accounts/password-reset/request") {
      return { ok: true, message: "A password reset OTP has been sent.", demoOtp: "123456" };
    }
    if (path === "/api/accounts/password-reset/verify" || path === "/api/accounts/face-registration") {
      return { ok: true };
    }
    throw error;
  }
}
const lostFoundIgnoredWords = new Set([
  "about",
  "and",
  "are",
  "for",
  "found",
  "from",
  "has",
  "item",
  "its",
  "lost",
  "near",
  "the",
  "this",
  "was",
  "with",
]);
function lostFoundTokens(value) {
  return (
    String(value || "")
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((word) => word.length > 2 && !lostFoundIgnoredWords.has(word)) ||
    []
  );
}
function findPossibleLostFoundMatch(report, reports) {
  if (report.status === "Claimed/Resolved") return null;
  const details = lostFoundTokens(`${report.itemName} ${report.description}`);
  const locations = new Set(lostFoundTokens(report.location));
  const timestamp = Date.parse(report.approximateTime);
  if (!details.length || !locations.size || !Number.isFinite(timestamp))
    return null;
  return (
    reports.find((candidate) => {
      if (
        candidate.id === report.id ||
        candidate.type === report.type ||
        candidate.status === "Claimed/Resolved"
      )
        return false;
      if (
        String(candidate.category).toLowerCase() !==
        String(report.category).toLowerCase()
      )
        return false;
      const candidateDetails = lostFoundTokens(
        `${candidate.itemName} ${candidate.description}`,
      );
      const candidateLocations = lostFoundTokens(candidate.location);
      const candidateTime = Date.parse(candidate.approximateTime);
      return (
        details.some((word) => candidateDetails.includes(word)) &&
        [...locations].some((word) => candidateLocations.includes(word)) &&
        Number.isFinite(candidateTime) &&
        Math.abs(timestamp - candidateTime) <= 6 * 60 * 60 * 1000
      );
    }) || null
  );
}
function initials(name) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST"
  );
}
function studentDataKey(studentId) {
  return `cc_student_record_${studentId}`;
}
function readStudentAttendance(studentId) {
  return load(studentDataKey(studentId), []);
}
function paymentDataKey(studentId) {
  return `cc_student_payments_${studentId}`;
}
function readStudentPayments(studentId) {
  return load(paymentDataKey(studentId), []);
}
function timetableBranchKey(branch) {
  return String(branch || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}
function timetableScopeKey({ course, branch, year, section }) {
  const branchKey = timetableBranchKey(branch);
  const cohortBranch = ["MECHANICAL", "MECHANICAL_ENGINEERING"].includes(
    branchKey,
  )
    ? "ME"
    : branchKey;
  const sectionKey = timetableBranchKey(section);
  const cohortSection =
    sectionKey === "A" || sectionKey === "B"
      ? `${cohortBranch}-${sectionKey}`
      : sectionKey;
  return `@${[course, cohortBranch, year, cohortSection].map(timetableBranchKey).join("|")}`;
}

const demoTimetableSchedule = {
  Monday: [
    {
      start: "09:00 AM - 10:00 AM",
      subject: "Mathematics",
      faculty: "Prof. Sharma",
      room: "Room 101",
      id: "MON-1",
    },
    {
      start: "10:00 AM - 11:00 AM",
      subject: "Programming",
      faculty: "Prof. Kumar",
      room: "Lab 1",
      id: "MON-2",
    },
    {
      start: "11:30 AM - 12:30 PM",
      subject: "Database Management",
      faculty: "Dr. Nair",
      room: "Room 204",
      id: "MON-3",
    },
    {
      start: "01:30 PM - 02:30 PM",
      subject: "Web Development",
      faculty: "Mr. Singh",
      room: "Room 105",
      id: "MON-4",
    },
  ],
  Tuesday: [
    {
      start: "09:00 AM - 10:00 AM",
      subject: "Data Structures",
      faculty: "Prof. Rao",
      room: "Room 102",
      id: "TUE-1",
    },
    {
      start: "10:00 AM - 11:00 AM",
      subject: "Java Programming",
      faculty: "Dr. Verma",
      room: "Lab 2",
      id: "TUE-2",
    },
    {
      start: "11:30 AM - 12:30 PM",
      subject: "Computer Networks",
      faculty: "Prof. Iyer",
      room: "Room 203",
      id: "TUE-3",
    },
    {
      start: "01:30 PM - 02:30 PM",
      subject: "Mathematics",
      faculty: "Prof. Sharma",
      room: "Room 101",
      id: "TUE-4",
    },
  ],
  Wednesday: [
    {
      start: "09:00 AM - 10:00 AM",
      subject: "Python",
      faculty: "Dr. Patel",
      room: "Lab 1",
      id: "WED-1",
    },
    {
      start: "10:00 AM - 11:00 AM",
      subject: "Operating Systems",
      faculty: "Prof. Joshi",
      room: "Room 202",
      id: "WED-2",
    },
    {
      start: "11:30 AM - 12:30 PM",
      subject: "Database Management",
      faculty: "Dr. Nair",
      room: "Room 204",
      id: "WED-3",
    },
    {
      start: "01:30 PM - 02:30 PM",
      subject: "Web Development",
      faculty: "Mr. Singh",
      room: "Room 105",
      id: "WED-4",
    },
  ],
  Thursday: [
    {
      start: "09:00 AM - 10:00 AM",
      subject: "Java Programming",
      faculty: "Dr. Verma",
      room: "Lab 2",
      id: "THU-1",
    },
    {
      start: "10:00 AM - 11:00 AM",
      subject: "Data Structures",
      faculty: "Prof. Rao",
      room: "Room 102",
      id: "THU-2",
    },
    {
      start: "11:30 AM - 12:30 PM",
      subject: "Computer Networks",
      faculty: "Prof. Iyer",
      room: "Room 203",
      id: "THU-3",
    },
    {
      start: "01:30 PM - 02:30 PM",
      subject: "Artificial Intelligence",
      faculty: "Dr. Khan",
      room: "Room 301",
      id: "THU-4",
    },
  ],
  Friday: [
    {
      start: "09:00 AM - 10:00 AM",
      subject: "Mathematics",
      faculty: "Prof. Sharma",
      room: "Room 101",
      id: "FRI-1",
    },
    {
      start: "10:00 AM - 11:00 AM",
      subject: "Python",
      faculty: "Dr. Patel",
      room: "Lab 1",
      id: "FRI-2",
    },
    {
      start: "11:30 AM - 12:30 PM",
      subject: "Software Engineering",
      faculty: "Dr. Sen",
      room: "Room 205",
      id: "FRI-3",
    },
    {
      start: "01:30 PM - 02:30 PM",
      subject: "Project Work",
      faculty: "Mr. Das",
      room: "Lab 3",
      id: "FRI-4",
    },
  ],
  Saturday: [
    {
      start: "09:00 AM - 10:00 AM",
      subject: "Programming",
      faculty: "Prof. Kumar",
      room: "Lab 1",
      id: "SAT-1",
    },
    {
      start: "10:00 AM - 11:00 AM",
      subject: "Data Structures",
      faculty: "Prof. Rao",
      room: "Room 102",
      id: "SAT-2",
    },
    {
      start: "11:30 AM - 12:30 PM",
      subject: "Web Development",
      faculty: "Mr. Singh",
      room: "Room 105",
      id: "SAT-3",
    },
    {
      start: "01:30 PM - 02:30 PM",
      subject: "Project Work",
      faculty: "Mr. Das",
      room: "Lab 3",
      id: "SAT-4",
    },
  ],
};

const demoTimetableBranches = {
  CSE: demoTimetableSchedule,
};

const demoTimetableSubjects = {
  "B-TECH": {
    CSE: [
      "Data Structures",
      "DBMS",
      "Operating Systems",
      "Computer Networks",
      "Java Programming",
      "Python",
      "Software Engineering",
    ],
    ECE: [
      "Digital Electronics",
      "Analog Electronics",
      "Signals & Systems",
      "Microprocessors",
      "Communication Systems",
    ],
    CIVIL: [
      "Engineering Mechanics",
      "Structural Analysis",
      "Surveying",
      "Geotechnical Engineering",
      "Construction Materials",
    ],
    ME: [
      "Thermodynamics",
      "Fluid Mechanics",
      "Machine Design",
      "Manufacturing Processes",
      "Engineering Mechanics",
    ],
    EEE: [
      "Electrical Machines",
      "Power Systems",
      "Control Systems",
      "Power Electronics",
      "Network Theory",
    ],
    IT: [
      "Data Structures",
      "DBMS",
      "Web Technology",
      "Computer Networks",
      "Software Engineering",
    ],
  },
  DIPLOMA: {
    CSE: [
      "Programming",
      "DBMS",
      "Web Technology",
      "Computer Networks",
      "Software Engineering",
    ],
    ECE: [
      "Digital Electronics",
      "Electronic Devices",
      "Communication Engineering",
      "Microprocessor",
    ],
    CIVIL: [
      "Surveying",
      "Construction Materials",
      "Building Construction",
      "Strength of Materials",
    ],
    ME: [
      "Engineering Drawing",
      "Manufacturing",
      "Thermodynamics",
      "Workshop Technology",
    ],
    EEE: [
      "Electrical Machines",
      "Basic Electrical Engineering",
      "Power Systems",
      "Measurements",
    ],
  },
};
const demoTimetableDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const demoTimetablePeriods = [
  "09:00 AM - 10:00 AM",
  "10:15 AM - 11:15 AM",
  "11:30 AM - 12:30 PM",
  "01:30 PM - 02:30 PM",
];
const demoTimetableFaculty = [
  "Prof. Sharma",
  "Dr. Mehta",
  "Prof. Iyer",
  "Dr. Nair",
  "Prof. Rao",
  "Dr. Khan",
  "Prof. Das",
];
function createDemoCohortTimetable(course, branch, year, section, subjects) {
  const yearOffset = Number.parseInt(year, 10) - 1;
  const sectionOffset = section.endsWith("-B") ? 1 : 0;
  return Object.fromEntries(
    demoTimetableDays.map((day, dayIndex) => [
      day,
      demoTimetablePeriods.map((start, periodIndex) => {
        const subjectIndex =
          (dayIndex * 2 + periodIndex + yearOffset + sectionOffset) %
          subjects.length;
        const subject = subjects[subjectIndex];
        const isPractical =
          /programming|microprocessor|manufacturing|workshop|surveying/i.test(
            subject,
          );
        const room = isPractical
          ? `Lab ${(subjectIndex % 3) + 1}`
          : `${branch} Block, Room ${101 + subjectIndex}`;
        return {
          start,
          subject,
          faculty: demoTimetableFaculty[subjectIndex],
          room,
          id: `${course}-${branch}-${year}-${section}-${day.slice(0, 3)}-${periodIndex + 1}`,
        };
      }),
    ]),
  );
}
const demoTimetableCohorts = {};
Object.entries(demoTimetableSubjects).forEach(([course, branches]) =>
  Object.entries(branches).forEach(([branch, subjects]) => {
    const years =
      course === "B-TECH"
        ? ["1st Year", "2nd Year", "3rd Year", "4th Year"]
        : ["1st Year", "2nd Year", "3rd Year"];
    years.forEach((year) =>
      ["A", "B"].forEach((section) => {
        const sectionName = `${branch}-${section}`;
        demoTimetableCohorts[
          timetableScopeKey({ course, branch, year, section: sectionName })
        ] = createDemoCohortTimetable(
          course,
          branch,
          year,
          sectionName,
          subjects,
        );
      }),
    );
  }),
);

const demoFeedback = [
  {
    id: "FB-101",
    studentId: "STU-DEMO-1",
    studentName: "Demo Student",
    category: "Subject",
    subject: "Mathematics",
    teacher: "Prof. Sharma",
    rating: 5,
    comment:
      "Excellent teaching and clear explanations during the weekly problem-solving session.",
    anonymous: false,
    status: "Submitted",
    createdAt: "2026-09-03T09:45:00.000Z",
  },
  {
    id: "FB-102",
    studentId: "STU-DEMO-2",
    studentName: "Neha Kapoor",
    category: "Teacher",
    subject: "Programming",
    teacher: "Prof. Kumar",
    rating: 4,
    comment:
      "Very helpful during lab sessions and encouraged students to explore more concepts.",
    anonymous: false,
    status: "Reviewed",
    createdAt: "2026-09-04T11:20:00.000Z",
  },
  {
    id: "FB-103",
    studentId: "STU-DEMO-3",
    studentName: "Anonymous",
    category: "Campus Service",
    subject: "Campus Support",
    teacher: "Campus Office",
    rating: 3,
    comment:
      "The support desk was polite but the response time could be faster.",
    anonymous: true,
    status: "Submitted",
    createdAt: "2026-09-05T14:00:00.000Z",
  },
  {
    id: "FB-104",
    studentId: "STU-DEMO-4",
    studentName: "Aman Deep",
    category: "Subject",
    subject: "Web Development",
    teacher: "Mr. Singh",
    rating: 5,
    comment:
      "The project-based learning style helped me understand front-end development better.",
    anonymous: false,
    status: "Reviewed",
    createdAt: "2026-09-06T15:30:00.000Z",
  },
];

const demoAttendanceSummary = {
  overall: 82,
  lectures: 120,
  present: 98,
  absent: 18,
  late: 4,
  subjects: [
    ["Mathematics", 85, "17/20"],
    ["Java Programming", 90, "18/20"],
    ["Database Management", 80, "16/20"],
    ["Web Development", 75, "15/20"],
    ["Data Structures", 85, "17/20"],
    ["Computer Networks", 75, "15/20"],
  ],
};

const demoAttendanceRecords = [
  {
    date: "2026-09-05",
    subject: "Computer Networks",
    teacher: "Prof. Iyer",
    time: "11:30 AM - 12:30 PM",
    room: "Room 203",
    status: "Present",
    session: "DEMO-NET-0905",
  },
  {
    date: "2026-09-04",
    subject: "Web Development",
    teacher: "Mr. Singh",
    time: "01:30 PM - 02:30 PM",
    room: "Room 105",
    status: "Late",
    session: "DEMO-WEB-0904",
  },
  {
    date: "2026-09-04",
    subject: "Database Management",
    teacher: "Dr. Nair",
    time: "11:30 AM - 12:30 PM",
    room: "Room 204",
    status: "Present",
    session: "DEMO-DB-0904",
  },
  {
    date: "2026-09-03",
    subject: "Java Programming",
    teacher: "Dr. Verma",
    time: "10:00 AM - 11:00 AM",
    room: "Lab 2",
    status: "Absent",
    session: "DEMO-JAVA-0903",
  },
  {
    date: "2026-09-03",
    subject: "Data Structures",
    teacher: "Prof. Rao",
    time: "09:00 AM - 10:00 AM",
    room: "Room 102",
    status: "Present",
    session: "DEMO-DS-0903",
  },
  {
    date: "2026-09-02",
    subject: "Mathematics",
    teacher: "Prof. Sharma",
    time: "09:00 AM - 10:00 AM",
    room: "Room 101",
    status: "Present",
    session: "DEMO-MATH-0902",
  },
  {
    date: "2026-09-01",
    subject: "Computer Networks",
    teacher: "Prof. Iyer",
    time: "11:30 AM - 12:30 PM",
    room: "Room 203",
    status: "Late",
    session: "DEMO-NET-0901",
  },
  {
    date: "2026-08-31",
    subject: "Web Development",
    teacher: "Mr. Singh",
    time: "01:30 PM - 02:30 PM",
    room: "Room 105",
    status: "Present",
    session: "DEMO-WEB-0831",
  },
];

function ensureDemoTimetables() {
  const stored = load("cc_timetables", {});
  const merged = { ...demoTimetableBranches, ...demoTimetableCohorts };
  Object.keys(stored).forEach((branchKey) => {
    merged[branchKey] = {
      ...(merged[branchKey] || {}),
      ...(stored[branchKey] || {}),
    };
  });
  if (JSON.stringify(stored) !== JSON.stringify(merged)) {
    save("cc_timetables", merged);
  }
  return merged;
}

function readStudentTimetable(branch, course = "", year = "", section = "") {
  const branchKey = timetableBranchKey(branch || "CSE");
  const allTimetables = ensureDemoTimetables();
  if (course && year && section) {
    const cohortData =
      allTimetables[
        timetableScopeKey({ course, branch: branchKey, year, section })
      ];
    if (!cohortData) return null;
    return Object.fromEntries(
      Object.entries(cohortData).map(([day, entries]) => [
        day,
        entries.map((entry) => [
          entry.start,
          entry.subject,
          entry.faculty,
          entry.room,
          entry.id,
        ]),
      ]),
    );
  }
  const branchData =
    allTimetables[branchKey] ||
    allTimetables[branchKey.replace(/_/g, " ")] ||
    allTimetables[
      Object.keys(allTimetables).find((key) => key.toUpperCase() === branchKey)
    ];
  if (
    !branchData ||
    (branchKey !== "CSE" &&
      JSON.stringify(branchData) === JSON.stringify(demoTimetableSchedule))
  )
    return null;
  return Object.fromEntries(
    Object.entries(branchData).map(([day, entries]) => [
      day,
      entries.map((entry) => [
        entry.start,
        entry.subject,
        entry.faculty,
        entry.room,
        entry.id,
      ]),
    ]),
  );
}
async function hashPassword(value) {
  return bcrypt.hash(value, 10);
}
async function verifyPassword(value, hash) {
  return bcrypt.compare(value, hash);
}
async function legacyHashPassword(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function SceneParticles() {
  const groupRef = useRef(null);
  const particles = useMemo(() => {
    const positions = new Float32Array(240 * 3);
    for (let index = 0; index < positions.length; index += 3) {
      positions[index] = (Math.random() - 0.5) * 14;
      positions[index + 1] = (Math.random() - 0.5) * 9;
      positions[index + 2] = (Math.random() - 0.5) * 6;
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.elapsedTime * 0.012;
    groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.08) * 0.035;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#74dfff"
          size={0.035}
          transparent
          opacity={0.42}
          sizeAttenuation
        />
      </points>
      <mesh position={[-3.6, 1.6, -2.5]} rotation={[0.3, 0.5, 0]}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial
          color="#27c7ff"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>
      <mesh position={[3.4, -1.8, -3]} rotation={[0.5, 0.2, 0.4]}>
        <octahedronGeometry args={[1.35, 0]} />
        <meshBasicMaterial
          color="#6378ff"
          wireframe
          transparent
          opacity={0.09}
        />
      </mesh>
    </group>
  );
}

function DashboardBackdrop() {
  return (
    <div className="dashboard-backdrop" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{ antialias: false, alpha: true }}
      >
        <SceneParticles />
      </Canvas>
    </div>
  );
}

function AIInterviewAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Ask me anything about interview preparation, resumes, applications, or career planning.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sendConversation = async (conversation) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/placement/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation.filter(
            (item) => item.role !== "assistant" || item !== messages[0],
          ),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error("Interview Assistant API error", {
          status: response.status,
          statusText: response.statusText,
          error: result.error || "Unknown server error",
        });
        throw new Error(
          result.error ||
            `Interview Assistant request failed (${response.status}).`,
        );
      }
      setMessages([
        ...conversation,
        { role: "assistant", content: result.answer },
      ]);
    } catch (requestError) {
      console.error("Interview Assistant request failed", requestError);
      setError(
        requestError.message ||
          "Interview Assistant could not respond. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const submit = (event) => {
    event.preventDefault();
    const value = question.trim();
    if (!value || loading) return;
    const conversation = [...messages, { role: "user", content: value }];
    setMessages(conversation);
    setQuestion("");
    sendConversation(conversation);
  };
  const retry = () => {
    const lastUser = [...messages]
      .reverse()
      .find((item) => item.role === "user");
    if (lastUser) sendConversation(messages);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit(event);
    }
  };
  return (
    <section className="panel interview-assistant-panel">
      <div className="panel-head">
        <div>
          <h3>🤖 AI Interview Assistant</h3>
          <p>
            Ask any interview or career question and continue the conversation.
          </p>
        </div>
        <Sparkles />
      </div>
      <div className="interview-chat" aria-live="polite">
        {messages.map((message, index) => (
          <div
            className={`interview-chat-message ${message.role}`}
            key={`${message.role}-${index}`}
          >
            <span>{message.role === "assistant" ? "AI Assistant" : "You"}</span>
            <p>{message.content}</p>
          </div>
        ))}
        {loading && (
          <div className="interview-chat-message assistant">
            <span>AI Assistant</span>
            <p className="interview-loading">
              <i /> <i /> <i />
            </p>
          </div>
        )}
      </div>
      {error && (
        <div className="interview-error">
          <AlertTriangle size={15} />
          <span>{error}</span>
          <button className="ghost mini-btn" onClick={retry} disabled={loading}>
            Retry
          </button>
        </div>
      )}
      <form className="interview-chat-form" onSubmit={submit}>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about a technical interview, HR answer, resume, or career plan..."
          rows="2"
          disabled={loading}
        />
        <button
          className="primary"
          type="submit"
          disabled={loading || !question.trim()}
        >
          {loading ? <RefreshCw className="interview-spinner" /> : <Send />}
          {loading ? "Thinking" : "Send"}
        </button>
      </form>
    </section>
  );
}
function assistantDateLabel(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function assistantSchedule(branch) {
  const schedule = readStudentTimetable(branch) || {};
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
  return { schedule, day, today: schedule[day] || schedule.Monday || [] };
}

const ASSISTANT_FAQS = {
  student: [
    [
      "What is my attendance?",
      "Your current attendance is shown on the Student Dashboard. You can also open Attendance to see subject-wise attendance and recent records.",
    ],
    [
      "What is my timetable today?",
      "Open Timetable to see today's classes, subjects, rooms, and timings.",
    ],
    [
      "Which subjects have low attendance?",
      "Open Attendance â†’ Subject-wise view to identify subjects below the required attendance level.",
    ],
    [
      "Give me a study suggestion",
      "Prioritize subjects with lower attendance, revise missed topics weekly, and keep your attendance above the college requirement.",
    ],
    [
      "How can I see attendance history?",
      "Open Attendance History to view your recent Present, Absent, and Late records.",
    ],
    [
      "Where can I see the mess menu?",
      "Open Mess to see today's meals and the weekly mess menu.",
    ],
    [
      "How do I give meal feedback?",
      "Open Mess â†’ Meal Feedback, select the meal, give a rating, and submit your feedback.",
    ],
    [
      "How do I report a food quality issue?",
      "Open Mess â†’ Food Quality Issue, describe the problem, and submit the report for review.",
    ],
    [
      "How can I submit a hostel complaint?",
      "Open Hostel Complaints, choose the complaint type, describe the issue, and submit it.",
    ],
    [
      "How do I track my hostel complaint?",
      "Open Hostel Complaints to see the current status of your submitted complaint.",
    ],
    [
      "Can I reopen a hostel complaint?",
      "If a complaint is eligible for reopening, use the Reopen option on its complaint card and provide the reason.",
    ],
    [
      "Where are campus notices?",
      "Open Notices to view campus announcements. You can check pinned, unread, and audience-specific notices there.",
    ],
    [
      "How do I download a certificate?",
      "Open Certificates/Requests and use the Download option when your certificate request is approved.",
    ],
    [
      "Where can I check fees and dues?",
      "Open Fees/Dues from your Student Dashboard to review the available fee and payment information.",
    ],
    [
      "How do I submit a leave request?",
      "Use the Leave Request option in your student services area, enter the dates and reason, and submit it.",
    ],
    [
      "How do I see notifications?",
      "Open Notifications to see new, read, and unread campus updates.",
    ],
    [
      "How do I update my profile?",
      "Open Settings/Profile and update the fields that your account is permitted to change.",
    ],
    [
      "How do I log out?",
      "Open Settings and select Logout to securely leave your Campus Plus session.",
    ],
    [
      "How do I use QR attendance?",
      "When your teacher displays the live attendance QR, open QR Attendance and scan it with your phone camera.",
    ],
    [
      "Can I use face login?",
      "If face verification is registered for your account, choose Face Login and follow the camera verification steps.",
    ],
  ],
  teacher: [
    [
      "What are my classes today?",
      "Open Timetable to see today's assigned classes, subjects, rooms, and timings.",
    ],
    [
      "What is the class average attendance?",
      "Open Attendance Analytics to review class attendance performance and recent records.",
    ],
    [
      "Show recent student feedback",
      "Open Feedback to review recent student ratings, comments, and feedback status.",
    ],
    [
      "How do I create a QR attendance session?",
      "Open Attendance â†’ Create Session, select the class/subject and timing, then generate the live QR for students.",
    ],
    [
      "How do students mark attendance?",
      "Students scan the live classroom QR using their phone camera while the attendance session is active.",
    ],
    [
      "How do I monitor attendance?",
      "Open the live attendance session to monitor students who mark attendance and review the session records.",
    ],
    [
      "How do I correct attendance?",
      "Open Attendance Correction Requests to review student correction requests and take the permitted action.",
    ],
    [
      "How do I approve a leave request?",
      "Open Student Leave Requests, review the request details, and choose the appropriate workflow action.",
    ],
    [
      "How do I send a class announcement?",
      "Open Class Announcements, select your class, write the announcement, and send it to students.",
    ],
    [
      "How do I check announcement delivery?",
      "Open Class Announcements and review the delivered/read status for each announcement.",
    ],
    [
      "How do I view my timetable?",
      "Open Timetable to review today's and upcoming teaching periods.",
    ],
    [
      "How do I request class rescheduling?",
      "Open Class Reschedule/Cancellation Request, provide the class details and reason, then submit the request.",
    ],
    [
      "How do I submit an academic request?",
      "Open Academic Requests, choose the request type, add the required details, and submit it for review.",
    ],
    [
      "Where can I see pending requests?",
      "Open Requests to view pending leave, correction, rescheduling, and academic requests assigned to your workflow.",
    ],
    [
      "How do I see student attendance history?",
      "Open Attendance History/Records and select the relevant class or student to review available records.",
    ],
    [
      "How do I filter attendance by subject?",
      "Use the subject/class filters in Attendance to narrow the records to the required teaching group.",
    ],
    [
      "How do I open teacher settings?",
      "Open Settings from the Teacher Dashboard to manage available preferences and log out.",
    ],
    [
      "How do I log out?",
      "Open Settings and select Logout to end your Campus Plus session.",
    ],
    [
      "How do I see upcoming classes?",
      "Open Timetable and Upcoming Classes to view your next scheduled teaching periods.",
    ],
    [
      "How do I review low attendance students?",
      "Open Attendance Analytics/Student Records and use the attendance threshold view to identify students needing attention.",
    ],
  ],
  warden: [
    [
      "How many residents are there?",
      "Open the Warden Dashboard to view the current Total Residents count.",
    ],
    [
      "How many complaints are open?",
      "Open the Warden Dashboard or Assigned Complaints to see the current open complaint count.",
    ],
    [
      "How many gate passes are pending?",
      "Open Gate Pass Management to review pending gate-pass requests and their status.",
    ],
    [
      "How many visitors are expected today?",
      "Open Visitor Management to review today's visitor entries and expected visitors.",
    ],
    [
      "How do I manage hostel complaints?",
      "Open Assigned Complaints to review, update, and resolve hostel maintenance complaints.",
    ],
    [
      "How do I update a complaint status?",
      "Open a complaint and use Update Status to move it through the available workflow states.",
    ],
    [
      "How do I add a complaint remark?",
      "Open the complaint, enter your resolution/update remark, and save the status update.",
    ],
    [
      "How do I manage rooms?",
      "Open Room Management to review room assignments, occupancy, and available room information.",
    ],
    [
      "How do I approve a gate pass?",
      "Open Gate Pass Management, review the student's request and details, then use the available approval workflow.",
    ],
    [
      "How do I check today's visitors?",
      "Open Visitor Management and filter or review today's visitor records.",
    ],
    [
      "How do I see overdue maintenance?",
      "Open the Warden Dashboard or maintenance/complaint list to review overdue maintenance items.",
    ],
    [
      "How do I find an assigned complaint?",
      "Open Assigned Complaints to see complaints assigned to your warden account.",
    ],
    [
      "How do I resolve a hostel complaint?",
      "Open the complaint, complete the required work, add a remark, and set the appropriate resolved/closed status.",
    ],
    [
      "How do I view complaint history?",
      "Open the complaint manager to review available complaint records, statuses, and update history.",
    ],
    [
      "How do I track pending work?",
      "Open the Warden Dashboard and Assigned Complaints to review open and pending work.",
    ],
    [
      "How do I access warden settings?",
      "Open Settings from the Warden Dashboard to manage available preferences and log out.",
    ],
    [
      "How do I log out?",
      "Open Settings and select Logout to end your Campus Plus session.",
    ],
    [
      "How do I handle a resident maintenance issue?",
      "Open Assigned Complaints, inspect the issue details, update the status, and add remarks as work progresses.",
    ],
    [
      "Where can I see room information?",
      "Open Room Management to review resident and room information available to the warden.",
    ],
    [
      "Where can I see gate pass requests?",
      "Open Gate Pass Management to review pending, approved, and rejected gate-pass requests.",
    ],
  ],
  admin: [
    [
      "How many students are registered?",
      "Open Admin â†’ User Management or Analytics to review the current student account count.",
    ],
    [
      "How many teachers are registered?",
      "Open Admin â†’ User Management to review teacher accounts and their status.",
    ],
    [
      "Show attendance statistics",
      "Open Admin â†’ Attendance Analytics to review attendance trends, present/absent records, and department views.",
    ],
    [
      "Give me a campus activity summary",
      "Open Admin Analytics to review student activity, attendance, complaints, requests, and other campus indicators.",
    ],
    [
      "How do I add a student?",
      "Open User Management â†’ Add Student, enter the required student details, and save the account.",
    ],
    [
      "How do I add a teacher?",
      "Open User Management â†’ Add Teacher and enter the required employee and department details.",
    ],
    [
      "How do I add a warden?",
      "Open User Management â†’ Add Warden and create the authorized warden account.",
    ],
    [
      "How do I disable an account?",
      "Open User Management, select the account, and use Disable Account for an unauthorized or inactive account.",
    ],
    [
      "How do I manage campus notices?",
      "Open Notice Management to create, schedule, pin, and target notices to the appropriate audience.",
    ],
    [
      "How do I send an emergency notice?",
      "Open Notice Management, create the notice, enable the emergency option, select the audience, and publish it.",
    ],
    [
      "How do I schedule a notice?",
      "Open Notice Management and choose the scheduling option before publishing the notice.",
    ],
    [
      "How do I see complaint analytics?",
      "Open Analytics â†’ Complaints to review complaint types, departments, resolution times, and pending versus resolved work.",
    ],
    [
      "How do I check staff workload?",
      "Open workload/operations analytics to review assigned maintenance work and current workload records.",
    ],
    [
      "How do I view attendance trends?",
      "Open Analytics â†’ Attendance to review attendance trends and available department/class breakdowns.",
    ],
    [
      "How do I manage teacher salary records?",
      "Open Admin â†’ Payroll/Teacher Salary Details to review monthly salary records and statuses.",
    ],
    [
      "How do I review student requests?",
      "Open Requests/Student Records to review available academic, certificate, leave, and service requests.",
    ],
    [
      "How do I manage user roles?",
      "Use User Management to create authorized teacher and warden accounts and manage account status.",
    ],
    [
      "How do I review feedback?",
      "Open Feedback Analytics to review total feedback, ratings, and available student feedback records.",
    ],
    [
      "How do I open admin settings?",
      "Open Settings from the Admin Dashboard to manage preferences and log out.",
    ],
    [
      "How do I log out?",
      "Open Settings and select Logout to end your Campus Plus admin session.",
    ],
  ],
};

function getAssistantFaqs(role) {
  return ASSISTANT_FAQS[role] || ASSISTANT_FAQS.admin;
}

function buildAssistantReply(
  question,
  { role, profile, attendance, feedback },
) {
  const query = question.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
  const faq = getAssistantFaqs(role).find(
    ([prompt]) =>
      query.trim() ===
      prompt
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .trim(),
  );
  if (faq) return faq[1];
  const isStudent = role === "student";
  const isTeacher = role === "teacher";
  const isAdmin = role === "admin" || (!isStudent && !isTeacher);
  const demoAttendance = attendance.some((item) =>
    String(item.session || "").startsWith("DEMO-"),
  );
  const summary = demoAttendance
    ? demoAttendanceSummary
    : {
        overall: attendance.length
          ? Math.round(
              (attendance.filter((item) => item.status === "Present").length /
                attendance.length) *
                100,
            )
          : 0,
        lectures: attendance.length,
        present: attendance.filter((item) => item.status === "Present").length,
        absent: attendance.filter((item) => item.status === "Absent").length,
        late: attendance.filter((item) => item.status === "Late").length,
      };
  const { schedule, day, today } = assistantSchedule(
    profile.branch || profile.department,
  );
  const profiles = Object.values(load("cc_face_profiles", {}));
  const studentProfiles = profiles.filter((item) => item.role === "student");
  const teacherProfiles = profiles.filter((item) => item.role === "teacher");
  const lowSubjects = (
    demoAttendance ? demoAttendanceSummary.subjects : []
  ).filter((item) => item[1] < 80);
  const formatClasses = (entries) =>
    entries.length
      ? entries
          .slice(0, 5)
          .map((item) => `â€¢ ${item[1]} Â· ${item[0]} Â· ${item[3]}`)
          .join("\n")
      : "No classes are scheduled.";
  const recent = attendance
    .slice(0, 5)
    .map(
      (item) =>
        `â€¢ ${assistantDateLabel(item.date)} Â· ${item.subject} Â· ${item.status} Â· ${item.room}`,
    )
    .join("\n");
  const feedbackForUser = feedback.filter(
    (item) => item.studentId === profile.studentId,
  );
  const feedbackSummary = feedbackForUser.length
    ? feedbackForUser
        .map((item) => `â€¢ ${item.subject}: ${item.status}, ${item.rating}/5`)
        .join("\n")
    : "No feedback submitted under this profile yet.";
  const classAverage = demoAttendance
    ? `${demoAttendanceSummary.overall}%`
    : summary.overall
      ? `${summary.overall}%`
      : "No attendance records yet";
  const studentCount = studentProfiles.length || 4;
  const teacherCount = teacherProfiles.length;

  if (isStudent) {
    if (
      query.includes("low attendance") ||
      query.includes("below 75") ||
      query.includes("weak subject")
    )
      return lowSubjects.length
        ? `Subjects below 80% attendance:\n${lowSubjects.map((item) => `â€¢ ${item[0]}: ${item[1]}% (${item[2]})`).join("\n")}`
        : "No low-attendance subjects found in your current records.";
    if (query.includes("feedback"))
      return `Your feedback status:\n${feedbackSummary}`;
    if (
      query.includes("study") ||
      query.includes("suggestion") ||
      query.includes("improve")
    )
      return lowSubjects.length
        ? `Study suggestion: prioritize ${lowSubjects.map((item) => item[0]).join(" and ")}. Review missed topics, attend the next sessions, and target at least 75% in each subject.`
        : `Study suggestion: your attendance is ${summary.overall}%. Keep a weekly revision block and maintain attendance above the 75% requirement.`;
    if (query.includes("history") || query.includes("recent attendance"))
      return recent
        ? `Recent attendance history:\n${recent}`
        : "No attendance history is available yet.";
    if (
      query.includes("timetable") ||
      query.includes("schedule") ||
      query.includes("class")
    )
      return query.includes("next")
        ? `Your next class on ${day}:\n${today[0] ? `â€¢ ${today[0][1]} Â· ${today[0][0]} Â· ${today[0][3]}` : "No upcoming class is scheduled."}`
        : `Your ${day} timetable:\n${formatClasses(today)}`;
    if (
      query.includes("attendance") ||
      query.includes("overall") ||
      query.includes("present") ||
      query.includes("absent")
    )
      return `Your attendance is ${summary.overall}%: ${summary.present}/${summary.lectures} classes attended, ${summary.absent} absent, and ${summary.late} late.`;
  }
  if (isTeacher) {
    if (query.includes("feedback"))
      return `Recent student feedback:\n${
        feedback
          .slice(0, 4)
          .map(
            (item) => `â€¢ ${item.subject}: ${item.rating}/5 Â· ${item.status}`,
          )
          .join("\n") || "No feedback is available."
      }`;
    if (query.includes("below 75") || query.includes("low attendance"))
      return `Students below 75%:\n${studentProfiles.map((student) => `â€¢ ${student.name}: attendance record not available`).join("\n") || "No student roster is available."}`;
    if (
      query.includes("average") ||
      query.includes("performance") ||
      query.includes("summary")
    )
      return `Class performance summary: average attendance is ${classAverage}. Recent records show ${summary.present} present, ${summary.absent} absent, and ${summary.late} late entries.`;
    if (
      query.includes("timetable") ||
      query.includes("schedule") ||
      query.includes("class")
    )
      return `Your ${day} classes:\n${formatClasses(today)}`;
  }
  if (isAdmin) {
    if (query.includes("teacher"))
      return `There are ${teacherCount} registered teacher account${teacherCount === 1 ? "" : "s"} in the current local records.`;
    if (query.includes("student"))
      return `There are ${studentCount} registered student account${studentCount === 1 ? "" : "s"} in the current local records.`;
    if (query.includes("feedback"))
      return `Feedback summary: ${feedback.length} total entries, average rating ${(feedback.reduce((sum, item) => sum + Number(item.rating || 0), 0) / Math.max(feedback.length, 1)).toFixed(1)}/5.`;
    if (query.includes("low attendance") || query.includes("below 75"))
      return `Low-attendance view: the demo subject records below 75% are Web Development and Computer Networks at 75%. Student-level records can be reviewed from Student Records when available.`;
    if (query.includes("statistics") || query.includes("attendance"))
      return `Attendance statistics: demo average ${demoAttendanceSummary.overall}%, ${demoAttendanceSummary.present} present, ${demoAttendanceSummary.absent} absent, and ${demoAttendanceSummary.late} late entries.`;
    if (query.includes("activity") || query.includes("campus"))
      return `Campus activity summary: ${studentCount} students, ${teacherCount} teachers, ${feedback.length} feedback entries, and ${today.length} classes on today's timetable.`;
  }
  return "For other inquiry please contact baccollage@gmail.com";
}

function AIAssistant({ role, profile, attendance, feedback, onClose }) {
  const [messages, setMessages] = useState([
    {
      from: "assistant",
      text: `Hello ${profile.name || "there"}. I can help you with your ${role === "student" ? "attendance and timetable" : "campus data"}.`,
    },
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const suggestions = getAssistantFaqs(role).map(([prompt]) => prompt);
  const sendQuestion = (value = question) => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    setQuestion("");
    setMessages((current) => [...current, { from: "user", text: trimmed }]);
    setLoading(true);
    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          from: "assistant",
          text: buildAssistantReply(trimmed, {
            role,
            profile,
            attendance,
            feedback,
          }),
        },
      ]);
      setLoading(false);
    }, 280);
  };
  return (
    <motion.aside
      className="ai-assistant"
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
    >
      <div className="ai-head">
        <div>
          <span className="ai-mark">
            <Sparkles size={15} />
          </span>
          <div>
            <b>Campus AI Assistant</b>
            <small>
              {role === "student"
                ? "Student support"
                : role === "teacher"
                  ? "Teacher support"
                  : "Admin support"}
            </small>
          </div>
        </div>
        <button
          className="icon-btn"
          onClick={onClose}
          aria-label="Close assistant"
        >
          {<X />}
        </button>
      </div>
      <div className="ai-messages">
        {messages.map((message, index) => (
          <div
            className={`ai-message ${message.from}`}
            key={`${message.from}-${index}`}
          >
            <span>
              {message.from === "assistant" ? <Bot size={14} /> : "You"}
            </span>
            <p>{message.text}</p>
          </div>
        ))}
        {loading && (
          <div className="ai-message assistant">
            <span>
              <Bot size={14} />
            </span>
            <p className="ai-typing">
              <i />
              <i />
              <i />
            </p>
          </div>
        )}
      </div>
      <div className="ai-suggestions">
        {suggestions.map((item) => (
          <button key={item} onClick={() => sendQuestion(item)}>
            {item}
          </button>
        ))}
      </div>
      <form
        className="ai-input"
        onSubmit={(event) => {
          event.preventDefault();
          sendQuestion();
        }}
      >
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask Campus AI..."
          aria-label="Ask Campus AI"
        />
        <button className="primary" type="submit" aria-label="Send question">
          <Send size={16} />
        </button>
      </form>
    </motion.aside>
  );
}

function classifyComplaint(text) {
  const t = text.toLowerCase();
  const cats = [
    ["Electrical", /fan|light|switch|socket|electric|power|wiring/],
    ["Plumbing", /water|tap|leak|pipe|plumb|drain|toilet|bathroom/],
    ["Cleaning", /clean|dirty|dust|garbage|trash|sweep|mop|hygiene/],
    ["Furniture", /chair|table|bed|desk|cupboard|door|window|lock/],
    ["Internet", /wifi|internet|network|lan|router/],
    ["Pest Control", /cockroach|rat|ant|pest|insect|bug/],
  ];
  const locs = [
    ["Hostel Block A", /block a|hostel a/],
    ["Hostel Block B", /block b|hostel b/],
    ["Hostel Block C", /block c|hostel c/],
    ["Main Hostel", /hostel|room/],
    ["Mess", /mess|canteen|kitchen/],
    ["Academic Block", /class|lab|academic/],
  ];
  const category = (cats.find(([, r]) => r.test(t)) || ["General"])[0];
  const location = (locs.find(([, r]) => r.test(t)) || ["Campus"])[0];
  const priority =
    /(urgent|emergency|danger|critical|not working|broken|flood|spark)/.test(t)
      ? "High"
      : /(leak|issue|problem|damage)/.test(t)
        ? "Medium"
        : "Low";
  const departments = {
    Electrical: "Electrical Dept",
    Plumbing: "Plumbing Dept",
    Cleaning: "Housekeeping",
    Furniture: "Maintenance",
    Internet: "IT Dept",
    "Pest Control": "Housekeeping",
    General: "Maintenance",
  };
  return {
    category,
    location,
    priority,
    department: departments[category] || "Maintenance",
  };
}
function detectRecurringIssues(complaints) {
  const groups = {};
  complaints.forEach((c) => {
    const key = `${c.aiCategory || "General"}-${c.aiLocation || "Campus"}`;
    if (!groups[key])
      groups[key] = {
        key,
        category: c.aiCategory,
        location: c.aiLocation,
        count: 0,
        items: [],
      };
    groups[key].count++;
    groups[key].items.push(c);
  });
  return Object.values(groups)
    .filter((g) => g.count >= 2)
    .sort((a, b) => b.count - a.count);
}

const demoNotices = [
  {
    id: "NOT-001",
    title: "Mid-Semester Exam Schedule Published",
    body: "The mid-semester examination schedule for all branches has been published. Students are advised to check the examination portal.",
    category: "Academic",
    target: "All",
    author: "Exam Controller",
    date: "2026-09-10",
    read: false,
  },
  {
    id: "NOT-002",
    title: "Hostel Mess Menu Updated",
    body: "The weekly mess menu has been updated effective September 15. Check the Mess Menu section for details.",
    category: "Hostel",
    target: "Hostel Students",
    author: "Hostel Warden",
    date: "2026-09-09",
    read: false,
  },
  {
    id: "NOT-003",
    title: "Annual Sports Day Registration Open",
    body: "Register for Annual Sports Day events before September 20. Visit the Sports Complex for forms.",
    category: "Events",
    target: "All",
    author: "Sports Committee",
    date: "2026-09-08",
    read: true,
  },
  {
    id: "NOT-004",
    title: "Library Hours Extended",
    body: "The central library will remain open until 11 PM during exam weeks starting September 15.",
    category: "General",
    target: "All",
    author: "Librarian",
    date: "2026-09-07",
    read: true,
  },
];
const demoGatePasses = [
  {
    id: "GP-10001",
    studentName: "Demo Student",
    studentId: "STU-DEMO-1",
    date: "2026-09-12",
    time: "02:00 PM",
    returnDate: "2026-09-12",
    returnTime: "06:00 PM",
    reason: "Medical appointment at city hospital",
    status: "Approved",
    approvedBy: "Warden Mr. Singh",
    gateVerified: false,
    createdAt: "2026-09-11",
  },
  {
    id: "GP-10002",
    studentName: "Demo Student",
    studentId: "STU-DEMO-1",
    date: "2026-09-15",
    time: "09:00 AM",
    returnDate: "2026-09-15",
    returnTime: "01:00 PM",
    reason: "Family visit",
    status: "Pending",
    approvedBy: "",
    gateVerified: false,
    createdAt: "2026-09-13",
  },
];
const demoCertificateRequests = [
  {
    id: "CERT-5001",
    studentName: "Demo Student",
    studentId: "STU-DEMO-1",
    type: "Bonafide Certificate",
    purpose: "Bank loan application",
    status: "Generated",
    requestDate: "2026-09-05",
    completedDate: "2026-09-07",
    verifiedBy: "Admin Office",
  },
  {
    id: "CERT-5002",
    studentName: "Demo Student",
    studentId: "STU-DEMO-1",
    type: "Character Certificate",
    purpose: "Internship application",
    status: "Submitted",
    requestDate: "2026-09-12",
    completedDate: "",
    verifiedBy: "",
  },
];
const demoHostelComplaints = [
  {
    id: "HC-2001",
    studentName: "Demo Student",
    studentId: "STU-DEMO-1",
    description: "Hostel room B-204 ceiling fan not working since yesterday",
    aiCategory: "Electrical",
    aiLocation: "Hostel Block B",
    aiPriority: "High",
    aiDepartment: "Electrical Dept",
    assignedTo: "Rajesh Kumar",
    status: "In Progress",
    remarks: "Electrician assigned, spare fan ordered",
    createdAt: "2026-09-10",
  },
  {
    id: "HC-2002",
    studentName: "Neha Kapoor",
    studentId: "STU-DEMO-2",
    description: "Water leaking from bathroom tap in hostel A room 105",
    aiCategory: "Plumbing",
    aiLocation: "Hostel Block A",
    aiPriority: "Medium",
    aiDepartment: "Plumbing Dept",
    assignedTo: "Suresh Pal",
    status: "Resolved",
    remarks: "Tap washer replaced",
    createdAt: "2026-09-08",
  },
  {
    id: "HC-2003",
    studentName: "Aman Deep",
    studentId: "STU-DEMO-3",
    description: "Hostel Block B corridor lights are not working on 2nd floor",
    aiCategory: "Electrical",
    aiLocation: "Hostel Block B",
    aiPriority: "Medium",
    aiDepartment: "Electrical Dept",
    assignedTo: "",
    status: "Open",
    remarks: "",
    createdAt: "2026-09-12",
  },
];
const demoMessMenu = {
  Monday: {
    breakfast: "Poha, Bread Butter, Tea/Coffee",
    lunch: "Rice, Dal Tadka, Aloo Gobi, Roti, Salad",
    snacks: "Samosa, Tea",
    dinner: "Rice, Paneer Butter Masala, Roti, Raita",
  },
  Tuesday: {
    breakfast: "Idli Sambhar, Banana, Tea/Coffee",
    lunch: "Rice, Rajma, Bhindi Fry, Roti, Pickle",
    snacks: "Bread Pakora, Coffee",
    dinner: "Rice, Chole, Roti, Mixed Veg, Kheer",
  },
  Wednesday: {
    breakfast: "Paratha, Curd, Tea/Coffee",
    lunch: "Rice, Dal Fry, Cabbage Sabzi, Roti, Salad",
    snacks: "Vada Pav, Tea",
    dinner: "Rice, Egg Curry / Paneer, Roti, Papad",
  },
  Thursday: {
    breakfast: "Upma, Bread Jam, Tea/Coffee",
    lunch: "Biryani / Veg Pulao, Raita, Roti, Salad",
    snacks: "Maggi, Juice",
    dinner: "Rice, Malai Kofta, Roti, Pickle, Gulab Jamun",
  },
  Friday: {
    breakfast: "Chole Bhature, Tea/Coffee",
    lunch: "Rice, Moong Dal, Baingan Bharta, Roti, Salad",
    snacks: "Pav Bhaji, Lassi",
    dinner: "Rice, Mix Veg, Roti, Dal Makhani, Ice Cream",
  },
  Saturday: {
    breakfast: "Dosa, Chutney, Tea/Coffee",
    lunch: "Rice, Kadhi Pakora, Aloo Jeera, Roti, Salad",
    snacks: "Dhokla, Tea",
    dinner: "Rice, Chicken Curry / Shahi Paneer, Roti, Sweet",
  },
  Sunday: {
    breakfast: "Poori Bhaji, Fruit, Tea/Coffee",
    lunch: "Special Thali: Rice, Dal, 2 Sabzi, Roti, Sweet, Salad",
    snacks: "Pasta, Cold Drink",
    dinner: "Rice, Butter Chicken / Paneer Tikka, Naan, Raita",
  },
};

function App() {
  const [role, setRole] = useState(load("cc_role", "student"));
  const [page, setPage] = useState("dashboard");
  const [logged, setLogged] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [theme, setTheme] = useState(load("cc_theme", "dark"));
  const [connectivity, setConnectivity] = useState(readConnectivity);
  const [language, setLanguage] = useState(load("cc_language", "English"));
  const [liteMode, setLiteMode] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [issues, setIssues] = useState(load("cc_issues", []));
  const [lostFoundReports, setLostFoundReports] = useState(
    load("cc_lost_found", []),
  );
  const [notifications, setNotifications] = useState(
    load("cc_notifications", [
      {
        id: 1,
        title: "New Announcement",
        text: "Final exams timetable published.",
        read: false,
      },
      {
        id: 2,
        title: "Attendance Ready",
        text: "Your attendance dashboard is updated.",
        read: false,
      },
    ]),
  );
  const [session, setSession] = useState(load("cc_session", null));
  const [profile, setProfile] = useState(
    load("cc_profile", { name: "Student" }),
  );
  const [payments, setPayments] = useState([]);
  const [feedback, setFeedback] = useState(load("cc_feedback", demoFeedback));
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [studentAttendanceMode, setStudentAttendanceMode] = useState(false);
  const [gatePasses, setGatePasses] = useState(
    load("cf_gate_passes", demoGatePasses),
  );
  const [certificateRequests, setCertificateRequests] = useState(
    load("cf_certificates", demoCertificateRequests),
  );
  const [hostelComplaints, setHostelComplaints] = useState(
    load("cf_hostel_complaints", demoHostelComplaints),
  );
  const [notices, setNotices] = useState(load("cf_notices", demoNotices));
  const [visitorLogs, setVisitorLogs] = useState(load("cf_visitor_logs", []));
  const [hostelRooms, setHostelRooms] = useState(load("cf_hostel_rooms", []));

  // Detect /student-attendance route from QR code scan
  useEffect(() => {
    const path = window.location.pathname;
    if (
      path === "/student-attendance" ||
      path.endsWith("/student-attendance")
    ) {
      setStudentAttendanceMode(true);
    }
  }, []);

  // If student opened the QR attendance link, show the StudentAttendance page
  if (studentAttendanceMode) {
    return <StudentAttendance />;
  }

  useEffect(() => {
    if (logged) {
      if (profile.studentId) save(studentDataKey(profile.studentId), attendance);
      else if (profile.role === "teacher") save(`cc_teacher_record_${profile.name}`, attendance);
    }
  }, [attendance, logged, profile]);
  useEffect(() => {
    if (logged && profile.studentId)
      save(paymentDataKey(profile.studentId), payments);
  }, [payments, logged, profile.studentId]);
  useEffect(() => save("cc_issues", issues), [issues]);
  useEffect(() => save("cc_lost_found", lostFoundReports), [lostFoundReports]);
  useEffect(() => save("cc_notifications", notifications), [notifications]);
  useEffect(() => save("cc_session", session), [session]);
  useEffect(() => save("cc_profile", profile), [profile]);
  useEffect(() => save("cc_feedback", feedback), [feedback]);
  useEffect(() => save("cf_gate_passes", gatePasses), [gatePasses]);
  useEffect(
    () => save("cf_certificates", certificateRequests),
    [certificateRequests],
  );
  useEffect(
    () => save("cf_hostel_complaints", hostelComplaints),
    [hostelComplaints],
  );
  useEffect(() => save("cf_notices", notices), [notices]);
  useEffect(() => save("cf_visitor_logs", visitorLogs), [visitorLogs]);
  useEffect(() => save("cf_hostel_rooms", hostelRooms), [hostelRooms]);
  useEffect(() => save("cc_language", language), [language]);
  useEffect(() => {
    const update = () => setConnectivity(readConnectivity());
    const network =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    network?.addEventListener?.("change", update);
    update();
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      network?.removeEventListener?.("change", update);
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.removeItem("cc_logged");
    } catch {}
  }, []);
  useEffect(() => {
    const holidays = [
      {
        id: "holiday-founders-2026",
        title: "Founders Day Holiday",
        text: "Campus will remain closed on September 18, 2026.",
      },
      {
        id: "holiday-break-2026",
        title: "Mid-Semester Break",
        text: "No classes are scheduled from October 12 to October 16, 2026.",
      },
      {
        id: "holiday-diwali-2026",
        title: "Diwali Holiday",
        text: "Campus offices and classes will be closed on November 9, 2026.",
      },
    ];
    setNotifications((current) => [
      ...holidays.filter(
        (holiday) => !current.some((item) => item.id === holiday.id),
      ),
      ...current,
    ]);
  }, []);
  useEffect(() => {
    save("cc_theme", theme);
    document.body.dataset.theme = theme;
  }, [theme]);

  if (!logged)
    return (
      <Login
        role={role}
        setRole={setRole}
        onLogin={(nextProfile) => {
          if (!nextProfile?.studentId) return;
          const demoRoles = {
            "STU-DEMO-1": "student",
            "EMP-WRD-01": "warden",
            "TCH-DEMO-01": "teacher",
            "ADM-001": "admin",
          };
          const resolvedRole =
            nextProfile.role || demoRoles[nextProfile.studentId] || role;
          const resolvedProfile = { ...nextProfile, role: resolvedRole };
          setRole(resolvedRole);
          setLiteMode(
            resolvedRole === "student"
              ? load(`cc_lite_mode_${nextProfile.studentId}`, false)
              : false,
          );
          save("cc_role", resolvedRole);
          save("cc_profile", resolvedProfile);
          setProfile(resolvedProfile);
          const storedAttendance = resolvedRole === "teacher"
            ? load(`cc_teacher_record_${resolvedProfile.name}`, [])
            : readStudentAttendance(resolvedProfile.studentId);
          setAttendance(
            storedAttendance.length
              ? storedAttendance
              : resolvedRole === "student"
                ? demoAttendanceRecords
                : [],
          );
          setPayments(readStudentPayments(resolvedProfile.studentId));
          setPage("dashboard");
          setLogged(true);
        }}
      />
    );

  const updateStudentLiteMode = (nextValue) => {
    if (role !== "student" || !profile.studentId) return;
    const enabled = Boolean(
      typeof nextValue === "function" ? nextValue(liteMode) : nextValue,
    );
    setLiteMode(enabled);
    save(`cc_lite_mode_${profile.studentId}`, enabled);
  };

  const logout = () => {
    setLogged(false);
    try {
      localStorage.removeItem("cc_logged");
    } catch {}
    setPage("dashboard");
  };
  const studentNav = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["attendance", "Mark Attendance", QrCode],
    ["emergency-sos", "Emergency SOS", AlertTriangle],
    ["clubs-events", "Clubs & Events", CalendarCheck],
    ["history", "Attendance History", History],
    ["timetable", "Daily Timetable", CalendarDays],
    ["lost-found", "Lost & Found", Search],
    ["placement", "Placement & Internships", Briefcase],
    ["notices", "Notices & Announcements", Megaphone],
    ["gatepass", "Leave / Gate Pass", DoorOpen],
    ["certificate", "Certificate Request", Award],
    ["hostelcomplaint", "Hostel Complaint", Home],
    ["messmenu", "Mess Menu", UtensilsCrossed],
    ["payments", "Fees / Dues", Receipt],
    ["map", "Campus Map", Map],
    ["feedback", "Feedback", ClipboardList],
    ["settings", "Settings", Settings],
  ];
  const adminNav = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["emergency-alerts", "Emergency Alerts", AlertTriangle],
    ["clubs-events", "Clubs & Events", CalendarCheck],
    ["assisted-access", "Student Assisted Access", ShieldCheck],
    ["admin-analytics", "Admin Analytics", BarChart3],
    ["teacher-management", "Teacher Management", Users],
    ["admin-management", "Admin Management", ShieldCheck],
    ["warden-management", "Warden Management", Wrench],
    ["student-approval", "Student Registration Approval", CheckCircle2],
    ["student-academics", "Student Academic Details", GraduationCap],
    ["lost-found", "Lost & Found", Search],
    ["visitor-logs", "Visitor + Gate Logs", Users],
    ["adminnotices", "Notice Management", Megaphone],
    ["admingatepass", "Gate Pass Management", DoorOpen],
    ["admincert", "Certificate Management", Award],
    ["adminhostel", "Complaint Management", AlertTriangle],
    ["placement-management", "Placement Management", Briefcase],
    ["map", "Campus Map", Map],
    ["timetable-management", "Timetable Management", CalendarDays],
    ["salary", "Teacher Salaries", CircleDollarSign],
    ["feedback", "Feedback", ClipboardList],
    ["settings", "Settings", Settings],
  ];
  const staffNav = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["staffcomplaints", "Assigned Complaints", Wrench],
    ["emergency-alerts", "Emergency Alerts", AlertTriangle],
    ["assisted-access", "Student Assisted Access", ShieldCheck],
    ["admingatepass", "Gate Pass Management", DoorOpen],
    ["visitor-logs", "Visitor + Gate Logs", Users],
    ["room-assets", "Room + Asset Records", Home],
    ["lost-found", "Lost & Found", Search],
    ["staffupdate", "Update Status", CheckCircle2],
    ["settings", "Settings", Settings],
  ];
  const teacherNav = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["create", "Create Session", QrCode],
    ["clubs-events", "Clubs & Events", CalendarCheck],
    ["monitor", "Live Monitoring", Activity],
    ["students", "Student Records", Users],
    ["marks", "Student Marks", ClipboardList],
    ["timetable", "Daily Timetable", CalendarDays],
    ["feedback", "Feedback", ClipboardList],
    ["settings", "Settings", Settings],
  ];
  const nav =
    role === "student"
      ? studentNav
      : role === "warden"
        ? staffNav
        : role === "teacher"
          ? teacherNav
          : adminNav;
  const registeredStudents = Object.values(load("cc_face_profiles", {})).filter(
    (student) => student.role === "student" && student.studentId,
  );

  return (
    <LanguageContext.Provider value={language}>
      <div
        className={`app-shell ${role === "student" && liteMode ? "student-lite" : ""}`}
      >
        {!connectivity.lowData && !(role === "student" && liteMode) && (
          <DashboardBackdrop />
        )}
        {assistantOpen && (
          <AIAssistant
            role={role}
            profile={profile}
            attendance={attendance}
            feedback={feedback}
            onClose={() => setAssistantOpen(false)}
          />
        )}
        <aside className={`sidebar ${mobile ? "open" : ""}`}>
          <div className="brand">
            <div className="brand-orb">
              <Layers size={22} />
            </div>
            <div>
              <b>CAMPUS</b>
              <span>PLUS</span>
            </div>
            <button
              className="icon-btn mobile-close"
              onClick={() => setMobile(false)}
            >
              <X />
            </button>
          </div>
          <div className="prototype">UNIFIED CAMPUS OPERATIONS</div>
          <label style={{ margin: "0 10px 12px" }}>
            {translateUiText("Language", language)}
            <select
              aria-label={translateUiText("Language", language)}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              style={{ marginTop: 6, padding: 8 }}
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Odia</option>
            </select>
          </label>
          <nav>
            {nav.map(([id, label, Icon]) => (
              <button
                key={id}
                className={page === id ? "nav active" : "nav"}
                onClick={() => {
                  setPage(id);
                  setMobile(false);
                }}
              >
                <Icon size={19} />
                <span>{translateUiText(label, language)}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <button
              className="nav ai-nav"
              onClick={() => setAssistantOpen(true)}
            >
              <Bot size={19} />
              <span>Campus Plus AI</span>
            </button>
            <button className="nav" onClick={() => setPage("notifications")}>
              <Bell size={19} />
              <span>{translateUiText("Notifications", language)}</span>
              {notifications.some((n) => !n.read) && <i />}
            </button>
            <button className="nav" onClick={logout}>
              <LogOut size={19} />
              <span>{translateUiText("Logout", language)}</span>
            </button>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <button className="icon-btn" onClick={() => setMobile(true)}>
              <Menu />
            </button>
            <div className="crumb">
              <span>CampusFlow</span>
              <ChevronRight size={14} />
              <b>
                {translateUiText(
                  nav.find((x) => x[0] === page)?.[1] || "Notifications",
                  language,
                )}
              </b>
            </div>
            <div className="top-actions">
              <div
                role="status"
                aria-live="polite"
                title={
                  connectivity.effectiveType ||
                  (connectivity.online
                    ? "Connection available"
                    : "No network connection")
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 8px",
                  border: `1px solid ${connectivity.lowData ? "rgba(255,183,77,.4)" : "rgba(66,223,154,.3)"}`,
                  borderRadius: 8,
                  color: connectivity.lowData ? "#ffc46b" : "#42df9a",
                  fontSize: 10,
                  whiteSpace: "nowrap",
                }}
              >
                {connectivity.online ? (
                  <Wifi size={14} />
                ) : (
                  <WifiOff size={14} />
                )}
                <span>
                  {translateUiText(
                    !connectivity.online
                      ? "Offline · Low Data"
                      : connectivity.lowData
                        ? "Low Data Mode"
                        : "Online",
                    language,
                  )}
                </span>
              </div>
              {role === "student" && (
                <button
                  type="button"
                  className={`lite-mode-indicator ${liteMode ? "enabled" : ""}`}
                  aria-pressed={liteMode}
                  title="Toggle Lite Mode"
                  onClick={() => updateStudentLiteMode((value) => !value)}
                >
                  Lite Mode {liteMode ? "ON" : "OFF"}
                </button>
              )}
              <button
                className="icon-btn"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun /> : <Moon />}
              </button>
              <button
                className="notification-btn"
                onClick={() => setPage("notifications")}
              >
                <Bell size={19} />
                {notifications.some((n) => !n.read) && <i />}
              </button>
              <button
                className="notification-btn ai-top-btn"
                onClick={() => setAssistantOpen(true)}
                aria-label="Open Campus Plus AI"
              >
                <Bot size={19} />
              </button>
              <button
                className="icon-btn"
                title="Settings"
                onClick={() => setPage("settings")}
              >
                <Settings size={18} />
              </button>
              <div
                className="user-chip"
                onClick={() => setPage("settings")}
                style={{ cursor: "pointer" }}
                title="View Profile & Settings"
              >
                <div className="avatar">{initials(profile.name)}</div>
                <div>
                  <b>{profile.name}</b>
                  <small>
                    {role === "student"
                      ? "Student"
                      : role === "warden"
                        ? "Staff"
                        : role === "teacher"
                          ? "Teacher"
                          : "Admin"}
                  </small>
                </div>
              </div>
              <button
                className="icon-btn logout-top-btn"
                title="Logout"
                onClick={logout}
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>
          <LocalizedTree className="page-wrap">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={
                  liteMode && role === "student" ? false : { opacity: 0, y: 12 }
                }
                animate={
                  liteMode && role === "student"
                    ? undefined
                    : { opacity: 1, y: 0 }
                }
                exit={
                  liteMode && role === "student"
                    ? undefined
                    : { opacity: 0, y: -8 }
                }
                transition={
                  liteMode && role === "student"
                    ? { duration: 0 }
                    : { duration: 0.2 }
                }
              >
                {page === "dashboard" &&
                  (role === "student" ? (
                    <StudentDashboard
                      go={setPage}
                      attendance={attendance}
                      payments={payments}
                      studentName={profile.name}
                      studentId={profile.studentId}
                      branch={profile.branch || profile.department}
                      gatePasses={gatePasses}
                      certificateRequests={certificateRequests}
                      hostelComplaints={hostelComplaints}
                      notices={notices}
                    />
                  ) : role === "warden" ? (
                    <StaffDashboard
                      go={setPage}
                      complaints={hostelComplaints}
                      profile={profile}
                      setComplaints={setHostelComplaints}
                    />
                  ) : role === "teacher" ? (
                    <TeacherDashboard
                      go={setPage}
                      profile={profile}
                      attendance={attendance}
                      feedback={feedback}
                    />
                  ) : (
                    <AdminDashboard
                      go={setPage}
                      attendance={attendance}
                      session={session}
                      students={registeredStudents}
                      gatePasses={gatePasses}
                      certificateRequests={certificateRequests}
                      hostelComplaints={hostelComplaints}
                      notices={notices}
                    />
                  ))}
                {page === "clubs-events" &&
                  (role === "student" ||
                    role === "admin" ||
                    role === "teacher") && (
                    <ClubsEventsPage role={role} profile={profile} />
                  )}
                {page === "emergency-sos" && role === "student" && (
                  <EmergencySosPage role={role} profile={profile} />
                )}
                {page === "emergency-alerts" &&
                  (role === "admin" || role === "warden") && (
                    <EmergencySosPage role={role} profile={profile} />
                  )}
                {page === "admin-analytics" && role === "admin" && (
                  <AdminAnalyticsPage
                    complaints={hostelComplaints}
                    gatePasses={gatePasses}
                    certificateRequests={certificateRequests}
                  />
                )}
                {page === "attendance" && (
                  <Scanner
                    attendance={attendance}
                    setAttendance={setAttendance}
                    session={session}
                    studentName={profile.name}
                    studentId={profile.studentId}
                  />
                )}
                {page === "create" && role === "teacher" && (
                  <Generator
                    session={session}
                    setSession={setSession}
                    role={role}
                    attendance={attendance}
                    setAttendance={setAttendance}
                    profile={profile}
                  />
                )}
                {page === "history" && <HistoryPage attendance={attendance} />}
                {page === "lost-found" &&
                  (role === "student" ||
                    role === "admin" ||
                    role === "warden") && (
                    <LostFoundPage
                      role={role}
                      profile={profile}
                      reports={lostFoundReports}
                      setReports={setLostFoundReports}
                    />
                  )}
                {page === "timetable" && (
                  <Timetable
                    branch={profile.branch || profile.department}
                    studentId={profile.studentId}
                    profile={profile}
                  />
                )}
                {page === "placement" && role === "student" && (
                  <PlacementPortal profile={profile} />
                )}
                {page === "placement-management" && role === "admin" && (
                  <PlacementManagementFixed />
                )}
                {page === "feedback" && (
                  <FeedbackPage
                    role={role}
                    profile={profile}
                    feedback={feedback}
                    setFeedback={setFeedback}
                  />
                )}
                {page === "payments" && <PaymentHistory payments={payments} />}
                {page === "map" && (
                  <CampusMap
                    lowConnectivity={
                      connectivity.lowData || (role === "student" && liteMode)
                    }
                  />
                )}
                {page === "issue" && (
                  <IssuePage
                    role={role}
                    issues={issues}
                    setIssues={setIssues}
                  />
                )}
                {page === "monitor" && role === "teacher" && (
                  <Monitor attendance={attendance} session={session} />
                )}
                {page === "students" && role === "teacher" && (
                  <StudentRecords />
                )}
                {page === "marks" && role === "teacher" && <StudentMarks />}
                {page === "teacher-management" && role === "admin" && (
                  <AccountManagement
                    targetRole="teacher"
                    currentProfile={profile}
                  />
                )}
                {page === "admin-management" && role === "admin" && (
                  <AccountManagement
                    targetRole="admin"
                    currentProfile={profile}
                  />
                )}
                {page === "warden-management" && role === "admin" && (
                  <AccountManagement
                    targetRole="warden"
                    currentProfile={profile}
                  />
                )}
                {page === "student-approval" && role === "admin" && (
                  <StudentRegistrationApproval />
                )}
                {page === "student-academics" && role === "admin" && (
                  <StudentAcademicDetails />
                )}
                {page === "manage" && <Manage />}
                {page === "timetable-management" && role === "admin" && (
                  <TimetableManagement />
                )}
                {page === "salary" && <TeacherSalaries />}
                {page === "notifications" && (
                  <Notifications
                    data={notifications}
                    setData={setNotifications}
                  />
                )}
                {page === "settings" && (
                  <SettingsPage
                    theme={theme}
                    setTheme={setTheme}
                    logout={logout}
                    profile={profile}
                    role={role}
                    liteMode={liteMode}
                    setLiteMode={updateStudentLiteMode}
                  />
                )}
                {page === "notices" && <NoticesPage notices={notices} />}
                {page === "gatepass" && (
                  <GatePassPage
                    profile={profile}
                    gatePasses={gatePasses}
                    setGatePasses={setGatePasses}
                    setNotifications={setNotifications}
                  />
                )}
                {page === "certificate" && (
                  <CertificateRequestPage
                    profile={profile}
                    certificateRequests={certificateRequests}
                    setCertificateRequests={setCertificateRequests}
                  />
                )}
                {page === "hostelcomplaint" && (
                  <HostelComplaintPage
                    profile={profile}
                    complaints={hostelComplaints}
                    setComplaints={setHostelComplaints}
                    setNotifications={setNotifications}
                  />
                )}
                {page === "messmenu" && <MessMenuPage />}
                {page === "adminnotices" && (
                  <AdminNoticesPage notices={notices} setNotices={setNotices} />
                )}
                {page === "admingatepass" &&
                  (role === "admin" || role === "warden") && (
                    <AdminGatePassPage
                      role={role}
                      gatePasses={gatePasses}
                      setGatePasses={setGatePasses}
                      setNotifications={setNotifications}
                    />
                  )}
                {page === "admincert" && (
                  <AdminCertificatePage
                    certificateRequests={certificateRequests}
                    setCertificateRequests={setCertificateRequests}
                  />
                )}
                {page === "adminhostel" && (
                  <AdminHostelComplaintPage
                    complaints={hostelComplaints}
                    setComplaints={setHostelComplaints}
                  />
                )}
                {page === "staffcomplaints" && (
                  <StaffComplaintsPage
                    complaints={hostelComplaints}
                    setComplaints={setHostelComplaints}
                    profile={profile}
                  />
                )}
                {page === "staffupdate" && (
                  <StaffComplaintsPage
                    complaints={hostelComplaints}
                    setComplaints={setHostelComplaints}
                    profile={profile}
                  />
                )}
                {page === "visitor-logs" &&
                  (role === "admin" || role === "warden") && (
                    <VisitorGateLogsPage
                      role={role}
                      visitorLogs={visitorLogs}
                      setVisitorLogs={setVisitorLogs}
                    />
                  )}
                {page === "room-assets" && role === "warden" && (
                  <RoomAssetRecordsPage
                    rooms={hostelRooms}
                    setRooms={setHostelRooms}
                  />
                )}
                {page === "assisted-access" &&
                  (role === "admin" || role === "warden") && (
                    <StudentAssistedAccessPage
                      attendance={attendance}
                      complaints={hostelComplaints}
                      notices={notices}
                      gatePasses={gatePasses}
                    />
                  )}
              </motion.div>
            </AnimatePresence>
          </LocalizedTree>
        </main>
      </div>
    </LanguageContext.Provider>
  );
}

function Login({ role, setRole, onLogin }) {
  const [step, setStep] = useState("choose");
  const [authMethod, setAuthMethod] = useState("face");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [cameraRef] = useState(() => ({ current: null }));
  const [cam, setCam] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [descriptor, setDescriptor] = useState(null);
  const [mode, setMode] = useState("login");
  const [modelsReady, setModelsReady] = useState(false);
  const [error, setError] = useState("");
  const profileKey = () => `${role}:${name.trim().toLowerCase()}`;
  useEffect(() => {
    if (role === "admin") {
      setAuthMethod("password");
      stopCamera();
    }
  }, [role]);
  const completePasswordLogin = () => {
    const profiles = load("cc_face_profiles", {});
    const key = profileKey();
    const profile = profiles[key] || {
      name: name.trim(),
      role,
      createdAt: new Date().toISOString(),
    };
    if (!profiles[key] && role !== "student")
      return setError("This account must be created by an administrator.");
    if (profile.role !== role)
      return setError("This account is registered under a different role.");
    if (profile.active === false)
      return setError("This account is disabled. Contact an administrator.");
    if (profile.role === "student" && profile.approvalStatus !== "approved")
      return setError(
        profile.approvalStatus === "rejected"
          ? "This student registration was rejected."
          : "Student registration is awaiting Admin approval.",
      );
    const studentId = profile.studentId || uid("STU");
    if (!profiles[key] || !profile.studentId) {
      profiles[key] = { ...profile, studentId, role };
      save("cc_face_profiles", profiles);
    }
    setPassword("");
    setConfirmPassword("");
    setShowPasswordDialog(false);
    onLogin({
      name: profile.name,
      studentId,
      role: profile.role,
      branch: profile.branch || profile.department,
    });
  };
  const createPassword = async () => {
    if (!name.trim()) return setError("Enter your registered name first.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    const passwordProfiles = load("cc_password_profiles", {});
    passwordProfiles[profileKey()] = {
      hash: await hashPassword(password),
      updatedAt: new Date().toISOString(),
    };
    save("cc_password_profiles", passwordProfiles);
    completePasswordLogin();
  };
  const startPasswordLogin = async () => {
    if (!name.trim()) return setError("Enter your registered name first.");
    const stored = load("cc_password_profiles", {})[profileKey()];
    if (!stored) return setError("Wrong password");
    if (!password) return setError("Enter your password.");
    const validPassword = await verifyPassword(password, stored.hash).catch(
      () => false,
    );
    const legacyPassword =
      !validPassword && stored.hash === (await legacyHashPassword(password));
    if (!validPassword && !legacyPassword) return setError("Wrong password");
    if (legacyPassword) {
      const passwordProfiles = load("cc_password_profiles", {});
      passwordProfiles[profileKey()] = {
        hash: await hashPassword(password),
        updatedAt: new Date().toISOString(),
      };
      save("cc_password_profiles", passwordProfiles);
    }
    completePasswordLogin();
  };
  const stopCamera = () => {
    cam?.getTracks().forEach((track) => track.stop());
    if (cameraRef.current) cameraRef.current.srcObject = null;
    setCam(null);
    setCameraReady(false);
    setFaceCount(0);
    setDescriptor(null);
  };
  const completeFaceLogin = (nextProfile) => {
    stopCamera();
    setStep("choose");
    setError("");
    setPassword("");
    onLogin(nextProfile);
  };
  const startCamera = async () => {
    setError("");
    setCameraReady(false);
    setFaceCount(0);
    setDescriptor(null);
    stopCamera();
    if (!name.trim())
      return setError("Enter your name before starting face verification.");
    const registered = load("cc_face_profiles", {})[profileKey()];
    if (role !== "student")
      return setError("Face Login is available for Students only.");
    if (
      !Array.isArray(registered?.descriptor) ||
      registered.descriptor.length !== 128 ||
      registered.descriptor.some((value) => !Number.isFinite(value)) ||
      registered.role !== "student"
    )
      return setError("No registered face exists for this Student.");
    setMode("login");
    setStep("loading");
    try {
      if (!modelsReady) {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setModelsReady(true);
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setCam(stream);
      setStep("verify");
    } catch {
      stopCamera();
      setError(
        "Face models or camera could not be started. No login was performed.",
      );
      setStep("choose");
    }
  };
  const finishVerification = async () => {
    const streamActive = cam
      ?.getVideoTracks()
      .some((track) => track.readyState === "live");
    if (!cameraReady || !streamActive)
      return setError("Live camera is required.");
    if (faceCount !== 1 || !descriptor)
      return setError(
        faceCount === 0
          ? "No face detected."
          : "Show exactly one face to continue.",
      );
    const profiles = load("cc_face_profiles", {});
    const key = profileKey();
    const registered = profiles[key];
    if (
      !Array.isArray(registered?.descriptor) ||
      registered.descriptor.length !== 128 ||
      registered.descriptor.some((value) => !Number.isFinite(value))
    )
      return setError("No registered face exists for this Student.");
    if (registered.role !== role)
      return setError("This account is registered under a different role.");
    if (registered.active === false)
      return setError("This account is disabled. Contact an administrator.");
    const distance = faceapi.euclideanDistance(
      new Float32Array(descriptor),
      new Float32Array(registered.descriptor),
    );
    if (!Number.isFinite(distance) || distance > 0.52) {
      stopCamera();
      setError("Face verification failed.");
      setStep("choose");
      return;
    }
    const studentId = registered.studentId || uid("STU");
    if (!registered.studentId) {
      profiles[key] = { ...registered, studentId };
      save("cc_face_profiles", profiles);
    }
    if (password) {
      if (password.length < 6)
        return setError("Password must be at least 6 characters.");
      const passwordProfiles = load("cc_password_profiles", {});
      passwordProfiles[key] = {
        hash: await hashPassword(password),
        updatedAt: new Date().toISOString(),
      };
      save("cc_password_profiles", passwordProfiles);
    }
    setError("Face verification successful");
    await new Promise((resolve) => setTimeout(resolve, 500));
    completeFaceLogin({
      name: registered.name,
      studentId,
      role: registered.role,
      branch: registered.branch || registered.department,
    });
  };
  useEffect(
    () => () => cam?.getTracks().forEach((track) => track.stop()),
    [cam],
  );
  useEffect(() => {
    if (cameraRef.current && cam) {
      cameraRef.current.srcObject = cam;
      cameraRef.current
        .play()
        .catch(() => setError("Live camera preview could not start."));
    }
  }, [cam]);
  useEffect(() => {
    if (step !== "choose") return;
    const card = document.querySelector(".login-card");
    const heroTitle = card?.parentElement?.querySelector(".login-hero h1 span");
    const heroTagline = card?.parentElement?.querySelector(".login-hero p");
    if (heroTitle) heroTitle.textContent = "PLUS";
    if (heroTagline)
      heroTagline.textContent =
        "One platform.SMART CAMPUS. SMARTER CONNECTIONS";
    const inputs = card?.querySelectorAll("input") || [];
    const labels = card?.querySelectorAll("label") || [];
    inputs.forEach((input, index) => {
      const id = index === 0 ? "login-name" : "login-password";
      input.id = id;
      input.name = index === 0 ? "name" : "password";
      labels[index]?.setAttribute("for", id);
    });
    const added = [];
    const demoNote = card?.querySelector(".demo-note");
    if (demoNote && !card.querySelector(".register-link")) {
      const registerButton = document.createElement("button");
      registerButton.type = "button";
      registerButton.className = "text-btn register-link";
      registerButton.textContent = "Create Account / Register";
      registerButton.onclick = () => {
        setError("");
        setStep("register");
      };
      demoNote.after(registerButton);
      added.push(registerButton);
    }
    if (
      role === "student" &&
      error === "Wrong password" &&
      !card.querySelector(".forgot-password-link")
    ) {
      const forgotButton = document.createElement("button");
      forgotButton.type = "button";
      forgotButton.className = "text-btn forgot-password-link";
      forgotButton.textContent = "Forgot Password?";
      forgotButton.onclick = () => {
        setError("");
        setStep("forgot-face");
      };
      card.querySelector(".login-error")?.after(forgotButton);
      added.push(forgotButton);
    }
    const quickDemoButtons = card?.querySelector(".quick-demo-buttons");
    if (role === "admin")
      card?.querySelector(".login-methods button:first-child")?.remove();
    const roleTabs = card?.querySelector(".role-tabs");
    if (roleTabs) {
      const roleButtons = Array.from(roleTabs.querySelectorAll("button"));
      const studentButton = roleButtons.find((button) =>
        button.textContent.includes("Student"),
      );
      const wardenButton = roleButtons.find((button) =>
        button.textContent.includes("Warden"),
      );
      const adminButton = roleButtons.find((button) =>
        button.textContent.includes("Admin"),
      );
      if (studentButton && wardenButton && adminButton) {
        const teacherButton = document.createElement("button");
        teacherButton.type = "button";
        teacherButton.className = role === "teacher" ? "selected" : "";
        teacherButton.innerHTML = "<span>Teacher</span>";
        teacherButton.onclick = () => {
          setRole("teacher");
          setError("");
        };
        roleTabs.classList.add("role-tabs-four");
        roleTabs.replaceChildren(
          studentButton,
          teacherButton,
          adminButton,
          wardenButton,
        );
        added.push(teacherButton);
      }
    }
    return () => added.forEach((element) => element.remove());
  }, [step, authMethod, role, error]);
  useEffect(() => {
    if (step !== "verify" || !cameraReady || !cameraRef.current) return;
    let active = true;
    const check = async () => {
      try {
        const results = await faceapi
          .detectAllFaces(
            cameraRef.current,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 320,
              scoreThreshold: 0.6,
            }),
          )
          .withFaceLandmarks()
          .withFaceDescriptors();
        if (!active) return;
        setFaceCount(results.length);
        setDescriptor(
          results.length === 1 ? Array.from(results[0].descriptor) : null,
        );
      } catch {
        if (active) {
          setFaceCount(0);
          setDescriptor(null);
        }
      }
    };
    check();
    const timer = setInterval(check, 700);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [step, cameraReady]);
  if (step === "forgot-face")
    return (
      <StudentPasswordRecovery
        name={name}
        onBack={() => {
          setError("");
          setStep("choose");
        }}
      />
    );
  if (step === "forgot")
    return (
      <ForgotPassword
        role={role}
        onBack={() => {
          setError("");
          setStep("choose");
        }}
      />
    );
  if (step === "register")
    return (
      <Registration
        role={role}
        onBack={() => {
          setError("");
          setStep("choose");
        }}
        onRegistered={(registeredRole) => {
          setRole(registeredRole);
          setName("");
          setPassword("");
          setConfirmPassword("");
          setAuthMethod("password");
          setError(
            "Registration request submitted. Waiting for Admin approval.",
          );
          setStep("choose");
        }}
      />
    );
  return (
    <div className="login-page">
      <div className="login-grid" />
      <div className="floating-building b1" />
      <div className="floating-building b2" />
      <div className="floating-building b3" />
      <div className="login-hero">
        <div className="hero-badge">
          <Sparkles size={15} /> UNIFIED CAMPUS OPERATIONS
        </div>
        <h1>
          CAMPUS
          <br />
          <span>PLUS</span>
        </h1>
        <p>
          One Platform | Students + Administrators + Staff | Seamless Campus
          Life
        </p>
      </div>
      <div className="login-card">
        <div className="card-glow" />
        {step === "choose" && (
          <>
            <div className="eyebrow">WELCOME BACK</div>
            <h2>Enter your campus</h2>
            <p className="muted">Choose your role and login method.</p>
            <div className="role-tabs role-tabs-three">
              <button
                type="button"
                className={role === "student" ? "selected" : ""}
                onClick={() => setRole("student")}
              >
                <UserRound size={16} />
                <span>Student</span>
              </button>
              <button
                type="button"
                className={role === "warden" ? "selected" : ""}
                onClick={() => setRole("warden")}
              >
                <Wrench size={16} />
                <span>Warden</span>
              </button>
              <button
                type="button"
                className={role === "admin" ? "selected" : ""}
                onClick={() => setRole("admin")}
              >
                <ShieldCheck size={16} />
                <span>Admin</span>
              </button>
            </div>
            <div className="login-methods">
              <button
                type="button"
                className={authMethod === "face" ? "selected" : ""}
                onClick={() => {
                  setAuthMethod("face");
                  setError("");
                }}
              >
                <Camera />
                <span>Face login</span>
              </button>
              <button
                type="button"
                className={authMethod === "password" ? "selected" : ""}
                onClick={() => {
                  setAuthMethod("password");
                  setError("");
                }}
              >
                <ShieldCheck />
                <span>Password login</span>
              </button>
            </div>
            <label>Name / Identity</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Registered full name"
            />
            {authMethod === "password" && (
              <>
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your registered password"
                  autoComplete="current-password"
                />
                {showPasswordDialog && (
                  <div className="password-dialog">
                    <div className="eyebrow">CREATE PASSWORD</div>
                    <p className="muted">
                      No password exists for this account yet.
                    </p>
                    <label>New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                    />
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                    />
                    <button className="primary big" onClick={createPassword}>
                      <ShieldCheck /> Create Password
                    </button>
                  </div>
                )}
              </>
            )}
            {authMethod === "face" ? (
              <button className="primary big" onClick={startCamera}>
                <Camera /> Start face verification
              </button>
            ) : (
              !showPasswordDialog && (
                <button className="primary big" onClick={startPasswordLogin}>
                  <ShieldCheck /> Sign in with password
                </button>
              )
            )}
            {error && <div className="login-error">{error}</div>}
            <div className="quick-demo-logins">
              <span>Quick Demo Access:</span>
              <div className="quick-demo-buttons">
                <button
                  type="button"
                  className="quick-demo-btn"
                  onClick={() => {
                    setRole("student");
                    onLogin({
                      name: "Demo Student",
                      studentId: "STU-DEMO-1",
                      branch: "CSE",
                    });
                  }}
                >
                  <>
                    <GraduationCap size={14} /> Student
                  </>
                </button>
                <button
                  type="button"
                  className="quick-demo-btn"
                  onClick={() => {
                    setRole("warden");
                    onLogin({
                      name: "Rajesh Kumar",
                      studentId: "EMP-WRD-01",
                      branch: "Electrical & Maintenance",
                    });
                  }}
                >
                  <>
                    <Home size={14} /> Warden
                  </>
                </button>
                <button
                  type="button"
                  className="quick-demo-btn"
                  onClick={() => {
                    setRole("admin");
                    onLogin({
                      name: "Campus Admin",
                      studentId: "ADM-001",
                      branch: "Administration",
                    });
                  }}
                >
                  <>
                    <ShieldCheck size={14} /> Admin
                  </>
                </button>
                <button
                  type="button"
                  className="quick-demo-btn"
                  onClick={() => {
                    setRole("teacher");
                    onLogin({
                      name: "Demo Teacher",
                      studentId: "TCH-DEMO-01",
                      role: "teacher",
                      branch: "CSE",
                    });
                  }}
                >
                  <>
                    <UserRound size={14} /> Teacher
                  </>
                </button>
              </div>
            </div>
            <div className="demo-note">
              Face and password authentication are independent methods. Password
              login works only after a password has been registered.
            </div>
          </>
        )}
        {step === "loading" && (
          <div className="verify">
            <h3>Preparing face authentication</h3>
            <p>Loading local face models and requesting the cameraâ€¦</p>
            <div className="verify-line">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        {step === "verify" && (
          <div className="verify">
            <div className="camera-frame">
              <video
                ref={cameraRef}
                autoPlay
                muted
                playsInline
                onCanPlay={() => setCameraReady(true)}
              />
              <div className="scan-corners" />
            </div>
            <h3>{mode === "enroll" ? "Register Face" : "Verify Face"}</h3>
            <p>
              {faceCount === 0
                ? "No face detected. Position one face inside the frame."
                : faceCount > 1
                  ? "Multiple faces detected. Only one person may be present."
                  : mode === "enroll"
                    ? "One face detected. Register this face to continue."
                    : "Face detected. Checking against the registered faceâ€¦"}
            </p>
            <div className="verify-line">
              <span />
              <span />
              <span />
            </div>
            <button
              className="primary big"
              disabled={!cameraReady || faceCount !== 1 || !descriptor}
              onClick={finishVerification}
            >
              {mode === "enroll" ? (
                <>
                  <ShieldCheck /> Register face
                </>
              ) : (
                <>
                  <CheckCircle2 /> Confirm face
                </>
              )}
            </button>
            <button
              className="ghost fallback-btn"
              onClick={() => {
                stopCamera();
                setStep("choose");
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentPasswordRecovery({ name, onBack }) {
  const [verified, setVerified] = useState(false);
  const [failed, setFailed] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const key = `student:${name.trim().toLowerCase()}`;
  const verifyFace = (descriptor) => {
    const profile = load("cc_face_profiles", {})[key];
    if (
      !Array.isArray(profile?.descriptor) ||
      profile.descriptor.length !== 128
    ) {
      setFailed(true);
      setError("No registered face exists for this Student.");
      return false;
    }
    const distance = faceapi.euclideanDistance(
      new Float32Array(descriptor),
      new Float32Array(profile.descriptor),
    );
    if (!Number.isFinite(distance) || distance > 0.52) {
      setFailed(true);
      setError("Face verification failed.");
      return false;
    }
    setError("");
    setVerified(true);
    return true;
  };
  const resetPassword = async (event) => {
    event.preventDefault();
    setError("");
    if (newPassword.length < 6)
      return setError("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");
    const passwordProfiles = load("cc_password_profiles", {});
    passwordProfiles[key] = {
      hash: await hashPassword(newPassword),
      updatedAt: new Date().toISOString(),
    };
    save("cc_password_profiles", passwordProfiles);
    setMessage("Password reset successfully. Return to login.");
    setNewPassword("");
    setConfirmPassword("");
  };
  return (
    <div className="login-page registration-page">
      <div className="login-grid" />
      <div className="floating-building b1" />
      <div className="floating-building b2" />
      <div className="floating-building b3" />
      <motion.section
        className="login-card registration-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="card-glow" />
        <button
          type="button"
          className="ghost registration-back"
          onClick={onBack}
        >
          Back to login
        </button>
        <div className="eyebrow">PASSWORD RECOVERY</div>
        <h2>Verify your identity</h2>
        <p className="muted">
          Verify your registered face before setting a new password.
        </p>
        {!verified && !failed && !message && (
          <FaceRegistrationCapture
            label="Student Face Verification"
            required
            accountId={key}
            accountRole="student"
            actorRole="student"
            successMessage="Face verification successful."
            onCapture={verifyFace}
          />
        )}{" "}
        {verified && !message && (
          <form onSubmit={resetPassword}>
            <label>
              New Password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </label>
            <label>
              Confirm New Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </label>
            <button className="primary big" type="submit">
              <ShieldCheck /> Set New Password
            </button>
          </form>
        )}
        {message && <div className="success-box">{message}</div>}
        {error && <div className="login-error">{error}</div>}
      </motion.section>
    </div>
  );
}

function ForgotPassword({ role, onBack }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const requestOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const normalized = email.trim().toLowerCase();
    const profiles = load("cc_face_profiles", {});
    const account = Object.entries(profiles).find(
      ([, profile]) => profile.email?.trim().toLowerCase() === normalized,
    );
    if (!account) return setError("No account was found for that email.");
    try {
      const result = await attendanceApi(
        "/api/accounts/password-reset/request",
        { email: normalized },
      );
      setSent(true);
      setMessage(`${result.message} Demo OTP: ${result.demoOtp}`);
    } catch (error) {
      setError(error.message);
    }
  };
  const resetPassword = async (event) => {
    event.preventDefault();
    setError("");
    if (newPassword.length < 6)
      return setError("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");
    try {
      await attendanceApi("/api/accounts/password-reset/verify", {
        email: email.trim().toLowerCase(),
        otp,
      });
      const profiles = load("cc_face_profiles", {});
      const entry = Object.entries(profiles).find(
        ([, profile]) =>
          profile.email?.trim().toLowerCase() === email.trim().toLowerCase(),
      );
      if (!entry) return setError("No account was found for that email.");
      const passwordProfiles = load("cc_password_profiles", {});
      passwordProfiles[entry[0]] = {
        hash: await hashPassword(newPassword),
        updatedAt: new Date().toISOString(),
      };
      save("cc_password_profiles", passwordProfiles);
      setMessage(
        "Password reset successfully. Return to login with your new password.",
      );
      setSent(false);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <div className="login-page registration-page">
      <div className="login-grid" />
      <div className="floating-building b1" />
      <div className="floating-building b2" />
      <div className="floating-building b3" />
      <motion.section
        className="login-card registration-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="card-glow" />
        <button
          type="button"
          className="ghost registration-back"
          onClick={onBack}
        >
          Back to login
        </button>
        <div className="eyebrow">ACCOUNT RECOVERY</div>
        <h2>Forgot Password?</h2>
        <p className="muted">
          Reset your password securely with your registered email.
        </p>
        {!sent ? (
          <form onSubmit={requestOtp}>
            <label>Registered Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
            <button className="primary big" type="submit">
              <ShieldCheck /> Send Reset OTP
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword}>
            <label>Verification OTP</label>
            <input
              inputMode="numeric"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="6-digit OTP"
              required
            />
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 6 characters"
              required
            />
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter password"
              required
            />
            <button className="primary big" type="submit">
              <CheckCircle2 /> Reset Password
            </button>
          </form>
        )}
        {message && <div className="success-box">{message}</div>}
        {error && <div className="login-error">{error}</div>}
      </motion.section>
    </div>
  );
}

function FaceRegistrationCapture({
  label,
  required,
  accountId,
  accountRole,
  actorRole,
  onCapture,
  successMessage = "Face capture successful.",
}) {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  };
  const cameraError = (error) => {
    if (error?.name === "NotSupportedError")
      return "Camera access is not supported by this browser.";
    if (error?.name === "SecurityError")
      return "Camera access requires HTTPS after deployment. During development, use http://localhost.";
    if (
      error?.name === "NotAllowedError" ||
      error?.name === "PermissionDeniedError"
    )
      return "Camera permission denied. Allow camera access and try again.";
    if (
      error?.name === "NotFoundError" ||
      error?.name === "DevicesNotFoundError"
    )
      return "No camera was found on this device.";
    if (error?.name === "NotReadableError" || error?.name === "TrackStartError")
      return "The camera is unavailable or already in use.";
    return "Could not start face registration camera. Please check your camera and try again.";
  };
  const start = async () => {
    setStatus("");
    try {
      if (
        !window.isSecureContext &&
        !["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)
      )
        throw Object.assign(new Error("Insecure camera context"), {
          name: "SecurityError",
        });
      if (!navigator.mediaDevices?.getUserMedia)
        throw Object.assign(new Error("Camera API unavailable"), {
          name: "NotSupportedError",
        });
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "user" } },
        audio: false,
      });
      streamRef.current = stream;
      setActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current
            .play()
            .catch(() => setStatus("Live camera preview could not start."));
        }
      });
      timerRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const results = await faceapi
            .detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,
                scoreThreshold: 0.6,
              }),
            )
            .withFaceLandmarks()
            .withFaceDescriptors();
          if (results.length === 1) {
            const descriptor = Array.from(results[0].descriptor);
            if (
              descriptor.length !== 128 ||
              descriptor.some((value) => !Number.isFinite(value))
            )
              throw new Error("Invalid face descriptor");
            onCapture(descriptor);
            setStatus("Face registered securely. No camera image is stored.");
            stop();
          } else
            setStatus(
              results.length
                ? "Show exactly one face."
                : "Position one face inside the frame.",
            );
        } catch (error) {
          setStatus(
            error?.message === "Invalid face descriptor"
              ? "A valid face descriptor could not be generated. Please try again."
              : "Face detection is unavailable. Please try again.",
          );
        }
      }, 700);
    } catch (error) {
      stop();
      setStatus(cameraError(error));
    }
  };
  useEffect(() => () => stop(), []);
  return (
    <div className="face-registration-box">
      <div className="panel-head">
        <div>
          <h3>{label}</h3>
          <p>
            {required
              ? "Required before account creation."
              : "Capture the account holder's face before saving."}
          </p>
        </div>
        <Camera />
      </div>
      {active && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="face-registration-video"
        />
      )}
      <div className="scanner-status">
        <Camera />
        <div>
          <b>{active ? "Camera active" : status || "No face registered yet"}</b>
          <span>Only an encrypted face descriptor is retained.</span>
        </div>
      </div>
      {!active && !status.includes("registered") && (
        <button type="button" className="ghost" onClick={start}>
          <Camera /> Start Face Registration
        </button>
      )}
      {status && (
        <div
          className={
            status.includes("registered") ? "success-box" : "demo-note"
          }
        >
          {status === "Face registered securely. No camera image is stored."
            ? "Face capture successful."
            : status}
        </div>
      )}
    </div>
  );
}

function Registration({ role, onBack, onRegistered }) {
  const [registrationRole, setRegistrationRole] = useState("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    identifier: "",
    department: "",
    course: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    document
      .querySelectorAll(".registration-card .register-role-tabs button")
      .forEach((button, index) => {
        if (index > 0) {
          button.disabled = true;
          button.style.display = "none";
        }
      });
  }, []);
  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const name = form.name.trim(),
      email = form.email.trim().toLowerCase(),
      department = form.department.trim(),
      course = form.course;
    if (
      !name ||
      !email ||
      !department ||
      !course ||
      !form.password ||
      !form.confirmPassword
    )
      return setError("Please complete all required fields.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Enter a valid email address.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");
    if (!faceDescriptor)
      return setError(
        "Face registration is required before creating your account.",
      );
    const studentId = form.identifier.trim() || uid("STU");
    const profiles = load("cc_face_profiles", {});
    if (
      Object.values(profiles).some(
        (profile) => profile.email?.trim().toLowerCase() === email,
      )
    )
      return setError("An account with this email already exists.");
    if (registrationRole !== "student" && registrationRole !== "warden")
      return setError("This role cannot be created from public registration.");
    const key = `${registrationRole}:${name.toLowerCase()}`;
    if (profiles[key])
      return setError("An account with this name and role already exists.");
    setSubmitting(true);
    try {
      profiles[key] = {
        name,
        email,
        role: "student",
        department,
        course,
        studentId,
        descriptor: faceDescriptor,
        active: true,
        approvalStatus: "pending",
        createdAt: new Date().toISOString(),
      };
      save("cc_face_profiles", profiles);
      const passwordProfiles = load("cc_password_profiles", {});
      passwordProfiles[key] = {
        hash: await hashPassword(form.password),
        updatedAt: new Date().toISOString(),
      };
      save("cc_password_profiles", passwordProfiles);
      onRegistered(registrationRole);
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="login-page registration-page">
      <div className="login-grid" />
      <div className="floating-building b1" />
      <div className="floating-building b2" />
      <div className="floating-building b3" />
      <motion.form
        className="login-card registration-card"
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="card-glow" />
        <button
          type="button"
          className="ghost registration-back"
          onClick={onBack}
        >
          Back to login
        </button>
        <div className="eyebrow">CAMPUSFLOW ACCOUNT</div>
        <h2>Create your account</h2>
        <p className="muted">Register once to access your campus workspace.</p>
        <div className="register-role-tabs">
          <button
            type="button"
            className={registrationRole === "student" ? "selected" : ""}
            onClick={() => setRegistrationRole("student")}
          >
            <UserRound />
            <span>Student</span>
          </button>
          <button
            type="button"
            className={registrationRole === "warden" ? "selected" : ""}
            onClick={() => setRegistrationRole("warden")}
          >
            <Wrench />
            <span>Warden</span>
          </button>
          <button
            type="button"
            className={registrationRole === "admin" ? "selected" : ""}
            onClick={() => setRegistrationRole("admin")}
          >
            <ShieldCheck />
            <span>Admin</span>
          </button>
        </div>
        <div className="register-grid">
          <label>
            Full Name *
            <input
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Your full name"
              autoComplete="name"
            />
          </label>
          <label>
            Email *
            <input
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label>
            Student / Employee ID{" "}
            <input
              value={form.identifier}
              onChange={(event) => update("identifier", event.target.value)}
              placeholder="Optional"
            />
          </label>
          <label>
            Department *
            <input
              value={form.department}
              onChange={(event) => update("department", event.target.value)}
              placeholder="Department"
            />
          </label>
          <label>
            Course *
            <select
              value={form.course}
              onChange={(event) => update("course", event.target.value)}
            >
              <option value="" disabled>
                Select course
              </option>
              <option>B-TECH</option>
              <option>DIPLOMA</option>
            </select>
          </label>
          <label>
            Password *
            <input
              type="password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirm Password *
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) =>
                update("confirmPassword", event.target.value)
              }
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
          </label>
        </div>
        <FaceRegistrationCapture
          label="Student Face Registration"
          required
          accountId={form.identifier || "pending-student"}
          accountRole="student"
          actorRole="student"
          onCapture={setFaceDescriptor}
        />
        {error && <div className="login-error">{error}</div>}
        <button className="primary big" type="submit">
          <CheckCircle2 /> Create Account
        </button>
      </motion.form>
    </div>
  );
}

function EmergencySosPage({ role, profile }) {
  const [alerts, setAlerts] = useState(() => {
    const stored = load("cc_emergency_alerts", []);
    return Array.isArray(stored) ? stored : [];
  });
  const [emergencyType, setEmergencyType] = useState("");
  const userId = String(
    profile.studentId || profile.email || profile.name || "",
  );
  const studentAlerts = alerts
    .filter((alert) => alert.studentId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const activeAlert = studentAlerts.find(
    (alert) => alert.status === "active" || alert.status === "acknowledged",
  );
  const isStudent = role === "student";

  useEffect(() => save("cc_emergency_alerts", alerts), [alerts]);

  const activate = (event) => {
    event.preventDefault();
    if (!emergencyType || activeAlert) return;
    if (
      !window.confirm(`Activate an Emergency SOS alert for ${emergencyType}?`)
    )
      return;
    const createdAt = new Date().toISOString();
    setAlerts((current) => [
      {
        id: `sos-${Date.now()}`,
        studentId: userId,
        studentName: profile.name || "Student",
        emergencyType,
        createdAt,
        status: "active",
      },
      ...current,
    ]);
    setEmergencyType("");
  };
  const updateAlert = (alertId, status) =>
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === alertId
          ? { ...alert, status, updatedAt: new Date().toISOString() }
          : alert,
      ),
    );
  const displayTime = (value) =>
    value ? new Date(value).toLocaleString() : "-";
  const statusClass = (status) =>
    status === "active"
      ? "live"
      : status === "acknowledged"
        ? "upcoming"
        : "absent";

  return (
    <>
      <PageTitle
        eyebrow={isStudent ? "STUDENT SAFETY" : "CAMPUS SAFETY"}
        title={isStudent ? "Emergency SOS" : "Emergency Alerts"}
        desc={
          isStudent
            ? "Activate an alert when you need urgent campus assistance."
            : "Review and respond to student emergency alerts."
        }
      />
      {isStudent ? (
        <>
          {activeAlert ? (
            <section
              className="panel emergency-active-panel"
              aria-live="polite"
            >
              <div className="emergency-active-heading">
                <AlertTriangle size={22} />
                <div>
                  <span className="status live">SOS Active</span>
                  <h2>{activeAlert.emergencyType} emergency</h2>
                  <p>Alert sent {displayTime(activeAlert.createdAt)}</p>
                </div>
              </div>
              {activeAlert.status === "acknowledged" && (
                <p className="emergency-acknowledged">
                  Campus staff have acknowledged this alert.
                </p>
              )}
              <div className="emergency-actions">
                <button
                  type="button"
                  className="danger"
                  onClick={() => updateAlert(activeAlert.id, "cancelled")}
                >
                  Cancel Alert
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={() => updateAlert(activeAlert.id, "resolved")}
                >
                  Mark Resolved
                </button>
              </div>
            </section>
          ) : (
            <section className="panel emergency-sos-panel">
              <div className="panel-head">
                <div>
                  <h3>Request emergency assistance</h3>
                  <p>
                    This creates an alert for campus staff. It does not contact
                    emergency services.
                  </p>
                </div>
                <AlertTriangle size={21} />
              </div>
              <form onSubmit={activate}>
                <label>
                  Emergency type *
                  <select
                    required
                    value={emergencyType}
                    onChange={(event) => setEmergencyType(event.target.value)}
                  >
                    <option value="">Select emergency type</option>
                    {[
                      "Medical",
                      "Security",
                      "Fire",
                      "Accident",
                      "Harassment",
                      "Other",
                    ].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="danger big emergency-activate"
                  disabled={!emergencyType}
                >
                  <AlertTriangle size={18} /> Activate Emergency SOS
                </button>
              </form>
            </section>
          )}
          <section className="panel emergency-history-panel">
            <div className="panel-head">
              <div>
                <h3>My emergency alerts</h3>
                <p>Your recent SOS activity and status.</p>
              </div>
            </div>
            {studentAlerts.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentAlerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>{alert.emergencyType}</td>
                        <td>{displayTime(alert.createdAt)}</td>
                        <td>
                          <span
                            className={`status ${statusClass(alert.status)}`}
                          >
                            {alert.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="emergency-empty">
                No emergency alerts have been activated.
              </p>
            )}
          </section>
        </>
      ) : (
        <section className="panel emergency-alerts-panel">
          <div className="panel-head">
            <div>
              <h3>Emergency alerts</h3>
              <p>
                Student alerts requiring campus staff awareness and response.
              </p>
            </div>
            <AlertTriangle size={21} />
          </div>
          {alerts.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Emergency type</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...alerts]
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                    )
                    .map((alert) => (
                      <tr key={alert.id}>
                        <td>
                          {alert.studentName}
                          <small className="emergency-student-id">
                            {alert.studentId}
                          </small>
                        </td>
                        <td>{alert.emergencyType}</td>
                        <td>{displayTime(alert.createdAt)}</td>
                        <td>
                          <span
                            className={`status ${statusClass(alert.status)}`}
                          >
                            {alert.status}
                          </span>
                        </td>
                        <td>
                          <div className="emergency-actions">
                            {alert.status === "active" && (
                              <button
                                type="button"
                                className="ghost"
                                onClick={() =>
                                  updateAlert(alert.id, "acknowledged")
                                }
                              >
                                Acknowledge
                              </button>
                            )}
                            {(alert.status === "active" ||
                              alert.status === "acknowledged") && (
                              <button
                                type="button"
                                className="primary"
                                onClick={() =>
                                  updateAlert(alert.id, "resolved")
                                }
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="emergency-empty">There are no emergency alerts.</p>
          )}
        </section>
      )}
    </>
  );
}

function ClubsEventsPage({ role, profile }) {
  const [clubs, setClubs] = useState(() =>
    loadDemoEntries("cc_clubs", demoClubs),
  );
  const [requests, setRequests] = useState(() =>
    load("cc_club_join_requests", []),
  );
  const [events, setEvents] = useState(() => {
    const clubs = loadDemoEntries("cc_clubs", demoClubs);
    return loadDemoEntries(
      "cc_club_events",
      demoEvents.map(({ clubName, ...event }) => ({
        ...event,
        clubId:
          clubs.find(
            (club) => club.name.trim().toLowerCase() === clubName.toLowerCase(),
          )?.id || `demo-club-${clubName.split(" ")[0].toLowerCase()}`,
      })),
    );
  });
  const [registrations, setRegistrations] = useState(() =>
    load("cc_event_registrations", []),
  );
  const [tab, setTab] = useState(role === "admin" ? "clubs" : "clubs");
  const [clubForm, setClubForm] = useState({
    name: "",
    category: "",
    description: "",
    coordinator: "",
  });
  const [eventForm, setEventForm] = useState({
    name: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    clubId: "",
    maxParticipants: "",
  });
  const [editingClub, setEditingClub] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationEvent, setRegistrationEvent] = useState("");
  const [notice, setNotice] = useState("");
  const userId = String(
    profile.studentId || profile.email || profile.name || "",
  );
  const isAdmin = role === "admin";

  useEffect(() => save("cc_clubs", clubs), [clubs]);
  useEffect(() => save("cc_club_join_requests", requests), [requests]);
  useEffect(() => save("cc_club_events", events), [events]);
  useEffect(
    () => save("cc_event_registrations", registrations),
    [registrations],
  );

  const clubName = (id) =>
    clubs.find((club) => club.id === id)?.name || "Club no longer listed";
  const eventCount = (id) =>
    registrations.filter((item) => item.eventId === id).length;
  const getClub = (id) => clubs.find((club) => club.id === id);
  const submitClub = (event) => {
    event.preventDefault();
    const values = {
      ...clubForm,
      name: clubForm.name.trim(),
      coordinator: clubForm.coordinator.trim(),
    };
    if (!values.name) return;
    if (editingClub) {
      setClubs((current) =>
        current.map((club) =>
          club.id === editingClub ? { ...club, ...values } : club,
        ),
      );
    } else
      setClubs((current) => [
        { id: `club-${Date.now()}`, ...values, memberIds: [] },
        ...current,
      ]);
    setClubForm({ name: "", category: "", description: "", coordinator: "" });
    setEditingClub(null);
    setNotice("");
  };
  const editClub = (club) => {
    setEditingClub(club.id);
    setClubForm({
      name: club.name,
      category: club.category || "",
      description: club.description || "",
      coordinator: club.coordinator || "",
    });
    setTab("clubs");
    setSelectedClub(null);
  };
  const submitEvent = (event) => {
    event.preventDefault();
    const values = {
      ...eventForm,
      clubId: eventForm.clubId || clubs[0]?.id || "",
      name: eventForm.name.trim(),
      maxParticipants: Math.max(1, Number(eventForm.maxParticipants) || 1),
    };
    if (!values.name || !values.clubId) return;
    if (editingEvent)
      setEvents((current) =>
        current.map((item) =>
          item.id === editingEvent ? { ...item, ...values } : item,
        ),
      );
    else
      setEvents((current) => [
        { id: `event-${Date.now()}`, ...values, cancelled: false },
        ...current,
      ]);
    setEventForm({
      name: "",
      date: "",
      time: "",
      venue: "",
      description: "",
      clubId: clubs[0]?.id || "",
      maxParticipants: "",
    });
    setEditingEvent(null);
  };
  const editEvent = (event) => {
    setEditingEvent(event.id);
    setEventForm({
      name: event.name,
      date: event.date,
      time: event.time,
      venue: event.venue,
      description: event.description,
      clubId: event.clubId,
      maxParticipants: String(event.maxParticipants),
    });
    setTab("events");
    setSelectedEvent(null);
  };
  const requestToJoin = (club) => {
    if (
      club.memberIds?.some((member) => member.id === userId) ||
      requests.some(
        (item) =>
          item.clubId === club.id &&
          item.userId === userId &&
          item.status === "pending",
      )
    ) {
      setNotice("You already belong to this club or have a request pending.");
      return;
    }
    setRequests((current) => [
      {
        id: `request-${Date.now()}`,
        clubId: club.id,
        userId,
        name: profile.name || "Student",
        studentId: profile.studentId || "",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setNotice(`Join request sent to ${club.name}.`);
  };
  const updateRequest = (request, approved) => {
    setRequests((current) =>
      current.map((item) =>
        item.id === request.id
          ? { ...item, status: approved ? "approved" : "rejected" }
          : item,
      ),
    );
    if (approved)
      setClubs((current) =>
        current.map((club) =>
          club.id !== request.clubId
            ? club
            : {
                ...club,
                memberIds: [
                  ...(club.memberIds || []).filter(
                    (member) => member.id !== request.userId,
                  ),
                  {
                    id: request.userId,
                    name: request.name,
                    studentId: request.studentId,
                  },
                ],
              },
        ),
      );
  };
  const removeMember = (clubId, memberId) =>
    setClubs((current) =>
      current.map((club) =>
        club.id === clubId
          ? {
              ...club,
              memberIds: (club.memberIds || []).filter(
                (member) => member.id !== memberId,
              ),
            }
          : club,
      ),
    );
  const register = (event) => {
    const current = getClub(event.clubId);
    if (
      !current ||
      event.cancelled ||
      new Date(`${event.date}T${event.time || "23:59"}`).getTime() < Date.now()
    ) {
      setNotice("Registration is not available for this event.");
      return;
    }
    if (
      registrations.some(
        (item) => item.eventId === event.id && item.userId === userId,
      )
    ) {
      setNotice("You are already registered for this event.");
      return;
    }
    if (eventCount(event.id) >= Number(event.maxParticipants)) {
      setNotice("This event has reached its participant limit.");
      return;
    }
    setRegistrations((items) => [
      {
        id: `registration-${Date.now()}`,
        eventId: event.id,
        userId,
        name: profile.name || "Student",
        studentId: profile.studentId || "",
        registeredAt: new Date().toISOString(),
      },
      ...items,
    ]);
    setNotice(`You are registered for ${event.name}.`);
  };
  const isMember = (club) =>
    (club.memberIds || []).some((member) => member.id === userId);
  const hasRequested = (club) =>
    requests.some(
      (item) =>
        item.clubId === club.id &&
        item.userId === userId &&
        item.status === "pending",
    );
  const activeEvents = events.filter((event) => !event.cancelled);
  const upcomingEvents = activeEvents
    .filter((event) => event.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  const myRegistrations = registrations.filter(
    (item) => item.userId === userId,
  );
  const tabs = isAdmin
    ? [
        ["clubs", "Clubs"],
        ["requests", "Join Requests"],
        ["events", "Events"],
        ["registrations", "Registrations"],
      ]
    : role === "student"
      ? [
          ["clubs", "View Clubs"],
          ["my-clubs", "My Clubs"],
          ["events", "Upcoming Events"],
          ["my-events", "My Registered Events"],
        ]
      : [
          ["clubs", "Clubs"],
          ["events", "Events"],
        ];
  const tabControls = (
    <div className="ce-tabs" role="tablist">
      {tabs.map(([id, label]) => (
        <button
          type="button"
          role="tab"
          aria-selected={tab === id}
          className={tab === id ? "selected" : ""}
          key={id}
          onClick={() => {
            setTab(id);
            setNotice("");
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
  const clubCards = (list) => (
    <div className="ce-grid">
      {list.map((club) => (
        <article className="panel ce-item" key={club.id}>
          <div className="ce-item-top">
            <span className="eyebrow">{club.category || "CAMPUS CLUB"}</span>
            <Users size={18} />
          </div>
          <h3>{club.name}</h3>
          <p>
            {club.description ||
              "Connect with students and take part in club activities."}
          </p>
          <div className="ce-meta">
            <span>Coordinator: {club.coordinator || "Not assigned"}</span>
            <span>{club.memberIds?.length || 0} members</span>
          </div>
          <div className="ce-actions">
            <button
              type="button"
              className="ghost"
              onClick={() => setSelectedClub(club.id)}
            >
              Details
            </button>
            {role === "student" && (
              <button
                type="button"
                className="primary"
                disabled={isMember(club) || hasRequested(club)}
                onClick={() => requestToJoin(club)}
              >
                {isMember(club)
                  ? "Member"
                  : hasRequested(club)
                    ? "Request pending"
                    : "Request to join"}
              </button>
            )}
            {isAdmin && (
              <>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => editClub(club)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="danger"
                  aria-label={`Delete ${club.name}`}
                  onClick={() => {
                    if (window.confirm(`Delete ${club.name}?`))
                      setClubs((current) =>
                        current.filter((item) => item.id !== club.id),
                      );
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </article>
      ))}
    </div>
  );
  const eventCards = (list) => (
    <div className="ce-grid">
      {list.map((event) => (
        <article className="panel ce-item" key={event.id}>
          <div className="ce-item-top">
            <span
              className={`status ${event.cancelled ? "absent" : "upcoming"}`}
            >
              {event.cancelled ? "Cancelled" : "Upcoming"}
            </span>
            <CalendarDays size={18} />
          </div>
          <h3>{event.name}</h3>
          <p>{event.description || ""}</p>
          <div className="ce-meta">
            <span>
              {event.date} · {event.time}
            </span>
            <span>{event.venue}</span>
            <span>{clubName(event.clubId)}</span>
            <span>
              {eventCount(event.id)} / {event.maxParticipants} participants
            </span>
          </div>
          <div className="ce-actions">
            <button
              type="button"
              className="ghost"
              onClick={() => setSelectedEvent(event.id)}
            >
              Details
            </button>
            {role === "student" && (
              <button
                type="button"
                className="primary"
                disabled={
                  event.cancelled ||
                  eventCount(event.id) >= Number(event.maxParticipants) ||
                  registrations.some(
                    (item) =>
                      item.eventId === event.id && item.userId === userId,
                  )
                }
                onClick={() => register(event)}
              >
                {registrations.some(
                  (item) => item.eventId === event.id && item.userId === userId,
                )
                  ? "Registered"
                  : eventCount(event.id) >= Number(event.maxParticipants)
                    ? "Full"
                    : "Register"}
              </button>
            )}
            {isAdmin && (
              <>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => editEvent(event)}
                >
                  Edit
                </button>
                {!event.cancelled && (
                  <button
                    type="button"
                    className="danger"
                    onClick={() =>
                      setEvents((current) =>
                        current.map((item) =>
                          item.id === event.id
                            ? { ...item, cancelled: true }
                            : item,
                        ),
                      )
                    }
                  >
                    Cancel
                  </button>
                )}
              </>
            )}
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <>
      <PageTitle
        eyebrow="CAMPUS COMMUNITY"
        title="Clubs & Events"
        desc="Find your community, follow campus activities, and manage club programs."
      />
      {tabControls}
      {notice && (
        <div className="ce-notice" role="status">
          {notice}
        </div>
      )}
      {selectedClub && (
        <section className="panel ce-detail">
          <button
            type="button"
            className="ghost"
            onClick={() => setSelectedClub(null)}
          >
            Back to clubs
          </button>
          {(() => {
            const club = getClub(selectedClub);
            return club ? (
              <>
                <h2>{club.name}</h2>
                <p>
                  {club.description || "No club description has been added."}
                </p>
                <div className="ce-meta">
                  <span>Category: {club.category || "-"}</span>
                  <span>Coordinator: {club.coordinator || "Not assigned"}</span>
                  <span>Members: {club.memberIds?.length || 0}</span>
                </div>
                {role === "student" && !isMember(club) && (
                  <button
                    type="button"
                    className="primary"
                    disabled={hasRequested(club)}
                    onClick={() => requestToJoin(club)}
                  >
                    {hasRequested(club) ? "Request pending" : "Request to join"}
                  </button>
                )}
                {isAdmin && (
                  <>
                    <h3>Club members</h3>
                    {club.memberIds?.length ? (
                      <div className="account-list">
                        {club.memberIds.map((member) => (
                          <div className="account-row" key={member.id}>
                            <div className="account-main">
                              <b>{member.name}</b>
                              <span>{member.studentId || member.id}</span>
                            </div>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => removeMember(club.id, member.id)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No approved members yet.</p>
                    )}
                  </>
                )}
              </>
            ) : (
              <p>This club is no longer available.</p>
            );
          })()}
        </section>
      )}
      {selectedEvent && (
        <section className="panel ce-detail">
          {(() => {
            const event = events.find((item) => item.id === selectedEvent);
            return event ? (
              <>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setSelectedEvent(null)}
                >
                  Back to events
                </button>
                <h2>{event.name}</h2>
                <p>
                  {event.description || "No event description has been added."}
                </p>
                <div className="ce-meta">
                  <span>
                    {event.date} at {event.time}
                  </span>
                  <span>Venue: {event.venue}</span>
                  <span>Club: {clubName(event.clubId)}</span>
                  <span>
                    Participants: {eventCount(event.id)} /{" "}
                    {event.maxParticipants}
                  </span>
                  <span>
                    Status: {event.cancelled ? "Cancelled" : "Upcoming"}
                  </span>
                </div>
                {role === "student" && (
                  <button
                    type="button"
                    className="primary"
                    disabled={
                      event.cancelled ||
                      eventCount(event.id) >= Number(event.maxParticipants) ||
                      registrations.some(
                        (item) =>
                          item.eventId === event.id && item.userId === userId,
                      )
                    }
                    onClick={() => register(event)}
                  >
                    Register for event
                  </button>
                )}
              </>
            ) : (
              <p>This event is no longer available.</p>
            );
          })()}
        </section>
      )}
      {!selectedClub && !selectedEvent && tab === "clubs" && (
        <>
          {isAdmin && (
            <section className="panel ce-form-panel">
              <div className="panel-head">
                <div>
                  <h3>{editingClub ? "Edit club" : "Create a club"}</h3>
                  <p>Set club details and assign a coordinator.</p>
                </div>
                <Users />
              </div>
              <form className="form-grid" onSubmit={submitClub}>
                <label>
                  Club name *
                  <input
                    required
                    value={clubForm.name}
                    onChange={(event) =>
                      setClubForm({ ...clubForm, name: event.target.value })
                    }
                  />
                </label>
                <label>
                  Category
                  <input
                    value={clubForm.category}
                    onChange={(event) =>
                      setClubForm({ ...clubForm, category: event.target.value })
                    }
                  />
                </label>
                <label>
                  Coordinator
                  <input
                    list="ce-teachers"
                    value={clubForm.coordinator}
                    onChange={(event) =>
                      setClubForm({
                        ...clubForm,
                        coordinator: event.target.value,
                      })
                    }
                  />
                  <datalist id="ce-teachers">
                    {Object.values(load("cc_face_profiles", {}))
                      .filter((item) => item.role === "teacher")
                      .map((item) => (
                        <option
                          key={item.studentId || item.name}
                          value={item.name}
                        >
                          {item.studentId}
                        </option>
                      ))}
                  </datalist>
                </label>
                <label>
                  Description
                  <textarea
                    value={clubForm.description}
                    onChange={(event) =>
                      setClubForm({
                        ...clubForm,
                        description: event.target.value,
                      })
                    }
                  />
                </label>
                <div className="ce-form-actions">
                  <button className="primary" type="submit">
                    {editingClub ? "Save club" : "Create club"}
                  </button>
                  {editingClub && (
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => {
                        setEditingClub(null);
                        setClubForm({
                          name: "",
                          category: "",
                          description: "",
                          coordinator: "",
                        });
                      }}
                    >
                      Discard
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}
          {clubCards(role === "student" ? clubs : clubs)}
          {!clubs.length && (
            <section className="panel ce-empty">
              No clubs have been created yet.
            </section>
          )}
        </>
      )}
      {!selectedClub && !selectedEvent && tab === "my-clubs" && (
        <>
          {clubCards(clubs.filter(isMember))}
          {!clubs.some(isMember) && (
            <section className="panel ce-empty">
              You have not joined any clubs yet.
            </section>
          )}
        </>
      )}
      {!selectedClub && !selectedEvent && tab === "requests" && (
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Club join requests</h3>
              <p>Review student membership requests.</p>
            </div>
            <Users />
          </div>
          {requests.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Club</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.name}</td>
                      <td>{request.studentId || "-"}</td>
                      <td>{clubName(request.clubId)}</td>
                      <td>{request.status}</td>
                      <td>
                        {request.status === "pending" ? (
                          <div className="ce-actions">
                            <button
                              type="button"
                              className="primary"
                              onClick={() => updateRequest(request, true)}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => updateRequest(request, false)}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="ce-empty">No join requests yet.</div>
          )}
        </section>
      )}
      {!selectedClub && !selectedEvent && tab === "events" && (
        <>
          {isAdmin && (
            <section className="panel ce-form-panel">
              <div className="panel-head">
                <div>
                  <h3>{editingEvent ? "Edit event" : "Create an event"}</h3>
                  <p>Schedule an event for a campus club.</p>
                </div>
                <CalendarDays />
              </div>
              {clubs.length ? (
                <form className="form-grid" onSubmit={submitEvent}>
                  <label>
                    Event name *
                    <input
                      required
                      value={eventForm.name}
                      onChange={(event) =>
                        setEventForm({ ...eventForm, name: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Date *
                    <input
                      type="date"
                      required
                      value={eventForm.date}
                      onChange={(event) =>
                        setEventForm({ ...eventForm, date: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Time *
                    <input
                      type="time"
                      required
                      value={eventForm.time}
                      onChange={(event) =>
                        setEventForm({ ...eventForm, time: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Venue *
                    <input
                      required
                      value={eventForm.venue}
                      onChange={(event) =>
                        setEventForm({
                          ...eventForm,
                          venue: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Club *
                    <select
                      required
                      value={eventForm.clubId || clubs[0]?.id || ""}
                      onChange={(event) =>
                        setEventForm({
                          ...eventForm,
                          clubId: event.target.value,
                        })
                      }
                    >
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Max participants *
                    <input
                      type="number"
                      min="1"
                      required
                      value={eventForm.maxParticipants}
                      onChange={(event) =>
                        setEventForm({
                          ...eventForm,
                          maxParticipants: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={eventForm.description}
                      onChange={(event) =>
                        setEventForm({
                          ...eventForm,
                          description: event.target.value,
                        })
                      }
                    />
                  </label>
                  <div className="ce-form-actions">
                    <button className="primary" type="submit">
                      {editingEvent ? "Save event" : "Create event"}
                    </button>
                    {editingEvent && (
                      <button
                        className="ghost"
                        type="button"
                        onClick={() => {
                          setEditingEvent(null);
                          setEventForm({
                            name: "",
                            date: "",
                            time: "",
                            venue: "",
                            description: "",
                            clubId: clubs[0]?.id || "",
                            maxParticipants: "",
                          });
                        }}
                      >
                        Discard
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <p>Create a club before scheduling an event.</p>
              )}
            </section>
          )}
          {eventCards(
            isAdmin
              ? events
              : role === "student"
                ? upcomingEvents
                : activeEvents,
          )}
          {!events.length && (
            <section className="panel ce-empty">
              No events are available yet.
            </section>
          )}
        </>
      )}
      {!selectedClub && !selectedEvent && tab === "my-events" && (
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>My registered events</h3>
              <p>Your event registrations and their current status.</p>
            </div>
            <CalendarCheck />
          </div>
          {myRegistrations.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Club</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {myRegistrations.map((item) => {
                    const event = events.find(
                      (entry) => entry.id === item.eventId,
                    );
                    return (
                      <tr key={item.id}>
                        <td>{event?.name || "Event removed"}</td>
                        <td>{event?.date || "-"}</td>
                        <td>{event?.venue || "-"}</td>
                        <td>{event ? clubName(event.clubId) : "-"}</td>
                        <td>{event?.cancelled ? "Cancelled" : "Registered"}</td>
                        <td>
                          {event && (
                            <button
                              className="ghost"
                              type="button"
                              onClick={() => setSelectedEvent(event.id)}
                            >
                              Details
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="ce-empty">
              You have not registered for any events.
            </div>
          )}
        </section>
      )}
      {!selectedClub && !selectedEvent && tab === "registrations" && (
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Event registrations</h3>
              <p>Review participant lists and event capacity.</p>
            </div>
            <Users />
          </div>
          <label>
            Event
            <select
              value={registrationEvent}
              onChange={(event) => setRegistrationEvent(event.target.value)}
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                  {event.cancelled ? " (Cancelled)" : ""}
                </option>
              ))}
            </select>
          </label>
          {registrationEvent && (
            <>
              <p>
                {eventCount(registrationEvent)} /{" "}
                {events.find((event) => event.id === registrationEvent)
                  ?.maxParticipants || 0}{" "}
                participants
              </p>
              {registrations.filter(
                (item) => item.eventId === registrationEvent,
              ).length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Participant</th>
                        <th>Student ID</th>
                        <th>Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations
                        .filter((item) => item.eventId === registrationEvent)
                        .map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.studentId || "-"}</td>
                            <td>
                              {new Date(item.registeredAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="ce-empty">No registrations for this event.</div>
              )}
            </>
          )}
        </section>
      )}
    </>
  );
}

function PageTitle({ eyebrow, title, desc, actions }) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      <div className="title-actions">{actions}</div>
    </div>
  );
}
function Stat({ icon: Icon, label, value, sub }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleTilt = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setTilt({
      x: -((event.clientY - bounds.top) / bounds.height - 0.5) * 7,
      y: ((event.clientX - bounds.left) / bounds.width - 0.5) * 9,
    });
  };
  return (
    <motion.div
      className="stat-card"
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      onMouseMove={handleTilt}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className="stat-icon">
        <Icon />
      </div>
      <div>
        <small>{label}</small>
        <motion.strong
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {value}
        </motion.strong>
        <span>{sub}</span>
      </div>
    </motion.div>
  );
}

function StudentDashboard({
  go,
  attendance,
  payments,
  studentName,
  studentId,
  branch,
  gatePasses = [],
  certificateRequests = [],
  hostelComplaints = [],
  notices = [],
}) {
  const isDemoAttendance = attendance.some((item) =>
    String(item.session || "").startsWith("DEMO-"),
  );
  const present = isDemoAttendance
    ? demoAttendanceSummary.present
    : attendance.filter((item) => item.status === "Present").length;
  const absent = isDemoAttendance
    ? demoAttendanceSummary.absent
    : attendance.filter((item) => item.status === "Absent").length;
  const late = isDemoAttendance
    ? demoAttendanceSummary.late
    : attendance.filter((item) => item.status === "Late").length;
  const lectures = isDemoAttendance
    ? demoAttendanceSummary.lectures
    : attendance.length;
  const overall = isDemoAttendance
    ? demoAttendanceSummary.overall
    : attendance.length
      ? Math.round((present / attendance.length) * 100)
      : 0;
  const payment = payments[0];
  const schedule = readStudentTimetable(branch)?.Monday || [];
  const activeGatePass = gatePasses.find(
    (g) => g.studentId === studentId || g.studentId === "STU-DEMO-1",
  );
  const activeCertificate = certificateRequests.find(
    (c) => c.studentId === studentId || c.studentId === "STU-DEMO-1",
  );
  const myComplaints = hostelComplaints.filter(
    (c) => c.studentId === studentId || c.studentId === "STU-DEMO-1",
  );
  const latestNotice = notices[0];

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW Â· STUDENT PORTAL"
        title={`Welcome back, ${studentName}.`}
        desc="Your unified gateway for academics, hostel services, requests, and campus life."
        actions={
          <button className="primary" onClick={() => go("attendance")}>
            <QrCode /> Scan Attendance
          </button>
        }
      />
      <div className="stats-grid">
        <Stat
          icon={Activity}
          label="Overall Attendance"
          value={`${overall}%`}
          sub="Semester average"
        />
        <Stat
          icon={DoorOpen}
          label="Gate Pass Status"
          value={activeGatePass?.status || "None"}
          sub={
            activeGatePass ? `Valid ${activeGatePass.date}` : "Apply for leave"
          }
        />
        <Stat
          icon={Award}
          label="Certificates"
          value={activeCertificate?.status || "None"}
          sub={activeCertificate?.type || "Ready to request"}
        />
        <Stat
          icon={AlertTriangle}
          label="My Complaints"
          value={myComplaints.filter((c) => c.status !== "Closed").length}
          sub="Active hostel tickets"
        />
      </div>

      <div className="cf-service-shortcuts">
        <div className="panel-head">
          <div>
            <h3>Unified Campus Services</h3>
            <p>Quick access to all automated student workflows</p>
          </div>
        </div>
        <div className="cf-shortcuts-grid">
          <button
            className="cf-shortcut-card card-orange"
            onClick={() => go("gatepass")}
          >
            <div className="cf-icon-wrap">
              <DoorOpen size={22} />
            </div>
            <div>
              <b>Leave / Gate Pass</b>
              <span>
                {activeGatePass
                  ? `${activeGatePass.status}: ${activeGatePass.reason.slice(0, 25)}...`
                  : "Apply for leave or exit permit"}
              </span>
            </div>
            <ChevronRight size={18} />
          </button>
          <button
            className="cf-shortcut-card card-blue"
            onClick={() => go("certificate")}
          >
            <div className="cf-icon-wrap">
              <Award size={22} />
            </div>
            <div>
              <b>Certificate Request</b>
              <span>
                {activeCertificate
                  ? `${activeCertificate.status}: ${activeCertificate.type}`
                  : "Bonafide, TC, Character certs"}
              </span>
            </div>
            <ChevronRight size={18} />
          </button>
          <button
            className="cf-shortcut-card card-red"
            onClick={() => go("hostelcomplaint")}
          >
            <div className="cf-icon-wrap">
              <Home size={22} />
            </div>
            <div>
              <b>Hostel Complaint</b>
              <span>AI smart routing & maintenance</span>
            </div>
            <ChevronRight size={18} />
          </button>
          <button
            className="cf-shortcut-card card-purple"
            onClick={() => go("notices")}
          >
            <div className="cf-icon-wrap">
              <Megaphone size={22} />
            </div>
            <div>
              <b>Notices & Announcements</b>
              <span>
                {latestNotice
                  ? latestNotice.title.slice(0, 26) + "..."
                  : "Targeted broadcast feed"}
              </span>
            </div>
            <ChevronRight size={18} />
          </button>
          <button
            className="cf-shortcut-card card-green"
            onClick={() => go("messmenu")}
          >
            <div className="cf-icon-wrap">
              <UtensilsCrossed size={22} />
            </div>
            <div>
              <b>Weekly Mess Menu</b>
              <span>Breakfast, Lunch, Snacks, Dinner</span>
            </div>
            <ChevronRight size={18} />
          </button>
          <button
            className="cf-shortcut-card card-cyan"
            onClick={() => go("payments")}
          >
            <div className="cf-icon-wrap">
              <Receipt size={22} />
            </div>
            <div>
              <b>Fees & Dues</b>
              <span>
                {payment
                  ? `Due: INR ${Number(payment.due || 0).toLocaleString("en-IN")}`
                  : "Fee records & payment slips"}
              </span>
            </div>
            <ChevronRight size={18} />
          </button>
          <button
            className="cf-shortcut-card card-blue"
            onClick={() => go("placement")}
          >
            <div className="cf-icon-wrap">
              <Briefcase size={22} />
            </div>
            <div>
              <b>Placement & Internships</b>
              <span>Explore roles, apply, and track interviews</span>
            </div>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Todayâ€™s Schedule</h3>
              <p>Academic classes</p>
            </div>
            <button className="ghost" onClick={() => go("history")}>
              View history <ChevronRight />
            </button>
          </div>
          {schedule.map((x, i) => (
            <div className="class-row" key={x[0]}>
              <div className="class-time">{x[3]}</div>
              <div className="class-dot" />
              <div className="class-main">
                <b>{x[0]}</b>
                <span>
                  {x[1]} Â· {x[2]}
                </span>
              </div>
              <div className="class-code">{x[4]}</div>
              <span className={`status ${i === 0 ? "live" : "upcoming"}`}>
                {i === 0 ? "Live" : "Upcoming"}
              </span>
            </div>
          ))}
        </section>
        <section className="panel fee">
          <div className="fee-icon">
            <ClipboardList />
          </div>
          <div className="eyebrow">PAYMENT STATUS</div>
          {payment ? (
            <>
              <h3>{payment.title}</h3>
              <p>
                Total Fee{" "}
                <b>INR {Number(payment.total || 0).toLocaleString("en-IN")}</b>
                <br />
                Paid Amount{" "}
                <b>INR {Number(payment.paid || 0).toLocaleString("en-IN")}</b>
                <br />
                Due Amount{" "}
                <b>INR {Number(payment.due || 0).toLocaleString("en-IN")}</b>
                <br />
                Status <b>{payment.status}</b>
                <br />
                Payment Date <b>{payment.date}</b>
              </p>
            </>
          ) : (
            <>
              <h3>No payment record found</h3>
              <p>No fee details are available for this student ID.</p>
            </>
          )}
          <button className="ghost" onClick={() => go("payments")}>
            View payment history <ChevronRight />
          </button>
        </section>
      </div>

      <div className="bottom-grid">
        <section className="panel quick">
          <div className="panel-head">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-grid">
            {[
              [QrCode, "Scan Attendance", "attendance"],
              [Map, "Campus Map", "map"],
              [History, "Attendance History", "history"],
              [AlertTriangle, "Report Issue", "issue"],
            ].map(([I, l, p]) => (
              <button key={l} onClick={() => go(p)}>
                <I />
                <span>{l}</span>
                <ChevronRight />
              </button>
            ))}
          </div>
        </section>
        <section className="panel attendance-mini">
          <div className="panel-head">
            <div>
              <h3>Attendance Overview</h3>
              <p>Based on your recorded sessions</p>
            </div>
            <span className="percent">{overall}%</span>
          </div>
          <div className="progress">
            <i style={{ width: `${overall}%` }} />
          </div>
          <div className="mini-row">
            <span>
              Present <b>{present}</b>
            </span>
            <span>
              Absent <b>{absent}</b>
            </span>
            <span>
              Required <b>75%</b>
            </span>
          </div>
        </section>
      </div>

      <EndToEndWorkflows />
      <AccessibilityBar />
    </>
  );
}

const placementCompanies = [
  {
    id: "plc-orbit",
    company: "Orbit Systems",
    role: "Software Engineer",
    package: "INR 12 LPA",
    eligibility: "CSE / IT · 7.5 CGPA · No active backlogs",
    location: "Bengaluru",
    deadline: "2026-10-04",
  },
  {
    id: "plc-nova",
    company: "Nova Analytics",
    role: "Data Analyst Intern",
    package: "INR 35,000 / month",
    eligibility: "All branches · 65% aggregate · Excel / SQL",
    location: "Pune · Hybrid",
    deadline: "2026-10-10",
  },
  {
    id: "plc-vertex",
    company: "Vertex Mobility",
    role: "Product Engineering Intern",
    package: "INR 45,000 / month",
    eligibility: "CSE / ECE / Mechanical · 7.0 CGPA",
    location: "Chennai",
    deadline: "2026-10-16",
  },
];
const placementStatuses = [
  "Applied",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];
const placementStats = [
  { year: "2023", placed: 148, average: "6.8 LPA", highest: "18 LPA" },
  { year: "2024", placed: 176, average: "7.4 LPA", highest: "22 LPA" },
  { year: "2025", placed: 214, average: "8.1 LPA", highest: "28 LPA" },
];
const demoPlacementApplications = [
  {
    id: "APP-DEMO-101",
    studentId: "STU-DEMO-1",
    studentName: "Demo Student",
    companyId: "plc-orbit",
    company: "Orbit Systems",
    role: "Software Engineer",
    package: "INR 12 LPA",
    resume: "demo-student-resume.pdf",
    date: "2026-09-12",
    status: "Shortlisted",
  },
  {
    id: "APP-DEMO-102",
    studentId: "STU-DEMO-2",
    studentName: "Neha Kapoor",
    companyId: "plc-nova",
    company: "Nova Analytics",
    role: "Data Analyst Intern",
    package: "INR 35,000 / month",
    resume: "neha-kapoor-resume.pdf",
    date: "2026-09-13",
    status: "Interview",
  },
  {
    id: "APP-DEMO-103",
    studentId: "STU-DEMO-3",
    studentName: "Aman Deep",
    companyId: "plc-vertex",
    company: "Vertex Mobility",
    role: "Product Engineering Intern",
    package: "INR 45,000 / month",
    resume: "aman-deep-resume.pdf",
    date: "2026-09-14",
    status: "Selected",
  },
  {
    id: "APP-DEMO-104",
    studentId: "STU-DEMO-4",
    studentName: "Priya Singh",
    companyId: "plc-orbit",
    company: "Orbit Systems",
    role: "Software Engineer",
    package: "INR 12 LPA",
    resume: "priya-singh-resume.pdf",
    date: "2026-09-15",
    status: "Rejected",
  },
];
const demoPlacementInterviews = [
  {
    id: "INT-DEMO-101",
    applicationId: "APP-DEMO-101",
    studentId: "STU-DEMO-1",
    studentName: "Demo Student",
    company: "Orbit Systems",
    date: "2026-09-22",
    time: "10:30",
    round: "Technical interview",
    mode: "Online",
    venue: "meet.campusconnect.demo/orbit",
  },
  {
    id: "INT-DEMO-102",
    applicationId: "APP-DEMO-102",
    studentId: "STU-DEMO-2",
    studentName: "Neha Kapoor",
    company: "Nova Analytics",
    date: "2026-09-24",
    time: "14:00",
    round: "HR interview",
    mode: "On campus",
    venue: "Career Cell · Room 204",
  },
];

function placementStorageSeed(key, fallback) {
  const stored = load(key, null);
  if (Array.isArray(stored) && stored.length) return stored;
  const seeded =
    key === "cc_placement_applications"
      ? demoPlacementApplications
      : key === "cc_placement_interviews"
        ? demoPlacementInterviews
        : fallback;
  save(key, seeded);
  return seeded;
}

function usePlacementStorage(key, fallback) {
  const [value, setValue] = useState(() => placementStorageSeed(key, fallback));
  useEffect(() => {
    const refresh = () => setValue(load(key, fallback));
    window.addEventListener("storage", refresh);
    window.addEventListener("placement-data-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("placement-data-updated", refresh);
    };
  }, [key]);
  const update = (next) => {
    setValue(next);
    save(key, next);
    window.dispatchEvent(new Event("placement-data-updated"));
  };
  return [value, update];
}

function PlacementPortal({ profile }) {
  const [applications, setApplications] = usePlacementStorage(
    "cc_placement_applications",
    [],
  );
  const [interviews] = usePlacementStorage("cc_placement_interviews", []);
  const [resume, setResume] = useState("");
  const [message, setMessage] = useState("");
  const studentId = profile.studentId || profile.name;
  const mine = applications.filter((item) => item.studentId === studentId);
  const apply = (company) => {
    if (!resume) return setMessage("Upload a mock resume before applying.");
    if (mine.some((item) => item.companyId === company.id))
      return setMessage("You have already applied to this role.");
    const next = {
      id: uid("APP"),
      studentId,
      studentName: profile.name,
      companyId: company.id,
      company: company.company,
      role: company.role,
      package: company.package,
      resume,
      date: new Date().toISOString().slice(0, 10),
      status: "Applied",
    };
    setApplications([next, ...applications]);
    setResume("");
    setMessage(`Application submitted to ${company.company}.`);
  };
  return (
    <>
      <PageTitle
        eyebrow="STUDENT · CAREERS"
        title="Placement & Internship Portal"
        desc="Discover verified campus opportunities, apply with a mock resume, and follow every step."
      />
      {message && (
        <div className="success-box placement-message">
          <CheckCircle2 /> {message}
        </div>
      )}
      <section className="placement-hero panel">
        <div>
          <div className="eyebrow">YOUR CAREER DESK</div>
          <h2>Move from shortlist to offer.</h2>
          <p>
            Applications and interview updates are saved locally on this device
            for this campus demo.
          </p>
        </div>
        <div className="placement-count">
          <strong>{mine.length}</strong>
          <span>My applications</span>
        </div>
      </section>
      <div className="placement-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Open opportunities</h3>
              <p>Eligibility, role and package details</p>
            </div>
            <Briefcase />
          </div>
          <div className="opportunity-list">
            {placementCompanies.map((company) => {
              const applied = mine.find(
                (item) => item.companyId === company.id,
              );
              return (
                <article className="opportunity-card" key={company.id}>
                  <div className="opportunity-top">
                    <div>
                      <span className="eyebrow">{company.company}</span>
                      <h3>{company.role}</h3>
                    </div>
                    <span className="status upcoming">{company.package}</span>
                  </div>
                  <div className="opportunity-meta">
                    <span>
                      <GraduationCap size={14} />
                      {company.eligibility}
                    </span>
                    <span>
                      <Map size={14} />
                      {company.location}
                    </span>
                    <span>
                      <Clock3 size={14} />
                      Apply by {company.deadline}
                    </span>
                  </div>
                  <div className="opportunity-actions">
                    {applied ? (
                      <span className="status present">{applied.status}</span>
                    ) : (
                      <button
                        className="primary"
                        onClick={() => apply(company)}
                      >
                        <CheckCircle2 /> Apply
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Resume & application status</h3>
              <p>Mock upload for this local prototype</p>
            </div>
            <FileText />
          </div>
          <label className="placement-upload">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) =>
                setResume(event.target.files?.[0]?.name || "")
              }
            />
            <Upload size={18} />
            <span>{resume || "Choose resume file"}</span>
          </label>
          <div className="application-list">
            {mine.length ? (
              mine.map((item) => (
                <div className="application-row" key={item.id}>
                  <div>
                    <b>{item.company}</b>
                    <span>
                      {item.role} · {item.date}
                    </span>
                    <small>{item.resume}</small>
                  </div>
                  <span
                    className={`status ${item.status === "Rejected" ? "absent" : item.status === "Selected" ? "present" : "upcoming"}`}
                  >
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="demo-note">
                Your submitted applications will appear here.
              </div>
            )}
          </div>
        </section>
      </div>
      <div className="placement-grid lower">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Interview schedule</h3>
              <p>Upcoming placement calendar</p>
            </div>
            <CalendarCheck />
          </div>
          {interviews.filter((item) => item.studentId === studentId).length ? (
            interviews
              .filter((item) => item.studentId === studentId)
              .map((item) => (
                <div className="interview-row" key={item.id}>
                  <div className="interview-date">
                    <b>
                      {new Date(`${item.date}T12:00:00`).toLocaleDateString(
                        "en-IN",
                        { day: "2-digit" },
                      )}
                    </b>
                    <span>
                      {new Date(`${item.date}T12:00:00`).toLocaleDateString(
                        "en-IN",
                        { month: "short" },
                      )}
                    </span>
                  </div>
                  <div>
                    <b>
                      {item.company} · {item.round}
                    </b>
                    <span>
                      {item.time} · {item.mode} · {item.venue}
                    </span>
                  </div>
                </div>
              ))
          ) : (
            <div className="demo-note">
              No interview has been scheduled yet.
            </div>
          )}
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Previous-year placement statistics</h3>
              <p>College-wide placement snapshot</p>
            </div>
            <BarChart3 />
          </div>
          <div className="placement-chart">
            {placementStats.map((item) => (
              <div className="placement-bar" key={item.year}>
                <div className="bar-value">{item.placed} placed</div>
                <i style={{ height: `${(item.placed / 214) * 100}%` }} />
                <b>{item.year}</b>
                <span>
                  {item.average} avg · {item.highest} high
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <AIInterviewAssistant />
      <CareerPathRecommender profile={profile} />
    </>
  );
}

function CareerPathRecommender({ profile }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Tell me about a career, skill, course, technology, internship, or roadmap you are exploring.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const studentContext = {
    branch: profile.branch || profile.department || "",
    year: profile.year || profile.studyYear || "",
    skills: profile.skills || "",
    interests: profile.interests || "",
    goals: profile.goals || "",
  };
  const sendConversation = async (conversation) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/placement/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation.filter(
            (item) => item.role !== "assistant" || item !== messages[0],
          ),
          studentContext,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error("Career Path Recommender API error", {
          status: response.status,
          statusText: response.statusText,
          error: result.error || "Unknown server error",
        });
        throw new Error(
          result.error || `Career request failed (${response.status}).`,
        );
      }
      setMessages([
        ...conversation,
        { role: "assistant", content: result.answer },
      ]);
    } catch (requestError) {
      console.error("Career Path Recommender request failed", requestError);
      setError(
        requestError.message ||
          "Career Path Recommender could not respond. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const submit = (event) => {
    event.preventDefault();
    const value = question.trim();
    if (!value || loading) return;
    const conversation = [...messages, { role: "user", content: value }];
    setMessages(conversation);
    setQuestion("");
    sendConversation(conversation);
  };
  const retry = () => {
    if ([...messages].reverse().some((item) => item.role === "user"))
      sendConversation(messages);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit(event);
    }
  };
  return (
    <section className="panel career-recommender-panel">
      <div className="panel-head">
        <div>
          <h3>🧭 AI Career Path Recommender</h3>
          <p>
            Explore career directions, skills, courses, projects, internships,
            and roadmaps.
          </p>
        </div>
        <GraduationCap />
      </div>
      <div className="career-chat" aria-live="polite">
        {messages.map((message, index) => (
          <div
            className={`career-chat-message ${message.role}`}
            key={`${message.role}-${index}`}
          >
            <span>{message.role === "assistant" ? "Career AI" : "You"}</span>
            <p>{message.content}</p>
          </div>
        ))}
        {loading && (
          <div className="career-chat-message assistant">
            <span>Career AI</span>
            <p className="career-loading">
              <i /> <i /> <i />
            </p>
          </div>
        )}
      </div>
      {error && (
        <div className="career-error">
          <AlertTriangle size={15} />
          <span>{error}</span>
          <button className="ghost mini-btn" onClick={retry} disabled={loading}>
            Retry
          </button>
        </div>
      )}
      <form className="career-chat-form" onSubmit={submit}>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask any career, education, skills, job, internship, or roadmap question..."
          rows="2"
          disabled={loading}
        />
        <button
          className="primary"
          type="submit"
          disabled={loading || !question.trim()}
        >
          {loading ? <RefreshCw className="interview-spinner" /> : <Send />}
          {loading ? "Thinking" : "Send"}
        </button>
      </form>
    </section>
  );
}

function PlacementManagement() {
  const [applications, setApplications] = usePlacementStorage(
    "cc_placement_applications",
    [],
  );
  const [interviews, setInterviews] = usePlacementStorage(
    "cc_placement_interviews",
    [],
  );
  const [form, setForm] = useState({
    applicationId: "",
    date: "",
    time: "",
    round: "Technical interview",
    mode: "Online",
    venue: "",
  });
  const scheduleInterview = (event) => {
    event.preventDefault();
    if (!form.applicationId || !form.date || !form.time) return;
    const application = applications.find(
      (item) => item.id === form.applicationId,
    );
    if (!application) return;
    const next = {
      ...form,
      id: uid("INT"),
      studentId: application.studentId,
      studentName: application.studentName,
      company: application.company,
    };
    setInterviews([next, ...interviews]);
    setForm({ ...form, date: "", time: "", venue: "" });
  };
  const deleteInterview = (id) =>
    setInterviews(interviews.filter((item) => item.id !== id));
  const updateStatus = (id, status) =>
    setApplications(
      applications.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  return (
    <>
      <PageTitle
        eyebrow="ADMIN · CAREERS"
        title="Placement Management"
        desc="Review every student application and coordinate campus interviews."
      />
      <div className="stats-grid">
        <Stat
          icon={Briefcase}
          label="Applications"
          value={applications.length}
          sub="Stored on this device"
        />
        <Stat
          icon={Clock3}
          label="Awaiting review"
          value={
            applications.filter((item) => item.status === "Applied").length
          }
          sub="Ready for action"
        />
        <Stat
          icon={CheckCircle2}
          label="Selected"
          value={
            applications.filter((item) => item.status === "Selected").length
          }
          sub="Placement offers"
        />
        <Stat
          icon={CalendarCheck}
          label="Interviews"
          value={interviews.length}
          sub="Scheduled rounds"
        />
      </div>
      <section className="panel placement-admin-panel">
        <div className="panel-head">
          <div>
            <h3>Student applications</h3>
            <p>Student, company, role, resume, date and live status</p>
          </div>
          <Briefcase />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Company / Role</th>
                <th>Resume</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.length ? (
                applications.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <b>{item.studentName}</b>
                      <small className="marks-id">{item.studentId}</small>
                    </td>
                    <td>
                      <b>{item.company}</b>
                      <br />
                      {item.role}
                    </td>
                    <td>
                      <span className="resume-label">
                        <FileText size={14} />
                        {item.resume}
                      </span>
                    </td>
                    <td>{item.date}</td>
                    <td>
                      <select
                        className="placement-status-select"
                        value={item.status}
                        onChange={(event) =>
                          updateStatus(item.id, event.target.value)
                        }
                      >
                        {placementStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No placement applications submitted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel placement-schedule-panel">
        <div className="panel-head">
          <div>
            <h3>Manage interview schedule</h3>
            <p>Create or update the calendar entries visible to students.</p>
          </div>
          <CalendarCheck />
        </div>
        <form className="form-grid" onSubmit={scheduleInterview}>
          <label>
            Application
            <select
              value={form.applicationId}
              onChange={(event) =>
                setForm({ ...form, applicationId: event.target.value })
              }
            >
              <option value="">Select student application</option>
              {applications.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.studentName} · {item.company}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm({ ...form, date: event.target.value })
              }
            />
          </label>
          <label>
            Time
            <input
              type="time"
              value={form.time}
              onChange={(event) =>
                setForm({ ...form, time: event.target.value })
              }
            />
          </label>
          <label>
            Round
            <select
              value={form.round}
              onChange={(event) =>
                setForm({ ...form, round: event.target.value })
              }
            >
              <option>Technical interview</option>
              <option>HR interview</option>
              <option>Assessment</option>
              <option>Group discussion</option>
            </select>
          </label>
          <label>
            Mode
            <select
              value={form.mode}
              onChange={(event) =>
                setForm({ ...form, mode: event.target.value })
              }
            >
              <option>Online</option>
              <option>On campus</option>
            </select>
          </label>
          <label>
            Venue / Link
            <input
              value={form.venue}
              onChange={(event) =>
                setForm({ ...form, venue: event.target.value })
              }
              placeholder="Room or meeting link"
            />
          </label>
          <button className="primary" type="submit">
            <CalendarCheck /> Schedule interview
          </button>
        </form>
        <div className="schedule-admin-list">
          {interviews.map((item) => (
            <div className="interview-row" key={item.id}>
              <div>
                <b>
                  {item.studentName} · {item.company}
                </b>
                <span>
                  {item.round} · {item.date} · {item.time} · {item.mode} ·{" "}
                  {item.venue || "Venue pending"}
                </span>
              </div>
              <button
                className="danger mini-btn"
                onClick={() => deleteInterview(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function PlacementManagementFixed() {
  const [applications, setApplications] = usePlacementStorage(
    "cc_placement_applications",
    [],
  );
  const [interviews, setInterviews] = usePlacementStorage(
    "cc_placement_interviews",
    [],
  );
  const [form, setForm] = useState({
    applicationId: "",
    date: "",
    time: "",
    round: "Technical interview",
    mode: "Online",
    venue: "",
  });
  const [editingInterviewId, setEditingInterviewId] = useState(null);
  const selectApplication = (applicationId) => {
    const existing = interviews.find(
      (item) => item.applicationId === applicationId,
    );
    setEditingInterviewId(existing?.id || null);
    setForm(
      existing
        ? {
            applicationId,
            date: existing.date,
            time: existing.time,
            round: existing.round,
            mode: existing.mode,
            venue: existing.venue || "",
          }
        : {
            applicationId,
            date: "",
            time: "",
            round: "Technical interview",
            mode: "Online",
            venue: "",
          },
    );
  };
  const scheduleInterview = (event) => {
    event.preventDefault();
    if (!form.applicationId || !form.date || !form.time) return;
    const application = applications.find(
      (item) => item.id === form.applicationId,
    );
    if (!application) return;
    const interview = {
      ...form,
      id: editingInterviewId || uid("INT"),
      studentId: application.studentId,
      studentName: application.studentName,
      company: application.company,
    };
    setInterviews(
      editingInterviewId
        ? interviews.map((item) =>
            item.id === editingInterviewId ? interview : item,
          )
        : [interview, ...interviews],
    );
    setApplications(
      applications.map((item) =>
        item.id === application.id && item.status !== "Rejected"
          ? { ...item, status: "Interview" }
          : item,
      ),
    );
    setEditingInterviewId(null);
    setForm({
      applicationId: "",
      date: "",
      time: "",
      round: "Technical interview",
      mode: "Online",
      venue: "",
    });
  };
  const deleteInterview = (id) => {
    setInterviews(interviews.filter((item) => item.id !== id));
    if (editingInterviewId === id) {
      setEditingInterviewId(null);
      setForm({
        applicationId: "",
        date: "",
        time: "",
        round: "Technical interview",
        mode: "Online",
        venue: "",
      });
    }
  };
  const updateStatus = (id, status) =>
    setApplications(
      applications.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  return (
    <>
      <PageTitle
        eyebrow="ADMIN · CAREERS"
        title="Placement Management"
        desc="Review every student application and coordinate campus interviews."
      />
      <div className="stats-grid">
        <Stat
          icon={Briefcase}
          label="Applications"
          value={applications.length}
          sub="Stored on this device"
        />
        <Stat
          icon={Clock3}
          label="Awaiting review"
          value={
            applications.filter((item) => item.status === "Applied").length
          }
          sub="Ready for action"
        />
        <Stat
          icon={CheckCircle2}
          label="Selected"
          value={
            applications.filter((item) => item.status === "Selected").length
          }
          sub="Placement offers"
        />
        <Stat
          icon={CalendarCheck}
          label="Interviews"
          value={interviews.length}
          sub="Scheduled rounds"
        />
      </div>
      <section className="panel placement-admin-panel">
        <div className="panel-head">
          <div>
            <h3>Student applications</h3>
            <p>Student, company, role, resume, date and live status</p>
          </div>
          <Briefcase />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Company / Role</th>
                <th>Resume</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.length ? (
                applications.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <b>{item.studentName}</b>
                      <small className="marks-id">{item.studentId}</small>
                    </td>
                    <td>
                      <b>{item.company}</b>
                      <br />
                      {item.role}
                    </td>
                    <td>
                      <span className="resume-label">
                        <FileText size={14} />
                        {item.resume}
                      </span>
                    </td>
                    <td>{item.date}</td>
                    <td>
                      <select
                        className="placement-status-select"
                        value={item.status}
                        onChange={(event) =>
                          updateStatus(item.id, event.target.value)
                        }
                      >
                        {placementStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No placement applications submitted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel placement-schedule-panel">
        <div className="panel-head">
          <div>
            <h3>Manage interview schedule</h3>
            <p>Select an application to schedule or update its interview.</p>
          </div>
          <CalendarCheck />
        </div>
        <form className="form-grid" onSubmit={scheduleInterview}>
          <label>
            Application
            <select
              value={form.applicationId}
              onChange={(event) => selectApplication(event.target.value)}
            >
              <option value="">Select student application</option>
              {applications.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.studentName} · {item.company}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm({ ...form, date: event.target.value })
              }
            />
          </label>
          <label>
            Time
            <input
              type="time"
              value={form.time}
              onChange={(event) =>
                setForm({ ...form, time: event.target.value })
              }
            />
          </label>
          <label>
            Round
            <select
              value={form.round}
              onChange={(event) =>
                setForm({ ...form, round: event.target.value })
              }
            >
              <option>Technical interview</option>
              <option>HR interview</option>
              <option>Assessment</option>
              <option>Group discussion</option>
            </select>
          </label>
          <label>
            Mode
            <select
              value={form.mode}
              onChange={(event) =>
                setForm({ ...form, mode: event.target.value })
              }
            >
              <option>Online</option>
              <option>On campus</option>
            </select>
          </label>
          <label>
            Venue / Link
            <input
              value={form.venue}
              onChange={(event) =>
                setForm({ ...form, venue: event.target.value })
              }
              placeholder="Room or meeting link"
            />
          </label>
          <button className="primary" type="submit">
            <CalendarCheck />
            {editingInterviewId ? "Update interview" : "Schedule interview"}
          </button>
        </form>
        <div className="schedule-admin-list">
          {interviews.map((item) => (
            <div className="interview-row" key={item.id}>
              <div>
                <b>
                  {item.studentName} · {item.company}
                </b>
                <span>
                  {item.round} · {item.date} · {item.time} · {item.mode} ·{" "}
                  {item.venue || "Venue pending"}
                </span>
              </div>
              <button
                className="ghost mini-btn"
                onClick={() => selectApplication(item.applicationId)}
              >
                Edit
              </button>
              <button
                className="danger mini-btn"
                onClick={() => deleteInterview(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function TeacherDashboard({ go, profile, attendance, feedback }) {
  const present = attendance.filter((item) => item.status === "Present").length;
  const teacherFeedback = feedback.filter(
    (item) =>
      item.teacher &&
      item.teacher.toLowerCase().includes((profile.name || "").toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW Â· TEACHER PORTAL"
        title={`Welcome, ${profile.name}.`}
        desc="Manage classroom attendance, schedules, and student feedback."
        actions={
          <button className="primary" onClick={() => go("create")}>
            <QrCode /> Create Attendance Session
          </button>
        }
      />
      <div className="stats-grid">
        <Stat
          icon={QrCode}
          label="Attendance Sessions"
          value={attendance.length}
          sub="Recorded scans"
        />
        <Stat
          icon={CheckCircle2}
          label="Present Records"
          value={present}
          sub="Verified attendance"
        />
        <Stat
          icon={ClipboardList}
          label="Feedback"
          value={teacherFeedback.length}
          sub="Student submissions"
        />
        <Stat
          icon={CalendarDays}
          label="Role"
          value="Teacher"
          sub="Campus teaching staff"
        />
      </div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Teacher Workbench</h3>
            <p>Quick access to your teaching tools</p>
          </div>
          <Users />
        </div>
        <div className="admin-action-grid">
          <button onClick={() => go("create")}>
            <QrCode size={20} />
            <b>Create Attendance Session</b>
            <span>Generate a rotating QR code</span>
            <ChevronRight />
          </button>
          <button onClick={() => go("monitor")}>
            <Activity size={20} />
            <b>Live Monitoring</b>
            <span>Review classroom attendance</span>
            <ChevronRight />
          </button>
          <button onClick={() => go("timetable")}>
            <CalendarDays size={20} />
            <b>Daily Timetable</b>
            <span>View todayâ€™s classes</span>
            <ChevronRight />
          </button>
          <button onClick={() => go("feedback")}>
            <ClipboardList size={20} />
            <b>Student Feedback</b>
            <span>Review submitted feedback</span>
            <ChevronRight />
          </button>
        </div>
      </section>
    </>
  );
}

function AdminDashboard({
  go,
  attendance,
  session,
  students,
  gatePasses = [],
  certificateRequests = [],
  hostelComplaints = [],
  notices = [],
}) {
  const pendingGatePasses = gatePasses.filter(
    (g) => g.status === "Pending Admin Approval" || g.status === "Pending",
  ).length;
  const pendingCerts = certificateRequests.filter(
    (c) => c.status === "Submitted" || c.status === "Pending",
  ).length;
  const openComplaints = hostelComplaints.filter(
    (c) => c.status === "Open" || c.status === "In Progress",
  ).length;
  const totalPending = pendingGatePasses + pendingCerts + openComplaints;
  const recurringIssues = detectRecurringIssues(hostelComplaints);

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW Â· ADMIN CONSOLE"
        title="Campus Operations Center"
        desc="Monitor student requests, AI-routed complaints, attendance, and facility workflows in real time."
      />

      <div className="stats-grid">
        <Stat
          icon={Clock3}
          label="Pending Requests"
          value={totalPending}
          sub={`${pendingGatePasses} Gate Â· ${pendingCerts} Certs Â· ${openComplaints} Issues`}
        />
        <Stat
          icon={AlertTriangle}
          label="Complaints & Ageing"
          value={openComplaints}
          sub="2 under 24h Â· 1 ageing >2d"
        />
        <Stat
          icon={Activity}
          label="Resolution Time"
          value="3.2 hrs"
          sub="â†‘ 18% faster resolution"
        />
        <Stat
          icon={Zap}
          label="Recurring Issues"
          value={recurringIssues.length}
          sub={
            recurringIssues.length
              ? "AI flag: Cluster detected!"
              : "No clusters flagged"
          }
        />
      </div>

      {recurringIssues.length > 0 && (
        <div className="recurring-issue-alert">
          <div className="recurring-alert-head">
            <AlertTriangle size={20} />
            <div>
              <b>AI Pattern Detection: Recurring Facility Issues Flagged</b>
              <p>
                Multiple complaints received for the same category and location
                within 72 hours.
              </p>
            </div>
          </div>
          <div className="recurring-grid">
            {recurringIssues.map((g) => (
              <div key={g.key} className="recurring-chip">
                <span className="recurring-tag">{g.category}</span>
                <span className="recurring-loc">{g.location}</span>
                <span className="recurring-count">{g.count} reports</span>
                <button
                  className="ghost mini-btn"
                  onClick={() => go("adminhostel")}
                >
                  Investigate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Workflow Management Portals</h3>
            <p>Direct administrative controls for CampusFlow operations</p>
          </div>
        </div>
        <div className="admin-action-grid">
          <button onClick={() => go("admingatepass")}>
            <DoorOpen size={20} />
            <b>Gate Pass Approval</b>
            <span>{pendingGatePasses} pending review</span>
            <ChevronRight />
          </button>
          <button onClick={() => go("admincert")}>
            <Award size={20} />
            <b>Certificate Issuance</b>
            <span>{pendingCerts} pending generation</span>
            <ChevronRight />
          </button>
          <button onClick={() => go("adminhostel")}>
            <AlertTriangle size={20} />
            <b>Complaint Management</b>
            <span>{openComplaints} active tickets</span>
            <ChevronRight />
          </button>
          <button onClick={() => go("adminnotices")}>
            <Megaphone size={20} />
            <b>Notice Management</b>
            <span>Broadcast announcements</span>
            <ChevronRight />
          </button>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Warden Workload & Assignment</h3>
              <p>Technician ticket allocation</p>
            </div>
            <Wrench size={18} />
          </div>
          <div className="staff-workload-list">
            {[
              {
                name: "Rajesh Kumar",
                dept: "Electrical Dept",
                active: 2,
                resolved: 14,
                efficiency: "96%",
              },
              {
                name: "Suresh Pal",
                dept: "Plumbing Dept",
                active: 1,
                resolved: 11,
                efficiency: "92%",
              },
              {
                name: "Anita Devi",
                dept: "Housekeeping",
                active: 0,
                resolved: 19,
                efficiency: "98%",
              },
              {
                name: "Ramesh Verma",
                dept: "Carpentry & Furniture",
                active: 1,
                resolved: 8,
                efficiency: "90%",
              },
            ].map((st) => (
              <div key={st.name} className="staff-workload-row">
                <div className="staff-avatar">{initials(st.name)}</div>
                <div className="staff-info">
                  <b>{st.name}</b>
                  <span>
                    {st.dept} Â· {st.efficiency} satisfaction
                  </span>
                </div>
                <div className="staff-stats">
                  <span className="badge-active">{st.active} active</span>
                  <span className="badge-resolved">{st.resolved} done</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel admin-chart">
          <div className="panel-head">
            <div>
              <h3>Campus Weekly Activity</h3>
              <p>Attendance & service requests</p>
            </div>
            <BarChart3 />
          </div>
          <div className="bars">
            {[74, 81, 78, 92, 88, 94, 87].map((v, i) => (
              <div key={i}>
                <span style={{ height: v + "%" }} />
                <small>{["M", "T", "W", "T", "F", "S", "S"][i]}</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <PaymentManagement students={students} />
      <EndToEndWorkflows />
      <AccessibilityBar />
    </>
  );
}

function AdminAnalyticsPage({
  complaints = [],
  gatePasses = [],
  certificateRequests = [],
}) {
  const formatElapsed = (milliseconds) => {
    const minutes = Math.max(0, Math.round(milliseconds / 60000));
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return days
      ? `${days}d ${hours}h`
      : hours
        ? `${hours}h ${minutes % 60}m`
        : `${minutes}m`;
  };
  const formatDuration = (start, end) => {
    const startTime = Date.parse(start || "");
    const endTime = Date.parse(end || "");
    return Number.isFinite(startTime) && Number.isFinite(endTime)
      ? formatElapsed(endTime - startTime)
      : "Not recorded";
  };
  const ageFrom = (timestamp) => {
    const startTime = Date.parse(timestamp || "");
    if (!Number.isFinite(startTime)) return "Unknown";
    const minutes = Math.max(0, Math.floor((Date.now() - startTime) / 60000));
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return days
      ? `${days}d ${hours}h`
      : hours
        ? `${hours}h ${minutes % 60}m`
        : `${minutes}m`;
  };
  const pending = [
    ...complaints
      .filter((item) => ["Open", "In Progress"].includes(item.status))
      .map((item) => ({
        id: item.id,
        type: "Complaint",
        category: item.aiCategory || "General",
        status: item.status,
        createdAt: item.createdAt,
      })),
    ...gatePasses
      .filter((item) => /Pending/.test(item.status))
      .map((item) => ({
        id: item.id,
        type: item.requestType || "Gate Pass",
        category: item.requestType || "Gate Pass",
        status: item.status,
        createdAt: item.createdAt || item.date,
      })),
    ...certificateRequests
      .filter((item) => ["Submitted", "Pending"].includes(item.status))
      .map((item) => ({
        id: item.id,
        type: "Certificate Request",
        category: item.type || "Certificate",
        status: item.status,
        createdAt: item.createdAt || item.requestDate,
      })),
  ]
    .map((item) => ({ ...item, age: ageFrom(item.createdAt) }))
    .sort(
      (first, second) =>
        Date.parse(first.createdAt || "") - Date.parse(second.createdAt || ""),
    );
  const resolved = [
    ...complaints
      .filter((item) => ["Resolved", "Closed"].includes(item.status))
      .map((item) => ({
        id: item.id,
        type: "Complaint",
        category: item.aiCategory || "General",
        createdAt: item.createdAt,
        completedAt: item.resolvedAt || item.completedAt || item.updatedAt,
      })),
    ...gatePasses
      .filter((item) =>
        [
          "Approved",
          "Rejected by Admin",
          "Rejected by Warden",
          "Completed",
        ].includes(item.status),
      )
      .map((item) => ({
        id: item.id,
        type: item.requestType || "Gate Pass",
        category: item.requestType || "Gate Pass",
        createdAt: item.createdAt || item.date,
        completedAt: item.resolvedAt || item.completedAt || item.updatedAt,
      })),
    ...certificateRequests
      .filter((item) => item.status === "Generated")
      .map((item) => ({
        id: item.id,
        type: "Certificate Request",
        category: item.type || "Certificate",
        createdAt: item.createdAt || item.requestDate,
        completedAt: item.completedDate || item.resolvedAt,
      })),
  ].map((item) => ({
    ...item,
    duration: formatDuration(item.createdAt, item.completedAt),
  }));
  const durations = resolved
    .map((item) => {
      const startTime = Date.parse(item.createdAt || "");
      const endTime = Date.parse(item.completedAt || "");
      return Number.isFinite(startTime) && Number.isFinite(endTime)
        ? endTime - startTime
        : null;
    })
    .filter((value) => value !== null);
  const averageResolution = durations.length
    ? formatElapsed(
        durations.reduce((total, value) => total + value, 0) / durations.length,
      )
    : "Not recorded";
  const categories = new globalThis.Map();
  [
    ...complaints.map((item) => ({
      category: item.aiCategory || "General",
      type: "Complaint",
    })),
    ...gatePasses.map((item) => ({
      category: item.requestType || "Gate Pass",
      type: "Request",
    })),
    ...certificateRequests.map((item) => ({
      category: item.type || "Certificate",
      type: "Request",
    })),
  ].forEach((item) => {
    const key = `${item.type}: ${item.category}`;
    categories.set(key, (categories.get(key) || 0) + 1);
  });
  const recurring = [...categories.entries()]
    .filter(([, count]) => count > 1)
    .sort((first, second) => second[1] - first[1]);

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW · ADMIN"
        title="Admin Analytics"
        desc="Review pending ageing, resolution times, and repeated complaint or request categories."
      />
      <div className="stats-grid">
        <Stat
          icon={Clock3}
          label="Pending Items"
          value={pending.length}
          sub="Requests and complaints"
        />
        <Stat
          icon={AlertTriangle}
          label="Pending Complaints"
          value={pending.filter((item) => item.type === "Complaint").length}
          sub="Open or in progress"
        />
        <Stat
          icon={CheckCircle2}
          label="Resolved Items"
          value={resolved.length}
          sub="Requests and complaints"
        />
        <Stat
          icon={BarChart3}
          label="Average Resolution"
          value={averageResolution}
          sub="Where timestamps are available"
        />
      </div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Pending Request / Complaint Ageing</h3>
            <p>Age is measured from the available creation or request date.</p>
          </div>
          <span className="attendance-pill">{pending.length} pending</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Record</th>
                <th>Type</th>
                <th>Category</th>
                <th>Status</th>
                <th>Pending For</th>
              </tr>
            </thead>
            <tbody>
              {pending.length ? (
                pending.map((item) => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td>
                      <b>#{item.id}</b>
                    </td>
                    <td>{item.type}</td>
                    <td>{item.category}</td>
                    <td>{item.status}</td>
                    <td>{item.age}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No pending requests or complaints.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel lower">
        <div className="panel-head">
          <div>
            <h3>Resolution Time</h3>
            <p>
              Older records without completion timestamps are marked Not
              recorded.
            </p>
          </div>
          <span className="attendance-pill">{resolved.length} resolved</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Record</th>
                <th>Type</th>
                <th>Category</th>
                <th>Resolution Time</th>
              </tr>
            </thead>
            <tbody>
              {resolved.length ? (
                resolved.map((item) => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td>
                      <b>#{item.id}</b>
                    </td>
                    <td>{item.type}</td>
                    <td>{item.category}</td>
                    <td>{item.duration}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No resolved records yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel lower">
        <div className="panel-head">
          <div>
            <h3>Recurring Issues</h3>
            <p>
              Categories appearing more than once across complaints and
              requests.
            </p>
          </div>
          <span className="attendance-pill">{recurring.length} recurring</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Records</th>
              </tr>
            </thead>
            <tbody>
              {recurring.length ? (
                recurring.map(([category, count]) => (
                  <tr key={category}>
                    <td>{category}</td>
                    <td>{count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No repeated categories yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function TimetableManagement() {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const empty = { subject: "", start: "", end: "", room: "", faculty: "" };
  const [data, setData] = useState(() => ensureDemoTimetables());
  const [branch, setBranch] = useState("CSE");
  const [course, setCourse] = useState("B-TECH");
  const [year, setYear] = useState("1st Year");
  const [section, setSection] = useState("A");
  const [day, setDay] = useState("Monday");
  const branches = Object.keys(demoTimetableSubjects[course] || {});
  const years =
    course === "B-TECH"
      ? ["1st Year", "2nd Year", "3rd Year", "4th Year"]
      : ["1st Year", "2nd Year", "3rd Year"];
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const timetableKey = timetableScopeKey({ course, branch, year, section });
  const entries = data[timetableKey]?.[day] || [];
  const updateField = (field, value) => setForm({ ...form, [field]: value });
  const saveTimetable = () => {
    if (
      !course ||
      !branch ||
      !year ||
      !section ||
      !form.subject ||
      !form.start ||
      !form.end ||
      !form.room ||
      !form.faculty
    )
      return;
    const entry = { ...form, id: editingId || uid("TT") };
    const next = {
      ...data,
      [timetableKey]: {
        ...(data[timetableKey] || {}),
        [day]: editingId
          ? entries.map((item) => (item.id === editingId ? entry : item))
          : [...entries, entry],
      },
    };
    setData(next);
    save("cc_timetables", next);
    setForm(empty);
    setEditingId(null);
  };
  const editEntry = (entry) => {
    setForm({
      subject: entry.subject,
      start: entry.start,
      end: entry.end,
      room: entry.room,
      faculty: entry.faculty,
    });
    setEditingId(entry.id);
  };
  const deleteEntry = (id) => {
    const next = {
      ...data,
      [timetableKey]: {
        ...(data[timetableKey] || {}),
        [day]: entries.filter((entry) => entry.id !== id),
      },
    };
    setData(next);
    save("cc_timetables", next);
    if (editingId === id) {
      setEditingId(null);
      setForm(empty);
    }
  };
  const resetEditor = () => {
    setEditingId(null);
    setForm(empty);
  };
  const changeCourse = (value) => {
    setCourse(value);
    const nextBranches = Object.keys(demoTimetableSubjects[value] || {});
    if (!nextBranches.includes(branch)) setBranch(nextBranches[0] || "");
    setYear("1st Year");
    setSection("A");
    resetEditor();
  };
  return (
    <section className="panel timetable-management">
      <div className="panel-head">
        <div>
          <h3>Timetable Management</h3>
          <p>Add and maintain branch and cohort schedules.</p>
        </div>
        <CalendarDays />
      </div>
      <div className="timetable-management-grid">
        <label>
          Course
          <select
            value={course}
            onChange={(event) => changeCourse(event.target.value)}
          >
            {Object.keys(demoTimetableSubjects).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Branch
          <select
            value={branch}
            onChange={(event) => {
              setBranch(event.target.value);
              resetEditor();
            }}
          >
            {branches.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Year
          <select
            value={year}
            onChange={(event) => {
              setYear(event.target.value);
              resetEditor();
            }}
          >
            {years.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Section
          <select
            value={section}
            onChange={(event) => {
              setSection(event.target.value);
              resetEditor();
            }}
          >
            <option>A</option>
            <option>B</option>
          </select>
        </label>
        <label>
          Day
          <select
            value={day}
            onChange={(event) => {
              setDay(event.target.value);
              resetEditor();
            }}
          >
            {days.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Subject
          <input
            value={form.subject}
            onChange={(event) => updateField("subject", event.target.value)}
            placeholder="Subject"
          />
        </label>
        <label>
          Start Time
          <input
            type="time"
            value={form.start}
            onChange={(event) => updateField("start", event.target.value)}
          />
        </label>
        <label>
          End Time
          <input
            type="time"
            value={form.end}
            onChange={(event) => updateField("end", event.target.value)}
          />
        </label>
        <label>
          Room / Lab
          <input
            value={form.room}
            onChange={(event) => updateField("room", event.target.value)}
            placeholder="Room or lab"
          />
        </label>
        <label>
          Faculty Name
          <input
            value={form.faculty}
            onChange={(event) => updateField("faculty", event.target.value)}
            placeholder="Faculty name"
          />
        </label>
      </div>
      <button
        className="primary"
        disabled={!course || !branch || !year || !section}
        onClick={saveTimetable}
      >
        {editingId ? (
          <>
            <CheckCircle2 /> Update entry
          </>
        ) : (
          <>
            <Plus /> Add entry
          </>
        )}
      </button>
      <div className="timetable-management-list">
        {entries.map((entry) => (
          <div className="timetable-management-row" key={entry.id}>
            <div>
              <b>{entry.subject}</b>
              <span>
                {entry.start} - {entry.end} Â· {entry.room} Â· {entry.faculty}
              </span>
            </div>
            <button className="ghost" onClick={() => editEntry(entry)}>
              Edit
            </button>
            <button className="danger" onClick={() => deleteEntry(entry.id)}>
              Delete
            </button>
          </div>
        ))}
        {!entries.length && (
          <div className="demo-note">
            No entries saved for {course} {branch}, {year}, Section {section} on{" "}
            {day}.
          </div>
        )}
      </div>
    </section>
  );
}

function PaymentManagement({ students }) {
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ total: "", paid: "", status: "Pending" });
  const [saveMessage, setSaveMessage] = useState("");
  useEffect(() => {
    if (!selectedId) {
      setForm({ total: "", paid: "", status: "Pending" });
      return;
    }
    const record = readStudentPayments(selectedId)[0];
    setForm(
      record
        ? {
            total: String(record.total || ""),
            paid: String(record.paid || ""),
            status: record.status || "Pending",
          }
        : { total: "", paid: "", status: "Pending" },
    );
  }, [selectedId]);
  const total = Number(form.total) || 0;
  const paid = Number(form.paid) || 0;
  const due = Math.max(total - paid, 0);
  const filteredStudents = students.filter((student) =>
    `${student.studentId} ${student.name}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const savePayment = () => {
    if (!selectedId) return setSaveMessage("Select a student first.");
    if (total <= 0)
      return setSaveMessage("Enter a total fee greater than zero.");
    if (paid < 0 || paid > total)
      return setSaveMessage(
        "Paid amount must be between zero and the total fee.",
      );
    const record = {
      id: `FEE-${selectedId}`,
      date: new Date().toISOString().slice(0, 10),
      title: "Student Fee",
      total,
      paid,
      due,
      amount: `INR ${due.toLocaleString("en-IN")}`,
      method: "Admin record",
      status: form.status,
    };
    save(paymentDataKey(selectedId), [record]);
    const stored = readStudentPayments(selectedId)[0];
    if (
      stored?.total !== total ||
      stored?.paid !== paid ||
      stored?.due !== due ||
      stored?.status !== form.status
    )
      return setSaveMessage("Payment could not be saved.");
    setForm({ total: String(total), paid: String(paid), status: form.status });
    setSaveMessage(`Payment saved for ${selectedId}.`);
  };
  return (
    <section className="panel payment-management">
      <div className="panel-head">
        <div>
          <h3>Payment Management</h3>
          <p>Update fee details for an individual student.</p>
        </div>
        <CreditCard />
      </div>
      <div className="payment-management-grid">
        <label>
          Search Student ID
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search student ID or name"
          />
        </label>
        <label>
          Student ID
          <select
            value={selectedId}
            onChange={(event) => {
              setSelectedId(event.target.value);
              setSaveMessage("");
            }}
          >
            <option value="">Select registered student</option>
            {filteredStudents.map((student) => (
              <option key={student.studentId} value={student.studentId}>
                {student.studentId} Â· {student.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Total Fee
          <input
            type="number"
            min="0"
            value={form.total}
            onChange={(event) => {
              setForm({ ...form, total: event.target.value });
              setSaveMessage("");
            }}
            placeholder="0"
          />
        </label>
        <label>
          Paid Amount
          <input
            type="number"
            min="0"
            max={total}
            value={form.paid}
            onChange={(event) => {
              setForm({ ...form, paid: event.target.value });
              setSaveMessage("");
            }}
            placeholder="0"
          />
        </label>
        <label>
          Payment Status
          <select
            value={form.status}
            onChange={(event) =>
              setForm({ ...form, status: event.target.value })
            }
          >
            <option>Paid</option>
            <option>Partial</option>
            <option>Pending</option>
          </select>
        </label>
      </div>
      <div className="payment-management-summary">
        <span>
          Total <b>INR {total.toLocaleString("en-IN")}</b>
        </span>
        <span>
          Paid <b>INR {paid.toLocaleString("en-IN")}</b>
        </span>
        <span>
          Due <b>INR {due.toLocaleString("en-IN")}</b>
        </span>
        <button
          className="primary"
          disabled={!selectedId || paid > total}
          onClick={savePayment}
        >
          <Receipt /> Save payment details
        </button>
      </div>
      {saveMessage && (
        <div className="success-box">
          <CheckCircle2 /> {saveMessage}
        </div>
      )}
      {!students.length && (
        <div className="demo-note">
          No registered student records are available yet.
        </div>
      )}
    </section>
  );
}

function Scanner({
  attendance,
  setAttendance,
  session,
  studentName,
  studentId,
}) {
  const [code, setCode] = useState("");
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const [camActive, setCamActive] = useState(false);
  const [camError, setCamError] = useState("");
  const scannerRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const startingRef = useRef(false);

  const tokenFromValue = (value) => {
    try {
      const url = new URL(value);
      return url.searchParams.get("token") || "";
    } catch {
      return value.trim();
    }
  };
  const markAttendance = async (value) => {
    const token = tokenFromValue(value);
    if (!token) return;
    try {
      const result = await attendanceApi("/api/attendance/mark", {
        token,
        studentId,
      });
      const next = {
        date: new Date().toISOString().slice(0, 10),
        subject: result.subject || session?.subject || "Data Structures",
        teacher: "Dr. Sharma",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        room: result.room || session?.room || "204",
        status: "Present",
        session: result.sessionId,
      };
      if (attendance.some((a) => a.session === next.session)) {
        setState("duplicate");
        setMessage("Attendance already marked for this session.");
      } else {
        setAttendance([next, ...attendance]);
        setState("success");
        setMessage("Attendance Marked!");
      }
    } catch (error) {
      setState("error");
      setMessage(error.message);
    }
    stopScanner();
  };

  const stopScanner = () => {
    const activeScanner = scannerRef.current;
    scannerRef.current = null;
    startingRef.current = false;
    if (activeScanner) {
      try {
        activeScanner.stop().catch(() => {});
      } catch {}
      try {
        activeScanner.clear().catch(() => {});
      } catch {}
    }
    const cameraStream = cameraStreamRef.current;
    cameraStreamRef.current = null;
    cameraStream?.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {}
    });
    setCamActive(false);
  };

  const startCamera = () => {
    setCamError("");
    setState("idle");
    setMessage("");
    setCamActive(true);
  };
  const cameraErrorMessage = (error) => {
    if (error?.name === "NotSupportedError")
      return "Camera access is not supported by this browser. Please use a modern browser such as Chrome, Firefox, or Safari.";
    if (
      error?.name === "SecurityError" ||
      error?.name === "InsecureContextError"
    )
      return "Camera access requires HTTPS after deployment. During development, use http://localhost.";
    if (
      error?.name === "NotAllowedError" ||
      error?.name === "PermissionDeniedError"
    )
      return "Camera permission was denied. Allow camera access in your browser settings, then try again.";
    if (
      error?.name === "NotFoundError" ||
      error?.name === "DevicesNotFoundError"
    )
      return "No camera was found on this device. Connect a camera and try again.";
    if (error?.name === "NotReadableError" || error?.name === "TrackStartError")
      return "The camera is unavailable or already in use by another application.";
    if (error?.name === "OverconstrainedError")
      return "The requested camera is unavailable. Check your camera and try again.";
    return "Could not start the camera. Check your browser permissions and camera connection, then try again.";
  };
  useEffect(() => {
    if (!camActive) return;
    let cancelled = false;
    const start = async () => {
      if (startingRef.current || scannerRef.current) return;
      startingRef.current = true;
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (cancelled) return;
      let permissionStream = null;
      const qrScanner = new Html5Qrcode("qr-scanner-region");
      scannerRef.current = qrScanner;
      try {
        if (
          !window.isSecureContext &&
          !["localhost", "127.0.0.1", "[::1]"].includes(
            window.location.hostname,
          )
        )
          throw Object.assign(new Error("Insecure camera context"), {
            name: "SecurityError",
          });
        if (!navigator.mediaDevices?.getUserMedia)
          throw Object.assign(new Error("Camera API unavailable"), {
            name: "NotSupportedError",
          });
        permissionStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          permissionStream.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch {}
          });
          return;
        }
        cameraStreamRef.current = permissionStream;
        permissionStream = null;
        const deviceId = cameraStreamRef.current
          .getVideoTracks()[0]
          ?.getSettings().deviceId;
        cameraStreamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
        });
        cameraStreamRef.current = null;
        const cameraConfig = deviceId
          ? deviceId
          : { facingMode: { ideal: "environment" } };
        await qrScanner.start(
          cameraConfig,
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => markAttendance(decodedText),
          () => {},
        );
        startingRef.current = false;
      } catch (error) {
        permissionStream?.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
        });
        startingRef.current = false;
        scannerRef.current = null;
        try {
          await qrScanner.clear();
        } catch {}
        if (!cancelled) {
          setCamActive(false);
          setCamError(cameraErrorMessage(error));
        }
      }
    };
    start();
    return () => {
      cancelled = true;
      const activeScanner = scannerRef.current;
      scannerRef.current = null;
      startingRef.current = false;
      if (activeScanner) {
        try {
          activeScanner.stop().catch(() => {});
        } catch {}
        try {
          activeScanner.clear().catch(() => {});
        } catch {}
      }
    };
  }, [camActive]);
  useEffect(() => () => stopScanner(), []);

  const scan = () => {
    if (!code.trim())
      return setMessage("Enter the current QR token or scan the QR code.");
    markAttendance(code);
  };

  return (
    <>
      <PageTitle
        eyebrow="SMART ATTENDANCE"
        title="Mark Attendance"
        desc="Scan the classroom QR code to record your presence."
      />
      <div className="scanner-layout">
        <section className="panel scanner-panel">
          <div className="scanner-window">
            {camActive ? (
              <div id="qr-scanner-region" className="qr-scanner-region" />
            ) : (
              <>
                <div className="scanner-corners" />
                <QrCode size={72} />
                <div className="scan-line" />
                <span>CAMERA / QR SCANNER</span>
              </>
            )}
          </div>
          <div className="scanner-status">
            {camActive ? (
              <>
                <Camera />
                <div>
                  <b>Camera active</b>
                  <span>
                    Position the official classroom QR inside the frame.
                  </span>
                </div>
              </>
            ) : (
              <>
                <Camera />
                <div>
                  <b>{camError ? "Camera unavailable" : "Camera ready"}</b>
                  <span>
                    {camError || "Press Start Camera to begin scanning."}
                  </span>
                </div>
              </>
            )}
          </div>
          {!camActive && (
            <button className="primary big" onClick={startCamera}>
              <Camera /> Start Camera
            </button>
          )}
          {camActive && (
            <button className="ghost" onClick={stopScanner}>
              <X /> Stop Camera
            </button>
          )}
          {camError && (
            <div className="result error">
              <div>
                <AlertTriangle />
              </div>
              <div>
                <b>Camera error</b>
                <span>{camError}</span>
              </div>
            </div>
          )}
          <div className="demo-input">
            <label>Manual session ID entry</label>
            <div>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CAMPUS-ATT-DS-58342"
              />
              <button className="primary" onClick={scan}>
                Mark Present
              </button>
            </div>
          </div>
          <div className="demo-note">
            Camera uses your device's rear camera for QR scanning. Works on
            Android Chrome and iPhone Safari when served over HTTPS.
          </div>
        </section>
        <section className="panel how">
          <div className="eyebrow">HOW IT WORKS</div>
          <h3>Three seconds to attendance.</h3>
          {[
            [QrCode, "Scan", "Point your camera at the classroom QR."],
            [ShieldCheck, "Validate", "The session ID and expiry are checked."],
            [CheckCircle2, "Confirm", "Your attendance is saved locally."],
          ].map(([I, t, d], i) => (
            <div className="step" key={t}>
              <div>
                <I />
              </div>
              <span>
                <b>
                  {i + 1}. {t}
                </b>
                {d}
              </span>
            </div>
          ))}
        </section>
      </div>
      {state !== "idle" && (
        <div className={`result ${state}`}>
          <div>
            {state === "success" ? <CheckCircle2 /> : <AlertTriangle />}
          </div>
          <div>
            <b>{message}</b>
            {state === "success" && (
              <span>
                Session: {code} Â· Student: {studentName} Â· Status: Present
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Generator({ session, setSession, role, attendance, setAttendance, profile }) {
  const [form, setForm] = useState({
    subject: "Data Structures",
    section: "CSE-A",
    expiry: "30",
    room: "204",
  });
  const [qr, setQr] = useState("");
  const [qrError, setQrError] = useState("");
  const refreshQr = async (activeSession) => {
    try {
      const result = await attendanceApi("/api/attendance/token", {
        role,
        sessionId: activeSession.id,
      });
      const qrLink = generateAttendanceQRLink(
        activeSession.id,
        activeSession.section,
        activeSession.room,
        result.token,
      );
      setQr(await QRCode.toDataURL(qrLink, { width: 280, margin: 2 }));
      setQrError("");
    } catch (error) {
      setQrError(error.message);
    }
  };
  const generate = async () => {
    const id = `CAMPUS-ATT-${form.subject.split(" ")[0].slice(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 89999)}`;
    setQrError("");
    setQr("");
    try {
      const result = await attendanceApi("/api/attendance/session", {
        role,
        sessionId: id,
        subject: form.subject,
        section: form.section,
        room: form.room,
      });
      const s = {
        ...form,
        id: result.sessionId,
        created: new Date().toISOString(),
        present: 0,
      };
      if (setAttendance && profile && attendance) {
        const teacherAttendance = {
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          subject: form.subject,
          teacher: profile.name,
          room: form.room,
          status: "Present",
          session: result.sessionId,
        };
        setAttendance([teacherAttendance, ...attendance]);
      }
      const qrLink = generateAttendanceQRLink(
        s.id,
        s.section,
        s.room,
        result.token,
      );
      setQr(await QRCode.toDataURL(qrLink, { width: 280, margin: 2 }));
      setSession(s);
    } catch (error) {
      setQrError(error.message);
    }
  };
  useEffect(() => {
    if (!session?.id) return;
    const timer = setInterval(() => refreshQr(session), 2000);
    return () => clearInterval(timer);
  }, [session?.id]);
  const download = () => {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `${session?.id || "attendance-qr"}.png`;
    a.click();
  };
  return (
    <>
      <PageTitle
        eyebrow="ADMIN Â· ATTENDANCE"
        title="Create Attendance Session"
        desc="Generate a real, scannable QR session for a classroom."
      />
      <div className="generator-layout">
        <section className="panel form-panel">
          <h3>Session details</h3>
          <div className="form-grid">
            <label>
              Subject
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              >
                {[
                  "Data Structures",
                  "Operating Systems",
                  "DBMS",
                  "Computer Networks",
                  "Computer Lab",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Class / Section
              <select
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
              >
                {["CSE-A", "CSE-B", "CSE-C"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Expiry duration
              <select
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
              >
                <option>15</option>
                <option>30</option>
                <option>60</option>
              </select>
            </label>
            <label>
              Room
              <input
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
              />
            </label>
          </div>
          <button className="primary big" onClick={generate}>
            <QrCode /> Generate Unique QR
          </button>
        </section>
        <section className="panel qr-card">
          {qr ? (
            <>
              <div className="qr-wrap">
                <img src={qr} />
              </div>
              <div className="eyebrow">ACTIVE SESSION</div>
              <h3>{session.id}</h3>
              <p className="qr-link-note">
                Students scan this QR to open the Student Attendance page on
                their phone.
              </p>
              <div className="qr-meta">
                <span>
                  Subject <b>{session.subject}</b>
                </span>
                <span>
                  Section <b>{session.section}</b>
                </span>
                <span>
                  Room <b>{session.room}</b>
                </span>
                <span>
                  Expiry <b>{session.expiry} min</b>
                </span>
              </div>
              <div className="qr-buttons">
                <button className="primary" onClick={download}>
                  <Download /> Download
                </button>
                <button className="ghost" onClick={() => window.print()}>
                  <Printer /> Print
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    setSession(null);
                    setQr("");
                  }}
                >
                  Close Session
                </button>
              </div>
            </>
          ) : (
            <div className="empty-qr">
              <QrCode size={72} />
              <h3>Your QR appears here</h3>
              <p>Fill the session details and generate a scannable QR.</p>
            </div>
          )}
          {qrError && (
            <div className="result error">
              <AlertTriangle /> <span>{qrError}</span>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function HistoryPage({ attendance }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const data = attendance.filter(
    (x) =>
      (x.subject + x.teacher).toLowerCase().includes(q.toLowerCase()) &&
      (filter === "All" || x.status === filter),
  );
  const isDemoAttendance = attendance.some((item) =>
    String(item.session || "").startsWith("DEMO-"),
  );
  const present = isDemoAttendance
    ? demoAttendanceSummary.present
    : attendance.filter((x) => x.status === "Present").length;
  const absent = isDemoAttendance
    ? demoAttendanceSummary.absent
    : attendance.filter((x) => x.status === "Absent").length;
  const overall = isDemoAttendance
    ? demoAttendanceSummary.overall
    : attendance.length
      ? Math.round((present / attendance.length) * 100)
      : 0;
  return (
    <>
      <PageTitle
        eyebrow="STUDENT Â· RECORDS"
        title="Attendance History"
        desc="Search and review every recorded class session."
      />
      <section className="panel">
        <div className="filters">
          <div className="search">
            <Search />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search subject or teacherâ€¦"
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option>Present</option>
            <option>Absent</option>
            <option>Late</option>
          </select>
          <div className="attendance-pill">
            Overall <b>{overall}%</b>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Time</th>
                <th>Room</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((x, i) => (
                <tr key={i}>
                  <td>{x.date}</td>
                  <td>
                    <b>{x.subject}</b>
                  </td>
                  <td>{x.teacher}</td>
                  <td>{x.time}</td>
                  <td>{x.room}</td>
                  <td>
                    <span className={`status ${x.status.toLowerCase()}`}>
                      {x.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="stats-grid lower">
        <Stat
          icon={CheckCircle2}
          label="Present"
          value={present}
          sub="Recorded sessions"
        />
        <Stat
          icon={AlertTriangle}
          label="Absent"
          value={absent}
          sub="Recorded sessions"
        />
        <Stat
          icon={Clock3}
          label="Late"
          value={
            isDemoAttendance
              ? demoAttendanceSummary.late
              : attendance.filter((x) => x.status === "Late").length
          }
          sub="Recorded sessions"
        />
        <Stat
          icon={Activity}
          label="Attendance"
          value={`${overall}%`}
          sub="Above required 75%"
        />
      </div>
    </>
  );
}

function Timetable({ branch, studentId, profile }) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const loadAcademicProfile = () => {
    if (profile?.role !== "student" || !studentId) return profile || {};
    const stored = Object.values(load("cc_face_profiles", {})).find(
      (account) =>
        account.role === "student" && account.studentId === studentId,
    );
    return stored ? { ...profile, ...stored } : profile || {};
  };
  const [academicProfile, setAcademicProfile] = useState(loadAcademicProfile);
  useEffect(() => {
    const refreshProfile = () => setAcademicProfile(loadAcademicProfile());
    const handleStorage = (event) => {
      if (event.key === "cc_face_profiles") refreshProfile();
    };
    window.addEventListener("storage", handleStorage);
    refreshProfile();
    return () => window.removeEventListener("storage", handleStorage);
  }, [studentId, profile]);
  const currentBranch =
    academicProfile.branch || academicProfile.department || branch;
  const schedule = readStudentTimetable(
    currentBranch,
    academicProfile.course,
    academicProfile.year || academicProfile.studyYear,
    academicProfile.section,
  );
  const [selected, setSelected] = useState("Monday");
  const selectedClasses = schedule?.[selected] || [];
  return (
    <>
      <PageTitle
        eyebrow="STUDENT Â· SCHEDULE"
        title="Daily Timetable"
        desc="Plan your classes, rooms and campus time at a glance."
        actions={
          <button className="primary" onClick={() => window.print()}>
            <Printer /> Print timetable
          </button>
        }
      />
      <section className="panel timetable-panel">
        <div className="day-tabs">
          {days.map((day) => (
            <button
              key={day}
              className={selected === day ? "selected" : ""}
              onClick={() => setSelected(day)}
            >
              <span>{day.slice(0, 3)}</span>
              <b>{day}</b>
            </button>
          ))}
        </div>
        <div className="timetable-head">
          <div>
            <div className="eyebrow">{selected.toUpperCase()}</div>
            <h3>
              {schedule && selectedClasses.length
                ? `${selectedClasses.length} classes scheduled`
                : `Timetable not available for your branch/year/section`}
            </h3>
          </div>
          <span className="attendance-pill">
            <CalendarDays /> September 2026
          </span>
        </div>
        <div className="timetable-list">
          {selectedClasses.length ? (
            selectedClasses.map((item, index) => (
              <div
                className="timetable-row"
                key={`${selected}-${item[1]}-${index}`}
              >
                <div className="timetable-time">
                  <b>{item[0]}</b>
                  <span>{index === 0 ? "Morning" : "Afternoon"}</span>
                </div>
                <div className="timetable-line">
                  <i />
                </div>
                <div className="timetable-class">
                  <b>{item[1]}</b>
                  <span>
                    {item[2]} Â· {item[3]}
                  </span>
                </div>
                <div className="class-code">{item[4]}</div>
                <span
                  className={`status ${index === 0 && selected === "Monday" ? "live" : "upcoming"}`}
                >
                  {index === 0 && selected === "Monday" ? "Next" : "Upcoming"}
                </span>
              </div>
            ))
          ) : (
            <div className="demo-note">
              No timetable data is available for this day yet.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function buildFeedbackStats(items) {
  const total = items.length;
  const average = total
    ? (
        items.reduce((sum, item) => sum + Number(item.rating || 0), 0) / total
      ).toFixed(1)
    : "0.0";
  const categories = ["Subject", "Teacher", "Campus Service"];
  const categoryRatings = categories.map((category) => {
    const matches = items.filter((item) => item.category === category);
    const avg = matches.length
      ? (
          matches.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
          matches.length
        ).toFixed(1)
      : "0.0";
    return { category, total: matches.length, avg: Number(avg) };
  });
  return { total, average: Number(average), categoryRatings };
}

function StarRatingInput({ value, onChange }) {
  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          className={star <= value ? "star active" : "star"}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          â˜…
        </button>
      ))}
    </div>
  );
}

function FeedbackPage({ role, profile, feedback, setFeedback }) {
  const [form, setForm] = useState({
    category: "Subject",
    subject: "Mathematics",
    teacher: "Prof. Sharma",
    rating: 5,
    anonymous: false,
    comment: "",
  });
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({
    subject: "All",
    teacher: "All",
    category: "All",
    rating: "All",
  });

  const studentFeedback =
    role === "student"
      ? feedback.filter(
          (item) =>
            item.studentId === (profile.studentId || "") ||
            (item.studentName === profile.name && !item.anonymous),
        )
      : feedback;
  const filteredFeedback =
    role === "student"
      ? studentFeedback
      : feedback.filter((item) => {
          const matchSubject =
            filters.subject === "All" || item.subject === filters.subject;
          const matchTeacher =
            filters.teacher === "All" || item.teacher === filters.teacher;
          const matchCategory =
            filters.category === "All" || item.category === filters.category;
          const matchRating =
            filters.rating === "All" || String(item.rating) === filters.rating;
          return matchSubject && matchTeacher && matchCategory && matchRating;
        });

  const stats = buildFeedbackStats(filteredFeedback);
  const subjects = [...new Set(feedback.map((item) => item.subject))];
  const teachers = [...new Set(feedback.map((item) => item.teacher))];
  const categories = ["Subject", "Teacher", "Campus Service"];

  const submitFeedback = (event) => {
    event.preventDefault();
    if (!form.comment.trim())
      return setMessage(
        "Please add a short comment before submitting your feedback.",
      );
    const entry = {
      id: uid("FB"),
      studentId: profile.studentId || "STU-DEMO-1",
      studentName: form.anonymous ? "Anonymous" : profile.name || "Student",
      category: form.category,
      subject: form.subject,
      teacher: form.teacher,
      rating: Number(form.rating),
      comment: form.comment.trim(),
      anonymous: form.anonymous,
      status: "Submitted",
      createdAt: new Date().toISOString(),
    };
    setFeedback((prev) => [entry, ...prev]);
    setForm({
      category: "Subject",
      subject: "Mathematics",
      teacher: "Prof. Sharma",
      rating: 5,
      anonymous: false,
      comment: "",
    });
    setMessage("Feedback submitted successfully.");
  };

  if (role === "student") {
    return (
      <>
        <PageTitle
          eyebrow="STUDENT Â· FEEDBACK"
          title="Student Feedback"
          desc="Share your experience on subjects, teachers, and campus services."
        />
        <div className="feedback-grid">
          <section className="panel feedback-form-panel">
            <h3>Submit Feedback</h3>
            <form onSubmit={submitFeedback}>
              <div className="feedback-form-grid">
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    <option>Subject</option>
                    <option>Teacher</option>
                    <option>Campus Service</option>
                  </select>
                </label>
                <label>
                  Subject
                  <input
                    value={form.subject}
                    onChange={(event) =>
                      setForm({ ...form, subject: event.target.value })
                    }
                    placeholder="Mathematics"
                  />
                </label>
                <label>
                  Teacher
                  <input
                    value={form.teacher}
                    onChange={(event) =>
                      setForm({ ...form, teacher: event.target.value })
                    }
                    placeholder="Prof. Sharma"
                  />
                </label>
                <label>
                  Rating
                  <div className="rating-wrap">
                    <StarRatingInput
                      value={form.rating}
                      onChange={(value) => setForm({ ...form, rating: value })}
                    />
                  </div>
                </label>
              </div>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={form.anonymous}
                  onChange={(event) =>
                    setForm({ ...form, anonymous: event.target.checked })
                  }
                />{" "}
                Anonymous Feedback
              </label>
              <label>
                Comments
                <textarea
                  value={form.comment}
                  onChange={(event) =>
                    setForm({ ...form, comment: event.target.value })
                  }
                  placeholder="Tell us about your learning experience, campus services, or teaching qualityâ€¦"
                />
              </label>
              <button className="primary big" type="submit">
                <CheckCircle2 /> Submit Feedback
              </button>
              {message && (
                <div className="success-box">
                  <CheckCircle2 /> {message}
                </div>
              )}
            </form>
          </section>
          <section className="panel feedback-history-panel">
            <div className="panel-head">
              <div>
                <h3>Your Feedback</h3>
                <p>Recent submissions and review status</p>
              </div>
              <span className="attendance-pill">
                {studentFeedback.length} items
              </span>
            </div>
            {studentFeedback.length ? (
              <div className="feedback-list">
                {studentFeedback.map((item) => (
                  <div className="feedback-item" key={item.id}>
                    <div className="feedback-top">
                      <div>
                        <b>{item.subject}</b>
                        <small>
                          {item.category} Â·{" "}
                          {item.anonymous ? "Anonymous" : item.studentName}
                        </small>
                      </div>
                      <span className="status present">{item.status}</span>
                    </div>
                    <div className="feedback-meta">
                      <span>{item.teacher}</span>
                      <span>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("en-IN")
                          : "Today"}
                      </span>
                    </div>
                    <div className="rating-stars small">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= Number(item.rating) ? "star active" : "star"
                          }
                        >
                          â˜…
                        </span>
                      ))}
                    </div>
                    <p>{item.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="feedback-empty">
                <div className="empty-icon">
                  <ClipboardList />
                </div>
                <h3>No feedback submitted yet</h3>
                <p>
                  Your feedback history will appear here once you submit your
                  first response.
                </p>
              </div>
            )}
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="ADMIN Â· FEEDBACK"
        title="Feedback Dashboard"
        desc="Monitor ratings and comments from students, teachers, and campus services."
      />
      <div className="stats-grid">
        <Stat
          icon={ClipboardList}
          label="Total feedback"
          value={stats.total}
          sub="Submitted entries"
        />
        <Stat
          icon={BarChart3}
          label="Average rating"
          value={stats.average.toFixed(1)}
          sub="Across all reviews"
        />
        <Stat
          icon={CheckCircle2}
          label="Positive score"
          value={
            stats.total
              ? `${Math.round((feedback.filter((item) => item.rating >= 4).length / stats.total) * 100)}%`
              : "0%"
          }
          sub="4+ star reviews"
        />
        <Stat
          icon={Users}
          label="Categories"
          value={categories.length}
          sub="Tracked groups"
        />
      </div>
      <section className="panel">
        <div className="feedback-filter-grid">
          <label>
            Subject
            <select
              value={filters.subject}
              onChange={(event) =>
                setFilters({ ...filters, subject: event.target.value })
              }
            >
              <option value="All">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>
          <label>
            Teacher
            <select
              value={filters.teacher}
              onChange={(event) =>
                setFilters({ ...filters, teacher: event.target.value })
              }
            >
              <option value="All">All Teachers</option>
              {teachers.map((teacher) => (
                <option key={teacher} value={teacher}>
                  {teacher}
                </option>
              ))}
            </select>
          </label>
          <label>
            Category
            <select
              value={filters.category}
              onChange={(event) =>
                setFilters({ ...filters, category: event.target.value })
              }
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            Rating
            <select
              value={filters.rating}
              onChange={(event) =>
                setFilters({ ...filters, rating: event.target.value })
              }
            >
              <option value="All">All Ratings</option>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={String(rating)}>
                  {rating} Stars
                </option>
              ))}
            </select>
          </label>
        </div>
        {filteredFeedback.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedback.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <b>{item.anonymous ? "Anonymous" : item.studentName}</b>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.subject}</td>
                    <td>{item.teacher}</td>
                    <td>
                      <span className="rating-stars small">
                        <span className="star active">â˜…</span> {item.rating}
                      </span>
                    </td>
                    <td>
                      <span className="status present">{item.status}</span>
                    </td>
                    <td>{item.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="feedback-empty">
            <div className="empty-icon">
              <ClipboardList />
            </div>
            <h3>No feedback matches the current filters</h3>
            <p>
              Adjust the selections to view more student feedback and ratings.
            </p>
          </div>
        )}
        <div className="analytics-panel">
          <h3>Category-wise ratings</h3>
          <div className="analytics-row">
            {stats.categoryRatings.map((item) => (
              <div className="analytics-card" key={item.category}>
                <b>{item.category}</b>
                <strong>{item.avg.toFixed(1)} / 5</strong>
                <span>{item.total} responses</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function PaymentHistory({ payments }) {
  if (!payments.length)
    return (
      <>
        <PageTitle
          eyebrow="STUDENT Â· FINANCE"
          title="Payment History"
          desc="Review your tuition, examination fees and upcoming payments."
        />
        <section className="panel empty-payment">
          <div className="fee-icon">
            <Receipt />
          </div>
          <h3>No payment record found</h3>
          <p>No payment or fee data is linked to this student ID.</p>
        </section>
      </>
    );
  const paid = payments.filter((payment) => payment.status === "Paid");
  const upcoming = payments.find((payment) => payment.status === "Upcoming");
  const paidTotal = paid.reduce(
    (total, payment) => total + Number(payment.paid || 0),
    0,
  );
  return (
    <>
      <PageTitle
        eyebrow="STUDENT Â· FINANCE"
        title="Payment History"
        desc="Review your tuition, examination fees and upcoming payments."
        actions={
          <button className="ghost" onClick={() => window.print()}>
            <Printer /> Print statement
          </button>
        }
      />
      <div className="stats-grid">
        <Stat
          icon={CheckCircle2}
          label="Paid transactions"
          value={paid.length}
          sub="Successfully completed"
        />
        <Stat
          icon={CreditCard}
          label="Paid total"
          value={`INR ${paidTotal.toLocaleString("en-IN")}`}
          sub="From this student record"
        />
        <Stat
          icon={Clock3}
          label="Next due"
          value={upcoming?.date || "None"}
          sub={
            upcoming
              ? `Due INR ${Number(upcoming.due || 0).toLocaleString("en-IN")}`
              : "No upcoming payment"
          }
        />
        <Stat
          icon={Receipt}
          label="Account status"
          value={upcoming ? "Due" : "Clear"}
          sub={upcoming ? "Upcoming payment" : "No pending payment"}
        />
      </div>
      <section className="panel payment-panel">
        <div className="panel-head">
          <div>
            <h3>Transaction history</h3>
            <p>Student finance records stored in this prototype.</p>
          </div>
          <span className="attendance-pill">{paid.length} paid</span>
        </div>
        <div className="payment-list">
          {payments.map((payment) => (
            <div className="payment-row" key={payment.id}>
              <div className={`payment-icon ${payment.status.toLowerCase()}`}>
                <Receipt />
              </div>
              <div className="payment-main">
                <b>{payment.title}</b>
                <span>
                  {payment.date} Â· {payment.method}
                </span>
              </div>
              <div className="payment-amount">
                <b>
                  Total INR {Number(payment.total || 0).toLocaleString("en-IN")}
                </b>
                <span>
                  Paid INR {Number(payment.paid || 0).toLocaleString("en-IN")}{" "}
                  Â· Due INR {Number(payment.due || 0).toLocaleString("en-IN")}{" "}
                  Â· {payment.id}
                </span>
              </div>
              <span
                className={`status ${payment.status === "Paid" ? "present" : payment.status === "Partial" ? "upcoming" : "absent"}`}
              >
                {payment.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

const campusMapLocations = [
  {
    id: "academic",
    name: "Academic Block",
    category: "Academic",
    floors: "4 floors",
    floorCount: 4,
    walk: "4 min",
    distanceMeters: 320,
    detail: "Lecture halls, faculty offices and student services.",
    facilities: [
      "Lecture halls",
      "Faculty offices",
      "Student services desk",
      "Accessible lift",
    ],
    hours: "Mon-Fri, 7:30 AM-7:00 PM",
    position: [-3.6, 0, -1.6],
    size: [2.1, 2.5, 1.8],
    color: "#3b8ea5",
  },
  {
    id: "library",
    name: "Library",
    category: "Study",
    floors: "3 floors",
    floorCount: 3,
    walk: "3 min",
    distanceMeters: 220,
    detail: "Central library, quiet study rooms and reference desk.",
    facilities: [
      "Reference desk",
      "Quiet study rooms",
      "Computer access",
      "Printing and copying",
    ],
    hours: "Mon-Sat, 8:00 AM-9:00 PM",
    position: [0, 0, -4.2],
    size: [2.1, 1.9, 1.8],
    color: "#5579a5",
  },
  {
    id: "hostel",
    name: "Hostel",
    category: "Residence",
    floors: "5 floors",
    floorCount: 5,
    walk: "7 min",
    distanceMeters: 560,
    detail: "Student residence and hostel reception.",
    facilities: [
      "Hostel reception",
      "Common room",
      "Laundry",
      "Resident support desk",
    ],
    hours: "Reception daily, 6:00 AM-10:00 PM",
    position: [-5.9, 0, 2.2],
    size: [2.1, 3.2, 1.8],
    color: "#8b6b91",
  },
  {
    id: "admin",
    name: "Admin Office",
    category: "Administration",
    floors: "2 floors",
    floorCount: 2,
    walk: "5 min",
    distanceMeters: 380,
    detail: "Admissions, records and campus administration.",
    facilities: [
      "Admissions",
      "Student records",
      "Accounts office",
      "Help desk",
    ],
    hours: "Mon-Fri, 9:00 AM-5:00 PM",
    position: [0, 0, -0.4],
    size: [2, 1.55, 1.7],
    color: "#a17855",
  },
  {
    id: "lab",
    name: "Lab",
    category: "Laboratory",
    floors: "2 floors",
    floorCount: 2,
    walk: "5 min",
    distanceMeters: 420,
    detail: "Engineering and computing laboratories.",
    facilities: [
      "Computing lab",
      "Engineering workshop",
      "Project benches",
      "Equipment store",
    ],
    hours: "Mon-Sat, 8:30 AM-6:00 PM",
    position: [3.7, 0, -2.2],
    size: [2.1, 1.65, 1.8],
    color: "#4e8f75",
  },
  {
    id: "mess",
    name: "Mess / Canteen",
    category: "Dining",
    floors: "Ground floor",
    floorCount: 1,
    walk: "3 min",
    distanceMeters: 240,
    detail: "Main dining hall, canteen and student seating.",
    facilities: [
      "Dining hall",
      "Canteen counter",
      "Outdoor seating",
      "Drinking water",
    ],
    hours: "Daily, 7:00 AM-9:00 PM",
    position: [2.8, 0, 2.1],
    size: [2.4, 1.15, 1.8],
    color: "#aa8750",
  },
  {
    id: "medical",
    name: "Medical Centre",
    category: "Health",
    floors: "Ground floor",
    floorCount: 1,
    walk: "6 min",
    distanceMeters: 470,
    detail: "First aid, nurse station and campus health support.",
    facilities: [
      "First-aid room",
      "Nurse station",
      "Consultation room",
      "Rest area",
    ],
    hours: "Daily, 8:00 AM-8:00 PM; on-call support after hours",
    emergencyRole: "Medical",
    position: [6, 0, 0.4],
    size: [1.9, 1.2, 1.7],
    color: "#4c8791",
  },
  {
    id: "gate",
    name: "Main Gate",
    category: "Entrance",
    floors: "Gate",
    floorCount: 1,
    walk: "Starting point",
    distanceMeters: 0,
    detail: "Main campus entrance and security desk.",
    facilities: ["Visitor check-in", "Security desk", "Campus information"],
    hours: "Open 24 hours",
    emergencyRole: "Security",
    position: [0, 0, 6],
    size: [2.5, 1.55, 0.65],
    color: "#80929a",
  },
  {
    id: "security",
    name: "Security Office",
    category: "Security",
    floors: "Ground floor",
    floorCount: 1,
    walk: "1 min",
    distanceMeters: 80,
    detail: "Campus security operations and lost-property support.",
    facilities: [
      "Security control desk",
      "Incident reporting",
      "Lost property",
      "Escort requests",
    ],
    hours: "Open 24 hours",
    emergencyRole: "Security",
    position: [-1.9, 0, 4.7],
    size: [1.55, 1.05, 1.35],
    color: "#647c75",
  },
];

function CampusMapBuilding({
  place,
  selected,
  onSelect,
  selectedFloor,
  dayMode,
  emergencyHighlighted,
}) {
  const [width, height, depth] = place.size;
  const isGate = place.id === "gate";
  const floorCount = place.floorCount || 1;
  const windowsColor = dayMode ? "#b9e2df" : "#7adbea";
  return (
    <group
      position={place.position}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(place);
      }}
    >
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[width + 0.34, 0.16, depth + 0.34]} />
        <meshStandardMaterial
          color={
            emergencyHighlighted ? "#db6959" : selected ? "#85e6df" : "#56696b"
          }
          metalness={0.12}
          roughness={0.78}
        />
      </mesh>
      {emergencyHighlighted && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.18, 0]}>
          <ringGeometry
            args={[
              Math.max(width, depth) * 0.58,
              Math.max(width, depth) * 0.74,
              48,
            ]}
          />
          <meshBasicMaterial
            color="#ff655d"
            transparent
            opacity={0.82}
            side={2}
          />
        </mesh>
      )}
      {isGate ? (
        <>
          <mesh position={[-width * 0.38, height * 0.42, 0]} castShadow>
            <boxGeometry args={[0.28, height * 0.84, depth]} />
            <meshStandardMaterial color={place.color} />
          </mesh>
          <mesh position={[width * 0.38, height * 0.42, 0]} castShadow>
            <boxGeometry args={[0.28, height * 0.84, depth]} />
            <meshStandardMaterial color={place.color} />
          </mesh>
          <mesh position={[0, height * 0.85, 0]} castShadow>
            <boxGeometry args={[width, height * 0.3, depth]} />
            <meshStandardMaterial
              color={place.color}
              emissive={selected ? "#47dfcc" : "#000000"}
              emissiveIntensity={selected ? 0.25 : 0}
            />
          </mesh>
          <mesh position={[0, height * 0.52, depth / 2 + 0.025]}>
            <boxGeometry args={[0.56, 0.52, 0.04]} />
            <meshStandardMaterial
              color="#d7c899"
              emissive={dayMode ? "#000000" : "#f2c96b"}
              emissiveIntensity={dayMode ? 0 : 0.55}
            />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, height / 2 + 0.12, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial
              color={place.color}
              emissive={
                selected
                  ? "#65e8df"
                  : emergencyHighlighted
                    ? "#ff6e60"
                    : "#000000"
              }
              emissiveIntensity={
                selected ? 0.16 : emergencyHighlighted ? 0.2 : 0
              }
              roughness={0.72}
              metalness={0.04}
            />
          </mesh>
          <mesh position={[0, height + 0.2, 0]} castShadow>
            <boxGeometry args={[width + 0.14, 0.18, depth + 0.14]} />
            <meshStandardMaterial
              color={selected ? "#85e6df" : dayMode ? "#b8c8bd" : "#596c6e"}
              roughness={0.72}
            />
          </mesh>
          <mesh position={[0, 0.28, depth / 2 + 0.025]}>
            <boxGeometry args={[0.34, 0.48, 0.05]} />
            <meshStandardMaterial color="#263f45" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.59, depth / 2 + 0.12]} castShadow>
            <boxGeometry args={[width * 0.43, 0.08, 0.32]} />
            <meshStandardMaterial color={selected ? "#9be3d5" : "#859a92"} />
          </mesh>
          {Array.from({ length: floorCount }, (_, floor) => (
            <group
              key={`floor-${floor}`}
              position={[0, 0.42 + floor * (height / floorCount), 0]}
            >
              {[-1, 0, 1].map((column) => (
                <mesh
                  key={`front-${column}`}
                  position={[column * width * 0.28, 0, depth / 2 + 0.018]}
                >
                  <boxGeometry
                    args={[Math.min(0.3, width * 0.2), 0.28, 0.035]}
                  />
                  <meshStandardMaterial
                    color={windowsColor}
                    emissive={windowsColor}
                    emissiveIntensity={
                      floor === selectedFloor
                        ? dayMode
                          ? 0.35
                          : 1.1
                        : dayMode
                          ? 0.08
                          : 0.45
                    }
                    metalness={0.2}
                    roughness={0.28}
                  />
                </mesh>
              ))}
              {[-1, 1].map((side) => (
                <mesh
                  key={`side-${side}`}
                  position={[side * (width / 2 + 0.018), 0, 0]}
                >
                  <boxGeometry args={[0.035, 0.28, depth * 0.22]} />
                  <meshStandardMaterial
                    color={windowsColor}
                    emissive={windowsColor}
                    emissiveIntensity={
                      floor === selectedFloor
                        ? dayMode
                          ? 0.3
                          : 0.9
                        : dayMode
                          ? 0.06
                          : 0.35
                    }
                    metalness={0.18}
                    roughness={0.3}
                  />
                </mesh>
              ))}
              {floor > 0 && (
                <mesh position={[0, -height / (floorCount * 2), 0]}>
                  <boxGeometry args={[width + 0.045, 0.045, depth + 0.045]} />
                  <meshStandardMaterial
                    color={dayMode ? "#9caca3" : "#4f5e60"}
                  />
                </mesh>
              )}
            </group>
          ))}
          {width > 1.8 && (
            <group position={[0, height + 0.3, 0]}>
              <mesh position={[-width * 0.24, 0.08, 0]} castShadow>
                <boxGeometry args={[0.34, 0.16, 0.32]} />
                <meshStandardMaterial color="#697c7a" />
              </mesh>
              <mesh position={[width * 0.2, 0.08, 0]} castShadow>
                <boxGeometry args={[0.28, 0.16, 0.25]} />
                <meshStandardMaterial color="#697c7a" />
              </mesh>
            </group>
          )}
        </>
      )}
      <Html
        position={[0, height + 0.55, 0]}
        center
        distanceFactor={13}
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`campus-map-label ${selected ? "active" : ""} ${emergencyHighlighted ? "emergency-highlight" : ""}`}
        >
          {place.name}
        </div>
      </Html>
    </group>
  );
}

function CampusTree({ position, dayMode }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.48, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 0.95, 7]} />
        <meshStandardMaterial color="#765c43" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <dodecahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial
          color={dayMode ? "#56876a" : "#315b57"}
          roughness={0.9}
        />
      </mesh>
      <mesh position={[0.1, 1.55, 0.05]} castShadow>
        <dodecahedronGeometry args={[0.43, 1]} />
        <meshStandardMaterial
          color={dayMode ? "#6e9a69" : "#3a6c62"}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}

function YouAreHereMarker({ position, animate }) {
  const ringRef = useRef(null);
  useFrame(({ clock }) => {
    if (!animate || !ringRef.current) return;
    const pulse = 0.82 + ((Math.sin(clock.elapsedTime * 2.4) + 1) / 2) * 0.22;
    ringRef.current.scale.setScalar(pulse);
    ringRef.current.material.opacity =
      0.5 + ((Math.sin(clock.elapsedTime * 2.4) + 1) / 2) * 0.4;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.36, 36]} />
        <meshBasicMaterial color="#52e4ff" transparent opacity={0.9} side={2} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshStandardMaterial
          color="#b5f6ff"
          emissive="#38d9ff"
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh
        ref={ringRef}
        position={[0, 0.12, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.42, 0.47, 36]} />
        <meshBasicMaterial color="#52e4ff" transparent opacity={0.8} side={2} />
      </mesh>
      <Html
        position={[0, 0.95, 0]}
        center
        distanceFactor={12}
        style={{ pointerEvents: "none" }}
      >
        <div className="campus-map-here-label">You Are Here</div>
      </Html>
    </group>
  );
}

function CampusRoutePulse({ points, animate }) {
  const pulseRef = useRef(null);
  useFrame(({ clock }) => {
    if (!animate || !pulseRef.current || points.length < 2) return;
    const progress = (clock.elapsedTime * 0.18) % 1;
    const segmentProgress = progress * (points.length - 1);
    const segment = Math.min(points.length - 2, Math.floor(segmentProgress));
    const amount = segmentProgress - segment;
    const start = points[segment],
      end = points[segment + 1];
    pulseRef.current.position.set(
      start[0] + (end[0] - start[0]) * amount,
      start[1] + 0.06,
      start[2] + (end[2] - start[2]) * amount,
    );
  });
  return (
    <mesh ref={pulseRef}>
      <sphereGeometry args={[0.105, 12, 10]} />
      <meshBasicMaterial color="#e2fff6" />
    </mesh>
  );
}

function CampusMapScene({
  selected,
  onSelect,
  controlsRef,
  autoRotate,
  selectedFloor,
  dayMode,
  lowConnectivity,
  emergencyMode,
  emergencyTargetIds,
}) {
  const gate = campusMapLocations.find((place) => place.id === "gate");
  const routePoints =
    selected.id === "gate"
      ? []
      : [
          [gate.position[0], 0.07, gate.position[2]],
          [gate.position[0], 0.07, 1.6],
          [selected.position[0], 0.07, 1.6],
          [selected.position[0], 0.07, selected.position[2]],
        ];
  const herePosition = [0, 0, 5.15];
  const background = dayMode ? "#a9c6c0" : "#101b2b";
  return (
    <>
      <ambientLight intensity={dayMode ? 1.2 : 0.52} />
      <directionalLight
        position={[5, 12, 7]}
        intensity={dayMode ? 2.2 : 0.72}
        color={dayMode ? "#fff0d5" : "#9bb8ff"}
        castShadow
      />
      <hemisphereLight
        args={
          dayMode ? ["#d6ecec", "#5c7059", 0.65] : ["#6680a5", "#111823", 0.38]
        }
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.18, 0]}
        receiveShadow
      >
        <planeGeometry args={[19, 16]} />
        <meshStandardMaterial
          color={dayMode ? "#78977f" : "#253b3d"}
          roughness={0.96}
        />
      </mesh>
      <gridHelper
        args={[
          19,
          19,
          dayMode ? "#a9b9a1" : "#476064",
          dayMode ? "#849c88" : "#31484b",
        ]}
        position={[0, -0.16, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 1.5]}>
        <planeGeometry args={[18, 0.95]} />
        <meshStandardMaterial
          color={dayMode ? "#666e6b" : "#415052"}
          roughness={0.85}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.8, -0.095, 0.5]}>
        <planeGeometry args={[0.86, 14]} />
        <meshStandardMaterial
          color={dayMode ? "#666e6b" : "#415052"}
          roughness={0.85}
        />
      </mesh>
      <Line
        points={[
          [-8, -0.08, 1.5],
          [8, -0.08, 1.5],
        ]}
        color={dayMode ? "#d9c996" : "#b5a86f"}
        lineWidth={1.2}
        dashed
        dashSize={0.34}
        gapSize={0.28}
      />
      {[
        [-7, 0, -4.5],
        [7.2, 0, -4.6],
        [7.1, 0, 4.4],
        [-7.6, 0, 5.6],
        [5.2, 0, 6.1],
      ].map((position, index) => (
        <CampusTree
          key={`tree-${index}`}
          position={position}
          dayMode={dayMode}
        />
      ))}
      {campusMapLocations.map((place) => (
        <CampusMapBuilding
          key={place.id}
          place={place}
          selected={selected.id === place.id}
          selectedFloor={selectedFloor}
          dayMode={dayMode}
          emergencyHighlighted={
            emergencyMode && emergencyTargetIds.includes(place.id)
          }
          onSelect={onSelect}
        />
      ))}
      <YouAreHereMarker position={herePosition} animate={!lowConnectivity} />
      {routePoints.length > 1 && (
        <>
          <Line
            points={routePoints}
            color={dayMode ? "#1fbc9e" : "#62e8d0"}
            lineWidth={4}
            dashed
            dashSize={0.32}
            gapSize={0.17}
            transparent
            opacity={0.95}
          />
          {!lowConnectivity && (
            <CampusRoutePulse points={routePoints} animate />
          )}
        </>
      )}
      <color attach="background" args={[background]} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, 0.6, 0]}
        minDistance={9}
        maxDistance={28}
        minPolarAngle={0.38}
        maxPolarAngle={1.42}
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoRotate}
        autoRotateSpeed={0.65}
      />
    </>
  );
}

function CampusMap({ lowConnectivity = false }) {
  const [selected, setSelected] = useState(campusMapLocations[0]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [dayMode, setDayMode] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const controlsRef = useRef(null);
  const categories = [
    "All categories",
    ...new Set(campusMapLocations.map((place) => place.category)),
  ];
  const filtered = campusMapLocations.filter(
    (place) =>
      `${place.name} ${place.category} ${place.detail} ${(place.facilities || []).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (categoryFilter === "All categories" ||
        place.category === categoryFilter),
  );
  const emergencyTargets = ["Medical", "Security"].map((role) => {
    const candidates = campusMapLocations.filter(
      (place) => place.emergencyRole === role,
    );
    const here = [0, 0, 5.15];
    return candidates
      .map((place) => ({
        ...place,
        emergencyRole: role,
        distance: Math.hypot(
          place.position[0] - here[0],
          place.position[2] - here[2],
        ),
      }))
      .sort((a, b) => a.distance - b.distance)[0];
  });
  const emergencyTargetIds = emergencyTargets.map((place) => place.id);
  const selectLocation = (placeOrId) => {
    const place =
      typeof placeOrId === "string"
        ? campusMapLocations.find((item) => item.id === placeOrId)
        : placeOrId;
    if (place) {
      setSelected(place);
      setSelectedFloor(0);
    }
  };
  const zoomIn = () => {
    controlsRef.current?.dollyIn(1.25);
    controlsRef.current?.update();
  };
  const zoomOut = () => {
    controlsRef.current?.dollyOut(1.25);
    controlsRef.current?.update();
  };
  const resetView = () => {
    controlsRef.current?.reset();
    setAutoRotate(false);
  };
  const toggleEmergency = () => {
    setEmergencyMode((value) => !value);
    if (!emergencyMode)
      selectLocation(
        emergencyTargets.find((place) => place.emergencyRole === "Medical"),
      );
  };
  return (
    <>
      <PageTitle
        eyebrow="CAMPUS NAVIGATION"
        title="Explore Campus in 3D"
        desc="Select a building to view campus services and directions from the Main Gate."
      />
      <div className="map-layout campus-map-layout">
        <section className="panel map-panel campus-map-panel">
          <div className="map-toolbar campus-map-toolbar">
            <div className="search campus-map-search">
              <Search />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search campus location"
                aria-label="Search campus location"
              />
            </div>
            <select
              className="campus-map-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <select
              className="campus-map-select"
              value={selected.id}
              onChange={(event) => selectLocation(event.target.value)}
              aria-label="Select campus location"
            >
              {filtered.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
            <div className="campus-map-controls">
              <button
                className={`icon-btn ${emergencyMode ? "selected" : ""}`}
                type="button"
                onClick={toggleEmergency}
                title={
                  emergencyMode
                    ? "Turn off emergency mode"
                    : "Highlight nearest medical and security"
                }
                aria-label={
                  emergencyMode ? "Turn off emergency mode" : "Emergency mode"
                }
              >
                <AlertTriangle />
              </button>
              <button
                className="icon-btn"
                type="button"
                onClick={() => setDayMode((value) => !value)}
                title={dayMode ? "Switch to night view" : "Switch to day view"}
                aria-label={
                  dayMode ? "Switch to night view" : "Switch to day view"
                }
              >
                {dayMode ? <Moon /> : <Sun />}
              </button>
              <button
                className="icon-btn"
                type="button"
                onClick={zoomIn}
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn />
              </button>
              <button
                className="icon-btn"
                type="button"
                onClick={zoomOut}
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut />
              </button>
              <button
                className={`icon-btn ${autoRotate ? "selected" : ""}`}
                type="button"
                onClick={() => setAutoRotate((value) => !value)}
                title={autoRotate ? "Stop rotation" : "Rotate map"}
                aria-label={autoRotate ? "Stop rotation" : "Rotate map"}
              >
                <RotateCcw />
              </button>
              <button
                className="icon-btn"
                type="button"
                onClick={resetView}
                title="Reset view"
                aria-label="Reset view"
              >
                <RefreshCw />
              </button>
            </div>
          </div>
          <div className="campus-map-canvas-wrap">
            <Canvas
              className="campus-map-canvas"
              frameloop={lowConnectivity ? "demand" : "always"}
              dpr={lowConnectivity ? 1 : [1, 1.5]}
              camera={{ position: [11, 13, 15], fov: 38 }}
              shadows={!lowConnectivity}
              gl={{ antialias: !lowConnectivity, alpha: false }}
            >
              <CampusMapScene
                selected={selected}
                onSelect={selectLocation}
                controlsRef={controlsRef}
                autoRotate={autoRotate && !lowConnectivity}
                selectedFloor={selectedFloor}
                dayMode={dayMode}
                lowConnectivity={lowConnectivity}
                emergencyMode={emergencyMode}
                emergencyTargetIds={emergencyTargetIds}
              />
            </Canvas>
            <div className="campus-map-compass" aria-hidden="true">
              <span>N</span>
              <i />
            </div>
          </div>
        </section>
        <section className="panel location-panel campus-map-details">
          <div className="eyebrow">SELECTED LOCATION</div>
          <div className="location-big">
            <Building2 />
          </div>
          <h2>{selected.name}</h2>
          <p>{selected.detail}</p>
          <div className="loc-details">
            <span>
              Category <b>{selected.category}</b>
            </span>
            <span>
              Walking distance{" "}
              <b>
                {selected.distanceMeters === 0
                  ? "0 m"
                  : `${selected.distanceMeters} m`}
              </b>
            </span>
            <span>
              Estimated time <b>{selected.walk}</b>
            </span>
          </div>
          {selected.floorCount > 1 && (
            <label className="campus-map-floor">
              Floor
              <select
                value={selectedFloor}
                onChange={(event) =>
                  setSelectedFloor(Number(event.target.value))
                }
              >
                <option value={0}>Ground floor</option>
                {Array.from({ length: selected.floorCount - 1 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    Floor {index + 1}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="campus-map-facilities">
            <b>Facilities</b>
            <div>
              {selected.facilities.map((facility) => (
                <span key={facility}>{facility}</span>
              ))}
            </div>
            <small>
              <Clock3 size={13} />
              {selected.hours}
            </small>
          </div>
          <div className="campus-map-route">
            <span className="route-dot" />
            <div>
              <b>
                {selected.id === "gate"
                  ? "You are at the Main Gate"
                  : `Route from Main Gate to ${selected.name}`}
              </b>
              <small>
                {selected.id === "gate"
                  ? "The demo position is marked near the Main Gate."
                  : `Follow the highlighted path · ${selected.distanceMeters} m · ${selected.walk}`}
              </small>
            </div>
          </div>
          {emergencyMode && (
            <div className="campus-map-emergency-results">
              <b>Nearest emergency support</b>
              {emergencyTargets.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => selectLocation(place)}
                >
                  <AlertTriangle size={14} />
                  <span>
                    {place.emergencyRole}
                    <small>
                      {place.name} · {Math.round(place.distance * 68)} m
                    </small>
                  </span>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          )}
          <div className="location-list campus-map-location-list">
            {filtered.map((place) => (
              <button
                className={place.id === selected.id ? "sel" : ""}
                onClick={() => selectLocation(place)}
                key={place.id}
              >
                <Building2 size={16} />
                {place.name}
                <ChevronRight />
              </button>
            ))}
            {!filtered.length && (
              <div className="demo-note">
                No campus location matches that search.
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function IssuePage({ role, issues, setIssues }) {
  const [form, setForm] = useState({
    category: "Electrical / Wi-Fi",
    location: "Academic Block",
    description: "",
  });
  const [done, setDone] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    const ticket = uid("CMP");
    const item = {
      ...form,
      id: ticket,
      date: new Date().toISOString().slice(0, 10),
      status: "Open",
    };
    setIssues([item, ...issues]);
    setDone(ticket);
    setForm({ ...form, description: "" });
  };
  return (
    <>
      <PageTitle
        eyebrow={role === "admin" ? "ADMIN Â· ISSUES" : "CAMPUS SERVICES"}
        title={role === "admin" ? "Issue Reports" : "Report an Issue"}
        desc={
          role === "admin"
            ? "Review campus reports submitted by students."
            : "Help improve your campus by reporting a problem."
        }
      />
      {role === "student" ? (
        <section className="panel issue-form">
          <form onSubmit={submit}>
            <div className="form-grid">
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  {[
                    "Electrical / Wi-Fi",
                    "Cleanliness",
                    "Furniture",
                    "Water Supply",
                    "Other",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Location
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Description
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe the issue clearlyâ€¦"
              />
            </label>
            <label className="upload">
              <input type="file" accept="image/*" capture="environment" />
              <Camera /> Add photo / camera capture
            </label>
            <button className="primary big">
              <AlertTriangle /> Submit Issue
            </button>
          </form>
          {done && (
            <div className="success-box">
              <CheckCircle2 /> Issue Reported Successfully Â· Ticket #{done}
            </div>
          )}
        </section>
      ) : (
        <section className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {issues.length ? (
                  issues.map((x) => (
                    <tr key={x.id}>
                      <td>
                        <b>#{x.id}</b>
                      </td>
                      <td>{x.category}</td>
                      <td>{x.location}</td>
                      <td>{x.description}</td>
                      <td>
                        <span className="status live">{x.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No submitted reports yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

function Monitor({ attendance, session }) {
  const present = attendance.filter((x) => x.status === "Present").length;
  return (
    <>
      <PageTitle
        eyebrow="ADMIN Â· LIVE"
        title="Live Attendance Monitoring"
        desc="Real-time-looking monitoring built from locally stored attendance records."
        actions={
          <button className="ghost">
            <RefreshCw /> Refresh
          </button>
        }
      />
      <div className="stats-grid">
        <Stat
          icon={QrCode}
          label="Active Session"
          value={session ? "01" : "00"}
          sub={session?.id || "No active QR session"}
        />
        <Stat
          icon={Users}
          label="Total Students"
          value="50"
          sub="Current class"
        />
        <Stat
          icon={CheckCircle2}
          label="Present"
          value={present}
          sub="Verified records"
        />
        <Stat
          icon={Activity}
          label="Attendance"
          value="92%"
          sub="Live estimate"
        />
      </div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Presence Feed</h3>
            <p>Students verified in the current demo environment</p>
          </div>
          <span className="live-dot">LIVE</span>
        </div>
        <div className="feed">
          {["Neha Kapoor", "Aman Deep", "Priya Singh", "Sohan Lal"].map(
            (n, i) => (
              <div className="feed-row" key={n}>
                <div className="avatar small">
                  {["NK", "AD", "PS", "SL"][i]}
                </div>
                <div>
                  <b>{n}</b>
                  <span>
                    CSE2026-10{24 + i} Â· {i % 2 ? "CSE-A" : "CSE-B"}
                  </span>
                </div>
                <span className="verified-label">
                  <CheckCircle2 /> Verified
                </span>
                <small>{i + 1} min ago</small>
              </div>
            ),
          )}
        </div>
      </section>
    </>
  );
}
function StudentRecords() {
  const [query, setQuery] = useState("");
  const students = [
    ["CSE2026-1024", "Neha Kapoor", "CSE-A", "3rd Year", "Present", "94%"],
    ["CSE2026-1025", "Aman Deep", "CSE-A", "3rd Year", "Present", "89%"],
    ["CSE2026-1026", "Priya Singh", "CSE-B", "3rd Year", "Present", "92%"],
    ["CSE2026-1027", "Sohan Lal", "CSE-B", "3rd Year", "Absent", "76%"],
    ["CSE2026-1028", "Kavya Nair", "CSE-C", "3rd Year", "Present", "96%"],
    ["CSE2026-1029", "Arjun Rao", "CSE-C", "3rd Year", "Present", "84%"],
  ];
  const filtered = students.filter((student) =>
    student.join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="ADMIN Â· STUDENTS"
        title="Student Records"
        desc="View enrollment details and academic attendance records."
        actions={
          <button className="ghost" onClick={() => window.print()}>
            <Printer /> Print records
          </button>
        }
      />
      <div className="stats-grid">
        <Stat
          icon={Users}
          label="Total students"
          value="1,240"
          sub="Across all departments"
        />
        <Stat
          icon={CheckCircle2}
          label="Active students"
          value="1,198"
          sub="Currently enrolled"
        />
        <Stat
          icon={Activity}
          label="Average attendance"
          value="91%"
          sub="This semester"
        />
        <Stat
          icon={Clock3}
          label="Needs attention"
          value="42"
          sub="Below 75% attendance"
        />
      </div>
      <section className="panel student-records-panel">
        <div className="filters">
          <div className="search">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, ID or section..."
            />
          </div>
          <span className="attendance-pill">
            Showing <b>{filtered.length}</b> of 1,240
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Section</th>
                <th>Year</th>
                <th>Today</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student[0]}>
                  <td>
                    <b>{student[0]}</b>
                  </td>
                  <td>{student[1]}</td>
                  <td>{student[2]}</td>
                  <td>{student[3]}</td>
                  <td>
                    <span
                      className={`status ${student[4] === "Present" ? "present" : "absent"}`}
                    >
                      {student[4]}
                    </span>
                  </td>
                  <td>
                    <b>{student[5]}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
function StudentMarks() {
  const [query, setQuery] = useState("");
  const subjects = [
    "Data Structures",
    "Operating Systems",
    "DBMS",
    "Computer Networks",
    "Computer Lab",
  ];
  const students = [
    ["CSE2026-1024", "Neha Kapoor", [88, 91, 86, 94, 96]],
    ["CSE2026-1025", "Aman Deep", [79, 84, 81, 88, 90]],
    ["CSE2026-1026", "Priya Singh", [92, 95, 89, 91, 94]],
    ["CSE2026-1027", "Sohan Lal", [68, 74, 71, 79, 76]],
    ["CSE2026-1028", "Kavya Nair", [96, 93, 98, 95, 97]],
    ["CSE2026-1029", "Arjun Rao", [82, 78, 85, 80, 87]],
  ];
  const filtered = students.filter((student) =>
    student.join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  const average =
    students
      .flatMap((student) => student[2])
      .reduce((total, mark) => total + mark, 0) /
    (students.length * subjects.length);
  return (
    <>
      <PageTitle
        eyebrow="ADMIN Â· ACADEMICS"
        title="Student Marks"
        desc="Review marks for every student across every registered subject."
        actions={
          <button className="ghost" onClick={() => window.print()}>
            <Printer /> Print marks
          </button>
        }
      />
      <div className="stats-grid">
        <Stat
          icon={ClipboardList}
          label="Subjects"
          value={subjects.length}
          sub="Current semester"
        />
        <Stat
          icon={Users}
          label="Students graded"
          value={students.length}
          sub="Records available"
        />
        <Stat
          icon={BarChart3}
          label="Class average"
          value={`${average.toFixed(1)}%`}
          sub="All subjects"
        />
        <Stat
          icon={CheckCircle2}
          label="Passing records"
          value="94%"
          sub="Above 40 marks"
        />
      </div>
      <section className="panel marks-panel">
        <div className="filters">
          <div className="search">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search student or ID..."
            />
          </div>
          <span className="attendance-pill">{subjects.length} subjects</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                {subjects.map((subject) => (
                  <th key={subject}>{subject}</th>
                ))}
                <th>Total</th>
                <th>Average</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const total = student[2].reduce((sum, mark) => sum + mark, 0);
                const avg = total / subjects.length;
                const grade =
                  avg >= 90 ? "A+" : avg >= 80 ? "A" : avg >= 70 ? "B" : "C";
                return (
                  <tr key={student[0]}>
                    <td>
                      <b>{student[1]}</b>
                      <small className="marks-id">{student[0]}</small>
                    </td>
                    {student[2].map((mark, index) => (
                      <td key={subjects[index]}>
                        <b>{mark}</b>
                      </td>
                    ))}
                    <td>
                      <b>{total}/500</b>
                    </td>
                    <td>
                      <b>{avg.toFixed(1)}%</b>
                    </td>
                    <td>
                      <span className="status present">{grade}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
function Manage() {
  return (
    <>
      <PageTitle
        eyebrow="ADMIN Â· CAMPUS"
        title="Manage Campus"
        desc="Manage the campus directory used by the interactive map."
      />
      <section className="panel">
        <div className="manage-grid">
          {locations.map((x) => (
            <div className="manage-card" key={x[0]}>
              <Building2 />
              <div>
                <b>{x[0]}</b>
                <span>
                  {x[1]} Â· {x[2]}
                </span>
              </div>
              <button className="icon-btn">
                <ChevronRight />
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
function TeacherSalaries() {
  const teachers = [
    [
      "Dr. Amit Singh",
      "HOD Â· CSE",
      "EMP-001",
      "INR 125,000",
      "Paid",
      "2026-09-01",
    ],
    [
      "Dr. Sharma",
      "Associate Professor",
      "EMP-014",
      "INR 98,000",
      "Paid",
      "2026-09-01",
    ],
    [
      "Prof. Verma",
      "Assistant Professor",
      "EMP-022",
      "INR 82,500",
      "Processing",
      "2026-09-01",
    ],
    [
      "Dr. Mehta",
      "Assistant Professor",
      "EMP-031",
      "INR 86,000",
      "Paid",
      "2026-09-01",
    ],
    [
      "Dr. Gupta",
      "Lab Coordinator",
      "EMP-044",
      "INR 68,500",
      "Pending",
      "2026-09-01",
    ],
  ];
  return (
    <>
      <PageTitle
        eyebrow="ADMIN Â· PAYROLL"
        title="Teacher Salary Details"
        desc="Review monthly salary records and payroll status for teaching staff."
        actions={
          <button className="ghost" onClick={() => window.print()}>
            <Printer /> Print payroll
          </button>
        }
      />
      <div className="stats-grid">
        <Stat
          icon={CircleDollarSign}
          label="Monthly payroll"
          value="INR 460K"
          sub="Current month"
        />
        <Stat
          icon={Users}
          label="Teaching staff"
          value={teachers.length}
          sub="Active records"
        />
        <Stat
          icon={CheckCircle2}
          label="Paid records"
          value={teachers.filter((x) => x[4] === "Paid").length}
          sub="This pay cycle"
        />
        <Stat
          icon={Clock3}
          label="Pending review"
          value={teachers.filter((x) => x[4] !== "Paid").length}
          sub="Needs attention"
        />
      </div>
      <section className="panel salary-panel">
        <div className="panel-head">
          <div>
            <h3>Monthly salary register</h3>
            <p>September 2026 payroll overview</p>
          </div>
          <span className="attendance-pill">September 2026</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Role</th>
                <th>Employee ID</th>
                <th>Net salary</th>
                <th>Pay date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher[2]}>
                  <td>
                    <b>{teacher[0]}</b>
                  </td>
                  <td>{teacher[1]}</td>
                  <td>{teacher[2]}</td>
                  <td>
                    <b>{teacher[3]}</b>
                  </td>
                  <td>{teacher[5]}</td>
                  <td>
                    <span
                      className={`status ${teacher[4] === "Paid" ? "present" : teacher[4] === "Processing" ? "upcoming" : "absent"}`}
                    >
                      {teacher[4]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
function Notifications({ data, setData }) {
  return (
    <>
      <PageTitle
        eyebrow="CAMPUS CONNECT"
        title="Notifications"
        desc="Announcements and important campus updates."
        actions={
          <button
            className="ghost"
            onClick={() => setData(data.map((n) => ({ ...n, read: true })))}
          >
            Mark all read
          </button>
        }
      />
      <section className="panel notification-list">
        {data.map((n) => (
          <div className={`notification ${n.read ? "read" : ""}`} key={n.id}>
            <div className="notif-icon">
              <Bell />
            </div>
            <div>
              <b>{n.title}</b>
              <p>{n.text}</p>
            </div>
            {!n.read && (
              <button
                className="ghost"
                onClick={() =>
                  setData(
                    data.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                  )
                }
              >
                Mark read
              </button>
            )}
          </div>
        ))}
      </section>
    </>
  );
}
function SettingsPage({
  theme,
  setTheme,
  logout,
  profile,
  role,
  liteMode,
  setLiteMode,
}) {
  return (
    <>
      <PageTitle
        eyebrow="PREFERENCES"
        title="Settings"
        desc="Control your Campus Connect prototype experience."
      />
      <section className="panel settings">
        <div className="setting-row">
          <div>
            <b>Profile</b>
            <span>
              {profile.name} Â·{" "}
              {role === "admin"
                ? "System Administrator"
                : role === "warden"
                  ? "Warden"
                  : "Face verified student"}
            </span>
          </div>
          <UserRound />
        </div>
        <div className="setting-row">
          <div>
            <b>Theme preference</b>
            <span>Switch between light and dark interface.</span>
          </div>
          <button
            className="toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Moon /> : <Sun />}
            <span>{theme === "dark" ? "Dark" : "Light"}</span>
          </button>
        </div>
        {role === "student" && (
          <div className="setting-row">
            <div>
              <b>Lite Mode</b>
              <span>
                Reduce animation and visual effects to keep essential pages
                lighter.
              </span>
            </div>
            <button
              type="button"
              className={`toggle ${liteMode ? "lite-toggle-enabled" : ""}`}
              role="switch"
              aria-checked={liteMode}
              onClick={() => setLiteMode((value) => !value)}
            >
              <Activity size={16} />
              <span>Lite Mode {liteMode ? "ON" : "OFF"}</span>
            </button>
          </div>
        )}
        <div className="setting-row">
          <div>
            <b>Camera permission</b>
            <span>
              Camera is requested only during demo identity verification and QR
              scanning.
            </span>
          </div>
          <Camera />
        </div>
        <div className="setting-row">
          <div>
            <b>Prototype storage</b>
            <span>
              Attendance, issues and settings are stored in this browser using
              localStorage.
            </span>
          </div>
          <ShieldCheck />
        </div>
        <button className="danger big" onClick={logout}>
          <LogOut /> Logout
        </button>
      </section>
    </>
  );
}

function StudentAssistedAccessPage({
  attendance,
  complaints,
  notices,
  gatePasses,
}) {
  const services = [
    "Attendance Assistance",
    "Complaints",
    "Notices",
    "Leave/Gate Pass Status",
  ];
  const [studentId, setStudentId] = useState("");
  const [service, setService] = useState(services[0]);
  const [verified, setVerified] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    if (!studentId.trim() || !verified) return;
    setSubmitted(true);
  };
  const requestedId = studentId.trim().toLowerCase();
  const matching = (items, key = "studentId") =>
    items.filter(
      (item) =>
        String(item[key] || "")
          .trim()
          .toLowerCase() === requestedId,
    );
  const attendanceRecords = matching(
    readStudentAttendance(studentId.trim()) || attendance,
  );
  const complaintRecords = [
    ...matching(complaints),
    ...matching(load("cc_issues", [])),
  ];
  const studentNotices = notices.filter(
    (notice) => notice.target === "All" || notice.target === "Hostel Students",
  );
  const passRecords = matching(gatePasses);

  return (
    <>
      <PageTitle
        eyebrow="STAFF-ASSISTED STUDENT SERVICE"
        title="Assisted Access / No Smartphone?"
        desc="View one essential student service after staff verifies the student's physical ID."
      />
      <section className="panel assisted-access-panel">
        <div className="panel-head">
          <div>
            <h3>Service Lookup</h3>
            <p>
              This is a limited, read-only assistance view. It does not sign in
              as the student or expose account controls.
            </p>
          </div>
          <ShieldCheck size={20} />
        </div>
        <form className="cf-form" onSubmit={submit}>
          <label>
            Student ID / Roll No
            <input
              value={studentId}
              onChange={(event) => {
                setStudentId(event.target.value);
                setSubmitted(false);
              }}
              autoComplete="off"
              required
            />
          </label>
          <label>
            Essential Service
            <select
              value={service}
              onChange={(event) => {
                setService(event.target.value);
                setSubmitted(false);
              }}
            >
              {services.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="assisted-id-check">
            <input
              type="checkbox"
              checked={verified}
              onChange={(event) => {
                setVerified(event.target.checked);
                setSubmitted(false);
              }}
            />{" "}
            I am authorized staff and have physically verified this student's
            ID.
          </label>
          <button type="submit" className="primary big" disabled={!verified}>
            <ShieldCheck size={16} /> Show Selected Service
          </button>
        </form>
      </section>
      {submitted && (
        <section className="panel lower assisted-access-results">
          <div className="panel-head">
            <div>
              <h3>{service}</h3>
              <p>Student ID: {studentId.trim()} · Read-only assisted view</p>
            </div>
            <span className="attendance-pill">Limited access</span>
          </div>
          {service === "Attendance Assistance" &&
            (attendanceRecords.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Class</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((item, index) => (
                      <tr key={item.session || `${item.date}-${index}`}>
                        <td>{item.date || "-"}</td>
                        <td>{item.subject || "Class"}</td>
                        <td>{item.time || "-"}</td>
                        <td>{item.status || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No attendance records found for this ID.</p>
            ))}
          {service === "Complaints" &&
            (complaintRecords.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Issue</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaintRecords.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <b>#{item.id}</b>
                        </td>
                        <td>{item.description || "Issue report"}</td>
                        <td>{item.aiCategory || item.category || "General"}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No complaint records found for this ID.</p>
            ))}
          {service === "Notices" &&
            (studentNotices.length ? (
              <div className="account-list">
                {studentNotices.map((notice) => (
                  <div className="account-row" key={notice.id}>
                    <div className="account-main">
                      <b>{notice.title}</b>
                      <span>{notice.body}</span>
                      <small>{notice.date || ""}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No notices are available.</p>
            ))}
          {service === "Leave/Gate Pass Status" &&
            (passRecords.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Request</th>
                      <th>Dates / Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passRecords.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <b>
                            {item.requestType || "Gate Pass"} · #{item.id}
                          </b>
                        </td>
                        <td>
                          {item.requestType === "Leave"
                            ? `${item.date || "-"} to ${item.returnDate || "-"}`
                            : `${item.time || "-"} to ${item.returnTime || "-"}`}
                        </td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No Leave/Gate Pass requests found for this ID.</p>
            ))}
        </section>
      )}
    </>
  );
}

// ============================================================================
// CAMPUSFLOW WORKFLOWS & ACCESSIBILITY COMPONENTS
// ============================================================================

function WorkflowStepper({ steps, currentStep, color = "blue" }) {
  return (
    <div className={`workflow-stepper stepper-${color}`}>
      <div className="stepper-track">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <div
              key={idx}
              className={`stepper-node ${isDone ? "done" : isCurrent ? "active" : "pending"}`}
            >
              <div className="stepper-dot">
                {isDone ? <CheckCircle2 size={13} /> : <span>{idx + 1}</span>}
              </div>
              <span className="stepper-label">{step}</span>
              {idx < steps.length - 1 && <div className="stepper-line" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AccountManagement({ targetRole, currentProfile }) {
  const [accounts, setAccounts] = useState(() =>
    Object.entries(load("cc_face_profiles", {})).filter(
      ([, account]) => account.role === targetRole,
    ),
  );
  const [editingKey, setEditingKey] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    identifier: "",
    department: "",
    password: "",
  });
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const title =
    targetRole === "teacher"
      ? "Teacher Management"
      : targetRole === "warden"
        ? "Warden Management"
        : "Admin Management";
  const reset = () => {
    setEditingKey(null);
    setForm({
      name: "",
      email: "",
      identifier: "",
      department: "",
      password: "",
    });
    setFaceDescriptor(null);
    setMessage("");
  };
  const reload = () =>
    setAccounts(
      Object.entries(load("cc_face_profiles", {})).filter(
        ([, account]) => account.role === targetRole,
      ),
    );
  useEffect(() => {
    const rows = Array.from(
      document.querySelectorAll(".account-management-grid .account-row"),
    );
    rows.forEach((row, index) => {
      const account = accounts[index];
      if (!account) return;
      const main = row.querySelector(".account-main");
      if (main && !main.querySelector(".account-password-mask")) {
        const masked = document.createElement("small");
        masked.className = "account-password-mask";
        masked.textContent = "Password Â· â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢";
        main.append(masked);
      }
      if (!row.querySelector(".reset-password-btn")) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "ghost mini-btn reset-password-btn";
        button.textContent = "Reset Password";
        button.onclick = () => resetAccountPassword(account[0], account[1]);
        const deleteButton = row.querySelector(".danger");
        if (deleteButton) row.insertBefore(button, deleteButton);
      }
    });
    return () =>
      rows.forEach((row) => {
        row.querySelector(".account-password-mask")?.remove();
        row.querySelector(".reset-password-btn")?.remove();
      });
  }, [accounts, targetRole]);
  const saveAccount = async (event) => {
    event.preventDefault();
    const name = form.name.trim(),
      email = form.email.trim().toLowerCase(),
      department = form.department.trim();
    if (!name || !email || !department)
      return setMessage("Name, email, and department are required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setMessage("Enter a valid email address.");
    if (!editingKey && !form.password)
      return setMessage("Set a password for the new account.");
    if (!editingKey && !faceDescriptor)
      return setMessage(
        "Face registration is required before creating this account.",
      );
    if (form.password && form.password.length < 6)
      return setMessage("Password must be at least 6 characters.");
    const profiles = load("cc_face_profiles", {}),
      passwordProfiles = load("cc_password_profiles", {}),
      nextKey = editingKey || `${targetRole}:${name.toLowerCase()}`;
    if (
      Object.entries(profiles).some(
        ([key, account]) =>
          key !== editingKey && account.email?.toLowerCase() === email,
      )
    )
      return setMessage("An account with this email already exists.");
    if (!editingKey && profiles[nextKey])
      return setMessage("An account with this name and role already exists.");
    const previous = editingKey ? profiles[editingKey] : null;
    const studentId =
      form.identifier.trim() ||
      previous?.studentId ||
      uid(
        targetRole === "teacher"
          ? "EMP"
          : targetRole === "warden"
            ? "WRD"
            : "ADM",
      );
    if (!editingKey) {
      try {
        await attendanceApi("/api/accounts/face-registration", {
          userId: studentId,
          role: targetRole,
          actorRole: "admin",
          descriptor: faceDescriptor,
        });
      } catch (error) {
        return setMessage(error.message);
      }
    }
    const account = {
      ...(previous || {}),
      name,
      email,
      department,
      studentId,
      role: targetRole,
      active: previous?.active !== false,
      ...(!editingKey ? { descriptor: faceDescriptor } : {}),
    };
    if (editingKey && editingKey !== nextKey) {
      delete profiles[editingKey];
      if (passwordProfiles[editingKey]) {
        passwordProfiles[nextKey] = passwordProfiles[editingKey];
        delete passwordProfiles[editingKey];
      }
    }
    profiles[nextKey] = account;
    if (form.password)
      passwordProfiles[nextKey] = {
        hash: await hashPassword(form.password),
        updatedAt: new Date().toISOString(),
      };
    save("cc_face_profiles", profiles);
    save("cc_password_profiles", passwordProfiles);
    reload();
    reset();
    setMessage(
      `${targetRole === "teacher" ? "Teacher" : targetRole === "warden" ? "Warden" : "Admin"} account saved.`,
    );
  };
  const editAccount = (key, account) => {
    setEditingKey(key);
    setForm({
      name: account.name || "",
      email: account.email || "",
      identifier: account.studentId || "",
      department: account.department || "",
      password: "",
    });
    setMessage("");
  };
  const resetAccountPassword = (key, account) => {
    setEditingKey(key);
    setForm({
      name: account.name || "",
      email: account.email || "",
      identifier: account.studentId || "",
      department: account.department || "",
      password: "",
    });
    setMessage("Enter a new password and save changes.");
  };
  const toggleAccount = (key) => {
    const profiles = load("cc_face_profiles", {}),
      account = profiles[key];
    if (!account || account.role !== targetRole) return;
    if (
      account.role === "admin" &&
      account.studentId === currentProfile.studentId &&
      account.active !== false
    )
      return setMessage("You cannot disable the account currently in use.");
    profiles[key] = { ...account, active: account.active === false };
    save("cc_face_profiles", profiles);
    reload();
  };
  const deleteAccount = (key) => {
    const profiles = load("cc_face_profiles", {}),
      passwordProfiles = load("cc_password_profiles", {}),
      account = profiles[key];
    if (!account || account.role !== targetRole) return;
    if (account.studentId === currentProfile.studentId)
      return setMessage("You cannot delete the account currently in use.");
    delete profiles[key];
    delete passwordProfiles[key];
    save("cc_face_profiles", profiles);
    save("cc_password_profiles", passwordProfiles);
    reload();
    if (editingKey === key) reset();
  };
  return (
    <>
      <PageTitle
        eyebrow={`ADMIN Â· ${targetRole.toUpperCase()}`}
        title={title}
        desc={`Create, review, edit, and control ${targetRole} accounts.`}
      />
      <div className="account-management-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>{editingKey ? `Edit ${targetRole}` : `Add ${targetRole}`}</h3>
              <p>
                Role is fixed to <b>{targetRole}</b> for this section.
              </p>
            </div>
            <Users />
          </div>
          <form onSubmit={saveAccount} className="form-grid">
            <label>
              Full Name *
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>
            <label>
              Email *
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <label>
              Employee ID
              <input
                value={form.identifier}
                onChange={(event) =>
                  setForm({ ...form, identifier: event.target.value })
                }
              />
            </label>
            <label>
              Department *
              <input
                value={form.department}
                onChange={(event) =>
                  setForm({ ...form, department: event.target.value })
                }
              />
            </label>
            <label>
              {editingKey ? "New Password" : "Password *"}
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                placeholder={
                  editingKey
                    ? "Leave blank to keep current"
                    : "At least 6 characters"
                }
              />
            </label>
            <div>
              <button className="primary" type="submit">
                <CheckCircle2 />
                {editingKey ? "Save Changes" : `Add ${targetRole}`}
              </button>
              {editingKey && (
                <button className="ghost" type="button" onClick={reset}>
                  Cancel
                </button>
              )}
            </div>
          </form>
          {message && <div className="success-box">{message}</div>}
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>{title}</h3>
              <p>
                {accounts.length} account{accounts.length === 1 ? "" : "s"} in
                local records
              </p>
            </div>
            <span className="attendance-pill">{targetRole}</span>
          </div>
          <div className="account-list">
            {accounts.length ? (
              accounts.map(([key, account]) => (
                <div className="account-row" key={key}>
                  <div className="avatar small">
                    {initials(account.name || targetRole)}
                  </div>
                  <div className="account-main">
                    <b>{account.name}</b>
                    <span>
                      {account.email || "No email"} Â·{" "}
                      {account.department || "No department"}
                    </span>
                    <small>{account.studentId || "No ID"}</small>
                  </div>
                  <span
                    className={`status ${account.active === false ? "absent" : "present"}`}
                  >
                    {account.active === false ? "Disabled" : "Active"}
                  </span>
                  <button
                    className="ghost mini-btn"
                    onClick={() => editAccount(key, account)}
                  >
                    Edit
                  </button>
                  <button
                    className="ghost mini-btn"
                    onClick={() => toggleAccount(key)}
                  >
                    {account.active === false ? "Enable" : "Disable"}
                  </button>
                  <button
                    className="danger mini-btn"
                    onClick={() => deleteAccount(key)}
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <div className="demo-note">
                No {targetRole} accounts have been created yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function StudentRegistrationApproval() {
  const [students, setStudents] = useState(() =>
    Object.entries(load("cc_face_profiles", {})).filter(
      ([, account]) => account.role === "student",
    ),
  );
  const updateApproval = (key, approvalStatus) => {
    const profiles = load("cc_face_profiles", {});
    if (!profiles[key]) return;
    profiles[key] = { ...profiles[key], approvalStatus };
    save("cc_face_profiles", profiles);
    setStudents(
      Object.entries(profiles).filter(
        ([, account]) => account.role === "student",
      ),
    );
  };
  const pending = students.filter(
    ([, account]) => account.approvalStatus !== "approved",
  );
  return (
    <>
      <PageTitle
        eyebrow="ADMIN Â· STUDENTS"
        title="Student Registration Approval"
        desc="Review new student accounts before allowing campus login."
      />
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Student registrations</h3>
            <p>
              {pending.length} registration{pending.length === 1 ? "" : "s"}{" "}
              awaiting review
            </p>
          </div>
          <span className="attendance-pill">{students.length} total</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Student ID</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length ? (
                students.map(([key, student]) => (
                  <tr key={key}>
                    <td>
                      <b>{student.name}</b>
                    </td>
                    <td>{student.studentId || "Not assigned"}</td>
                    <td>{student.email || "No email"}</td>
                    <td>{student.department || "No department"}</td>
                    <td>
                      <span
                        className={`status ${student.approvalStatus === "approved" ? "present" : student.approvalStatus === "rejected" ? "absent" : "upcoming"}`}
                      >
                        {student.approvalStatus || "pending"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="primary mini-btn"
                        disabled={student.approvalStatus === "approved"}
                        onClick={() => updateApproval(key, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="danger mini-btn"
                        disabled={student.approvalStatus === "rejected"}
                        onClick={() => updateApproval(key, "rejected")}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No student registrations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function LostFoundPage({ role, profile, reports, setReports }) {
  const [form, setForm] = useState({
    type: "Lost",
    itemName: "",
    category: "",
    location: "",
    approximateTime: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [contactReport, setContactReport] = useState(null);
  const [contactDraft, setContactDraft] = useState("");
  const [contactConfirmation, setContactConfirmation] = useState("");
  const isStudent = role === "student",
    isManager = role === "admin" || role === "warden";
  const submitReport = (event) => {
    event.preventDefault();
    if (
      !form.itemName.trim() ||
      !form.category ||
      !form.location.trim() ||
      !form.approximateTime ||
      !form.description.trim()
    )
      return setMessage("Complete all report details before submitting.");
    const account = Object.values(load("cc_face_profiles", {})).find(
      (student) =>
        student.role === "student" && student.studentId === profile.studentId,
    );
    const report = {
      id: uid("LF"),
      ...form,
      itemName: form.itemName.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      status: form.type,
      reporterName: profile.name || "Student",
      reporterId: profile.studentId || "",
      reporterEmail: profile.email || account?.email || "",
      createdAt: new Date().toISOString(),
    };
    setReports((current) => [report, ...current]);
    setForm({
      type: "Lost",
      itemName: "",
      category: "",
      location: "",
      approximateTime: "",
      description: "",
    });
    setMessage("Your Lost & Found report was submitted.");
  };
  const updateStatus = (report, status) =>
    setReports((current) =>
      current.map((item) =>
        item.id === report.id
          ? { ...item, status, updatedAt: new Date().toISOString() }
          : item,
      ),
    );
  const resolveMatch = (report, match) =>
    setReports((current) =>
      current.map((item) =>
        item.id === report.id || item.id === match.id
          ? {
              ...item,
              status: "Claimed/Resolved",
              claimedBy: profile.name || "Student",
              claimedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
  const openContactPanel = (report) => {
    setContactReport(report);
    setContactDraft("");
    setContactConfirmation("");
  };
  const sendContactMessage = (event) => {
    event.preventDefault();
    if (!contactReport || !contactDraft.trim()) return;
    const sentMessage = {
      id: uid("LFM"),
      reportId: contactReport.id,
      recipientName: contactReport.reporterName,
      recipientId: contactReport.reporterId,
      recipientEmail: contactReport.reporterEmail,
      senderName: profile.name || "Student",
      senderId: profile.studentId || "",
      message: contactDraft.trim(),
      createdAt: new Date().toISOString(),
    };
    save("cc_lost_found_messages", [
      sentMessage,
      ...load("cc_lost_found_messages", []),
    ]);
    setContactDraft("");
    setContactConfirmation("Message sent successfully");
  };
  const sortedReports = [...reports].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );
  return (
    <>
      <PageTitle
        eyebrow={
          isManager
            ? `${role.toUpperCase()} Â· CAMPUS SERVICES`
            : "STUDENT Â· CAMPUS SERVICES"
        }
        title="Lost & Found"
        desc={
          isManager
            ? "Review reports, possible matches, and resolution status."
            : "Report lost or found items and connect with their owners or finders."
        }
      />
      {isStudent && (
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Report an item</h3>
              <p>
                Share enough detail to help connect lost items with their
                finders.
              </p>
            </div>
            <Search />
          </div>
          <form onSubmit={submitReport} className="form-grid">
            <label>
              Report Type *
              <select
                value={form.type}
                onChange={(event) =>
                  setForm({ ...form, type: event.target.value })
                }
              >
                <option>Lost</option>
                <option>Found</option>
              </select>
            </label>
            <label>
              Item Name *
              <input
                value={form.itemName}
                onChange={(event) =>
                  setForm({ ...form, itemName: event.target.value })
                }
                required
                placeholder="e.g. Black laptop sleeve"
              />
            </label>
            <label>
              Category *
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                required
              >
                <option value="">Select category</option>
                {[
                  "Electronics",
                  "Books & Notes",
                  "ID / Cards",
                  "Keys",
                  "Clothing",
                  "Bags",
                  "Other",
                ].map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              Location *
              <input
                value={form.location}
                onChange={(event) =>
                  setForm({ ...form, location: event.target.value })
                }
                required
                placeholder="Where was it lost or found?"
              />
            </label>
            <label>
              Approximate Time *
              <input
                type="datetime-local"
                value={form.approximateTime}
                onChange={(event) =>
                  setForm({ ...form, approximateTime: event.target.value })
                }
                required
              />
            </label>
            <label>
              Description *
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                required
                placeholder="Describe identifying details"
                rows="3"
              />
            </label>
            <div>
              <button className="primary" type="submit">
                <Plus /> Submit Report
              </button>
            </div>
          </form>
          {message && <div className="success-box">{message}</div>}
        </section>
      )}
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>{isManager ? "Manage reports" : "Lost & Found reports"}</h3>
            <p>
              {isManager
                ? "Use the report actions to update item status."
                : "Possible matches are based on item details, location, and approximate time."}
            </p>
          </div>
          <span className="attendance-pill">
            {reports.length} report{reports.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="account-list">
          {sortedReports.length ? (
            sortedReports.map((report) => {
              const match = findPossibleLostFoundMatch(report, reports);
              const status = match ? "Possible Match" : report.status;
              const statusClass =
                status === "Claimed/Resolved"
                  ? "present"
                  : status === "Possible Match"
                    ? "upcoming"
                    : status === "Found"
                      ? "present"
                      : "absent";
              const contactTarget = match || report;
              return (
                <div className="account-row" key={report.id}>
                  <div className="avatar small">
                    {report.type === "Lost" ? "L" : "F"}
                  </div>
                  <div className="account-main">
                    <b>{report.itemName}</b>
                    <span>
                      {report.type} Â· {report.category} Â· {report.location} Â·{" "}
                      {new Date(report.approximateTime).toLocaleString()}
                    </span>
                    <small>
                      {report.description} Â· Reported by {report.reporterName}
                    </small>
                    {match && (
                      <small>
                        Possible Match Found: {match.itemName} at{" "}
                        {match.location}
                      </small>
                    )}
                    <span className={`status ${statusClass}`}>{status}</span>
                  </div>
                  {contactTarget.reporterEmail &&
                    contactTarget.reporterId !== profile.studentId && (
                      <button
                        className="ghost mini-btn"
                        onClick={() => openContactPanel(contactTarget)}
                      >
                        {match ? "Contact Owner / Finder" : "Contact Reporter"}
                      </button>
                    )}
                  {isStudent && match && (
                    <button
                      className="primary mini-btn"
                      onClick={() => resolveMatch(report, match)}
                    >
                      Claim / Resolve
                    </button>
                  )}
                  {isManager && report.status !== "Claimed/Resolved" && (
                    <>
                      {report.type === "Lost" && report.status === "Lost" && (
                        <button
                          className="primary mini-btn"
                          onClick={() => updateStatus(report, "Found")}
                        >
                          Mark Found
                        </button>
                      )}
                      <button
                        className="danger mini-btn"
                        onClick={() => updateStatus(report, "Claimed/Resolved")}
                      >
                        Mark Resolved
                      </button>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className="demo-note">No Lost & Found reports yet.</div>
          )}
        </div>
      </section>
      {contactReport && (
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Contact Reporter</h3>
              <p>To {contactReport.reporterName}</p>
            </div>
            <button
              className="ghost mini-btn"
              onClick={() => setContactReport(null)}
            >
              Close
            </button>
          </div>
          {contactConfirmation ? (
            <div className="success-box">{contactConfirmation}</div>
          ) : (
            <form onSubmit={sendContactMessage}>
              <label>
                Message
                <textarea
                  value={contactDraft}
                  onChange={(event) => setContactDraft(event.target.value)}
                  required
                  rows="3"
                  placeholder="Write a message about this item"
                />
              </label>
              <button
                className="primary"
                type="submit"
                disabled={!contactDraft.trim()}
              >
                <Send /> Send Message
              </button>
            </form>
          )}
        </section>
      )}
    </>
  );
}

function StudentAcademicDetails() {
  const [students, setStudents] = useState(() =>
    Object.entries(load("cc_face_profiles", {})).filter(
      ([, account]) => account.role === "student",
    ),
  );
  const [selectedKey, setSelectedKey] = useState("");
  const [form, setForm] = useState({
    course: "",
    department: "",
    year: "",
    section: "",
  });
  const [message, setMessage] = useState("");
  const selectedStudent = students.find(([key]) => key === selectedKey)?.[1];
  useEffect(() => {
    setForm({
      course: selectedStudent?.course || "",
      department: selectedStudent?.department || selectedStudent?.branch || "",
      year: selectedStudent?.year || selectedStudent?.studyYear || "",
      section: selectedStudent?.section || "",
    });
  }, [selectedKey, students]);
  const saveAcademicDetails = () => {
    if (!selectedStudent) return setMessage("Select a student first.");
    const course = form.course,
      department = form.department.trim(),
      year = form.year.trim(),
      section = form.section.trim();
    if (!course || !department || !year || !section)
      return setMessage("Complete all academic details before saving.");
    const profiles = load("cc_face_profiles", {}),
      account = profiles[selectedKey];
    if (!account || account.role !== "student")
      return setMessage("Student profile was not found.");
    profiles[selectedKey] = {
      ...account,
      course,
      branch: department,
      department,
      year,
      studyYear: year,
      section,
    };
    save("cc_face_profiles", profiles);
    setStudents(
      Object.entries(profiles).filter(
        ([, student]) => student.role === "student",
      ),
    );
    setMessage(`Academic details saved for ${account.name}.`);
  };
  return (
    <>
      <PageTitle
        eyebrow="ADMIN Â· STUDENTS"
        title="Student Academic Details"
        desc="Update the academic details used to select each student's timetable."
      />
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Student profile</h3>
            <p>
              {students.length} student profile
              {students.length === 1 ? "" : "s"} in local records
            </p>
          </div>
          <GraduationCap />
        </div>
        <label>
          Student
          <select
            value={selectedKey}
            onChange={(event) => {
              setSelectedKey(event.target.value);
              setMessage("");
            }}
          >
            <option value="">Select a student</option>
            {students.map(([key, student]) => (
              <option key={key} value={key}>
                {student.name} Â· {student.studentId || student.email || key}
              </option>
            ))}
          </select>
        </label>
        {selectedStudent ? (
          <>
            <div className="form-grid" style={{ marginTop: 16 }}>
              <label>
                Course *
                <select
                  value={form.course}
                  onChange={(event) =>
                    setForm({ ...form, course: event.target.value })
                  }
                >
                  <option value="">Select course</option>
                  <option>B-TECH</option>
                  <option>DIPLOMA</option>
                </select>
              </label>
              <label>
                Branch / Department *
                <input
                  value={form.department}
                  onChange={(event) =>
                    setForm({ ...form, department: event.target.value })
                  }
                  placeholder="Branch or department"
                />
              </label>
              <label>
                Year *
                <input
                  value={form.year}
                  onChange={(event) =>
                    setForm({ ...form, year: event.target.value })
                  }
                  placeholder="e.g. 2nd Year"
                />
              </label>
              <label>
                Section *
                <input
                  value={form.section}
                  onChange={(event) =>
                    setForm({ ...form, section: event.target.value })
                  }
                  placeholder="e.g. CSE-A"
                />
              </label>
            </div>
            <button className="primary" onClick={saveAcademicDetails}>
              <CheckCircle2 /> Save Academic Details
            </button>
          </>
        ) : (
          <div className="demo-note">
            Select a student profile to edit its academic details.
          </div>
        )}
        {message && <div className="success-box">{message}</div>}
      </section>
    </>
  );
}

function EndToEndWorkflows() {
  const [activeTab, setActiveTab] = useState(0);
  const workflows = [
    {
      id: "complaint",
      title: "1. Hostel Complaint Workflow",
      color: "red",
      statusBadge: "Status: Closed",
      steps: [
        {
          num: 1,
          actor: "Student",
          title: "Submits complaint",
          desc: "Student submits complaint (e.g. 'fan not working')",
        },
        {
          num: 2,
          actor: "AI Engine",
          title: "AI classifies & routes",
          desc: "Detects category, location, priority & department",
        },
        {
          num: 3,
          actor: "Admin",
          title: "Admin reviews & assigns",
          desc: "Warden/Admin reviews and dispatches warden",
        },
        {
          num: 4,
          actor: "Staff",
          title: "Warden resolves issue",
          desc: "Technician resolves problem and updates status",
        },
        {
          num: 5,
          actor: "Student",
          title: "Student gets notification",
          desc: "Student verifies fix & confirms closure",
        },
      ],
    },
    {
      id: "certificate",
      title: "2. Certificate Request Workflow",
      color: "blue",
      statusBadge: "Status: Completed",
      steps: [
        {
          num: 1,
          actor: "Student",
          title: "Applies for certificate",
          desc: "Selects type (e.g. Bonafide) & purpose",
        },
        {
          num: 2,
          actor: "System",
          title: "Form submitted",
          desc: "Request ID generated with instant tracking",
        },
        {
          num: 3,
          actor: "Admin",
          title: "Admin verifies",
          desc: "Admin reviews eligibility and approves / rejects",
        },
        {
          num: 4,
          actor: "System",
          title: "Certificate generated",
          desc: "Digital PDF created with official seal & QR",
        },
        {
          num: 5,
          actor: "Student",
          title: "Student notified",
          desc: "Ready for download or office collection",
        },
      ],
    },
    {
      id: "gatepass",
      title: "3. Gate Pass Workflow",
      color: "orange",
      statusBadge: "Status: Completed",
      steps: [
        {
          num: 1,
          actor: "Student",
          title: "Applies for gate pass",
          desc: "Inputs date, out time, return time & reason",
        },
        {
          num: 2,
          actor: "Warden",
          title: "Warden / Admin reviews",
          desc: "Approves or rejects with comments",
        },
        {
          num: 3,
          actor: "Security",
          title: "Security verifies at gate",
          desc: "Digital QR pass scanned at campus gate",
        },
        {
          num: 4,
          actor: "Gate Log",
          title: "Gate entry recorded",
          desc: "Exit & return timestamps recorded in log",
        },
        {
          num: 5,
          actor: "Student",
          title: "Student notified",
          desc: "Entry confirmed, pass marked completed",
        },
      ],
    },
    {
      id: "notice",
      title: "4. Notice / Notification Workflow",
      color: "purple",
      statusBadge: "Delivered + Read Tracking",
      steps: [
        {
          num: 1,
          actor: "Admin",
          title: "Admin creates notice",
          desc: "Drafts campus announcement & alerts",
        },
        {
          num: 2,
          actor: "Admin",
          title: "Selects target audience",
          desc: "Filters by Branch / Year / Batch / Hostel",
        },
        {
          num: 3,
          actor: "System",
          title: "Message published",
          desc: "Stored in database & indexed for delivery",
        },
        {
          num: 4,
          actor: "Engine",
          title: "System sends notifications",
          desc: "In-app alerts, SMS & email dispatches",
        },
        {
          num: 5,
          actor: "Student",
          title: "Students receive & read",
          desc: "Delivered with read receipts & action tracking",
        },
      ],
    },
    {
      id: "ai_routing",
      title: "5. AI Complaint Routing & Recurring Issues",
      color: "teal",
      statusBadge: "AI Automation Active",
      steps: [
        {
          num: 1,
          actor: "Student",
          title: "Writes complaint",
          desc: "e.g. 'Hostel bathroom me water leak hai'",
        },
        {
          num: 2,
          actor: "NLP AI",
          title: "Detects & classifies",
          desc: "Category, Location, Priority, Department",
        },
        {
          num: 3,
          actor: "Router",
          title: "Auto-routes to department",
          desc: "Assigned directly to specialized department",
        },
        {
          num: 4,
          actor: "Pattern AI",
          title: "Group similar complaints",
          desc: "Groups by Hostel + Location + Category",
        },
        {
          num: 5,
          actor: "Alert",
          title: "Mark as Recurring Issue",
          desc: "Flags critical infrastructure hotspots in Admin Dashboard",
        },
      ],
    },
  ];

  return (
    <section className="panel workflows-panel">
      <div className="panel-head">
        <div>
          <div className="eyebrow">CAMPUSFLOW WORKFLOW ENGINE</div>
          <h3>End-to-End Operational Workflows</h3>
          <p>
            Seamless 5-step lifecycles powering student services, administrative
            oversight, and staff resolutions.
          </p>
        </div>
        <span className="live-dot">5 Workflows Active</span>
      </div>
      <div className="workflow-tabs">
        {workflows.map((wf, idx) => (
          <button
            key={wf.id}
            type="button"
            className={`workflow-tab ${activeTab === idx ? "active " + wf.color : ""}`}
            onClick={() => setActiveTab(idx)}
          >
            <span>{wf.title}</span>
          </button>
        ))}
      </div>
      <div className={`workflow-detail-box wf-${workflows[activeTab].color}`}>
        <div className="wf-detail-head">
          <h4>{workflows[activeTab].title}</h4>
          <span className="wf-status-pill">
            {workflows[activeTab].statusBadge}
          </span>
        </div>
        <div className="wf-cards-grid">
          {workflows[activeTab].steps.map((st) => (
            <div key={st.num} className="wf-card">
              <div className="wf-card-header">
                <span className="wf-step-badge">Step {st.num}</span>
                <span className="wf-actor-pill">{st.actor}</span>
              </div>
              <b>{st.title}</b>
              <p>{st.desc}</p>
              {st.num < 5 && (
                <div className="wf-connector">
                  <ArrowRight size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AccessibilityBar() {
  const [lang, setLang] = useState("en");

  return (
    <footer className="accessibility-bar">
      <div className="access-title">
        <Users size={16} />
        <b>Accessibility & Inclusion:</b>
      </div>
      <div className="access-items">
        <div className="access-item">
          <Wifi size={14} />
          <span>Low-end phone support</span>
        </div>
        <div className="access-item">
          <Activity size={14} />
          <span>Poor / patchy network ready (Cached)</span>
        </div>
        <div className="access-item">
          <Building2 size={14} />
          <span>
            Language:
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="lang-mini-select"
            >
              <option value="en">English</option>
              <option value="hi">à¤¹à¤¿à¤‚à¤¦à¥€ (Hindi)</option>
              <option value="te">à°¤à±†à°²à±à°—à± (Telugu)</option>
              <option value="ta">à®¤à®®à®¿à®´à¯ (Tamil)</option>
            </select>
          </span>
        </div>
        <div className="access-item">
          <ShieldCheck size={14} />
          <span>Fallback: Kiosk / Help Desk / SMS</span>
        </div>
      </div>
      <div className="access-tagline">
        Simple Steps âž” Complete Workflows âž” Better Campus Life
      </div>
    </footer>
  );
}

// ============================================================================
// STUDENT PAGES
// ============================================================================

function NoticesPage({ notices }) {
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedNotice, setSelectedNotice] = useState(null);

  const categories = ["All", "Academic", "Hostel", "Events", "General"];
  const filtered = notices.filter((n) => {
    const matchCat = cat === "All" || n.category === cat;
    const matchQuery = `${n.title} ${n.body} ${n.target} ${n.author}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW Â· BROADCAST"
        title="Notices & Announcements"
        desc="Official campus broadcasts filtered for your branch, year, batch, and hostel."
      />
      <div className="notices-toolbar">
        <div className="category-chips">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${cat === c ? "active" : ""}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search announcements..."
          />
        </div>
      </div>

      <div className="notices-grid">
        {filtered.map((notice) => (
          <div
            key={notice.id}
            className="notice-card"
            onClick={() => setSelectedNotice(notice)}
          >
            <div className="notice-card-top">
              <span
                className={`badge-cat cat-${notice.category.toLowerCase()}`}
              >
                {notice.category}
              </span>
              <span className="target-pill">
                <Users size={12} /> {notice.target}
              </span>
            </div>
            <h4>{notice.title}</h4>
            <p>{notice.body}</p>
            <div className="notice-card-footer">
              <span>
                <b>{notice.author}</b> Â· {notice.date}
              </span>
              <button type="button" className="ghost mini-btn">
                Read Full <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
        {!filtered.length && (
          <div className="demo-note">
            No notices found matching your criteria.
          </div>
        )}
      </div>

      {selectedNotice && (
        <div className="modal-backdrop" onClick={() => setSelectedNotice(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="eyebrow">
                {selectedNotice.category.toUpperCase()} ANNOUNCEMENT
              </div>
              <h3>{selectedNotice.title}</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSelectedNotice(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="notice-meta-bar">
                <span>
                  <b>Author:</b> {selectedNotice.author}
                </span>
                <span>
                  <b>Date:</b> {selectedNotice.date}
                </span>
                <span>
                  <b>Target:</b> {selectedNotice.target}
                </span>
              </div>
              <p className="notice-body-text">{selectedNotice.body}</p>
              <div className="tracking-receipt">
                <CheckCircle2 size={15} /> Read confirmation logged. Action
                tracked in student audit log.
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="primary"
                onClick={() => setSelectedNotice(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function GatePassPage({
  profile,
  gatePasses,
  setGatePasses,
  setNotifications,
}) {
  const studentId = profile.studentId || "STU-DEMO-1";
  const studentGatePasses = gatePasses.filter(
    (pass) => pass.studentId === studentId,
  );
  const [requestType, setRequestType] = useState("Gate Pass");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("02:00 PM");
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [returnTime, setReturnTime] = useState("07:00 PM");
  const [destination, setDestination] = useState("");
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("9876543210");
  const [successId, setSuccessId] = useState("");
  const [selectedPass, setSelectedPass] = useState(null);

  const apply = (e) => {
    e.preventDefault();
    if (
      !reason.trim() ||
      !contact.trim() ||
      (requestType === "Gate Pass" && !destination.trim())
    )
      return;
    const newPassId = uid("GP");
    const newPass = {
      id: newPassId,
      studentName: profile.name,
      studentId,
      requestType,
      ...(requestType === "Leave"
        ? { date, returnDate }
        : { time, returnTime, destination: destination.trim() }),
      reason,
      emergencyContact: contact,
      status:
        requestType === "Leave"
          ? "Pending Admin Approval"
          : "Pending Warden Approval",
      approvedBy: "",
      gateVerified: false,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const updated = [newPass, ...gatePasses];
    setGatePasses(updated);
    setSuccessId(newPassId);
    setReason("");
    setDestination("");
    setNotifications((prev) => [
      {
        id: Date.now(),
        title: `${requestType} Submitted`,
        text: `Request ${newPassId} is pending ${requestType === "Leave" ? "Admin" : "Warden"} approval.`,
        read: false,
      },
      ...prev,
    ]);
  };

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW Â· LEAVE & MOBILITY"
        title="Leave / Gate Pass Portal"
        desc="Submit a leave or gate-pass request and track its approval status."
      />

      <WorkflowStepper
        steps={
          requestType === "Leave"
            ? [
                "1. Student applies",
                "2. Admin reviews",
                "3. Warden reviews",
                "4. Approved",
              ]
            : ["1. Student applies", "2. Warden reviews", "3. Approved"]
        }
        currentStep={2}
        color="orange"
      />

      <div className="two-col-layout">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Apply for Out-Pass / Leave</h3>
              <p>
                {requestType === "Leave"
                  ? "Leave requests are reviewed by Admin, then the Warden"
                  : "Gate Pass requests are reviewed by the Warden"}
              </p>
            </div>
            <DoorOpen size={20} />
          </div>
          <form onSubmit={apply} className="cf-form">
            <label>
              Request Type
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
              >
                <option>Leave</option>
                <option>Gate Pass</option>
              </select>
            </label>
            {requestType === "Leave" ? (
              <div className="form-grid">
                <label>
                  From Date
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </label>
                <label>
                  To Date
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    required
                  />
                </label>
              </div>
            ) : (
              <>
                <div className="form-grid">
                  <label>
                    Out Time
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="02:00 PM"
                      required
                    />
                  </label>
                  <label>
                    Expected Return Time
                    <input
                      type="text"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      placeholder="07:00 PM"
                      required
                    />
                  </label>
                </div>
                <label>
                  Destination
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where are you going?"
                    required
                  />
                </label>
              </>
            )}
            <label>
              Reason for Leave
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Medical checkup, family visit, project supplies"
                required
              />
            </label>
            <label>
              Parent / Emergency Contact Number
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="10-digit mobile number"
                required
              />
            </label>
            <button type="submit" className="primary big">
              <DoorOpen size={16} /> Submit {requestType} Request
            </button>
          </form>
          {successId && (
            <div className="success-box">
              <CheckCircle2 size={16} /> Request #{successId} submitted. Status:{" "}
              {studentGatePasses.find((pass) => pass.id === successId)?.status}.
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>My Gate Passes</h3>
              <p>Active and past travel requests</p>
            </div>
            <span className="attendance-pill">
              {studentGatePasses.length} records
            </span>
          </div>
          <div className="passes-list">
            {studentGatePasses.map((pass) => (
              <div key={pass.id} className="pass-card">
                <div className="pass-card-top">
                  <b>#{pass.id}</b>
                  <span
                    className={`status-badge status-${pass.status.toLowerCase()}`}
                  >
                    {pass.status}
                  </span>
                </div>
                <p className="pass-reason">{pass.reason}</p>
                {pass.requestType !== "Leave" ? (
                  <>
                    <div className="pass-timing">
                      <span>
                        Destination: <b>{pass.destination}</b>
                      </span>
                    </div>
                    <div className="pass-timing">
                      <span>
                        Out: <b>{pass.time}</b>
                      </span>
                      <span>
                        Expected return: <b>{pass.returnTime}</b>
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="pass-timing">
                    <span>
                      From: <b>{pass.date}</b>
                    </span>
                    <span>
                      To: <b>{pass.returnDate}</b>
                    </span>
                  </div>
                )}
                {pass.approvedBy && (
                  <small className="approved-by">
                    Approved by: {pass.approvedBy}
                  </small>
                )}
                {pass.rejectionReason && (
                  <small className="approved-by">
                    Rejection reason: {pass.rejectionReason}
                  </small>
                )}
                <div className="pass-actions">
                  {pass.requestType !== "Leave" &&
                    pass.status === "Approved" && (
                      <button
                        type="button"
                        className="primary mini-btn"
                        onClick={() => setSelectedPass(pass)}
                      >
                        <QrCode size={14} /> Show Digital Pass
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedPass && (
        <div className="modal-backdrop" onClick={() => setSelectedPass(null)}>
          <div
            className="modal-box digital-pass-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="digital-pass-card">
              <div className="pass-badge-header">
                <Layers size={18} />
                <span>CAMPUSFLOW OFFICIAL DIGITAL GATE PASS</span>
              </div>
              <h2>{selectedPass.studentName}</h2>
              <p className="pass-student-id">
                {selectedPass.studentId} Â· Hostel Block
              </p>
              <div className="pass-qr-box">
                <QrCode size={120} />
                <span>SCAN AT MAIN GATE TERMINAL</span>
              </div>
              <div className="pass-details-grid">
                <div>
                  <span>Pass ID:</span>
                  <b>#{selectedPass.id}</b>
                </div>
                <div>
                  <span>Status:</span>
                  <b className="text-green">{selectedPass.status}</b>
                </div>
                <div>
                  <span>Out Time:</span>
                  <b>{selectedPass.time}</b>
                </div>
                <div>
                  <span>Expected Return:</span>
                  <b>{selectedPass.returnTime}</b>
                </div>
                <div className="col-span-2">
                  <span>Destination:</span>
                  <b>{selectedPass.destination}</b>
                </div>
                <div className="col-span-2">
                  <span>Reason:</span>
                  <b>{selectedPass.reason}</b>
                </div>
                <div className="col-span-2">
                  <span>Warden Clearance:</span>
                  <b>{selectedPass.approvedBy || "Verified"}</b>
                </div>
              </div>
              <button
                type="button"
                className="primary big"
                onClick={() => setSelectedPass(null)}
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CertificateRequestPage({
  profile,
  certificateRequests,
  setCertificateRequests,
}) {
  const [type, setType] = useState("Bonafide Certificate");
  const [purpose, setPurpose] = useState("");
  const [sem, setSem] = useState("6th Semester");
  const [successId, setSuccessId] = useState("");
  const [previewCert, setPreviewCert] = useState(null);

  const certTypes = [
    "Bonafide Certificate",
    "Character Certificate",
    "Transfer Certificate (TC)",
    "Course Completion Certificate",
    "Fee Structure Certificate",
  ];

  const submitRequest = (e) => {
    e.preventDefault();
    if (!purpose.trim()) return;
    const newId = uid("CERT");
    const newReq = {
      id: newId,
      studentName: profile.name,
      studentId: profile.studentId || "STU-DEMO-1",
      type,
      purpose,
      semester: sem,
      status: "Submitted",
      requestDate: new Date().toISOString().slice(0, 10),
      completedDate: "",
      verifiedBy: "",
    };
    setCertificateRequests([newReq, ...certificateRequests]);
    setSuccessId(newId);
    setPurpose("");
  };

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW Â· ACADEMIC SERVICES"
        title="Certificate Request Portal"
        desc="Apply for Bonafide, Character, and Transfer certificates with digital seal verification."
      />

      <WorkflowStepper
        steps={[
          "1. Student applies",
          "2. Form submitted (ID)",
          "3. Admin verifies",
          "4. PDF generated",
          "5. Ready to collect",
        ]}
        currentStep={2}
        color="blue"
      />

      <div className="two-col-layout">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Request an Official Certificate</h3>
              <p>
                Generated with university seal and digital verification hash
              </p>
            </div>
            <Award size={20} />
          </div>
          <form onSubmit={submitRequest} className="cf-form">
            <label>
              Certificate Type
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {certTypes.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Current Semester / Year
              <select value={sem} onChange={(e) => setSem(e.target.value)}>
                <option>1st Semester</option>
                <option>2nd Semester</option>
                <option>3rd Semester</option>
                <option>4th Semester</option>
                <option>5th Semester</option>
                <option>6th Semester</option>
                <option>7th Semester</option>
                <option>8th Semester</option>
              </select>
            </label>
            <label>
              Purpose / Reason
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Bank loan application, Passport renewal, Internship verification"
                required
              />
            </label>
            <button type="submit" className="primary big">
              <Award size={16} /> Submit Certificate Request
            </button>
          </form>
          {successId && (
            <div className="success-box">
              <CheckCircle2 size={16} /> Request submitted! Tracking ID:{" "}
              <b>#{successId}</b>. Admin notified for verification.
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>My Certificate Applications</h3>
              <p>Track generation and download authorized copies</p>
            </div>
            <span className="attendance-pill">
              {certificateRequests.length} requests
            </span>
          </div>
          <div className="passes-list">
            {certificateRequests.map((cert) => (
              <div key={cert.id} className="pass-card">
                <div className="pass-card-top">
                  <b>#{cert.id}</b>
                  <span
                    className={`status-badge status-${cert.status.toLowerCase()}`}
                  >
                    {cert.status}
                  </span>
                </div>
                <h4>{cert.type}</h4>
                <p className="pass-reason">Purpose: {cert.purpose}</p>
                <div className="pass-timing">
                  <span>
                    Applied: <b>{cert.requestDate}</b>
                  </span>
                  {cert.completedDate && (
                    <span>
                      Issued: <b>{cert.completedDate}</b>
                    </span>
                  )}
                </div>
                {cert.status === "Generated" && (
                  <button
                    type="button"
                    className="primary mini-btn"
                    onClick={() => setPreviewCert(cert)}
                  >
                    <Download size={14} /> View & Download PDF
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {previewCert && (
        <div className="modal-backdrop" onClick={() => setPreviewCert(null)}>
          <div
            className="modal-box cert-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="official-certificate-doc">
              <div className="cert-border">
                <div className="cert-header">
                  <div className="cert-emblem">
                    <Building2 size={32} />
                  </div>
                  <h2>CAMPUSFLOW UNIVERSITY OF TECHNOLOGY</h2>
                  <p>
                    Accredited 'A++' Grade Â· Office of Academic Affairs &
                    Registrar
                  </p>
                  <div className="cert-title-badge">
                    {previewCert.type.toUpperCase()}
                  </div>
                </div>
                <div className="cert-content-text">
                  <p>
                    This is to certify that <b>{previewCert.studentName}</b>,
                    bearing Student ID <b>{previewCert.studentId}</b>, is a
                    bonafide student of this Institute pursuing Bachelor of
                    Technology (B.Tech) in Computer Science & Engineering.
                  </p>
                  <p>
                    This certificate is officially issued on this day upon the
                    student's request for the purpose of:{" "}
                    <i>{previewCert.purpose}</i>.
                  </p>
                  <p>
                    His / Her conduct and character during the period of study
                    have been observed to be GOOD.
                  </p>
                </div>
                <div className="cert-signatures">
                  <div className="cert-qr">
                    <QrCode size={64} />
                    <small>
                      Verify: campusflow.edu/verify/{previewCert.id}
                    </small>
                  </div>
                  <div className="cert-seal">
                    <ShieldCheck size={36} />
                    <span>UNIVERSITY OFFICIAL SEAL</span>
                  </div>
                  <div className="cert-sign">
                    <div className="sign-line" />
                    <b>Registrar / Dean Academics</b>
                    <small>CampusFlow Institute</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="ghost"
                onClick={() => window.print()}
              >
                <Printer size={15} /> Print Certificate
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => setPreviewCert(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function HostelComplaintPage({
  profile,
  complaints,
  setComplaints,
  setNotifications,
}) {
  const [desc, setDesc] = useState("");
  const [room, setRoom] = useState("B-204");
  const [submittedId, setSubmittedId] = useState("");

  const liveAI = useMemo(() => {
    if (!desc.trim()) return null;
    return classifyComplaint(desc);
  }, [desc]);

  const submitComplaint = (e) => {
    e.preventDefault();
    if (!desc.trim()) return;
    const ai = classifyComplaint(desc);
    const newId = uid("HC");
    const newComplaint = {
      id: newId,
      studentName: profile.name,
      studentId: profile.studentId || "STU-DEMO-1",
      description: desc,
      roomNo: room,
      aiCategory: ai.category,
      aiLocation: ai.location,
      aiPriority: ai.priority,
      aiDepartment: ai.department,
      assignedTo: "",
      status: "Open",
      remarks: "",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setComplaints([newComplaint, ...complaints]);
    setSubmittedId(newId);
    setDesc("");
    setNotifications((prev) => [
      {
        id: Date.now(),
        title: "Complaint Routed via AI",
        text: `Your issue has been automatically classified as ${ai.category} and routed to ${ai.department}.`,
        read: false,
      },
      ...prev,
    ]);
  };

  const confirmClosure = (id) => {
    setComplaints(
      complaints.map((c) =>
        c.id === id
          ? { ...c, status: "Closed", resolvedAt: new Date().toISOString() }
          : c,
      ),
    );
  };

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW Â· SMART HOSTEL MAINTENANCE"
        title="Hostel Complaint System"
        desc="AI-powered issue submission, automatic department classification, and end-to-end resolution tracking."
      />

      <WorkflowStepper
        steps={[
          "1. Student submits",
          "2. AI classifies & routes",
          "3. Admin assigns warden",
          "4. Warden resolves",
          "5. Closed",
        ]}
        currentStep={1}
        color="red"
      />

      <div className="two-col-layout">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Report Hostel Problem</h3>
              <p>Natural language input with real-time NLP classification</p>
            </div>
            <Sparkles size={20} className="text-accent" />
          </div>
          <form onSubmit={submitComplaint} className="cf-form">
            <label>
              Hostel Room No.
              <input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. B-204"
                required
              />
            </label>
            <label>
              Describe the Issue
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g. 'Ceiling fan in room B-204 is making sparking noise' or 'Water leaking from bathroom tap in hostel A'"
                rows={4}
                required
              />
            </label>

            {liveAI && (
              <div className="live-ai-box">
                <div className="live-ai-head">
                  <Bot size={15} />
                  <b>AI Auto-Classification (Real-Time):</b>
                </div>
                <div className="ai-pills">
                  <span className="ai-pill">
                    Category: <b>{liveAI.category}</b>
                  </span>
                  <span className="ai-pill">
                    Location: <b>{liveAI.location}</b>
                  </span>
                  <span
                    className={`ai-pill priority-${liveAI.priority.toLowerCase()}`}
                  >
                    Priority: <b>{liveAI.priority}</b>
                  </span>
                  <span className="ai-pill dept">
                    Routed to: <b>{liveAI.department}</b>
                  </span>
                </div>
              </div>
            )}

            <button type="submit" className="primary big">
              <AlertTriangle size={16} /> Submit & Route via AI
            </button>
          </form>
          {submittedId && (
            <div className="success-box">
              <CheckCircle2 size={16} /> Complaint #{submittedId} logged! AI
              routed it directly to the designated department.
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>My Reported Complaints</h3>
              <p>Status tracking and resolution confirmation</p>
            </div>
            <span className="attendance-pill">{complaints.length} tickets</span>
          </div>
          <div className="passes-list">
            {complaints.map((comp) => (
              <div key={comp.id} className="pass-card">
                <div className="pass-card-top">
                  <b>#{comp.id}</b>
                  <div className="badge-cluster">
                    <span
                      className={`badge-cat cat-${comp.aiCategory?.toLowerCase()}`}
                    >
                      {comp.aiCategory}
                    </span>
                    <span
                      className={`status-badge status-${comp.status.toLowerCase().replace(" ", "")}`}
                    >
                      {comp.status}
                    </span>
                  </div>
                </div>
                <p className="pass-reason">{comp.description}</p>
                <div className="complaint-ai-meta">
                  <span>ðŸ“ {comp.aiLocation}</span>
                  <span>
                    âš¡ Priority: <b>{comp.aiPriority}</b>
                  </span>
                  <span>
                    ðŸ¢ Dept: <b>{comp.aiDepartment}</b>
                  </span>
                </div>
                {comp.assignedTo && (
                  <div className="assigned-note">
                    Technician: <b>{comp.assignedTo}</b>
                  </div>
                )}
                {comp.remarks && (
                  <div className="remarks-note">
                    Remarks: <i>"{comp.remarks}"</i>
                  </div>
                )}
                {comp.status === "Resolved" && (
                  <button
                    type="button"
                    className="primary mini-btn"
                    onClick={() => confirmClosure(comp.id)}
                  >
                    <CheckCircle2 size={14} /> Confirm Resolution & Close Ticket
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function MessMenuPage() {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const currentDayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });
  const [selectedDay, setSelectedDay] = useState(
    days.includes(currentDayName) ? currentDayName : "Monday",
  );

  const todayMenu = demoMessMenu[selectedDay] || demoMessMenu.Monday;

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW Â· DINING & LIVING"
        title="Weekly Mess Menu"
        desc="Daily balanced meal schedules, nutritional highlights, and special dining arrangements."
      />

      <div className="day-selector-pills">
        {days.map((d) => (
          <button
            key={d}
            type="button"
            className={`day-pill ${selectedDay === d ? "active" : ""} ${d === currentDayName ? "is-today" : ""}`}
            onClick={() => setSelectedDay(d)}
          >
            <b>{d}</b>
            {d === currentDayName && <small>TODAY</small>}
          </button>
        ))}
      </div>

      <div className="mess-menu-grid">
        <div className="meal-card breakfast">
          <div className="meal-header">
            <div>
              <span className="meal-badge">BREAKFAST</span>
              <h3>Morning Fuel</h3>
            </div>
            <span className="meal-time">07:30 AM - 09:30 AM</span>
          </div>
          <p className="meal-items">{todayMenu.breakfast}</p>
          <div className="meal-footer">
            <span className="diet-tag veg">Pure Veg</span>
            <small>Includes Fresh Tea, Coffee & Warm Milk</small>
          </div>
        </div>

        <div className="meal-card lunch">
          <div className="meal-header">
            <div>
              <span className="meal-badge">LUNCH</span>
              <h3>Nutritious Thali</h3>
            </div>
            <span className="meal-time">12:30 PM - 02:30 PM</span>
          </div>
          <p className="meal-items">{todayMenu.lunch}</p>
          <div className="meal-footer">
            <span className="diet-tag veg">Balanced Diet</span>
            <small>Unlimited Basmati Rice & Fresh Chapatis</small>
          </div>
        </div>

        <div className="meal-card snacks">
          <div className="meal-header">
            <div>
              <span className="meal-badge">EVENING SNACKS</span>
              <h3>High Tea</h3>
            </div>
            <span className="meal-time">05:00 PM - 06:00 PM</span>
          </div>
          <p className="meal-items">{todayMenu.snacks}</p>
          <div className="meal-footer">
            <span className="diet-tag snack">Snack Time</span>
            <small>Served with Hot Ginger Chai</small>
          </div>
        </div>

        <div className="meal-card dinner">
          <div className="meal-header">
            <div>
              <span className="meal-badge">DINNER</span>
              <h3>Evening Feast</h3>
            </div>
            <span className="meal-time">08:00 PM - 10:00 PM</span>
          </div>
          <p className="meal-items">{todayMenu.dinner}</p>
          <div className="meal-footer">
            <span className="diet-tag veg">Veg / Non-Veg Options</span>
            <small>Dessert / Sweet Served Daily</small>
          </div>
        </div>
      </div>

      <div className="panel mess-info-panel">
        <div className="panel-head">
          <div>
            <h3>Mess Committee & Food Quality Standards</h3>
            <p>Monitored by Student Mess Council and Campus Medical Officer</p>
          </div>
          <UtensilsCrossed size={20} />
        </div>
        <div className="mess-rules-grid">
          <div>
            <b>Dietary Hygiene:</b> FSSAI certified central campus kitchen. RO
            drinking water plants in all dining halls.
          </div>
          <div>
            <b>Sunday Special:</b> Extended grand lunch buffet with chef's
            special dessert and regional delicacies.
          </div>
          <div>
            <b>Feedback Desk:</b> Leave immediate food ratings in the CampusFlow
            Feedback portal.
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// WARDEN PORTAL PAGES (Resolve & Update)
// ============================================================================

function StaffDashboard({ go, complaints, profile, setComplaints }) {
  const staffName = profile.name || "Rajesh Kumar";
  const myComplaints = complaints.filter(
    (c) =>
      !c.assignedTo ||
      c.assignedTo === staffName ||
      c.assignedTo.includes(staffName.split(" ")[0]),
  );
  const openCount = myComplaints.filter(
    (c) => c.status === "Open" || c.status === "In Progress",
  ).length;
  const resolvedCount = myComplaints.filter(
    (c) => c.status === "Resolved" || c.status === "Closed",
  ).length;

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW Â· WARDEN PORTAL"
        title={`Work Desk: ${staffName}`}
        desc="Review assigned maintenance tickets, update repair progress, add notes, and record completions."
        actions={
          <button className="primary" onClick={() => go("staffcomplaints")}>
            <Wrench size={16} /> View Assigned Work
          </button>
        }
      />

      <div className="stats-grid">
        <Stat
          icon={Wrench}
          label="Assigned Complaints"
          value={myComplaints.length}
          sub="Total allocated to you"
        />
        <Stat
          icon={Clock3}
          label="Pending Action"
          value={openCount}
          sub="Needs your attention"
        />
        <Stat
          icon={CheckCircle2}
          label="Resolved Tickets"
          value={resolvedCount}
          sub="Completed this cycle"
        />
        <Stat
          icon={Activity}
          label="Avg Resolution Time"
          value="2.4 hrs"
          sub="Exceeding department SLA"
        />
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Immediate Action Queue</h3>
            <p>Complaints waiting for resolution or status updates</p>
          </div>
          <button className="ghost" onClick={() => go("staffcomplaints")}>
            Open full manager <ChevronRight size={14} />
          </button>
        </div>
        <div className="staff-queue-list">
          {myComplaints.slice(0, 4).map((c) => (
            <div key={c.id} className="staff-queue-card">
              <div className="queue-card-top">
                <b>
                  #{c.id} Â· {c.aiLocation}
                </b>
                <span
                  className={`status-badge status-${c.status.toLowerCase().replace(" ", "")}`}
                >
                  {c.status}
                </span>
              </div>
              <p>{c.description}</p>
              <div className="queue-card-footer">
                <span>
                  Category: <b>{c.aiCategory}</b> Â· Priority:{" "}
                  <b className={`text-${c.aiPriority.toLowerCase()}`}>
                    {c.aiPriority}
                  </b>
                </span>
                <button
                  type="button"
                  className="primary mini-btn"
                  onClick={() => go("staffcomplaints")}
                >
                  Update Status <ChevronRight size={13} />
                </button>
              </div>
            </div>
          ))}
          {!myComplaints.length && (
            <div className="demo-note">
              No assigned complaints in your queue. Great job!
            </div>
          )}
        </div>
      </section>

      <EndToEndWorkflows />
      <AccessibilityBar />
    </>
  );
}

function VisitorGateLogsPage({ role, visitorLogs, setVisitorLogs }) {
  const timeNow = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };
  const displayTime = (value) =>
    value ? String(value).split("T").pop().slice(0, 5) : "-";
  const emptyForm = () => ({
    visitorName: "",
    host: "",
    purpose: "",
    entryTime: timeNow(),
    exitTime: "",
  });
  const [form, setForm] = useState(emptyForm);
  const history = [...visitorLogs].sort((first, second) =>
    String(second.entryTime).localeCompare(String(first.entryTime)),
  );

  const addVisitor = (event) => {
    event.preventDefault();
    const visitor = {
      id: uid("VIS"),
      ...form,
      status: form.exitTime ? "Exited" : "Inside",
    };
    setVisitorLogs((current) => [visitor, ...current]);
    setForm(emptyForm());
  };

  const markExited = (id) =>
    setVisitorLogs((current) =>
      current.map((visitor) =>
        visitor.id === id && visitor.status === "Inside"
          ? { ...visitor, exitTime: timeNow(), status: "Exited" }
          : visitor,
      ),
    );

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW · HOSTEL SECURITY"
        title="Visitor + Gate Logs"
        desc="Record visitor entries and review the complete hostel gate history."
      />
      <div className="two-col-layout">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Add Visitor Record</h3>
              <p>
                New visitors are recorded as Inside unless an exit time is
                provided.
              </p>
            </div>
            <Users size={20} />
          </div>
          <form className="cf-form" onSubmit={addVisitor}>
            <label>
              Visitor Name
              <input
                value={form.visitorName}
                onChange={(event) =>
                  setForm({ ...form, visitorName: event.target.value })
                }
                required
              />
            </label>
            <label>
              Student / Host
              <input
                value={form.host}
                onChange={(event) =>
                  setForm({ ...form, host: event.target.value })
                }
                required
              />
            </label>
            <label>
              Purpose
              <input
                value={form.purpose}
                onChange={(event) =>
                  setForm({ ...form, purpose: event.target.value })
                }
                required
              />
            </label>
            <div className="form-grid">
              <label>
                Entry Time
                <input
                  type="time"
                  value={form.entryTime}
                  onChange={(event) =>
                    setForm({ ...form, entryTime: event.target.value })
                  }
                  required
                />
              </label>
              <label>
                Exit Time
                <input
                  type="time"
                  value={form.exitTime}
                  onChange={(event) =>
                    setForm({ ...form, exitTime: event.target.value })
                  }
                />
              </label>
            </div>
            <button type="submit" className="primary">
              <Plus size={16} /> Add Visitor
            </button>
          </form>
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Visitor History</h3>
              <p>Current visitors and completed visits</p>
            </div>
            <span className="attendance-pill">
              {visitorLogs.length} records
            </span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Student / Host</th>
                  <th>Purpose</th>
                  <th>Entry Time</th>
                  <th>Exit Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.length ? (
                  history.map((visitor) => (
                    <tr key={visitor.id}>
                      <td>
                        <b>{visitor.visitorName}</b>
                      </td>
                      <td>{visitor.host}</td>
                      <td>{visitor.purpose}</td>
                      <td>{displayTime(visitor.entryTime)}</td>
                      <td>{displayTime(visitor.exitTime)}</td>
                      <td>
                        <span
                          className={`status-badge status-${visitor.status.toLowerCase()}`}
                        >
                          {visitor.status}
                        </span>
                      </td>
                      <td>
                        {role === "warden" && visitor.status === "Inside" && (
                          <button
                            type="button"
                            className="ghost mini-btn"
                            onClick={() => markExited(visitor.id)}
                          >
                            Mark Exited
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No visitor records yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

function RoomAssetRecordsPage({ rooms, setRooms }) {
  const [form, setForm] = useState({
    roomNumber: "",
    block: "",
    capacity: "",
    occupants: "0",
  });
  const [assetDrafts, setAssetDrafts] = useState({});
  const [error, setError] = useState("");

  const addRoom = (event) => {
    event.preventDefault();
    const roomNumber = form.roomNumber.trim();
    const block = form.block.trim();
    const capacity = Number(form.capacity);
    const occupants = Number(form.occupants);
    if (occupants > capacity) {
      setError("Occupants cannot exceed room capacity.");
      return;
    }
    if (
      rooms.some(
        (room) =>
          room.roomNumber.toLowerCase() === roomNumber.toLowerCase() &&
          room.block.toLowerCase() === block.toLowerCase(),
      )
    ) {
      setError("That room already exists in this hostel/block.");
      return;
    }
    setRooms((current) => [
      { id: uid("ROOM"), roomNumber, block, capacity, occupants, assets: [] },
      ...current,
    ]);
    setForm({ roomNumber: "", block: "", capacity: "", occupants: "0" });
    setError("");
  };

  const addAsset = (roomId, event) => {
    event.preventDefault();
    const name = (assetDrafts[roomId] || "").trim();
    if (!name) return;
    setRooms((current) =>
      current.map((room) =>
        room.id === roomId
          ? {
              ...room,
              assets: [
                ...room.assets,
                { id: uid("ASSET"), name, status: "Working" },
              ],
            }
          : room,
      ),
    );
    setAssetDrafts((current) => ({ ...current, [roomId]: "" }));
  };

  const updateAssetStatus = (roomId, assetId, status) =>
    setRooms((current) =>
      current.map((room) =>
        room.id === roomId
          ? {
              ...room,
              assets: room.assets.map((asset) =>
                asset.id === assetId ? { ...asset, status } : asset,
              ),
            }
          : room,
      ),
    );

  const updateRoomField = (roomId, field, value) =>
    setRooms((current) =>
      current.map((room) => {
        if (room.id !== roomId) return room;
        if (field === "capacity") {
          const capacity = Math.max(room.occupants, Number(value) || 1);
          return { ...room, capacity };
        }
        return { ...room, [field]: value };
      }),
    );

  const updateOccupants = (roomId, value) =>
    setRooms((current) =>
      current.map((room) =>
        room.id === roomId
          ? {
              ...room,
              occupants: Math.min(
                room.capacity,
                Math.max(0, Number(value) || 0),
              ),
            }
          : room,
      ),
    );

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW · HOSTEL OPERATIONS"
        title="Room + Asset Records"
        desc="Manage room capacity, current occupants, and the condition of hostel assets."
      />
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Add Hostel Room</h3>
            <p>Record a room and its occupancy details</p>
          </div>
          <Home size={20} />
        </div>
        <form className="cf-form" onSubmit={addRoom}>
          <div className="form-grid">
            <label>
              Room Number
              <input
                value={form.roomNumber}
                onChange={(event) =>
                  setForm({ ...form, roomNumber: event.target.value })
                }
                required
              />
            </label>
            <label>
              Hostel / Block
              <input
                value={form.block}
                onChange={(event) =>
                  setForm({ ...form, block: event.target.value })
                }
                required
              />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Capacity
              <input
                type="number"
                min="1"
                step="1"
                value={form.capacity}
                onChange={(event) =>
                  setForm({ ...form, capacity: event.target.value })
                }
                required
              />
            </label>
            <label>
              Occupants
              <input
                type="number"
                min="0"
                step="1"
                value={form.occupants}
                onChange={(event) =>
                  setForm({ ...form, occupants: event.target.value })
                }
                required
              />
            </label>
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="primary">
            <Plus size={16} /> Add Room
          </button>
        </form>
      </section>
      <section className="panel lower">
        <div className="panel-head">
          <div>
            <h3>Room + Asset Register</h3>
            <p>Update room occupancy and asset condition</p>
          </div>
          <span className="attendance-pill">{rooms.length} rooms</span>
        </div>
        <div className="passes-list">
          {rooms.length ? (
            rooms.map((room) => (
              <div className="pass-card" key={room.id}>
                <div className="form-grid">
                  <label>
                    Room Number
                    <input
                      value={room.roomNumber}
                      onChange={(event) =>
                        updateRoomField(
                          room.id,
                          "roomNumber",
                          event.target.value,
                        )
                      }
                    />
                  </label>
                  <label>
                    Hostel / Block
                    <input
                      value={room.block}
                      onChange={(event) =>
                        updateRoomField(room.id, "block", event.target.value)
                      }
                    />
                  </label>
                </div>
                <div className="form-grid">
                  <label>
                    Capacity
                    <input
                      type="number"
                      min={room.occupants || 1}
                      step="1"
                      value={room.capacity}
                      onChange={(event) =>
                        updateRoomField(room.id, "capacity", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Occupants
                    <input
                      aria-label={`Occupants in room ${room.roomNumber}`}
                      type="number"
                      min="0"
                      max={room.capacity}
                      step="1"
                      value={room.occupants}
                      onChange={(event) =>
                        updateOccupants(room.id, event.target.value)
                      }
                    />
                  </label>
                </div>
                <div className="panel-head">
                  <div>
                    <h3>Assets</h3>
                    <p>{room.assets.length} recorded</p>
                  </div>
                </div>
                {room.assets.map((asset) => (
                  <div className="account-row" key={asset.id}>
                    <div className="account-main">
                      <b>{asset.name}</b>
                    </div>
                    <select
                      aria-label={`${asset.name} status in room ${room.roomNumber}`}
                      value={asset.status}
                      onChange={(event) =>
                        updateAssetStatus(room.id, asset.id, event.target.value)
                      }
                    >
                      {["Working", "Damaged", "Maintenance Required"].map(
                        (status) => (
                          <option key={status}>{status}</option>
                        ),
                      )}
                    </select>
                  </div>
                ))}
                <form
                  className="form-grid"
                  onSubmit={(event) => addAsset(room.id, event)}
                >
                  <label>
                    Add Asset
                    <input
                      value={assetDrafts[room.id] || ""}
                      onChange={(event) =>
                        setAssetDrafts((current) => ({
                          ...current,
                          [room.id]: event.target.value,
                        }))
                      }
                      placeholder="Bed, Table, Chair, Fan, Light..."
                      required
                    />
                  </label>
                  <button type="submit" className="primary">
                    <Plus size={16} /> Add Asset
                  </button>
                </form>
              </div>
            ))
          ) : (
            <div className="demo-note">No hostel rooms recorded yet.</div>
          )}
        </div>
      </section>
    </>
  );
}

function StaffComplaintsPage({ complaints, setComplaints, profile }) {
  const staffName = profile.name || "Rajesh Kumar";
  const [filter, setFilter] = useState("All");
  const [remarksMap, setRemarksMap] = useState({});

  const filtered = complaints.filter((c) => {
    if (filter === "Open") return c.status === "Open";
    if (filter === "InProgress") return c.status === "In Progress";
    if (filter === "Resolved")
      return c.status === "Resolved" || c.status === "Closed";
    return true;
  });

  const updateStatus = (id, newStatus) => {
    const remark = remarksMap[id] || "";
    setComplaints(
      complaints.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: newStatus,
            ...(newStatus === "Resolved" || newStatus === "Closed"
              ? { resolvedAt: new Date().toISOString() }
              : {}),
            assignedTo: c.assignedTo || staffName,
            remarks:
              remark ||
              c.remarks ||
              `Status set to ${newStatus} by ${staffName}`,
          };
        }
        return c;
      }),
    );
  };

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW Â· TECHNICIAN WORKBENCH"
        title="Assigned Complaints & Resolutions"
        desc="Update repair progress, log parts replacement, and notify students upon issue resolution."
      />

      <div className="notices-toolbar">
        <div className="category-chips">
          {["All", "Open", "InProgress", "Resolved"].map((f) => (
            <button
              key={f}
              type="button"
              className={`chip ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "InProgress" ? "In Progress" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="staff-complaints-grid">
        {filtered.map((c) => (
          <div key={c.id} className="staff-ticket-card">
            <div className="ticket-header">
              <div>
                <span className="ticket-id">#{c.id}</span>
                <h4>
                  {c.aiCategory} issue in {c.aiLocation}
                </h4>
              </div>
              <span
                className={`status-badge status-${c.status.toLowerCase().replace(" ", "")}`}
              >
                {c.status}
              </span>
            </div>

            <p className="ticket-desc">{c.description}</p>

            <div className="ticket-details-box">
              <div>
                <span>Student:</span>{" "}
                <b>
                  {c.studentName} ({c.studentId})
                </b>
              </div>
              <div>
                <span>Department:</span> <b>{c.aiDepartment}</b>
              </div>
              <div>
                <span>Priority:</span>{" "}
                <b className={`priority-tag ${c.aiPriority.toLowerCase()}`}>
                  {c.aiPriority}
                </b>
              </div>
              <div>
                <span>Logged:</span> <b>{c.createdAt}</b>
              </div>
            </div>

            <div className="ticket-actions-area">
              <label>
                Technician Remarks / Actions Taken:
                <textarea
                  placeholder="e.g. Checked wiring, replaced capacitor in room fan, verified working."
                  defaultValue={c.remarks}
                  onChange={(e) =>
                    setRemarksMap({ ...remarksMap, [c.id]: e.target.value })
                  }
                  rows={2}
                />
              </label>

              <div className="status-button-group">
                <button
                  type="button"
                  className={`status-btn ${c.status === "In Progress" ? "current" : ""}`}
                  onClick={() => updateStatus(c.id, "In Progress")}
                >
                  <Clock3 size={14} /> Mark In Progress
                </button>
                <button
                  type="button"
                  className="primary status-btn resolve-btn"
                  onClick={() => updateStatus(c.id, "Resolved")}
                >
                  <CheckCircle2 size={14} /> Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ============================================================================
// ADMIN MANAGEMENT PAGES
// ============================================================================

function AdminNoticesPage({ notices, setNotices }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("Academic");
  const [target, setTarget] = useState("All");
  const [author, setAuthor] = useState("Campus Administration");
  const [msg, setMsg] = useState("");

  const publish = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const newNotice = {
      id: uid("NOT"),
      title,
      body,
      category,
      target,
      author,
      date: new Date().toISOString().slice(0, 10),
      read: false,
    };
    setNotices([newNotice, ...notices]);
    setTitle("");
    setBody("");
    setMsg(`Announcement "${newNotice.title}" published to ${target}!`);
  };

  const deleteNotice = (id) => {
    setNotices(notices.filter((n) => n.id !== id));
  };

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW Â· BROADCAST ENGINE"
        title="Notice Management & Audience Targeting"
        desc="Create targeted campus bulletins filtered by Branch, Year, Batch, or Hostel block."
      />

      <WorkflowStepper
        steps={[
          "1. Admin creates",
          "2. Target selected",
          "3. Published",
          "4. Sent via engine",
          "5. Read tracking",
        ]}
        currentStep={2}
        color="purple"
      />

      <div className="two-col-layout">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Publish New Announcement</h3>
              <p>Instant broadcast to web portal and mobile app</p>
            </div>
            <Megaphone size={20} />
          </div>
          <form onSubmit={publish} className="cf-form">
            <label>
              Announcement Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hostel Mess Timings Revised"
                required
              />
            </label>
            <div className="form-grid">
              <label>
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Academic</option>
                  <option>Hostel</option>
                  <option>Events</option>
                  <option>General</option>
                  <option>Emergency</option>
                </select>
              </label>
              <label>
                Target Audience
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option>All</option>
                  <option>Hostel Students</option>
                  <option>Hostel Block A</option>
                  <option>Hostel Block B</option>
                  <option>CSE Department</option>
                  <option>Final Year Students</option>
                  <option>Faculty & Staff</option>
                </select>
              </label>
            </div>
            <label>
              Author / Authority
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </label>
            <label>
              Notice Body
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Detailed message..."
                rows={4}
                required
              />
            </label>
            <button type="submit" className="primary big">
              <Send size={16} /> Publish & Notify Target Audience
            </button>
          </form>
          {msg && (
            <div className="success-box">
              <CheckCircle2 size={16} /> {msg}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Published Announcements</h3>
              <p>Active bulletins & reach metrics</p>
            </div>
            <span className="attendance-pill">{notices.length} active</span>
          </div>
          <div className="passes-list">
            {notices.map((n) => (
              <div key={n.id} className="pass-card">
                <div className="pass-card-top">
                  <b>{n.title}</b>
                  <button
                    type="button"
                    className="danger mini-btn"
                    onClick={() => deleteNotice(n.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="pass-reason">{n.body}</p>
                <div className="notice-reach-bar">
                  <span>
                    Target: <b>{n.target}</b>
                  </span>
                  <span>
                    Category: <b>{n.category}</b>
                  </span>
                  <span>
                    Delivered: <b>1,240</b>
                  </span>
                  <span className="text-green">
                    Read: <b>89%</b>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function AdminGatePassPage({
  role,
  gatePasses,
  setGatePasses,
  setNotifications,
}) {
  const isAdmin = role === "admin";
  const [filter, setFilter] = useState("All");
  const [rejectionReasons, setRejectionReasons] = useState({});

  const visibleRequests = isAdmin
    ? gatePasses.filter((p) => p.requestType === "Leave")
    : gatePasses.filter((p) =>
        p.requestType === "Leave"
          ? p.status === "Admin Approved - Pending Warden"
          : [
              "Pending Warden Approval",
              "Pending",
              "Pending Admin Approval",
            ].includes(p.status),
      );
  const filtered = visibleRequests.filter(
    (p) => filter === "All" || p.status === filter,
  );

  const updateStatus = (id, decision, rejectionReason = "") => {
    const newStatus =
      decision === "complete"
        ? "Completed"
        : isAdmin
          ? decision === "approve"
            ? "Admin Approved - Pending Warden"
            : "Rejected by Admin"
          : decision === "approve"
            ? "Approved"
            : "Rejected by Warden";
    setGatePasses((current) =>
      current.map((p) => {
        if (p.id !== id) return p;
        if (
          isAdmin &&
          (p.requestType !== "Leave" || p.status !== "Pending Admin Approval")
        )
          return p;
        if (
          !isAdmin &&
          !(p.requestType === "Leave"
            ? p.status === "Admin Approved - Pending Warden"
            : [
                "Pending Warden Approval",
                "Pending",
                "Pending Admin Approval",
              ].includes(p.status))
        )
          return p;
        return {
          ...p,
          status: newStatus,
          ...(decision === "approve" && !isAdmin
            ? { approvedBy: "Warden" }
            : {}),
          ...(decision === "reject" ? { rejectionReason } : {}),
        };
      }),
    );
    setNotifications((prev) => [
      {
        id: Date.now(),
        title: `Leave / Gate Pass ${newStatus}`,
        text: `Request #${id} status changed to ${newStatus}${rejectionReason ? `: ${rejectionReason}` : ""}.`,
        read: false,
      },
      ...prev,
    ]);
  };

  const rejectRequest = (id) => {
    const reason = rejectionReasons[id]?.trim();
    if (!reason) return;
    updateStatus(id, "reject", reason);
    setRejectionReasons((current) => ({ ...current, [id]: "" }));
  };

  return (
    <>
      <PageTitle
        eyebrow={`CAMPUSFLOW Â· ${isAdmin ? "ADMIN" : "WARDEN"} REVIEW`}
        title="Gate Pass Management"
        desc={
          isAdmin
            ? "Review student Leave requests before forwarding approved requests to the Warden."
            : "Review Admin-approved Leave requests and student Gate Pass requests."
        }
      />

      {isAdmin && (
        <div className="notices-toolbar">
          <div className="category-chips">
            {[
              "All",
              "Pending Admin Approval",
              "Admin Approved - Pending Warden",
              "Approved",
              "Rejected by Admin",
              "Rejected by Warden",
            ].map((s) => (
              <button
                key={s}
                type="button"
                className={`chip ${filter === s ? "active" : ""}`}
                onClick={() => setFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pass ID</th>
                <th>Student</th>
                <th>Request / Destination</th>
                <th>Schedule</th>
                <th>Reason</th>
                <th>Parent / Emergency Contact</th>
                <th>Rejection Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!filtered.length && (
                <tr>
                  <td colSpan={9}>
                    {isAdmin
                      ? "No Leave requests found."
                      : "No Leave or Gate Pass requests are waiting for Warden review."}
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>#{p.id}</b>
                  </td>
                  <td>
                    <b>{p.studentName}</b>
                    <br />
                    <small>{p.studentId}</small>
                  </td>
                  <td>
                    {p.requestType || "Gate Pass"}
                    {p.destination && (
                      <>
                        <br />
                        <small>{p.destination}</small>
                      </>
                    )}
                  </td>
                  <td>
                    {p.requestType === "Leave"
                      ? `From: ${p.date} / To: ${p.returnDate}`
                      : `Out: ${p.time} / Return: ${p.returnTime}`}
                  </td>
                  <td>{p.reason}</td>
                  <td>{p.emergencyContact || "-"}</td>
                  <td>{p.rejectionReason || "-"}</td>
                  <td>
                    <span
                      className={`status-badge status-${p.status.toLowerCase()}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {isAdmin &&
                      p.requestType === "Leave" &&
                      p.status === "Pending Admin Approval" && (
                        <div className="action-button-group">
                          <button
                            type="button"
                            className="primary mini-btn"
                            onClick={() => updateStatus(p.id, "approve")}
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <input
                            aria-label={`Rejection reason for ${p.id}`}
                            placeholder="Reason for rejection"
                            value={rejectionReasons[p.id] || ""}
                            onChange={(event) =>
                              setRejectionReasons((current) => ({
                                ...current,
                                [p.id]: event.target.value,
                              }))
                            }
                          />
                          <button
                            type="button"
                            className="danger mini-btn"
                            disabled={!rejectionReasons[p.id]?.trim()}
                            onClick={() => rejectRequest(p.id)}
                          >
                            <X size={13} /> Reject
                          </button>
                        </div>
                      )}
                    {!isAdmin &&
                      (p.requestType === "Leave"
                        ? p.status === "Admin Approved - Pending Warden"
                        : [
                            "Pending Warden Approval",
                            "Pending",
                            "Pending Admin Approval",
                          ].includes(p.status)) && (
                        <div className="action-button-group">
                          <button
                            type="button"
                            className="primary mini-btn"
                            onClick={() => updateStatus(p.id, "approve")}
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <input
                            aria-label={`Rejection reason for ${p.id}`}
                            placeholder="Reason for rejection"
                            value={rejectionReasons[p.id] || ""}
                            onChange={(event) =>
                              setRejectionReasons((current) => ({
                                ...current,
                                [p.id]: event.target.value,
                              }))
                            }
                          />
                          <button
                            type="button"
                            className="danger mini-btn"
                            disabled={!rejectionReasons[p.id]?.trim()}
                            onClick={() => rejectRequest(p.id)}
                          >
                            <X size={13} /> Reject
                          </button>
                        </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function AdminCertificatePage({ certificateRequests, setCertificateRequests }) {
  const [filter, setFilter] = useState("All");

  const filtered = certificateRequests.filter((c) => {
    if (filter === "All") return true;
    return c.status === filter;
  });

  const verifyAndGenerate = (id) => {
    setCertificateRequests(
      certificateRequests.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: "Generated",
            verifiedBy: "Registrar Office",
            completedDate: new Date().toISOString().slice(0, 10),
          };
        }
        return c;
      }),
    );
  };

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW Â· REGISTRAR DESK"
        title="Certificate Issuance Management"
        desc="Verify student credentials, approve Bonafide/TC certificates, and generate PDF copies."
      />

      <div className="notices-toolbar">
        <div className="category-chips">
          {["All", "Submitted", "Generated"].map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Student</th>
                <th>Certificate Type</th>
                <th>Purpose</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <b>#{c.id}</b>
                  </td>
                  <td>
                    <b>{c.studentName}</b>
                    <br />
                    <small>{c.studentId}</small>
                  </td>
                  <td>
                    <b>{c.type}</b>
                  </td>
                  <td>{c.purpose}</td>
                  <td>{c.requestDate}</td>
                  <td>
                    <span
                      className={`status-badge status-${c.status.toLowerCase()}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.status === "Submitted" ? (
                      <button
                        type="button"
                        className="primary mini-btn"
                        onClick={() => verifyAndGenerate(c.id)}
                      >
                        <Award size={13} /> Approve & Generate PDF
                      </button>
                    ) : (
                      <span className="text-green">
                        <CheckCircle2 size={13} /> Ready for Download
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function AdminHostelComplaintPage({ complaints, setComplaints }) {
  const recurring = detectRecurringIssues(complaints);
  const staffMembers = [
    "Rajesh Kumar (Electrical)",
    "Suresh Pal (Plumbing)",
    "Anita Devi (Housekeeping)",
    "Ramesh Verma (Carpentry)",
  ];

  const assignStaff = (id, staff) => {
    setComplaints(
      complaints.map((c) =>
        c.id === id ? { ...c, assignedTo: staff, status: "In Progress" } : c,
      ),
    );
  };

  return (
    <>
      <PageTitle
        eyebrow="CAMPUSFLOW Â· FACILITY OPERATIONS"
        title="AI Complaint Routing & Recurring Issues"
        desc="Review automatically routed complaints, inspect recurring facility hotspots, and assign maintenance staff."
      />

      {recurring.length > 0 && (
        <div className="recurring-issue-alert">
          <div className="recurring-alert-head">
            <AlertTriangle size={20} />
            <div>
              <b>AI Hotspot Warning: Recurring Facility Issues Detected</b>
              <p>
                The pattern engine detected repetitive issues in the same hostel
                location. Immediate inspection recommended.
              </p>
            </div>
          </div>
          <div className="recurring-grid">
            {recurring.map((r) => (
              <div key={r.key} className="recurring-chip">
                <span className="recurring-tag">{r.category}</span>
                <span className="recurring-loc">{r.location}</span>
                <span className="recurring-count">{r.count} complaints</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Student / Loc</th>
                <th>Issue Description</th>
                <th>AI Category</th>
                <th>Priority</th>
                <th>AI Department</th>
                <th>Assigned Staff</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td>
                    <b>#{c.id}</b>
                  </td>
                  <td>
                    <b>{c.studentName}</b>
                    <br />
                    <small>{c.aiLocation}</small>
                  </td>
                  <td>{c.description}</td>
                  <td>
                    <span
                      className={`badge-cat cat-${c.aiCategory?.toLowerCase()}`}
                    >
                      {c.aiCategory}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`priority-tag ${c.aiPriority?.toLowerCase()}`}
                    >
                      {c.aiPriority}
                    </span>
                  </td>
                  <td>
                    <b>{c.aiDepartment}</b>
                  </td>
                  <td>
                    <select
                      value={c.assignedTo || ""}
                      onChange={(e) => assignStaff(c.id, e.target.value)}
                      className="table-staff-select"
                    >
                      <option value="">Assign Technician...</option>
                      {staffMembers.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${c.status.toLowerCase().replace(" ", "")}`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// Student Attendance page - opened when a student scans the QR code
// Uses navigator.mediaDevices.getUserMedia with facingMode: "environment" for QR scanning
function StudentAttendance() {
  const sessionInfo = parseAttendanceSessionFromUrl();
  const [camActive, setCamActive] = useState(false);
  const [camError, setCamError] = useState("");
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const [markedSession, setMarkedSession] = useState("");
  const scannerRef = useRef(null);
  const startingRef = useRef(false);

  const stopScanner = () => {
    const activeScanner = scannerRef.current;
    scannerRef.current = null;
    startingRef.current = false;
    if (activeScanner) {
      try {
        activeScanner.stop().catch(() => {});
      } catch {}
      try {
        activeScanner.clear().catch(() => {});
      } catch {}
    }
    setCamActive(false);
  };

  const markAttendance = async (value) => {
    let token = value;
    try {
      token = new URL(value).searchParams.get("token") || "";
    } catch {}
    if (!token) return;
    try {
      const result = await attendanceApi("/api/attendance/mark", {
        token,
        studentId: load("cc_profile", {}).studentId || "QR-STUDENT",
      });
      const stored = load("cc_student_attendance", []);
      if (stored.some((a) => a.session === result.sessionId)) {
        setState("duplicate");
        setMessage("Attendance already marked for this session.");
      } else {
        const next = {
          date: new Date().toISOString().slice(0, 10),
          subject: result.subject || sessionInfo?.class || "Data Structures",
          teacher: "Dr. Sharma",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          room: result.room || sessionInfo?.class || "204",
          status: "Present",
          session: result.sessionId,
        };
        save("cc_student_attendance", [next, ...stored]);
        setMarkedSession(result.sessionId);
        setState("success");
        setMessage("Attendance Marked!");
      }
    } catch (error) {
      setState("error");
      setMessage(error.message);
    }
    stopScanner();
  };

  useEffect(() => {
    if (sessionInfo?.token) markAttendance(sessionInfo.token);
  }, []);

  // html5-qrcode needs its target element to exist before start() is called.
  // The old code started the scanner before React had rendered that element.
  useEffect(() => {
    if (!camActive) return;

    let cancelled = false;
    const startQrScanner = async () => {
      if (startingRef.current || scannerRef.current) return;
      startingRef.current = true;
      setCamError("");

      await new Promise((resolve) => requestAnimationFrame(resolve));
      const region = document.getElementById("student-qr-scanner-region");
      if (cancelled || !region) {
        startingRef.current = false;
        setCamActive(false);
        setCamError(
          "Camera scanner could not be initialized. Please try again.",
        );
        return;
      }

      const qrScanner = new Html5Qrcode("student-qr-scanner-region");
      scannerRef.current = qrScanner;

      try {
        await qrScanner.start(
          { facingMode: { ideal: "environment" } },
          {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const size = Math.max(
                180,
                Math.min(
                  280,
                  Math.floor(
                    Math.min(viewfinderWidth, viewfinderHeight) * 0.65,
                  ),
                ),
              );
              return { width: size, height: size };
            },
            aspectRatio: 1,
          },
          (decodedText) => {
            markAttendance(decodedText);
          },
          () => {},
        );
        startingRef.current = false;
      } catch (err) {
        console.error("Student QR scanner error:", err);
        startingRef.current = false;
        scannerRef.current = null;
        try {
          await qrScanner.clear();
        } catch {}
        if (!cancelled) {
          setCamActive(false);
          const name = err?.name || "";
          if (name === "NotAllowedError" || name === "PermissionDeniedError") {
            setCamError(
              "Camera permission denied. Please allow camera access in your browser settings and try again.",
            );
          } else if (name === "NotFoundError") {
            setCamError("No camera was found on this device.");
          } else if (
            name === "NotReadableError" ||
            name === "TrackStartError"
          ) {
            setCamError(
              "Camera is already being used by another app. Close other camera apps and try again.",
            );
          } else {
            setCamError(
              "Could not start the camera. Make sure you are using HTTPS and allow camera access.",
            );
          }
        }
      }
    };

    startQrScanner();

    return () => {
      cancelled = true;
      const activeScanner = scannerRef.current;
      scannerRef.current = null;
      startingRef.current = false;
      if (activeScanner) {
        try {
          activeScanner.stop().catch(() => {});
        } catch {}
        try {
          activeScanner.clear().catch(() => {});
        } catch {}
      }
    };
  }, [camActive]);

  useEffect(() => () => stopScanner(), []);

  return (
    <div className="student-attendance-page">
      <div className="login-grid" />
      <div className="floating-building b1" />
      <div className="floating-building b2" />
      <div className="floating-building b3" />
      <div className="student-attendance-card">
        <div className="card-glow" />
        <div className="eyebrow">CAMPUS PLUS Â· ATTENDANCE</div>
        <h1>Mark Attendance</h1>
        <p className="muted">
          Scan the classroom QR code to record your presence.
        </p>
        {sessionInfo?.session && (
          <div className="session-badge">
            <QrCode size={14} /> Session: {sessionInfo.session}
          </div>
        )}

        <div className="student-scanner-window">
          <div
            id="student-qr-scanner-region"
            className={`qr-scanner-region ${camActive ? "active" : "inactive"}`}
            aria-label="Student QR camera scanner"
          />
          {!camActive && (
            <>
              <div className="scanner-corners" />
              <QrCode size={72} />
              <div className="scan-line" />
              <span>CAMERA / QR SCANNER</span>
            </>
          )}
        </div>

        <div className="scanner-status">
          <Camera />
          <div>
            <b>{camActive ? "Camera active" : "Camera ready"}</b>
            <span>
              {camActive
                ? "Position the classroom QR inside the frame."
                : camError || "Press Start Camera to begin scanning."}
            </span>
          </div>
        </div>

        {!camActive && (
          <button
            className="primary big"
            onClick={() => {
              setCamError("");
              setState("idle");
              setMessage("");
              setCamActive(true);
            }}
          >
            <Camera /> Start Camera
          </button>
        )}
        {camActive && (
          <button className="ghost" onClick={stopScanner}>
            <X /> Stop Camera
          </button>
        )}

        {camError && (
          <div className="result error">
            <div>
              <AlertTriangle />
            </div>
            <div>
              <b>Camera error</b>
              <span>{camError}</span>
            </div>
          </div>
        )}
        {state !== "idle" && (
          <div className={`result ${state}`}>
            <div>
              {state === "success" ? <CheckCircle2 /> : <AlertTriangle />}
            </div>
            <div>
              <b>{message}</b>
              {state === "success" && (
                <span>Session: {markedSession} Â· Status: Present</span>
              )}
            </div>
          </div>
        )}

        <div className="demo-note">
          Camera uses your device's rear camera. Works on Android Chrome and
          iPhone Safari when served over HTTPS.
        </div>
      </div>
    </div>
  );
}

export default App;
