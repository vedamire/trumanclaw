"use client";

import { INITIAL_BALANCE } from "@/lib/gameLogic";

const GUEST_STORAGE_KEY = "trumanclaw_guest_state_v1";

export type GuestGrimBet = {
  id: string;
  prediction: "higher" | "lower";
  amount: number;
  snapshotDeathCount?: number;
  expiresAt: number;
  createdAt: number;
};

export type GuestGrimConcludedBet = GuestGrimBet & {
  resolveDeathCount?: number;
  won: boolean | null;
  payout: number;
};

export type GuestMirageBet = {
  id: string;
  prediction: "yeah" | "nah";
  amount: number;
  expiresAt: number;
  createdAt: number;
};

export type GuestMirageConcludedBet = GuestMirageBet & {
  won: boolean;
  payout: number;
};

export type GuestState = {
  balance: number;
  grimBets: {
    active: GuestGrimBet[];
    concluded: GuestGrimConcludedBet[];
  };
  mirageBets: {
    active: GuestMirageBet[];
    concluded: GuestMirageConcludedBet[];
  };
};

const DEFAULT_GUEST_STATE: GuestState = {
  balance: INITIAL_BALANCE,
  grimBets: { active: [], concluded: [] },
  mirageBets: { active: [], concluded: [] },
};

const isBrowser = () => typeof window !== "undefined";

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isArray = Array.isArray;

const coerceGuestState = (raw: unknown): GuestState => {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_GUEST_STATE };
  }

  const record = raw as Partial<GuestState>;

  return {
    balance: isNumber(record.balance) ? record.balance : INITIAL_BALANCE,
    grimBets: {
      active: isArray(record.grimBets?.active) ? (record.grimBets?.active as GuestGrimBet[]) : [],
      concluded: isArray(record.grimBets?.concluded)
        ? (record.grimBets?.concluded as GuestGrimConcludedBet[])
        : [],
    },
    mirageBets: {
      active: isArray(record.mirageBets?.active) ? (record.mirageBets?.active as GuestMirageBet[]) : [],
      concluded: isArray(record.mirageBets?.concluded)
        ? (record.mirageBets?.concluded as GuestMirageConcludedBet[])
        : [],
    },
  };
};

export const loadGuestState = (): GuestState => {
  if (!isBrowser()) {
    return { ...DEFAULT_GUEST_STATE };
  }

  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_GUEST_STATE };
    }
    const parsed = JSON.parse(raw);
    return coerceGuestState(parsed);
  } catch {
    return { ...DEFAULT_GUEST_STATE };
  }
};

export const saveGuestState = (state: GuestState) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors in dev/demo flows.
  }
};

export const clearGuestState = () => {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {
    // Ignore storage errors in dev/demo flows.
  }
};
