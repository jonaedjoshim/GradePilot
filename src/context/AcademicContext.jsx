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
import { backupAcademicData } from "../lib/academic-backup";
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
const RETRY_DELAY = 10000;

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
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };

    case "SET_AI_INSIGHTS":
      return {
        ...state,
        aiInsights: action.payload,
        aiLoading: false,
      };

    case "SET_AI_LOADING":
      return {
        ...state,
        aiLoading: action.payload,
      };

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

  const stateRef = useRef(state);
  const revisionRef = useRef(null);
  const lastSavedRef = useRef(null);

  const syncReadyRef = useRef(false);
  const savingRef = useRef(false);
  const mountedRef = useRef(false);
  const initializedRef = useRef(false);
  const conflictRef = useRef(false);

  const generationRef = useRef(0);
  const retryTimerRef = useRef(null);
  const saveTimerRef = useRef(null);
  const saveRequestedRef = useRef(false);
  const offlineRef = useRef(false);
  const manualSyncRef = useRef(false);
  const syncPromptRef = useRef(false);
  const initializationRef = useRef(false);

  const hadUserLocalRef = useRef(
    userId ? hasSavedAcademicState(userId) : false,
  );

  const initialSignatureRef = useRef(getDataSignature(state));

  stateRef.current = state;

  const updateSyncReady = useCallback((ready) => {
    syncReadyRef.current = ready;
    setSyncReady(ready);
  }, []);

  const updateSyncPrompt = useCallback((open) => {
    syncPromptRef.current = open;
    setSyncPrompt(open);
  }, []);

  const clearSaveTimer = useCallback(() => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      generationRef.current += 1;

      clearSaveTimer();
      clearRetryTimer();
    };
  }, [clearSaveTimer, clearRetryTimer]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  useEffect(() => {
    if (!userId) {
      saveAcademicState(state);
      return;
    }

    if (!initializedRef.current) {
      return;
    }

    saveAcademicState(state, userId);
  }, [state, userId]);

  const preserveCurrentLocal = useCallback(
    (reason) => {
      if (!userId) {
        return true;
      }

      const current = stateRef.current;

      const saved = backupAcademicData(userId, getSyncData(current), reason);

      if (!saved) {
        toast.error(
          "Unable to back up local records. Cloud data was not loaded.",
          { id: "gradepilot-sync" },
        );
      }

      return saved;
    },
    [userId],
  );

  const loadCloudState = useCallback(
    (record, preserveLocal = false) => {
      if (!record) {
        return false;
      }

      if (preserveLocal && !preserveCurrentLocal("cloud-selection")) {
        return false;
      }

      clearSaveTimer();
      clearRetryTimer();

      const normalized = validateAcademicState(
        record.data,
        createInitialState(),
      );

      revisionRef.current = record.revision;
      lastSavedRef.current = getDataSignature(normalized);

      stateRef.current = normalized;

      initializedRef.current = true;
      saveRequestedRef.current = false;
      offlineRef.current = false;
      conflictRef.current = false;

      dispatch({
        type: "LOAD_STATE",
        payload: normalized,
      });

      saveAcademicState(normalized, userId);

      setCloudRecord(record);
      updateSyncPrompt(false);
      setSyncStatus("saved");

      updateSyncReady(true);

      return true;
    },
    [
      userId,
      preserveCurrentLocal,
      clearSaveTimer,
      clearRetryTimer,
      updateSyncReady,
      updateSyncPrompt,
    ],
  );

  const refreshCloudRecord = useCallback(async () => {
    const result = await academicApi.get();

    const record = result.record;

    if (!mountedRef.current) {
      return record;
    }

    setCloudRecord(record);
    revisionRef.current = record?.revision ?? null;

    return record;
  }, []);

  useEffect(() => {
    if (!userId || initializationRef.current) {
      return;
    }

    initializationRef.current = true;

    let cancelled = false;

    async function initializeSync() {
      setSyncStatus("checking");

      try {
        const result = await academicApi.get();

        if (cancelled || !mountedRef.current) {
          return;
        }

        const record = result.record;

        setCloudRecord(record);
        revisionRef.current = record?.revision ?? null;

        const hasUserLocal = hadUserLocalRef.current;
        const hasGuestLocal = hasSavedAcademicState();

        if (record) {
          if (hasUserLocal || hasGuestLocal) {
            updateSyncPrompt(true);
            setSyncStatus("pending");
            return;
          }

          loadCloudState(record);
          return;
        }

        updateSyncPrompt(true);
        setSyncStatus("pending");
      } catch {
        if (cancelled || !mountedRef.current) {
          return;
        }

        setSyncStatus("offline");
        updateSyncReady(false);
      }
    }

    initializeSync();

    return () => {
      cancelled = true;
      initializationRef.current = false;
    };
  }, [userId, loadCloudState, updateSyncReady, updateSyncPrompt]);

  const activateCloudData = useCallback(async () => {
    if (manualSyncRef.current || !cloudRecord) {
      return;
    }

    manualSyncRef.current = true;
    setSyncBusy(true);

    try {
      const latest = await refreshCloudRecord();

      if (!latest) {
        setSyncStatus("pending");

        toast.error("Cloud records are no longer available.", {
          id: "gradepilot-sync",
        });

        return;
      }

      const localSignature = getDataSignature(stateRef.current);
      const cloudSignature = getDataSignature(
        validateAcademicState(latest.data, createInitialState()),
      );

      const shouldBackup =
        hadUserLocalRef.current ||
        initializedRef.current ||
        localSignature !== initialSignatureRef.current;

      const loaded = loadCloudState(
        latest,
        shouldBackup && localSignature !== cloudSignature,
      );

      if (!loaded) {
        setSyncStatus("pending");
        return;
      }

      toast.success("Cloud records loaded successfully", {
        id: "gradepilot-sync",
      });
    } catch {
      setSyncStatus("offline");

      toast.error("Unable to load cloud records.", {
        id: "gradepilot-sync",
      });
    } finally {
      manualSyncRef.current = false;
      setSyncBusy(false);
    }
  }, [cloudRecord, refreshCloudRecord, loadCloudState]);

  const activateLocalData = useCallback(async () => {
    if (manualSyncRef.current) {
      return;
    }

    manualSyncRef.current = true;
    setSyncBusy(true);

    try {
      const guestAvailable = hasSavedAcademicState();
      const userAvailable = hadUserLocalRef.current;

      let source = stateRef.current;

      if (guestAvailable && userAvailable) {
        const choice = await Swal.fire({
          title: "Choose local records",
          text: "Which local academic records would you like to use?",
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: "Guest Data",
          denyButtonText: "Account Data",
          confirmButtonColor: "#4f46e5",
        });

        if (choice.isDismissed) {
          return;
        }

        source = choice.isConfirmed
          ? loadAcademicState(createInitialState())
          : loadAcademicState(createInitialState(), userId);
      } else if (guestAvailable && !userAvailable) {
        source = loadAcademicState(createInitialState());
      }

      setSyncStatus("checking");

      const latest = await refreshCloudRecord();

      if (latest) {
        const confirmation = await Swal.fire({
          title: "Replace cloud records?",
          text: "This will replace your current cloud academic data with the selected local version.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Replace Cloud Data",
          confirmButtonColor: "#4f46e5",
          cancelButtonColor: "#64748b",
        });

        if (!confirmation.isConfirmed) {
          setSyncStatus("pending");
          return;
        }
      }

      setSyncStatus("saving");

      const result = latest
        ? await academicApi.update(getSyncData(source), latest.revision)
        : await academicApi.create(getSyncData(source));

      loadCloudState(result.record);

      toast.success("Academic data synced successfully", {
        id: "gradepilot-sync",
      });
    } catch (error) {
      if (error.status === 409) {
        updateSyncReady(false);
        updateSyncPrompt(true);
        setSyncStatus("pending");

        toast.error(
          "Cloud records changed. Please review the latest version.",
          { id: "gradepilot-sync" },
        );
      } else {
        setSyncStatus("offline");

        toast.error(error.message, {
          id: "gradepilot-sync",
        });
      }
    } finally {
      manualSyncRef.current = false;
      setSyncBusy(false);
    }
  }, [
    userId,
    refreshCloudRecord,
    loadCloudState,
    updateSyncReady,
    updateSyncPrompt,
  ]);

  const handleConflict = useCallback(async () => {
    if (conflictRef.current) {
      return;
    }

    conflictRef.current = true;

    clearSaveTimer();
    clearRetryTimer();

    updateSyncReady(false);
    setSyncStatus("pending");

    try {
      await refreshCloudRecord();

      if (!mountedRef.current) {
        return;
      }

      updateSyncPrompt(true);

      toast.error(
        "Cloud data changed on another device. Choose which version to keep.",
        { id: "gradepilot-sync" },
      );
    } catch {
      if (!mountedRef.current) {
        return;
      }

      setSyncStatus("offline");

      toast.error(
        "Unable to check the latest cloud records. Local changes are preserved.",
        { id: "gradepilot-sync" },
      );
    } finally {
      conflictRef.current = false;
    }
  }, [
    clearSaveTimer,
    clearRetryTimer,
    refreshCloudRecord,
    updateSyncReady,
    updateSyncPrompt,
  ]);

  const performSaveRef = useRef(null);

  const performSave = useCallback(async () => {
    if (
      !userId ||
      !mountedRef.current ||
      !syncReadyRef.current ||
      savingRef.current ||
      conflictRef.current ||
      manualSyncRef.current
    ) {
      return;
    }

    const snapshot = stateRef.current;
    const signature = getDataSignature(snapshot);

    if (signature === lastSavedRef.current) {
      saveRequestedRef.current = false;
      offlineRef.current = false;
      setSyncStatus("saved");
      return;
    }

    if (!Number.isSafeInteger(revisionRef.current)) {
      await handleConflict();
      return;
    }

    savingRef.current = true;
    saveRequestedRef.current = false;

    clearRetryTimer();
    setSyncStatus("saving");

    const generation = generationRef.current;

    try {
      const result = await academicApi.update(
        getSyncData(snapshot),
        revisionRef.current,
      );

      if (!mountedRef.current || generation !== generationRef.current) {
        return;
      }

      revisionRef.current = result.record.revision;
      lastSavedRef.current = signature;

      offlineRef.current = false;

      setCloudRecord(result.record);

      if (getDataSignature(stateRef.current) === signature) {
        setSyncStatus("saved");
      } else {
        saveRequestedRef.current = true;
        setSyncStatus("saving");
      }
    } catch (error) {
      if (!mountedRef.current || generation !== generationRef.current) {
        return;
      }

      if (error.status === 409) {
        await handleConflict();
        return;
      }

      if (error.status === 401 || error.status === 403) {
        updateSyncReady(false);
        setSyncStatus("pending");

        toast.error("Your session expired. Please sign in again.", {
          id: "gradepilot-sync",
        });

        return;
      }

      offlineRef.current = true;
      saveRequestedRef.current = true;

      setSyncStatus("offline");

      clearRetryTimer();

      retryTimerRef.current = window.setTimeout(() => {
        retryTimerRef.current = null;

        if (mountedRef.current && syncReadyRef.current) {
          performSaveRef.current?.();
        }
      }, RETRY_DELAY);
    } finally {
      savingRef.current = false;

      if (
        mountedRef.current &&
        generation === generationRef.current &&
        syncReadyRef.current &&
        saveRequestedRef.current &&
        !offlineRef.current &&
        retryTimerRef.current === null
      ) {
        clearSaveTimer();

        saveTimerRef.current = window.setTimeout(() => {
          saveTimerRef.current = null;
          performSaveRef.current?.();
        }, SYNC_DELAY);
      }
    }
  }, [
    userId,
    handleConflict,
    clearRetryTimer,
    clearSaveTimer,
    updateSyncReady,
  ]);

  performSaveRef.current = performSave;

  useEffect(() => {
    if (!userId || !syncReady) {
      return;
    }

    const signature = getDataSignature(state);

    if (signature === lastSavedRef.current) {
      return;
    }

    saveRequestedRef.current = true;

    if (savingRef.current || manualSyncRef.current) {
      return;
    }

    if (offlineRef.current && retryTimerRef.current !== null) {
      return;
    }

    clearSaveTimer();

    setSyncStatus(offlineRef.current ? "offline" : "saving");

    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      performSaveRef.current?.();
    }, SYNC_DELAY);

    return () => {
      clearSaveTimer();
    };
  }, [state, userId, syncReady, clearSaveTimer]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const handleOnline = () => {
      if (!syncReadyRef.current) {
        return;
      }

      clearRetryTimer();
      clearSaveTimer();

      offlineRef.current = false;

      saveTimerRef.current = window.setTimeout(() => {
        saveTimerRef.current = null;
        performSaveRef.current?.();
      }, 500);
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [userId, clearSaveTimer, clearRetryTimer]);

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
        onClose={() => updateSyncPrompt(false)}
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
