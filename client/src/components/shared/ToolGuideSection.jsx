import React, { useState } from 'react';
import { BookOpen, HelpCircle, CheckCircle2, AlertTriangle, ChevronDown, Sparkles, Compass, Lightbulb, ShieldAlert, ArrowRight } from 'lucide-react';

const GUIDES = {
  predictor: {
    badge: "Student Guide & Decision Framework",
    title: "How to Use the {examName} College Predictor",
    subtitle: "Understand how to input your credentials, interpret cutoff probabilities, and turn previous years' data into an actionable counselling plan.",
    steps: [
      {
        number: "01",
        title: "Enter Your Entrance Exam Rank",
        desc: "Provide your authentic state rank obtained in {examName}. Ensure you enter the overall general/state rank as issued on your official scorecard."
      },
      {
        number: "02",
        title: "Select Reservation & Local Quota",
        desc: "Choose your caste category (OC, EWS, BC-A/B/C/D/E, SC, ST) and gender. Quota allocations and local region status (such as OU, AU, SVU) significantly alter closing cutoffs."
      },
      {
        number: "03",
        title: "Filter by Preferred Branches & Districts",
        desc: "Narrow results by your targeted engineering/management streams and preferred campus locations to focus exclusively on institutions you would realistically join."
      },
      {
        number: "04",
        title: "Evaluate Admission Chance Confidence",
        desc: "Review colleges categorized by High Chance (Safe), Moderate Chance (Target), and Ambitious (Reach) based on past allotment cutoff thresholds."
      }
    ],
    outcomes: [
      {
        title: "Realistic College Probability Tiers",
        desc: "Discover where your rank comfortably fits versus where admissions are competitive, preventing you from choosing an overly risky option list."
      },
      {
        title: "Understanding Quota & Category Spreads",
        desc: "Learn how female reservation, localized regional quotas, and category seats widen or tighten cutoff boundaries across university campuses and autonomous institutions."
      },
      {
        title: "Hidden Branch & Campus Opportunities",
        desc: "Identify emerging branches or top-tier campuses with closing ranks slightly above or below your rank that you might have otherwise overlooked."
      },
      {
        title: "Financial & Tuition Clarity",
        desc: "Review approved annual fees alongside government scholarship criteria (such as ePASS / RTF) to plan your budget well in advance of allotment."
      }
    ],
    usageAdvice: [
      {
        heading: "The 3-Tier Web Options Strategy",
        text: "When entering web options on the official portal, divide your choices into three groups: 25% Ambitious/Dream options (higher than your rank), 50% Realistic/Target options (closely matching your rank), and 25% Safe fallback options (well below your rank)."
      },
      {
        heading: "Never Restrict Choices to 5 or 10 Options",
        text: "Every year thousands of candidates go unallotted in Round 1 because they only submit 8-10 choices. Add at least 30 to 60 well-ordered college-branch combinations."
      },
      {
        heading: "Priority Order is Permanent During Evaluation",
        text: "The state counselling computer algorithm evaluates choices sequentially from Choice #1 downwards. It will freeze the first seat you qualify for. Always place your true dream choice higher, regardless of cutoff."
      }
    ]
  },

  mock_counselling: {
    badge: "Simulation & Choice Filling Guide",
    title: "How to Use {examName} Mock Counselling & Web Options Builder",
    subtitle: "Practice the official choice filling workflow in advance so you make zero priority ordering errors on the live portal.",
    steps: [
      {
        number: "01",
        title: "Input Candidate Profile",
        desc: "Set your rank, caste category, and gender to seed the simulator with your specific reservation context."
      },
      {
        number: "02",
        title: "Select Geographical Preferences",
        desc: "Filter down to target districts or universities where you have local residential eligibility."
      },
      {
        number: "03",
        title: "Assemble Your Preference List",
        desc: "Add college-course pairs directly into your draft list. Search by institute code, name, or branch specialization."
      },
      {
        number: "04",
        title: "Reorder, Validate & Export",
        desc: "Use move up/down controls to refine your priority sequence. Check for duplicate preferences and export a clean PDF checklist for final portal entry."
      }
    ],
    outcomes: [
      {
        title: "Zero Portal Ordering Mistakes",
        desc: "Familiarizes you with serial choice locking so you avoid accidentally ranking a lower-tier college above your dream institution."
      },
      {
        title: "Risk-Balanced Choice Distribution",
        desc: "Validates that your drafted list contains an appropriate safety net rather than solely ultra-high cutoff branches."
      },
      {
        title: "Family & Mentor Alignment",
        desc: "Generate an exportable list to review with parents, teachers, and counsellors before official portal submission opens."
      },
      {
        title: "Confidence Under Pressure",
        desc: "Eliminates anxiety during the short 3-5 day official web options window by having your finalized serial numbers ready in advance."
      }
    ],
    usageAdvice: [
      {
        heading: "Review Institute Codes Carefully",
        text: "Many institutions share similar names but have different college codes (e.g. main university vs private constituent or shift campus). Verify official codes before locking."
      },
      {
        heading: "Order by Preference, Not Cutoff",
        text: "Do not place a college higher simply because it has a higher cutoff. Rank strictly by where you would genuinely prefer to study if admitted."
      },
      {
        heading: "Save Multiple Backups",
        text: "Print or screenshot your option sheet so you have a physical record to reference while typing into the official government counselling interface."
      }
    ]
  },

  allotments: {
    badge: "Allotment Records & Historical Analytics",
    title: "How to Use {examName} Seat Allotment Explorer",
    subtitle: "Navigate thousands of official historical allotment records to understand closing rank benchmarks across institutes and categories.",
    steps: [
      {
        number: "01",
        title: "Select College and Programme",
        desc: "Choose any recognized college by name or code and pick the specific branch or specialization you wish to inspect."
      },
      {
        number: "02",
        title: "Filter by Quota & Reservation Category",
        desc: "Drill down into specific allotment categories (OC Boys/Girls, BC, SC, ST, EWS, and regional local quotas) to see exact cutoff bounds."
      },
      {
        number: "03",
        title: "Analyze Opening vs. Closing Spread",
        desc: "Observe the rank range between the first candidate admitted and the final candidate allotted in that specific branch."
      },
      {
        number: "04",
        title: "Compare Across Phases & Years",
        desc: "Track how cutoffs shifted between First Phase, Second Phase, and Final/Special rounds to understand slide possibilities."
      }
    ],
    outcomes: [
      {
        title: "Authentic Benchmarks Directly from Archives",
        desc: "See genuine candidate allotment ranks rather than speculative rumors or generic coaching estimates."
      },
      {
        title: "Phase-Wise Cutoff Movements",
        desc: "Learn how many ranks cutoffs typically drop between Round 1 and the Final Phase due to seat cancellations and IIT/NIT dropouts."
      },
      {
        title: "Branch Popularity Insights",
        desc: "Examine shifting student demand between core engineering branches and emerging specialized computing disciplines."
      },
      {
        title: "Local vs Non-Local Seat Margins",
        desc: "Understand the strict rank boundaries applied to non-local (15% unreserved) candidates versus home local candidates."
      }
    ],
    usageAdvice: [
      {
        heading: "Look at Closing Ranks, Not Opening Ranks",
        text: "Opening rank indicates the highest-ranked student who chose that branch, whereas closing rank defines the actual entry threshold."
      },
      {
        heading: "Factor in Annual Seat Intake Changes",
        text: "If a college added 60 or 120 new seats in the current academic year, the effective closing rank will likely slide slightly outward."
      },
      {
        heading: "Watch Category Sliding",
        text: "Vacant reserved seats sometimes slide or convert across phases according to government rules, creating late-phase opportunities."
      }
    ]
  },

  compare: {
    badge: "Side-by-Side College Analysis",
    title: "How to Use the {examName} College Comparison Matrix",
    subtitle: "Evaluate institutions side-by-side across cutoffs, accreditations, placement metrics, and tuition fee structures.",
    steps: [
      {
        number: "01",
        title: "Select 2 or 3 Target Colleges",
        desc: "Pick the colleges you are currently deciding between from the dropdown selectors."
      },
      {
        number: "02",
        title: "Choose the Comparison Branch",
        desc: "Set the common branch (e.g. CSE, ECE, or IT) to see normalized cutoff benchmarks across both campuses."
      },
      {
        number: "03",
        title: "Inspect Academic & Placement Metrics",
        desc: "Compare NAAC grades, autonomous status, university affiliation, and reported placement packages."
      },
      {
        number: "04",
        title: "Evaluate Total Financial Commitment",
        desc: "Weigh annual government-approved tuition against scholarship eligibility to compare net cost of attendance."
      }
    ],
    outcomes: [
      {
        title: "Objective Multi-Factor Evaluation",
        desc: "Move beyond marketing hype by comparing concrete metrics: verified fees, autonomous freedom, and historical cutoffs."
      },
      {
        title: "Cutoff Competitiveness Gap",
        desc: "Directly visualize how much higher or lower one institution closes compared to peer colleges in the same district."
      },
      {
        title: "Campus Autonomy & Curriculum Flexibility",
        desc: "Understand the practical differences between state university constituent colleges and private autonomous institutions."
      },
      {
        title: "Balanced Trade-Off Decisions",
        desc: "Decide whether a slightly higher fee at a premier college justifies the difference in placement and alumni ecosystem."
      }
    ],
    usageAdvice: [
      {
        heading: "Prioritize Autonomy & Faculty Stability",
        text: "Autonomous colleges have greater flexibility in updating their curriculum to modern industry frameworks compared to non-autonomous colleges."
      },
      {
        heading: "Consider Daily Commute & Location",
        text: "A reputable college closer to home often provides better student work-life balance and energy for projects than a campus 3 hours away."
      },
      {
        heading: "Inspect Actual Branch Strength",
        text: "A college may excel in Computer Science but have fewer core placement opportunities in Civil or Mechanical. Compare by branch, not brand alone."
      }
    ]
  },

  marks_vs_rank: {
    badge: "Score Mapping & Trends",
    title: "How to Use the {examName} Marks vs Rank Guide",
    subtitle: "Understand the historical relationship between raw exam marks, normalization curves, and resulting state ranks.",
    steps: [
      {
        number: "01",
        title: "Identify Your Raw / Expected Marks",
        desc: "Locate your score range out of the total exam marks based on your provisional answer key calculations."
      },
      {
        number: "02",
        title: "Review Historical Rank Bands",
        desc: "Examine past years' rank spreads corresponding to that score to observe the typical variance."
      },
      {
        number: "03",
        title: "Account for Normalization Dynamics",
        desc: "Understand how shift difficulty variations influence final normalized marks and percentile positioning."
      },
      {
        number: "04",
        title: "Transition to College Exploration",
        desc: "Use your estimated rank bracket to begin exploring matching colleges before official scorecards are announced."
      }
    ],
    outcomes: [
      {
        title: "Early Counselling Preparedness",
        desc: "Begin shortlisting candidate institutions weeks before official rank cards and counselling dates are gazetted."
      },
      {
        title: "Perspective on Shift Normalization",
        desc: "Learn why identical raw marks in different session slots can yield slightly different final ranks due to statistical leveling."
      },
      {
        title: "Realistic Expectations",
        desc: "Form a grounded expectation of rank brackets to avoid false assumptions prior to official results declaration."
      },
      {
        title: "Readiness for Document Verification",
        desc: "Gain advance notice on competitive rank bands to start gathering necessary caste, income, and local certificates."
      }
    ],
    usageAdvice: [
      {
        heading: "Remember Year-on-Year Paper Difficulty Differs",
        text: "If a particular year's exam paper was significantly tougher, marks needed for a top 5,000 rank will be lower than in an easier paper year."
      },
      {
        heading: "Use Brackets Rather Than Exact Numbers",
        text: "Always consider a +/- 5% margin around your predicted rank to account for student density around common score clusters."
      },
      {
        heading: "Prepare Certificates Early",
        text: "Regardless of rank, ensure EWS, Caste, Income, and Study certificates are issued within the validity window required by state authorities."
      }
    ]
  }
};

