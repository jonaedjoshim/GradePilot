import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { DEFAULT_SUBJECT } from "../data/gradeData";
import {
  DEFAULT_UNIVERSITY,
  getDefaultAcademicPeriod,
  isValidUniversity,
} from "../data/universityData";
import { calculateCGPA } from "../lib/calculations";
import { academicApi } from "../lib/academic-api";
import { useSession } from "../lib/auth-client";
import { AcademicContext } from "./academicContextInstance";
import {
  hasSavedAcademicState,
  loadAcademicState,
  saveAcademicState,
  validateAcademicState,
} from "../lib/storage";
import AcademicSyncModal from "../components/auth/AcademicSyncModal";
import AcademicSyncStatus from "../components/auth/AcademicSyncStatus";

const SYNC_DELAY = 1500;

function createSubject(university) {
  return {
    ...DEFAULT_SUBJECT(),
    yearSemester: getDefaultAcademicPeriod(university),
  };
}

function createInitialState() {
  return {
    university: DEFAULT_UNIVERSITY,
    subjects: [
      createSubject(DEFAULT_UNIVERSITY),
      createSubject(DEFAULT_UNIVERSITY),
      createSubject(DEFAULT_UNIVERSITY),
    ],
    previousCGPA: "",
    previousCredits: "",
    targetCGPA: "",
    remainingCredits: "",
    universityProfiles: {},
    theme: "light",
    sidebarCollapsed: false,
    aiInsights: null,
    aiLoading: false,
  };
}

function getCurrentProfile(state) {
  return {
    subjects: state.subjects,
    previousCGPA: state.previousCGPA,
    previousCredits: state.previousCredits,
    targetCGPA: state.targetCGPA,
    remainingCredits: state.remainingCredits,
  };
}

function createEmptyProfile(university) {
  return {
    subjects: [
      createSubject(university),
      createSubject(university),
      createSubject(university),
    ],
    previousCGPA: "",
    previousCredits: "",
    targetCGPA: "",
    remainingCredits: "",
  };
}

function academicReducer(state, action) {
  switch (action.type) {
    case "SET_UNIVERSITY": {
      const nextUniversity = action.payload;

      if (
        !isValidUniversity(nextUniversity) ||
        nextUniversity === state.university
      ) {
        return state;
      }

      const profiles = {
        ...state.universityProfiles,
        [state.university]: getCurrentProfile(state),
      };

      const nextProfile =
        profiles[nextUniversity] ?? createEmptyProfile(nextUniversity);

      return {
        ...state,
        ...nextProfile,
        university: nextUniversity,
        universityProfiles: profiles,
        aiInsights: null,
        aiLoading: false,
      };
    }

    case "SET_SUBJECTS":
      return {
        ...state,
        subjects: action.payload,
      };

    case "ADD_SUBJECT":
      return {
        ...state,
        subjects: [...state.subjects, createSubject(state.university)],
      };

    case "ADD_SUBJECT_WITH_DATA":
      return {
        ...state,
        subjects: [...state.subjects, action.payload],
      };

    case "REMOVE_SUBJECT":
      return {
        ...state,
        subjects: state.subjects.filter(
          (subject) => subject.id !== action.payload,
        ),
      };

    case "UPDATE_SUBJECT":
      return {
        ...state,
        subjects: state.subjects.map((subject) =>
          subject.id === action.payload.id
            ? { ...subject, ...action.payload.data }
            : subject,
        ),
      };

    case "SET_PREVIOUS_CGPA":
      return { ...state, previousCGPA: action.payload };

    case "SET_PREVIOUS_CREDITS":
      return { ...state, previousCredits: action.payload };

    case "SET_TARGET_CGPA":
      return { ...state, targetCGPA: action.payload };

    case "SET_REMAINING_CREDITS":
      return { ...state, remainingCredits: action.payload };

    case "TOGGLE_THEME":
      return {
        ...state,
        theme: state.theme === "light" ? "dark" : "light",
      };

    case "SET_THEME":
      return { ...state, theme: action.payload };

    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case "SET_AI_INSIGHTS":
      return {
        ...state,
        aiInsights: action.payload,
        aiLoading: false,
      };

    case "SET_AI_LOADING":
      return { ...state, aiLoading: action.payload };

    case "LOAD_STATE":
      return validateAcademicState(action.payload, createInitialState());

    case "RESET":
      return {
        ...state,
        ...createEmptyProfile(state.university),
        aiInsights: null,
        aiLoading: false,
      };

    default:
      return state;
  }
}

