"use client";

import { useState, useEffect } from "react";
import { formatCurrency, validateBetAmount } from "@/lib/gameLogic";

export type Mirage2Prediction = "wife" | "mom" | "money";

interface Mirage2BettingPanelProps {
  balance: number;
  onPlaceBet: (prediction: Mirage2Prediction, amount: number) => void;
  disabled?: boolean;
  onLoginClick?: () => void;
  phase: "deciding" | "conclusion" | "result";
  currentBet: { prediction: Mirage2Prediction; amount: number } | null;
  onVideoEnded: () => void;
  lastResult: { won: boolean; amount: number; payout: number } | null;
}

const PRESET_AMOUNTS = [10, 50, 100, 250];
const RESULT_DISPLAY_DURATION = 3000;

export function Mirage2BettingPanel({
  balance,
  onPlaceBet,
  disabled = false,
  onLoginClick,
  phase,
  currentBet,
  onVideoEnded,
  lastResult,
}: Mirage2BettingPanelProps) {
  const [amount, setAmount] = useState<number>(50);
  const [selectedPrediction, setSelectedPrediction] = useState<Mirage2Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Show result animation when phase changes to result
  useEffect(() => {
    if (phase === "result" && lastResult) {
      setShowResult(true);
      const timer = setTimeout(() => {
        setShowResult(false);
        onVideoEnded(); // This will reset back to deciding phase
      }, RESULT_DISPLAY_DURATION);
      return () => clearTimeout(timer);
    }
  }, [phase, lastResult, onVideoEnded]);

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
      setError("Select a prediction first");
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

  const handlePredictionClick = (prediction: Mirage2Prediction) => {
    if (disabled && onLoginClick) {
      onLoginClick();
    } else if (phase === "deciding") {
      setSelectedPrediction(prediction);
    }
  };

  const isInActivePhase = phase === "conclusion" || phase === "result";

  return (
    <div className="space-y-6">
      {/* Active bet display during conclusion video */}
      {isInActivePhase && currentBet && (
        <div className="pixel-panel overflow-hidden">
          <div className="p-4 flex items-center gap-3 border-b-2 border-gray-700/50">
            <div className="relative">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 bg-pink-500"></span>
              </span>
            </div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase">
              {phase === "conclusion" ? "Watching..." : "Result"}
            </h3>
          </div>

          {/* Show result animation */}
          {showResult && lastResult && (
            <div
              className={`px-6 py-8 flex items-center justify-center animate-pulse ${
                lastResult.won
                  ? "bg-green-900/30"
                  : "bg-red-900/30"
              }`}
            >
              <div className="text-center">
                <p className={`text-3xl font-black tracking-wider ${
                  lastResult.won ? "text-green-400" : "text-red-400"
                }`}>
                  {lastResult.won
                    ? `MOM WINS! +${formatCurrency(lastResult.payout - lastResult.amount)}`
                    : `WRONG CHOICE! -${formatCurrency(lastResult.amount)}`}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {lastResult.won ? "He saved his mom!" : "He didn't save her..."}
                </p>
              </div>
            </div>
          )}

          {/* Show current bet during video */}
          {!showResult && (
            <div className={`px-6 py-5 flex items-center gap-4 border-2 animate-pulse-border ${
              currentBet.prediction === "mom"
                ? "border-purple-500 bg-purple-900/30 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                : currentBet.prediction === "wife"
                  ? "border-pink-500 bg-pink-900/30 shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                  : "border-yellow-500 bg-yellow-900/30 shadow-[0_0_20px_rgba(234,179,8,0.5)]"
            }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-sm font-bold ${
                    currentBet.prediction === "mom"
                      ? "bg-purple-600/20 text-purple-400 border border-purple-600/30"
                      : currentBet.prediction === "wife"
                        ? "bg-pink-600/20 text-pink-400 border border-pink-600/30"
                        : "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                  }`}>
                    {currentBet.prediction === "mom" ? "MOM" : currentBet.prediction === "wife" ? "WIFE" : "$90 MILLION"}
                  </span>
                  <span className="px-3 py-1 text-sm font-semibold bg-pink-600/20 text-pink-400 border border-pink-600/30">
                    PENDING
                  </span>
                </div>
                <div className="mt-2 text-xl text-gray-400">
                  Watching conclusion...
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-yellow-400 text-lg font-semibold">
                  {formatCurrency(currentBet.amount)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Betting form - only show during deciding phase */}
      {phase === "deciding" && (
        <div className="pixel-panel p-6">
          {/* Prediction buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => handlePredictionClick("wife")}
              disabled={isInActivePhase}
              className={`relative py-5 pixel-btn font-bold text-base transition-all ${
                selectedPrediction === "wife"
                  ? "bg-pink-600 text-white border-pink-800"
                  : "bg-pink-600/10 text-pink-500 border-pink-600/50 hover:bg-pink-600/20"
              } ${(disabled || isInActivePhase) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <HeartIcon className="w-7 h-7 mx-auto mb-1" />
              WIFE
            </button>
            <button
              onClick={() => handlePredictionClick("mom")}
              disabled={isInActivePhase}
              className={`relative py-5 pixel-btn font-bold text-base transition-all ${
                selectedPrediction === "mom"
                  ? "bg-purple-600 text-white border-purple-800"
                  : "bg-purple-600/10 text-purple-500 border-purple-600/50 hover:bg-purple-600/20"
              } ${(disabled || isInActivePhase) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <HeartIcon className="w-7 h-7 mx-auto mb-1" />
              MOM
            </button>
            <button
              onClick={() => handlePredictionClick("money")}
              disabled={isInActivePhase}
              className={`relative py-5 pixel-btn font-bold text-base transition-all ${
                selectedPrediction === "money"
                  ? "bg-yellow-600 text-white border-yellow-800"
                  : "bg-yellow-600/10 text-yellow-500 border-yellow-600/50 hover:bg-yellow-600/20"
              } ${(disabled || isInActivePhase) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <DollarIcon className="w-7 h-7 mx-auto mb-1" />
              $90M
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
                disabled={disabled || isInActivePhase}
                min={1}
                max={balance}
                className="w-full pixel-input py-3 pl-8 pr-4 text-white text-sm focus:outline-none focus:border-pink-500/50 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Preset amounts */}
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                disabled={disabled || isInActivePhase || preset > balance}
                className={`px-3 py-1.5 text-[10px] font-medium transition-colors border-2 ${
                  amount === preset
                    ? "bg-pink-500/20 text-pink-400 border-pink-500/50"
                    : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
                }`}
              >
                ${preset}
              </button>
            ))}
            <button
              onClick={handleAllIn}
              disabled={disabled || isInActivePhase}
              className="px-3 py-1.5 text-[10px] font-medium bg-gray-800 text-pink-400 border-2 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
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
            disabled={isInActivePhase}
            className="w-full py-4 bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs pixel-btn border-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {disabled ? "SIGN IN TO BET" : "PLACE BET"}
          </button>

          {disabled && (
            <p className="text-gray-500 text-[10px] text-center mt-3 uppercase">
              Sign in to start betting
            </p>
          )}
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

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
    </svg>
  );
}
