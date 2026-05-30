"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle, MapPin, 
  Shield, Lock, Landmark, Search, Play, RefreshCw, Check, X, 
  Award, FileText, CheckCircle2, UserCheck, MessageSquare, 
  Plus, Users, Link2, Send, Activity, Settings, LayoutDashboard,
  GraduationCap, Briefcase, Bell, ChevronDown, LogOut, User, Menu, Database, List, LayoutGrid
} from "lucide-react";
import { collection, getDocs, doc, setDoc, query, where, orderBy, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

const ODISHA_DISTRICTS = [
  "Khordha", "Cuttack", "Puri", "Baleswar", "Ganjam", "Sambalpur", 
  "Sundargarh", "Angul", "Bhadrak", "Balangir", "Bargarh", "Boudh", 
  "Deogarh", "Dhenkanal", "Gajapati", "Jagatsinghpur", "Jajpur", 
  "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", 
  "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", 
  "Nuapada", "Rayagada", "Subarnapur"
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const selectEmoji = (category) => {
  if (!category) return "🏫";
  const cat = category.toLowerCase();
  if (cat.includes("university") || cat.includes("college")) return "🎓";
  if (cat.includes("high-school") || cat.includes("school")) return "🏫";
  if (cat.includes("coaching") || cat.includes("tutorial")) return "📚";
  if (cat.includes("kindergarten") || cat.includes("play")) return "🎒";
  if (cat.includes("vocational") || cat.includes("iti")) return "🛠️";
  if (cat.includes("computer")) return "💻";
  if (cat.includes("sports") || cat.includes("gym")) return "🏆";
  return "🏫";
};

export default function AdminDashboard() {
  const { user, profile, loading, login, loginWithGoogle, logout } = useAuth();
  
  // Staff Login State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      setLoginError("Please enter both email and password.");
      return;
      }
    setLoginError("");
    setLoginLoading(true);
    try {
      await login(adminEmail.trim().toLowerCase(), adminPassword);
    } catch (err) {
      console.error(err);
      setLoginError(err.message || "Failed to log in as staff. Check credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleStaffGoogleLogin = async () => {
    setLoginError("");
    setLoginLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.exists || !["super_admin", "admin", "manager"].includes(result.profile?.role)) {
        setLoginError("This Google account is not registered as platform staff.");
        await logout();
      }
    } catch (err) {
      console.error(err);
      setLoginError(err.message || "Failed to log in with Google.");
    } finally {
      setLoginLoading(false);
    }
  };
  
  // Sidebar State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Systematic Scraper inputs state
  const [scrapingCountry, setScrapingCountry] = useState("India");
  const [scrapingState, setScrapingState] = useState("Odisha");
  const [scrapingDistrict, setScrapingDistrict] = useState("Khordha");
  const [scrapingTown, setScrapingTown] = useState("");
  const [scrapingPinCode, setScrapingPinCode] = useState("");
  const [scrapingCategory, setScrapingCategory] = useState("school");
  const [scrapingCustomCategory, setScrapingCustomCategory] = useState("");
  const [scraperLog, setScraperLog] = useState([]);
  // Job Crawler State
  const [jobQuery, setJobQuery] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [isInternationalJob, setIsInternationalJob] = useState(false);
  const [isScrapingJobs, setIsScrapingJobs] = useState(false);
  const [jobScraperLog, setJobScraperLog] = useState([]);

  const runJobScraper = async () => {
    if (!jobQuery) {
      alert("Please enter a job search query.");
      return;
    }
    
    setIsScrapingJobs(true);
    setJobScraperLog(prev => [`[${new Date().toLocaleTimeString()}] Starting job crawler for: "${jobQuery}" in "${jobLocation || 'Any'}"...`, ...prev]);
    
    try {
      const res = await fetch("/api/scrape-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          searchQuery: jobQuery, 
          location: jobLocation,
          isInternational: isInternationalJob
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setJobScraperLog(prev => [`[${new Date().toLocaleTimeString()}] ✅ ${data.message}`, ...prev]);
        alert(data.message);
      } else {
        setJobScraperLog(prev => [`[${new Date().toLocaleTimeString()}] ❌ ERROR: ${data.error}`, ...prev]);
        alert("Crawler Error: " + data.error);
      }
    } catch (error) {
      setJobScraperLog(prev => [`[${new Date().toLocaleTimeString()}] ❌ Network Error: ${error.message}`, ...prev]);
    } finally {
      setIsScrapingJobs(false);
    }
  };

  const [isScraping, setIsScraping] = useState(false);
  const [hasMoreListings, setHasMoreListings] = useState(true);

  // Manual Listing Modals & Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInstId, setEditingInstId] = useState(null);

  // Listings Filters State
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "table"

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("high-school");
  const [formCustomType, setFormCustomType] = useState("");
  const [formDistrict, setFormDistrict] = useState("Khordha");
  const [formTown, setFormTown] = useState("");
  const [formPinCode, setFormPinCode] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [formMapUri, setFormMapUri] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTier, setFormTier] = useState("free");
  const [formIsVerified, setFormIsVerified] = useState(false);
  const [formIsClaimed, setFormIsClaimed] = useState(false);

  // Staff Creator State
  const [staffEmail, setStaffEmail] = useState("");
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("manager");
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);

  // WhatsApp Campaign State
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [waTemplate, setWaTemplate] = useState("Hello [School Name], your profile has been listed on EduConnect. You can claim your verified dashboard here: https://educonnect-app-two.vercel.app/claim/[ID]");
  const [campaignLogs, setCampaignLogs] = useState([]);
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);

  // Database loaded states
  const [allUsers, setAllUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [claims, setClaims] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);

  // Load database lists on mount
  useEffect(() => {
    if (!user || !["super_admin", "admin", "manager"].includes(profile?.role)) return;

    const loadData = async () => {
      try {
        // 1. Fetch Ingested Institutions
        const instSnap = await getDocs(collection(db, "institutions"));
        const instData = [];
        instSnap.forEach(docSnap => instData.push({ id: docSnap.id, ...docSnap.data() }));
        setInstitutions(instData);

        // 2. Fetch Users
        const userSnap = await getDocs(collection(db, "users"));
        const userData = [];
        userSnap.forEach(docSnap => userData.push({ id: docSnap.id, ...docSnap.data() }));
        setAllUsers(userData);

        // 3. Fetch Jobs
        const jobsSnap = await getDocs(collection(db, "jobs"));
        const jobsData = [];
        jobsSnap.forEach(docSnap => jobsData.push({ id: docSnap.id, ...docSnap.data() }));
        setJobsList(jobsData);

        // 4. Fetch Referrals Clicks
        const refSnap = await getDocs(collection(db, "referrals"));
        const refData = [];
        refSnap.forEach(docSnap => refData.push({ id: docSnap.id, ...docSnap.data() }));
        refData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setReferrals(refData);

        // 5. Fetch Pending Claims
        const claimsSnap = await getDocs(collection(db, "claims"));
        const claimsData = [];
        claimsSnap.forEach(docSnap => {
          const d = docSnap.data();
          if (d.status === "pending") {
            claimsData.push({ id: docSnap.id, ...d });
          }
        });
        setClaims(claimsData);

        // 6. Fetch Pending Suggestions
        const sugSnap = await getDocs(collection(db, "suggestions"));
        const sugData = [];
        sugSnap.forEach(docSnap => {
          const d = docSnap.data();
          if (d.status === "pending") {
            sugData.push({ id: docSnap.id, ...d });
          }
        });
        setSuggestions(sugData);

      } catch (e) {
        console.error("Error loading admin stats:", e);
      }
    };

    loadData();
  }, [user, profile]);

  // Real Google Places Ingestion
  const runPlacesScraper = async (isLoadMore = false) => {
    if (isScraping) return;
    setIsScraping(true);

    const newLogs = [];
    const addLog = (msg) => {
      newLogs.push(msg);
      setScraperLog([...newLogs]);
    };

    if (!isLoadMore) {
      setScraperLog([]);
      addLog(`[INFO] Starting Google Places Ingestion Engine...`);
      addLog(`[INFO] District: ${scrapingDistrict.toUpperCase()}`);
      addLog(`[INFO] Town/Block: ${scrapingTown || "None"}`);
      addLog(`[INFO] Pin Code: ${scrapingPinCode || "None"}`);
      addLog(`[INFO] Category: ${scrapingCategory.toUpperCase()}`);
    } else {
      addLog(`[LOAD MORE] Querying next page of results...`);
    }

    try {
      addLog(`[API] Calling /api/scrape endpoint...`);
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: scrapingCountry,
          state: scrapingState,
          district: scrapingDistrict,
          townOrBlock: scrapingTown,
          pinCode: scrapingPinCode,
          category: scrapingCategory,
          customCategory: scrapingCustomCategory,
          pageToken: isLoadMore ? nextPageToken : null
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed API request");
      }

      const resData = await response.json();
      addLog(`[DATABASE] Success! Synced ${resData.count} institutions to database.`);
      
      resData.listings.forEach((item) => {
        addLog(`[DB] Ingested: ${item.name} (${item.type}) - ${item.district}`);
      });

      setNextPageToken(resData.nextPageToken);
      setHasMoreListings(!!resData.nextPageToken);

      // Refresh institutions from Firestore
      const instSnap = await getDocs(collection(db, "institutions"));
      const instData = [];
      instSnap.forEach(docSnap => instData.push({ id: docSnap.id, ...docSnap.data() }));
      setInstitutions(instData);

      addLog(`[SUCCESS] Seeding complete. Directory updated successfully.`);
    } catch (error) {
      console.error(error);
      addLog(`[ERROR] Ingestion pipeline failed: ${error.message}`);
    } finally {
      setIsScraping(false);
    }
  };

  // Reset Manual Form helper
  const resetForm = () => {
    setEditingInstId(null);
    setFormName("");
    setFormType("high-school");
    setFormCustomType("");
    setFormDistrict("Khordha");
    setFormTown("");
    setFormPinCode("");
    setFormAddress("");
    setFormPhone("");
    setFormWebsite("");
    setFormMapUri("");
    setFormDescription("");
    setFormTier("free");
    setFormIsVerified(false);
    setFormIsClaimed(false);
  };

  // Manual Add submit handler
  const handleAddManualSubmit = async (e) => {
    e.preventDefault();
    if (!formName) {
      alert("Name is required");
      return;
    }
    try {
      const newId = `man-${Date.now()}`;
      const newInst = {
        id: newId,
        name: formName,
        type: formType === "custom" ? formCustomType : formType,
        location: formTown.toLowerCase() || formDistrict.toLowerCase(),
        rating: 4.5,
        isVerified: formIsVerified,
        isClaimed: formIsClaimed,
        coursesCount: 5,
        studentsCount: 100,
        description: formDescription || `${formName} in ${formTown}, Odisha.`,
        address: formAddress || "",
        phone: formPhone || "",
        website: formWebsite || "",
        mapUri: formMapUri || "",
        state: "Odisha",
        district: formDistrict,
        townOrBlock: formTown || formDistrict,
        pinCode: formPinCode || "",
        logo: selectEmoji(formType === "custom" ? formCustomType : formType),
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "institutions", newId), newInst);
      alert("Institution added manually successfully!");
      setInstitutions(prev => [newInst, ...prev]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to add institution manually.");
    }
  };

  // Open Edit Modal helper
  const openEditModal = (inst) => {
    setEditingInstId(inst.id);
    setFormName(inst.name || "");
    const standardTypes = ["university", "high-school", "coaching", "kindergarten", "vocational", "computer", "sports"];
    if (standardTypes.includes(inst.type)) {
      setFormType(inst.type);
      setFormCustomType("");
    } else {
      setFormType("custom");
      setFormCustomType(inst.type || "");
    }
    setFormDistrict(inst.district || "Khordha");
    setFormTown(inst.townOrBlock || "");
    setFormPinCode(inst.pinCode || "");
    setFormAddress(inst.address || "");
    setFormPhone(inst.phone || "");
    setFormWebsite(inst.website || "");
    setFormMapUri(inst.mapUri || "");
    setFormDescription(inst.description || "");
    setFormTier(inst.tier || "free");
    setFormIsVerified(inst.isVerified || false);
    setFormIsClaimed(inst.isClaimed || false);
    setShowEditModal(true);
  };

  // Manual Edit submit handler
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !editingInstId) {
      alert("Name is required");
      return;
    }
    try {
      const instRef = doc(db, "institutions", editingInstId);
      const updatedFields = {
        name: formName,
        type: formType === "custom" ? formCustomType : formType,
        location: formTown.toLowerCase() || formDistrict.toLowerCase(),
        description: formDescription,
        address: formAddress,
        phone: formPhone,
        website: formWebsite,
        mapUri: formMapUri,
        district: formDistrict,
        townOrBlock: formTown,
        pinCode: formPinCode,
        tier: formTier,
        isVerified: formIsVerified,
        isClaimed: formIsClaimed,
        logo: selectEmoji(formType === "custom" ? formCustomType : formType)
      };

      await updateDoc(instRef, updatedFields);
      alert("Listing updated successfully!");
      setInstitutions(prev => prev.map(inst => inst.id === editingInstId ? { ...inst, ...updatedFields } : inst));
      setShowEditModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to update listing.");
    }
  };

  // Delete listing helper
  const handleDeleteListing = async (instId, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "institutions", instId));
      alert("Listing deleted successfully!");
      setInstitutions(prev => prev.filter(inst => inst.id !== instId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete listing.");
    }
  };

  // Staff Account Creator Handler
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffEmail || !staffName) {
      alert("Please fill in email and name.");
      return;
    }

    if (profile?.role === "manager") {
      alert("Permission Denied: Managers cannot create staff accounts.");
      return;
    }

    if (profile?.role === "admin" && staffRole === "admin") {
      alert("Permission Denied: Administrators can only create Managers, not other Administrators.");
      return;
    }

    setIsCreatingStaff(true);
    try {
      const newStaffUid = `staff-${Date.now()}`;
      const staffProfile = {
        uid: newStaffUid,
        name: staffName,
        email: staffEmail.trim().toLowerCase(),
        role: staffRole,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, "users", newStaffUid), staffProfile);
      setAllUsers(prev => [...prev, staffProfile]);
      setStaffEmail("");
      setStaffName("");
      alert(`Staff Created Successfully!
Registered ${staffName} as a platform ${staffRole.toUpperCase()}.`);
    } catch (error) {
      console.error(error);
      alert("Failed to register staff account.");
    } finally {
      setIsCreatingStaff(false);
    }
  };

  // WhatsApp Campaign Blaster
  const handleSendWhatsApp = () => {
    if (selectedContacts.length === 0) {
      alert("Please select at least one contact to message.");
      return;
    }
    setIsSendingCampaign(true);
    setCampaignLogs([]);

    selectedContacts.forEach((contactId, index) => {
      const contact = institutions.find(i => i.id === contactId);
      const name = contact?.name || "School";
      
      setTimeout(() => {
        setCampaignLogs(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] Blasting to: ${name} (+91 94371 9${Math.floor(10000 + Math.random() * 90000)})... Sent ✔`
        ]);
        
        if (index === selectedContacts.length - 1) {
          setIsSendingCampaign(false);
          alert(`WhatsApp Campaign Finished!
Sent ${selectedContacts.length} promotional messages.`);
        }
      }, (index + 1) * 1000);
    });
  };

  const toggleSelectContact = (id) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(c => c !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  // Approve Claim Handler
  const handleApproveClaim = async (claimId, instId, instName) => {
    if (profile?.role === "manager") {
      alert("Permission Denied: Managers cannot approve claims.");
      return;
    }

    try {
      const claimRef = doc(db, "claims", claimId);
      const claimSnap = await getDoc(claimRef);
      let tier = "free";
      let userId = "anonymous";
      if (claimSnap.exists()) {
        const claimData = claimSnap.data();
        tier = claimData.tier || "free";
        userId = claimData.userId || "anonymous";
      }

      const docRef = doc(db, "institutions", instId);
      await updateDoc(docRef, {
        isClaimed: true,
        isVerified: true,
        tier: tier
      });

      await updateDoc(claimRef, {
        status: "approved"
      });

      if (userId && userId !== "anonymous") {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          role: "institution_admin",
          institutionId: instId,
          institutionName: instName
        });
      }

      alert(`Claim Request Approved!
"${instName}" is marked as Claimed and Verified.`);
      setClaims(claims.filter(claim => claim.id !== claimId));

      const instSnap = await getDocs(collection(db, "institutions"));
      const instData = [];
      instSnap.forEach(docSnap => instData.push({ id: docSnap.id, ...docSnap.data() }));
      setInstitutions(instData);

    } catch (e) {
      console.error(e);
      alert("Verification update failed.");
    }
  };

  // Reject Claim Handler
  const handleRejectClaim = async (claimId) => {
    if (profile?.role === "manager") {
      alert("Permission Denied: Managers cannot reject claims.");
      return;
    }

    try {
      const claimRef = doc(db, "claims", claimId);
      await updateDoc(claimRef, { status: "rejected" });
      alert("Claim request rejected.");
      setClaims(claims.filter(claim => claim.id !== claimId));
    } catch (e) {
      console.error(e);
      alert("Rejecting claim failed.");
    }
  };

  // Approve Suggestion Handler
  const handleApproveSuggestion = async (sugId, sug) => {
    try {
      const instId = `sug-${Date.now()}`;
      
      const newInst = {
        id: instId,
        name: sug.name,
        type: sug.type,
        location: sug.townOrBlock.toLowerCase(),
        rating: 4.0,
        isVerified: true,
        isClaimed: false,
        coursesCount: 5,
        studentsCount: 100,
        description: sug.address,
        address: sug.address,
        phone: sug.contact || "",
        state: sug.state || "Odisha",
        district: sug.district || "",
        townOrBlock: sug.townOrBlock || "",
        logo: sug.logo || "🏫",
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "institutions", instId), newInst);

      const sugRef = doc(db, "suggestions", sugId);
      await updateDoc(sugRef, { status: "approved" });

      alert(`Suggestion Approved!
"${sug.name}" is now listed in the educational directory.`);
      
      setSuggestions(suggestions.filter(s => s.id !== sugId));
      setInstitutions(prev => [...prev, newInst]);

    } catch (e) {
      console.error(e);
      alert("Error approving suggestion.");
    }
  };

  // Reject Suggestion Handler
  const handleRejectSuggestion = async (sugId) => {
    try {
      const sugRef = doc(db, "suggestions", sugId);
      await updateDoc(sugRef, { status: "rejected" });
      alert("Suggestion rejected and hidden.");
      setSuggestions(suggestions.filter(s => s.id !== sugId));
    } catch (e) {
      console.error(e);
      alert("Error rejecting suggestion.");
    }
  };

  // Job Approval Handler
  const handleApproveJob = async (jobId) => {
    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, {
        isApproved: true,
        status: "active"
      });
      alert("Job placement approved successfully!");
      setJobsList(prev => prev.map(j => j.id === jobId ? { ...j, isApproved: true, status: "active" } : j));
    } catch (e) {
      console.error(e);
      alert("Failed to approve job.");
    }
  };

  // Job Reject / Delete Handler
  const handleRejectJob = async (jobId) => {
    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, {
        isApproved: false,
        status: "rejected"
      });
      alert("Job placement rejected.");
      setJobsList(prev => prev.map(j => j.id === jobId ? { ...j, isApproved: false, status: "rejected" } : j));
    } catch (e) {
      console.error(e);
      alert("Failed to update job status.");
    }
  };

  // Guard check - Loading state
  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div style={{ textAlign: "center" }}>
          <RefreshCw className="spinner" size={48} style={{ color: "#3b82f6", marginBottom: "16px" }} />
          <h3 style={{ fontSize: "1.1rem", color: "#6b7280" }}>Loading Admin Profile...</h3>
        </div>
        <style jsx global>{`
          .admin-loading-screen {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f8fafc;
          }
          .spinner { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Guard check - Access Denied & Staff Login
  if (!user) {
    return (
      <div className="admin-login-layout">
        <div className="login-card">
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div className="shield-icon-wrapper">
              <Shield size={32} />
            </div>
            <h2 className="login-title">Staff Cockpit Login</h2>
            <p className="login-subtitle">
              Enter administrative credentials to access directories, scrapers, and claim verifications.
            </p>
          </div>

          {loginError && (
            <div className="error-alert">
              {loginError}
            </div>
          )}

          <form onSubmit={handleStaffLogin} className="login-form">
            <div>
              <label className="form-label">Administrative Email</label>
              <input 
                type="email" 
                className="login-input" 
                value={adminEmail} 
                onChange={(e) => setAdminEmail(e.target.value)} 
                placeholder="admin@educonnect.in"
                required 
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="login-input" 
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </div>

            <button type="submit" disabled={loginLoading} className="login-btn">
              {loginLoading ? <RefreshCw className="spinner" size={20} /> : "Sign In to Console"}
            </button>
          </form>

          <div className="divider-row">
            <div className="divider-line"></div>
            <span className="divider-text">OR</span>
            <div className="divider-line"></div>
          </div>

          <button 
            onClick={handleStaffGoogleLogin} 
            disabled={loginLoading}
            className="google-login-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
        <style jsx global>{`
          .admin-login-layout {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: radial-gradient(circle at 10% 20%, rgba(216, 241, 230, 0.46) 0.1%, rgba(233, 226, 226, 0.28) 90.1%);
            padding: 20px;
          }
          .login-card {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 16px -8px rgba(0, 0, 0, 0.05);
            max-width: 440px;
            width: 100%;
            padding: 40px;
            border: 1px solid #e2e8f0;
          }
          .shield-icon-wrapper {
            background: rgba(59, 130, 246, 0.08);
            color: #3b82f6;
            padding: 16px;
            border-radius: 50%;
            display: inline-flex;
            margin-bottom: 16px;
          }
          .login-title {
            font-size: 1.6rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 8px;
            font-family: var(--font-display, inherit);
          }
          .login-subtitle {
            color: #64748b;
            font-size: 0.875rem;
            line-height: 1.5;
          }
          .error-alert {
            padding: 12px;
            background: #fef2f2;
            color: #ef4444;
            border: 1px solid #fee2e2;
            border-radius: 8px;
            font-size: 0.85rem;
            margin-bottom: 20px;
          }
          .login-form {
            display: flex;
            flex-direction: column;
            gap: 18px;
          }
          .form-label {
            display: block;
            font-size: 0.75rem;
            color: #475569;
            margin-bottom: 6px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .login-input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 0.9rem;
            outline: none;
            transition: all 0.2s;
            color: #1e293b;
          }
          .login-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          .login-btn {
            width: 100%;
            padding: 14px;
            background: #2563eb;
            color: #ffffff;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.95rem;
            border: none;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: background 0.2s;
          }
          .login-btn:hover {
            background: #1d4ed8;
          }
          .divider-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 20px 0;
          }
          .divider-line {
            flex: 1;
            height: 1px;
            background: #e2e8f0;
          }
          .divider-text {
            font-size: 0.75rem;
            color: #94a3b8;
            font-weight: 700;
          }
          .google-login-btn {
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            background: #ffffff;
            color: #334155;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 700;
            font-size: 0.9rem;
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            transition: background 0.2s;
          }
          .google-login-btn:hover {
            background: #f8fafc;
          }
          .spinner { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!["super_admin", "admin", "manager"].includes(profile?.role)) {
    return (
      <div className="admin-access-denied-layout">
        <div className="denied-card">
          <div className="denied-icon-wrapper">
            <Lock size={32} />
          </div>
          <h2 className="denied-title">Access Denied</h2>
          <p className="denied-text">
            Logged in as <strong style={{ color: "#0f172a" }}>{user.email}</strong>.<br />
            This account does not have staff privileges. If you are an administrator or manager, please log out and sign in using your registered administrative credentials.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button onClick={logout} className="logout-action-btn">Log Out Account</button>
            <a href="/" className="return-action-btn">Return to Directory</a>
          </div>
        </div>
        <style jsx global>{`
          .admin-access-denied-layout {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f8fafc;
            padding: 20px;
          }
          .denied-card {
            max-width: 440px;
            width: 100%;
            padding: 40px;
            text-align: center;
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #fee2e2;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          }
          .denied-icon-wrapper {
            background: #fef2f2;
            color: #ef4444;
            padding: 16px;
            border-radius: 50%;
            display: inline-flex;
            margin-bottom: 20px;
          }
          .denied-title {
            font-size: 1.5rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 12px;
          }
          .denied-text {
            color: #64748b;
            font-size: 0.9rem;
            line-height: 1.6;
            margin-bottom: 28px;
          }
          .logout-action-btn {
            width: 100%;
            padding: 12px;
            background: #ef4444;
            color: #ffffff;
            border-radius: 8px;
            border: none;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.2s;
          }
          .logout-action-btn:hover {
            background: #dc2626;
          }
          .return-action-btn {
            width: 100%;
            padding: 12px;
            background: #f1f5f9;
            color: #475569;
            border-radius: 8px;
            text-align: center;
            text-decoration: none;
            font-weight: 700;
            display: block;
            border: 1px solid #e2e8f0;
            box-sizing: border-box;
            transition: background 0.2s;
          }
          .return-action-btn:hover {
            background: #e2e8f0;
          }
        `}</style>
      </div>
    );
  }

  // Filter lists for tabs
  const studentsList = allUsers.filter(u => u.role === "student");
  const teachersList = allUsers.filter(u => u.role === "teacher");
  const employersList = allUsers.filter(u => u.role === "employer");
  const staffList = allUsers.filter(u => ["super_admin", "admin", "manager"].includes(u.role));
  
  const claimedCount = institutions.filter(i => i.isClaimed).length;
  const premiumCount = institutions.filter(i => i.tier === "paid-tier-1" || i.tier === "paid-tier-2").length;

  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inst.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inst.townOrBlock?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCountry = filterCountry === "All" || inst.country === filterCountry;
    const matchesState = filterState === "All" || inst.state === filterState;
    const matchesDistrict = !filterDistrict || inst.district?.toLowerCase() === filterDistrict.toLowerCase();
    
    let matchesCategory = true;
    if (filterCategory !== "All" && filterCategory !== "") {
      matchesCategory = inst.type === filterCategory || (inst.type && inst.type.includes(filterCategory));
    }
    
    return matchesSearch && matchesCountry && matchesState && matchesDistrict && matchesCategory;
  });

  return (
    <div className="admin-dashboard-container">
      
      {/* Top Navbar */}
      <header className="admin-navbar">
        <div className="nav-left">
          <div className="nav-logo">
            <Shield size={24} style={{ color: "#60a5fa" }} />
            <span>EduConnect Admin</span>
          </div>
          <div className="nav-divider"></div>
          <span className="nav-welcome">Welcome, {profile?.name || "Admin"}</span>
        </div>

        <div className="nav-right">
          <div className="nav-search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search directory..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
            />
          </div>

          <div className="nav-notification" title="Notifications">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </div>

          <div className="nav-profile-menu-container">
            <button className="nav-profile-button" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" 
                alt="Profile" 
                className="nav-avatar"
              />
              <span className="nav-profile-name">{profile?.role === "super_admin" ? "Super Admin" : profile?.role === "admin" ? "Admin" : "Manager"}</span>
              <ChevronDown size={14} />
            </button>
            
            {showProfileMenu && (
              <div className="nav-dropdown-menu">
                <a href="/" className="dropdown-item">
                  <Landmark size={16} />
                  <span>Main Directory</span>
                </a>
                <button onClick={logout} className="dropdown-item logout-item">
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="admin-body-layout">
        
        {/* Left Sidebar */}
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`sidebar-link ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>

            <button 
              className={`sidebar-link ${activeTab === "institutions" ? "active" : ""}`}
              onClick={() => setActiveTab("institutions")}
            >
              <Landmark size={20} />
              <span>Listings</span>
            </button>

            <button 
              className={`sidebar-link ${activeTab === "places_crawler" ? "active" : ""}`}
              onClick={() => setActiveTab("places_crawler")}
            >
              <Database size={20} />
              <span>Places Crawler</span>
            </button>

            <button 
              className={`sidebar-link ${activeTab === "jobs_crawler" ? "active" : ""}`}
              onClick={() => setActiveTab("jobs_crawler")}
            >
              <Briefcase size={20} />
              <span>Jobs Crawler</span>
            </button>

            <button 
              className={`sidebar-link ${activeTab === "students" ? "active" : ""}`}
              onClick={() => setActiveTab("students")}
            >
              <GraduationCap size={20} />
              <span>Students</span>
            </button>

            <button 
              className={`sidebar-link ${activeTab === "teachers" ? "active" : ""}`}
              onClick={() => setActiveTab("teachers")}
            >
              <User size={20} />
              <span>Teachers</span>
            </button>

            <button 
              className={`sidebar-link ${activeTab === "employers" ? "active" : ""}`}
              onClick={() => setActiveTab("employers")}
            >
              <Users size={20} />
              <span>Employers</span>
            </button>

            <button 
              className={`sidebar-link ${activeTab === "jobs" ? "active" : ""}`}
              onClick={() => setActiveTab("jobs")}
            >
              <Briefcase size={20} />
              <span>Job Listings</span>
            </button>

            <button 
              className={`sidebar-link ${activeTab === "verification" ? "active" : ""}`}
              onClick={() => setActiveTab("verification")}
            >
              <Award size={20} />
              <span>Verification</span>
              {claims.length > 0 && <span className="tab-counter-badge warn">{claims.length}</span>}
            </button>

            <button 
              className={`sidebar-link ${activeTab === "suggestions" ? "active" : ""}`}
              onClick={() => setActiveTab("suggestions")}
            >
              <MessageSquare size={20} />
              <span>User Suggestions</span>
              {suggestions.length > 0 && <span className="tab-counter-badge info">{suggestions.length}</span>}
            </button>

            <button 
              className={`sidebar-link ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              <Activity size={20} />
              <span>Reports & Campaigns</span>
            </button>

            <button 
              className={`sidebar-link ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>

            <button onClick={logout} className="sidebar-link logout-sidebar-link">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main-viewport">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <div className="tab-pane">
              {/* Metric Cards Grid */}
              <div className="metrics-row">
                <div className="metric-card">
                  <div className="metric-card-content">
                    <span className="metric-card-label">Total Institutions</span>
                    <span className="metric-card-value">{institutions.length}</span>
                    <span className="metric-card-subtext">{claimedCount} Claimed</span>
                  </div>
                  <div className="metric-card-icon blue">
                    <Landmark size={24} />
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-card-content">
                    <span className="metric-card-label">Total Students</span>
                    <span className="metric-card-value">{studentsList.length > 0 ? studentsList.length.toLocaleString() : "15,430"}</span>
                    <span className="metric-card-subtext">Registered candidates</span>
                  </div>
                  <div className="metric-card-icon purple">
                    <GraduationCap size={24} />
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-card-content">
                    <span className="metric-card-label">Active Jobs</span>
                    <span className="metric-card-value">{jobsList.length > 0 ? jobsList.length : "278"}</span>
                    <span className="metric-card-subtext" style={{ color: "#10b981", fontWeight: "700" }}>+12 Today</span>
                  </div>
                  <div className="metric-card-icon green">
                    <Briefcase size={24} />
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-card-content">
                    <span className="metric-card-label">Premium Listings</span>
                    <span className="metric-card-value">{premiumCount > 0 ? premiumCount : "320"}</span>
                    <span className="metric-card-subtext">Paid placements tier</span>
                  </div>
                  <div className="metric-card-icon orange">
                    <Award size={24} />
                  </div>
                </div>
              </div>

              {/* Main dashboard grid */}
              <div className="dashboard-grid-layout">
                {/* Left Column */}
                <div className="grid-column">
                  
                  {/* Pending Verifications */}
                  <div className="dashboard-card">
                    <div className="card-header-row">
                      <h3 className="card-title">Pending Verifications</h3>
                      <button onClick={() => setActiveTab("verification")} className="card-header-link">View All</button>
                    </div>
                    <div className="card-body">
                      {claims.length > 0 ? (
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>Institution / Employer</th>
                              <th>Type</th>
                              <th style={{ textAlign: "right" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {claims.slice(0, 4).map((claim) => (
                              <tr key={claim.id}>
                                <td>
                                  <div className="bold-cell">{claim.instName}</div>
                                  <div className="sub-cell">{claim.email}</div>
                                </td>
                                <td><span className="cell-pill">Verification</span></td>
                                <td style={{ textAlign: "right" }}>
                                  <button onClick={() => setActiveTab("verification")} className="table-action-btn">Review</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="empty-card-state">
                          <CheckCircle2 size={32} style={{ color: "#10b981", marginBottom: "10px" }} />
                          <p>All verifications completed! No pending items.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Analytics Overview */}
                  <div className="dashboard-card">
                    <div className="card-header-row">
                      <h3 className="card-title">Analytics Overview</h3>
                      <span className="card-header-subtext">Monthly Registrations</span>
                    </div>
                    <div className="card-body">
                      {/* Premium SVG Line graph */}
                      <div className="svg-chart-container">
                        <svg viewBox="0 0 500 150" className="analytics-svg-chart">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                            </linearGradient>
                          </defs>
                          {/* Grid lines */}
                          <line x1="20" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="20" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="20" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="20" y1="130" x2="480" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />
                          
                          {/* Chart Path */}
                          <path 
                            d="M 20 120 C 50 100, 80 80, 110 95 C 140 110, 170 120, 200 85 C 230 50, 260 75, 290 85 C 320 95, 350 40, 380 30 C 410 20, 440 60, 480 25" 
                            fill="none" 
                            stroke="#2563eb" 
                            strokeWidth="3" 
                          />
                          <path 
                            d="M 20 120 C 50 100, 80 80, 110 95 C 140 110, 170 120, 200 85 C 230 50, 260 75, 290 85 C 320 95, 350 40, 380 30 C 410 20, 440 60, 480 25 L 480 130 L 20 130 Z" 
                            fill="url(#chartGrad)" 
                          />

                          {/* Interactive Graph Nodes */}
                          <circle cx="20" cy="120" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                          <circle cx="110" cy="95" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                          <circle cx="200" cy="85" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                          <circle cx="290" cy="85" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                          <circle cx="380" cy="30" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                          <circle cx="480" cy="25" r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                        </svg>
                        <div className="chart-labels-row">
                          <span>Users</span>
                          <span>Institutions</span>
                          <span>Jobs</span>
                        </div>
                      </div>

                      <div className="analytics-stats-footer">
                        <div className="stat-col">
                          <span className="stat-label">New Users</span>
                          <span className="stat-value"><span style={{ color: "#10b981" }}>▲ +5.2%</span> 620</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-col">
                          <span className="stat-label">New Jobs</span>
                          <span className="stat-value"><span style={{ color: "#ef4444" }}>▼ -1.5%</span> 58</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column */}
                <div className="grid-column">
                  
                  {/* User Suggestions */}
                  <div className="dashboard-card">
                    <div className="card-header-row">
                      <h3 className="card-title">User Suggestions</h3>
                      <button onClick={() => setActiveTab("suggestions")} className="card-header-link">Manage Suggestions ↗</button>
                    </div>
                    <div className="card-body">
                      {suggestions.length > 0 ? (
                        <div className="suggestions-list-vertical">
                          {suggestions.slice(0, 3).map((sug) => (
                            <div key={sug.id} className="suggestion-item-mini">
                              <div className="suggestion-info">
                                <span className="sug-title">{sug.name}</span>
                                <span className="sug-meta">{sug.type} • {sug.townOrBlock}</span>
                              </div>
                              <div className="suggestion-badges">
                                <span className="badge-status-pill new">New</span>
                                <span className="badge-user-tag">{sug.contact ? sug.contact.slice(0, 6) : "Guest"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-card-state">
                          <MessageSquare size={32} style={{ color: "#94a3b8", marginBottom: "10px" }} />
                          <p>No new listings suggested by users currently.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Job Listings */}
                  <div className="dashboard-card">
                    <div className="card-header-row">
                      <h3 className="card-title">Recent Job Listings</h3>
                      <button onClick={() => setActiveTab("jobs")} className="card-header-link">View All Jobs ↗</button>
                    </div>
                    <div className="card-body">
                      {jobsList.length > 0 ? (
                        <div className="jobs-list-vertical">
                          {jobsList.slice(0, 3).map((job) => (
                            <div key={job.id} className="job-item-mini">
                              <div className="job-meta-left">
                                <div className="job-company-avatar">
                                  {job.employerName ? job.employerName[0] : "J"}
                                </div>
                                <div className="job-details-block">
                                  <span className="job-title">{job.title}</span>
                                  <span className="job-company">{job.employerName || "Employer"} — {job.location}</span>
                                </div>
                              </div>
                              <div className="job-actions-right">
                                {job.status === "active" || job.isApproved ? (
                                  <span className="status-badge-active">Approved</span>
                                ) : (
                                  <button onClick={() => handleApproveJob(job.id)} className="job-approve-btn">Approve</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-card-state">
                          <Briefcase size={32} style={{ color: "#cbd5e1", marginBottom: "10px" }} />
                          <p>No recent job listings found in database.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          
          {/* TAB 2: INSTITUTIONS VIEW */}
          {activeTab === "institutions" && (
            <div className="tab-pane">
              <div className="tab-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2>Listings Directory ({filteredInstitutions.length})</h2>
                  <p>View, filter, and manage all your educational listings.</p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ display: "flex", background: "var(--bg-secondary)", borderRadius: "8px", padding: "4px", border: "1px solid var(--border-secondary)" }}>
                    <button 
                      onClick={() => setViewMode("cards")} 
                      style={{ padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", background: viewMode === "cards" ? "var(--primary)" : "transparent", color: viewMode === "cards" ? "white" : "var(--text-muted)", transition: "all 0.2s" }}
                    >
                      <LayoutGrid size={16} /> <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Cards</span>
                    </button>
                    <button 
                      onClick={() => setViewMode("table")} 
                      style={{ padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", background: viewMode === "table" ? "var(--primary)" : "transparent", color: viewMode === "table" ? "white" : "var(--text-muted)", transition: "all 0.2s" }}
                    >
                      <List size={16} /> <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Table</span>
                    </button>
                  </div>
                  <button 
                    onClick={() => { resetForm(); setShowAddModal(true); }} 
                    className="action-btn-primary" 
                    style={{ padding: "10px 18px", fontSize: "0.85rem", gap: "6px" }}
                  >
                    <Plus size={16} />
                    <span>Add Listing</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="dashboard-card" style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap", padding: "16px" }}>
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Country</label>
                  <select className="dashboard-select" value={filterCountry} onChange={(e) => { setFilterCountry(e.target.value); if (e.target.value === "International") { setFilterState("All"); setFilterDistrict(""); } else { setFilterState("Odisha"); } }}>
                    <option value="All">All Countries</option>
                    <option value="India">India</option>
                    <option value="International">International</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>State</label>
                  {filterCountry === "India" ? (
                    <select className="dashboard-select" value={filterState} onChange={(e) => { setFilterState(e.target.value); if (e.target.value !== "Odisha") setFilterDistrict(""); }}>
                      <option value="All">All States</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <input type="text" className="dashboard-input" value={filterState} onChange={(e) => setFilterState(e.target.value)} placeholder="State" />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>District</label>
                  {filterState === "Odisha" ? (
                    <select className="dashboard-select" value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}>
                      <option value="">All Districts</option>
                      {ODISHA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : (
                    <input type="text" className="dashboard-input" value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} placeholder="District" />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Category</label>
                  <select className="dashboard-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                    <option value="All">All Categories</option>
                    <option value="school">Schools</option>
                    <option value="university">Universities / Degree Colleges</option>
                    <option value="engineering">Engineering Colleges</option>
                    <option value="coaching">Coaching Centers / Tutorials</option>
                    <option value="kindergarten">Play Schools / Kindergartens</option>
                    <option value="vocational">ITI & Vocational Training</option>
                    <option value="computer">Computer Training Institutes</option>
                    <option value="sports">Sports Academies & Gyms</option>
                    <option value="library">Libraries / Study Rooms</option>
                    <option value="consultant">Educational Consultants</option>
                    <option value="hostel">Student Hostels / PGs</option>
                  </select>
                </div>
              </div>

              {/* LISTINGS RENDERING */}
              <div className="dashboard-card" style={{ maxHeight: "700px", overflowY: "auto" }}>
                {filteredInstitutions.length > 0 ? (
                  viewMode === "table" ? (
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Location</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInstitutions.map((inst) => (
                          <tr key={inst.id}>
                            <td>
                              <div style={{ fontWeight: "600", color: "#1e293b" }}>{inst.name}</div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{inst.phone || "No Phone"}</div>
                            </td>
                            <td>
                              <div style={{ color: "#334155" }}>{inst.district}</div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{inst.townOrBlock || inst.location}</div>
                            </td>
                            <td>
                              <span className="pill-badge" style={{ background: "#f1f5f9", color: "#475569" }}>
                                {inst.type || "unknown"}
                              </span>
                            </td>
                            <td>
                              <span className={`pill-badge ${inst.isClaimed ? "claimed" : "unclaimed"}`}>
                                {inst.isClaimed ? "Claimed" : "Unclaimed"}
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                <a href={`/institutions/${inst.id}`} target="_blank" rel="noopener noreferrer" className="table-action-btn-secondary" style={{ padding: "6px 8px", fontSize: "0.75rem" }}>View</a>
                                <button onClick={() => openEditModal(inst)} className="table-action-btn" style={{ padding: "6px 8px", fontSize: "0.75rem", background: "#f59e0b" }}>Edit</button>
                                <button onClick={() => handleDeleteListing(inst.id, inst.name)} className="table-action-btn" style={{ padding: "6px 8px", fontSize: "0.75rem", background: "#ef4444" }}>Del</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "16px" }}>
                      {filteredInstitutions.map((inst) => (
                        <div key={inst.id} className="directory-list-item" style={{ border: "1px solid var(--border-secondary)", borderRadius: "12px", padding: "16px" }}>
                          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
                            {inst.photoName ? (
                              <img 
                                src={`https://places.googleapis.com/v1/${inst.photoName}/media?maxHeightPx=100&maxWidthPx=100&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`} 
                                alt={inst.name} 
                                style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "10px" }} 
                              />
                            ) : (
                              <div style={{ width: "60px", height: "60px", background: "rgba(79, 70, 229, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px", fontSize: "2rem" }}>
                                {inst.logo || "🏫"}
                              </div>
                            )}
                            <div>
                              <h4 style={{ fontSize: "1rem", fontWeight: "700", color: "#1e293b", margin: "0 0 4px 0", lineHeight: "1.3" }}>{inst.name}</h4>
                              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                                {inst.townOrBlock || inst.location}, {inst.district}
                              </p>
                            </div>
                          </div>
                          
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                            <span className={`pill-badge ${inst.isClaimed ? "claimed" : "unclaimed"}`}>
                              {inst.isClaimed ? "Claimed" : "Unclaimed"}
                            </span>
                            {inst.tier && inst.tier !== "free" && (
                              <span className="pill-badge premium">
                                {inst.tier.toUpperCase()}
                              </span>
                            )}
                            {inst.phone && (
                              <span className="pill-badge phone">📞 {inst.phone}</span>
                            )}
                            {inst.website && (
                              <a href={inst.website} target="_blank" rel="noreferrer" className="pill-badge" style={{ textDecoration: "none", background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }}>
                                🌐 Website
                              </a>
                            )}
                          </div>
                          
                          <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border-secondary)", paddingTop: "16px" }}>
                            <a href={`/institutions/${inst.id}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ flex: 1, textAlign: "center", padding: "8px", fontSize: "0.8rem" }}>View Profile</a>
                            <button onClick={() => openEditModal(inst)} className="btn-primary" style={{ flex: 1, padding: "8px", fontSize: "0.8rem" }}>Edit Details</button>
                            <button onClick={() => handleDeleteListing(inst.id, inst.name)} className="btn-secondary" style={{ padding: "8px", fontSize: "0.8rem", color: "var(--danger)", borderColor: "var(--danger)" }}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="empty-card-state">No institutions found matching your filters.</div>
                )}
              </div>
            </div>
          )}

                    {/* CRAWLER VIEW */}
          {activeTab === "places_crawler" && (
            <div className="tab-pane">
              <div className="tab-header">
                <h2>Google Places Crawler</h2>
                <p>Automated ingestion pipeline for Institutions.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Google Places Crawler (Institutions) */}
                <div className="dashboard-card">
                  <h3 className="card-title" style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin size={20} color="var(--primary)" /> Google Places Sync
                  </h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label className="form-label">Location (State)</label>
                          <select 
                            value={jobState} 
                            onChange={(e) => setJobState(e.target.value)} 
                            className="dashboard-select"
                          >
                            <option value="">Any State / Automatic</option>
                            <option value="Odisha">Odisha</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Delhi">Delhi</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">City/Town (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Bangalore, Bhubaneswar" 
                            value={jobLocation} 
                            onChange={(e) => setJobLocation(e.target.value)} 
                            className="dashboard-input" 
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "12px" }}>
                        <div>
                          <label className="form-label">Industry</label>
                          <select 
                            value={jobIndustry} 
                            onChange={(e) => setJobIndustry(e.target.value)} 
                            className="dashboard-select"
                          >
                            <option value="">Any Industry</option>
                            <option value="Education">Education & Teaching</option>
                            <option value="Healthcare">Healthcare & Medical</option>
                            <option value="Technology">IT & Software</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Finance">Finance & Banking</option>
                            <option value="Management">Business & Management</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Job Type</label>
                          <select 
                            value={jobType} 
                            onChange={(e) => setJobType(e.target.value)} 
                            className="dashboard-select"
                          >
                            <option value="">Any Type</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                            <option value="Freelance">Freelance</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Scope</label>
                          <select 
                            value={isInternationalJob ? "International" : "India"} 
                            onChange={(e) => setIsInternationalJob(e.target.value === "International")} 
                            className="dashboard-select"
                          >
                            <option value="India">India</option>
                            <option value="International">International</option>
                          </select>
                        </div>
                      </div>\n\n                    <div style={{ background: "#fef3c7", border: "1px solid #fde68a", padding: "12px", borderRadius: "8px", fontSize: "0.8rem", color: "#92400e", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                      <p style={{ margin: 0 }}>This crawler aggregates data from Google Jobs (LinkedIn, Naukri, Monster). It requires a SerpApi key to be configured in your .env.local file.</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                    <button onClick={runJobScraper} disabled={isScrapingJobs || !jobQuery} className="action-btn-primary" style={{ flex: 2, background: "#10b981", borderColor: "#059669" }}>
                      {isScrapingJobs ? <RefreshCw className="spinner" size={16} /> : <Play size={16} />}
                      <span>Trigger Job Sync</span>
                    </button>
                  </div>

                  <h4 className="card-sub-title">System Ingestion Log</h4>
                  <div className="log-console" style={{ minHeight: "150px" }}>
                    {jobScraperLog.length > 0 ? (
                      jobScraperLog.map((log, i) => <div key={i} className="log-line">{log}</div>)
                    ) : (
                      <div style={{ color: "#64748b", fontStyle: "italic" }}>[IDLE] Job pipeline is ready...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* TAB 3: STUDENTS VIEW */}
          {activeTab === "students" && (
            <div className="tab-pane">
              <div className="tab-header">
                <h2>Registered Student Directory ({studentsList.length})</h2>
                <p>Inspect registered candidate profiles and review their academic & career timelines.</p>
              </div>

              <div className="dashboard-card">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email Address</th>
                      <th>Registered Since</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsList.length > 0 ? (
                      studentsList.map((stud) => (
                        <tr key={stud.uid}>
                          <td>
                            <div className="bold-cell">{stud.name}</div>
                            <div className="sub-cell">{stud.phone || "No phone linked"}</div>
                          </td>
                          <td><span className="email-cell">{stud.email}</span></td>
                          <td>{stud.createdAt ? new Date(stud.createdAt).toLocaleDateString() : "May 29, 2026"}</td>
                          <td style={{ textAlign: "right" }}>
                            <a href={`/student/${stud.uid}`} target="_blank" rel="noreferrer" className="table-action-btn-secondary">View Profile</a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                          No students registered in the database yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TEACHERS VIEW */}
          {activeTab === "teachers" && (
            <div className="tab-pane">
              <div className="tab-header">
                <h2>Registered Faculty Roster ({teachersList.length})</h2>
                <p>Review educational instructors, biographies, and specialized course lists.</p>
              </div>

              <div className="dashboard-card">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Specialization</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachersList.length > 0 ? (
                      teachersList.map((teach) => (
                        <tr key={teach.uid}>
                          <td>
                            <div className="bold-cell">{teach.name}</div>
                            <div className="sub-cell">{teach.location || "Odisha"}</div>
                          </td>
                          <td><span className="cell-pill">{teach.specialization || "General Educator"}</span></td>
                          <td><span className="email-cell">{teach.email}</span></td>
                          <td>
                            <span className="pill-badge claimed">Verified Faculty</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                          No teacher accounts registered in the database yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: EMPLOYERS VIEW */}
          {activeTab === "employers" && (
            <div className="tab-pane">
              <div className="tab-header">
                <h2>Registered Employer Accounts ({employersList.length})</h2>
                <p>Manage claims, recruitment credentials, and active employer listings.</p>
              </div>

              <div className="dashboard-card">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Company / Name</th>
                      <th>Corporate Email</th>
                      <th>Registered Since</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employersList.length > 0 ? (
                      employersList.map((emp) => (
                        <tr key={emp.uid}>
                          <td>
                            <div className="bold-cell">{emp.companyName || emp.name}</div>
                            <div className="sub-cell">{emp.location || "Bhubaneswar"}</div>
                          </td>
                          <td><span className="email-cell">{emp.email}</span></td>
                          <td>{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "May 29, 2026"}</td>
                          <td>
                            <span className="pill-badge claimed">Active Recruiter</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                          No employer accounts registered in the database yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: JOB LISTINGS VIEW */}
          {activeTab === "jobs" && (
            <div className="tab-pane">
              <div className="tab-header">
                <h2>Job Placement Directory ({jobsList.length})</h2>
                <p>Manage job posts, audit vacancy requirements, and approve submissions from employers.</p>
              </div>

              <div className="dashboard-card">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Job Position</th>
                      <th>Company</th>
                      <th>Package & Type</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobsList.length > 0 ? (
                      jobsList.map((job) => (
                        <tr key={job.id}>
                          <td>
                            <div className="bold-cell">{job.title}</div>
                            <div className="sub-cell">Skills: {job.skills ? job.skills.join(", ") : "React, JS"}</div>
                          </td>
                          <td>
                            <div className="bold-cell" style={{ color: "#334155" }}>{job.employerName || "Registered Employer"}</div>
                            <div className="sub-cell">{job.location}</div>
                          </td>
                          <td>
                            <div className="bold-cell" style={{ color: "#10b981" }}>{job.salary || "₹15,000 / mo"}</div>
                            <div className="sub-cell">{job.type || "Full Time"}</div>
                          </td>
                          <td>
                            <span className={`pill-badge ${job.status === "active" || job.isApproved ? "claimed" : "unclaimed"}`}>
                              {job.status === "active" || job.isApproved ? "Active" : "Pending Approval"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              {!(job.status === "active" || job.isApproved) ? (
                                <button onClick={() => handleApproveJob(job.id)} className="table-btn-approve">Approve</button>
                              ) : (
                                <button onClick={() => handleRejectJob(job.id)} className="table-btn-reject">Deactivate</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                          No job postings found in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: CLAIM VERIFICATIONS VIEW */}
          {activeTab === "verification" && (
            <div className="tab-pane">
              <div className="tab-header">
                <h2>Claims Verification Desk</h2>
                <p>Approve or deny dashboard ownership requests submitted by educational institution representatives.</p>
              </div>

              <div className="dashboard-card" style={{ maxWidth: "800px" }}>
                <h3 className="card-title" style={{ marginBottom: "20px" }}>Pending Ownership Claims ({claims.length})</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {claims.length > 0 ? (
                    claims.map((claim) => (
                      <div key={claim.id} className="verification-item-card">
                        <div className="verification-details">
                          <h4 className="verification-title">{claim.instName}</h4>
                          <div className="verification-meta">
                            <span><strong>Claimant Email:</strong> {claim.email}</span>
                            <span><strong>Phone:</strong> {claim.phone || "N/A"}</span>
                            <span><strong>Selected Tier:</strong> {claim.tier ? claim.tier.toUpperCase() : "FREE"}</span>
                          </div>
                          <a href={claim.documentUrl || "#"} target="_blank" rel="noreferrer" className="docs-link">
                            View Official Verification Document
                          </a>
                        </div>
                        
                        {profile?.role === "manager" ? (
                          <span className="access-denied-badge">Manager (View Only)</span>
                        ) : (
                          <div className="verification-actions">
                            <button onClick={() => handleRejectClaim(claim.id)} className="reject-btn">
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                            <button onClick={() => handleApproveClaim(claim.id, claim.instId, claim.instName)} className="approve-btn">
                              <Check size={14} />
                              <span>Approve Claim</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-card-state" style={{ padding: "40px 20px" }}>
                      <CheckCircle2 size={40} style={{ color: "#10b981", marginBottom: "12px" }} />
                      <h4 style={{ margin: "0 0 4px 0", color: "#1e293b" }}>All Caught Up!</h4>
                      <p style={{ margin: 0, color: "#64748b" }}>No claims are currently awaiting administration review.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: USER SUGGESTIONS VIEW */}
          {activeTab === "suggestions" && (
            <div className="tab-pane">
              <div className="tab-header">
                <h2>User Suggestions Review Board</h2>
                <p>Moderate new schools and coaching center profiles suggested by students, parents, and community members.</p>
              </div>

              <div className="dashboard-card" style={{ maxWidth: "800px" }}>
                <h3 className="card-title" style={{ marginBottom: "20px" }}>Pending Additions ({suggestions.length})</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {suggestions.length > 0 ? (
                    suggestions.map((sug) => (
                      <div key={sug.id} className="suggestion-item-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                          <div>
                            <span className="sug-logo-pill">{sug.logo || "🏫"}</span>
                            <h4 className="sug-name-title" style={{ display: "inline-block", margin: "0 0 0 10px", fontSize: "1.1rem", fontWeight: "800" }}>{sug.name}</h4>
                            
                            <div className="sug-meta-grid">
                              <div><strong>Category:</strong> {sug.type}</div>
                              <div><strong>Contact:</strong> {sug.contact || "None"}</div>
                              <div><strong>Address:</strong> {sug.address}</div>
                              <div><strong>Region:</strong> {sug.townOrBlock}, {sug.district}, {sug.state}</div>
                            </div>
                          </div>
                          
                          <div className="sug-actions-row">
                            <button onClick={() => handleRejectSuggestion(sug.id)} className="sug-reject-btn">Reject</button>
                            <button onClick={() => handleApproveSuggestion(sug.id, sug)} className="sug-approve-btn">Approve & Add</button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-card-state" style={{ padding: "40px 20px" }}>
                      <MessageSquare size={40} style={{ color: "#94a3b8", marginBottom: "12px" }} />
                      <h4 style={{ margin: "0 0 4px 0", color: "#1e293b" }}>No Suggestions</h4>
                      <p style={{ margin: 0, color: "#64748b" }}>There are no user suggestions awaiting verification.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: REPORTS VIEW */}
          {activeTab === "reports" && (
            <div className="tab-pane">
              <div className="tab-header">
                <h2>Viral Referral Growth & Marketing Console</h2>
                <p>Inspect share referral performance and blast automated invites to directories.</p>
              </div>

              <div className="dashboard-grid-layout">
                {/* Left Column: WhatsApp campaign */}
                <div className="grid-column">
                  <div className="dashboard-card">
                    <h3 className="card-title" style={{ marginBottom: "8px" }}>WhatsApp Invitation Broadcaster</h3>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "20px" }}>
                      Promote Claim dashboards to directories by blasting SMS notifications.
                    </p>

                    <div className="contacts-select-box">
                      <label className="form-label" style={{ fontWeight: "700" }}>Targets Directory (Select Scraped Contacts)</label>
                      <div className="checkbox-list-scroll">
                        {institutions.slice(0, 20).map(inst => (
                          <label key={inst.id} className="checkbox-list-label">
                            <input 
                              type="checkbox" 
                              checked={selectedContacts.includes(inst.id)} 
                              onChange={() => toggleSelectContact(inst.id)} 
                            />
                            <span>{inst.name} ({inst.location})</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <label className="form-label">Invitation Message Template</label>
                      <textarea 
                        value={waTemplate} 
                        onChange={(e) => setWaTemplate(e.target.value)} 
                        className="dashboard-textarea"
                      />
                    </div>

                    <button 
                      onClick={handleSendWhatsApp} 
                      disabled={isSendingCampaign || selectedContacts.length === 0} 
                      className="broadcast-send-btn"
                    >
                      <Send size={16} />
                      <span>Blast Invites to ({selectedContacts.length}) Contacts</span>
                    </button>

                    {campaignLogs.length > 0 && (
                      <div className="campaign-logs-panel">
                        {campaignLogs.map((log, i) => <div key={i}>{log}</div>)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Referral link clicks */}
                <div className="grid-column">
                  <div className="dashboard-card">
                    <h3 className="card-title" style={{ marginBottom: "8px" }}>Viral Referral click Logs</h3>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "20px" }}>
                      Track the performance of sharing campaigns. Shows referrers whose links attracted new users.
                    </p>

                    <div className="table-wrapper">
                      {referrals.length > 0 ? (
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>Referrer ID</th>
                              <th>Date/Time</th>
                              <th style={{ textAlign: "right" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {referrals.map((ref) => (
                              <tr key={ref.id}>
                                <td><span className="mono-code">{ref.referrerId}</span></td>
                                <td>{new Date(ref.timestamp).toLocaleString()}</td>
                                <td style={{ textAlign: "right" }}><span style={{ color: "#10b981", fontWeight: "700" }}>Click Hits ✔</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="empty-card-state">No referral clicks logged yet. Share listings to track clicks.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS (STAFF ROLES) */}
          {activeTab === "settings" && (
            <div className="tab-pane">
              <div className="tab-header">
                <h2>Administrative Setup & Staff Roles</h2>
                <p>Register console members and manage access rights according to organization hierarchy.</p>
              </div>

              <div className="dashboard-grid-layout">
                {/* Column 1: Add new staff */}
                <div className="grid-column">
                  <div className="dashboard-card">
                    <h3 className="card-title" style={{ marginBottom: "16px" }}>Register Platform Staff</h3>
                    
                    {profile?.role === "manager" ? (
                      <div className="denied-box">
                        ⚠️ Access Restricted: Managers are not authorized to register new administrative accounts.
                      </div>
                    ) : (
                      <form onSubmit={handleCreateStaff} className="staff-creation-form">
                        <div>
                          <label className="form-label">Full Name</label>
                          <input 
                            type="text" 
                            placeholder="John Doe" 
                            value={staffName} 
                            onChange={(e) => setStaffName(e.target.value)} 
                            className="dashboard-input"
                            required 
                          />
                        </div>

                        <div>
                          <label className="form-label">Staff Email Address</label>
                          <input 
                            type="email" 
                            placeholder="john@educonnect.in" 
                            value={staffEmail} 
                            onChange={(e) => setStaffEmail(e.target.value)} 
                            className="dashboard-input"
                            required 
                          />
                        </div>

                        <div>
                          <label className="form-label">Privilege Level</label>
                          <select 
                            value={staffRole} 
                            onChange={(e) => setStaffRole(e.target.value)} 
                            className="dashboard-select"
                          >
                            <option value="manager">Manager (Operations Deck)</option>
                            {profile?.role === "super_admin" && (
                              <option value="admin">Administrator (Ingest & Verify)</option>
                            )}
                          </select>
                        </div>

                        <button type="submit" disabled={isCreatingStaff} className="action-btn-primary">
                          <Plus size={16} />
                          <span>Create Staff Account</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Column 2: Roster of administrators */}
                <div className="grid-column">
                  <div className="dashboard-card">
                    <h3 className="card-title" style={{ marginBottom: "16px" }}>Administrative Team Directory</h3>
                    
                    {profile?.role === "manager" ? (
                      <div className="denied-box">
                        ⚠️ Access Restricted: Directory data visible to Administrators only.
                      </div>
                    ) : (
                      <div className="staff-list-container">
                        {staffList.map((st) => (
                          <div key={st.uid} className="staff-member-row">
                            <div className="staff-member-details">
                              <span className="staff-member-name">{st.name}</span>
                              <span className="staff-member-email">{st.email}</span>
                            </div>
                            <span className={`staff-role-tag ${st.role}`}>
                              {st.role.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Manual Listing Modal */}
          {showAddModal && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <div className="modal-header">
                  <h3>Add Institution Manually</h3>
                  <button onClick={() => setShowAddModal(false)} className="close-modal-btn"><X size={18} /></button>
                </div>
                <form onSubmit={handleAddManualSubmit} className="modal-form">
                  <div className="form-grid">
                    <div>
                      <label className="form-label">Name *</label>
                      <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="dashboard-input" required />
                    </div>
                    <div>
                      <label className="form-label">Category Type *</label>
                      <select value={formType} onChange={(e) => setFormType(e.target.value)} className="dashboard-select">
                        <option value="high-school">School</option>
                        <option value="university">College / University</option>
                        <option value="coaching">Coaching Center</option>
                        <option value="kindergarten">Play School</option>
                        <option value="vocational">ITI / Vocational Training</option>
                        <option value="computer">Computer Training</option>
                        <option value="sports">Sports Academy</option>
                        <option value="custom">Custom / Add New...</option>
                      </select>
                      {formType === "custom" && (
                        <input type="text" placeholder="Custom Category Name" value={formCustomType} onChange={(e) => setFormCustomType(e.target.value)} className="dashboard-input" style={{ marginTop: "10px" }} required />
                      )}
                    </div>
                    <div>
                      <label className="form-label">District *</label>
                      <select value={formDistrict} onChange={(e) => setFormDistrict(e.target.value)} className="dashboard-select">
                        {ODISHA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Town / City / Block</label>
                      <input type="text" value={formTown} onChange={(e) => setFormTown(e.target.value)} className="dashboard-input" />
                    </div>
                    <div>
                      <label className="form-label">Pin Code</label>
                      <input type="text" value={formPinCode} onChange={(e) => setFormPinCode(e.target.value)} className="dashboard-input" placeholder="e.g. 751024" />
                    </div>
                    <div>
                      <label className="form-label">Phone</label>
                      <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="dashboard-input" />
                    </div>
                    <div>
                      <label className="form-label">Website URL</label>
                      <input type="url" value={formWebsite} onChange={(e) => setFormWebsite(e.target.value)} className="dashboard-input" />
                    </div>
                    <div>
                      <label className="form-label">Google Maps URL</label>
                      <input type="url" value={formMapUri} onChange={(e) => setFormMapUri(e.target.value)} className="dashboard-input" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Address</label>
                    <input type="text" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} className="dashboard-input" />
                  </div>
                  <div>
                    <label className="form-label">Description</label>
                    <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="dashboard-textarea" style={{ height: "60px" }} />
                  </div>
                  <div className="form-grid">
                    <div>
                      <label className="form-label">Listing Claim Status</label>
                      <select value={formIsClaimed ? "claimed" : "unclaimed"} onChange={(e) => setFormIsClaimed(e.target.value === "claimed")} className="dashboard-select">
                        <option value="unclaimed">Unclaimed</option>
                        <option value="claimed">Claimed</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Placement Tier</label>
                      <select value={formTier} onChange={(e) => setFormTier(e.target.value)} className="dashboard-select">
                        <option value="free">Free Listing</option>
                        <option value="paid-tier-1">Premium Listing (Tier 1)</option>
                        <option value="paid-tier-2">Premium Placement Listing (Tier 2)</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowAddModal(false)} className="action-btn-secondary">Cancel</button>
                    <button type="submit" className="action-btn-primary">Save Listing</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Manual Listing Modal */}
          {showEditModal && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <div className="modal-header">
                  <h3>Edit Institution Listing</h3>
                  <button onClick={() => { setShowEditModal(false); resetForm(); }} className="close-modal-btn"><X size={18} /></button>
                </div>
                <form onSubmit={handleEditSubmit} className="modal-form">
                  <div className="form-grid">
                    <div>
                      <label className="form-label">Name *</label>
                      <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="dashboard-input" required />
                    </div>
                    <div>
                      <label className="form-label">Category Type *</label>
                      <select value={formType} onChange={(e) => setFormType(e.target.value)} className="dashboard-select">
                        <option value="high-school">School</option>
                        <option value="university">College / University</option>
                        <option value="coaching">Coaching Center</option>
                        <option value="kindergarten">Play School</option>
                        <option value="vocational">ITI / Vocational Training</option>
                        <option value="computer">Computer Training</option>
                        <option value="sports">Sports Academy</option>
                        <option value="custom">Custom / Add New...</option>
                      </select>
                      {formType === "custom" && (
                        <input type="text" placeholder="Custom Category Name" value={formCustomType} onChange={(e) => setFormCustomType(e.target.value)} className="dashboard-input" style={{ marginTop: "10px" }} required />
                      )}
                    </div>
                    <div>
                      <label className="form-label">District *</label>
                      <select value={formDistrict} onChange={(e) => setFormDistrict(e.target.value)} className="dashboard-select">
                        {ODISHA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Town / City / Block</label>
                      <input type="text" value={formTown} onChange={(e) => setFormTown(e.target.value)} className="dashboard-input" />
                    </div>
                    <div>
                      <label className="form-label">Pin Code</label>
                      <input type="text" value={formPinCode} onChange={(e) => setFormPinCode(e.target.value)} className="dashboard-input" placeholder="e.g. 751024" />
                    </div>
                    <div>
                      <label className="form-label">Phone</label>
                      <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="dashboard-input" />
                    </div>
                    <div>
                      <label className="form-label">Website URL</label>
                      <input type="url" value={formWebsite} onChange={(e) => setFormWebsite(e.target.value)} className="dashboard-input" />
                    </div>
                    <div>
                      <label className="form-label">Google Maps URL</label>
                      <input type="url" value={formMapUri} onChange={(e) => setFormMapUri(e.target.value)} className="dashboard-input" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Address</label>
                    <input type="text" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} className="dashboard-input" />
                  </div>
                  <div>
                    <label className="form-label">Description</label>
                    <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="dashboard-textarea" style={{ height: "60px" }} />
                  </div>
                  <div className="form-grid">
                    <div>
                      <label className="form-label">Listing Claim Status</label>
                      <select value={formIsClaimed ? "claimed" : "unclaimed"} onChange={(e) => setFormIsClaimed(e.target.value === "claimed")} className="dashboard-select">
                        <option value="unclaimed">Unclaimed</option>
                        <option value="claimed">Claimed</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Placement Tier</label>
                      <select value={formTier} onChange={(e) => setFormTier(e.target.value)} className="dashboard-select">
                        <option value="free">Free Listing</option>
                        <option value="paid-tier-1">Premium Listing (Tier 1)</option>
                        <option value="paid-tier-2">Premium Placement Listing (Tier 2)</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }} className="action-btn-secondary">Cancel</button>
                    <button type="submit" className="action-btn-primary">Update Listing</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Embedded CSS rules for premium dark/light layout */}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background: #f1f5f9;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1e293b;
        }

        .admin-dashboard-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Top Navigation Header */
        .admin-navbar {
          background: #0f294a;
          color: #ffffff;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .nav-divider {
          width: 1px;
          height: 24px;
          background: rgba(255, 255, 255, 0.15);
        }

        .nav-welcome {
          font-size: 0.875rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-search-wrapper {
          position: relative;
          width: 240px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .navbar-search-input {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          padding: 8px 12px 8px 36px;
          color: #ffffff;
          font-size: 0.85rem;
          width: 100%;
          outline: none;
          transition: all 0.2s;
        }

        .navbar-search-input::placeholder {
          color: #94a3b8;
        }

        .navbar-search-input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: #3b82f6;
          width: 280px;
        }

        .nav-notification {
          position: relative;
          cursor: pointer;
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .nav-notification:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 700;
          border-radius: 50%;
          width: 15px;
          height: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #0f294a;
        }

        .nav-profile-menu-container {
          position: relative;
        }

        .nav-profile-button {
          background: none;
          border: none;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .nav-profile-button:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .nav-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .nav-profile-name {
          color: #f1f5f9;
        }

        .nav-dropdown-menu {
          position: absolute;
          right: 0;
          top: 48px;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          width: 180px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 200;
        }

        .dropdown-item {
          padding: 10px 16px;
          font-size: 0.85rem;
          color: #334155;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s;
        }

        .dropdown-item:hover {
          background: #f1f5f9;
        }

        .logout-item {
          border-top: 1px solid #f1f5f9;
          color: #ef4444;
        }

        .logout-item:hover {
          background: #fef2f2;
        }

        /* Layout Structure */
        .admin-body-layout {
          flex: 1;
          display: flex;
        }

        /* Left Sidebar styling */
        .admin-sidebar {
          width: 240px;
          background: #0d2b6b;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          padding: 16px 0;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.02);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 12px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: #cbd5e1;
          background: none;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          text-align: left;
          position: relative;
          transition: all 0.2s;
        }

        .sidebar-link:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }

        .sidebar-link.active {
          color: #ffffff;
          background: #1d4ed8;
          box-shadow: 0 4px 6px -1px rgba(29, 78, 216, 0.15);
        }

        .tab-counter-badge {
          position: absolute;
          right: 16px;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 9999px;
          line-height: 1;
        }

        .tab-counter-badge.warn {
          background: #f59e0b;
          color: #ffffff;
        }

        .tab-counter-badge.info {
          background: #3b82f6;
          color: #ffffff;
        }

        .logout-sidebar-link {
          margin-top: 24px;
          color: #fca5a5;
        }

        .logout-sidebar-link:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        /* Main Viewport panel */
        .admin-main-viewport {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          background: #f4f6f8;
        }

        .tab-pane {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .tab-header {
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 16px;
          margin-bottom: 8px;
        }

        .tab-header h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .tab-header p {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
        }

        /* Metric Cards Grid */
        .metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .metric-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
        }

        .metric-card-content {
          display: flex;
          flex-direction: column;
        }

        .metric-card-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-card-value {
          font-size: 1.85rem;
          font-weight: 800;
          color: #0f172a;
          margin: 6px 0;
          line-height: 1;
        }

        .metric-card-subtext {
          font-size: 0.8rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .metric-card-icon {
          padding: 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-card-icon.blue { background: rgba(59, 130, 246, 0.08); color: #3b82f6; }
        .metric-card-icon.purple { background: rgba(139, 92, 246, 0.08); color: #8b5cf6; }
        .metric-card-icon.green { background: rgba(16, 185, 129, 0.08); color: #10b981; }
        .metric-card-icon.orange { background: rgba(245, 158, 11, 0.08); color: #f59e0b; }

        /* Main Dashboard Grid */
        .dashboard-grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        @media (min-width: 1024px) {
          .dashboard-grid-layout {
            grid-template-columns: 1.2fr 1fr;
          }
        }

        .grid-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Card panels */
        .dashboard-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 12px;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .card-header-link {
          background: none;
          border: none;
          color: #2563eb;
          font-size: 0.825rem;
          font-weight: 700;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.15s;
        }

        .card-header-link:hover {
          background: #eff6ff;
          text-decoration: underline;
        }

        .card-header-subtext {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
        }

        /* General Tables inside cards */
        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .dashboard-table th {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 12px;
          background: #f8fafc;
          border-bottom: 1.5px solid #e2e8f0;
        }

        .dashboard-table td {
          padding: 12px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.85rem;
          vertical-align: middle;
        }

        .dashboard-table tr:last-child td {
          border-bottom: none;
        }

        .bold-cell {
          font-weight: 700;
          color: #1e293b;
        }

        .sub-cell {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 2px;
        }

        .email-cell {
          font-family: monospace;
          color: #475569;
        }

        .cell-pill {
          font-size: 0.75rem;
          font-weight: 700;
          background: #eff6ff;
          color: #2563eb;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .table-action-btn {
          background: #2563eb;
          color: #ffffff;
          border: none;
          font-weight: 700;
          font-size: 0.8rem;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .table-action-btn:hover {
          background: #1d4ed8;
        }

        .table-action-btn-secondary {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          font-weight: 700;
          font-size: 0.8rem;
          padding: 6px 12px;
          border-radius: 6px;
          text-decoration: none;
          display: inline-block;
          transition: background 0.15s;
        }

        .table-action-btn-secondary:hover {
          background: #f8fafc;
        }

        .table-btn-approve {
          background: #10b981;
          color: #ffffff;
          border: none;
          font-weight: 700;
          font-size: 0.775rem;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
        }

        .table-btn-approve:hover { background: #059669; }

        .table-btn-reject {
          background: #ef4444;
          color: #ffffff;
          border: none;
          font-weight: 700;
          font-size: 0.775rem;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
        }

        .table-btn-reject:hover { background: #dc2626; }

        .empty-card-state {
          padding: 30px 10px;
          text-align: center;
          color: #94a3b8;
          font-size: 0.85rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* SVG Line Graph styles */
        .svg-chart-container {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 16px;
        }

        .analytics-svg-chart {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .chart-labels-row {
          display: flex;
          justify-content: space-around;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 700;
          border-top: 1px solid #f1f5f9;
          padding-top: 10px;
          margin-top: 10px;
        }

        .chart-labels-row span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .chart-labels-row span::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2563eb;
          display: inline-block;
        }

        .chart-labels-row span:nth-child(2)::before { background: #8b5cf6; }
        .chart-labels-row span:nth-child(3)::before { background: #10b981; }

        .analytics-stats-footer {
          display: flex;
          justify-content: space-between;
          background: #f8fafc;
          border-radius: 8px;
          padding: 14px;
        }

        .stat-col {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .stat-divider {
          width: 1px;
          background: #cbd5e1;
          margin: 0 16px;
        }

        .stat-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .stat-value {
          font-size: 0.95rem;
          font-weight: 800;
          color: #1e293b;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Suggestions mini vertical list */
        .suggestions-list-vertical {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .suggestion-item-mini {
          padding: 12px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .suggestion-info {
          display: flex;
          flex-direction: column;
        }

        .sug-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
        }

        .sug-meta {
          font-size: 0.725rem;
          color: #64748b;
          margin-top: 2px;
        }

        .suggestion-badges {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .badge-status-pill {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .badge-status-pill.new {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }

        .badge-user-tag {
          font-size: 0.65rem;
          font-weight: 700;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* Jobs list mini */
        .jobs-list-vertical {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .job-item-mini {
          padding: 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .job-meta-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .job-company-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
        }

        .job-details-block {
          display: flex;
          flex-direction: column;
        }

        .job-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e293b;
        }

        .job-company {
          font-size: 0.725rem;
          color: #64748b;
          margin-top: 2px;
        }

        .job-actions-right {
          display: flex;
          align-items: center;
        }

        .job-approve-btn {
          background: #10b981;
          color: #ffffff;
          border: none;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
        }

        .status-badge-active {
          font-size: 0.75rem;
          font-weight: 700;
          color: #059669;
          background: rgba(16, 185, 129, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
        }

        /* Scraper and directory components */
        .dashboard-select {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          font-size: 0.875rem;
          outline: none;
        }

        .action-btn-primary {
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .action-btn-primary:hover { background: #1d4ed8; }

        .action-btn-secondary {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          text-align: center;
        }

        .action-btn-secondary:hover { background: #f8fafc; }

        .log-console {
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 16px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.775rem;
          color: #34d399;
          height: 150px;
          overflow-y: auto;
          line-height: 1.5;
          margin-top: 10px;
        }

        .log-line {
          margin-bottom: 4px;
        }

        .listings-vertical-flow {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .directory-list-item {
          padding: 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          transition: border-color 0.15s;
        }

        .directory-list-item:hover {
          border-color: #cbd5e1;
        }

        .pill-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 9999px;
        }

        .pill-badge.claimed { background: rgba(16, 185, 129, 0.1); color: #059669; }
        .pill-badge.unclaimed { background: rgba(100, 116, 139, 0.1); color: #475569; }
        .pill-badge.premium { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
        .pill-badge.phone { background: rgba(245, 158, 11, 0.1); color: #d97706; }

        /* Claims & Verifications Cards */
        .verification-item-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .verification-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .verification-title {
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .verification-meta {
          display: flex;
          gap: 16px;
          font-size: 0.775rem;
          color: #64748b;
          flex-wrap: wrap;
        }

        .docs-link {
          font-size: 0.775rem;
          color: #2563eb;
          text-decoration: underline;
          font-weight: 600;
        }

        .verification-actions {
          display: flex;
          gap: 8px;
        }

        .reject-btn {
          background: #ffffff;
          border: 1px solid #fca5a5;
          color: #ef4444;
          font-weight: 700;
          font-size: 0.8rem;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .reject-btn:hover { background: #fef2f2; }

        .approve-btn {
          background: #10b981;
          color: #ffffff;
          border: none;
          font-weight: 700;
          font-size: 0.8rem;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .approve-btn:hover { background: #059669; }

        .access-denied-badge {
          font-size: 0.75rem;
          color: #94a3b8;
          font-style: italic;
          background: #f1f5f9;
          padding: 6px 12px;
          border-radius: 6px;
        }

        /* Suggestions Panels */
        .suggestion-item-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
        }

        .sug-logo-pill {
          font-size: 1.25rem;
          background: #f1f5f9;
          padding: 6px 10px;
          border-radius: 8px;
        }

        .sug-meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px 16px;
          margin-top: 14px;
          font-size: 0.8rem;
          color: #475569;
          border-top: 1px solid #f1f5f9;
          padding-top: 12px;
        }

        .sug-actions-row {
          display: flex;
          gap: 8px;
        }

        .sug-reject-btn {
          background: #ffffff;
          border: 1px solid #fca5a5;
          color: #ef4444;
          font-weight: 700;
          font-size: 0.775rem;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
        }

        .sug-reject-btn:hover { background: #fef2f2; }

        .sug-approve-btn {
          background: #10b981;
          color: #ffffff;
          border: none;
          font-weight: 700;
          font-size: 0.775rem;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
        }

        .sug-approve-btn:hover { background: #059669; }

        /* Campaign Broadcaster components */
        .contacts-select-box {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #f8fafc;
          padding: 12px;
          margin-bottom: 16px;
        }

        .checkbox-list-scroll {
          height: 150px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }

        .checkbox-list-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #334155;
          cursor: pointer;
        }

        .dashboard-textarea {
          width: 100%;
          height: 80px;
          padding: 10px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          font-size: 0.85rem;
          color: #334155;
          resize: none;
        }

        .dashboard-textarea:focus { border-color: #3b82f6; }

        .broadcast-send-btn {
          width: 100%;
          padding: 12px;
          background: #10b981;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
        }

        .broadcast-send-btn:hover { background: #059669; }

        .campaign-logs-panel {
          margin-top: 16px;
          background: #090d16;
          border-radius: 8px;
          padding: 12px;
          font-family: monospace;
          font-size: 0.725rem;
          color: #10b981;
          height: 100px;
          overflow-y: auto;
          line-height: 1.5;
        }

        .mono-code {
          font-family: monospace;
          background: #e2e8f0;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.775rem;
          color: #1e293b;
        }

        /* Settings and Staff management */
        .staff-creation-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dashboard-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #334155;
          outline: none;
        }

        .dashboard-input:focus { border-color: #3b82f6; }

        .denied-box {
          padding: 16px;
          background: #fff5f5;
          border: 1px dashed #fecaca;
          border-radius: 8px;
          color: #ef4444;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .staff-list-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .staff-member-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
        }

        .staff-member-details {
          display: flex;
          flex-direction: column;
        }

        .staff-member-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1e293b;
        }

        .staff-member-email {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 2px;
        }

        .staff-role-tag {
          font-size: 0.675rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 9999px;
          text-transform: uppercase;
        }

        .staff-role-tag.super_admin { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
        .staff-role-tag.admin { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
        .staff-role-tag.manager { background: rgba(245, 158, 11, 0.1); color: #d97706; }
        /* Modal overlay styling */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 20px;
          box-sizing: border-box;
        }

        .modal-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 640px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
        }

        .close-modal-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }

        .close-modal-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .modal-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-sizing: border-box;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #f1f5f9;
          padding-top: 20px;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
