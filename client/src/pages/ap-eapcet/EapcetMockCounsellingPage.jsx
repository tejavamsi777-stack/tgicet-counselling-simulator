import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Printer, 
  Search, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Send,
  Lock,
  X
} from "lucide-react";
import { AP_COLLEGES_METADATA } from "../../data/apCollegesMetadata";
import OFFICIAL_AP_COLLEGE_BRANCHES from "../../data/officialApCollegeBranches.json";
import Seo from "../../components/shared/Seo";

// Standard AP Districts list matching official APSCHE portal
const AP_DISTRICTS = [
  "All",
  "Anantapur",
  "Annamayya",
  "Chittoor",
  "East Godavari",
  "Guntur",
  "Kadapa",
  "Krishna",
  "Kurnool",
  "Nellore",
  "NTR",
  "Palnadu",
  "Prakasam",
  "Srikakulam",
  "Visakhapatnam",
  "Vizianagaram",
  "West Godavari"
];

// Standard AP College Types
const AP_COLLEGE_TYPES = [
  "All",
  "Private",
  "University",
  "University - Self Finance",
  "University - Self Supporting",
  "Government"
];

// Standard AP Universities
const AP_UNIVERSITIES = [
  "All",
  "ACHARYA NAGARJUNA UNIVERSITY",
  "ADIKAVI NANNAYA UNIVERSITY",
  "ANDHRA UNIVERSITY",
  "DR BR AMBEDKAR UNIVERSITY",
  "JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY - GURAJADA",
  "JNT UNIVERSITY ANANTHAPUR",
  "JNT UNIVERSITY KAKINADA",
  "KRISHNA UNIVERSITY",
  "RAYALASEEMA UNIVERSITY",
  "SRI KRISHNADEVARAYA UNIVERSITY",
  "SRI VENKATESWARA UNIVERSITY",
  "YOGI VEMANA UNIVERSITY"
];

