"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { Header } from "@/components/Header";
import { DeathCounter } from "@/components/DeathCounter";
import { BettingPanel } from "@/components/BettingPanel";
import { MirageSubject } from "@/components/MirageSubject";
import { MirageBettingPanel, type MiragePrediction } from "@/components/MirageBettingPanel";
import { Mirage2Subject } from "@/components/Mirage2Subject";
import { Mirage2BettingPanel, type Mirage2Prediction } from "@/components/Mirage2BettingPanel";
import { Mirage3Subject } from "@/components/Mirage3Subject";
import { Mirage3BettingPanel, type Mirage3Prediction } from "@/components/Mirage3BettingPanel";
import { Mirage4Subject, type Mirage4Prediction } from "@/components/Mirage4Subject";
import { Mirage5Subject, type Mirage5Prediction } from "@/components/Mirage5Subject";
import { Mirage7Subject, type Mirage7Prediction } from "@/components/Mirage7Subject";
import { Mirage8Subject, type Mirage8Prediction } from "@/components/Mirage8Subject";
import { Mirage10Subject, type Mirage10Prediction } from "@/components/Mirage10Subject";
import { AuthModal } from "@/components/AuthModal";
import { FallingTVs } from "@/components/FallingTVs";
import {
  getTodayDate,
  getYesterdayDate,
  generateDeathCount,
} from "@/lib/mockData";
import {
  INITIAL_BALANCE,
  formatCurrency,
  type Prediction,
} from "@/lib/gameLogic";
import {
  loadGuestState,
  saveGuestState,
  type GuestState,
  type GuestGrimBet,
  type GuestGrimConcludedBet,
  type GuestMirageBet,
  type GuestMirageConcludedBet,
} from "@/lib/guestStorage";

// Check if we're in Mirage mode
const isMirageMode = process.env.NEXT_PUBLIC_APP_MODE === "mirage";
const isMirage2Mode = process.env.NEXT_PUBLIC_APP_MODE === "mirage2";
const isMirage3Mode = process.env.NEXT_PUBLIC_APP_MODE === "mirage3";
const isMirage4Mode = process.env.NEXT_PUBLIC_APP_MODE === "mirage4";
const isMirage5Mode = process.env.NEXT_PUBLIC_APP_MODE === "mirage5";
const isMirage7Mode = process.env.NEXT_PUBLIC_APP_MODE === "mirage7";
const isMirage8Mode = process.env.NEXT_PUBLIC_APP_MODE === "mirage8";
const isMirage9Mode = process.env.NEXT_PUBLIC_APP_MODE === "mirage9";
const isMirage10Mode = process.env.NEXT_PUBLIC_APP_MODE === "mirage10";

// Mirage9 game cycle type
type Mirage9Game = "mirage5" | "mirage7" | "mirage8";

// Helper to get next game in the cycle
const getNextMirage9Game = (current: Mirage9Game): Mirage9Game => {
  const cycle: Mirage9Game[] = ["mirage5", "mirage7", "mirage8"];
  const currentIndex = cycle.indexOf(current);
  return cycle[(currentIndex + 1) % 3];
};

// Mirage bet duration: 3 days in milliseconds
const MIRAGE_BET_DURATION = 3 * 24 * 60 * 60 * 1000;

// Mirage2 video paths
const DECIDING_VIDEO = "/videos/deciding_video.webm";
const CONCLUSION_VIDEO = "/videos/conclusion_video.webm";

// Mirage4 video paths
const MIRAGE4_BEGINNING_VIDEO = "/videos/mirage4_beginning.webm";
const MIRAGE4_CONCLUSION_VIDEO = "/videos/mirage4_conclusion.webm";

// Mirage5 video paths
const MIRAGE5_BEGINNING_VIDEO = "/videos/mirage5_beginning.webm";
const MIRAGE5_CONCLUSION_VIDEO = "/videos/mirage5_conclusion.webm";
const MIRAGE5_CRASH_CONCLUSION_VIDEO = "/videos/mirage5_crash_conclusion.webm";

// Mirage7 video paths
const MIRAGE7_INTRO_VIDEO = "/videos/mirage7_intro.webm";
const MIRAGE7_CONCLUSION_VIDEO = "/videos/mirage7_conclusion.webm";

// Mirage8 video paths
const MIRAGE8_INTRO_VIDEO = "/videos/mirage8_intro.webm";
const MIRAGE8_CONCLUSION_VIDEO = "/videos/mirage8_conclusion.webm";

// Mirage10 video paths
const MIRAGE10_INTRO_VIDEO = "/videos/mirage10_intro.webm";
const MIRAGE10_CONCLUSION_VIDEO = "/videos/mirage10_conclusion.webm";