export default function ToolGuideSection({
  toolType = "predictor",
  examName = "TG EAPCET",
  authorityName = "TSCHE / APSCHE"
}) {
  const [activeTab, setActiveTab] = useState("steps");
  const guide = GUIDES[toolType] || GUIDES.predictor;

  const resolve = (text) => {
    if (!text) return "";
    return text.replace(/\{examName\}/g, examName).replace(/\{authorityName\}/g, authorityName);
  };

  return (
    <section className="mt-14 w-full rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] via-[#0d0f17] to-black/80 p-6 sm:p-9 backdrop-blur-2xl shadow-2xl relative overflow-hidden text-left">
      {/* Glow backdrop accent */}
      <div className="absolute top-0 right-1/4 -mt-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 mb-2.5">
              <BookOpen size={13} />
              <span>{resolve(guide.badge)}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {resolve(guide.title)}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-400 max-w-3xl leading-relaxed">
              {resolve(guide.subtitle)}
            </p>
          </div>

          {/* Interactive view toggle buttons */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("steps")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${activeTab === 'steps' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              How to Use
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("outcomes")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${activeTab === 'outcomes' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Key Outcomes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("advice")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${activeTab === 'advice' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Strategic Advice
            </button>
          </div>
        </div>

        {/* Tab 1: How to Use (Step by Step) */}
        {activeTab === "steps" && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-purple-300 uppercase tracking-wider">
              <Compass size={14} />
              <span>Step-by-Step Walkthrough</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-7">
              {guide.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5 hover:border-purple-500/30 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-extrabold text-purple-400 bg-purple-500/15 border border-purple-500/25 px-2 py-0.5 rounded-md">
                        {step.number}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">Phase {idx + 1}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mb-2 group-hover:text-purple-200 transition-colors leading-snug">
                      {resolve(step.title)}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {resolve(step.desc)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Outcomes & What to Learn */}
        {activeTab === "outcomes" && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <Sparkles size={14} />
              <span>What You Will Learn &amp; Tool Outcomes</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
              {guide.outcomes.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-cyan-950/20 p-5 hover:border-cyan-500/30 transition-all flex items-start gap-3.5"
                >
                  <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                      {resolve(item.title)}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {resolve(item.desc)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Strategic Advice & How to Use the Data */}
        {activeTab === "advice" && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Lightbulb size={14} />
              <span>How to Apply This Data During Official Counselling</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
              {guide.usageAdvice.map((adv, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-amber-950/20 p-5 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-center gap-2 text-amber-300 mb-2.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <h3 className="text-sm font-bold text-white">
                      {resolve(adv.heading)}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {resolve(adv.text)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROFESSIONAL OFFICIAL DISCLAIMER & NOTICE BOX ─────────────────── */}
        <div className="rounded-2xl border border-amber-500/25 bg-amber-950/20 p-4 sm:p-5 text-left relative overflow-hidden">
          <div className="flex items-start gap-3.5">
            <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 mt-0.5">
              <ShieldAlert size={17} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                  Official Guidance &amp; Trend Simulation Notice
                </h4>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded">
                  Educational Planning Reference
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                The analytics, cutoff distributions, and prediction models on this platform are generated strictly from <strong>previous years&apos; official candidate seat allotment archives</strong> published by state counselling authorities ({resolve(authorityName)}). This tool is designed as an <strong>educational decision-support framework</strong> to help candidates and parents understand counselling mechanics, rank spreads, and category dynamics.
              </p>
              <p className="text-xs text-gray-400 leading-relaxed mt-2">
                <strong>Important:</strong> Because actual seat allotments in any given admission cycle are determined in real-time by total registered candidates, fluctuating student choice patterns, newly added or decommissioned seats, and revised government reservation rules, historical trends cannot guarantee an identical outcome. Students should use these insights as an informed baseline and verify all final deadlines, seat matrices, and notifications directly on the official state admissions portal.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