// Complete official dictionary of all 78 AP Engineering Branch Names
const AP_BRANCH_NAMES = {
  "CSE": "COMPUTER SCIENCE AND ENGINEERING",
  "CSM": "CSE(ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING)",
  "CSD": "CSE(DATA SCIENCE)",
  "CSC": "CSE(CYBER SECURITY)",
  "CAI": "COMPUTER SCIENCE AND ARTIFICIAL INTELLIGENCE",
  "AID": "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE",
  "AIM": "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING",
  "AI": "ARTIFICIAL INTELLIGENCE",
  "CAD": "COMPUTER SCIENCE AND APPLICATION DEVELOPMENT",
  "CIC": "CSE (IOT & CYBER SECURITY WITH BLOCK CHAIN TECH)",
  "CIT": "COMPUTER SCIENCE AND INFORMATION TECHNOLOGY",
  "CSB": "COMPUTER SCIENCE AND BUSINESS SYSTEMS",
  "CSBS": "COMPUTER SCIENCE AND BUSINESS SYSTEMS",
  "CSW": "COMPUTER SCIENCE AND WEB TECHNOLOGY",
  "CDA": "COMPUTER SCIENCE (DATA ANALYTICS)",
  "CBC": "COMPUTER SCIENCE (BLOCKCHAIN)",
  "CS": "COMPUTER SCIENCE",
  "CSO": "COMPUTER SCIENCE AND OTHERS",
  "CSS": "COMPUTER SCIENCE AND SYSTEMS",
  "CST": "COMPUTER SCIENCE AND TECHNOLOGY",
  "CSED": "COMPUTER SCIENCE AND ENGINEERING (DESIGN)",
  "CSG": "COMPUTER SCIENCE AND GAMING",
  "CIA": "CSE (INTERNET OF THINGS AND AUTOMATION)",
  "ECE": "ELECTRONICS AND COMMUNICATION ENGINEERING",
  "EEE": "ELECTRICAL AND ELECTRONICS ENGINEERING",
  "INF": "INFORMATION TECHNOLOGY",
  "INFE": "INFORMATION TECHNOLOGY AND ENGINEERING",
  "MEC": "MECHANICAL ENGINEERING",
  "CIV": "CIVIL ENGINEERING",
  "CHE": "CHEMICAL ENGINEERING",
  "BIO": "BIO-TECHNOLOGY",
  "AGR": "AGRICULTURAL ENGINEERING",
  "FDT": "FOOD TECHNOLOGY",
  "FDE": "FOOD ENGINEERING",
  "FSP": "FOOD SCIENCE AND PROCESSING",
  "ROB": "ROBOTICS AND AUTOMATION",
  "RBT": "ROBOTICS AND TECHNOLOGY",
  "MIN": "MINING ENGINEERING",
  "PET": "PETROLEUM ENGINEERING",
  "AUT": "AUTOMOBILE ENGINEERING",
  "ASE": "AEROSPACE ENGINEERING",
  "BME": "BIOMEDICAL ENGINEERING",
  "EBM": "ELECTRONICS AND BIOMEDICAL ENGINEERING",
  "ECV": "ELECTRONICS (VLSI DESIGN)",
  "VLSI": "VLSI DESIGN AND TECHNOLOGY",
  "ECES": "ELECTRONICS AND EMBEDDED SYSTEMS",
  "ECM": "ELECTRONICS AND COMPUTER ENGINEERING",
  "ECT": "ELECTRONICS AND COMMUNICATION TECHNOLOGY",
  "MRB": "MECHATRONICS AND ROBOTICS",
  "MAD": "MECHATRONICS AND DESIGN",
  "MAU": "MECHANICAL AUTOMATION",
  "GIN": "GEO-INFORMATICS",
  "MET": "METALLURGICAL ENGINEERING",
  "MMT": "METALLURGY AND MATERIAL TECHNOLOGY",
  "NAM": "NAVAL ARCHITECTURE AND MARINE ENGINEERING",
  "ENV": "ENVIRONMENTAL ENGINEERING",
  "EVT": "ENVIRONMENTAL TECHNOLOGY",
  "SWE": "SOFTWARE ENGINEERING",
  "DS": "DATA SCIENCE",
  "IOT": "INTERNET OF THINGS",
  "EIE": "ELECTRONICS AND INSTRUMENTATION ENGINEERING",
  "EII": "ELECTRONICS AND INSTRUMENTATION",
  "IST": "INSTRUMENTATION TECHNOLOGY",
  "PHM": "PHARMACY",
  "PHD": "PHARMACEUTICAL TECHNOLOGY",
  "PHE": "PHARMACEUTICAL ENGINEERING",
  "PLG": "PETROCHEMICAL ENGINEERING",
  "QC": "QUALITY CONTROL AND LAB TECH",
  "SST": "SAFETY AND FIRE TECHNOLOGY",
  "MMM": "MECHANICAL AND MANUFACTURING",
  "MII": "MANUFACTURING AND INDUSTRIAL ENGINEERING",
  "BDT": "BUILDING TECHNOLOGY",
  "PEE": "POWER ENGINEERING",
  "GDT": "GEOTECHNICAL ENGINEERING"
};

// Normalize district names to match standard filter
function normalizeDistrict(dist) {
  if (!dist) return "Visakhapatnam";
  const d = dist.trim().toLowerCase();
  if (d.includes("visakha") || d.includes("vsp")) return "Visakhapatnam";
  if (d.includes("vizianagaram") || d.includes("vzm")) return "Vizianagaram";
  if (d.includes("srikakulam") || d.includes("skl")) return "Srikakulam";
  if (d.includes("east") || d.includes("kakinada") || d.includes("rajahmundry")) return "East Godavari";
  if (d.includes("west") || d.includes("eluru") || d.includes("bhimavaram")) return "West Godavari";
  if (d.includes("krishna") || d.includes("machilipatnam")) return "Krishna";
  if (d.includes("ntr") || d.includes("vijayawada")) return "NTR";
  if (d.includes("guntur")) return "Guntur";
  if (d.includes("palnadu") || d.includes("narasaraopet")) return "Palnadu";
  if (d.includes("prakasam") || d.includes("ongole")) return "Prakasam";
  if (d.includes("nellore") || d.includes("spsr")) return "Nellore";
  if (d.includes("chittoor") || d.includes("tirupati")) return "Chittoor";
  if (d.includes("kadapa") || d.includes("ysr")) return "Kadapa";
  if (d.includes("annamayya") || d.includes("rayachoti")) return "Annamayya";
  if (d.includes("kurnool") || d.includes("nandyal")) return "Kurnool";
  if (d.includes("anantapur") || d.includes("sri sathya sai")) return "Anantapur";
  return dist;
}

