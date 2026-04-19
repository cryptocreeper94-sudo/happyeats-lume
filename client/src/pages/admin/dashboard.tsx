import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Package, Users, CreditCard, Settings, 
  ArrowLeft, TrendingUp, Clock, CheckCircle, AlertCircle,
  DollarSign, ShoppingBag, MapPin, Phone, ChevronRight,
  Search, Globe, FileText, Save, BarChart3, Megaphone,
  FileDown, Mail, Presentation, Share2, Copy, Printer,
  User, Camera, Upload, BadgeCheck, Building, Car, Receipt, Route,
  BookOpen, Scan, AlertTriangle, FolderOpen, Rocket, Target, 
  Handshake, FileImage, Trash2, Eye, Calendar, X,
  ShoppingCart, Palette, MessageSquare, Navigation, Calculator, Circle, Truck, MessageCircle,
  Shield, Lock, KeyRound, EyeOff, Download, Award, ChefHat
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getLocations, getOrderStatus, setOrderStatus } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { BlogManager } from "@/components/blog-manager";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import RevenueDashboard from "@/components/revenue-dashboard";
import { UserGreeting } from "@/components/user-greeting";
import OrderHistoryManager from "@/components/order-history-manager";
import DailySettlementReport from "@/components/daily-settlement-report";

interface PartnerDocument {
  id: number;
  partnerSlug: string;
  documentType: string;
  fileName: string;
  storagePath: string;
  mimeType?: string;
  fileSize?: number;
  uploadedAt: string;
  uploadedBy?: string;
  verified: boolean;
}

