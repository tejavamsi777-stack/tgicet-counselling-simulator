import { createContext, useContext, useMemo, useState } from "react";
import { exams, getExamBySlug } from "../../config/exams";

const ExamContext = createContext(null);

export function AdminExamProvider({ children }) {
  const [selectedExamSlug, setSelectedExamSlug] = useState("tg-icet");
  const selectedExam = useMemo(() => getExamBySlug(selectedExamSlug) || exams[0], [selectedExamSlug]);

  return (
    <ExamContext.Provider value={{ exams, selectedExam, selectedExamSlug, setSelectedExamSlug }}>
      {children}
    </ExamContext.Provider>
  );
}

// This custom hook is intentionally colocated with its provider, matching the
// existing admin-auth context pattern.
// eslint-disable-next-line react-refresh/only-export-components
export function useAdminExam() {
  const context = useContext(ExamContext);
  if (!context) throw new Error("useAdminExam must be used within AdminExamProvider");
  return context;
}
