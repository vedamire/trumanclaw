"use client";

import { useRef, useEffect } from "react";

export type Mirage5Prediction = "crash" | "land";

interface Mirage5SubjectProps {
  videoSrc: string;
  isLooping: boolean;
  onEnded?: () => void;
  phase: "deciding" | "conclusion" | "result";
  onPlaceBet: (prediction: Mirage5Prediction) => void;
  disabled: boolean;
  currentBet: { prediction: Mirage5Prediction; outcome: Mirage5Prediction } | null;
  lastResult: { won: boolean; amount: number } | null;
  outcome: Mirage5Prediction | null;
  fullscreen?: boolean;
  userBalance?: number;
  onShowHelp?: () => void;
}

export function Mirage5Subject({
  videoSrc,
  isLooping,
  onEnded,
  phase,
  onPlaceBet,
  disabled,
  currentBet,
  lastResult,
  outcome,
  fullscreen,
  userBalance,
  onShowHelp,
}: Mirage5SubjectProps) {
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

  // TikTok-style fullscreen layout
  if (fullscreen) {
    return (
      <div className="tiktok-container">
        <div className="tiktok-video-wrapper">
          <div className="tiktok-video-inner">
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              loop={isLooping}
              muted
              playsInline
              onEnded={onEnded}
              className="tiktok-video"
            />

            {/* Balance overlay - top right */}
            {userBalance !== undefined && (
              <div className="tiktok-balance">
                <div className="px-3 py-2 bg-black/70 backdrop-blur-sm rounded-lg">
                  <p className="text-gray-400 text-[10px] uppercase">Balance</p>
                  <p className="text-white text-lg font-bold">${userBalance}</p>
                </div>
              </div>
            )}

            {/* Buttons at bottom - only during deciding phase */}
            {phase === "deciding" && (
              <div className="tiktok-buttons">
                <div className="text-center mb-4">
                  <button
                    onClick={onShowHelp}
                    className="bg-black/70 px-6 py-2 rounded-lg text-white text-xl font-black hover:bg-black/80 transition-colors"
                  >
                    Crash or Land?
                  </button>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => onPlaceBet("crash")}
                    disabled={disabled}
                    className={`flex-1 py-5 bg-gray-700/90 hover:bg-gray-600 text-white font-bold
                      pixel-btn border-gray-800 transition-all shadow-lg rounded-lg
                      ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
                    `}
                  >
                    <span className="text-2xl font-black">CRASH</span>
                  </button>
                  <button
                    onClick={() => onPlaceBet("land")}
                    disabled={disabled}
                    className={`flex-1 py-5 bg-gray-600/90 hover:bg-gray-500 text-white font-bold
                      pixel-btn border-gray-700 transition-all shadow-lg rounded-lg
                      ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
                    `}
                  >
                    <span className="text-2xl font-black">LAND</span>
                  </button>
                </div>
              </div>
            )}

            {/* Current bet indicator during conclusion phase */}
            {phase === "conclusion" && currentBet && (
              <div className="tiktok-buttons">
                <div className="text-center">
                  <div className="px-6 py-3 border-2 animate-pulse bg-gray-800/80 border-gray-500 rounded-lg inline-block">
                    <span className="text-white font-bold text-sm sm:text-base">
                      YOUR BET: $100 on {currentBet.prediction === "crash" ? "CRASH" : "LAND"}
                    </span>
                  </div>
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
                    {outcome === "crash" ? "CAR CRASHES!" : "CAR LANDS!"}
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
      </div>
    );
  }

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
            {/* Question text above buttons */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 bg-black/70 px-24 py-3 rounded-lg whitespace-nowrap">
              <span className="text-white text-4xl sm:text-6xl font-black">Crash or Land?</span>
            </div>

            {/* Left button - CRASH */}
            <button
              onClick={() => onPlaceBet("crash")}
              disabled={disabled}
              className={`absolute left-2 sm:left-4 top-[calc(50%+200px)] -translate-y-1/2 px-9 sm:px-16 py-9 sm:py-12
                bg-gray-700/90 hover:bg-gray-600 text-white font-bold
                pixel-btn border-gray-800 transition-all shadow-lg
                ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
              `}
            >
              <span className="text-3xl sm:text-5xl font-black">CRASH</span>
            </button>

            {/* Right button - LAND */}
            <button
              onClick={() => onPlaceBet("land")}
              disabled={disabled}
              className={`absolute right-2 sm:right-4 top-[calc(50%+200px)] -translate-y-1/2 px-9 sm:px-16 py-9 sm:py-12
                bg-gray-600/90 hover:bg-gray-500 text-white font-bold
                pixel-btn border-gray-700 transition-all shadow-lg
                ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
              `}
            >
              <span className="text-3xl sm:text-5xl font-black">LAND</span>
            </button>
          </>
        )}

        {/* Current bet indicator during conclusion phase */}
        {phase === "conclusion" && currentBet && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="px-6 py-3 border-2 animate-pulse bg-gray-800/80 border-gray-500">
              <span className="text-white font-bold text-sm sm:text-base">
                YOUR BET: $100 on {currentBet.prediction === "crash" ? "CRASH" : "LAND"}
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
                {outcome === "crash" ? "CAR CRASHES!" : "CAR LANDS!"}
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
