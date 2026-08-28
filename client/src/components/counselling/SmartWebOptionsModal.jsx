import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import {
  X,
  ArrowRight,
  CheckCircle2,
  Flame,
  Star,
  Download,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Loader2,
  Plus,
  Trash2,
  GripVertical
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveOptions } from "../../utils/mockCounsellingStorage";
import { exportPreferencesToPDF } from "../../utils/exportPreferences";
import { getDistrictName } from "../../utils/districtNames";
import { EXAM_COURSE_GROUPS } from "../../config/courseGroups";
import { api } from "../../lib/api";

// Recognized Premier Dream Institutes by Exam
const DREAM_COLLEGES = {
  "tg-eapcet": [
    { code: "CBIT", name: "Chaitanya Bharathi Institute of Technology", place: "Gandipet, Hyderabad", district: "HYD" },
    { code: "VJEC", name: "VNR Vignana Jyothi Institute of Engg & Tech", place: "Bachupally, Hyderabad", district: "MDL" },
    { code: "VASV", name: "Vasavi College of Engineering", place: "Ibrahimbagh, Hyderabad", district: "HYD" },
    { code: "OUCE", name: "University College of Engineering, Osmania University", place: "Hyderabad", district: "HYD" },
    { code: "JNTH", name: "JNTUH College of Engineering", place: "Kukatpally, Hyderabad", district: "MDL" },
    { code: "GRRR", name: "Gokaraju Rangaraju Institute of Engg & Tech", place: "Bachupally, Hyderabad", district: "MDL" },
    { code: "MGIT", name: "Mahatma Gandhi Institute of Technology", place: "Gandipet, Hyderabad", district: "HYD" },
    { code: "KMIT", name: "Keshav Memorial Institute of Technology", place: "Narayanguda, Hyderabad", district: "HYD" },
    { code: "CVRH", name: "CVR College of Engineering", place: "Ibrahimpatnam, Hyderabad", district: "RRD" },
    { code: "CVSR", name: "Anurag University / CVSR College of Engg", place: "Venkatapur, Ghatkesar", district: "MDL" },
    { code: "BVRW", name: "BVRIT Hyderabad College of Engg for Women", place: "Bachupally, Hyderabad", district: "MDL" },
  ],
  "ap-eapcet": [
    { code: "AUCE", name: "Andhra University College of Engineering", place: "Visakhapatnam", district: "VSP" },
    { code: "JNTA", name: "JNTUA College of Engineering", place: "Anantapur", district: "ATP" },
    { code: "JNTK", name: "JNTUK College of Engineering", place: "Kakinada", district: "EG" },
    { code: "GVPX", name: "Gayatri Vidya Parishad College of Engineering", place: "Madhurawada, Vizag", district: "VSP" },
    { code: "VRSE", name: "VR Siddhartha Engineering College", place: "Vijayawada", district: "KRI" },
    { code: "RVRJ", name: "RVR & JC College of Engineering", place: "Chowdavaram, Guntur", district: "GTR" },
    { code: "SVUE", name: "SVU College of Engineering", place: "Tirupati", district: "CTR" },
  ],
  "tg-icet": [
    { code: "OUCE", name: "Dept of Business Management, Osmania University", place: "Hyderabad", district: "HYD" },
    { code: "JNTH", name: "School of Management Studies, JNTUH", place: "Kukatpally, Hyderabad", district: "MDL" },
    { code: "CBIT", name: "Chaitanya Bharathi Institute of Tech (MBA/MCA)", place: "Gandipet, Hyderabad", district: "HYD" },
    { code: "VJEC", name: "VNR Vignana Jyothi Inst of Tech (MBA)", place: "Bachupally, Hyderabad", district: "MDL" },
    { code: "BIMS", name: "Badruka College PG Centre", place: "Kachiguda, Hyderabad", district: "HYD" },
  ]
};