// Normalize university affiliation to standard dropdown
function normalizeUniversity(affil, name, code, district) {
  const a = (affil || "").toUpperCase();
  const n = (name || "").toUpperCase();
  const c = (code || "").toUpperCase();
  const d = (district || "").toUpperCase();

  if (a.includes("JNTUK") || a === "JNTUK") return "JNT UNIVERSITY KAKINADA";
  if (a.includes("JNTUA") || a === "JNTUA") return "JNT UNIVERSITY ANANTHAPUR";
  if (a.includes("JNTUGV") || a.includes("JNTUV") || a.includes("GURAJADA") || n.includes("GURAJADA")) {
    return "JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY - GURAJADA";
  }
  if (a.includes("AU") || a === "AU" || n.includes("ANDHRA UNIVERSITY") || n.includes("ANDHRA UNIV")) {
    return "ANDHRA UNIVERSITY";
  }
  if (a.includes("ANU") || a === "ANU" || n.includes("NAGARJUNA UNIVERSITY") || n.includes("NAGARJUNA")) {
    return "ACHARYA NAGARJUNA UNIVERSITY";
  }
  if (a.includes("SVU") || a === "SVU" || a.includes("SVVU") || n.includes("VENKATESWARA UNIVERSITY") || n.includes("S V U")) {
    return "SRI VENKATESWARA UNIVERSITY";
  }
  if (a.includes("KRU") || a.includes("KSUM") || a.includes("KRISHNA") || n.includes("KRISHNA UNIVERSITY") || n.includes("KRISHNA UNIV") || c.includes("KRU") || c.includes("KSUM")) {
    return "KRISHNA UNIVERSITY";
  }
  if (a.includes("AKNU") || a.includes("AKUO") || n.includes("NANNAYA") || c.includes("AKNU")) {
    return "ADIKAVI NANNAYA UNIVERSITY";
  }
  if (a.includes("BRAU") || n.includes("AMBEDKAR UNIVERSITY") || n.includes("B.R. AMBEDKAR") || n.includes("DR BR AMBEDKAR")) {
    return "DR BR AMBEDKAR UNIVERSITY";
  }
  if (a.includes("RSUK") || a.includes("RU") || n.includes("RAYALASEEMA UNIVERSITY") || n.includes("RAYALASEEMA")) {
    return "RAYALASEEMA UNIVERSITY";
  }
  if (a.includes("SKU") || n.includes("KRISHNADEVARAYA UNIVERSITY") || n.includes("KRISHNADEVARAYA")) {
    return "SRI KRISHNADEVARAYA UNIVERSITY";
  }
  if (a.includes("YGVU") || a.includes("YVU") || n.includes("YOGI VEMANA")) {
    return "YOGI VEMANA UNIVERSITY";
  }

  // Regional university affiliation default
  if (d.includes("CHITTOOR") || d.includes("ANANTAPUR") || d.includes("KADAPA") || d.includes("KURNOOL") || d.includes("NELLORE")) {
    return "JNT UNIVERSITY ANANTHAPUR";
  }
  return "JNT UNIVERSITY KAKINADA";
}

