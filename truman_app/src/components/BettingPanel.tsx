"use client";

import { useState, useEffect, useRef } from "react";
import {
  formatCurrency,
  calculatePotentialPayout,
  validateBetAmount,
  formatNumber,
  type Prediction,
} from "@/lib/gameLogic";

interface Bet {
  id: string;
  prediction: string;
  amount: number;
  snapshotDeathCount?: number;
  expiresAt: number;
  createdAt: number;
}

interface ConcludedBet {
  id: string;
  prediction: string;
  amount: number;
  snapshotDeathCount?: number;
  resolveDeathCount?: number;
  won: boolean | null | undefined;
  payout?: number;
  createdAt: number;
}

interface BettingPanelProps {
  balance: number;
  activeBets: Bet[];
  concludedBets: ConcludedBet[];
  currentDeathCount: number;
  onPlaceBet: (prediction: Prediction, amount: number) => void;
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

const PRESET_AMOUNTS = [10, 50, 100, 250, 500];
const RESULT_DISPLAY_DURATION = 3000; // 3 seconds

// Custom hook for countdown timer
function useCountdown(expiresAt: number): number {
  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
  );

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeLeft;
}

// Active bet item with countdown
function ActiveBetItem({
  bet,
  currentDeathCount
}: {
  bet: Bet;
  currentDeathCount: number;
}) {
  const timeLeft = useCountdown(bet.expiresAt);
  const snapshotCount = bet.snapshotDeathCount;

  // If no snapshot count, show as pending (data not available yet)
  const hasValidSnapshot = snapshotCount !== undefined && snapshotCount !== null && snapshotCount > 0;

  // Determine if currently winning (only if we have valid data)
  const diff = hasValidSnapshot ? currentDeathCount - snapshotCount : 0;
  const isCurrentlyWinning = hasValidSnapshot && (
    (bet.prediction === "higher" && diff > 0) ||
    (bet.prediction === "lower" && diff < 0)
  );
  const isTied = hasValidSnapshot && diff === 0;

  // Calculate progress for circular timer (5 seconds total)
  const progress = Math.min(1, timeLeft / 5);
  const circumference = 2 * Math.PI * 18; // radius = 18
  const strokeDashoffset = circumference * (1 - progress);

  // Determine status for display
  const getStatus = () => {
    if (!hasValidSnapshot) return { text: "PENDING", color: "blue" };
    if (isTied) return { text: "EVEN", color: "gray" };
    if (isCurrentlyWinning) return { text: "WINNING", color: "green" };
    return { text: "LOSING", color: "red" };
  };
  const status = getStatus();

  return (
    <div className={`px-4 py-3 flex items-center gap-3 border-2 animate-pulse-border ${
      status.color === "gray"
        ? "border-gray-500 bg-gray-800/30 shadow-[0_0_15px_rgba(107,114,128,0.5)]"
        : status.color === "green"
          ? "border-green-500 bg-green-900/30 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
          : status.color === "blue"
            ? "border-gray-500 bg-gray-800/30 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            : "border-red-500 bg-red-900/30 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
    }`}>
      {/* Circular countdown timer */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
          {/* Background circle */}
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-800"
          />
          {/* Progress circle */}
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            className={timeLeft <= 1 ? "text-red-500" : timeLeft <= 3 ? "text-white" : "text-white"}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-[10px] font-bold ${timeLeft <= 1 ? "text-red-500" : "text-white"}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Bet details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[8px] font-bold ${
            bet.prediction === "higher"
              ? "bg-red-600/20 text-red-400 border border-red-600/30"
              : "bg-green-600/20 text-green-400 border border-green-600/30"
          }`}>
            {bet.prediction === "higher" ? "▲ HIGHER" : "▼ LOWER"}
          </span>
          {/* Live indicator */}
          <span className={`px-2 py-0.5 text-[8px] font-semibold border ${
            status.color === "gray"
              ? "bg-gray-600/20 text-gray-400 border-gray-600/30"
              : status.color === "green"
                ? "bg-green-600/20 text-green-400 border-green-600/30"
                : status.color === "blue"
                  ? "bg-gray-600/20 text-white border-gray-600/30"
                  : "bg-red-600/20 text-red-400 border-red-600/30"
          }`}>
            {status.text}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
          <span>{hasValidSnapshot ? formatNumber(snapshotCount) : "..."}</span>
          <span>→</span>
          <span className={`${
            hasValidSnapshot && diff > 0
              ? "text-red-400"
              : hasValidSnapshot && diff < 0
                ? "text-green-400"
                : "text-gray-400"
          }`}>
            {formatNumber(currentDeathCount)}
          </span>
          {hasValidSnapshot && diff !== 0 && (
            <span className={`${diff > 0 ? "text-red-400" : "text-green-400"}`}>
              ({diff > 0 ? "+" : ""}{formatNumber(diff)})
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className="text-white text-xs font-semibold">
          {formatCurrency(bet.amount)}
        </p>
        <p className="text-gray-600 text-[8px]">
          → {formatCurrency(calculatePotentialPayout(bet.amount))}
        </p>
      </div>
    </div>
  );
}

// Concluded bet item
function ConcludedBetItem({ bet }: { bet: ConcludedBet }) {
  const snapshotCount = bet.snapshotDeathCount ?? 0;
  const resolveCount = bet.resolveDeathCount ?? 0;
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
            bet.prediction === "higher" ? "text-red-400" : "text-green-400"
          }`}>
            {bet.prediction === "higher" ? "▲" : "▼"}
          </span>
          <span className="text-gray-400 text-[10px] uppercase">
            {isPush ? "Push" : isWin ? "Won" : "Lost"}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[8px] text-gray-600">
          <span>{formatNumber(snapshotCount)}</span>
          <span>→</span>
          <span>{formatNumber(resolveCount)}</span>
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

export function BettingPanel({
  balance,
  activeBets,
  concludedBets,
  currentDeathCount,
  onPlaceBet,
  disabled = false,
  onLoginClick,
}: BettingPanelProps) {
  const [amount, setAmount] = useState<number>(50);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeBetsExpanded, setActiveBetsExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [resolvedResults, setResolvedResults] = useState<ResolvedResult[]>([]);
  const [showPredictionPopup, setShowPredictionPopup] = useState(false);
  const [popupPrediction, setPopupPrediction] = useState<Prediction | null>(null);

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

  // Clear resolved results after 3 seconds
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
                        ? `PUMP +${formatCurrency(result.payout - result.amount)}`
                        : result.won === false
                          ? `RIP -${formatCurrency(result.amount)}`
                          : `PUSH ${formatCurrency(result.amount)}`}
                    </p>
                  </div>
                </div>
              ))}

              {/* Show active bets */}
              {activeBets.map((bet) => (
                <ActiveBetItem
                  key={bet.id}
                  bet={bet}
                  currentDeathCount={currentDeathCount}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Betting form */}
      <div className="pixel-panel p-6">
        <div className="text-center mb-6">
          <h3 className="text-xs font-semibold text-gray-300 uppercase">
            {activeBets.length > 0 ? "Place Another Bet" : "Place Your Bet"}
          </h3>
          <p className="text-gray-500 text-[10px] mt-2">
            Will the death count be higher or lower in 5 seconds?
          </p>
        </div>

        {/* Prediction buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => {
              if (disabled && onLoginClick) {
                onLoginClick();
              } else {
                setSelectedPrediction("higher");
              }
            }}
            className={`relative py-6 pixel-btn font-bold text-xs transition-all ${
              selectedPrediction === "higher"
                ? "bg-red-600 text-white border-red-800"
                : "bg-red-600/10 text-red-500 border-red-600/50 hover:bg-red-600/20"
            } ${disabled ? "opacity-50" : ""}`}
          >
            <ArrowUpIcon className="w-6 h-6 mx-auto mb-1" />
            HIGHER
          </button>
          <button
            onClick={() => {
              if (disabled && onLoginClick) {
                onLoginClick();
              } else {
                setSelectedPrediction("lower");
              }
            }}
            className={`relative py-6 pixel-btn font-bold text-xs transition-all ${
              selectedPrediction === "lower"
                ? "bg-green-600 text-white border-green-800"
                : "bg-green-600/10 text-green-500 border-green-600/50 hover:bg-green-600/20"
            } ${disabled ? "opacity-50" : ""}`}
          >
            <ArrowDownIcon className="w-6 h-6 mx-auto mb-1" />
            LOWER
          </button>
        </div>

        {/* Amount input */}
        <div className="mb-4">
          <label className="block text-gray-400 text-[10px] mb-2 uppercase">Bet Amount</label>
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
            className="px-3 py-1.5 text-[10px] font-medium bg-gray-800 text-red-400 border-2 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
          >
            ALL IN
          </button>
        </div>

        {/* Potential payout */}
        <div className="bg-gray-900/50 border-2 border-gray-700 p-3 mb-4">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500 uppercase">Potential Payout</span>
            <span className="text-white font-semibold">
              {formatCurrency(calculatePotentialPayout(amount))}
            </span>
          </div>
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
              <p className="text-gray-500 text-[10px]">
                Will the death count be higher or lower in 5 seconds?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setPopupPrediction("higher")}
                className={`relative py-6 pixel-btn font-bold text-xs transition-all ${
                  popupPrediction === "higher"
                    ? "bg-red-600 text-white border-red-800"
                    : "bg-red-600/10 text-red-500 border-red-600/50 hover:bg-red-600/20"
                }`}
              >
                <ArrowUpIcon className="w-6 h-6 mx-auto mb-1" />
                HIGHER
              </button>
              <button
                onClick={() => setPopupPrediction("lower")}
                className={`relative py-6 pixel-btn font-bold text-xs transition-all ${
                  popupPrediction === "lower"
                    ? "bg-green-600 text-white border-green-800"
                    : "bg-green-600/10 text-green-500 border-green-600/50 hover:bg-green-600/20"
                }`}
              >
                <ArrowDownIcon className="w-6 h-6 mx-auto mb-1" />
                LOWER
              </button>
            </div>

            <div className="bg-gray-900/50 border-2 border-gray-700 p-3 mb-4">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500 uppercase">Bet Amount</span>
                <span className="text-white font-semibold">
                  {formatCurrency(amount)}
                </span>
              </div>
              <div className="flex justify-between text-[10px] mt-1">
                <span className="text-gray-500 uppercase">Potential Payout</span>
                <span className="text-white font-semibold">
                  {formatCurrency(calculatePotentialPayout(amount))}
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

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
