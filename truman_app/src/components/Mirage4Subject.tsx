"use client";

import { useRef, useEffect } from "react";

export type Mirage4Prediction = "lambo" | "toyota";

interface Mirage4SubjectProps {
  videoSrc: string;
  isLooping: boolean;
  onEnded?: () => void;
  phase: "deciding" | "conclusion" | "result";
  onPlaceBet: (prediction: Mirage4Prediction) => void;
  disabled: boolean;
  currentBet: { prediction: Mirage4Prediction } | null;
  lastResult: { won: boolean; amount: number } | null;
}

export function Mirage4Subject({
  videoSrc,
  isLooping,
  onEnded,
  phase,
  onPlaceBet,
  disabled,
  currentBet,
  lastResult,
}: Mirage4SubjectProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset video when source changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked, user interaction required
      });
    }
  }, [videoSrc]);

  return (
    <div className="relative w-full">
      {/* Video container - full width */}
      <div className="relative w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop={isLooping}
          muted
          playsInline
          onEnded={onEnded}
          className="w-full h-auto"
        />

        {/* Bet buttons overlay - only during deciding phase */}
        {phase === "deciding" && (
          <>
            {/* Left button - 5ft on Lambo */}
            <button
              onClick={() => onPlaceBet("lambo")}
              disabled={disabled}
              className={`absolute left-2 sm:left-4 top-[calc(50%+200px)] -translate-y-1/2 px-3 sm:px-6 py-3 sm:py-4
                bg-orange-600/90 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm
                pixel-btn border-orange-800 transition-all shadow-lg
                ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
              `}
            >
              <div className="text-center">
                <span className="block text-yellow-300 text-lg sm:text-xl font-black">$100</span>
                <span className="block text-[10px] sm:text-xs mt-1">5ft on LAMBO</span>
              </div>
            </button>

            {/* Right button - 6.5ft on Toyota */}
            <button
              onClick={() => onPlaceBet("toyota")}
              disabled={disabled}
              className={`absolute right-2 sm:right-4 top-[calc(50%+200px)] -translate-y-1/2 px-3 sm:px-6 py-3 sm:py-4
                bg-blue-600/90 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm
                pixel-btn border-blue-800 transition-all shadow-lg
                ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
              `}
            >
              <div className="text-center">
                <span className="block text-yellow-300 text-lg sm:text-xl font-black">$100</span>
                <span className="block text-[10px] sm:text-xs mt-1">6.5ft on TOYOTA</span>
              </div>
            </button>
          </>
        )}

        {/* Current bet indicator during conclusion phase */}
        {phase === "conclusion" && currentBet && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className={`px-6 py-3 border-2 animate-pulse ${
              currentBet.prediction === "lambo"
                ? "bg-orange-900/80 border-orange-500"
                : "bg-blue-900/80 border-blue-500"
            }`}>
              <span className="text-white font-bold text-sm sm:text-base">
                YOUR BET: $100 on {currentBet.prediction === "lambo" ? "5ft LAMBO" : "6.5ft TOYOTA"}
              </span>
            </div>
          </div>
        )}

        {/* Result overlay */}
        {phase === "result" && lastResult && (
          <div className={`absolute inset-0 flex items-center justify-center ${
            lastResult.won ? "bg-green-900/80" : "bg-red-900/80"
          }`}>
            <div className="text-center animate-pulse">
              <p className="text-white text-2xl sm:text-4xl font-black mb-2">
                6.5ft WINS!
              </p>
              <p className={`text-3xl sm:text-5xl font-black ${
                lastResult.won ? "text-green-400" : "text-red-400"
              }`}>
                {lastResult.won ? `YOU WON +$${lastResult.amount}!` : `YOU LOST -$${lastResult.amount}!`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