export default function ApEapcetMockCounsellingPage() {
  const navigate = useNavigate();
  const printRef = useRef(null);

  // Candidate Data State — NO PRE-FILLED DEFAULTS
  const [candidateSubmitted, setCandidateSubmitted] = useState(false);
  const [rank, setRank] = useState("");
  const [candidateCategory, setCandidateCategory] = useState("");
  const [candidateGender, setCandidateGender] = useState("");

  // Filter Dropdown Inputs — Start at "" (unselected)
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCollegeType, setSelectedCollegeType] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  // Active Applied Filters
  const [appliedFilters, setAppliedFilters] = useState({
    district: "",
    collegeType: "",
    university: "",
    course: "",
    hasSearched: false
  });

  // Search input inside panels
  const [availableSearch, setAvailableSearch] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");

  // Selected Preferences (Ordered List)
  const [selectedPreferences, setSelectedPreferences] = useState([]);

  // Toast / Floating message
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [isFrozen, setIsFrozen] = useState(false);

  // Generate all real AP college + course options synchronously from AP_COLLEGES_METADATA & OFFICIAL_AP_COLLEGE_BRANCHES
  const allCourseOptions = useMemo(() => {
    const list = [];
    const colleges = Object.values(AP_COLLEGES_METADATA || {});

    colleges.forEach((col) => {
      const code = (col.code || "").toUpperCase().trim();
      const branches = (OFFICIAL_AP_COLLEGE_BRANCHES && OFFICIAL_AP_COLLEGE_BRANCHES[code])
        ? OFFICIAL_AP_COLLEGE_BRANCHES[code]
        : Object.keys(col.feeByBranch || {});
      
      const branchesToUse = branches.length > 0 ? branches : ["CSE", "ECE", "EEE", "MEC", "CIV", "INF", "CSM", "CSD"];
      const cleanName = (col.name || "").replace(new RegExp(`^${col.code}\\s*[-–—:]\\s*`, 'i'), '').trim();
      const district = normalizeDistrict(col.district);
      const university = normalizeUniversity(col.affiliation, col.name, col.code, col.district);
      const type = col.type || "Private";
      const courseType = type.includes("University") ? (type.includes("Self") ? "SS" : "UNIV") : "PVT";

      branchesToUse.forEach((brCode) => {
        const fullCourseName = AP_BRANCH_NAMES[brCode] || brCode;
        list.push({
          id: `${code}_${brCode}`,
          collegeCode: code,
          collegeName: cleanName || col.name,
          collegeType: type,
          courseCode: brCode,
          courseName: fullCourseName,
          courseType,
          district,
          university,
          displayText: `${code}-${cleanName || col.name} : ${type} :: ${brCode} - ${fullCourseName} : ${courseType}`
        });
      });
    });

    return list.sort((a, b) => a.collegeCode.localeCompare(b.collegeCode));
  }, []);

  // Handle "get Colleges" button click
  const handleGetColleges = () => {
    setAppliedFilters({
      district: selectedDistrict || "All",
      collegeType: selectedCollegeType || "All",
      university: selectedUniversity || "All",
      course: selectedCourse || "All",
      hasSearched: true
    });
    showToast("Colleges populated matching selected criteria", "success");
  };

  // Handle "clear" button click
  const handleClearFilters = () => {
    setSelectedDistrict("");
    setSelectedCollegeType("");
    setSelectedUniversity("");
    setSelectedCourse("");
    setAppliedFilters({
      district: "",
      collegeType: "",
      university: "",
      course: "",
      hasSearched: false
    });
    setAvailableSearch("");
    showToast("Filters cleared", "info");
  };

  // Filter available courses for Left Panel (ONLY appears when user hits "get Colleges")
  const availableCoursesList = useMemo(() => {
    // If user has not clicked "get Colleges" yet, return empty list
    if (!appliedFilters.hasSearched) {
      return [];
    }

    const selectedIds = new Set(selectedPreferences.map((p) => p.id));
    const activeDistrict = appliedFilters.district;
    const activeType = appliedFilters.collegeType;
    const activeUni = appliedFilters.university;
    const activeCourse = appliedFilters.course;

    return allCourseOptions.filter((opt) => {
      // Exclude already added to preferences
      if (selectedIds.has(opt.id)) return false;

      // 1. District Filter
      if (activeDistrict && activeDistrict !== "All" && activeDistrict !== "-- Select --") {
        if (opt.district.toLowerCase() !== normalizeDistrict(activeDistrict).toLowerCase()) {
          return false;
        }
      }

      // 2. College Type Filter
      if (activeType && activeType !== "All" && activeType !== "-- Select --") {
        if (activeType === "Private" && opt.collegeType !== "Private") return false;
        if (activeType.includes("University") && !opt.collegeType.includes("University")) return false;
        if (activeType === "Government" && opt.collegeType !== "Government") return false;
      }

      // 3. University Filter
      if (activeUni && activeUni !== "All" && activeUni !== "-- Select --") {
        if (opt.university.toLowerCase() !== activeUni.toLowerCase()) {
          return false;
        }
      }

      // 4. Course Filter
      if (activeCourse && activeCourse !== "All" && activeCourse !== "-- Select --") {
        if (opt.courseCode.toUpperCase() !== activeCourse.toUpperCase()) {
          return false;
        }
      }

      // 5. Search query filter inside panel
      if (availableSearch.trim()) {
        const q = availableSearch.toLowerCase();
        return (
          opt.displayText.toLowerCase().includes(q) ||
          opt.collegeCode.toLowerCase().includes(q) ||
          opt.collegeName.toLowerCase().includes(q) ||
          opt.courseCode.toLowerCase().includes(q) ||
          opt.courseName.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [allCourseOptions, selectedPreferences, appliedFilters, availableSearch]);

  // Filter selected preferences by search inside Right Panel
  const displayedSelectedList = useMemo(() => {
    if (!selectedSearch.trim()) return selectedPreferences;
    const q = selectedSearch.toLowerCase();
    return selectedPreferences.filter((p) =>
      p.displayText.toLowerCase().includes(q) ||
      p.collegeCode.toLowerCase().includes(q) ||
      p.courseCode.toLowerCase().includes(q)
    );
  }, [selectedPreferences, selectedSearch]);

  // Add course to preferences (Green `→` button)
  const handleAddPreference = (course) => {
    if (isFrozen) {
      showToast("Options are frozen! Unfreeze to modify.", "error");
      return;
    }
    setSelectedPreferences((prev) => [...prev, course]);
    showToast(`Added ${course.collegeCode} (${course.courseCode}) to preferences (#${selectedPreferences.length + 1})`, "success");
  };

  // Remove preference (Red `←` button)
  const handleDeletePreference = (index) => {
    if (isFrozen) {
      showToast("Options are frozen! Unfreeze to modify.", "error");
      return;
    }
    setSelectedPreferences((prev) => prev.filter((_, i) => i !== index));
    showToast("Preference removed", "info");
  };

  // Move preference Up (`↑`)
  const handleMoveUp = (index) => {
    if (isFrozen || index === 0) return;
    setSelectedPreferences((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Move preference Down (`↓`)
  const handleMoveDown = (index) => {
    if (isFrozen || index >= selectedPreferences.length - 1) return;
    setSelectedPreferences((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Delete all preferences
  const handleDeleteAll = () => {
    if (isFrozen) {
      showToast("Options are frozen!", "error");
      return;
    }
    if (selectedPreferences.length === 0) return;
    if (window.confirm("Are you sure you want to delete ALL selected web options preferences?")) {
      setSelectedPreferences([]);
      showToast("All web options preferences deleted", "info");
    }
  };

  // Save options
  const handleSave = () => {
    if (selectedPreferences.length === 0) {
      showToast("No preferences selected to save.", "error");
      return;
    }
    try {
      localStorage.setItem("ap_eapcet_mock_web_options", JSON.stringify(selectedPreferences));
      showToast(`Successfully saved ${selectedPreferences.length} web options preferences!`, "success");
    } catch (e) {
      showToast("Failed to save options to local storage.", "error");
    }
  };

  // Save & Print
  const handleSaveAndPrint = () => {
    handleSave();
    window.print();
  };

  // Freeze Options Toggle
  const handleFreeze = () => {
    if (selectedPreferences.length === 0) {
      showToast("Please add preferences before freezing.", "error");
      return;
    }
    setIsFrozen((prev) => {
      const nextState = !prev;
      showToast(nextState ? "Web Options FROZEN successfully!" : "Web Options Unfrozen.", nextState ? "success" : "info");
      return nextState;
    });
  };

  const showToast = (msg, type = "success") => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage("");
    }, 4000);
  };

  // 1. Initial Candidate Entry Form (Only Rank, Category & Gender — No Defaults)
  if (!candidateSubmitted) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <Seo
          title="AP EAPCET 2026 Exercise Web Options | Official Portal Simulator"
          description="Practice web options entry exactly as on the official APSCHE portal (cap.apcfss.in) with scraped colleges, verified course codes, and live preference builder."
          path="/ap-eapcet/mock-counselling"
        />

        <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-purple-950/40 via-black/80 to-purple-900/30 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center gap-3 pb-5 border-b border-white/10 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
              <GraduationCap size={22} />
            </div>
            <div>
              <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                Official Web Options Simulator
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                AP EAPCET 2026 — Web Options Entry
              </h1>
            </div>
          </div>

          {/* MOCK DISCLAIMER BANNER */}
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-center">
            <p className="text-xs font-bold text-red-300 flex items-center justify-center gap-1.5">
              <AlertCircle size={15} className="shrink-0 text-red-400" />
              <span>
                <strong>DISCLAIMER:</strong> This is an unofficial mock counselling simulator for practice only. Official options must be exercised at <strong>cap.apcfss.in</strong>.
              </span>
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!rank || !candidateCategory || !candidateGender) {
                alert("Please select your Rank, Category, and Gender before proceeding.");
                return;
              }
              setCandidateSubmitted(true);
            }}
            className="space-y-4"
          >
            {/* Rank Input */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5 block">
                AP EAPCET Rank <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                required
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="Enter your AP EAPCET Rank (e.g. 12500)"
                className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-2.5 text-sm text-white font-mono font-bold placeholder-white/40 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5 block">
                Caste / Category <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={candidateCategory}
                onChange={(e) => setCandidateCategory(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none cursor-pointer"
              >
                <option value="">-- Select Category --</option>
                <option value="OC">OC (Open Competition)</option>
                <option value="EWS">EWS</option>
                <option value="BC-A">BC-A</option>
                <option value="BC-B">BC-B</option>
                <option value="BC-C">BC-C</option>
                <option value="BC-D">BC-D</option>
                <option value="BC-E">BC-E</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            {/* Gender Select */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5 block">
                Candidate Gender <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={candidateGender}
                onChange={(e) => setCandidateGender(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none cursor-pointer"
              >
                <option value="">-- Select Gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="pt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate("/ap-eapcet")}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition cursor-pointer"
              >
                ← Back
              </button>

              <button
                type="submit"
                className="rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-extrabold text-white hover:bg-purple-500 shadow-lg shadow-purple-950/60 transition cursor-pointer flex items-center gap-2"
              >
                <span>Proceed to Exercise Web Options</span>
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // 2. Full Official AP EAPCET Web Options Interface Screen
  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] text-[#1e293b] font-sans antialiased p-2 sm:p-4 md:p-6 select-none">
      <Seo
        title="Web Options — Engineering (EAPCET) | Official Simulation Portal"
        description="Official APSCHE styled Web Options portal simulation for AP EAPCET Engineering admissions."
      />

      {/* Floating Status / Toast */}
      {statusMessage && (
        <div
          className={`fixed bottom-6 right-6 z-[99999] flex items-center gap-2.5 rounded-2xl px-5 py-3 text-xs font-bold shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white border border-white/20 backdrop-blur-xl transition-all duration-300 ${
            statusType === "error"
              ? "bg-rose-600/95"
              : statusType === "info"
              ? "bg-blue-600/95"
              : "bg-emerald-600/95"
          }`}
        >
          {statusType === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* OFFICIAL SIMULATION DISCLAIMER RIBBON */}
      <div className="max-w-[1700px] mx-auto mb-3 rounded-lg border border-red-300 bg-red-50 p-2.5 sm:px-4 sm:py-2 text-center shadow-sm">
        <p className="text-xs sm:text-sm font-bold text-red-600 tracking-wide flex items-center justify-center gap-1.5">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>
            <strong>NOTE:</strong> This is a <strong>Mock Web Options Simulator</strong> for candidate practice and preference ordering only. This is <u>NOT</u> the official APSCHE website. Submit your final web options on <strong>cap.apcfss.in</strong>.
          </span>
        </p>
      </div>

      {/* Back Action Bar */}
      <div className="max-w-[1700px] mx-auto mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCandidateSubmitted(false)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Edit Candidate Data</span>
        </button>

        {isFrozen && (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-3 py-1 rounded-md">
            <Lock size={13} />
            <span>Options Currently Frozen</span>
          </span>
        )}
      </div>

      {/* HORIZONTALLY SCROLLABLE OFFICIAL WORKSPACE CONTAINER (Desktop Layout in Mobile) */}
      <div className="w-full overflow-x-auto pb-6">
        <div className="min-w-[1080px] max-w-[1700px] mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden" ref={printRef}>
          
          {/* 1. TOP CANDIDATE DETAILS HEADER BAR */}
          <div className="bg-white p-4 sm:p-5 border-b border-slate-200">
            <div className="flex items-center justify-between gap-4">
              
              {/* Title with Badge */}
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight">
                  Web Options
                </h1>
                <span className="rounded-full bg-[#dbeafe] text-[#1d4ed8] border border-[#bfdbfe] px-3 py-0.5 text-xs font-bold">
                  Engineering (EAPCET)
                </span>
              </div>

              {/* Key-Value Details Grid */}
              <div className="grid grid-cols-5 gap-4 sm:gap-6 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    AP EAPCET RANK
                  </span>
                  <span className="font-extrabold text-[#2563eb] text-sm font-mono">
                    {rank || "12500"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    CATEGORY
                  </span>
                  <span className="font-extrabold text-[#7c3aed] text-sm font-mono">
                    {candidateCategory || "OC"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    GENDER
                  </span>
                  <span className="font-extrabold text-[#16a34a] text-sm font-mono">
                    {candidateGender || "Male"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    STREAM / GROUP
                  </span>
                  <span className="font-bold text-[#0f172a] text-xs">
                    MPC (Engineering)
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    EAPCET SUBJECT
                  </span>
                  <span className="font-bold text-[#0f172a] text-[11px] truncate block">
                    MATHS, PHYSICS &amp; CHEM
                  </span>
                </div>
              </div>

              {/* Print / Preview Button */}
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={handleSaveAndPrint}
                  className="bg-[#15803d] hover:bg-[#166534] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Printer size={15} />
                  <span>Preview / Print</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. OFFICIAL FILTER BAR */}
          <div className="bg-[#f8fafc] p-3 sm:p-4 border-b border-slate-200">
            <div className="grid grid-cols-6 gap-3 items-end">
              
              {/* 1. District Dropdown */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none shadow-sm cursor-pointer"
                >
                  <option value="">-- Select --</option>
                  {AP_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* 2. College Type Dropdown */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  College Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCollegeType}
                  onChange={(e) => setSelectedCollegeType(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none shadow-sm cursor-pointer"
                >
                  <option value="">-- Select --</option>
                  {AP_COLLEGE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* 3. University Dropdown */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  University <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none shadow-sm cursor-pointer"
                >
                  <option value="">-- Select --</option>
                  {AP_UNIVERSITIES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* 4. Course Dropdown */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none shadow-sm cursor-pointer"
                >
                  <option value="">-- Select --</option>
                  <option value="All">All</option>
                  {Object.keys(AP_BRANCH_NAMES).map((bCode) => (
                    <option key={bCode} value={bCode}>
                      {bCode} — {AP_BRANCH_NAMES[bCode]}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. get Colleges Button */}
              <div>
                <button
                  type="button"
                  onClick={handleGetColleges}
                  className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-3 py-1.5 rounded-md font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>get Colleges</span>
                </button>
              </div>

              {/* 6. clear Button with Close X Icon */}
              <div>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white px-3 py-1.5 rounded-md font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>clear</span>
                  <X size={14} className="stroke-[3]" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. TWO SPLIT TABLES CONTAINER (Always Side-by-Side) */}
          <div className="grid grid-cols-2 divide-x divide-slate-200">
          
          {/* LEFT PANEL: List of Courses / Programmes */}
          <div className="flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-[#e0f2fe] px-4 py-2.5 border-b border-[#bae6fd] flex items-center justify-between">
              <span className="text-xs font-bold text-[#0369a1] uppercase tracking-wide">
                List of Courses /Programmes ({availableCoursesList.length})
              </span>
              <span className="text-[11px] text-slate-500">Available</span>
            </div>

            {/* Search Input */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={availableSearch}
                  onChange={(e) => setAvailableSearch(e.target.value)}
                  placeholder="Search colleges..."
                  className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-bold z-10">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center border-r border-slate-200">S.No</th>
                    <th className="py-2 px-3 border-r border-slate-200">College Name : College Type : Course : Course Type</th>
                    <th className="py-2 px-3 w-12 text-center font-extrabold text-blue-600">+</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {availableCoursesList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-16 text-center text-slate-400 text-xs">
                        No courses found matching selected filters. Select filters above and click <strong>get Colleges</strong>.
                      </td>
                    </tr>
                  ) : (
                    availableCoursesList.map((course, idx) => (
                      <tr
                        key={course.id}
                        className="hover:bg-blue-50/60 transition-colors"
                      >
                        <td className="py-2 px-3 text-center text-slate-500 border-r border-slate-100 font-mono font-medium text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 text-slate-800 border-r border-slate-100 leading-snug">
                          <span className="font-extrabold text-[#7f1d1d]">{course.collegeCode}-{course.collegeName}</span> : <span className="text-[#475569]">{course.collegeType}</span> :: <span className="font-bold text-[#1d4ed8]">{course.courseCode} - {course.courseName}</span> : <span className="text-[#475569]">{course.courseType}</span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleAddPreference(course)}
                            title="Add to Preferences"
                            className="h-6 w-6 rounded bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-sm flex items-center justify-center mx-auto shadow-sm cursor-pointer transition active:scale-95"
                          >
                            <span>→</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT PANEL: List of Selected Preferences */}
          <div className="flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-[#e0f2fe] px-4 py-2.5 border-b border-[#bae6fd] flex items-center justify-between">
              <span className="text-xs font-bold text-[#0369a1] uppercase tracking-wide">
                List of Selected Preferences ({selectedPreferences.length})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Priority Order</span>
            </div>

            {/* Search Input */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={selectedSearch}
                  onChange={(e) => setSelectedSearch(e.target.value)}
                  placeholder="Search colleges..."
                  className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-bold z-10">
                  <tr>
                    <th className="py-2 px-3 w-16 text-center border-r border-slate-200">Preference</th>
                    <th className="py-2 px-3 border-r border-slate-200">College Name : College Type : Course : Course Type</th>
                    <th className="py-2 px-2.5 w-12 text-center text-red-600 border-r border-slate-200">Delete</th>
                    <th className="py-2 px-2.5 w-10 text-center text-slate-700 border-r border-slate-200">Up</th>
                    <th className="py-2 px-2.5 w-10 text-center text-slate-700">Down</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {selectedPreferences.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-400 text-xs">
                        No preferences selected yet. Click the <strong>→</strong> button on the left to add colleges to your preference list.
                      </td>
                    </tr>
                  ) : (
                    displayedSelectedList.map((course, idx) => (
                      <tr
                        key={course.id}
                        className="hover:bg-amber-50/50 transition-colors"
                      >
                        <td className="py-2 px-3 text-center border-r border-slate-100 font-mono font-extrabold text-[#0f172a] text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 text-slate-800 border-r border-slate-100 leading-snug">
                          <span className="font-extrabold text-[#7f1d1d]">{course.collegeCode}-{course.collegeName}</span> : <span className="text-[#475569]">{course.collegeType}</span> :: <span className="font-bold text-[#1d4ed8]">{course.courseCode} - {course.courseName}</span> : <span className="text-[#475569]">{course.courseType}</span>
                        </td>
                        <td className="py-2 px-2.5 text-center border-r border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleDeletePreference(idx)}
                            title="Delete Preference"
                            className="h-6 w-6 rounded bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black text-sm flex items-center justify-center mx-auto shadow-sm cursor-pointer transition active:scale-95"
                          >
                            <span>←</span>
                          </button>
                        </td>
                        <td className="py-2 px-2 text-center border-r border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(idx)}
                            disabled={idx === 0}
                            title="Move Up"
                            className="h-6 w-6 rounded hover:bg-slate-200 disabled:opacity-20 disabled:cursor-not-allowed text-slate-800 font-black text-sm flex items-center justify-center mx-auto transition active:scale-95"
                          >
                            <span>↑</span>
                          </button>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleMoveDown(idx)}
                            disabled={idx >= selectedPreferences.length - 1}
                            title="Move Down"
                            className="h-6 w-6 rounded hover:bg-slate-200 disabled:opacity-20 disabled:cursor-not-allowed text-slate-800 font-black text-sm flex items-center justify-center mx-auto transition active:scale-95"
                          >
                            <span>↓</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM ACTION BUTTONS BAR */}
        <div className="bg-[#f8fafc] p-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2 rounded-md font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Save size={14} />
            <span>Save</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndPrint}
            className="bg-[#0891b2] hover:bg-[#0e7490] text-white px-5 py-2 rounded-md font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Printer size={14} />
            <span>Save &amp; Print</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteAll}
            className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-5 py-2 rounded-md font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>Delete All Weboptions</span>
          </button>

          <button
            type="button"
            onClick={handleFreeze}
            className={`px-5 py-2 rounded-md font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              isFrozen
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-[#059669] hover:bg-[#047857] text-white"
            }`}
          >
            <Lock size={14} />
            <span>{isFrozen ? "Unfreeze Options" : "Freeze Options"}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}

