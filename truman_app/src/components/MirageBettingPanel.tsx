"use client";

import { useState, useEffect, useRef } from "react";
import {
  formatCurrency,
  validateBetAmount,
} from "@/lib/gameLogic";

export type MiragePrediction = "yeah" | "nah";

interface Bet {
  id: string;
  prediction: string;
  amount: number;
  expiresAt: number;
  createdAt: number;
}

interface ConcludedBet {
  id: string;
  prediction: string;
  amount: number;
  won: boolean | null | undefined;
  payout?: number;
  createdAt: number;
}

interface MirageBettingPanelProps {
  balance: number;
  activeBets: Bet[];
  concludedBets: ConcludedBet[];
  onPlaceBet: (prediction: MiragePrediction, amount: number) => void;
  disabled?: boolean;
  onLoginClick?: () => void;
}

interface ResolvedResult {
  id: string;
  won: boolean | null;
  amount: number;
  payout: number;
  timestamp: number;
}

const PRESET_AMOUNTS = [10, 50, 100, 250];
const RESULT_DISPLAY_DURATION = 3000;

// Format time remaining as days/hours/minutes
function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "0m";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

// Custom hook for looping countdown timer
// First 10 seconds: countdown from 24h, then 10s countdown, then loop
function useLoopingCountdown(): { displayMs: number; isInTenSecondPhase: boolean } {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Each cycle is 20 seconds: 10s of 24h countdown + 10s of 10s countdown
  const cyclePosition = elapsedSeconds % 20;

  if (cyclePosition < 10) {
    // First 10 seconds: show 24h counting down (24h -> ~23h 59m 50s visually)
    const hoursRemaining = 24 - (cyclePosition / 10) * 0.5; // Slight visual decrease
    const displayMs = hoursRemaining * 60 * 60 * 1000;
    return { displayMs, isInTenSecondPhase: false };
  } else {
    // Next 10 seconds: countdown from 10 to 1
    const secondsLeft = 10 - (cyclePosition - 10);
    const displayMs = secondsLeft * 1000;
    return { displayMs, isInTenSecondPhase: true };
  }
}

// Active bet item with countdown - 2x larger for mirage
function ActiveBetItem({ bet }: { bet: Bet }) {
  const { displayMs, isInTenSecondPhase } = useLoopingCountdown();
  const isYeah = bet.prediction === "yeah";

  // Calculate progress for circular timer
  const maxMs = isInTenSecondPhase ? 10 * 1000 : 24 * 60 * 60 * 1000;
  const progress = Math.min(1, displayMs / maxMs);
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={`px-6 py-5 flex items-center gap-4 border-2 animate-pulse-border ${
      isYeah
        ? "border-green-500 bg-green-900/30 shadow-[0_0_20px_rgba(34,197,94,0.5)]"
        : "border-red-500 bg-red-900/30 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
    }`}>
      {/* Circular countdown timer - 2x larger */}
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
          {/* Background circle */}
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-gray-800"
          />
          {/* Progress circle */}
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            className={isInTenSecondPhase ? "text-red-500" : "text-white"}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${isInTenSecondPhase ? "text-xs text-red-500" : "text-[6px] text-white"}`}>
            {formatTimeRemaining(displayMs)}
          </span>
        </div>
      </div>

      {/* Bet details - larger text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-bold ${
            isYeah
              ? "bg-green-600/20 text-green-400 border border-green-600/30"
              : "bg-red-600/20 text-red-400 border border-red-600/30"
          }`}>
            {isYeah ? "SURVIVES" : "DIES"}
          </span>
          <span className="px-3 py-1 text-sm font-semibold bg-gray-600/20 text-white border border-gray-600/30">
            PENDING
          </span>
        </div>
        <div className="mt-2 text-2xl text-gray-500">
          Will she survive next 24h?
        </div>
      </div>

      {/* Amount - larger */}
      <div className="text-right flex-shrink-0">
        <p className="text-white text-lg font-semibold">
          {formatCurrency(bet.amount)}
        </p>
      </div>
    </div>
  );
}