export default function GrimMarket() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: "win" | "loss" | "push";
    message: string;
    amount: number;
  } | null>(null);
  const [guestState, setGuestState] = useState<GuestState>(() => loadGuestState());

  // Mirage2 state
  const [mirage2Phase, setMirage2Phase] = useState<"deciding" | "conclusion" | "result">("deciding");
  const [mirage2Bet, setMirage2Bet] = useState<{ prediction: Mirage2Prediction; amount: number } | null>(null);
  const [mirage2LastResult, setMirage2LastResult] = useState<{ won: boolean; amount: number; payout: number } | null>(null);
  const [mirage2Balance, setMirage2Balance] = useState<number>(INITIAL_BALANCE);

  // Mirage3 state (uses InstantDB for balance persistence)
  const [mirage3Phase, setMirage3Phase] = useState<"deciding" | "conclusion" | "result" | "publish">("deciding");
  const [mirage3Bet, setMirage3Bet] = useState<{ prediction: Mirage3Prediction; amount: number } | null>(null);
  const [mirage3LastResult, setMirage3LastResult] = useState<{ won: boolean; amount: number; payout: number } | null>(null);
  const [showPostedConfirmation, setShowPostedConfirmation] = useState(false);

  // Mirage4 state (uses InstantDB for balance persistence)
  const [mirage4Phase, setMirage4Phase] = useState<"deciding" | "conclusion" | "result">("deciding");
  const [mirage4Bet, setMirage4Bet] = useState<{ prediction: Mirage4Prediction } | null>(null);
  const [mirage4LastResult, setMirage4LastResult] = useState<{ won: boolean; amount: number } | null>(null);

  // Mirage5 state (uses InstantDB for balance persistence)
  const [mirage5Phase, setMirage5Phase] = useState<"deciding" | "conclusion" | "result">("deciding");
  const [mirage5Bet, setMirage5Bet] = useState<{ prediction: Mirage5Prediction; outcome: Mirage5Prediction } | null>(null);
  const [mirage5LastResult, setMirage5LastResult] = useState<{ won: boolean; amount: number } | null>(null);

  // Mirage7 state (uses InstantDB for balance persistence) - plane crash game
  const [mirage7Phase, setMirage7Phase] = useState<"deciding" | "conclusion" | "result">("deciding");
  const [mirage7Bet, setMirage7Bet] = useState<{ prediction: Mirage7Prediction } | null>(null);
  const [mirage7LastResult, setMirage7LastResult] = useState<{ won: boolean; amount: number } | null>(null);

  // Mirage8 state (uses InstantDB for balance persistence) - boat missile game
  const [mirage8Phase, setMirage8Phase] = useState<"deciding" | "conclusion" | "result">("deciding");
  const [mirage8Bet, setMirage8Bet] = useState<{ prediction: Mirage8Prediction } | null>(null);
  const [mirage8LastResult, setMirage8LastResult] = useState<{ won: boolean; amount: number } | null>(null);

  // Mirage9 state - cycles through mirage5, mirage7, mirage8
  const [mirage9CurrentGame, setMirage9CurrentGame] = useState<Mirage9Game>("mirage5");
  const [mirage9Phase, setMirage9Phase] = useState<"deciding" | "conclusion" | "result">("deciding");
  const [mirage9Bet, setMirage9Bet] = useState<{
    prediction: Mirage5Prediction | Mirage7Prediction | Mirage8Prediction;
    outcome?: Mirage5Prediction; // Only used for mirage5's random outcome
  } | null>(null);
  const [mirage9LastResult, setMirage9LastResult] = useState<{ won: boolean; amount: number } | null>(null);

  // Mirage10 state (uses InstantDB for balance persistence) - bush or shaved game
  const [mirage10Phase, setMirage10Phase] = useState<"deciding" | "conclusion" | "result">("deciding");
  const [mirage10Bet, setMirage10Bet] = useState<{ prediction: Mirage10Prediction } | null>(null);
  const [mirage10LastResult, setMirage10LastResult] = useState<{ won: boolean; amount: number } | null>(null);

  // Mirage9 help modal state
  const [showMirage9Help, setShowMirage9Help] = useState(true);

  // Auth state
  const { isLoading: authLoading, user, error: authError } = db.useAuth();
  const isGuest = !user;

  // Persist guest state in localStorage
  useEffect(() => {
    saveGuestState(guestState);
  }, [guestState]);

  // Get today's date
  const todayDate = getTodayDate();
  const yesterdayDate = getYesterdayDate();

  // Query daily stats
  const { isLoading: statsLoading, data: statsData } = db.useQuery({
    dailyStats: {
      $: { where: { date: { $in: [todayDate, yesterdayDate] } } },
    },
  });

  // Query user data including bets (only meaningful when logged in)
  const { isLoading: userDataLoading, data: userData } = db.useQuery({
    $users: {
      $: { where: { id: user?.id ?? "__no_user__" } },
      bets: {
        $: { order: { createdAt: "desc" } },
      },
    },
  });

  // Get all user bets
  const allUserBets = userData?.$users?.[0]?.bets ?? [];

  const dataLoading = authLoading || statsLoading;

  // Get today's stat
  const todayStat = statsData?.dailyStats?.find((s) => s.date === todayDate);
  const yesterdayStat = statsData?.dailyStats?.find((s) => s.date === yesterdayDate);

  // Filter bets by type based on current mode
  const currentBetType = isMirageMode ? "mirage" : "grim";
  const modeBets = allUserBets.filter((bet) => {
    // Handle legacy bets without betType (assume they are grim bets)
    const betType = bet.betType ?? "grim";
    return betType === currentBetType;
  });

  // Split bets into active (unresolved) and concluded (resolved)
  const activeBets = modeBets
    .filter((bet) => !bet.isResolved)
    .map((bet) => ({
      id: bet.id,
      prediction: bet.prediction,
      amount: bet.amount,
      snapshotDeathCount: bet.snapshotDeathCount,
      expiresAt: bet.expiresAt,
      createdAt: bet.createdAt,
    }));

  const concludedBets = modeBets
    .filter((bet) => bet.isResolved)
    .slice(0, 10) // Only show last 10
    .map((bet) => ({
      id: bet.id,
      prediction: bet.prediction,
      amount: bet.amount,
      snapshotDeathCount: bet.snapshotDeathCount,
      resolveDeathCount: bet.resolveDeathCount,
      won: bet.won,
      payout: bet.payout,
      createdAt: bet.createdAt,
    }));

  // User's balance (default to INITIAL_BALANCE)
  const userBalance = userData?.$users?.[0]?.balance ?? INITIAL_BALANCE;
  const guestGrimActiveBets = guestState.grimBets.active as GuestGrimBet[];
  const guestGrimConcludedBets = guestState.grimBets.concluded
    .slice(0, 10) as GuestGrimConcludedBet[];
  const guestMirageActiveBets = guestState.mirageBets.active as GuestMirageBet[];
  const guestMirageConcludedBets = guestState.mirageBets.concluded
    .slice(0, 10) as GuestMirageConcludedBet[];
  const displayBalance = isGuest ? guestState.balance : userBalance;
  const mirage2DisplayBalance = isGuest ? guestState.balance : mirage2Balance;
  const displayActiveBets = isGuest
    ? currentBetType === "grim"
      ? guestGrimActiveBets
      : guestMirageActiveBets
    : activeBets;
  const displayConcludedBets = isGuest
    ? currentBetType === "grim"
      ? guestGrimConcludedBets
      : guestMirageConcludedBets
    : concludedBets;

  // Poll backend every second to update death count and resolve bets
  // InstantDB will push updates to all connected clients
  useEffect(() => {
    const updateAndResolveBets = async () => {
      try {
        // Update death count
        await fetch("/api/daily-stats");
        // Resolve any expired bets
        await fetch("/api/resolve-bets", { method: "POST" });
      } catch {
        // Ignore errors - will retry next interval
      }
    };

    // Initial fetch
    updateAndResolveBets();

    // Poll every second for real-time updates
    const interval = setInterval(updateAndResolveBets, 1000);

    return () => clearInterval(interval);
  }, []);

  // Resolve guest bets locally
  useEffect(() => {
    if (!isGuest) return;

    const interval = setInterval(() => {
      const currentDeathCount = todayStat?.deathCount;
      const now = Date.now();

      setGuestState((prev) => {
        let nextBalance = prev.balance;
        let grimUpdated = false;
        let mirageUpdated = false;

        const grimActive: GuestGrimBet[] = [];
        const grimConcluded: GuestGrimConcludedBet[] = [...prev.grimBets.concluded];

        for (const bet of prev.grimBets.active) {
          if (bet.expiresAt > now || currentDeathCount === undefined) {
            grimActive.push(bet);
            continue;
          }

          const snapshotCount = bet.snapshotDeathCount ?? 0;
          let won: boolean | null = null;
          let payout = 0;

          if (currentDeathCount === snapshotCount) {
            won = null;
            payout = bet.amount;
          } else if (
            (bet.prediction === "higher" && currentDeathCount > snapshotCount) ||
            (bet.prediction === "lower" && currentDeathCount < snapshotCount)
          ) {
            won = true;
            payout = bet.amount * 2;
          } else {
            won = false;
            payout = 0;
          }

          if (payout > 0) {
            nextBalance += payout;
          }

          grimConcluded.unshift({
            ...bet,
            resolveDeathCount: currentDeathCount,
            won,
            payout,
          });
          grimUpdated = true;
        }

        const mirageActive: GuestMirageBet[] = [];
        const mirageConcluded: GuestMirageConcludedBet[] = [...prev.mirageBets.concluded];

        for (const bet of prev.mirageBets.active) {
          if (bet.expiresAt > now) {
            mirageActive.push(bet);
            continue;
          }

          const subjectSurvived = Math.random() >= 0.5;
          const won =
            (bet.prediction === "yeah" && subjectSurvived) ||
            (bet.prediction === "nah" && !subjectSurvived);
          const payout = won ? bet.amount * 2 : 0;

          if (payout > 0) {
            nextBalance += payout;
          }

          mirageConcluded.unshift({
            ...bet,
            won,
            payout,
          });
          mirageUpdated = true;
        }

        if (!grimUpdated && !mirageUpdated) {
          return prev;
        }

        return {
          ...prev,
          balance: nextBalance,
          grimBets: {
            active: grimActive,
            concluded: grimConcluded.slice(0, 50),
          },
          mirageBets: {
            active: mirageActive,
            concluded: mirageConcluded.slice(0, 50),
          },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGuest, todayStat?.deathCount, setGuestState]);

  // Initialize user balance on first login
  useEffect(() => {
    if (user && userBalance === undefined) {
      db.transact(
        db.tx.$users[user.id].update({
          balance: INITIAL_BALANCE,
          totalWins: 0,
          totalLosses: 0,
          createdAt: Date.now(),
        })
      );
    }
  }, [user, userBalance]);

  // Handle placing a grim bet (higher/lower)
  const handlePlaceBet = async (prediction: Prediction, amount: number) => {
    if (isGuest) {
      if (amount > guestState.balance) {
        return;
      }

      const betId = id();
      const now = Date.now();
      const currentDeathCount = todayStat?.deathCount ?? generateDeathCount(todayDate);

      setGuestState((prev) => ({
        ...prev,
        balance: prev.balance - amount,
        grimBets: {
          active: [
            {
              id: betId,
              prediction,
              amount,
              snapshotDeathCount: currentDeathCount,
              expiresAt: now + 5000,
              createdAt: now,
            },
            ...prev.grimBets.active,
          ],
          concluded: prev.grimBets.concluded,
        },
      }));
      return;
    }

    if (!user || amount > userBalance) {
      return;
    }

    // Create bet and deduct balance, snapshot current death count
    const betId = id();
    const now = Date.now();
    const currentDeathCount = todayStat?.deathCount ?? generateDeathCount(todayDate);
    await db.transact([
      db.tx.bets[betId]
        .update({
          amount,
          prediction,
          betType: "grim",
          expiresAt: now + 5000, // Bet resolves in 5 seconds
          snapshotDeathCount: currentDeathCount,
          isResolved: false,
          createdAt: now,
        })
        .link({ user: user.id }),
      db.tx.$users[user.id].update({
        balance: userBalance - amount,
      }),
    ]);
  };

  // Handle placing a mirage bet (yeah/nah)
  const handlePlaceMirageBet = async (prediction: MiragePrediction, amount: number) => {
    if (isGuest) {
      if (amount > guestState.balance) {
        return;
      }

      const betId = id();
      const now = Date.now();

      setGuestState((prev) => ({
        ...prev,
        balance: prev.balance - amount,
        mirageBets: {
          active: [
            {
              id: betId,
              prediction,
              amount,
              expiresAt: now + MIRAGE_BET_DURATION,
              createdAt: now,
            },
            ...prev.mirageBets.active,
          ],
          concluded: prev.mirageBets.concluded,
        },
      }));
      return;
    }

    if (!user || amount > userBalance) {
      return;
    }

    // Create mirage bet and deduct balance
    const betId = id();
    const now = Date.now();
    await db.transact([
      db.tx.bets[betId]
        .update({
          amount,
          prediction,
          betType: "mirage",
          expiresAt: now + MIRAGE_BET_DURATION, // Bet resolves in 3 days
          isResolved: false,
          createdAt: now,
        })
        .link({ user: user.id }),
      db.tx.$users[user.id].update({
        balance: userBalance - amount,
      }),
    ]);
  };

  // Handle placing a mirage2 bet (wife/mom/money)
  const handlePlaceMirage2Bet = (prediction: Mirage2Prediction, amount: number) => {
    if (isGuest) {
      if (amount > guestState.balance) {
        return;
      }

      setGuestState((prev) => ({
        ...prev,
        balance: prev.balance - amount,
      }));
      setMirage2Bet({ prediction, amount });
      setMirage2Phase("conclusion");
      return;
    }

    if (amount > mirage2Balance) {
      return;
    }

    // Deduct balance immediately
    setMirage2Balance((prev) => prev - amount);
    setMirage2Bet({ prediction, amount });
    setMirage2Phase("conclusion");
  };

  // Handle mirage2 video ended (conclusion video finished)
  const handleMirage2VideoEnded = () => {
    if (mirage2Phase === "conclusion" && mirage2Bet) {
      // Resolve the bet: "mom" always wins
      const won = mirage2Bet.prediction === "mom";
      const payout = won ? mirage2Bet.amount * 2 : 0;

      if (won) {
        if (isGuest) {
          setGuestState((prev) => ({
            ...prev,
            balance: prev.balance + payout,
          }));
        } else {
          setMirage2Balance((prev) => prev + payout);
        }
      }

      setMirage2LastResult({
        won,
        amount: mirage2Bet.amount,
        payout,
      });
      setMirage2Phase("result");
    } else if (mirage2Phase === "result") {
      // Reset back to deciding
      setMirage2Bet(null);
      setMirage2LastResult(null);
      setMirage2Phase("deciding");
    }
  };

  // Handle placing a mirage3 bet (wife/mom/money) - uses InstantDB for balance
  const handlePlaceMirage3Bet = async (prediction: Mirage3Prediction, amount: number) => {
    if (isGuest) {
      if (amount > guestState.balance) {
        return;
      }

      setGuestState((prev) => ({
        ...prev,
        balance: prev.balance - amount,
      }));
      setMirage3Bet({ prediction, amount });
      setMirage3Phase("conclusion");
      return;
    }

    if (!user || amount > userBalance) {
      return;
    }

    // Deduct balance from InstantDB
    await db.transact(
      db.tx.$users[user.id].update({ balance: userBalance - amount })
    );

    setMirage3Bet({ prediction, amount });
    setMirage3Phase("conclusion");
  };

  // Handle mirage3 video ended (conclusion video finished)
  const handleMirage3VideoEnded = () => {
    if (mirage3Phase === "conclusion" && mirage3Bet) {
      // Resolve the bet: "mom" always wins
      const won = mirage3Bet.prediction === "mom";
      const payout = won ? mirage3Bet.amount * 2 : 0;

      if (won) {
        if (isGuest) {
          setGuestState((prev) => ({
            ...prev,
            balance: prev.balance + payout,
          }));
        } else if (user) {
          // Add payout to InstantDB balance
          db.transact(
            db.tx.$users[user.id].update({ balance: userBalance + payout })
          );
        }
      }

      setMirage3LastResult({
        won,
        amount: mirage3Bet.amount,
        payout,
      });
      setMirage3Phase("result");
    } else if (mirage3Phase === "result") {
      // Transition to publish phase instead of resetting
      setMirage3Phase("publish");
    }
  };

  // Handle "Posted" button click - adds $100 bonus
  const handlePosted = async () => {
    if (isGuest) {
      setGuestState((prev) => ({
        ...prev,
        balance: prev.balance + 100,
      }));
    } else if (user) {
      // Add $100 bonus to InstantDB balance
      await db.transact(
        db.tx.$users[user.id].update({ balance: userBalance + 100 })
      );
    }

    setShowPostedConfirmation(true);

    // After 3 seconds, reset to deciding phase
    setTimeout(() => {
      setShowPostedConfirmation(false);
      setMirage3Bet(null);
      setMirage3LastResult(null);
      setMirage3Phase("deciding");
    }, 3000);
  };

  // Handle placing a mirage4 bet (lambo/toyota) - fixed $100 bet
  const handlePlaceMirage4Bet = async (prediction: Mirage4Prediction) => {
    if (isGuest) {
      if (guestState.balance < 100) {
        return;
      }

      setGuestState((prev) => ({
        ...prev,
        balance: prev.balance - 100,
      }));
      setMirage4Bet({ prediction });
      setMirage4Phase("conclusion");
      return;
    }

    if (!user || userBalance < 100) {
      return;
    }

    // Deduct $100 from InstantDB balance
    await db.transact(
      db.tx.$users[user.id].update({ balance: userBalance - 100 })
    );

    setMirage4Bet({ prediction });
    setMirage4Phase("conclusion");
  };

  // Handle mirage4 video ended (conclusion video finished)
  const handleMirage4VideoEnded = () => {
    if (mirage4Phase === "conclusion" && mirage4Bet) {
      // Resolve the bet: "toyota" always wins
      const won = mirage4Bet.prediction === "toyota";
      const payout = won ? 200 : 0; // 2x payout

      if (won) {
        if (isGuest) {
          setGuestState((prev) => ({
            ...prev,
            balance: prev.balance + payout,
          }));
        } else if (user) {
          // Add $200 payout to InstantDB balance
          db.transact(
            db.tx.$users[user.id].update({ balance: userBalance + payout })
          );
        }
      }

      setMirage4LastResult({
        won,
        amount: 100,
      });
      setMirage4Phase("result");

      // Auto-reset after 3 seconds
      setTimeout(() => {
        setMirage4Bet(null);
        setMirage4LastResult(null);
        setMirage4Phase("deciding");
      }, 3000);
    }
  };

  // Handle placing a mirage5 bet (crash/land) - fixed $100 bet
  const handlePlaceMirage5Bet = async (prediction: Mirage5Prediction) => {
    if (isGuest) {
      if (guestState.balance < 100) {
        return;
      }

      setGuestState((prev) => ({
        ...prev,
        balance: prev.balance - 100,
      }));

      // Generate random outcome (50/50)
      const outcome: Mirage5Prediction = Math.random() < 0.5 ? "crash" : "land";

      setMirage5Bet({ prediction, outcome });
      setMirage5Phase("conclusion");
      return;
    }

    if (!user || userBalance < 100) {
      return;
    }

    // Deduct $100 from InstantDB balance
    await db.transact(
      db.tx.$users[user.id].update({ balance: userBalance - 100 })
    );

    // Generate random outcome (50/50)
    const outcome: Mirage5Prediction = Math.random() < 0.5 ? "crash" : "land";

    setMirage5Bet({ prediction, outcome });
    setMirage5Phase("conclusion");
  };

  // Handle mirage5 video ended (conclusion video finished)
  const handleMirage5VideoEnded = () => {
    if (mirage5Phase === "conclusion" && mirage5Bet) {
      // User wins if their prediction matches the random outcome
      const won = mirage5Bet.prediction === mirage5Bet.outcome;
      const payout = won ? 200 : 0; // 2x payout

      if (won) {
        if (isGuest) {
          setGuestState((prev) => ({
            ...prev,
            balance: prev.balance + payout,
          }));
        } else if (user) {
          // Add $200 payout to InstantDB balance
          db.transact(
            db.tx.$users[user.id].update({ balance: userBalance + payout })
          );
        }
      }

      setMirage5LastResult({
        won,
        amount: 100,
      });
      setMirage5Phase("result");

      // Auto-reset after 3 seconds
      setTimeout(() => {
        setMirage5Bet(null);
        setMirage5LastResult(null);
        setMirage5Phase("deciding");
      }, 3000);
    }
  };

  // Handle placing a mirage7 bet (crash/land) - fixed $100 bet, crash always wins
  const handlePlaceMirage7Bet = async (prediction: Mirage7Prediction) => {
    if (isGuest) {
      if (guestState.balance < 100) {
        return;
      }

      setGuestState((prev) => ({
        ...prev,
        balance: prev.balance - 100,
      }));
      setMirage7Bet({ prediction });
      setMirage7Phase("conclusion");
      return;
    }

    if (!user || userBalance < 100) {
      return;
    }

    // Deduct $100 from InstantDB balance
    await db.transact(
      db.tx.$users[user.id].update({ balance: userBalance - 100 })
    );

    setMirage7Bet({ prediction });
    setMirage7Phase("conclusion");
  };

  // Handle mirage7 video ended (conclusion video finished)
  const handleMirage7VideoEnded = () => {
    if (mirage7Phase === "conclusion" && mirage7Bet) {
      // Crash always wins (plane always crashes in the conclusion video)
      const won = mirage7Bet.prediction === "crash";
      const payout = won ? 200 : 0; // 2x payout

      if (won) {
        if (isGuest) {
          setGuestState((prev) => ({
            ...prev,
            balance: prev.balance + payout,
          }));
        } else if (user) {
          // Add $200 payout to InstantDB balance
          db.transact(
            db.tx.$users[user.id].update({ balance: userBalance + payout })
          );
        }
      }

      setMirage7LastResult({
        won,
        amount: 100,
      });
      setMirage7Phase("result");

      // Auto-reset after 3 seconds
      setTimeout(() => {
        setMirage7Bet(null);
        setMirage7LastResult(null);
        setMirage7Phase("deciding");
      }, 3000);
    }
  };

  // Handle placing a mirage8 bet (hit/miss) - fixed $100 bet, hit always wins
  const handlePlaceMirage8Bet = async (prediction: Mirage8Prediction) => {
    if (isGuest) {
      if (guestState.balance < 100) {
        return;
      }

      setGuestState((prev) => ({
        ...prev,
        balance: prev.balance - 100,
      }));
      setMirage8Bet({ prediction });
      setMirage8Phase("conclusion");
      return;
    }

    if (!user || userBalance < 100) {
      return;
    }

    // Deduct $100 from InstantDB balance
    await db.transact(
      db.tx.$users[user.id].update({ balance: userBalance - 100 })
    );

    setMirage8Bet({ prediction });
    setMirage8Phase("conclusion");
  };

  // Handle mirage8 video ended (conclusion video finished)
  const handleMirage8VideoEnded = () => {
    if (mirage8Phase === "conclusion" && mirage8Bet) {
      // Hit always wins (missile always hits the boat in the conclusion video)
      const won = mirage8Bet.prediction === "hit";
      const payout = won ? 200 : 0; // 2x payout

      if (won) {
        if (isGuest) {
          setGuestState((prev) => ({
            ...prev,
            balance: prev.balance + payout,
          }));
        } else if (user) {
          // Add $200 payout to InstantDB balance
          db.transact(
            db.tx.$users[user.id].update({ balance: userBalance + payout })
          );
        }
      }

      setMirage8LastResult({
        won,
        amount: 100,
      });
      setMirage8Phase("result");

      // Auto-reset after 3 seconds
      setTimeout(() => {
        setMirage8Bet(null);
        setMirage8LastResult(null);
        setMirage8Phase("deciding");
      }, 3000);
    }
  };

  // Handle placing a mirage9 bet - routes to appropriate game logic based on current game
  const handlePlaceMirage9Bet = async (prediction: Mirage5Prediction | Mirage7Prediction | Mirage8Prediction) => {
    if (isGuest) {
      if (guestState.balance < 100) {
        return;
      }
      setGuestState((prev) => ({
        ...prev,
        balance: prev.balance - 100,
      }));
    } else {
      if (!user || userBalance < 100) {
        return;
      }

      // Deduct $100 from InstantDB balance
      await db.transact(
        db.tx.$users[user.id].update({ balance: userBalance - 100 })
      );
    }

    if (mirage9CurrentGame === "mirage5") {
      // Generate random outcome for mirage5 (50/50)
      const outcome: Mirage5Prediction = Math.random() < 0.5 ? "crash" : "land";
      setMirage9Bet({ prediction: prediction as Mirage5Prediction, outcome });
    } else {
      // mirage7 and mirage8 have fixed outcomes
      setMirage9Bet({ prediction });
    }
    setMirage9Phase("conclusion");
  };

  // Handle mirage9 video ended (conclusion video finished)
  const handleMirage9VideoEnded = () => {
    if (mirage9Phase === "conclusion" && mirage9Bet) {
      let won = false;

      if (mirage9CurrentGame === "mirage5") {
        // User wins if their prediction matches the random outcome
        won = mirage9Bet.prediction === mirage9Bet.outcome;
      } else if (mirage9CurrentGame === "mirage7") {
        // Crash always wins (plane always crashes)
        won = mirage9Bet.prediction === "crash";
      } else if (mirage9CurrentGame === "mirage8") {
        // Hit always wins (missile always hits)
        won = mirage9Bet.prediction === "hit";
      }

      const payout = won ? 200 : 0; // 2x payout

      if (won) {
        if (isGuest) {
          setGuestState((prev) => ({
            ...prev,
            balance: prev.balance + payout,
          }));
        } else if (user) {
          // Add $200 payout to InstantDB balance
          db.transact(
            db.tx.$users[user.id].update({ balance: userBalance + payout })
          );
        }
      }

      setMirage9LastResult({
        won,
        amount: 100,
      });
      setMirage9Phase("result");

      // After showing result for 2 seconds, transition to next game
      setTimeout(() => {
        setMirage9Bet(null);
        setMirage9LastResult(null);
        setMirage9CurrentGame(getNextMirage9Game(mirage9CurrentGame));
        setMirage9Phase("deciding");
      }, 2000);
    }
  };

  // Handle placing a mirage10 bet (bush/shaved) - fixed $100 bet, shaved always wins
  const handlePlaceMirage10Bet = async (prediction: Mirage10Prediction) => {
    if (isGuest) {
      if (guestState.balance < 100) {
        return;
      }

      setGuestState((prev) => ({
        ...prev,
        balance: prev.balance - 100,
      }));
    } else {
      if (!user || userBalance < 100) {
        return;
      }

      // Deduct $100 from InstantDB balance
      await db.transact(
        db.tx.$users[user.id].update({ balance: userBalance - 100 })
      );
    }

    setMirage10Bet({ prediction });
    setMirage10Phase("conclusion");
  };

  // Handle mirage10 video ended (conclusion video finished)
  const handleMirage10VideoEnded = () => {
    if (mirage10Phase === "conclusion" && mirage10Bet) {
      // Shaved always wins (answer is always shaved in the conclusion video)
      const won = mirage10Bet.prediction === "shaved";
      const payout = won ? 200 : 0; // 2x payout

      if (won) {
        if (isGuest) {
          setGuestState((prev) => ({
            ...prev,
            balance: prev.balance + payout,
          }));
        } else if (user) {
          // Add $200 payout to InstantDB balance
          db.transact(
            db.tx.$users[user.id].update({ balance: userBalance + payout })
          );
        }
      }

      setMirage10LastResult({
        won,
        amount: 100,
      });
      setMirage10Phase("result");

      // Auto-reset after 3 seconds
      setTimeout(() => {
        setMirage10Bet(null);
        setMirage10LastResult(null);
        setMirage10Phase("deciding");
      }, 3000);
    }
  };

  // Handle logout
  const handleLogout = () => {
    db.auth.signOut();
  };

  // Show notification then hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Loading state
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <SkullLoader />
          <p className="text-gray-500 mt-4 text-[10px] uppercase tracking-wider">
            {isMirage10Mode ? "Loading Mirage 10..." : isMirage9Mode ? "Loading Mirage 9..." : isMirage8Mode ? "Loading Mirage 8..." : isMirage7Mode ? "Loading Mirage 7..." : isMirage5Mode ? "Loading Mirage 5..." : isMirage4Mode ? "Loading Mirage 4..." : isMirage3Mode ? "Loading Mirage 3..." : isMirage2Mode ? "Loading Mirage 2..." : isMirageMode ? "Loading Mirage..." : "Loading Trumanclaw..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-xs uppercase">Error: {authError.message}</p>
        </div>
      </div>
    );
  }

  const todayCount = todayStat?.deathCount ?? generateDeathCount(todayDate);
  const yesterdayCount = yesterdayStat?.deathCount;

  return (
    <div className="min-h-screen text-white">
      {/* Background overlay for readability */}
      <div className="fixed inset-0 bg-black/40 pointer-events-none" />

      {/* Falling TVs animation */}
      {isMirage9Mode && (
        <FallingTVs variant="sides" sideWidthPercent={12} autoSideWidth zIndex={55} />
      )}

      {/* Header - compact in mirage9 fullscreen mode */}
      <Header
        user={user ? { id: user.id, email: user.email, balance: isMirage2Mode ? mirage2Balance : userBalance } : null}
        onLoginClick={() => setShowAuthModal(true)}
        onLogoutClick={handleLogout}
        compact={isMirage9Mode}
      />

      {/* Mirage7 mode content */}
      {isMirage7Mode && (
        <main className="relative max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8 z-10">
          {/* Mirage7 video subject with overlay buttons */}
          <div className="mb-6 sm:mb-12">
            <Mirage7Subject
              videoSrc={
                mirage7Phase === "deciding"
                  ? MIRAGE7_INTRO_VIDEO
                  : MIRAGE7_CONCLUSION_VIDEO
              }
              isLooping={mirage7Phase === "deciding"}
              onEnded={handleMirage7VideoEnded}
              phase={mirage7Phase}
              onPlaceBet={handlePlaceMirage7Bet}
              disabled={false}
              currentBet={mirage7Bet}
              lastResult={mirage7LastResult}
            />
          </div>

          {/* Login prompt for non-logged in users */}
          {!user && (
            <div className="max-w-md mx-auto mb-8">
              <div className="pixel-panel p-6 text-center">
                <p className="text-gray-400 text-sm mb-4">Sign in to save your progress</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold text-xs pixel-btn border-gray-700 transition-all"
                >
                  SIGN IN
                </button>
              </div>
            </div>
          )}

          {/* Balance display for logged in users */}
          {user && (
            <div className="max-w-md mx-auto mb-8">
              <div className="pixel-panel p-4 text-center">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Your Balance</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(userBalance)}</p>
              </div>
            </div>
          )}

          {/* How it works - Mirage7 */}
          <div className="mt-16 text-center w-[85%] mx-auto">
            <h3 className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">1</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Watch the plane and bet $100: Will it CRASH or LAND?
                </p>
              </div>
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">2</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Click your prediction and watch the conclusion play out
                </p>
              </div>
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">3</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Win 2x ($200) if you guess correctly!
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Mirage8 mode content */}
      {isMirage8Mode && (
        <main className="relative max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8 z-10">
          {/* Mirage8 video subject with overlay buttons */}
          <div className="mb-6 sm:mb-12">
            <Mirage8Subject
              videoSrc={
                mirage8Phase === "deciding"
                  ? MIRAGE8_INTRO_VIDEO
                  : MIRAGE8_CONCLUSION_VIDEO
              }
              isLooping={mirage8Phase === "deciding"}
              onEnded={handleMirage8VideoEnded}
              phase={mirage8Phase}
              onPlaceBet={handlePlaceMirage8Bet}
              disabled={false}
              currentBet={mirage8Bet}
              lastResult={mirage8LastResult}
            />
          </div>

          {/* Login prompt for non-logged in users */}
          {!user && (
            <div className="max-w-md mx-auto mb-8">
              <div className="pixel-panel p-6 text-center">
                <p className="text-gray-400 text-sm mb-4">Sign in to save your progress</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold text-xs pixel-btn border-gray-700 transition-all"
                >
                  SIGN IN
                </button>
              </div>
            </div>
          )}

          {/* Balance display for logged in users */}
          {user && (
            <div className="max-w-md mx-auto mb-8">
              <div className="pixel-panel p-4 text-center">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Your Balance</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(userBalance)}</p>
              </div>
            </div>
          )}

          {/* How it works - Mirage8 */}
          <div className="mt-16 text-center w-[85%] mx-auto">
            <h3 className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">1</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Watch the boat and bet $100: Will the missile HIT or MISS?
                </p>
              </div>
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">2</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Click your prediction and watch the conclusion play out
                </p>
              </div>
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">3</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Win 2x ($200) if you guess correctly!
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Mirage9 mode content - TikTok-style fullscreen */}
      {isMirage9Mode && (
        <>
          {/* Help modal */}
          {showMirage9Help && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
              <div className="pixel-panel-white p-6 max-w-md">
                <h3 className="text-black font-bold text-lg mb-4">How It Works</h3>
                <div className="space-y-3 text-gray-700 text-sm">
                  <p><span className="font-bold">1.</span> Cycle through 3 games: Car Stunt, Plane, Boat</p>
                  <p><span className="font-bold">2.</span> Bet $100 on each outcome</p>
                  <p><span className="font-bold">3.</span> Win 2x ($200) if you guess correctly!</p>
                </div>
                <button
                  onClick={() => setShowMirage9Help(false)}
                  className="mt-6 w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm pixel-btn border-gray-900 transition-all"
                >
                  GOT IT
                </button>
              </div>
            </div>
          )}

          {/* Fullscreen video subjects */}
          {mirage9CurrentGame === "mirage5" && (
            <Mirage5Subject
              videoSrc={
                mirage9Phase === "deciding"
                  ? MIRAGE5_BEGINNING_VIDEO
                  : mirage9Bet?.outcome === "crash"
                    ? MIRAGE5_CRASH_CONCLUSION_VIDEO
                    : MIRAGE5_CONCLUSION_VIDEO
              }
              isLooping={mirage9Phase === "deciding"}
              onEnded={handleMirage9VideoEnded}
              phase={mirage9Phase}
              onPlaceBet={handlePlaceMirage9Bet as (prediction: Mirage5Prediction) => void}
              disabled={false}
              currentBet={mirage9Bet && mirage9Bet.outcome ? { prediction: mirage9Bet.prediction as Mirage5Prediction, outcome: mirage9Bet.outcome } : null}
              lastResult={mirage9LastResult}
              outcome={mirage9Bet?.outcome ?? null}
              fullscreen={true}
              onShowHelp={() => setShowMirage9Help(true)}
            />
          )}
          {mirage9CurrentGame === "mirage7" && (
            <Mirage7Subject
              videoSrc={
                mirage9Phase === "deciding"
                  ? MIRAGE7_INTRO_VIDEO
                  : MIRAGE7_CONCLUSION_VIDEO
              }
              isLooping={mirage9Phase === "deciding"}
              onEnded={handleMirage9VideoEnded}
              phase={mirage9Phase}
              onPlaceBet={handlePlaceMirage9Bet as (prediction: Mirage7Prediction) => void}
              disabled={false}
              currentBet={mirage9Bet ? { prediction: mirage9Bet.prediction as Mirage7Prediction } : null}
              lastResult={mirage9LastResult}
              fullscreen={true}
              onShowHelp={() => setShowMirage9Help(true)}
            />
          )}
          {mirage9CurrentGame === "mirage8" && (
            <Mirage8Subject
              videoSrc={
                mirage9Phase === "deciding"
                  ? MIRAGE8_INTRO_VIDEO
                  : MIRAGE8_CONCLUSION_VIDEO
              }
              isLooping={mirage9Phase === "deciding"}
              onEnded={handleMirage9VideoEnded}
              phase={mirage9Phase}
              onPlaceBet={handlePlaceMirage9Bet as (prediction: Mirage8Prediction) => void}
              disabled={false}
              currentBet={mirage9Bet ? { prediction: mirage9Bet.prediction as Mirage8Prediction } : null}
              lastResult={mirage9LastResult}
              fullscreen={true}
              onShowHelp={() => setShowMirage9Help(true)}
            />
          )}
        </>
      )}

      {/* Mirage10 mode content */}
      {isMirage10Mode && (
        <main className="relative max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8 z-10">
          {/* Mirage10 video subject with overlay buttons */}
          <div className="mb-6 sm:mb-12">
            <Mirage10Subject
              videoSrc={
                mirage10Phase === "deciding"
                  ? MIRAGE10_INTRO_VIDEO
                  : MIRAGE10_CONCLUSION_VIDEO
              }
              isLooping={mirage10Phase === "deciding"}
              onEnded={handleMirage10VideoEnded}
              phase={mirage10Phase}
              onPlaceBet={handlePlaceMirage10Bet}
              disabled={false}
              currentBet={mirage10Bet}
              lastResult={mirage10LastResult}
            />
          </div>

          {/* Login prompt for non-logged in users */}
          {!user && (
            <div className="max-w-md mx-auto mb-8">
              <div className="pixel-panel p-6 text-center">
                <p className="text-gray-400 text-sm mb-4">Sign in to save your progress</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold text-xs pixel-btn border-gray-700 transition-all"
                >
                  SIGN IN
                </button>
              </div>
            </div>
          )}

          {/* Balance display for logged in users */}
          {user && (
            <div className="max-w-md mx-auto mb-8">
              <div className="pixel-panel p-4 text-center">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Your Balance</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(userBalance)}</p>
              </div>
            </div>
          )}

          {/* How it works - Mirage10 */}
          <div className="mt-16 text-center w-[85%] mx-auto">
            <h3 className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">1</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Watch the video and bet $100: BUSH or SHAVED?
                </p>
              </div>
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">2</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Click your prediction and watch the conclusion play out
                </p>
              </div>
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">3</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Win 2x ($200) if you guess correctly!
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Mirage5 mode content */}
      {isMirage5Mode && (
        <main className="relative max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8 z-10">
          {/* Mirage5 video subject with overlay buttons */}
          <div className="mb-6 sm:mb-12">
            <Mirage5Subject
              videoSrc={
                mirage5Phase === "deciding"
                  ? MIRAGE5_BEGINNING_VIDEO
                  : mirage5Bet?.outcome === "crash"
                    ? MIRAGE5_CRASH_CONCLUSION_VIDEO
                    : MIRAGE5_CONCLUSION_VIDEO
              }
              isLooping={mirage5Phase === "deciding"}
              onEnded={handleMirage5VideoEnded}
              phase={mirage5Phase}
              onPlaceBet={handlePlaceMirage5Bet}
              disabled={false}
              currentBet={mirage5Bet}
              lastResult={mirage5LastResult}
              outcome={mirage5Bet?.outcome ?? null}
            />
          </div>

          {/* Login prompt for non-logged in users */}
          {!user && (
            <div className="max-w-md mx-auto mb-8">
              <div className="pixel-panel p-6 text-center">
                <p className="text-gray-400 text-sm mb-4">Sign in to save your progress</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold text-xs pixel-btn border-gray-700 transition-all"
                >
                  SIGN IN
                </button>
              </div>
            </div>
          )}

          {/* Balance display for logged in users */}
          {user && (
            <div className="max-w-md mx-auto mb-8">
              <div className="pixel-panel p-4 text-center">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Your Balance</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(userBalance)}</p>
              </div>
            </div>
          )}

          {/* How it works - Mirage5 */}
          <div className="mt-16 text-center w-[85%] mx-auto">
            <h3 className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-green-500">1</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Watch the car stunt and bet $100: Will it CRASH or LAND?
                </p>
              </div>
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-green-500">2</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Click your prediction and watch the conclusion play out
                </p>
              </div>
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-green-500">3</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Win 2x ($200) if you guess correctly!
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Mirage4 mode content */}
      {isMirage4Mode && (
        <main className="relative max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8 z-10">
          {/* Mirage4 video subject with overlay buttons */}
          <div className="mb-6 sm:mb-12">
            <Mirage4Subject
              videoSrc={mirage4Phase === "deciding" ? MIRAGE4_BEGINNING_VIDEO : MIRAGE4_CONCLUSION_VIDEO}
              isLooping={mirage4Phase === "deciding"}
              onEnded={handleMirage4VideoEnded}
              phase={mirage4Phase}
              onPlaceBet={handlePlaceMirage4Bet}
              disabled={false}
              currentBet={mirage4Bet}
              lastResult={mirage4LastResult}
            />
          </div>

          {/* Login prompt for non-logged in users */}
          {!user && (
            <div className="max-w-md mx-auto mb-8">
              <div className="pixel-panel p-6 text-center">
                <p className="text-gray-400 text-sm mb-4">Sign in to save your progress</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold text-xs pixel-btn border-gray-700 transition-all"
                >
                  SIGN IN
                </button>
              </div>
            </div>
          )}

          {/* Balance display for logged in users */}
          {user && (
            <div className="max-w-md mx-auto mb-8">
              <div className="pixel-panel p-4 text-center">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Your Balance</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(userBalance)}</p>
              </div>
            </div>
          )}

          {/* How it works - Mirage4 */}
          <div className="mt-16 text-center w-[85%] mx-auto">
            <h3 className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">1</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Watch the race and bet $100 on who wins: 5ft on Lambo or 6.5ft on Toyota
                </p>
              </div>
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">2</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Click your prediction and watch the conclusion play out
                </p>
              </div>
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">3</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Win 2x ($200) if you guess correctly!
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Mirage3 mode content */}
      {isMirage3Mode && (
        <main className="relative max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8 z-10">
          {/* Mirage3 video subject */}
          <div className="mb-6 sm:mb-12">
            <Mirage3Subject
              videoSrc={mirage3Phase === "deciding" ? DECIDING_VIDEO : CONCLUSION_VIDEO}
              isLooping={mirage3Phase === "deciding"}
              onEnded={handleMirage3VideoEnded}
              phase={mirage3Phase}
            />
          </div>

          {/* Mirage3 betting panel */}
          <div className="max-w-md mx-auto">
            <Mirage3BettingPanel
              balance={displayBalance}
              onPlaceBet={handlePlaceMirage3Bet}
              disabled={false}
              onLoginClick={() => setShowAuthModal(true)}
              phase={mirage3Phase}
              currentBet={mirage3Bet}
              onVideoEnded={handleMirage3VideoEnded}
              lastResult={mirage3LastResult}
              onPosted={handlePosted}
              showPostedConfirmation={showPostedConfirmation}
            />
          </div>

          {/* How it works - Mirage3 */}
          <div className="mt-16 text-center w-[85%] mx-auto">
            <h3 className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">1</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Watch the video and predict: Wife, Mom, or $90M?
                </p>
              </div>
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">2</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Place your bet and watch the conclusion
                </p>
              </div>
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">3</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Win 2x if you guess correctly!
                </p>
              </div>
              <div className="pixel-panel-dark p-4">
                <div className="text-xl mb-2 text-white">4</div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Download & post to earn $100 bonus!
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Main content */}
      {!isMirage3Mode && !isMirage4Mode && !isMirage5Mode && !isMirage7Mode && !isMirage8Mode && !isMirage9Mode && !isMirage10Mode && (
      <main className="relative max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8 z-10">
        {isMirage2Mode ? (
          <>
            {/* Mirage2 video subject */}
            <div className="mb-6 sm:mb-12">
              <Mirage2Subject
                videoSrc={mirage2Phase === "deciding" ? DECIDING_VIDEO : CONCLUSION_VIDEO}
                isLooping={mirage2Phase === "deciding"}
                onEnded={handleMirage2VideoEnded}
              />
            </div>

            {/* Mirage2 betting panel */}
            <div className="max-w-md mx-auto">
              <Mirage2BettingPanel
                balance={mirage2DisplayBalance}
                onPlaceBet={handlePlaceMirage2Bet}
                disabled={false}
                onLoginClick={() => setShowAuthModal(true)}
                phase={mirage2Phase}
                currentBet={mirage2Bet}
                onVideoEnded={handleMirage2VideoEnded}
                lastResult={mirage2LastResult}
              />
            </div>

            {/* How it works - Mirage2 */}
            <div className="mt-16 text-center w-[85%] mx-auto">
              <h3 className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="pixel-panel-dark p-4">
                  <div className="text-xl mb-2 text-white">1</div>
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    Watch the video and predict: Will he save his Wife, Mom, or take the $90 Million?
                  </p>
                </div>
                <div className="pixel-panel-dark p-4">
                  <div className="text-xl mb-2 text-white">2</div>
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    Place your bet and watch the conclusion video play out
                  </p>
                </div>
                <div className="pixel-panel-dark p-4">
                  <div className="text-xl mb-2 text-white">3</div>
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    Win 2x if you guess correctly!
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : isMirageMode ? (
          <>
            {/* Mirage subject image */}
            <div className="mb-6 sm:mb-12">
              <MirageSubject />
            </div>

            {/* Mirage betting panel */}
            <div className="max-w-md mx-auto">
              <MirageBettingPanel
                balance={displayBalance}
                activeBets={displayActiveBets}
                concludedBets={displayConcludedBets}
                onPlaceBet={handlePlaceMirageBet}
                disabled={false}
                onLoginClick={() => setShowAuthModal(true)}
              />
            </div>

            {/* How it works - Mirage */}
            <div className="mt-16 text-center w-[85%] mx-auto">
              <h3 className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="pixel-panel-dark p-4">
                  <div className="text-xl mb-2 text-white">1</div>
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    View the subject
                  </p>
                </div>
                <div className="pixel-panel-dark p-4">
                  <div className="text-xl mb-2 text-white">2</div>
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    Bet Survives or Dies — resolves in 3 days
                  </p>
                </div>
                <div className="pixel-panel-dark p-4">
                  <div className="text-xl mb-2 text-white">3</div>
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    Win 2x if correct
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Death counter */}
            <div className="mb-6 sm:mb-12">
              <DeathCounter
                date={todayDate}
                count={todayCount}
                previousCount={yesterdayCount}
                previousDate={yesterdayDate}
              />
            </div>

            {/* Betting panel */}
            <div className="max-w-md mx-auto">
              <BettingPanel
                balance={displayBalance}
                activeBets={displayActiveBets}
                concludedBets={displayConcludedBets}
                currentDeathCount={todayCount}
                onPlaceBet={handlePlaceBet}
                disabled={false}
                onLoginClick={() => setShowAuthModal(true)}
              />
            </div>

            {/* How it works - Grim */}
            <div className="mt-16 text-center w-[85%] mx-auto">
              <h3 className="text-xs font-semibold text-gray-400 mb-6 uppercase tracking-wider">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="pixel-panel-dark p-4">
                  <div className="text-xl mb-2 text-red-500">1</div>
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    View the current global death count
                  </p>
                </div>
                <div className="pixel-panel-dark p-4">
                  <div className="text-xl mb-2 text-red-500">2</div>
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    Bet higher or lower — resolves in 5 seconds
                  </p>
                </div>
                <div className="pixel-panel-dark p-4">
                  <div className="text-xl mb-2 text-red-500">3</div>
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    Win 2x if correct, push if tied
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

      </main>
      )}

      {/* Notification toast */}
      {notification && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 border-4 shadow-2xl z-20 ${
            notification.type === "win"
              ? "bg-green-900/90 border-green-500/50 text-green-100"
              : notification.type === "loss"
              ? "bg-red-900/90 border-red-500/50 text-red-100"
              : "bg-gray-900/90 border-gray-500/50 text-gray-100"
          }`}
          style={{ boxShadow: '4px 4px 0 #000' }}
        >
          <p className="font-semibold text-xs uppercase">{notification.message}</p>
          {notification.amount > 0 && (
            <p className="text-[10px] opacity-80 mt-1">
              {notification.type === "win" ? "+" : notification.type === "loss" ? "-" : ""}
              {formatCurrency(notification.amount)}
            </p>
          )}
        </div>
      )}

      {/* Auth modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

function SkullLoader() {
  return (
    <div className="animate-pulse">
      <svg
        className="w-16 h-16 mx-auto text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12c0 3.69 2.47 6.86 6 8.25V22h8v-1.75c3.53-1.39 6-4.56 6-8.25 0-5.52-4.48-10-10-10zM8 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm8 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
      </svg>
    </div>
  );
}
