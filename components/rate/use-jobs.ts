"use client";

import { useCallback, useEffect, useState } from "react";
import { loadAppState, saveAppState } from "@/lib/domain/persistence";
import {
  addJob,
  updateJob,
  type JobRecord,
} from "@/lib/domain/jobs";

export interface UseJobs {
  jobs: JobRecord[];
  hydrated: boolean;
  save: (job: JobRecord) => void;
  change: (id: string, mutate: (job: JobRecord) => JobRecord) => void;
}

/**
 * Saved quotes: read on mount, written only on a user action.
 *
 * Same shape as `useYearPosition`, for the same reason. `useAppState`
 * autosaves on every change, so mounting it on a public page rewrites the
 * stored record on a page view. Here the load is read-only and every write
 * re-reads storage first, so a second tab cannot be clobbered by a stale copy
 * held in this one.
 */
export function useJobs(): UseJobs {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const { state } = loadAppState();
    /* eslint-disable react-hooks/set-state-in-effect */
    setJobs(state.jobs);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const write = useCallback((next: (current: JobRecord[]) => JobRecord[]) => {
    const { state } = loadAppState();
    const updated = next(state.jobs);
    saveAppState({ ...state, jobs: updated });
    setJobs(updated);
  }, []);

  const save = useCallback(
    (job: JobRecord) => write((current) => addJob(current, job)),
    [write]
  );

  const change = useCallback(
    (id: string, mutate: (job: JobRecord) => JobRecord) =>
      write((current) => updateJob(current, id, mutate)),
    [write]
  );

  return { jobs, hydrated, save, change };
}

/** Today as the ISO date the domain layer expects. UI-side by design: the
 * domain never reads the clock, so the reading happens once, here. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