export default function AdminDashboard() {
  const { user, login, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "home";
  });
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/team");
    }
  }, [isAuthenticated, setLocation]);
  
  // Password setup modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalPassword, setModalPassword] = useState('');
  const [modalConfirmPassword, setModalConfirmPassword] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [modalPasswordError, setModalPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Explanation modal states for interactive badges
  const [showProfitSplitModal, setShowProfitSplitModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showFranchiseFeeModal, setShowFranchiseFeeModal] = useState(false);
  const [showProjectionsModal, setShowProjectionsModal] = useState(false);
  const [showOperationalFeeModal, setShowOperationalFeeModal] = useState(false);
  
  // Interactive projections calculator
  const [projOrdersPerWeek, setProjOrdersPerWeek] = useState(50);
  const [projAvgOrderValue, setProjAvgOrderValue] = useState(25);
  
  // Calculate projected earnings based on inputs
  const calculateProjections = () => {
    const serviceFeeRate = 0.20;
    const deliveryFee = 3.99;
    const ownerSplit = 0.80;
    
    const weeklyRevenue = projOrdersPerWeek * ((projAvgOrderValue * serviceFeeRate) + deliveryFee);
    const weeklyProfit = weeklyRevenue * ownerSplit;
    const monthlyProfit = weeklyProfit * 4.33;
    const yearlyProfit = monthlyProfit * 12;
    
    return {
      weeklyRevenue: weeklyRevenue.toFixed(0),
      weeklyProfit: weeklyProfit.toFixed(0),
      monthlyProfit: monthlyProfit.toFixed(0),
      yearlyProfit: yearlyProfit.toFixed(0)
    };
  };
  
  // Show password modal on mount if user needs setup
  useEffect(() => {
    if (user?.needsPasswordSetup) {
      setShowPasswordModal(true);
    }
  }, [user?.needsPasswordSetup]);
  
  // Modal password requirements
  const modalPasswordRequirements = {
    minLength: modalPassword.length >= 8,
    hasCapital: /[A-Z]/.test(modalPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(modalPassword),
    matches: modalPassword === modalConfirmPassword && modalPassword.length > 0
  };
  const allModalRequirementsMet = modalPasswordRequirements.minLength && 
    modalPasswordRequirements.hasCapital && 
    modalPasswordRequirements.hasSpecial && 
    modalPasswordRequirements.matches;
  
  const { data: stripeStatus } = useQuery<{ configured: boolean; message: string }>({
    queryKey: ["/api/stripe/status"],
  });

  // Fetch partner agreement for personalized greeting
  const { data: partnerAgreement } = useQuery<{ partnerName: string; region: string } | null>({
    queryKey: ["partner-agreement", "kathy"],
    queryFn: async () => {
      const res = await fetch("/api/partner-agreements/kathy");
      if (!res.ok) return null;
      return res.json();
    },
  });
  
  // Get first name from partner agreement
  const partnerFirstName = partnerAgreement?.partnerName?.split(' ')[0] || user?.name || "Partner";
  const partnerRegion = partnerAgreement?.region || "Nashville • Lebanon • Mt. Juliet, TN";
  
  // Fetch existing partner documents to check what's already uploaded
  const { data: partnerDocs = [] } = useQuery<PartnerDocument[]>({
    queryKey: ["partner-documents", "kathy"],
    queryFn: async () => {
      const res = await fetch("/api/partner-documents/kathy");
      if (!res.ok) return [];
      return res.json();
    },
  });
  
  // Derive document upload status from actual data
  const documentsUploaded = {
    idFront: partnerDocs.some(d => d.documentType === 'id_front'),
    idBack: partnerDocs.some(d => d.documentType === 'id_back'),
    idOrBirthCert: partnerDocs.some(d => d.documentType === 'birth_certificate' || d.documentType === 'passport'),
    irsVerification: partnerDocs.some(d => d.documentType === 'irs_cp575' || d.documentType === 'irs_147c')
  };
  
  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [credentials, setCredentials] = useState({ username: '', password: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [credentialsSaved, setCredentialsSaved] = useState(false);
  const [w9Form, setW9Form] = useState({
    legalName: '', businessName: '', businessType: 'sole_proprietor', ein: '',
    address: '', city: '', state: 'TN', zip: '',
    signature: '', signedAt: ''
  });
  const [w9Error, setW9Error] = useState('');
  const [w9Saved, setW9Saved] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [docUploadError, setDocUploadError] = useState('');

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!regex.test(password)) {
      return 'Password must be at least 8 characters with 1 uppercase letter and 1 special character (!@#$%^&*)';
    }
    return '';
  };

  // Handle modal password setup
  const handleModalPasswordSave = async () => {
    if (!allModalRequirementsMet) return;
    
    try {
      const res = await fetch(`/api/tenants/${user?.id}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: modalPassword, pin: user?.pin })
      });
      
      if (res.ok) {
        // Update user state to remove needsPasswordSetup flag
        if (user) {
          login({ ...user, needsPasswordSetup: false });
        }
        setShowPasswordModal(false);
        setCredentialsSaved(true);
        setModalPassword('');
        setModalConfirmPassword('');
        setModalPasswordError('');
        setIsChangingPassword(false);
      } else {
        const data = await res.json();
        setModalPasswordError(data.error || 'Failed to set password');
      }
    } catch {
      setModalPasswordError('Failed to set password');
    }
  };

  const handleSaveCredentials = async () => {
    const error = validatePassword(credentials.password);
    if (error) {
      setPasswordError(error);
      return;
    }
    if (credentials.password !== credentials.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    try {
      const res = await fetch('/api/partner-agreements/kathy/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: credentials.username, password: credentials.password })
      });
      if (res.ok) {
        setCredentialsSaved(true);
        setPasswordError('');
        setOnboardingStep(2);
      } else {
        const data = await res.json();
        setPasswordError(data.error || 'Failed to save credentials');
      }
    } catch {
      setPasswordError('Failed to save credentials');
    }
  };

  const handleSaveW9 = async () => {
    // Validate required fields
    if (!w9Form.legalName.trim()) {
      setW9Error('Legal name is required');
      return;
    }
    if (!w9Form.ein.trim()) {
      setW9Error('EIN or SSN is required');
      return;
    }
    if (!w9Form.address.trim() || !w9Form.city.trim() || !w9Form.state.trim() || !w9Form.zip.trim()) {
      setW9Error('Complete address is required');
      return;
    }
    if (!w9Form.signature.trim()) {
      setW9Error('Signature is required - type your legal name to sign');
      return;
    }
    
    setW9Error('');
    const signedAt = new Date().toISOString();
    
    try {
      const res = await fetch('/api/partner-agreements/kathy/w9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...w9Form, signedAt })
      });
      if (res.ok) {
        setW9Form(prev => ({ ...prev, signedAt }));
        setW9Saved(true);
        setOnboardingStep(3);
      }
    } catch {
      console.error('Failed to save W-9');
    }
  };

  const handleDocumentUpload = async (documentType: string, file: File) => {
    if (!file) return;
    
    setUploadingDoc(documentType);
    setDocUploadError('');
    
    try {
      // Step 1: Get presigned upload URL
      const urlRes = await fetch('/api/partner-documents/kathy/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size
        })
      });
      
      if (!urlRes.ok) throw new Error('Failed to get upload URL');
      
      const { uploadURL, storagePath, fileName } = await urlRes.json();
      
      // Step 2: Upload directly to cloud storage
      const uploadRes = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });
      
      if (!uploadRes.ok) throw new Error('Failed to upload file');
      
      // Step 3: Save document metadata
      const metaRes = await fetch('/api/partner-documents/kathy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          fileName,
          storagePath,
          mimeType: file.type,
          fileSize: file.size,
          uploadedBy: 'partner'
        })
      });
      
      if (!metaRes.ok) throw new Error('Failed to save document');
      
      // Refresh documents list to update UI
      queryClient.invalidateQueries({ queryKey: ["partner-documents", "kathy"] });
      
    } catch (err) {
      console.error('Document upload error:', err);
      setDocUploadError('Failed to upload document. Please try again.');
    } finally {
      setUploadingDoc(null);
    }
  };
  
  const [scannerImage, setScannerImage] = useState<string | null>(null);
  const [scannedText, setScannedText] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [savedDocuments, setSavedDocuments] = useState<Array<{id: number, name: string, type: string, date: string, text: string}>>([
    { id: 1, name: "Fuel Receipt - Shell", type: "receipt", date: "2026-01-24", text: "Shell Gas Station\nNashville, TN\nDiesel: 85.3 gal\nTotal: $342.15" },
    { id: 2, name: "Maintenance Invoice", type: "invoice", date: "2026-01-22", text: "Quick Lube Plus\nOil Change + Filter\nTotal: $89.99" },
  ]);
  
  const [incidents, setIncidents] = useState<Array<{id: number, type: string, date: string, location: string, description: string, photos: number, status: string}>>([
    { id: 1, type: "Minor Damage", date: "2026-01-20", location: "Pilot Travel Center, Nashville", description: "Small scratch on rear bumper from parking lot post", photos: 2, status: "documented" },
  ]);
  const [incidentForm, setIncidentForm] = useState({ type: "", location: "", description: "" });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatRevenue = (amount: number) => {
    if (amount >= 10000) return `$${(amount / 1000).toFixed(0)}k`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
    return `$${amount.toFixed(0)}`;
  };
  const [seoTitle, setSeoTitle] = useState("Happy Eats - Delivery for Drivers");
  const [seoDescription, setSeoDescription] = useState("Order food, parts, and supplies delivered right to your truck. 24/7 concierge service for truck drivers in Nashville, Lebanon, and Mt. Juliet, TN.");
  const [seoKeywords, setSeoKeywords] = useState("truck driver delivery, trucker food delivery, truck parts, Nashville truck stop");
  
  // Dispatch & Zone Control
  const [calcOrderAmount, setCalcOrderAmount] = useState("");
  const [calcDistance, setCalcDistance] = useState("");
  const [drivers, setDrivers] = useState([
    { id: 1, name: "Kathy", zone: "Lebanon", status: "on-duty", location: "Lebanon City Center" },
    { id: 2, name: "Runner 2", zone: "Mt. Juliet", status: "off-duty", location: "" },
  ]);
  const [zones, setZones] = useState([
    { id: "lebanon", name: "Lebanon", center: "Lebanon, TN", zipCode: "37087", radius: 10, color: "emerald" },
    { id: "mtjuliet", name: "Mt. Juliet", center: "Mt. Juliet, TN", zipCode: "37122", radius: 10, color: "violet" },
  ]);
  
  const updateZoneRadius = (zoneId: string, newRadius: number) => {
    setZones(prev => prev.map(z => 
      z.id === zoneId ? { ...z, radius: newRadius } : z
    ));
  };
  
  const calculateProfit = () => {
    const orderAmount = parseFloat(calcOrderAmount) || 0;
    const distance = parseFloat(calcDistance) || 0;
    const roundTripMiles = distance * 2;
    
    const serviceFee = orderAmount * 0.30;
    const deliveryFee = 4.99;
    const totalRevenue = serviceFee + deliveryFee;
    
    const costPerMile = 0.70;
    const totalCost = roundTripMiles * costPerMile;
    
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    return {
      serviceFee,
      deliveryFee,
      totalRevenue,
      roundTripMiles,
      totalCost,
      profit,
      profitMargin,
      isProfitable: profit > 0
    };
  };
  
  const toggleDriverStatus = (driverId: number) => {
    setDrivers(prev => prev.map(d => 
      d.id === driverId 
        ? { ...d, status: d.status === "on-duty" ? "off-duty" : "on-duty" }
        : d
    ));
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      setScannerImage(imageData);
      setIsScanning(true);
      setScannedText("");
      
      try {
        const Tesseract = await import('tesseract.js');
        const result = await Tesseract.recognize(imageData, 'eng', {
          logger: (m: any) => console.log(m)
        });
        setScannedText(result.data.text);
      } catch (error) {
        console.error('OCR Error:', error);
        setScannedText("Error scanning document. Please try again.");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const saveDocument = () => {
    if (!scannedText) return;
    const newDoc = {
      id: Date.now(),
      name: `Scanned Document ${savedDocuments.length + 1}`,
      type: "scanned",
      date: new Date().toISOString().split('T')[0],
      text: scannedText
    };
    setSavedDocuments([newDoc, ...savedDocuments]);
    setScannerImage(null);
    setScannedText("");
  };
  
  const submitIncident = () => {
    if (!incidentForm.type || !incidentForm.description) return;
    const newIncident = {
      id: Date.now(),
      type: incidentForm.type,
      date: new Date().toISOString().split('T')[0],
      location: incidentForm.location || "Not specified",
      description: incidentForm.description,
      photos: 0,
      status: "pending"
    };
    setIncidents([newIncident, ...incidents]);
    setIncidentForm({ type: "", location: "", description: "" });
  };

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => getLocations(),
  });

  const { data: orderStatus = "green" } = useQuery({
    queryKey: ["order-status"],
    queryFn: getOrderStatus,
  });

  const statusMutation = useMutation({
    mutationFn: setOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-status"] });
    },
  });

  // Fetch real orders from database
  const { data: liveOrders = [] } = useQuery({
    queryKey: ["tenant-orders", 1],
    queryFn: async () => {
      const res = await fetch("/api/tenants/1/orders");
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 10000,
  });

  const analyticsBasePath = user?.id ? `/api/tenants/${user.id}/analytics` : "/api/analytics";
  const { data: analyticsData } = useQuery<{
    todayViews: number; todayUnique: number;
    weekViews: number; weekUnique: number;
    dailyTraffic: { date: string; views: number; visitors: number }[];
  }>({
    queryKey: ["/api/analytics/dashboard", user?.id],
    queryFn: async () => {
      const res = await fetch(`${analyticsBasePath}/dashboard`);
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 60000,
  });

  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-orders"] });
    },
  });

  const stats = {
    todayOrders: 24,
    pendingOrders: 3,
    completedOrders: 21,
    revenue: 847.50,
    activeDrivers: 12,
    avgDeliveryTime: "18 min"
  };

  const weeklyData = [
    { day: "Mon", orders: 18, revenue: 612 },
    { day: "Tue", orders: 22, revenue: 789 },
    { day: "Wed", orders: 19, revenue: 654 },
    { day: "Thu", orders: 28, revenue: 945 },
    { day: "Fri", orders: 35, revenue: 1203 },
    { day: "Sat", orders: 31, revenue: 1089 },
    { day: "Sun", orders: 24, revenue: 847 },
  ];

  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue));

  const recentOrders = [
    { id: 1001, driver: "Mike T.", phone: "(615) 555-0123", location: "Pilot Travel Center", items: ["Double Burger", "Large Fries", "Sweet Tea"], total: 28.50, status: "delivered", time: "5 min ago", truckSpot: "Lot B, Space 42", notes: "Extra napkins please" },
    { id: 1002, driver: "Sarah J.", phone: "(615) 555-0456", location: "Big Rig Burger Co.", items: ["Trucker Special", "Coffee"], total: 19.99, status: "in_progress", time: "12 min ago", truckSpot: "Lot A, Space 15", notes: "" },
    { id: 1003, driver: "Carlos M.", phone: "(615) 555-0789", location: "Love's Travel Stop", items: ["Oil Filter", "Wiper Blades", "Air Freshener", "Energy Drinks (4)", "Snacks"], total: 45.75, status: "pending", time: "Just now", truckSpot: "Fuel Island 3", notes: "Call when arriving" },
    { id: 1004, driver: "Jenny W.", phone: "(615) 555-0234", location: "TA Travel Center", items: ["Breakfast Combo", "Orange Juice"], total: 15.99, status: "delivered", time: "18 min ago", truckSpot: "Lot C, Space 8", notes: "" },
    { id: 1005, driver: "Dave R.", phone: "(615) 555-0567", location: "Pilot Travel Center", items: ["Diesel Additive", "DEF Fluid"], total: 62.50, status: "delivered", time: "25 min ago", truckSpot: "Fuel Island 1", notes: "Bulk order" },
    { id: 1006, driver: "Tom H.", phone: "(615) 555-0890", location: "Big Rig Burger Co.", items: ["Family Meal Deal"], total: 34.99, status: "in_progress", time: "32 min ago", truckSpot: "Lot A, Space 22", notes: "" },
  ];

  const displayedOrders = showAllOrders ? recentOrders : recentOrders.slice(0, 3);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs whitespace-nowrap">Delivered</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs whitespace-nowrap">In Progress</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs whitespace-nowrap animate-pulse">Awaiting Confirmation</Badge>;
      case "confirmed":
        return <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 text-xs whitespace-nowrap">Confirmed</Badge>;
      case "picked_up":
        return <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs whitespace-nowrap">Picked Up</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs whitespace-nowrap">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Password Setup Modal */}
      <Dialog open={showPasswordModal} onOpenChange={(open) => {
        // Only allow closing if not initial setup
        if (!user?.needsPasswordSetup || isChangingPassword) {
          setShowPasswordModal(open);
        }
      }}>
        <DialogContent className="bg-[#0d1f35] border-cyan-500/20 max-w-md">
          <DialogHeader>
            <div className="size-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
              <Shield className="size-8 text-cyan-400" />
            </div>
            <DialogTitle className="text-2xl font-heading font-bold text-white text-center">
              {isChangingPassword ? 'Change Your Password' : 'Secure Your Account'}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {isChangingPassword 
                ? 'Create a new secure password for your account.'
                : `Welcome! Please create a secure password to protect your account.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 mt-4">
            <Badge className="w-full justify-center bg-amber-500/20 text-amber-300 border-amber-500/30 py-2">
              <KeyRound className="size-3 mr-2" />
              Your PIN ({user?.pin}) will still work for account recovery
            </Badge>

            <div className="space-y-2">
              <Label htmlFor="modal-password" className="text-white">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  id="modal-password"
                  type={showModalPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={modalPassword}
                  onChange={(e) => { setModalPassword(e.target.value); setModalPasswordError(''); }}
                  className="pl-11 pr-11 bg-[#0a1628] border-white/20 h-12"
                  data-testid="input-modal-password"
                />
                <button
                  type="button"
                  onClick={() => setShowModalPassword(!showModalPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  {showModalPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-confirm-password" className="text-white">Confirm Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  id="modal-confirm-password"
                  type={showModalPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={modalConfirmPassword}
                  onChange={(e) => { setModalConfirmPassword(e.target.value); setModalPasswordError(''); }}
                  className="pl-11 bg-[#0a1628] border-white/20 h-12"
                  data-testid="input-modal-confirm-password"
                />
              </div>
            </div>

            <div className="bg-[#0a1628]/50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-1.5 ${modalPasswordRequirements.minLength ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {modalPasswordRequirements.minLength ? <CheckCircle className="size-3" /> : <X className="size-3" />}
                  8+ characters
                </div>
                <div className={`flex items-center gap-1.5 ${modalPasswordRequirements.hasCapital ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {modalPasswordRequirements.hasCapital ? <CheckCircle className="size-3" /> : <X className="size-3" />}
                  1 capital letter
                </div>
                <div className={`flex items-center gap-1.5 ${modalPasswordRequirements.hasSpecial ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {modalPasswordRequirements.hasSpecial ? <CheckCircle className="size-3" /> : <X className="size-3" />}
                  1 special character
                </div>
                <div className={`flex items-center gap-1.5 ${modalPasswordRequirements.matches ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {modalPasswordRequirements.matches ? <CheckCircle className="size-3" /> : <X className="size-3" />}
                  Passwords match
                </div>
              </div>
            </div>

            {modalPasswordError && (
              <p className="text-sm text-red-400 text-center">{modalPasswordError}</p>
            )}

            <Button
              onClick={handleModalPasswordSave}
              disabled={!allModalRequirementsMet}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 h-12 text-base font-bold"
              data-testid="button-modal-save-password"
            >
              {isChangingPassword ? 'Change Password' : 'Set Password & Continue'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/command-center">
          <Button data-testid="button-back-home" variant="ghost" size="icon" className="text-muted-foreground hover:text-white shrink-0">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-heading font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="size-5 text-primary shrink-0" />
            <span className="truncate">Business Suite</span>
          </h1>
          <p className="text-xs text-muted-foreground truncate">Orders, analytics & settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/driver-orders/i24-corridor">
            <Button data-testid="button-driver-mode" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white gap-1.5 min-h-[44px] text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400/40">
              <Truck className="size-4 animate-pulse" />
              <span className="font-bold">Driver Mode</span>
            </Button>
          </Link>
          <Link href="/command-center">
            <Button data-testid="button-command-center" variant="outline" className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10 gap-1.5 min-h-[44px] text-xs">
              <LayoutDashboard className="size-4" />
              <span className="hidden sm:inline">Command Center</span>
            </Button>
          </Link>
          <Link href="/marketing">
            <Button data-testid="button-marketing-hub" className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white gap-1.5 min-h-[44px] text-xs">
              <Megaphone className="size-4" />
              <span className="hidden sm:inline">Marketing Hub</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-none">
          <TabsList className="w-max bg-card/50 border border-white/10 p-1 min-h-[44px]">
            <TabsTrigger data-testid="tab-home" value="home" className="text-xs sm:text-sm min-h-[44px] px-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <Rocket className="size-4 mr-1 sm:mr-2" /> 
              <span className="hidden sm:inline">Home</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger data-testid="tab-orders" value="orders" className="text-xs sm:text-sm min-h-[44px] px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="size-4 mr-1 sm:mr-2" /> Orders
            </TabsTrigger>
            <TabsTrigger data-testid="tab-marketing" value="marketing" className="text-xs sm:text-sm min-h-[44px] px-3 data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white">
              <Megaphone className="size-4 mr-1 sm:mr-2" /> 
              <span className="hidden sm:inline">Marketing</span>
              <span className="sm:hidden">Ads</span>
            </TabsTrigger>
            <TabsTrigger data-testid="tab-account" value="account" className="text-xs sm:text-sm min-h-[44px] px-3 data-[state=active]:bg-violet-500 data-[state=active]:text-white">
              <User className="size-4 mr-1 sm:mr-2" /> 
              <span className="hidden sm:inline">Account</span>
              <span className="sm:hidden">Me</span>
            </TabsTrigger>
            <TabsTrigger data-testid="tab-operations" value="operations" className="text-xs sm:text-sm min-h-[44px] px-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Navigation className="size-4 mr-1 sm:mr-2" /> 
              <span className="hidden sm:inline">Operations</span>
              <span className="sm:hidden">Ops</span>
            </TabsTrigger>
            <TabsTrigger data-testid="tab-analytics" value="analytics" className="text-xs sm:text-sm min-h-[44px] px-3 data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
              <TrendingUp className="size-4 mr-1 sm:mr-2" /> 
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>
          <Link href="/business">
            <Button variant="outline" size="sm" className="ml-2 border-orange-500/50 text-orange-500 hover:bg-orange-500/20" data-testid="link-business-suite">
              <Receipt className="size-4 mr-2" />
              Business Suite
            </Button>
          </Link>
        </div>

        {/* Home Tab */}
        <TabsContent value="home" className="mt-6 space-y-6">
          {/* Driver Mode Activation Card */}
          <Link href="/driver-orders/i24-corridor">
            <Card className="glass-panel bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-violet-500/10 border-cyan-500/40 cursor-pointer hover:border-cyan-400/60 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] group" data-testid="card-activate-driver-mode">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] group-hover:scale-110 transition-transform">
                      <Truck className="size-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Activate Driver Mode
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[10px] text-cyan-300 font-medium">
                          <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          TAP TO GO
                        </span>
                      </h3>
                      <p className="text-sm text-muted-foreground">Pick up and deliver pending orders</p>
                    </div>
                  </div>
                  <ChevronRight className="size-6 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="glass-panel bg-gradient-to-br from-orange-500/10 to-rose-500/10 border-orange-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Rocket className="size-6 text-orange-400" />
                </div>
                <div>
                  <UserGreeting name={partnerFirstName} userNumber={user?.id || 0} role={user?.role || "owner"} compact />
                  <p className="text-sm text-muted-foreground">Your complete guide to running your franchise</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {partnerRegion} | Updated February 2, 2026
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20" data-testid="card-sms-reminder">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="size-9 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                  <Phone className="size-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-cyan-300">SMS Support — Coming Soon</p>
                  <p className="text-[10px] text-white/40">Order confirmations, vendor alerts, check-in reminders via text</p>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[9px] shrink-0">Planned</Badge>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20" data-testid="card-native-apps-reminder">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="size-9 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                  <Globe className="size-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-violet-300">Native Apps — Coming Soon</p>
                  <p className="text-[10px] text-white/40">Google Play & Apple App Store</p>
                </div>
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[9px] shrink-0">Planned</Badge>
              </CardContent>
            </Card>
          </div>

          <TodaysVendorsCard />

          <Link href="/marketing?tab=print">
            <Card className="glass-panel bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/30 hover:border-violet-500/50 transition-all cursor-pointer group" data-testid="card-business-card-generator">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="size-14 rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Award className="size-7 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">Business Card Generator</p>
                  <p className="text-xs text-muted-foreground">Design & download professional cards with 12 templates</p>
                </div>
                <ChevronRight className="size-5 text-violet-400 shrink-0" />
              </CardContent>
            </Card>
          </Link>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Investors", href: "/investors", icon: <TrendingUp className="size-4" />, gradient: "from-emerald-500/15 to-teal-500/10", border: "border-emerald-500/20", text: "text-emerald-300" },
              { label: "Orbit Payroll", href: "https://orbitstaffing.io", icon: <Calculator className="size-4" />, gradient: "from-teal-500/15 to-cyan-500/10", border: "border-teal-500/20", text: "text-teal-300", external: true },
              { label: "Vendor Portal", href: "/vendor-portal", icon: <Building className="size-4" />, gradient: "from-violet-500/15 to-purple-500/10", border: "border-violet-500/20", text: "text-violet-300" },
              { label: "Zone Map", href: "/zones", icon: <MapPin className="size-4" />, gradient: "from-cyan-500/15 to-sky-500/10", border: "border-cyan-500/20", text: "text-cyan-300" },
            ].map((item) => {
              const inner = (
                <Card key={item.href} className={`bg-gradient-to-r ${item.gradient} border ${item.border} hover:border-white/20 cursor-pointer transition-all group`} data-testid={`quick-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="p-3 flex items-center gap-2.5">
                    <div className={`${item.text} group-hover:text-white transition-colors`}>{item.icon}</div>
                    <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors truncate flex-1">{item.label}</span>
                    <ChevronRight className="size-3 text-white/20 group-hover:text-white/50 transition-colors" />
                  </CardContent>
                </Card>
              );
              return (item as any).external
                ? <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">{inner}</a>
                : <Link key={item.href} href={item.href}>{inner}</Link>;
            })}
          </div>

          {/* Onboarding Checklist - Accordion Style */}
          <Card className="glass-panel border-l-4 border-l-violet-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="size-4 text-violet-400" />
                Complete Your Setup
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px] ml-auto">
                  {credentialsSaved && w9Saved && stripeConnected && documentsUploaded.idFront && documentsUploaded.idBack && documentsUploaded.idOrBirthCert ? '4/4 Complete' : 
                   credentialsSaved && w9Saved && stripeConnected ? '3/4 Complete' : 
                   credentialsSaved && w9Saved ? '2/4 Complete' : 
                   credentialsSaved ? '1/4 Complete' : '0/4 Complete'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Accordion type="single" collapsible defaultValue={!credentialsSaved ? "credentials" : !w9Saved ? "w9" : !stripeConnected ? "stripe" : "documents"} className="space-y-2">
                {/* Step 1: Account Credentials */}
                <AccordionItem value="credentials" className={`rounded-xl border px-4 ${credentialsSaved ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-violet-500/10 border-violet-500/20'}`}>
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3">
                      <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${credentialsSaved ? 'bg-emerald-500' : 'bg-violet-500'}`}>
                        {credentialsSaved ? <CheckCircle className="size-3 text-white" /> : <span className="text-white text-xs font-bold">1</span>}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-white text-sm">Login Credentials</p>
                        <p className="text-[10px] text-muted-foreground">{credentialsSaved ? 'Password set' : 'Set password for your portal'}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    {!credentialsSaved ? (
                      <div className="space-y-3">
                        <Input
                          data-testid="input-username"
                          placeholder="Username (e.g., kathy@happyeats.app)"
                          value={credentials.username}
                          onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                          className="bg-slate-800 border-slate-600 h-9 text-sm"
                        />
                        <Input
                          data-testid="input-password"
                          type="password"
                          placeholder="Password (8+ chars, 1 uppercase, 1 special)"
                          value={credentials.password}
                          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                          className="bg-slate-800 border-slate-600 h-9 text-sm"
                        />
                        <Input
                          data-testid="input-confirm-password"
                          type="password"
                          placeholder="Confirm password"
                          value={credentials.confirmPassword}
                          onChange={(e) => setCredentials(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="bg-slate-800 border-slate-600 h-9 text-sm"
                        />
                        {passwordError && <p className="text-xs text-red-400">{passwordError}</p>}
                        <Button 
                          data-testid="button-save-credentials"
                          onClick={handleSaveCredentials} 
                          size="sm"
                          className="w-full bg-violet-500 hover:bg-violet-600"
                        >
                          <Save className="size-3 mr-2" /> Save
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="size-3" /> Password is set</span>
                          <span className="text-muted-foreground flex items-center gap-1"><KeyRound className="size-3" /> PIN: {user?.pin || '****'}</span>
                        </div>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => { setIsChangingPassword(true); setShowPasswordModal(true); }}
                          className="w-full border-violet-500/30 text-violet-400 hover:bg-violet-500/10 h-8 text-xs"
                          data-testid="button-change-password"
                        >
                          <Lock className="size-3 mr-1" /> Change Password
                        </Button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

              {/* Step 2: W-9 Tax Information */}
                <AccordionItem value="w9" className={`rounded-xl border px-4 ${w9Saved ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800/50 border-white/10'}`}>
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3">
                      <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${w9Saved ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                        {w9Saved ? <CheckCircle className="size-3 text-white" /> : <span className="text-white text-xs font-bold">2</span>}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-white text-sm">Tax Information (W-9)</p>
                        <p className="text-[10px] text-muted-foreground">{w9Saved ? `On file: ${w9Form.legalName}` : 'Required for 1099 at year end'}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    {!w9Saved ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input data-testid="input-w9-legal-name" placeholder="Legal name" value={w9Form.legalName} onChange={(e) => setW9Form(prev => ({ ...prev, legalName: e.target.value }))} className="bg-slate-800 border-slate-600 h-11 text-sm" />
                          <Input data-testid="input-w9-business-name" placeholder="Business name" value={w9Form.businessName} onChange={(e) => setW9Form(prev => ({ ...prev, businessName: e.target.value }))} className="bg-slate-800 border-slate-600 h-11 text-sm" />
                        </div>
                        <select data-testid="select-w9-business-type" value={w9Form.businessType} onChange={(e) => setW9Form(prev => ({ ...prev, businessType: e.target.value }))} className="w-full p-2 rounded-md bg-slate-800 border border-slate-600 text-white text-xs h-11">
                          <option value="sole_proprietor">Sole Proprietor</option>
                          <option value="llc_single">LLC (Single)</option>
                          <option value="llc_c">LLC (C Corp)</option>
                          <option value="llc_s">LLC (S Corp)</option>
                          <option value="c_corp">C Corporation</option>
                          <option value="s_corp">S Corporation</option>
                          <option value="partnership">Partnership</option>
                        </select>
                        <Input data-testid="input-w9-ein" placeholder="EIN or SSN" value={w9Form.ein} onChange={(e) => setW9Form(prev => ({ ...prev, ein: e.target.value }))} className="bg-slate-800 border-slate-600 h-11 text-sm" />
                        <Input data-testid="input-w9-address" placeholder="Street address" value={w9Form.address} onChange={(e) => setW9Form(prev => ({ ...prev, address: e.target.value }))} className="bg-slate-800 border-slate-600 h-11 text-sm" />
                        <div className="grid grid-cols-3 gap-2">
                          <Input data-testid="input-w9-city" placeholder="City" value={w9Form.city} onChange={(e) => setW9Form(prev => ({ ...prev, city: e.target.value }))} className="bg-slate-800 border-slate-600 h-11 text-sm" />
                          <Input data-testid="input-w9-state" placeholder="State" value={w9Form.state} onChange={(e) => setW9Form(prev => ({ ...prev, state: e.target.value }))} className="bg-slate-800 border-slate-600 h-11 text-sm" />
                          <Input data-testid="input-w9-zip" placeholder="ZIP" value={w9Form.zip} onChange={(e) => setW9Form(prev => ({ ...prev, zip: e.target.value }))} className="bg-slate-800 border-slate-600 h-11 text-sm" />
                        </div>
                        <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-2">Type your legal name to sign electronically:</p>
                          <Input data-testid="input-w9-signature" placeholder="Signature" value={w9Form.signature} onChange={(e) => setW9Form(prev => ({ ...prev, signature: e.target.value }))} className="bg-slate-800 border-slate-600 h-11 italic" style={{ fontFamily: "'Brush Script MT', cursive" }} />
                        </div>
                        {w9Error && <p className="text-xs text-red-400">{w9Error}</p>}
                        <Button data-testid="button-save-w9" onClick={handleSaveW9} size="sm" className="w-full bg-cyan-500 hover:bg-cyan-600"><Save className="size-3 mr-2" /> Save</Button>
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle className="size-3" /> W-9 on file</p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Step 3: Stripe Connect */}
                <AccordionItem value="stripe" className={`rounded-xl border px-4 ${stripeConnected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800/50 border-white/10'}`}>
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3">
                      <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${stripeConnected ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                        {stripeConnected ? <CheckCircle className="size-3 text-white" /> : <span className="text-white text-xs font-bold">3</span>}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-white text-sm">Stripe Payments</p>
                        <p className="text-[10px] text-muted-foreground">{stripeConnected ? 'Connected' : 'Receive earnings to your bank'}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-xs text-white/70">Stripe Account</span>
                        <Badge className={`${stripeStatus?.configured ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'} text-[8px]`} data-testid="badge-stripe-status">
                          {stripeStatus?.configured ? 'Connected' : 'Not Connected'}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        All Happy Eats and TL Driver Connect payments run through Jason's Stripe account. OrbitStaffing handles the revenue split (Kathy 60% / Jason 40%) and deposits.
                      </p>

                      {!stripeConnected ? (
                        <div className="space-y-2">
                          <div className="bg-slate-800/50 rounded-lg p-2 space-y-1">
                            <p className="text-[10px] text-amber-300 font-medium">Kathy — Add Your Bank for Deposits:</p>
                            <ol className="text-[10px] text-muted-foreground space-y-0.5 list-decimal list-inside">
                              <li>Ask Jason for the Stripe dashboard login</li>
                              <li>Go to Settings → Payouts → Bank accounts</li>
                              <li>Add your Chime bank account as a payout destination</li>
                              <li>OrbitStaffing will route your 60% share to that account</li>
                            </ol>
                          </div>
                          <Button data-testid="button-mark-stripe-complete" onClick={() => setStripeConnected(true)} size="sm" variant="outline" className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                            <CheckCircle className="size-3 mr-1" /> Mark Complete
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle className="size-3" /> Ready to receive payments</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

              {/* Step 4: Compliance Documents */}
                <AccordionItem value="documents" className={`rounded-xl border px-4 ${documentsUploaded.idFront && documentsUploaded.idBack && documentsUploaded.idOrBirthCert && documentsUploaded.irsVerification ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800/50 border-white/10'}`}>
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3">
                      <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${documentsUploaded.idFront && documentsUploaded.idBack && documentsUploaded.idOrBirthCert && documentsUploaded.irsVerification ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                        {documentsUploaded.idFront && documentsUploaded.idBack && documentsUploaded.idOrBirthCert && documentsUploaded.irsVerification ? <CheckCircle className="size-3 text-white" /> : <span className="text-white text-xs font-bold">4</span>}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-white text-sm">Identity Documents</p>
                        <p className="text-[10px] text-muted-foreground">{documentsUploaded.idFront && documentsUploaded.idBack && documentsUploaded.idOrBirthCert && documentsUploaded.irsVerification ? 'All uploaded' : 'ID, passport/birth cert, IRS verification'}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    {!(documentsUploaded.idFront && documentsUploaded.idBack && documentsUploaded.idOrBirthCert && documentsUploaded.irsVerification) ? (
                      <div className="space-y-2">
                        {docUploadError && <p className="text-xs text-red-400">{docUploadError}</p>}
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`p-2 rounded-lg ${documentsUploaded.idFront ? 'bg-emerald-500/10' : 'bg-slate-800/50'} flex items-center justify-between`}>
                            <span className="text-xs text-white">ID Front</span>
                            {documentsUploaded.idFront ? <CheckCircle className="size-3 text-emerald-400" /> : (
                              <label className="cursor-pointer">
                                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocumentUpload('id_front', e.target.files[0])} disabled={uploadingDoc === 'id_front'} />
                                <span className="px-2 py-1 bg-cyan-500 text-white text-[10px] rounded">{uploadingDoc === 'id_front' ? '...' : 'Upload'}</span>
                              </label>
                            )}
                          </div>
                          <div className={`p-2 rounded-lg ${documentsUploaded.idBack ? 'bg-emerald-500/10' : 'bg-slate-800/50'} flex items-center justify-between`}>
                            <span className="text-xs text-white">ID Back</span>
                            {documentsUploaded.idBack ? <CheckCircle className="size-3 text-emerald-400" /> : (
                              <label className="cursor-pointer">
                                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocumentUpload('id_back', e.target.files[0])} disabled={uploadingDoc === 'id_back'} />
                                <span className="px-2 py-1 bg-cyan-500 text-white text-[10px] rounded">{uploadingDoc === 'id_back' ? '...' : 'Upload'}</span>
                              </label>
                            )}
                          </div>
                          <div className={`p-2 rounded-lg ${documentsUploaded.idOrBirthCert ? 'bg-emerald-500/10' : 'bg-slate-800/50'} flex items-center justify-between`}>
                            <span className="text-xs text-white">Birth/Passport</span>
                            {documentsUploaded.idOrBirthCert ? <CheckCircle className="size-3 text-emerald-400" /> : (
                              <div className="flex gap-1">
                                <label className="cursor-pointer"><input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocumentUpload('birth_certificate', e.target.files[0])} /><span className="px-1 py-1 bg-violet-500 text-white text-[10px] rounded">Birth</span></label>
                                <label className="cursor-pointer"><input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocumentUpload('passport', e.target.files[0])} /><span className="px-1 py-1 bg-amber-500 text-white text-[10px] rounded">Pass</span></label>
                              </div>
                            )}
                          </div>
                          <div className={`p-2 rounded-lg ${documentsUploaded.irsVerification ? 'bg-emerald-500/10' : 'bg-amber-500/10'} flex items-center justify-between`}>
                            <span className="text-xs text-white">IRS EIN</span>
                            {documentsUploaded.irsVerification ? <CheckCircle className="size-3 text-emerald-400" /> : (
                              <div className="flex gap-1">
                                <label className="cursor-pointer"><input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocumentUpload('irs_cp575', e.target.files[0])} /><span className="px-1 py-1 bg-blue-500 text-white text-[10px] rounded">CP575</span></label>
                                <label className="cursor-pointer"><input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocumentUpload('irs_147c', e.target.files[0])} /><span className="px-1 py-1 bg-indigo-500 text-white text-[10px] rounded">147C</span></label>
                              </div>
                            )}
                          </div>
                        </div>
                        {!documentsUploaded.irsVerification && (
                          <p className="text-[10px] text-amber-300 flex items-center gap-1"><Clock className="size-3" /> 30-day grace period for IRS docs</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle className="size-3" /> All documents uploaded</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {credentialsSaved && w9Saved && stripeConnected && documentsUploaded.idFront && documentsUploaded.idBack && documentsUploaded.idOrBirthCert && documentsUploaded.irsVerification && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center mt-4">
                  <CheckCircle className="size-6 text-emerald-400 mx-auto mb-1" />
                  <p className="text-white font-medium text-sm">You're all set!</p>
                  <p className="text-[10px] text-muted-foreground">Ready to accept orders.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Accordion type="multiple" className="space-y-2">
            <AccordionItem value="what-is-happy-eats" className="glass-panel rounded-xl border px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="size-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">1</span>
                  What is Happy Eats?
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Happy Eats is a concierge delivery service for truck drivers during their mandatory rest breaks. 
                Drivers order food, parts, or supplies through the app, and your runners pick up and deliver to their truck stop.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <p className="font-medium text-orange-300 text-sm">Commercial Drivers</p>
                  <p className="text-xs text-muted-foreground">Order food, parts & services. Break timer, games, chat.</p>
                  <a href="/driver" className="text-xs text-orange-400 hover:underline mt-1 inline-block">View Driver Hub →</a>
                </div>
                <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20">
                  <p className="font-medium text-sky-300 text-sm">Everyday Drivers</p>
                  <p className="text-xs text-muted-foreground">Mileage tracking & expense logging for gig workers.</p>
                  <a href="/everyday" className="text-xs text-sky-400 hover:underline mt-1 inline-block">View Mileage Tracker →</a>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="font-medium text-emerald-300 text-sm">Food Truck Vendors</p>
                  <p className="text-xs text-muted-foreground">Apply to join the network and receive orders.</p>
                  <a href="/vendor-portal" className="text-xs text-emerald-400 hover:underline mt-1 inline-block">View Vendor Portal →</a>
                </div>
              </div>
            </CardContent>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="how-ordering-works" className="glass-panel rounded-xl border px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">2</span>
                  How Ordering Works
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <span className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs shrink-0">A</span>
                  <div>
                    <p className="text-sm text-white font-medium">Customer Browses & Orders</p>
                    <p className="text-xs text-muted-foreground">Driver uses the app to browse vendors or uses GPS Concierge to order from any nearby store.</p>
                    <a href="/vendors" className="text-xs text-emerald-400 hover:underline">See Vendor List →</a>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <span className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs shrink-0">B</span>
                  <div>
                    <p className="text-sm text-white font-medium">Automatic Pricing Calculated</p>
                    <p className="text-xs text-muted-foreground">Menu Total + 20% Service Fee + 10% Tax + $3.99 Delivery + Tip = Total</p>
                    <a href="/order" className="text-xs text-emerald-400 hover:underline">See Order Form →</a>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <span className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs shrink-0">C</span>
                  <div>
                    <p className="text-sm text-white font-medium">You Receive the Order</p>
                    <p className="text-xs text-muted-foreground">Order appears in your queue (Overview tab). Assign a runner to pick up and deliver.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <span className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs shrink-0">D</span>
                  <div>
                    <p className="text-sm text-white font-medium">Driver Tracks Delivery</p>
                    <p className="text-xs text-muted-foreground">Real-time status updates. Traffic light shows: Green (open), Yellow (busy), Red (closed).</p>
                    <a href="/tracking" className="text-xs text-emerald-400 hover:underline">See Tracking Page →</a>
                  </div>
                </div>
              </div>
            </CardContent>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="whats-new" className="glass-panel rounded-xl border px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="size-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">3</span>
                  What's New (January 2026)
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] ml-auto">UPDATED</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                  <MapPin className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-white font-medium">GPS Permission System</p>
                    <p className="text-[10px] text-muted-foreground">Saves & names locations (Home, Nashville Hub)</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                  <ShoppingCart className="size-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-white font-medium">Concierge Order Form</p>
                    <p className="text-[10px] text-muted-foreground">Two-step flow with auto pricing</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                  <Scan className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-white font-medium">Document Scanner</p>
                    <p className="text-[10px] text-muted-foreground">Built-in OCR - scan receipts free</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                  <Palette className="size-4 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-white font-medium">9 Theme Options</p>
                    <p className="text-[10px] text-muted-foreground">Sports teams, NASCAR, custom looks</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                  <Route className="size-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-white font-medium">Mileage Tracker</p>
                    <p className="text-[10px] text-muted-foreground">IRS deductions at $0.70/mile</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                  <MessageSquare className="size-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-white font-medium">Trucker Talk Chat</p>
                    <p className="text-[10px] text-muted-foreground">Real-time driver chat room</p>
                  </div>
                </div>
              </div>
            </CardContent>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="setup-steps" className="glass-panel rounded-xl border px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="size-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">4</span>
                  Your Setup Steps
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="size-5 text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-emerald-400 font-medium line-through">Profile Setup</p>
                  <p className="text-xs text-muted-foreground">Your franchise profile is configured</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="size-5 rounded-full bg-fuchsia-500/30 flex items-center justify-center text-fuchsia-300 text-xs shrink-0">2</span>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">Contact Local Vendors</p>
                  <p className="text-xs text-muted-foreground">Use Marketing templates to reach restaurants and food trucks</p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 border-white/20 text-xs" data-testid="button-start-vendors">Start</Button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="size-5 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-300 text-xs shrink-0">3</span>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">Recruit Delivery Runners</p>
                  <p className="text-xs text-muted-foreground">Share flyers at truck stops and travel centers</p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 border-white/20 text-xs" data-testid="button-start-recruit">Start</Button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="size-5 rounded-full bg-amber-500/30 flex items-center justify-center text-amber-300 text-xs shrink-0">4</span>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">Set Your Hours</p>
                  <p className="text-xs text-muted-foreground">Use the traffic light (Overview tab) to control when you accept orders</p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 border-white/20 text-xs" data-testid="button-start-hours">Start</Button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="size-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300 text-xs shrink-0">5</span>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">Go Live!</p>
                  <p className="text-xs text-muted-foreground">Start accepting and delivering orders</p>
                </div>
              </div>
            </CardContent>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="integrations" className="glass-panel rounded-xl border px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="size-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">5</span>
                  Business Integrations
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="size-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm text-emerald-400 font-medium">Trust Layer</p>
                  <p className="text-xs text-muted-foreground">Connected for data sync. Orbit Staffing available for automated payroll and financial management.</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] shrink-0">CONNECTED</Badge>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <CreditCard className="size-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Stripe Payments</p>
                  <p className="text-xs text-muted-foreground">Once you get your Stripe account, we'll connect it for secure payment processing.</p>
                </div>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] shrink-0">COMING</Badge>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <Phone className="size-5 text-sky-400 shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Twilio SMS Notifications</p>
                  <p className="text-xs text-muted-foreground">Text notifications for order updates and driver alerts.</p>
                </div>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] shrink-0">COMING</Badge>
              </div>
            </CardContent>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="success-roadmap" className="glass-panel rounded-xl border px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">6</span>
                  Your Success Roadmap
                  <Badge className="ml-auto bg-emerald-500/20 text-emerald-300 text-[10px]">Follow This Plan</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-emerald-300 font-medium text-sm mb-1">Launch Target: Coming Soon</p>
                <p className="text-xs text-muted-foreground">
                  This roadmap is designed for starting lean with minimal upfront costs. Follow each phase in order.
                </p>
              </div>

              {/* Phase 1: Foundation (Now - Feb 2026) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold">1</div>
                  <p className="text-violet-300 font-medium text-sm">Foundation (Now - Feb 2026)</p>
                  <Badge className="bg-violet-500/20 text-violet-300 text-[10px]">Current Phase</Badge>
                </div>
                <div className="ml-8 space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2"><CheckCircle className="size-3 text-emerald-400" /> Complete owner onboarding (credentials, W-9, documents)</p>
                  <p className="flex items-center gap-2"><CheckCircle className="size-3 text-emerald-400" /> Review and approve business structure (80/20 split)</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Submit IRS verification (CP 575 or 147C) within 30 days</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Set up Stripe account for payment processing</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Finalize territory: Lebanon, Mt. Juliet, LaVergne, Smyrna</p>
                </div>
              </div>

              {/* Phase 2: Vendor Recruitment (Feb - Mar 2026) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-orange-500/50 flex items-center justify-center text-white text-xs font-bold">2</div>
                  <p className="text-orange-300 font-medium text-sm">Vendor Recruitment (Feb - Mar 2026)</p>
                </div>
                <div className="ml-8 space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Identify 10-15 local food trucks, mom & pop restaurants</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Visit truck stops to understand driver traffic patterns</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Pitch vendors - they get new customers, no signup fee</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Get 3-5 vendors committed before soft launch</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Create simple menus for each vendor in the app</p>
                </div>
              </div>

              {/* Phase 3: Driver Recruitment (Mar 2026) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-sky-500/50 flex items-center justify-center text-white text-xs font-bold">3</div>
                  <p className="text-sky-300 font-medium text-sm">Driver Network (Mar 2026)</p>
                </div>
                <div className="ml-8 space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Recruit 2-3 part-time delivery runners (1099 contractors)</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Start with yourself + 1 backup driver</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Define coverage schedule (lunch & dinner rushes)</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Test ordering flow with friendly truckers</p>
                </div>
              </div>

              {/* Phase 4: Soft Launch (Apr 2026) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-emerald-500/50 flex items-center justify-center text-white text-xs font-bold">4</div>
                  <p className="text-emerald-300 font-medium text-sm">Soft Launch (Apr 2026)</p>
                </div>
                <div className="ml-8 space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Go live at 1-2 truck stops initially</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Hand out flyers, QR codes at fuel islands</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Goal: 5-10 orders per week to start</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Collect feedback, fix issues quickly</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Build word-of-mouth with great service</p>
                </div>
              </div>

              {/* Phase 5: Growth (May - Dec 2026) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-rose-500/50 flex items-center justify-center text-white text-xs font-bold">5</div>
                  <p className="text-rose-300 font-medium text-sm">Growth Mode (May - Dec 2026)</p>
                </div>
                <div className="ml-8 space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Expand to additional truck stops in territory</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Add more vendors as demand grows</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Hire additional runners as needed</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Target: 50+ orders/week by Month 3</p>
                  <p className="flex items-center gap-2"><Circle className="size-3 text-slate-400" /> Launch loyalty pass program for repeat customers</p>
                </div>
              </div>

              <button 
                onClick={() => setShowProjectionsModal(true)}
                className="w-full bg-gradient-to-r from-violet-500/10 to-rose-500/10 border border-violet-500/20 hover:border-violet-500/40 rounded-xl p-4 mt-4 text-left transition-colors cursor-pointer"
                data-testid="button-projections-info"
              >
                <p className="text-white font-medium text-sm mb-2 flex items-center gap-2">Your 80% Profit Projections <ChevronRight className="size-4 text-violet-400" /></p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <p className="text-lg font-bold text-emerald-400">$3,600</p>
                    <p className="text-[10px] text-muted-foreground">Month 3</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <p className="text-lg font-bold text-emerald-400">$9,680</p>
                    <p className="text-[10px] text-muted-foreground">Month 6</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <p className="text-lg font-bold text-emerald-400">$236K</p>
                    <p className="text-[10px] text-muted-foreground">Year 1</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <p className="text-lg font-bold text-emerald-400">$357K</p>
                    <p className="text-[10px] text-muted-foreground">Year 2</p>
                  </div>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-2">Tap to see full breakdown</p>
              </button>
            </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Need Help */}
          <Card className="glass-panel border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <BookOpen className="size-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-bold text-white mb-1">Need Help?</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact Jason at Orbit Staffing (PIN: 0424) for technical support, or check the Marketing tab for templates.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/marketing?tab=print">
                      <Button size="sm" className="bg-amber-500/50 text-white hover:bg-amber-500/60 text-xs" data-testid="button-view-templates">
                        Marketing Templates
                      </Button>
                    </Link>
                    <a href="/roadmap">
                      <Button size="sm" variant="outline" className="border-white/20 text-xs" data-testid="button-view-roadmap">
                        View Roadmap
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-6 space-y-6">
          {/* Order Status Control (Traffic Light) */}
          <Card className="glass-panel border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Order Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Control whether drivers can place orders. They'll see this status on their home screen.
              </p>
              <div className="flex gap-2">
                <Button
                  data-testid="button-status-green"
                  onClick={() => statusMutation.mutate("green")}
                  className={`flex-1 ${orderStatus === "green" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}`}
                >
                  <span className="size-3 rounded-full bg-emerald-400 mr-2"></span>
                  Open
                </Button>
                <Button
                  data-testid="button-status-yellow"
                  onClick={() => statusMutation.mutate("yellow")}
                  className={`flex-1 ${orderStatus === "yellow" ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-[0_0_15px_rgba(234,179,8,0.4)]" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}`}
                >
                  <span className="size-3 rounded-full bg-yellow-400 mr-2"></span>
                  Busy
                </Button>
                <Button
                  data-testid="button-status-red"
                  onClick={() => statusMutation.mutate("red")}
                  className={`flex-1 ${orderStatus === "red" ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}`}
                >
                  <span className="size-3 rounded-full bg-red-400 mr-2"></span>
                  Closed
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {orderStatus === "green" && "Drivers can order freely"}
                {orderStatus === "yellow" && "Warning shown - order soon!"}
                {orderStatus === "red" && "Ordering is disabled for drivers"}
              </p>
            </CardContent>
          </Card>

          {/* Stats Carousel */}
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-2">
              <CarouselItem className="pl-2 basis-1/2">
                <Card className="glass-panel h-24">
                  <CardContent className="p-3 h-full flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Orders</p>
                      <p data-testid="text-today-orders" className="text-2xl font-bold text-white mt-1">{stats.todayOrders}</p>
                    </div>
                    <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <ShoppingBag className="size-5 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>

              <CarouselItem className="pl-2 basis-1/2">
                <Card className="glass-panel h-24">
                  <CardContent className="p-3 h-full flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending</p>
                      <p className="text-2xl font-bold text-white mt-1">{stats.pendingOrders}</p>
                    </div>
                    <div className="size-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                      <Clock className="size-5 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>

              <CarouselItem className="pl-2 basis-1/2">
                <Card className="glass-panel h-24">
                  <CardContent className="p-3 h-full flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Revenue</p>
                      <p data-testid="text-revenue" className="text-2xl font-bold text-white mt-1">{formatRevenue(stats.revenue)}</p>
                    </div>
                    <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <DollarSign className="size-5 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>

              <CarouselItem className="pl-2 basis-1/2">
                <Card className="glass-panel h-24">
                  <CardContent className="p-3 h-full flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Time</p>
                      <p className="text-2xl font-bold text-white mt-1">18m</p>
                    </div>
                    <div className="size-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="size-5 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
            <div className="flex items-center justify-center gap-4 mt-3">
              <CarouselPrevious className="static translate-y-0 size-8 bg-transparent border-0 text-primary hover:text-white hover:bg-transparent" />
              <div className="flex gap-1.5">
                <div className="size-2 rounded-full bg-primary" />
                <div className="size-2 rounded-full bg-white/30" />
              </div>
              <CarouselNext className="static translate-y-0 size-8 bg-transparent border-0 text-primary hover:text-white hover:bg-transparent" />
            </div>
          </Carousel>

          {/* Batch Pickup Coordinator */}
          <BatchPickupCoordinator orders={liveOrders} onStatusUpdate={(orderId: number, status: string) => updateOrderStatus.mutate({ orderId, status })} />

          {/* Pending Orders Alert */}
          {liveOrders.filter((o: any) => o.status === "pending").length > 0 && (
            <Card className="glass-panel border-l-4 border-l-amber-400 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="size-5 text-amber-400 animate-pulse" />
                  <div>
                    <p className="font-bold text-white">
                      {liveOrders.filter((o: any) => o.status === "pending").length} Order(s) Awaiting Confirmation
                    </p>
                    <p className="text-sm text-muted-foreground">Review and approve orders below</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Orders */}
          <Card className="glass-panel bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm sm:text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="size-4 text-primary" />
                  Live Orders
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {liveOrders.length} Total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {liveOrders.length === 0 ? (
                <div className="py-8 text-center">
                  <Package className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground text-sm">No orders yet</p>
                  <p className="text-xs text-muted-foreground mt-1">New orders will appear here automatically</p>
                </div>
              ) : (
                liveOrders.map((order: any) => (
                  <div 
                    key={order.id} 
                    className={`p-4 rounded-xl border ${order.status === "pending" ? "bg-amber-500/10 border-amber-500/30" : "bg-white/5 border-white/10"}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-white flex items-center gap-2">
                          #{order.id} - {order.customerName || "Customer"}
                          {getStatusBadge(order.status)}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Phone className="size-3" /> {order.customerPhone || "No phone"}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-orange-400">${parseFloat(order.total || 0).toFixed(2)}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-medium">{order.locationName || "Restaurant"}</p>
                          <p className="text-muted-foreground">{order.orderDescription || "No items specified"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Truck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white">{order.deliveryAddress || "No address"}</p>
                          {order.deliveryInstructions && (
                            <p className="text-muted-foreground italic">"{order.deliveryInstructions}"</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-4 gap-2 text-xs text-center">
                      <div>
                        <p className="text-muted-foreground">Menu</p>
                        <p className="text-white font-medium">${parseFloat(order.menuTotal || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fee (30%)</p>
                        <p className="text-white font-medium">${parseFloat(order.serviceFee || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tax</p>
                        <p className="text-white font-medium">${parseFloat(order.tax || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Delivery</p>
                        <p className="text-white font-medium">${parseFloat(order.deliveryFee || 0).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Action Buttons for Pending Orders */}
                    {order.status === "pending" && (
                      <div className="mt-4 flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                          onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: "confirmed" })}
                          disabled={updateOrderStatus.isPending}
                          data-testid={`button-approve-${order.id}`}
                        >
                          <CheckCircle className="size-4 mr-1" /> Accept Order
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                          onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: "cancelled" })}
                          disabled={updateOrderStatus.isPending}
                          data-testid={`button-reject-${order.id}`}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}

                    {/* Status Update Buttons for Confirmed Orders */}
                    {order.status === "confirmed" && (
                      <div className="mt-4">
                        <Button 
                          size="sm" 
                          className="w-full bg-violet-500 hover:bg-violet-600"
                          onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: "picked_up" })}
                          disabled={updateOrderStatus.isPending}
                          data-testid={`button-pickup-${order.id}`}
                        >
                          <Package className="size-4 mr-1" /> Mark Picked Up
                        </Button>
                      </div>
                    )}

                    {order.status === "picked_up" && (
                      <div className="mt-4">
                        <Button 
                          size="sm" 
                          className="w-full bg-emerald-500 hover:bg-emerald-600"
                          onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: "delivered" })}
                          disabled={updateOrderStatus.isPending}
                          data-testid={`button-deliver-${order.id}`}
                        >
                          <CheckCircle className="size-4 mr-1" /> Mark Delivered
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Site Analytics - Real Data */}
          <Card className="glass-panel bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 cursor-pointer hover:border-violet-500/30 transition-colors" onClick={() => setActiveTab("analytics")} data-testid="card-site-analytics">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <TrendingUp className="size-4 text-violet-400" />
                Site Analytics
              </CardTitle>
              <span className="text-[10px] text-violet-400 font-medium">Live Data</span>
            </CardHeader>
            <CardContent className="pt-0">
              {(() => {
                const last7 = (analyticsData?.dailyTraffic || []).slice(-7);
                const maxViews = Math.max(...last7.map(d => d.views), 1);
                return (
                  <div className="flex items-end gap-1 h-20">
                    {last7.length > 0 ? last7.map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div 
                          className="w-full bg-gradient-to-t from-violet-500/40 to-violet-400 rounded-t-sm"
                          style={{ height: `${(day.views / maxViews) * 100}%`, minHeight: '6px' }}
                        />
                        <div 
                          className="w-full bg-gradient-to-t from-primary/40 to-primary rounded-t-sm"
                          style={{ height: `${(day.visitors / maxViews) * 100}%`, minHeight: '4px' }}
                        />
                        <span className="text-[8px] text-muted-foreground mt-1">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)}
                        </span>
                      </div>
                    )) : (
                      <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                        Collecting data...
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-violet-400" />
                  <span className="text-[10px] text-muted-foreground">Views</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-primary" />
                  <span className="text-[10px] text-muted-foreground">Visitors</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <p className="text-[9px] text-muted-foreground uppercase">Today</p>
                  <p className="text-sm font-bold text-violet-400" data-testid="text-today-views">{analyticsData?.todayViews?.toLocaleString() || '0'}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <p className="text-[9px] text-muted-foreground uppercase">This Week</p>
                  <p className="text-sm font-bold text-primary" data-testid="text-week-views">{analyticsData?.weekViews?.toLocaleString() || '0'}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <p className="text-[9px] text-muted-foreground uppercase">Visitors</p>
                  <p className="text-sm font-bold text-emerald-400" data-testid="text-today-visitors">{analyticsData?.todayUnique?.toLocaleString() || '0'}</p>
                </div>
              </div>
              <p className="text-[9px] text-violet-400/70 text-center mt-2">Tap to view full analytics</p>
            </CardContent>
          </Card>

          {/* Weekly Revenue */}
          <Card className="glass-panel bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                Weekly Revenue
              </CardTitle>
              <span className="text-[10px] text-emerald-400 font-medium">+12%</span>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-end gap-1 h-20">
                {weeklyData.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-primary/60 to-primary rounded-t-sm"
                      style={{ height: `${(day.revenue / maxRevenue) * 100}%`, minHeight: '8px' }}
                    />
                    <span className="text-[9px] text-muted-foreground mt-1">{day.day}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10">
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase">Total</p>
                  <p className="text-sm font-bold text-white">${(weeklyData.reduce((a, b) => a + b.revenue, 0) / 1000).toFixed(1)}k</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase">Orders</p>
                  <p className="text-sm font-bold text-white">{weeklyData.reduce((a, b) => a + b.orders, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="glass-panel bg-gradient-to-br from-sky-500/10 via-transparent to-indigo-500/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-white text-sm">Recent Orders ({recentOrders.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {displayedOrders.map((order) => (
                <div 
                  key={order.id} 
                  data-testid={`row-order-${order.id}`} 
                  className={`rounded-xl bg-white/5 border transition-all cursor-pointer ${expandedOrder === order.id ? 'border-primary/50' : 'border-white/5 hover:border-primary/30'}`}
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  {/* Collapsed View */}
                  <div className="flex items-center justify-between p-3 gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`size-8 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                        order.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        #{order.id}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white text-xs truncate">{order.driver}</p>
                        <p className="text-[10px] text-muted-foreground">{order.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="font-bold text-white text-xs">${order.total.toFixed(2)}</p>
                      <ChevronRight className={`size-4 text-muted-foreground transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {expandedOrder === order.id && (
                    <div className="px-3 pb-3 pt-0 space-y-2 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-2 pt-3">
                        <div className="min-w-0">
                          <p className="text-[9px] text-muted-foreground uppercase">Location</p>
                          <p className="text-[11px] text-white truncate">{order.location}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] text-muted-foreground uppercase">Spot</p>
                          <p className="text-[11px] text-white truncate">{order.truckSpot}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] text-muted-foreground uppercase">Phone</p>
                          <p className="text-[11px] text-primary truncate">{order.phone}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] text-muted-foreground uppercase">Status</p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      
                      <div className="min-w-0">
                        <p className="text-[9px] text-muted-foreground uppercase">Items</p>
                        <p className="text-[11px] text-white/80 truncate">{order.items.join(", ")}</p>
                      </div>
                      
                      {order.notes && (
                        <div className="min-w-0">
                          <p className="text-[9px] text-muted-foreground uppercase">Notes</p>
                          <p className="text-[11px] text-amber-400 italic truncate">"{order.notes}"</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button size="sm" variant="outline" className="text-[10px] h-7 px-2">
                          <Phone className="size-3 mr-1 shrink-0" /> Call
                        </Button>
                        <Button size="sm" className="text-[10px] h-7 px-2 bg-primary text-primary-foreground">
                          <CheckCircle className="size-3 mr-1 shrink-0" /> Complete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {recentOrders.length > 3 && (
                <Button 
                  variant="ghost" 
                  className="w-full text-xs text-primary hover:text-white mt-2"
                  onClick={() => setShowAllOrders(!showAllOrders)}
                >
                  {showAllOrders ? 'Show Less' : `Show ${recentOrders.length - 3} More Orders`}
                  <ChevronRight className={`size-4 ml-1 transition-transform ${showAllOrders ? '-rotate-90' : 'rotate-90'}`} />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Order History by Date */}
          <OrderHistoryManager />

          {/* Daily Settlement Report — 50/40/10 Split */}
          <DailySettlementReport />
        </TabsContent>

        {/* Marketing Tab */}
        <TabsContent value="marketing" className="mt-6 space-y-6">
          <Card className="glass-panel border-l-4 border-l-rose-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <FileImage className="size-4 text-rose-400" />
                Downloadable Flyers & Materials
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] ml-auto">Print Ready</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <Link href="/marketing">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 border border-fuchsia-500/30 hover:border-fuchsia-500/50 transition-all text-center group cursor-pointer" data-testid="card-marketing-hub">
                    <Megaphone className="size-8 mx-auto text-fuchsia-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-white">Marketing Hub</p>
                    <p className="text-xs text-muted-foreground">All tools in one place</p>
                  </div>
                </Link>
                <Link href="/marketing?tab=print">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 hover:border-violet-500/50 transition-all text-center group cursor-pointer" data-testid="card-business-card">
                    <Award className="size-8 mx-auto text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-white">Print Studio</p>
                    <p className="text-xs text-muted-foreground">Cards, flyers, letters</p>
                  </div>
                </Link>
                <Link href="/marketing?tab=brand">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:border-amber-500/50 transition-all text-center group cursor-pointer" data-testid="card-brand-assets">
                    <Palette className="size-8 mx-auto text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-white">Brand Assets</p>
                    <p className="text-xs text-muted-foreground">Logos, colors, fonts</p>
                  </div>
                </Link>
                <Link href="/flyer">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:border-cyan-500/50 transition-all text-center group cursor-pointer" data-testid="card-driver-flyer">
                    <Users className="size-8 mx-auto text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-white">Driver Flyer</p>
                    <p className="text-xs text-muted-foreground">Recruit truck drivers</p>
                  </div>
                </Link>
                <Link href="/food-truck-flyer">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/30 hover:border-orange-500/50 transition-all text-center group cursor-pointer" data-testid="card-vendor-flyer">
                    <Truck className="size-8 mx-auto text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-white">Food Truck Flyer</p>
                    <p className="text-xs text-muted-foreground">Partner with vendors</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="mt-6 space-y-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="profile" className="border-none">
              <AccordionTrigger className="hover:no-underline py-4 px-4 glass-panel rounded-xl mb-2">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <BadgeCheck className="size-4 text-violet-400" />
                  My Profile
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2">
          <Card className="glass-panel border-l-4 border-l-violet-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <BadgeCheck className="size-4 text-violet-400" />
                My Business Profile
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px] ml-auto">Owner ID</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <div className="size-32 rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border-2 border-violet-500/50 flex items-center justify-center overflow-hidden">
                    <User className="size-16 text-violet-300" />
                  </div>
                  <button className="absolute -bottom-2 -right-2 size-10 rounded-full bg-violet-500 text-white flex items-center justify-center hover:bg-violet-600 transition-colors shadow-lg">
                    <Camera className="size-5" />
                  </button>
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Profile Photo</p>
                  <p className="text-sm text-white">Upload a clear photo of yourself for identification when meeting vendors and drivers.</p>
                  <Button size="sm" variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/20">
                    <Upload className="size-3 mr-2" /> Upload Photo
                  </Button>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</label>
                    <Input placeholder="Kathy" className="bg-white/5 border-white/10 h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Business Name</label>
                    <Input placeholder="TruckRunner Nashville" className="bg-white/5 border-white/10 h-11" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Phone Number</label>
                    <Input placeholder="(615) 555-RUNNER" className="bg-white/5 border-white/10 h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Email</label>
                    <Input placeholder="kathy@truckrunner.com" className="bg-white/5 border-white/10 h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Service Area</label>
                  <Input placeholder="Nashville, Lebanon, Mt. Juliet, TN" className="bg-white/5 border-white/10 h-11" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Bio / About Me</label>
                  <Textarea placeholder="Tell drivers and vendors a bit about yourself and your service..." className="bg-white/5 border-white/10 min-h-[100px]" />
                </div>
              </div>

              <Button className="w-full bg-violet-500 text-white hover:bg-violet-600 font-bold min-h-[44px]">
                <Save className="size-4 mr-2" /> Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Vehicle Info */}
          <Card className="glass-panel border-l-4 border-l-cyan-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Car className="size-4 text-cyan-400" />
                Delivery Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Vehicle Type</label>
                  <Input placeholder="SUV, Van, Car..." className="bg-white/5 border-white/10 h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Make / Model</label>
                  <Input placeholder="Honda CR-V" className="bg-white/5 border-white/10 h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Color</label>
                  <Input placeholder="Silver" className="bg-white/5 border-white/10 h-11" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">License Plate</label>
                  <Input placeholder="ABC-1234" className="bg-white/5 border-white/10 h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Vehicle Photo</label>
                  <Button size="sm" variant="outline" className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20">
                    <Upload className="size-3 mr-2" /> Upload Vehicle Photo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Driver Photos Section */}
          <Card className="glass-panel border-l-4 border-l-emerald-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="size-4 text-emerald-400" />
                Driver Photo Verification
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] ml-auto">Safety Feature</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                When drivers place an order, they can upload a selfie so you know exactly who you're delivering to. This makes deliveries safer and faster.
              </p>
              
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-300 font-bold uppercase mb-3">How It Works:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
                      <span className="text-xs text-emerald-400 font-bold">1</span>
                    </div>
                    <p className="text-sm text-white">Driver places an order through the app</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
                      <span className="text-xs text-emerald-400 font-bold">2</span>
                    </div>
                    <p className="text-sm text-white">App prompts them to take a quick selfie</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
                      <span className="text-xs text-emerald-400 font-bold">3</span>
                    </div>
                    <p className="text-sm text-white">You see their photo with the order details</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
                      <span className="text-xs text-emerald-400 font-bold">4</span>
                    </div>
                    <p className="text-sm text-white">Easy to identify who you're meeting at the truck</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-sm text-white font-medium">Require Driver Photos</p>
                  <p className="text-xs text-muted-foreground">Ask drivers to upload a selfie with their order</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Enabled</Badge>
                </div>
              </div>

              {/* Sample Driver Photos */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Recent Driver Photos</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {["Mike T.", "Sarah J.", "Carlos M.", "Jenny W.", "Dave R.", "Tom H."].map((name, i) => (
                    <div key={i} className="text-center">
                      <div className="size-12 sm:size-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center mx-auto mb-1">
                        <User className="size-6 text-emerald-300/50" />
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Badge Preview */}
          <Card className="glass-panel bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <BadgeCheck className="size-4 text-violet-400" />
                Digital ID Badge Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs mx-auto p-6 rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-violet-500/40 text-center">
                <div className="size-20 rounded-full bg-violet-500/30 border-2 border-violet-400/50 flex items-center justify-center mx-auto mb-3">
                  <User className="size-10 text-violet-300" />
                </div>
                <p className="text-lg font-bold text-white">Kathy Grater</p>
                <p className="text-sm text-violet-300">Happy Eats Nashville</p>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-muted-foreground">Verified Runner</p>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mt-1">
                    <BadgeCheck className="size-3 mr-1" /> Active
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Show this badge when meeting vendors or drivers for easy identification
              </p>
            </CardContent>
          </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="documents" className="border-none">
              <AccordionTrigger className="hover:no-underline py-4 px-4 glass-panel rounded-xl mb-2">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderOpen className="size-4 text-cyan-400" />
                  Documents & Compliance
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2">
          <Card className="glass-panel border-l-4 border-l-emerald-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="size-4 text-emerald-400" />
                My Agreements
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] ml-auto">Blockchain Verified</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Handshake className="size-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Founding Partner Agreement</p>
                      <p className="text-xs text-muted-foreground">TL-HE-2026-0001 • Happy Eats Nashville</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    <CheckCircle className="size-3 mr-1" /> Acknowledged
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <button 
                    onClick={() => setShowProfitSplitModal(true)}
                    className="bg-white/5 rounded-lg p-2 text-left hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-emerald-500/30"
                    data-testid="button-profit-split-info"
                  >
                    <p className="text-muted-foreground">Profit Split</p>
                    <p className="text-white font-medium flex items-center gap-1">80% to You <ChevronRight className="size-3 text-emerald-400" /></p>
                  </button>
                  <button 
                    onClick={() => setShowSubscriptionModal(true)}
                    className="bg-white/5 rounded-lg p-2 text-left hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-cyan-500/30"
                    data-testid="button-subscription-info"
                  >
                    <p className="text-muted-foreground">Subscription Share</p>
                    <p className="text-white font-medium flex items-center gap-1">50% in Your Market <ChevronRight className="size-3 text-cyan-400" /></p>
                  </button>
                </div>
                <div className="flex gap-2">
                  <Link href="/partner/kathy" className="flex-1">
                    <Button data-testid="button-view-agreement" variant="outline" size="sm" className="w-full gap-1 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
                      <Eye className="size-3" /> View Agreement
                    </Button>
                  </Link>
                  <Button 
                    data-testid="button-download-agreement-receipt"
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-1 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                    onClick={() => {
                      const receiptHtml = `<!DOCTYPE html><html><head><title>Partnership Receipt - TL-HE-2026-0001</title><style>body{font-family:system-ui,sans-serif;padding:40px;max-width:800px;margin:0 auto;background:#f8fafc}.header{text-align:center;border-bottom:3px solid #10b981;padding-bottom:20px;margin-bottom:30px}.logo{font-size:28px;font-weight:bold;color:#0f172a}.verified-badge{display:inline-block;background:#dcfce7;color:#166534;padding:8px 16px;border-radius:20px;font-size:14px;margin-top:15px}.section{background:white;border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #e2e8f0}.section-title{font-size:12px;text-transform:uppercase;color:#94a3b8;margin-bottom:15px;letter-spacing:1px}.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9}.row:last-child{border-bottom:none}.label{color:#64748b}.value{font-weight:600;color:#0f172a}.footer{text-align:center;color:#94a3b8;font-size:12px;margin-top:30px}</style></head><body><div class="header"><div class="logo">Happy Eats</div><div>Partnership Agreement Receipt</div><div class="verified-badge">Blockchain Verified</div></div><div class="section"><div class="section-title">Partner Information</div><div class="row"><span class="label">Partner Name</span><span class="value">Kathy Grater</span></div><div class="row"><span class="label">Business Name</span><span class="value">Happy Eats Nashville</span></div><div class="row"><span class="label">Membership Number</span><span class="value">TL-HE-2026-0001</span></div><div class="row"><span class="label">Territory</span><span class="value">Nashville, Lebanon, Mt. Juliet, Smyrna, LaVergne</span></div></div><div class="section"><div class="section-title">Agreement Terms</div><div class="row"><span class="label">Delivery Profit Share</span><span class="value">80% to Partner</span></div><div class="row"><span class="label">Subscription Revenue Share</span><span class="value">50%</span></div><div class="row"><span class="label">Franchise Fee</span><span class="value">20% to Dark Wave Studios LLC</span></div></div><div class="footer"><p>Dark Wave Studios LLC • darkwavestudios.io</p><p>This receipt confirms your partnership agreement.</p></div></body></html>`;
                      const blob = new Blob([receiptHtml], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'HappyEats_Receipt_TL-HE-2026-0001.html';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <FileDown className="size-3" /> Download Receipt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Compliance Documents Section */}
          <Card className="glass-panel border-l-4 border-l-violet-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <FolderOpen className="size-4 text-violet-400" />
                My Compliance Documents
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px] ml-auto">Secure Storage</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your identity and compliance documents are securely stored and encrypted. Only accessible for audits or verification purposes.
              </p>
              
              <div className="space-y-3">
                {/* ID Front */}
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-white/5">
                  <div className={`size-8 rounded-lg flex items-center justify-center ${documentsUploaded.idFront ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                    {documentsUploaded.idFront ? <CheckCircle className="size-4 text-emerald-400" /> : <BadgeCheck className="size-4 text-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Driver's License / State ID (Front)</p>
                    <p className="text-xs text-muted-foreground">{documentsUploaded.idFront ? 'Uploaded - securely stored' : 'Not yet uploaded'}</p>
                  </div>
                  {documentsUploaded.idFront && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">On File</Badge>
                  )}
                </div>
                
                {/* ID Back */}
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-white/5">
                  <div className={`size-8 rounded-lg flex items-center justify-center ${documentsUploaded.idBack ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                    {documentsUploaded.idBack ? <CheckCircle className="size-4 text-emerald-400" /> : <BadgeCheck className="size-4 text-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Driver's License / State ID (Back)</p>
                    <p className="text-xs text-muted-foreground">{documentsUploaded.idBack ? 'Uploaded - securely stored' : 'Not yet uploaded'}</p>
                  </div>
                  {documentsUploaded.idBack && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">On File</Badge>
                  )}
                </div>
                
                {/* Birth Certificate or Passport */}
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-white/5">
                  <div className={`size-8 rounded-lg flex items-center justify-center ${documentsUploaded.idOrBirthCert ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                    {documentsUploaded.idOrBirthCert ? <CheckCircle className="size-4 text-emerald-400" /> : <Globe className="size-4 text-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Birth Certificate or Passport</p>
                    <p className="text-xs text-muted-foreground">{documentsUploaded.idOrBirthCert ? 'Uploaded - securely stored' : 'Not yet uploaded'}</p>
                  </div>
                  {documentsUploaded.idOrBirthCert && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">On File</Badge>
                  )}
                </div>
                
                {/* IRS Business Verification */}
                <div className="border-t border-white/10 pt-3 mt-3">
                  <p className="text-xs text-cyan-300 font-medium mb-2">Business Verification (Required - 30 day grace period)</p>
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-white/5">
                    <div className={`size-8 rounded-lg flex items-center justify-center ${documentsUploaded.irsVerification ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                      {documentsUploaded.irsVerification ? <CheckCircle className="size-4 text-emerald-400" /> : <Clock className="size-4 text-amber-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">IRS EIN Confirmation (CP 575 / Letter 147C)</p>
                      <p className="text-xs text-muted-foreground">{documentsUploaded.irsVerification ? 'Uploaded - securely stored' : 'Pending - required within 30 days'}</p>
                    </div>
                    {documentsUploaded.irsVerification ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">On File</Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-300 text-[10px]">Pending</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {!(documentsUploaded.idFront && documentsUploaded.idBack && documentsUploaded.idOrBirthCert) && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-amber-300 text-sm flex items-center gap-2">
                    <AlertTriangle className="size-4" /> Some documents are missing
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please upload your remaining documents in the Quick Start tab to complete your onboarding.
                  </p>
                </div>
              )}
              
              {documentsUploaded.idFront && documentsUploaded.idBack && documentsUploaded.idOrBirthCert && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
                  <CheckCircle className="size-5 text-emerald-400 mx-auto mb-1" />
                  <p className="text-emerald-300 text-sm font-medium">All compliance documents on file</p>
                  <p className="text-xs text-muted-foreground">Your documents are securely stored and ready for any compliance requirements.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel border-l-4 border-l-cyan-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Scan className="size-4 text-cyan-400" />
                Document Scanner
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] ml-auto">OCR Enabled</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan receipts, invoices, and documents. Text will be automatically extracted for easy record-keeping.
              </p>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {!scannerImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-cyan-500/30 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all"
                  data-testid="button-scan-upload"
                >
                  <div className="size-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                    <Camera className="size-8 text-cyan-400" />
                  </div>
                  <p className="text-white font-medium mb-1">Tap to Scan Document</p>
                  <p className="text-sm text-muted-foreground">Take a photo or upload an image</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={scannerImage} alt="Scanned document" className="w-full max-h-64 object-contain bg-black/20" />
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="absolute top-2 right-2"
                      onClick={() => { setScannerImage(null); setScannedText(""); }}
                      data-testid="button-remove-image"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  
                  {isScanning ? (
                    <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
                      <div className="animate-spin size-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-cyan-400 font-medium">Scanning document...</p>
                      <p className="text-xs text-muted-foreground">Extracting text with OCR</p>
                    </div>
                  ) : scannedText && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs text-muted-foreground uppercase mb-2">Extracted Text</p>
                        <pre className="text-sm text-white whitespace-pre-wrap font-mono">{scannedText}</pre>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={saveDocument} className="flex-1 bg-cyan-500 text-white hover:bg-cyan-600" data-testid="button-save-document">
                          <Save className="size-4 mr-2" /> Save Document
                        </Button>
                        <Button variant="outline" className="border-white/20" onClick={() => navigator.clipboard.writeText(scannedText)} data-testid="button-copy-text">
                          <Copy className="size-4 mr-2" /> Copy Text
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <FolderOpen className="size-4 text-primary" />
                Saved Documents
              </CardTitle>
              <Badge className="bg-white/10 text-white border-white/20">{savedDocuments.length} files</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {savedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <FileText className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.date} • {doc.type}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="size-8 p-0">
                      <Eye className="size-4 text-muted-foreground" />
                    </Button>
                    <Button size="sm" variant="ghost" className="size-8 p-0">
                      <Printer className="size-4 text-muted-foreground" />
                    </Button>
                    <Button size="sm" variant="ghost" className="size-8 p-0 text-red-400 hover:text-red-300">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payments" className="border-none">
              <AccordionTrigger className="hover:no-underline py-4 px-4 glass-panel rounded-xl mb-2">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="size-4 text-violet-400" />
                  Payments
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2">
          <Card className="glass-panel border-l-4 border-l-violet-500">
            <CardHeader>
              <CardTitle className="text-white text-sm sm:text-base flex items-center gap-2">
                <CreditCard className="size-4" />
                Payment Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-primary/10 border border-violet-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 rounded-lg bg-white flex items-center justify-center">
                    <svg viewBox="0 0 28 11" className="h-3" fill="#635bff">
                      <path d="M11.76 3.59c0-.88.73-1.22 1.93-1.22a12.7 12.7 0 0 1 5.62 1.46V.52A15 15 0 0 0 13.69 0C9.4 0 6.5 2.1 6.5 5.62c0 5.48 7.53 4.6 7.53 6.96 0 1.04-.9 1.38-2.17 1.38a13.9 13.9 0 0 1-6.15-1.53v3.36c2.1.94 4.2 1.34 6.15 1.34 4.4 0 7.43-2.18 7.43-5.62-.01-5.92-7.53-4.87-7.53-7.12z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Stripe Integration</h3>
                    <p className="text-xs text-muted-foreground">Secure payment processing</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Connect Stripe to accept cards, Apple Pay, and Google Pay.
                </p>
                <Button data-testid="button-connect-stripe" className="w-full bg-violet-500 text-white hover:bg-violet-600 font-bold text-sm">
                  Connect Stripe Account
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Rate</p>
                  <p className="text-sm font-bold text-white">2.9%</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Payout</p>
                  <p className="text-sm font-bold text-white">Daily</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Status</p>
                  <p className="text-sm font-bold text-amber-400">Setup</p>
                </div>
              </div>
            </CardContent>
          </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="seo" className="border-none">
              <AccordionTrigger className="hover:no-underline py-4 px-4 glass-panel rounded-xl mb-2">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  SEO & Blog
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2">
          <Card className="glass-panel bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10">
            <CardHeader>
              <CardTitle className="text-white text-sm sm:text-base flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Page Title</label>
                <Input 
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="bg-white/5 border-white/10"
                  placeholder="Enter page title..."
                />
                <p className="text-[10px] text-muted-foreground mt-1">{seoTitle.length}/60 characters</p>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Meta Description</label>
                <Textarea 
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="bg-white/5 border-white/10 min-h-[80px]"
                  placeholder="Enter meta description..."
                />
                <p className="text-[10px] text-muted-foreground mt-1">{seoDescription.length}/160 characters</p>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Keywords</label>
                <Input 
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  className="bg-white/5 border-white/10"
                  placeholder="keyword1, keyword2, keyword3..."
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium text-white mb-3">Preview</h4>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-blue-400 text-sm font-medium truncate">{seoTitle || "Page Title"}</p>
                  <p className="text-emerald-400 text-xs truncate">truckrunner.app</p>
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{seoDescription || "Meta description will appear here..."}</p>
                </div>
              </div>

              <Button className="w-full bg-primary text-primary-foreground">
                <Save className="size-4 mr-2" /> Save SEO Settings
              </Button>
            </CardContent>
          </Card>

          <BlogManager />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="mt-6 space-y-6">
          {/* Order Approval Notice */}
          <Card className="glass-panel border-l-4 border-l-amber-400 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white mb-1">Order Approval Required</p>
                  <p className="text-sm text-muted-foreground">
                    All orders require your approval before pickup. Customers will see "Awaiting Confirmation" until you accept. 
                    Use the calculator below to verify profitability before accepting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Calculator */}
          <Card className="glass-panel border-l-4 border-l-emerald-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="size-4 text-emerald-400" />
                Delivery Profit Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Order Amount ($)</label>
                  <Input
                    type="number"
                    placeholder="30.00"
                    value={calcOrderAmount}
                    onChange={(e) => setCalcOrderAmount(e.target.value)}
                    className="bg-white/5 border-white/10"
                    data-testid="input-calc-order"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">One-Way Distance (miles)</label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={calcDistance}
                    onChange={(e) => setCalcDistance(e.target.value)}
                    className="bg-white/5 border-white/10"
                    data-testid="input-calc-distance"
                  />
                </div>
              </div>
              
              {(calcOrderAmount || calcDistance) && (
                <div className={`p-4 rounded-xl border ${calculateProfit().isProfitable ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-lg font-bold text-white">${calculateProfit().totalRevenue.toFixed(2)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        ${calculateProfit().serviceFee.toFixed(2)} fee + ${calculateProfit().deliveryFee.toFixed(2)} delivery
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cost (IRS Rate)</p>
                      <p className="text-lg font-bold text-white">${calculateProfit().totalCost.toFixed(2)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {calculateProfit().roundTripMiles} mi round trip × $0.70
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Net Profit</p>
                      <p className={`text-2xl font-bold ${calculateProfit().isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${calculateProfit().profit.toFixed(2)}
                      </p>
                    </div>
                    <Badge className={calculateProfit().isProfitable ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}>
                      {calculateProfit().isProfitable ? 'PROFITABLE' : 'NOT PROFITABLE'}
                    </Badge>
                  </div>
                </div>
              )}
              
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-muted-foreground mb-2">Quick Reference - Minimum Order by Distance:</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded bg-white/5">
                    <p className="text-xs text-muted-foreground">5 mi</p>
                    <p className="text-sm font-bold text-white">$8+</p>
                  </div>
                  <div className="p-2 rounded bg-white/5">
                    <p className="text-xs text-muted-foreground">10 mi</p>
                    <p className="text-sm font-bold text-white">$17+</p>
                  </div>
                  <div className="p-2 rounded bg-white/5">
                    <p className="text-xs text-muted-foreground">15 mi</p>
                    <p className="text-sm font-bold text-white">$28+</p>
                  </div>
                  <div className="p-2 rounded bg-white/5">
                    <p className="text-xs text-muted-foreground">20 mi</p>
                    <p className="text-sm font-bold text-white">$40+</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Zones */}
          <Card className="glass-panel border-l-4 border-l-violet-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="size-4 text-violet-400" />
                Delivery Zones
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px] ml-auto">Configurable</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Set your delivery radius for each zone. Orders outside these boundaries will be flagged for review.
              </p>
              
              {zones.map((zone) => (
                <div key={zone.id} className={`p-4 rounded-xl border ${zone.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-violet-500/10 border-violet-500/30'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-full ${zone.color === 'emerald' ? 'bg-emerald-500/30' : 'bg-violet-500/30'} flex items-center justify-center`}>
                        <Circle className={`size-5 ${zone.color === 'emerald' ? 'text-emerald-400' : 'text-violet-400'}`} />
                      </div>
                      <div>
                        <p className="font-bold text-white">{zone.name} Zone</p>
                        <p className="text-xs text-muted-foreground">{zone.center} • ZIP: {zone.zipCode}</p>
                      </div>
                    </div>
                    <Badge className={`${zone.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-violet-500/20 text-violet-300 border-violet-500/30'}`}>
                      {zone.radius} mi radius
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-muted-foreground whitespace-nowrap">Radius (miles):</label>
                    <input
                      type="range"
                      min="5"
                      max="25"
                      value={zone.radius}
                      onChange={(e) => updateZoneRadius(zone.id, parseInt(e.target.value))}
                      className="flex-1 accent-orange-500"
                      data-testid={`slider-zone-${zone.id}`}
                    />
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={zone.radius}
                      onChange={(e) => updateZoneRadius(zone.id, parseInt(e.target.value) || 5)}
                      className="w-16 bg-white/5 border-white/10 text-center"
                      data-testid={`input-zone-${zone.id}`}
                    />
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full border-dashed border-white/20 text-muted-foreground hover:text-white" data-testid="button-add-zone">
                + Add New Zone
              </Button>
            </CardContent>
          </Card>

          {/* Driver Status */}
          <Card className="glass-panel border-l-4 border-l-sky-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="size-4 text-sky-400" />
                Driver Status
                <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-[10px] ml-auto">
                  {drivers.filter(d => d.status === 'on-duty').length} On Duty
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {drivers.map((driver) => (
                <div key={driver.id} className={`p-4 rounded-xl border flex items-center justify-between ${driver.status === 'on-duty' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-full ${driver.status === 'on-duty' ? 'bg-emerald-500/30' : 'bg-white/10'} flex items-center justify-center`}>
                      <User className={`size-5 ${driver.status === 'on-duty' ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-white">{driver.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {driver.zone} Zone {driver.location && `• ${driver.location}`}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    variant={driver.status === 'on-duty' ? 'default' : 'outline'}
                    className={driver.status === 'on-duty' ? 'bg-emerald-500 hover:bg-emerald-600' : 'border-white/20'}
                    onClick={() => toggleDriverStatus(driver.id)}
                    data-testid={`button-toggle-driver-${driver.id}`}
                  >
                    {driver.status === 'on-duty' ? 'On Duty' : 'Off Duty'}
                  </Button>
                </div>
              ))}
              
              <Button variant="outline" className="w-full border-dashed border-white/20 text-muted-foreground hover:text-white" data-testid="button-add-driver">
                + Add Driver
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-panel border-l-4 border-l-red-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="size-4 text-red-400" />
                Report an Incident
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-[10px] ml-auto">New Report</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Document accidents, damage, or incidents for insurance and record-keeping purposes.
              </p>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Incident Type</label>
                  <select 
                    value={incidentForm.type}
                    onChange={(e) => setIncidentForm({...incidentForm, type: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    data-testid="select-admin-incident-type"
                  >
                    <option value="">Select type...</option>
                    <option value="Vehicle Damage">Vehicle Damage</option>
                    <option value="Parking Lot Incident">Parking Lot Incident</option>
                    <option value="Road Accident">Road Accident</option>
                    <option value="Delivery Issue">Delivery Issue</option>
                    <option value="Customer Complaint">Customer Complaint</option>
                    <option value="Property Damage">Property Damage</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Location</label>
                  <Input 
                    value={incidentForm.location}
                    onChange={(e) => setIncidentForm({...incidentForm, location: e.target.value})}
                    placeholder="Where did this happen?" 
                    className="bg-white/5 border-white/10"
                    data-testid="input-admin-incident-location"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Description</label>
                  <Textarea 
                    value={incidentForm.description}
                    onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})}
                    placeholder="Describe what happened in detail..." 
                    className="bg-white/5 border-white/10 min-h-[100px]"
                    data-testid="textarea-admin-incident-description"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Photos (Optional)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all" data-testid="button-add-photo-camera">
                      <Camera className="size-6 text-muted-foreground" />
                    </div>
                    <div className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all" data-testid="button-add-photo-file">
                      <FileImage className="size-6 text-muted-foreground" />
                    </div>
                    <div className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all" data-testid="button-add-photo-upload">
                      <Upload className="size-6 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                
                <Button onClick={submitIncident} className="w-full bg-red-500 text-white hover:bg-red-600 min-h-[44px]" data-testid="button-submit-admin-incident">
                  <AlertTriangle className="size-4 mr-2" /> Submit Incident Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <FolderOpen className="size-4 text-amber-400" />
                Incident History
              </CardTitle>
              <Badge className="bg-white/10 text-white border-white/20">{incidents.length} reports</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {incidents.map((incident) => (
                <div key={incident.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-white font-medium">{incident.type}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Calendar className="size-3" /> {incident.date}
                        <MapPin className="size-3 ml-2" /> {incident.location}
                      </p>
                    </div>
                    <Badge className={`${incident.status === 'documented' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                      {incident.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                  {incident.photos > 0 && (
                    <p className="text-xs text-cyan-400 mt-2 flex items-center gap-1">
                      <FileImage className="size-3" /> {incident.photos} photos attached
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-panel bg-gradient-to-br from-amber-500/10 to-red-500/10 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Phone className="size-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-bold text-white mb-1">Emergency Contacts</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Emergency: <span className="text-white">911</span></p>
                    <p>Roadside Assistance: <span className="text-cyan-400">Coming Soon</span></p>
                    <p>Insurance Claim Line: <span className="text-cyan-400">Add your number</span></p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 space-y-8">
          <AnalyticsDashboard tenantId={user?.id} />
          <RevenueDashboard adminPin={user?.pin || ""} />
        </TabsContent>
      </Tabs>

      {/* Profit Split Explanation Modal */}
      <Dialog open={showProfitSplitModal} onOpenChange={setShowProfitSplitModal}>
        <DialogContent className="bg-[#0d1f35] border-emerald-500/20 max-w-md">
          <DialogHeader>
            <div className="size-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <DollarSign className="size-8 text-emerald-400" />
            </div>
            <DialogTitle className="text-2xl font-heading font-bold text-white text-center">
              80/20 Profit Split
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              How your delivery earnings are divided
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-emerald-400 font-bold text-2xl text-center mb-1">80%</p>
              <p className="text-white font-medium text-center">Vendor Keeps</p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Vendors keep 80% of every order — the lowest commission rate in the industry (DoorDash/Uber Eats take 15-30%)
              </p>
            </div>
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
              <p className="text-violet-400 font-bold text-2xl text-center mb-1">20%</p>
              <p className="text-white font-medium text-center">Platform Commission</p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Split: Kathy 50% · Jason 40% · Expense Reserve 10%
              </p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                For Shell's Kitchen (owner-operated) — 100% stays in platform. No vendor split.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Link href="/partner/kathy" className="flex-1">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="button-view-full-agreement">
                  View Full Agreement
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setShowProfitSplitModal(false)} className="border-white/20" data-testid="button-close-profit-modal">
                Got It
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Share Explanation Modal */}
      <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
        <DialogContent className="bg-[#0d1f35] border-cyan-500/20 max-w-md">
          <DialogHeader>
            <div className="size-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
              <Users className="size-8 text-cyan-400" />
            </div>
            <DialogTitle className="text-2xl font-heading font-bold text-white text-center">
              Subscription Revenue Share
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Recurring revenue from driver subscriptions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
              <p className="text-cyan-400 font-bold text-2xl text-center mb-1">50%</p>
              <p className="text-white font-medium text-center">In Your Direct Market</p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Nashville, Lebanon, Mt. Juliet, Smyrna, LaVergne - your exclusive territory
              </p>
            </div>
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
              <p className="text-violet-400 font-bold text-2xl text-center mb-1">25%</p>
              <p className="text-white font-medium text-center">Outside Your Territory</p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Tier-based commission when drivers you refer use the service elsewhere
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <p className="text-emerald-300 text-xs">
                Subscription revenue is separate from delivery profits - it's additional passive income as more drivers join!
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowSubscriptionModal(false)} className="w-full border-white/20" data-testid="button-close-subscription-modal">
              Got It
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Projections Breakdown Modal with Interactive Calculator */}
      <Dialog open={showProjectionsModal} onOpenChange={setShowProjectionsModal}>
        <DialogContent className="bg-[#0d1f35] border-violet-500/20 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="size-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-3 border border-violet-500/30">
              <Calculator className="size-6 text-violet-400" />
            </div>
            <DialogTitle className="text-xl font-heading font-bold text-white text-center">
              Earnings Calculator
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground text-sm">
              Adjust the sliders to see your projected earnings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-3">
            {/* Interactive Sliders */}
            <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl p-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white text-sm font-medium">Orders per Week</label>
                  <span className="text-violet-400 font-bold text-lg">{projOrdersPerWeek}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={projOrdersPerWeek}
                  onChange={(e) => setProjOrdersPerWeek(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  data-testid="slider-orders-per-week"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>10</span>
                  <span>Starting</span>
                  <span>Growing</span>
                  <span>200</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white text-sm font-medium">Avg Order Value</label>
                  <span className="text-cyan-400 font-bold text-lg">${projAvgOrderValue}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="75"
                  step="5"
                  value={projAvgOrderValue}
                  onChange={(e) => setProjAvgOrderValue(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  data-testid="slider-avg-order-value"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>$10</span>
                  <span>Fast Food</span>
                  <span>Full Meal</span>
                  <span>$75</span>
                </div>
              </div>
            </div>

            {/* Live Calculated Results */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <p className="text-muted-foreground text-[10px] mb-1">Your Weekly Profit</p>
                <p className="text-emerald-400 font-bold text-xl">${calculateProjections().weeklyProfit}</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-3 text-center">
                <p className="text-muted-foreground text-[10px] mb-1">Your Monthly Profit</p>
                <p className="text-cyan-400 font-bold text-xl">${calculateProjections().monthlyProfit}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-violet-500/10 to-rose-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-xs mb-1">Projected Yearly Earnings</p>
              <p className="text-violet-400 font-bold text-3xl">${Number(calculateProjections().yearlyProfit).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Your 80% after franchise fee</p>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2">
              <button
                onClick={() => { setProjOrdersPerWeek(50); setProjAvgOrderValue(25); }}
                className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-center transition-colors"
                data-testid="button-preset-starting"
              >
                <p className="text-white font-medium">Starting</p>
                <p className="text-muted-foreground text-[10px]">50/wk • $25 avg</p>
              </button>
              <button
                onClick={() => { setProjOrdersPerWeek(100); setProjAvgOrderValue(30); }}
                className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-center transition-colors"
                data-testid="button-preset-growing"
              >
                <p className="text-white font-medium">Growing</p>
                <p className="text-muted-foreground text-[10px]">100/wk • $30 avg</p>
              </button>
              <button
                onClick={() => { setProjOrdersPerWeek(150); setProjAvgOrderValue(35); }}
                className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-center transition-colors"
                data-testid="button-preset-thriving"
              >
                <p className="text-white font-medium">Thriving</p>
                <p className="text-muted-foreground text-[10px]">150/wk • $35 avg</p>
              </button>
            </div>

            <div className="bg-white/5 rounded-lg p-3 space-y-1">
              <p className="text-white text-xs font-medium">How it's calculated:</p>
              <p className="text-[10px] text-muted-foreground">
                (20% platform commission + $3.99 delivery) × orders = platform revenue. Kathy 50% · Jason 40% · Expense 10%
              </p>
            </div>
            
            <Button variant="outline" onClick={() => setShowProjectionsModal(false)} className="w-full border-white/20" data-testid="button-close-projections-modal">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function BatchPickupCoordinator({ orders, onStatusUpdate }: { orders: any[]; onStatusUpdate: (orderId: number, status: string) => void }) {
  const [cutoffCountdown, setCutoffCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setHours(10, 30, 0, 0);
      const diff = cutoff.getTime() - now.getTime();
      if (diff <= 0) {
        setCutoffCountdown({ hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }
      setCutoffCountdown({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        isPast: false,
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeOrders = orders.filter((o: any) => !["delivered", "cancelled"].includes(o.status));

  const byVendor = new Map<number, { name: string; orders: any[] }>();
  activeOrders.forEach((o: any) => {
    const tid = o.foodTruckId || 0;
    if (!byVendor.has(tid)) byVendor.set(tid, { name: o.locationName || `Vendor #${tid}`, orders: [] });
    byVendor.get(tid)!.orders.push(o);
  });

  const readyCount = activeOrders.filter((o: any) => o.vendorStatus === "ready").length;
  const preparingCount = activeOrders.filter((o: any) => o.vendorStatus === "preparing").length;
  const pendingCount = activeOrders.filter((o: any) => (o.vendorStatus || "pending") === "pending").length;
  const pickedUpCount = activeOrders.filter((o: any) => o.status === "picked_up").length;

  const bulkPickup = () => {
    activeOrders.filter((o: any) => o.vendorStatus === "ready" && o.status === "confirmed").forEach((o: any) => {
      onStatusUpdate(o.id, "picked_up");
    });
  };

  const bulkDeliver = () => {
    activeOrders.filter((o: any) => o.status === "picked_up").forEach((o: any) => {
      onStatusUpdate(o.id, "delivered");
    });
  };

  if (activeOrders.length === 0) return null;

  return (
    <Card className="glass-panel bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10 border-cyan-500/20" data-testid="card-batch-coordinator">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
          <div className="size-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Package className="size-4 text-cyan-400" />
          </div>
          Batch Pickup Coordinator
          <Badge className="ml-auto bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">
            {activeOrders.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/15 text-center">
            <p className="text-lg font-bold text-amber-300">{pendingCount}</p>
            <p className="text-[9px] text-amber-400/70 uppercase tracking-wider">Pending</p>
          </div>
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/15 text-center">
            <p className="text-lg font-bold text-violet-300">{preparingCount}</p>
            <p className="text-[9px] text-violet-400/70 uppercase tracking-wider">Preparing</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/15 text-center">
            <p className="text-lg font-bold text-emerald-300">{readyCount}</p>
            <p className="text-[9px] text-emerald-400/70 uppercase tracking-wider">Ready</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/15 text-center">
            <p className="text-lg font-bold text-blue-300">{pickedUpCount}</p>
            <p className="text-[9px] text-blue-400/70 uppercase tracking-wider">Picked Up</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
          <Clock className="size-4 text-cyan-400 shrink-0" />
          {cutoffCountdown.isPast ? (
            <div className="flex-1">
              <p className="text-xs text-amber-300 font-medium">Lunch cutoff has passed (10:30 AM)</p>
              <p className="text-[10px] text-slate-500">Dinner orders accepted until 5:00 PM</p>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-xs text-white font-medium">Lunch Cutoff</p>
                <p className="text-[10px] text-slate-500">Orders close at 10:30 AM</p>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="font-mono font-bold text-sm text-cyan-300 bg-cyan-500/10 rounded px-1.5 py-0.5">{cutoffCountdown.hours}</span>
                <span className="text-cyan-400 font-bold text-xs">:</span>
                <span className="font-mono font-bold text-sm text-cyan-300 bg-cyan-500/10 rounded px-1.5 py-0.5">{String(cutoffCountdown.minutes).padStart(2, "0")}</span>
                <span className="text-cyan-400 font-bold text-xs">:</span>
                <span className="font-mono font-bold text-sm text-cyan-300 bg-cyan-500/10 rounded px-1.5 py-0.5">{String(cutoffCountdown.seconds).padStart(2, "0")}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Orders by Vendor</p>
          {Array.from(byVendor.entries()).map(([truckId, { name, orders: vendorOrders }]) => {
            const vendorReady = vendorOrders.filter((o: any) => o.vendorStatus === "ready").length;
            const vendorTotal = vendorOrders.reduce((s: number, o: any) => s + parseFloat(o.total || 0), 0);
            return (
              <div key={truckId} className="p-3 rounded-xl bg-white/5 border border-white/5" data-testid={`vendor-batch-${truckId}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
                      <ChefHat className="size-3.5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{name}</p>
                      <p className="text-[10px] text-slate-500">{vendorOrders.length} order{vendorOrders.length !== 1 ? "s" : ""} · ${vendorTotal.toFixed(2)}</p>
                    </div>
                  </div>
                  {vendorReady === vendorOrders.length && vendorOrders.length > 0 ? (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px]">
                      All Ready
                    </Badge>
                  ) : vendorReady > 0 ? (
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px]">
                      {vendorReady}/{vendorOrders.length} Ready
                    </Badge>
                  ) : (
                    <Badge className="bg-white/10 text-slate-400 border-white/10 text-[9px]">
                      Waiting
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {vendorOrders.map((o: any) => {
                    const vs = o.vendorStatus || "pending";
                    const colorMap: Record<string, string> = {
                      pending: "bg-amber-500/15 text-amber-300 border-amber-500/20",
                      accepted: "bg-blue-500/15 text-blue-300 border-blue-500/20",
                      preparing: "bg-violet-500/15 text-violet-300 border-violet-500/20",
                      ready: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
                    };
                    return (
                      <Badge key={o.id} className={`${colorMap[vs] || colorMap.pending} text-[8px] px-1.5 border`}>
                        #{o.id} {o.customerName?.split(" ")[0] || ""} · {vs}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            size="sm"
            className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white text-xs h-9"
            onClick={bulkPickup}
            disabled={readyCount === 0}
            data-testid="button-bulk-pickup"
          >
            <Package className="size-3.5 mr-1.5" />
            Pickup All Ready ({readyCount})
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-xs h-9"
            onClick={bulkDeliver}
            disabled={pickedUpCount === 0}
            data-testid="button-bulk-deliver"
          >
            <CheckCircle className="size-3.5 mr-1.5" />
            Deliver All ({pickedUpCount})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TodaysVendorsCard() {
  const today = new Date().toISOString().split('T')[0];

  const { data: allAvailability } = useQuery<any[]>({
    queryKey: ["admin-truck-avail", today],
    queryFn: async () => {
      const res = await fetch(`/api/truck-availability/${today}`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 60000,
  });

  const { data: allTrucks } = useQuery<any[]>({
    queryKey: ["admin-all-trucks"],
    queryFn: async () => {
      const res = await fetch("/api/food-trucks");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: zones } = useQuery<any[]>({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await fetch("/api/zones");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const confirmed = (allAvailability || []).filter((a: any) => a.status === 'confirmed');
  const truckMap = new Map((allTrucks || []).map((t: any) => [t.id, t]));
  const zoneMap = new Map((zones || []).map((z: any) => [z.id, z]));
  const totalTrucks = allTrucks?.length || 0;

  return (
    <Card className="glass-panel bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30" data-testid="card-todays-vendors">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
          <div className="size-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Truck className="size-4 text-emerald-400" />
          </div>
          Today's Vendors
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] ml-auto">
            {confirmed.length}/{totalTrucks} Confirmed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {confirmed.length === 0 ? (
          <div className="text-center py-4">
            <Clock className="size-6 text-amber-400 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No vendors have checked in for today yet</p>
            <p className="text-[10px] text-slate-500 mt-1">Vendors confirm daily availability from their dashboard</p>
          </div>
        ) : (
          confirmed.map((avail: any) => {
            const truck = truckMap.get(avail.foodTruckId);
            const zone = avail.zoneId ? zoneMap.get(avail.zoneId) : null;
            return (
              <div key={avail.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5" data-testid={`vendor-avail-${avail.id}`}>
                <div className="size-3 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{truck?.name || `Truck #${avail.foodTruckId}`}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {zone && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <MapPin className="size-2.5" /> {zone.name}
                      </span>
                    )}
                    {avail.locationAddress && (
                      <span className="text-[10px] text-slate-500 truncate">{avail.locationAddress}</span>
                    )}
                  </div>
                  {avail.notes && (
                    <p className="text-[10px] text-slate-500 italic mt-0.5 truncate">{avail.notes}</p>
                  )}
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25 text-[8px] shrink-0">
                  <CheckCircle className="size-2.5 mr-0.5" /> Open
                </Badge>
              </div>
            );
          })
        )}
        {totalTrucks > 0 && confirmed.length < totalTrucks && (
          <p className="text-[10px] text-amber-400 text-center pt-1">
            {totalTrucks - confirmed.length} vendor{totalTrucks - confirmed.length !== 1 ? 's' : ''} not yet checked in
          </p>
        )}
      </CardContent>
    </Card>
  );
}
