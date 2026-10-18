import { useContext } from "react";
import { AcademicContext } from "../context/academicContextInstance";

export function useAcademic() {
  const context = useContext(AcademicContext);

  if (!context) {
    throw new Error("useAcademic must be used inside AcademicProvider");
  }

  return context;
}