function OptionRow({
  item,
  index,
  totalCount,
  category,
  onMoveUp,
  onMoveDown,
  onDelete,
}) {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  function handlePointerDown(e) {
    // If clicking an interactive button/link, don't trigger drag hold
    if (e.target.closest("button, a, input, select")) return;

    startPosRef.current = { x: e.clientX, y: e.clientY };

    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

    setIsHolding(true);

    holdTimerRef.current = setTimeout(() => {
      // Trigger haptic vibration on mobile touch screens
      if (typeof window !== "undefined" && window.navigator?.vibrate) {
        try {
          window.navigator.vibrate(35);
        } catch {
          // ignore if vibration not permitted
        }
      }
      setIsDragging(true);
      setIsHolding(false);
      dragControls.start(e);
    }, 220); // 220ms press-and-hold threshold
  }

  function handlePointerMove(e) {
    // If pointer moves more than 7px before timer fires, cancel hold (user is scrolling)
    if (holdTimerRef.current && !isDragging) {
      const dx = Math.abs(e.clientX - startPosRef.current.x);
      const dy = Math.abs(e.clientY - startPosRef.current.y);
      if (dx > 7 || dy > 7) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
        setIsHolding(false);
      }
    }
  }

  function handlePointerUpOrCancel() {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
    setIsDragging(false);
  }

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => {
        setIsDragging(true);
        setIsHolding(false);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setIsHolding(false);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      className={`group relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 rounded-xl border p-3 sm:px-4 sm:py-2.5 text-xs select-none backdrop-blur-md touch-pan-y transition-all duration-150 ${
        isDragging
          ? "scale-[1.02] bg-[#241748] border-purple-400 shadow-2xl shadow-purple-950/90 z-50 ring-2 ring-purple-500/50 cursor-grabbing"
          : isHolding
          ? "scale-[1.01] bg-[#1e133a] border-purple-500/60 shadow-lg"
          : "bg-white/[0.08] hover:bg-white/[0.14] border-white/20 hover:border-white/40 shadow-sm"
      }`}
    >
      {/* Top / Left Section: Drag handle, preference number, college info */}
      <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
        {/* Drag Handle & Preference Number */}
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5 sm:pt-0">
          <div
            className="cursor-grab active:cursor-grabbing text-white/50 hover:text-white p-1.5 rounded transition touch-none select-none"
            title="Press & hold card, or drag this handle"
            onPointerDown={(e) => {
              e.stopPropagation();
              if (typeof window !== "undefined" && window.navigator?.vibrate) {
                try {
                  window.navigator.vibrate(35);
                } catch {
                  // ignore
                }
              }
              setIsDragging(true);
              dragControls.start(e);
            }}
          >
            <GripVertical size={16} />
          </div>
          <span className="flex h-6 w-7 sm:h-7 sm:w-8 items-center justify-center rounded-lg bg-white/15 border border-white/30 text-white font-mono font-bold text-xs shadow-inner">
            #{item.prefNumber}
          </span>
        </div>

        {/* College Name & District */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <p className="font-semibold text-white text-xs sm:text-sm line-clamp-1 sm:truncate">
              {item.collegeName}
            </p>
            <span className="font-mono text-[10px] font-bold text-white/90 px-1.5 py-0.5 rounded bg-white/10 border border-white/20 shrink-0">
              {item.collegeCode}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-300 mt-0.5">
            {item.place && <span className="truncate max-w-[140px] sm:max-w-none">{item.place}</span>}
            {item.place && item.district && <span>•</span>}
            {item.district && <span>{getDistrictName(item.district) || item.district}</span>}
          </div>
        </div>

        {/* Mobile-Only Action Controls (Top Right) */}
        <div className="flex sm:hidden items-center gap-1 shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1.5 text-white/70 hover:text-white disabled:opacity-20 cursor-pointer"
            title="Move Up"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === totalCount - 1}
            className="p-1.5 text-white/70 hover:text-white disabled:opacity-20 cursor-pointer"
            title="Move Down"
          >
            <ChevronDown size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.prefNumber)}
            className="p-1.5 text-rose-400 hover:text-rose-300 cursor-pointer"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Bottom / Right Section: Branch, Cutoff, Status Tier, Desktop Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3.5 pt-2 sm:pt-0 border-t border-white/10 sm:border-t-0 shrink-0">
        {/* Branch Badge */}
        <span className="rounded-md bg-white/15 border border-white/25 px-2 sm:px-2.5 py-0.5 sm:py-1 font-semibold text-[11px] text-white">
          {item.course}
        </span>

        {/* Cutoff Rank */}
        <div className="text-right min-w-[75px] sm:min-w-[85px]">
          <span className="text-[10px] text-gray-300 block font-normal leading-none mb-0.5">
            {category} Cutoff{item.cutoffYear ? ` '${String(item.cutoffYear).slice(-2)}` : ""}
          </span>
          <span className="font-mono font-bold text-xs sm:text-sm text-white">
            {item.cutoff === null
              ? <span className="text-gray-400 font-normal">N/A</span>
              : typeof item.cutoff === "number"
                ? item.cutoff.toLocaleString()
                : item.cutoff}
          </span>
        </div>

        {/* Strategy Tier Badge */}
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
          item.tier === "dream"
            ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
            : item.tier === "target"
            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
        }`}>
          {item.tier === "dream" ? "Dream College" : item.tier === "target" ? "Target Match" : "Safe College"}
        </span>

        {/* Desktop Controls (Arrows + Delete) */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="text-white/50 hover:text-white p-0.5 disabled:opacity-20 cursor-pointer"
              title="Move Up"
            >
              <ChevronUp size={13} />
            </button>
            <button
              type="button"
              onClick={() => onMoveDown(index)}
              disabled={index === totalCount - 1}
              className="text-white/50 hover:text-white p-0.5 disabled:opacity-20 cursor-pointer"
              title="Move Down"
            >
              <ChevronDown size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onDelete(item.prefNumber)}
            className="rounded p-1.5 text-rose-400/70 hover:bg-rose-500/20 hover:text-rose-300 transition cursor-pointer"
            title="Delete option"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function SmartWebOptionsModal({
  isOpen,
  onClose,
  rank,
  category = "OC",
  gender = "Male",
  selectedCourses = [],
  selectedDistricts = [],
  selectedYears = [],
  results = [],
  examSlug = "tg-eapcet",
}) {
  const navigate = useNavigate();

  // 1. Course priority list (default from user's selected courses or top 4 courses)
  const defaultCourses = useMemo(() => {
    if (selectedCourses.length > 0) return selectedCourses;
    const configGroup = EXAM_COURSE_GROUPS[examSlug];
    if (configGroup?.selectorGroups?.[0]?.branches) {
      return configGroup.selectorGroups[0].branches.slice(0, 4).map((b) => b.code);
    }
    return ["CSE", "CSM", "CSD", "INF"];
  }, [selectedCourses, examSlug]);

  const [priorityCourses, setPriorityCourses] = useState(defaultCourses);
  const [targetCount, setTargetCount] = useState(25);
  const [generating, setGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState([]);
  const [step, setStep] = useState("configure"); // "configure" | "preview"

  // Master lookup cached from DB query for adding custom colleges
  const [masterCutoffMap, setMasterCutoffMap] = useState(new Map());
  const [masterCollegeMap, setMasterCollegeMap] = useState(new Map());
  const [availableCollegeList, setAvailableCollegeList] = useState([]);

  // Manual College Add State
  const [showAddBar, setShowAddBar] = useState(false);
  const [addCourse, setAddCourse] = useState("CSE");
  const [addCollegeCode, setAddCollegeCode] = useState("");
  const [collegeSearchQuery, setCollegeSearchQuery] = useState("");

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setPriorityCourses(defaultCourses);
      setStep("configure");
      setGeneratedList([]);
      setShowAddBar(false);
      if (defaultCourses.length > 0) {
        setAddCourse(defaultCourses[0]);
      }
    }
  }, [isOpen, defaultCourses]);

  // Fetch all colleges list for the exam once
  useEffect(() => {
    let cancelled = false;
    async function fetchAllColleges() {
      try {
        const data = await api.get(`/colleges?exam=${examSlug}`);
        if (!cancelled && Array.isArray(data)) {
          setAvailableCollegeList(data);
          const cMap = new Map();
          data.forEach((c) => {
            const code = (c.code || "").toUpperCase().trim();
            if (code) {
              cMap.set(code, {
                code,
                name: c.name || code,
                place: c.place || "",
                district: c.district_code || c.district || "",
                courses: c.courses || [],
              });
            }
          });
          setMasterCollegeMap(cMap);
        }
      } catch (err) {
        console.warn("Could not fetch colleges list:", err);
      }
    }
    if (isOpen) {
      fetchAllColleges();
    }
    return () => { cancelled = true; };
  }, [isOpen, examSlug]);

  // Available course options to add
  const allBranches = useMemo(() => {
    const configGroup = EXAM_COURSE_GROUPS[examSlug];
    return configGroup?.selectorGroups?.flatMap((g) => g.branches || []) || [];
  }, [examSlug]);

  function toggleCourse(code) {
    setPriorityCourses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  function moveCourse(code, dir) {
    setPriorityCourses((prev) => {
      const idx = prev.indexOf(code);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  }

  // Generate Strategic Web Options using EXACT official category & gender cutoffs from Database
  async function handleGenerate() {
    setGenerating(true);

    try {
      const rankNum = Number(rank) || 25000;

      // 1a. Fetch ALL data from rank=1 for Dream college cutoffs (exact category/gender)
      //     No course filter so we get cutoffs for any branch at Dream colleges too
      const dreamResponse = await api.post("/predict", {
        exam: examSlug,
        rank: 1,
        category: category || "OC",
        gender: gender || "Male",
        years: selectedYears && selectedYears.length > 0 ? selectedYears : undefined,
        // No courses filter → get ALL branches so Dream fallback (CSE) always works
        // No districts filter → Dream colleges are in Hyderabad regardless of user filter
      });

      // 1b. Fetch broader pool for Target & Safe colleges at student's ACTUAL rank
      //     Include all branches (not just priority) for variety — no repetition
      const broadResponse = await api.post("/predict", {
        exam: examSlug,
        rank: rankNum,
        category: category || "OC",
        gender: gender || "Male",
        years: selectedYears && selectedYears.length > 0 ? selectedYears : undefined,
        districts: selectedDistricts && selectedDistricts.length > 0 ? selectedDistricts : undefined,
        // No courses filter → get ALL branches so Target/Safe has diverse options
      });

      const dreamRawResults = Array.isArray(dreamResponse) ? dreamResponse : (dreamResponse.results || []);
      const broadRawResults = Array.isArray(broadResponse) ? broadResponse : (broadResponse.results || []);

      // Merge both result sets (dream results take priority for cutoff values)
      const allRawResults = [...dreamRawResults, ...broadRawResults];


      // ── Build LATEST-YEAR cutoff map ────────────────────────────────────
      // Each row has a `year` field from the DB. For every college+branch key,
      // keep only the cutoff from the MOST RECENT year so Dream colleges always
      // show e.g. 2025 data now, and 2026 automatically when that data is added.
      //
      // yearTracker: key -> { year: number, cutoff: number }
      const yearTracker = new Map();
      const collegeDetailsMap = new Map(masterCollegeMap);

      for (const row of allRawResults) {
        const cCode = (row.code || row.college_code || "").toString().trim().toUpperCase();
        const bCode = (row.course || row.course_code || "").toString().trim().toUpperCase();
        const key = `${cCode}_${bCode}`;
        const cutoffRank = Number(row.cutoff_rank || row.cutoff || 0);
        const rowYear = Number(row.year || 0);

        if (cutoffRank > 0) {
          const existing = yearTracker.get(key);
          // Prefer later year; within same year prefer the lower closing rank
          if (
            !existing ||
            rowYear > existing.year ||
            (rowYear === existing.year && cutoffRank < existing.cutoff)
          ) {
            yearTracker.set(key, { year: rowYear, cutoff: cutoffRank });
          }

          if (!collegeDetailsMap.has(cCode)) {
            collegeDetailsMap.set(cCode, {
              code: cCode,
              name: row.name || row.college_name || cCode,
              place: row.place || "",
              district: row.district_code || row.district || "",
            });
          }
        }
      }

      // Flatten yearTracker → simple cutoffMap (value = latest year's cutoff)
      const cutoffMap = new Map(
        Array.from(yearTracker.entries()).map(([k, v]) => [k, v.cutoff])
      );

      // Determine which year is actually being used (for display/debug)
      const latestYear = yearTracker.size > 0
        ? Math.max(...Array.from(yearTracker.values()).map((v) => v.year))
        : null;

      // Also merge any existing prediction results (user's own predictor results)
      // Only add keys NOT already in cutoffMap (DB latest-year wins)
      for (const row of results) {
        const cCode = (row.code || row.college_code || "").toString().trim().toUpperCase();
        const bCode = (row.course || row.course_code || "").toString().trim().toUpperCase();
        const key = `${cCode}_${bCode}`;
        const cutoffRank = Number(row.cutoff_rank || row.cutoff || 0);

        if (cutoffRank > 0 && !cutoffMap.has(key)) {
          cutoffMap.set(key, cutoffRank);
        }
        if (!collegeDetailsMap.has(cCode)) {
          collegeDetailsMap.set(cCode, {
            code: cCode,
            name: row.name || row.college_name || cCode,
            place: row.place || "",
            district: row.district_code || row.district || "",
          });
        }
      }

      setMasterCutoffMap(cutoffMap);
      setMasterCollegeMap(collegeDetailsMap);

      const finalOptions = [];
      const usedKeys = new Set();

      // ── Phase 1: Dream Colleges — dynamically the 7 colleges with the TIGHTEST cutoffs ──
      // "Dream" = hardest to get into = lowest closing rank for the user's category+gender+course.
      // We scan the entire cutoffMap (built from the rank=1 API call which returns all colleges)
      // and pick the ones with the smallest (lowest) cutoff rank numbers.
      //
      // Priority: user's selected priority courses first.
      // Each college appears ONCE — pick the course with the tightest cutoff for that college.
      const usedDreamCodes = new Set(); // track college codes to avoid repeats in dream tier

      // Collect all (college, course, cutoff) from the cutoffMap filtered to priority courses
      const allCandidates = []; // { cCode, courseCode, cutoff }
      const coursesToConsider = priorityCourses.length > 0 ? priorityCourses : [];

      for (const [key, cutoffRank] of cutoffMap.entries()) {
        if (!cutoffRank || cutoffRank <= 0) continue;
        const lastUnderscore = key.lastIndexOf("_");
        const cCode = key.slice(0, lastUnderscore);
        const courseCode = key.slice(lastUnderscore + 1);
        // Only include if course matches user's priority list
        if (coursesToConsider.length === 0 || coursesToConsider.includes(courseCode)) {
          allCandidates.push({ cCode, courseCode, cutoff: cutoffRank });
        }
      }

      // Sort by cutoff ascending (lowest rank number = tightest = hardest to get into)
      allCandidates.sort((a, b) => a.cutoff - b.cutoff);

      // Pick top 7 unique colleges (each college only once, with its tightest-cutoff course)
      for (const candidate of allCandidates) {
        if (finalOptions.length >= 7) break;
        if (usedDreamCodes.has(candidate.cCode)) continue;

        const key = `${candidate.cCode}_${candidate.courseCode}`;
        const details = collegeDetailsMap.get(candidate.cCode) || {
          code: candidate.cCode,
          name: candidate.cCode,
          place: "",
          district: "",
        };

        usedDreamCodes.add(candidate.cCode);
        usedKeys.add(key);
        finalOptions.push({
          id: key,
          collegeCode: candidate.cCode,
          collegeName: details.name,
          place: details.place,
          district: details.district,
          course: candidate.courseCode,
          tier: "dream",
          tierLabel: "Dream College",
          tierColor: "text-orange-400 bg-orange-500/15 border-orange-500/35",
          cutoff: candidate.cutoff,
          cutoffYear: latestYear,
          status: "risky",
        });
      }

      // ── Process Results Table data from predictor ──────────────────────
      const normalizedResults = results.map((r) => {
        const cCode = (r.code || r.college_code || "").toString().trim().toUpperCase();
        const bCode = (r.course || r.course_code || "").toString().trim().toUpperCase();
        const cutoffVal = Number(r.cutoff || r.cutoff_rank || 0);
        // Use the status from the results table directly (it was set by the predictor API)
        // Fallback to recalculating only if status is missing
        const status = r.status ||
          (cutoffVal > rankNum ? "safe" : (cutoffVal >= rankNum * 0.85 ? "moderate" : "risky"));
        return {
          code: cCode,
          name: r.name || r.college_name || cCode,
          place: r.place || "",
          district: r.district_code || r.district || "",
          course: bCode,
          cutoff: cutoffVal,
          status,
          year: Number(r.year || latestYear || 0),
        };
      }).filter((r) => r.code && r.course && r.cutoff > 0);

      // Safe colleges: cutoff STRICTLY GREATER THAN student rank (student can definitely get in)
      // Uses results table status="safe" OR our recalculated threshold
      const resultsSafeColleges = normalizedResults.filter(
        (r) => r.status === "safe" || r.cutoff > rankNum
      );

      // Target/Moderate: cutoff is BELOW student rank but within reach (stretch colleges)
      // Strictly < rankNum to avoid overlapping with safe
      const resultsTargetColleges = normalizedResults.filter(
        (r) => r.status === "moderate" || (r.cutoff >= rankNum * 0.80 && r.cutoff < rankNum)
      );

      // ── Phase 2: Target / Reach Choices ─────────────────────────────────
      for (const bCode of priorityCourses) {
        // 1. First, take target matches directly from the user's Results Table
        const fromResults = resultsTargetColleges.filter(
          (r) => r.course === bCode && !usedKeys.has(`${r.code}_${r.course}`) && !usedDreamCodes.has(r.code)
        );
        fromResults.sort((a, b) => Math.abs(a.cutoff - rankNum) - Math.abs(b.cutoff - rankNum));

        for (const r of fromResults) {
          const key = `${r.code}_${r.course}`;
          if (!usedKeys.has(key)) {
            usedKeys.add(key);
            finalOptions.push({
              id: key,
              collegeCode: r.code,
              collegeName: r.name,
              place: r.place,
              district: r.district,
              course: r.course,
              tier: "target",
              tierLabel: "Target Match",
              tierColor: "text-yellow-400 bg-yellow-500/15 border-yellow-500/35",
              cutoff: r.cutoff,
              cutoffYear: r.year || latestYear,
              gap: Math.abs(r.cutoff - rankNum),
              status: "moderate",
            });
          }
        }

        // 2. Supplement from broader DB if more target options needed for this branch
        const branchColleges = [];
        for (const [key, cutoffRank] of cutoffMap.entries()) {
          const lastUnderscore = key.lastIndexOf("_");
          const cCode = key.slice(0, lastUnderscore);
          const courseCode = key.slice(lastUnderscore + 1);

          if (courseCode === bCode && !usedKeys.has(key) && !usedDreamCodes.has(cCode)) {
            // Target = college cutoff is below student rank (stretch/risky) but within reach
            if (cutoffRank >= rankNum * 0.80 && cutoffRank < rankNum) {
              const details = collegeDetailsMap.get(cCode) || { code: cCode, name: cCode, place: "", district: "" };
              branchColleges.push({
                id: key,
                collegeCode: cCode,
                collegeName: details.name,
                place: details.place,
                district: details.district,
                course: bCode,
                tier: "target",
                tierLabel: "Target Match",
                tierColor: "text-yellow-400 bg-yellow-500/15 border-yellow-500/35",
                cutoff: cutoffRank,
                cutoffYear: latestYear,
                gap: Math.abs(cutoffRank - rankNum),
                status: "moderate",
              });
            }
          }
        }

        branchColleges.sort((a, b) => a.gap - b.gap);
        for (const opt of branchColleges) {
          const key = `${opt.collegeCode}_${opt.course}`;
          if (!usedKeys.has(key)) {
            usedKeys.add(key);
            finalOptions.push(opt);
          }
        }
      }

      // ── Phase 3: Safe Backup Colleges (Strictly from Results Table Safe Colleges) ──
      for (const bCode of priorityCourses) {
        // 1. Prioritize Safe Colleges directly from the user's Results Table
        const fromResults = resultsSafeColleges.filter(
          (r) => r.course === bCode && !usedKeys.has(`${r.code}_${r.course}`) && !usedDreamCodes.has(r.code)
        );
        // Sort by cutoff ascending (closest safe to student rank first)
        fromResults.sort((a, b) => a.cutoff - b.cutoff);

        for (const r of fromResults) {
          if (finalOptions.length >= targetCount) break;
          const key = `${r.code}_${r.course}`;
          if (!usedKeys.has(key)) {
            usedKeys.add(key);
            finalOptions.push({
              id: key,
              collegeCode: r.code,
              collegeName: r.name,
              place: r.place,
              district: r.district,
              course: r.course,
              tier: "safe",
              tierLabel: "Safe College",
              tierColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/35",
              cutoff: r.cutoff,
              cutoffYear: r.year || latestYear,
              status: "safe",
            });
          }
        }

        // 2. If more safe colleges are needed to reach targetCount, pull from broad DB pool
        if (finalOptions.length < targetCount) {
          const safeColleges = [];
          for (const [key, cutoffRank] of cutoffMap.entries()) {
            const lastUnderscore = key.lastIndexOf("_");
            const cCode = key.slice(0, lastUnderscore);
            const courseCode = key.slice(lastUnderscore + 1);

            if (courseCode === bCode && !usedKeys.has(key) && !usedDreamCodes.has(cCode)) {
              // Safe = college cutoff is strictly greater than student rank (student can get in)
              if (cutoffRank > rankNum) {
                const details = collegeDetailsMap.get(cCode) || { code: cCode, name: cCode, place: "", district: "" };
                safeColleges.push({
                  id: key,
                  collegeCode: cCode,
                  collegeName: details.name,
                  place: details.place,
                  district: details.district,
                  course: bCode,
                  tier: "safe",
                  tierLabel: "Safe College",
                  tierColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/35",
                  cutoff: cutoffRank,
                  cutoffYear: latestYear,
                  status: "safe",
                });
              }
            }
          }

          safeColleges.sort((a, b) => a.cutoff - b.cutoff);
          for (const opt of safeColleges) {
            if (finalOptions.length >= targetCount) break;
            const key = `${opt.collegeCode}_${opt.course}`;
            if (!usedKeys.has(key)) {
              usedKeys.add(key);
              finalOptions.push(opt);
            }
          }
        }
      }

      // ── Fill remaining if needed ────────────────────────────────────────
      if (finalOptions.length < targetCount) {
        // First fill from any remaining results table rows
        for (const r of normalizedResults) {
          if (finalOptions.length >= targetCount) break;
          const key = `${r.code}_${r.course}`;
          if (!usedKeys.has(key) && priorityCourses.includes(r.course) && !usedDreamCodes.has(r.code)) {
            usedKeys.add(key);
            finalOptions.push({
              id: key,
              collegeCode: r.code,
              collegeName: r.name,
              place: r.place,
              district: r.district,
              course: r.course,
              tier: r.cutoff >= rankNum ? "safe" : "target",
              tierLabel: r.cutoff >= rankNum ? "Safe College" : "Target Match",
              tierColor: r.cutoff >= rankNum ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/35" : "text-yellow-400 bg-yellow-500/15 border-yellow-500/35",
              cutoff: r.cutoff,
              cutoffYear: r.year || latestYear,
              status: r.cutoff >= rankNum ? "safe" : "moderate",
            });
          }
        }

        // Then from broader DB if still needed
        for (const bCode of priorityCourses) {
          for (const [key, cutoffRank] of cutoffMap.entries()) {
            if (finalOptions.length >= targetCount) break;
            const lastUnderscore = key.lastIndexOf("_");
            const cCode = key.slice(0, lastUnderscore);
            const courseCode = key.slice(lastUnderscore + 1);
            if (courseCode === bCode && !usedKeys.has(key) && !usedDreamCodes.has(cCode)) {
              usedKeys.add(key);
              const details = collegeDetailsMap.get(cCode) || { code: cCode, name: cCode, place: "", district: "" };
              finalOptions.push({
                id: key,
                collegeCode: cCode,
                collegeName: details.name,
                place: details.place,
                district: details.district,
                course: bCode,
                tier: cutoffRank >= rankNum ? "safe" : "target",
                tierLabel: cutoffRank >= rankNum ? "Safe College" : "Target Match",
                tierColor: cutoffRank >= rankNum ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/35" : "text-yellow-400 bg-yellow-500/15 border-yellow-500/35",
                cutoff: cutoffRank,
                cutoffYear: latestYear,
                status: cutoffRank >= rankNum ? "safe" : "moderate",
              });
            }
          }
        }
      }


      // Assign sequential preference numbers (1..N)
      const indexedList = finalOptions.slice(0, targetCount).map((opt, idx) => ({
        ...opt,
        prefNumber: idx + 1,
      }));

      setGeneratedList(indexedList);
      setStep("preview");
    } catch (err) {
      console.error("Failed to generate options:", err);
    } finally {
      setGenerating(false);
    }
  }

  // Handle Drag & Drop Reordering
  function handleReorder(newOrder) {
    const reIndexed = newOrder.map((item, idx) => ({
      ...item,
      prefNumber: idx + 1,
    }));
    setGeneratedList(reIndexed);
  }

  // Shift option Up or Down by one position
  function handleMoveOption(index, direction) {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= generatedList.length) return;
    const nextList = [...generatedList];
    const [removed] = nextList.splice(index, 1);
    nextList.splice(targetIndex, 0, removed);
    const reIndexed = nextList.map((item, idx) => ({
      ...item,
      prefNumber: idx + 1,
    }));
    setGeneratedList(reIndexed);
  }

  // Delete an option and re-number
  function handleDeleteOption(prefNumber) {
    setGeneratedList((prev) => {
      const filtered = prev.filter((item) => item.prefNumber !== prefNumber);
      return filtered.map((item, idx) => ({ ...item, prefNumber: idx + 1 }));
    });
  }

  // Add a specific college manually by user choice
  function handleAddCustomCollege() {
    if (!addCollegeCode || !addCourse) return;
    const cCode = addCollegeCode.toUpperCase().trim();
    const bCode = addCourse.toUpperCase().trim();
    const key = `${cCode}_${bCode}`;

    // Check if already in list
    if (generatedList.some((item) => item.collegeCode === cCode && item.course === bCode)) {
      return;
    }

    const rankNum = Number(rank) || 25000;
    const realCutoff = masterCutoffMap.get(key) || masterCutoffMap.get(`${cCode}_CSE`) || 0;
    const details = masterCollegeMap.get(cCode) || {
      code: cCode,
      name: cCode,
      place: "",
      district: "",
    };

    const dreamColleges = DREAM_COLLEGES[examSlug] || [];
    const isDream = dreamColleges.some((d) => d.code === cCode);

    const newItem = {
      id: `${key}_${Date.now()}`,
      collegeCode: cCode,
      collegeName: details.name,
      place: details.place,
      district: details.district,
      course: bCode,
      tier: isDream ? "dream" : (realCutoff >= rankNum ? "safe" : "target"),
      tierLabel: isDream ? "Dream College" : (realCutoff >= rankNum ? "Safe College" : "Target Match"),
      tierColor: isDream ? "text-orange-400 bg-orange-500/15 border-orange-500/35" : (realCutoff >= rankNum ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/35" : "text-yellow-400 bg-yellow-500/15 border-yellow-500/35"),
      cutoff: realCutoff || "Available in Round",
      status: realCutoff >= rankNum ? "safe" : "moderate",
      prefNumber: generatedList.length + 1,
    };

    setGeneratedList((prev) => [...prev, newItem]);
    setAddCollegeCode("");
    setCollegeSearchQuery("");
    setShowAddBar(false);
  }

  // Filtered colleges for manual add dropdown
  const filteredCollegesToAdd = useMemo(() => {
    const q = collegeSearchQuery.trim().toLowerCase();
    const list = availableCollegeList.length > 0 ? availableCollegeList : Array.from(masterCollegeMap.values());
    if (!q) return list.slice(0, 40);
    return list
      .filter((c) =>
        (c.code && c.code.toLowerCase().includes(q)) ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.place && c.place.toLowerCase().includes(q)) ||
        (c.district && c.district.toLowerCase().includes(q))
      )
      .slice(0, 40);
  }, [availableCollegeList, masterCollegeMap, collegeSearchQuery]);

  // Open Directly in Mock Counselling Simulator
  function handleOpenInSimulator() {
    const preferencesMap = {};
    const selectedDists = Array.from(new Set(generatedList.map((item) => item.district).filter(Boolean)));

    generatedList.forEach((item) => {
      preferencesMap[`${item.collegeCode}_${item.course}`] = item.prefNumber;
    });

    const DEFAULT_DISTRICTS_BY_EXAM = {
      "tg-eapcet": ["HYD", "MDL", "RRD"],
      "tg-icet": ["HYD", "MDL", "RRD"],
      "tg-ecet": ["HYD", "MDL", "RRD"],
      "tg-polycet": ["HYD", "MDL", "RRD"],
      "ap-eapcet": ["VSP", "GTR", "KRI", "EG", "CTR", "ATP"],
    };
    const defaultDists = DEFAULT_DISTRICTS_BY_EXAM[examSlug] || [];

    const criteria = {
      rank: String(rank),
      category: category || "OC",
      gender: gender || "Male",
      selectedDistricts: selectedDists.length > 0 ? selectedDists : (selectedDistricts.length > 0 ? selectedDistricts : defaultDists),
    };

    // Map examSlug to the correct storage namespace and simulator route
    const EXAM_NAMESPACE = {
      "tg-eapcet": "tgeapcet",
      "ap-eapcet": "apeapcet",
      "tg-icet": "tgicet",
      "tg-ecet": "tgecet",
      "tg-polycet": "tgpolycet",
    };
    const namespace = EXAM_NAMESPACE[examSlug] || examSlug.replace(/-/g, "");

    saveOptions(criteria, preferencesMap, namespace);

    onClose();
    navigate(`/exams/${examSlug}/mock-counselling?from=smart_options`, {
      state: { autoLoad: true },
    });
  }

  // Export to PDF directly
  function handleExportPDF() {
    const branchMap = new Map();
    allBranches.forEach((b) => {
      if (b.code && b.name) branchMap.set(b.code, b.name);
    });

    const collegesFormatted = generatedList.map((item) => {
      const branchFullName = branchMap.get(item.course);
      return {
        code: item.collegeCode,
        name: item.collegeName,
        place: item.place,
        district: item.district,
        course: item.course,
        courseName: branchFullName ? `${item.course} — ${branchFullName}` : item.course,
        courses: [item.course],
        prefNumber: item.prefNumber,
      };
    });

    const EXAM_LABELS = {
      "tg-eapcet": "TG EAPCET 2025",
      "ap-eapcet": "AP EAPCET 2025",
      "tg-icet": "TG ICET 2025",
      "tg-ecet": "TG ECET 2025",
      "tg-polycet": "TG POLYCET 2025",
    };

    const criteria = {
      rank: String(rank),
      category: category || "OC",
      gender: gender || "Male",
      selectedDistricts: selectedDistricts || [],
      examName: EXAM_LABELS[examSlug] || "Counselling 2025",
    };

    exportPreferencesToPDF(collegesFormatted, criteria);
  }

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999999] flex items-center justify-center p-2 sm:p-4 md:p-6 pointer-events-auto overscroll-contain">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-md"
      />

      {/* Modal Container - Responsive wide modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        data-lenis-prevent="true"
        className="relative z-20 flex flex-col h-[92dvh] sm:h-[88vh] max-h-[840px] w-full max-w-6xl rounded-2xl border border-purple-500/30 bg-[#120d22] shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-purple-900/50 via-purple-800/30 to-[#120d22] px-4 sm:px-6 py-3 sm:py-3.5">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Smart Web Options Generator
            </h2>
            <p className="text-[11px] text-purple-200/80 font-medium">
              Rank <span className="font-mono font-bold text-white">{Number(rank || 0).toLocaleString()}</span> • Category: <span className="font-bold text-white">{category || "OC"}</span> • Gender: <span className="font-bold text-white">{gender || "Male"}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body (Independently scrollable) */}
        <div
          data-lenis-prevent="true"
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-4 touch-pan-y"
        >
          {step === "configure" ? (
            <>
              {/* Strategy Explanation Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 flex items-start gap-2.5">
                  <Star size={16} className="text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-orange-200">1. Dream Colleges</p>
                    <p className="text-[11px] text-orange-200/80 leading-snug mt-0.5">
                      {examSlug === "tg-icet"
                        ? "Premier Tier-1 B-schools (OUCE, JNTH, CBIT, Badruka) at top options."
                        : examSlug === "ap-eapcet"
                        ? "Premier Tier-1 AP colleges (AUCE, JNTK, JNTA, GVP, VRSE, SVUE) at top options."
                        : examSlug === "tg-ecet"
                        ? "Premier Tier-1 engineering colleges (OUCE, JNTH, CBIT, VNR, Vasavi) at top options."
                        : examSlug === "tg-polycet"
                        ? "Premier Tier-1 polytechnic institutes (MASB, JNTH) at top options."
                        : "Premier Tier-1 colleges (CBIT, VNR, Vasavi, OUCE, JNTH) at top options."}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 flex items-start gap-2.5">
                  <Flame size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-yellow-200">2. Target Matches</p>
                    <p className="text-[11px] text-yellow-200/80 leading-snug mt-0.5">
                      Colleges matching close to your rank in your preferred branch order.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-200">3. Safe Colleges</p>
                    <p className="text-[11px] text-emerald-200/80 leading-snug mt-0.5">
                      High-confidence options directly from your Results Table.
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Priority Ordering */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-purple-300">
                      Step 1: Set {examSlug === "tg-icet" ? "Course" : "Branch"} Priority Order
                    </label>
                    <p className="text-[11px] text-gray-400">
                      Options will be filled in this {examSlug === "tg-icet" ? "course" : "branch"} order using official {category} ({gender}) cutoffs.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-purple-300 font-bold">
                    {priorityCourses.length} {examSlug === "tg-icet" ? "Courses" : "Branches"} Selected
                  </span>
                </div>

                {/* Available Branches to Add */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {allBranches
                    .filter((b) => !priorityCourses.includes(b.code))
                    .map((b) => (
                      <button
                        key={b.code}
                        onClick={() => toggleCourse(b.code)}
                        className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-gray-300 hover:bg-purple-500/20 hover:border-purple-500/40 hover:text-purple-200 transition cursor-pointer"
                      >
                        + {b.code}
                      </button>
                    ))}
                </div>

                {/* Priority Ordered Branches */}
                <div className="space-y-1.5 pt-1 max-h-[160px] overflow-y-auto">
                  {priorityCourses.map((code, idx) => {
                    const branchInfo = allBranches.find((b) => b.code === code);
                    return (
                      <div
                        key={code}
                        className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 transition"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/30 text-[10px] font-mono font-bold text-purple-200">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs text-white">{code}</span>
                        <span className="text-[11px] text-gray-400 truncate max-w-[140px] sm:max-w-md">
                          {branchInfo?.name || code}
                        </span>

                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            type="button"
                            onClick={() => moveCourse(code, "up")}
                            disabled={idx === 0}
                            className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveCourse(code, "down")}
                            disabled={idx === priorityCourses.length - 1}
                            className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleCourse(code)}
                            className="rounded p-1 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                            title="Remove"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Number of Colleges Slider / Presets */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-purple-300">
                      Step 2: Total Number of Web Options
                    </label>
                    <p className="text-[11px] text-gray-400">
                      Select how many initial options to generate.
                    </p>
                  </div>
                  <span className="rounded-xl border border-purple-500/40 bg-purple-500/20 px-3 py-1 text-xs font-mono font-bold text-white">
                    {targetCount} Options
                  </span>
                </div>

                {/* Preset Buttons */}
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {[20, 25, 40, 50, 75, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTargetCount(num)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                        targetCount === num
                          ? "bg-purple-600 text-white shadow-md shadow-purple-900/50 border border-purple-400"
                          : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {num} Options
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={targetCount}
                  onChange={(e) => setTargetCount(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </>
          ) : (
            /* ── Preview Generated Web Options List (Interactive Drag & Drop) ─ */
            <div className="space-y-3 pb-6">
              {/* Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Generated Strategic Options ({generatedList.length} Total)</span>
                    <span className="text-[11px] text-white/80 font-mono">
                      • {category} ({gender})
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-300">
                    💡 <span className="text-white font-semibold">Press &amp; hold any college</span> (or drag handle) to rearrange options, or tap arrows.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBar((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer shadow-sm"
                  >
                    <Plus size={14} /> Add College
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("configure")}
                    className="text-xs font-semibold text-white/80 hover:text-white underline cursor-pointer"
                  >
                    Reconfigure
                  </button>
                </div>
              </div>

              {/* Add Custom College Panel */}
              <AnimatePresence>
                {showAddBar && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border border-purple-500/40 bg-[#1a1230] p-3.5 space-y-3 shadow-xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                        <Plus size={14} className="text-purple-400" />
                        Add College & {examSlug === "tg-icet" ? "Course" : "Branch"} to Web Options
                      </p>
                      <button
                        onClick={() => setShowAddBar(false)}
                        className="text-white/40 hover:text-white text-sm cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Course / Branch select */}
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                          {examSlug === "tg-icet" ? "Course" : "Branch"}
                        </label>
                        <select
                          value={addCourse}
                          onChange={(e) => setAddCourse(e.target.value)}
                          className="w-full h-9 rounded-xl border border-white/20 bg-white/10 px-2.5 text-xs text-white outline-none"
                        >
                          {allBranches.map((b) => (
                            <option key={b.code} value={b.code} className="bg-[#120d22] text-white">
                              {b.code} — {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* College search & select */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                          Select College
                        </label>
                        <select
                          value={addCollegeCode}
                          onChange={(e) => setAddCollegeCode(e.target.value)}
                          className="w-full h-9 rounded-xl border border-white/20 bg-white/10 px-2.5 text-xs text-white outline-none"
                        >
                          <option value="" className="bg-[#120d22] text-white">-- Select or Search College --</option>
                          {filteredCollegesToAdd.map((col) => (
                            <option key={col.code} value={col.code} className="bg-[#120d22] text-white">
                              {col.code} — {col.name} {col.place ? `(${col.place})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Quick filter college name / code..."
                        value={collegeSearchQuery}
                        onChange={(e) => setCollegeSearchQuery(e.target.value)}
                        className="h-8 w-full sm:w-60 rounded-lg border border-white/15 bg-white/5 px-2.5 text-xs text-white placeholder-gray-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomCollege}
                        disabled={!addCollegeCode || !addCourse}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2 disabled:opacity-40 cursor-pointer shadow-md"
                      >
                        <Plus size={14} /> Add to List
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile-Friendly Interactive List (White Table Theme) */}
              <Reorder.Group
                axis="y"
                values={generatedList}
                onReorder={handleReorder}
                className="space-y-2 touch-pan-y"
              >
                {generatedList.map((item, index) => (
                  <OptionRow
                    key={item.id || `${item.collegeCode}_${item.course}`}
                    item={item}
                    index={index}
                    totalCount={generatedList.length}
                    category={category}
                    onMoveUp={(idx) => handleMoveOption(idx, "up")}
                    onMoveDown={(idx) => handleMoveOption(idx, "down")}
                    onDelete={(prefNum) => handleDeleteOption(prefNum)}
                  />
                ))}
              </Reorder.Group>
            </div>
          )}
        </div>

        {/* Modal Footer Actions (Responsive & Glass Button Pills) */}
        <div className="shrink-0 border-t border-white/10 bg-black/60 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {step === "configure" ? (
            <>
              <p className="text-[11px] text-gray-400 text-center sm:text-left">
                Will query official {category} ({gender}) cutoffs for Dream ➔ Target ➔ Safe options.
              </p>
              <div className="glass-button-wrap cursor-pointer rounded-full inline-block w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating || priorityCourses.length === 0}
                  className="glass-button relative isolate all-unset cursor-pointer rounded-full transition-all font-semibold text-white text-sm disabled:opacity-50 w-full sm:w-auto"
                >
                  <span className="glass-button-text relative flex items-center justify-center select-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] px-6 py-2.5 gap-2">
                    {generating ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-white" />
                        <span>Querying Official Cutoffs...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Web Options List</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </span>
                </button>
                <div className="glass-button-shadow rounded-full" />
              </div>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full justify-between sm:justify-end">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Back Button */}
                <div className="glass-button-wrap cursor-pointer rounded-full inline-block flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={() => setStep("configure")}
                    className="glass-button relative isolate all-unset cursor-pointer rounded-full transition-all font-semibold text-white text-xs sm:text-sm w-full"
                  >
                    <span className="glass-button-text relative flex items-center justify-center select-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] px-4 sm:px-5 py-2.5 gap-1.5">
                      Back
                    </span>
                  </button>
                  <div className="glass-button-shadow rounded-full" />
                </div>

                {/* Download PDF Button */}
                <div className="glass-button-wrap cursor-pointer rounded-full inline-block flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="glass-button relative isolate all-unset cursor-pointer rounded-full transition-all font-semibold text-white text-xs sm:text-sm w-full"
                  >
                    <span className="glass-button-text relative flex items-center justify-center select-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] px-4 sm:px-5 py-2.5 gap-1.5">
                      <Download size={14} />
                      Download PDF
                    </span>
                  </button>
                  <div className="glass-button-shadow rounded-full" />
                </div>
              </div>

              {/* Open Simulator Button */}
              <div className="glass-button-wrap cursor-pointer rounded-full inline-block w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleOpenInSimulator}
                  className="glass-button relative isolate all-unset cursor-pointer rounded-full transition-all font-semibold text-white text-xs sm:text-sm w-full sm:w-auto"
                >
                  <span className="glass-button-text relative flex items-center justify-center select-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] px-5 sm:px-6 py-2.5 gap-1.5">
                    <span>Open in Web Options Simulator</span>
                    <ExternalLink size={14} />
                  </span>
                </button>
                <div className="glass-button-shadow rounded-full" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