function getSyncData(state) {
  return {
    university: state.university,
    subjects: state.subjects,
    previousCGPA: state.previousCGPA,
    previousCredits: state.previousCredits,
    targetCGPA: state.targetCGPA,
    remainingCredits: state.remainingCredits,
    universityProfiles: state.universityProfiles,
    theme: state.theme,
    sidebarCollapsed: state.sidebarCollapsed,
  };
}

function getDataSignature(state) {
  return JSON.stringify(getSyncData(state));
}

function AcademicWorkspaceProvider({ children, userId }) {
  const [state, dispatch] = useReducer(academicReducer, userId, (id) =>
    loadAcademicState(createInitialState(), id),
  );

  const [syncStatus, setSyncStatus] = useState(userId ? "checking" : "pending");

  const [syncReady, setSyncReady] = useState(false);
  const [syncPrompt, setSyncPrompt] = useState(false);
  const [cloudRecord, setCloudRecord] = useState(null);
  const [syncBusy, setSyncBusy] = useState(false);

  const revisionRef = useRef(null);
  const lastSavedRef = useRef(null);
  const syncReadyRef = useRef(false);
  const savingRef = useRef(false);
  const stateRef = useRef(state);
  const mountedRef = useRef(true);
  const generationRef = useRef(0);

  stateRef.current = state;

  const updateSyncReady = useCallback((ready) => {
    syncReadyRef.current = ready;
    setSyncReady(ready);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  useEffect(() => {
    saveAcademicState(state, userId);
  }, [state, userId]);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function initializeSync() {
      setSyncStatus("checking");

      try {
        const result = await academicApi.get();

        if (cancelled) return;

        const record = result.record;

        setCloudRecord(record);
        revisionRef.current = record?.updatedAt ?? null;

        const hasUserLocal = hasSavedAcademicState(userId);
        const hasGuestLocal = hasSavedAcademicState();

        if (record) {
          if (hasUserLocal || hasGuestLocal) {
            setSyncPrompt(true);
            setSyncStatus("pending");
            return;
          }

          const normalized = validateAcademicState(
            record.data,
            createInitialState(),
          );

          dispatch({ type: "LOAD_STATE", payload: normalized });

          lastSavedRef.current = getDataSignature(normalized);
          updateSyncReady(true);
          setSyncStatus("saved");

          return;
        }

        if (hasUserLocal || hasGuestLocal) {
          setSyncPrompt(true);
          setSyncStatus("pending");
          return;
        }

        setSyncPrompt(true);
        setSyncStatus("pending");
      } catch {
        if (cancelled) return;

        setSyncStatus("offline");
        updateSyncReady(false);
      }
    }

    initializeSync();

    return () => {
      cancelled = true;
    };
  }, [userId, updateSyncReady]);

  const activateCloudData = useCallback(() => {
    if (!cloudRecord) return;

    const normalized = validateAcademicState(
      cloudRecord.data,
      createInitialState(),
    );

    dispatch({ type: "LOAD_STATE", payload: normalized });

    lastSavedRef.current = getDataSignature(normalized);
    revisionRef.current = cloudRecord.updatedAt;

    updateSyncReady(true);
    setSyncPrompt(false);
    setSyncStatus("saved");
  }, [cloudRecord, updateSyncReady]);

  const activateLocalData = useCallback(async () => {
    if (syncBusy) return;

    const guestAvailable = hasSavedAcademicState();
    const userAvailable = hasSavedAcademicState(userId);

    let source = stateRef.current;

    if (guestAvailable && userAvailable) {
      const choice = await Swal.fire({
        title: "Choose local records",
        text: "Which device data would you like to use?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Guest Data",
        denyButtonText: "Account Data",
        confirmButtonColor: "#4f46e5",
      });

      if (choice.isDismissed) return;

      source = choice.isConfirmed
        ? loadAcademicState(createInitialState())
        : loadAcademicState(createInitialState(), userId);
    } else if (guestAvailable) {
      source = loadAcademicState(createInitialState());
    }

    if (cloudRecord) {
      const confirmation = await Swal.fire({
        title: "Replace cloud records?",
        text: "Your current cloud academic records will be replaced by the selected local version. Continue only if this is what you want.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Replace Cloud Data",
        confirmButtonColor: "#4f46e5",
        cancelButtonColor: "#64748b",
      });

      if (!confirmation.isConfirmed) return;
    }

    setSyncBusy(true);
    setSyncStatus("saving");

    try {
      const data = getSyncData(source);

      const result = cloudRecord
        ? await academicApi.update(data, cloudRecord.updatedAt)
        : await academicApi.create(data);

      const normalized = validateAcademicState(
        result.record.data,
        createInitialState(),
      );

      dispatch({ type: "LOAD_STATE", payload: normalized });

      setCloudRecord(result.record);
      revisionRef.current = result.record.updatedAt;
      lastSavedRef.current = getDataSignature(normalized);

      updateSyncReady(true);
      setSyncPrompt(false);
      setSyncStatus("saved");

      toast.success("Academic data synced successfully", {
        id: "gradepilot-sync",
      });
    } catch (error) {
      setSyncStatus(error.status === 409 ? "pending" : "offline");

      toast.error(
        error.status === 409
          ? "Cloud data changed. Reload to review the latest version."
          : error.message,
        { id: "gradepilot-sync" },
      );
    } finally {
      setSyncBusy(false);
    }
  }, [cloudRecord, syncBusy, updateSyncReady, userId]);

  useEffect(() => {
    if (!userId || !syncReady) return;

    const signature = getDataSignature(state);

    if (signature === lastSavedRef.current) {
      return;
    }

    setSyncStatus("saving");

    const timeout = window.setTimeout(async () => {
      if (!syncReadyRef.current || savingRef.current) return;

      savingRef.current = true;

      const generation = generationRef.current;
      const snapshot = stateRef.current;
      const snapshotSignature = getDataSignature(snapshot);

      try {
        const result = await academicApi.update(
          getSyncData(snapshot),
          revisionRef.current,
        );

        if (!mountedRef.current || generation !== generationRef.current) {
          return;
        }

        revisionRef.current = result.record.updatedAt;
        lastSavedRef.current = snapshotSignature;

        setSyncStatus(
          getDataSignature(stateRef.current) === snapshotSignature
            ? "saved"
            : "saving",
        );
      } catch (error) {
        if (!mountedRef.current || generation !== generationRef.current) {
          return;
        }

        if (error.status === 409) {
          updateSyncReady(false);
          setSyncStatus("pending");

          toast.error("Cloud data changed. Automatic saving has been paused.", {
            id: "gradepilot-sync",
          });
        } else {
          setSyncStatus("offline");
        }
      } finally {
        savingRef.current = false;
      }
    }, SYNC_DELAY);

    return () => window.clearTimeout(timeout);
  }, [state, userId, syncReady, updateSyncReady]);

  const computed = useMemo(
    () =>
      calculateCGPA(state.subjects, state.previousCGPA, state.previousCredits),
    [state.subjects, state.previousCGPA, state.previousCredits],
  );

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      computed,
      syncStatus,
    }),
    [state, computed, syncStatus],
  );

  return (
    <AcademicContext.Provider value={contextValue}>
      {children}

      {userId && (
        <div className="fixed bottom-5 right-5 z-40">
          <AcademicSyncStatus status={syncStatus} />
        </div>
      )}

      <AcademicSyncModal
        open={syncPrompt}
        localAvailable
        cloudAvailable={Boolean(cloudRecord)}
        busy={syncBusy}
        onUseCloud={activateCloudData}
        onKeepLocal={activateLocalData}
        onClose={() => setSyncPrompt(false)}
      />
    </AcademicContext.Provider>
  );
}

export function AcademicProvider({ children }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--gp-bg)" }}
      >
        <div
          className="size-10 animate-spin rounded-full border-4 border-t-transparent"
          style={{
            borderColor: "var(--gp-border)",
            borderTopColor: "var(--gp-primary)",
          }}
        />
      </div>
    );
  }

  const userId = session?.user?.id ?? null;

  return (
    <AcademicWorkspaceProvider key={userId ?? "guest"} userId={userId}>
      {children}
    </AcademicWorkspaceProvider>
  );
}
