export const EXAM_COURSE_GROUPS = {
  "tg-icet": {
    selectorGroups: [
      {
        group: "GROUP MBA",
        branches: [
          { code: "MBA", name: "MASTER OF BUSINESS ADMINISTRATION" },
          { code: "MBT", name: "MBA - TRAVEL AND TOURISM MANAGEMENT / TOURISM AND TRAVEL MANAGEMENT" },
          { code: "MTM", name: "MBA - TECHNOLOGY MANAGEMENT" },
        ],
      },
      {
        group: "GROUP MCA",
        branches: [{ code: "MCA", name: "MASTER OF COMPUTER APPLICATIONS" }],
      },
    ],
    preferenceGroups: [
      { title: "MBA Courses", courses: ["MBA", "MBT", "MTM"] },
      { title: "MCA Courses", courses: ["MCA"] },
    ],
  },

  "tg-eapcet": {
    selectorGroups: [
      {
        group: "ENGINEERING COURSES",
        branches: [
          { code: "CSE", name: "COMPUTER SCIENCE & ENGINEERING" },
          { code: "CSD", name: "CSE (DATA SCIENCE)" },
          { code: "CSM", name: "CSE (ARTIFICIAL INTELLIGENCE & MACHINE LEARNING)" },
          { code: "CSC", name: "CSE (CYBER SECURITY)" },
          { code: "INF", name: "INFORMATION TECHNOLOGY" },
          { code: "ECE", name: "ELECTRONICS & COMMUNICATION ENGINEERING" },
          { code: "EEE", name: "ELECTRICAL & ELECTRONICS ENGINEERING" },
          { code: "CIV", name: "CIVIL ENGINEERING" },
          { code: "MEC", name: "MECHANICAL ENGINEERING" },
          { code: "AIM", name: "ARTIFICIAL INTELLIGENCE & MACHINE LEARNING" },
          { code: "CHE", name: "CHEMICAL ENGINEERING" },
          { code: "MET", name: "METALLURGICAL ENGINEERING" },
          { code: "MIN", name: "MINING ENGINEERING" },
        ],
      },
      {
        group: "PHARMACY & AGRICULTURE COURSES",
        branches: [
          { code: "PHM", name: "B.PHARMACY" },
          { code: "PHR", name: "PHARM-D (DOCTOR OF PHARMACY)" },
        ],
      },
    ],
    preferenceGroups: [
      { title: "CSE — COMPUTER SCIENCE & ENGINEERING", courses: ["CSE"] },
      { title: "CSD — CSE (DATA SCIENCE)", courses: ["CSD"] },
      { title: "CSM — CSE (ARTIFICIAL INTELLIGENCE & MACHINE LEARNING)", courses: ["CSM"] },
      { title: "CSC — CSE (CYBER SECURITY)", courses: ["CSC"] },
      { title: "INF — INFORMATION TECHNOLOGY", courses: ["INF"] },
      { title: "ECE — ELECTRONICS & COMMUNICATION ENGINEERING", courses: ["ECE"] },
      { title: "EEE — ELECTRICAL & ELECTRONICS ENGINEERING", courses: ["EEE"] },
      { title: "CIV — CIVIL ENGINEERING", courses: ["CIV"] },
      { title: "MEC — MECHANICAL ENGINEERING", courses: ["MEC"] },
      { title: "AIM — ARTIFICIAL INTELLIGENCE & MACHINE LEARNING", courses: ["AIM"] },
      { title: "CHE — CHEMICAL ENGINEERING", courses: ["CHE"] },
      { title: "MET — METALLURGICAL ENGINEERING", courses: ["MET"] },
      { title: "MIN — MINING ENGINEERING", courses: ["MIN"] },
      { title: "PHM — B.PHARMACY", courses: ["PHM"] },
      { title: "PHR — PHARM-D (DOCTOR OF PHARMACY)", courses: ["PHR"] },
    ],
  },

  "ap-eapcet": {
    selectorGroups: [
      {
        group: "ENGINEERING COURSES",
        branches: [
          { code: "CSE", name: "COMPUTER SCIENCE & ENGINEERING" },
          { code: "CSD", name: "CSE (DATA SCIENCE)" },
          { code: "CSM", name: "CSE (ARTIFICIAL INTELLIGENCE & MACHINE LEARNING)" },
          { code: "CSC", name: "CSE (CYBER SECURITY)" },
          { code: "INF", name: "INFORMATION TECHNOLOGY" },
          { code: "ECE", name: "ELECTRONICS & COMMUNICATION ENGINEERING" },
          { code: "EEE", name: "ELECTRICAL & ELECTRONICS ENGINEERING" },
          { code: "CIV", name: "CIVIL ENGINEERING" },
          { code: "MEC", name: "MECHANICAL ENGINEERING" },
          { code: "AIM", name: "ARTIFICIAL INTELLIGENCE & MACHINE LEARNING" },
          { code: "CHE", name: "CHEMICAL ENGINEERING" },
          { code: "MET", name: "METALLURGICAL ENGINEERING" },
          { code: "MIN", name: "MINING ENGINEERING" },
        ],
      },
      {
        group: "PHARMACY & AGRICULTURE COURSES",
        branches: [
          { code: "PHM", name: "B.PHARMACY" },
          { code: "PHR", name: "PHARM-D (DOCTOR OF PHARMACY)" },
        ],
      },
    ],
    preferenceGroups: [
      { title: "CSE — COMPUTER SCIENCE & ENGINEERING", courses: ["CSE"] },
      { title: "CSD — CSE (DATA SCIENCE)", courses: ["CSD"] },
      { title: "CSM — CSE (ARTIFICIAL INTELLIGENCE & MACHINE LEARNING)", courses: ["CSM"] },
      { title: "CSC — CSE (CYBER SECURITY)", courses: ["CSC"] },
      { title: "INF — INFORMATION TECHNOLOGY", courses: ["INF"] },
      { title: "ECE — ELECTRONICS & COMMUNICATION ENGINEERING", courses: ["ECE"] },
      { title: "EEE — ELECTRICAL & ELECTRONICS ENGINEERING", courses: ["EEE"] },
      { title: "CIV — CIVIL ENGINEERING", courses: ["CIV"] },
      { title: "MEC — MECHANICAL ENGINEERING", courses: ["MEC"] },
      { title: "AIM — ARTIFICIAL INTELLIGENCE & MACHINE LEARNING", courses: ["AIM"] },
      { title: "CHE — CHEMICAL ENGINEERING", courses: ["CHE"] },
      { title: "MET — METALLURGICAL ENGINEERING", courses: ["MET"] },
      { title: "MIN — MINING ENGINEERING", courses: ["MIN"] },
      { title: "PHM — B.PHARMACY", courses: ["PHM"] },
      { title: "PHR — PHARM-D (DOCTOR OF PHARMACY)", courses: ["PHR"] },
    ],
  },

  "tg-ecet": {
    selectorGroups: [
      {
        group: "DIPLOMA LATERAL ENTRY ENGINEERING",
        branches: [
          { code: "CSE", name: "B.TECH COMPUTER SCIENCE & ENGINEERING" },
          { code: "ECE", name: "B.TECH ELECTRONICS & COMMUNICATION ENGINEERING" },
          { code: "EEE", name: "B.TECH ELECTRICAL & ELECTRONICS ENGINEERING" },
          { code: "CIV", name: "B.TECH CIVIL ENGINEERING" },
          { code: "MEC", name: "B.TECH MECHANICAL ENGINEERING" },
          { code: "INF", name: "B.TECH INFORMATION TECHNOLOGY" },
          { code: "CHE", name: "B.TECH CHEMICAL ENGINEERING" },
          { code: "MET", name: "B.TECH METALLURGICAL ENGINEERING" },
          { code: "MIN", name: "B.TECH MINING ENGINEERING" },
          { code: "EIE", name: "B.TECH ELECTRONICS & INSTRUMENTATION ENGINEERING" },
          { code: "BME", name: "B.TECH BIOMEDICAL ENGINEERING" },
          { code: "BSM", name: "B.TECH (B.SC. MATHEMATICS LATERAL ENTRY)" },
        ],
      },
      {
        group: "DIPLOMA LATERAL ENTRY PHARMACY",
        branches: [{ code: "PHM", name: "B.PHARMACY (LATERAL ENTRY)" }],
      },
    ],
    preferenceGroups: [
      { title: "CSE — B.TECH COMPUTER SCIENCE & ENGINEERING", courses: ["CSE"] },
      { title: "ECE — B.TECH ELECTRONICS & COMMUNICATION ENGINEERING", courses: ["ECE"] },
      { title: "EEE — B.TECH ELECTRICAL & ELECTRONICS ENGINEERING", courses: ["EEE"] },
      { title: "CIV — B.TECH CIVIL ENGINEERING", courses: ["CIV"] },
      { title: "MEC — B.TECH MECHANICAL ENGINEERING", courses: ["MEC"] },
      { title: "INF — B.TECH INFORMATION TECHNOLOGY", courses: ["INF"] },
      { title: "CHE — B.TECH CHEMICAL ENGINEERING", courses: ["CHE"] },
      { title: "MET — B.TECH METALLURGICAL ENGINEERING", courses: ["MET"] },
      { title: "MIN — B.TECH MINING ENGINEERING", courses: ["MIN"] },
      { title: "EIE — B.TECH ELECTRONICS & INSTRUMENTATION ENGINEERING", courses: ["EIE"] },
      { title: "BME — B.TECH BIOMEDICAL ENGINEERING", courses: ["BME"] },
      { title: "BSM — B.TECH (B.SC. MATHEMATICS LATERAL ENTRY)", courses: ["BSM"] },
      { title: "PHM — B.PHARMACY (LATERAL ENTRY)", courses: ["PHM"] },
    ],
  },

  "tg-polycet": {
    selectorGroups: [
      {
        group: "POLYTECHNIC DIPLOMA ENGINEERING COURSES",
        branches: [
          { code: "CE", name: "DIPLOMA IN CIVIL ENGINEERING" },
          { code: "CS", name: "DIPLOMA IN COMPUTER SCIENCE AND ENGINEERING" },
          { code: "EC", name: "DIPLOMA IN ELECTRONICS & COMMUNICATION ENGINEERING" },
          { code: "EE", name: "DIPLOMA IN ELECTRICAL & ELECTRONICS ENGINEERING" },
          { code: "ME", name: "DIPLOMA IN MECHANICAL ENGINEERING" },
          { code: "AI", name: "DIPLOMA IN ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING" },
          { code: "BM", name: "DIPLOMA IN BIOMEDICAL ENGINEERING" },
          { code: "EI", name: "DIPLOMA IN ELECTRONICS & INSTRUMENTATION ENGINEERING" },
          { code: "MN", name: "DIPLOMA IN MINING ENGINEERING" },
          { code: "AU", name: "DIPLOMA IN AUTOMOBILE ENGINEERING" },
          { code: "CCB", name: "DIPLOMA IN CLOUD COMPUTING AND BIG DATA" },
          { code: "CPS", name: "DIPLOMA IN CYBER PHYSICAL SYSTEMS AND SECURITY" },
          { code: "CH", name: "DIPLOMA IN CHEMICAL ENGINEERING" },
          { code: "MT", name: "DIPLOMA IN METALLURGICAL ENGINEERING" },
          { code: "PK", name: "DIPLOMA IN PACKAGING TECHNOLOGY" },
          { code: "EEV", name: "DIPLOMA IN ELECTRICAL ENGINEERING & ELECTRIC VEHICLE TECHNOLOGY" },
          { code: "ES", name: "DIPLOMA IN EMBEDDED SYSTEMS ENGINEERING" },
        ],
      },
      {
        group: "SPECIALIZED & NON-ENGINEERING DIPLOMA COURSES",
        branches: [
          { code: "CCP", name: "DIPLOMA IN COMMERCIAL & COMPUTER PRACTICE" },
          { code: "HS", name: "DIPLOMA IN HOME SCIENCE" },
          { code: "LG", name: "DIPLOMA IN LEATHER GOODS & FOOTWEAR TECHNOLOGY" },
          { code: "LF", name: "DIPLOMA IN LEATHER AND FASHION TECHNOLOGY" },
          { code: "TT", name: "DIPLOMA IN TEXTILE TECHNOLOGY" },
        ],
      },
    ],
    preferenceGroups: [
      { title: "CE — DIPLOMA IN CIVIL ENGINEERING", courses: ["CE"] },
      { title: "CS — DIPLOMA IN COMPUTER SCIENCE AND ENGINEERING", courses: ["CS"] },
      { title: "EC — DIPLOMA IN ELECTRONICS & COMMUNICATION ENGINEERING", courses: ["EC"] },
      { title: "EE — DIPLOMA IN ELECTRICAL & ELECTRONICS ENGINEERING", courses: ["EE"] },
      { title: "ME — DIPLOMA IN MECHANICAL ENGINEERING", courses: ["ME"] },
      { title: "AI — DIPLOMA IN ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING", courses: ["AI"] },
      { title: "BM — DIPLOMA IN BIOMEDICAL ENGINEERING", courses: ["BM"] },
      { title: "EI — DIPLOMA IN ELECTRONICS & INSTRUMENTATION ENGINEERING", courses: ["EI"] },
      { title: "MN — DIPLOMA IN MINING ENGINEERING", courses: ["MN"] },
      { title: "AU — DIPLOMA IN AUTOMOBILE ENGINEERING", courses: ["AU"] },
      { title: "CCB — DIPLOMA IN CLOUD COMPUTING AND BIG DATA", courses: ["CCB"] },
      { title: "CPS — DIPLOMA IN CYBER PHYSICAL SYSTEMS AND SECURITY", courses: ["CPS"] },
      { title: "CH — DIPLOMA IN CHEMICAL ENGINEERING", courses: ["CH"] },
      { title: "MT — DIPLOMA IN METALLURGICAL ENGINEERING", courses: ["MT"] },
      { title: "PK — DIPLOMA IN PACKAGING TECHNOLOGY", courses: ["PK"] },
      { title: "EEV — DIPLOMA IN ELECTRICAL ENGINEERING & ELECTRIC VEHICLE TECHNOLOGY", courses: ["EEV"] },
      { title: "ES — DIPLOMA IN EMBEDDED SYSTEMS ENGINEERING", courses: ["ES"] },
      { title: "CCP — DIPLOMA IN COMMERCIAL & COMPUTER PRACTICE", courses: ["CCP"] },
      { title: "HS — DIPLOMA IN HOME SCIENCE", courses: ["HS"] },
      { title: "LG — DIPLOMA IN LEATHER GOODS & FOOTWEAR TECHNOLOGY", courses: ["LG"] },
      { title: "LF — DIPLOMA IN LEATHER AND FASHION TECHNOLOGY", courses: ["LF"] },
      { title: "TT — DIPLOMA IN TEXTILE TECHNOLOGY", courses: ["TT"] },
    ],
  },
};

export function getExamCourseGroups(examSlug) {
  return (
    EXAM_COURSE_GROUPS[examSlug] || EXAM_COURSE_GROUPS["tg-icet"]
  );
}