// Concluded bet item
function ConcludedBetItem({ bet }: { bet: ConcludedBet }) {
  const isYeah = bet.prediction === "yeah";
  const isPush = bet.won === null;
  const isWin = bet.won === true;

  return (
    <div className="px-4 py-3 flex items-center gap-3 border-b-2 border-gray-700/50 last:border-b-0">
      {/* Result indicator */}
      <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 border-2 ${
        isPush
          ? "bg-gray-600/20 text-gray-400 border-gray-600/30"
          : isWin
            ? "bg-green-600/20 text-green-400 border-green-600/30"
            : "bg-red-600/20 text-red-400 border-red-600/30"
      }`}>
        <span className="text-sm font-bold">
          {isPush ? "=" : isWin ? "✓" : "✗"}
        </span>
      </div>

      {/* Bet details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] ${
            isYeah ? "text-green-400" : "text-red-400"
          }`}>
            {isYeah ? "✓" : "✗"}
          </span>
          <span className="text-gray-400 text-[10px] uppercase">
            {isPush ? "Push" : isWin ? "Won" : "Lost"}
          </span>
        </div>
        <div className="mt-0.5 text-[8px] text-gray-600">
          {isYeah ? "Bet Survives" : "Bet Dies"}
        </div>
      </div>

      {/* Payout */}
      <div className="text-right flex-shrink-0">
        <p className={`text-xs font-semibold ${
          isPush
            ? "text-gray-400"
            : isWin
              ? "text-green-400"
              : "text-red-400"
        }`}>
          {isPush
            ? formatCurrency(bet.payout ?? bet.amount)
            : isWin
              ? `+${formatCurrency((bet.payout ?? 0) - bet.amount)}`
              : `-${formatCurrency(bet.amount)}`}
        </p>
        <p className="text-gray-600 text-[8px] uppercase">
          bet: {formatCurrency(bet.amount)}
        </p>
      </div>
    </div>
  );
}

export function MirageBettingPanel({
  balance,
  activeBets,
  concludedBets,
  onPlaceBet,
  disabled = false,
  onLoginClick,
}: MirageBettingPanelProps) {
  const [amount, setAmount] = useState<number>(50);
  const [selectedPrediction, setSelectedPrediction] = useState<MiragePrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeBetsExpanded, setActiveBetsExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [resolvedResults, setResolvedResults] = useState<ResolvedResult[]>([]);
  const [showPredictionPopup, setShowPredictionPopup] = useState(false);
  const [popupPrediction, setPopupPrediction] = useState<MiragePrediction | null>(null);

  // Track previous active bet IDs to detect when bets resolve
  const prevActiveBetIdsRef = useRef<Set<string>>(new Set());

  // Detect when bets resolve and show result animation
  useEffect(() => {
    const currentIds = new Set(activeBets.map(b => b.id));
    const prevIds = prevActiveBetIdsRef.current;

    // Find bets that were active but are no longer
    const resolvedIds = [...prevIds].filter(id => !currentIds.has(id));

    if (resolvedIds.length > 0) {
      // Find these bets in concludedBets
      const newResults: ResolvedResult[] = [];
      for (const id of resolvedIds) {
        const concluded = concludedBets.find(b => b.id === id);
        if (concluded) {
          newResults.push({
            id: concluded.id,
            won: concluded.won ?? null,
            amount: concluded.amount,
            payout: concluded.payout ?? 0,
            timestamp: Date.now(),
          });
        }
      }

      if (newResults.length > 0) {
        setResolvedResults(prev => [...prev, ...newResults]);
      }
    }

    prevActiveBetIdsRef.current = currentIds;
  }, [activeBets, concludedBets]);

  // Clear resolved results after display duration
  useEffect(() => {
    if (resolvedResults.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      setResolvedResults(prev =>
        prev.filter(r => now - r.timestamp < RESULT_DISPLAY_DURATION)
      );
    }, 100);

    return () => clearInterval(timer);
  }, [resolvedResults.length]);

  const handleAmountChange = (value: number) => {
    setAmount(value);
    setError(null);
  };

  const handlePresetClick = (preset: number) => {
    if (preset <= balance) {
      setAmount(preset);
      setError(null);
    }
  };

  const handleAllIn = () => {
    setAmount(balance);
    setError(null);
  };

  const handlePlaceBet = () => {
    if (!selectedPrediction) {
      setPopupPrediction(null);
      setShowPredictionPopup(true);
      return;
    }

    const validation = validateBetAmount(amount, balance);
    if (!validation.valid) {
      setError(validation.error || "Invalid bet");
      return;
    }

    onPlaceBet(selectedPrediction, amount);
    setSelectedPrediction(null);
    setError(null);
  };

  const handlePopupPlaceBet = () => {
    if (!popupPrediction) return;

    const validation = validateBetAmount(amount, balance);
    if (!validation.valid) {
      setError(validation.error || "Invalid bet");
      setShowPredictionPopup(false);
      return;
    }

    onPlaceBet(popupPrediction, amount);
    setSelectedPrediction(null);
    setPopupPrediction(null);
    setShowPredictionPopup(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Active bets list and resolved results - shown above betting form */}
      {(activeBets.length > 0 || resolvedResults.length > 0) && (
        <div className="pixel-panel overflow-hidden">
          <button
            onClick={() => setActiveBetsExpanded(!activeBetsExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-white opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 bg-white"></span>
                </span>
              </div>
              <h3 className="text-xs font-semibold text-gray-300 uppercase">Active Bets</h3>
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5">
                {activeBets.length}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white text-xs font-semibold">
                  {formatCurrency(activeBets.reduce((sum, bet) => sum + bet.amount, 0))}
                </p>
                <p className="text-gray-500 text-[8px] uppercase">at risk</p>
              </div>
              <ChevronIcon className={`w-5 h-5 text-gray-500 transition-transform ${activeBetsExpanded ? "rotate-180" : ""}`} />
            </div>
          </button>

          {activeBetsExpanded && (
            <div className="border-t border-gray-800">
              {/* Show resolved results with animation */}
              {resolvedResults.map((result) => (
                <div
                  key={result.id}
                  className={`px-4 py-4 flex items-center justify-center animate-pulse ${
                    result.won === true
                      ? "bg-green-900/30"
                      : result.won === false
                        ? "bg-red-900/30"
                        : "bg-gray-800/30"
                  }`}
                >
                  <div className="text-center">
                    <p className={`text-2xl font-black tracking-wider ${
                      result.won === true
                        ? "text-green-400"
                        : result.won === false
                          ? "text-red-400"
                          : "text-gray-400"
                    }`}>
                      {result.won === true
                        ? `SHE MADE IT! +${formatCurrency(result.payout - result.amount)}`
                        : result.won === false
                          ? `RIP -${formatCurrency(result.amount)}`
                          : `PUSH ${formatCurrency(result.amount)}`}
                    </p>
                  </div>
                </div>
              ))}

              {/* Show active bets */}
              {activeBets.map((bet) => (
                <ActiveBetItem key={bet.id} bet={bet} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Betting form */}
      <div className="pixel-panel p-6">
        {/* Prediction buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => {
              if (disabled && onLoginClick) {
                onLoginClick();
              } else {
                setSelectedPrediction("yeah");
              }
            }}
            className={`relative py-6 pixel-btn font-bold text-lg transition-all ${
              selectedPrediction === "yeah"
                ? "bg-green-600 text-white border-green-800"
                : "bg-green-600/10 text-green-500 border-green-600/50 hover:bg-green-600/20"
            } ${disabled ? "opacity-50" : ""}`}
          >
            <HeartIcon className="w-9 h-9 mx-auto mb-1" />
            SURVIVES
          </button>
          <button
            onClick={() => {
              if (disabled && onLoginClick) {
                onLoginClick();
              } else {
                setSelectedPrediction("nah");
              }
            }}
            className={`relative py-6 pixel-btn font-bold text-lg transition-all ${
              selectedPrediction === "nah"
                ? "bg-red-600 text-white border-red-800"
                : "bg-red-600/10 text-red-500 border-red-600/50 hover:bg-red-600/20"
            } ${disabled ? "opacity-50" : ""}`}
          >
            <SkullIcon className="w-9 h-9 mx-auto mb-1" />
            DIES
          </button>
        </div>

        {/* Amount input */}
        <div className="mb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(parseInt(e.target.value) || 0)}
              disabled={disabled}
              min={1}
              max={balance}
              className="w-full pixel-input py-3 pl-8 pr-4 text-white text-sm focus:outline-none focus:border-white/50 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Preset amounts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              disabled={disabled || preset > balance}
              className={`px-3 py-1.5 text-[10px] font-medium transition-colors border-2 ${
                amount === preset
                  ? "bg-white/20 text-white border-white/50"
                  : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
              }`}
            >
              ${preset}
            </button>
          ))}
          <button
            onClick={handleAllIn}
            disabled={disabled}
            className="px-3 py-1.5 text-[10px] font-medium bg-gray-800 text-white border-2 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
          >
            ALL IN
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-[10px] mb-4 text-center">{error}</p>
        )}

        {/* Place bet button */}
        <button
          onClick={disabled ? onLoginClick : handlePlaceBet}
          className="w-full py-4 bg-gray-600 hover:bg-gray-500 text-white font-bold text-xs pixel-btn border-gray-700 transition-all"
        >
          {disabled ? "SIGN IN TO BET" : "PLACE BET"}
        </button>

        {disabled && (
          <p className="text-gray-500 text-[10px] text-center mt-3 uppercase">
            Sign in to start betting
          </p>
        )}
      </div>

      {/* Bet history */}
      {concludedBets.length > 0 && (
        <div className="pixel-panel-dark overflow-hidden">
          <button
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase">Bet History</h3>
              <span className="bg-gray-700/50 text-gray-400 text-[10px] px-2 py-0.5">
                {concludedBets.length}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                {(() => {
                  const netResult = concludedBets.reduce((sum, bet) => {
                    if (bet.won === true) return sum + ((bet.payout ?? 0) - bet.amount);
                    if (bet.won === false) return sum - bet.amount;
                    return sum; // push returns 0 net
                  }, 0);
                  return (
                    <p className={`text-xs font-semibold ${
                      netResult > 0 ? "text-green-400" : netResult < 0 ? "text-red-400" : "text-gray-400"
                    }`}>
                      {netResult >= 0 ? "+" : ""}{formatCurrency(netResult)}
                    </p>
                  );
                })()}
                <p className="text-gray-500 text-[8px] uppercase">net result</p>
              </div>
              <ChevronIcon className={`w-5 h-5 text-gray-500 transition-transform ${historyExpanded ? "rotate-180" : ""}`} />
            </div>
          </button>

          {historyExpanded && (
            <div className="border-t-4 border-gray-700">
              {concludedBets.map((bet) => (
                <ConcludedBetItem key={bet.id} bet={bet} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prediction selection popup */}
      {showPredictionPopup && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPredictionPopup(false)}
        >
          <div
            className="pixel-panel p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="text-sm font-bold text-white uppercase mb-2">
                Select Your Prediction
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setPopupPrediction("yeah")}
                className={`relative py-6 pixel-btn font-bold text-lg transition-all ${
                  popupPrediction === "yeah"
                    ? "bg-green-600 text-white border-green-800"
                    : "bg-green-600/10 text-green-500 border-green-600/50 hover:bg-green-600/20"
                }`}
              >
                <HeartIcon className="w-9 h-9 mx-auto mb-1" />
                SURVIVES
              </button>
              <button
                onClick={() => setPopupPrediction("nah")}
                className={`relative py-6 pixel-btn font-bold text-lg transition-all ${
                  popupPrediction === "nah"
                    ? "bg-red-600 text-white border-red-800"
                    : "bg-red-600/10 text-red-500 border-red-600/50 hover:bg-red-600/20"
                }`}
              >
                <SkullIcon className="w-9 h-9 mx-auto mb-1" />
                DIES
              </button>
            </div>

            <div className="bg-gray-900/50 border-2 border-gray-700 p-3 mb-4">
              <div className="flex justify-center text-[10px]">
                <span className="text-white font-semibold">
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>

            <button
              onClick={handlePopupPlaceBet}
              disabled={!popupPrediction}
              className="w-full py-4 bg-gray-600 hover:bg-gray-500 text-white font-bold text-xs pixel-btn border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              PLACE BET
            </button>

            <button
              onClick={() => setShowPredictionPopup(false)}
              className="w-full py-2 mt-3 text-gray-500 text-[10px] uppercase hover:text-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function SkullIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 3.69 2.47 6.86 6 8.25V22h2v-1h4v1h2v-1.75c3.53-1.39 6-4.56 6-8.25 0-5.52-4.48-10-10-10zm-3.5 12c-.83 0-1.5-.67-1.5-1.5S7.67 11 8.5 11s1.5.67 1.5 1.5S9.33 14 8.5 14zm7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
