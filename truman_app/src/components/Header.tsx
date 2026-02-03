"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { formatCurrency, INITIAL_BALANCE } from "@/lib/gameLogic";

interface HeaderProps {
  user: { id: string; email?: string | null; balance?: number } | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

interface SimulatedBet {
  username: string;
  won: boolean;
  amount: number;
  time: number;
  isGlitching: boolean;
}

// Pool of Reddit-style usernames
const REDDIT_USERNAMES = [
  "Natural-Shopping-153",
  "Unlikely_Cucumber_72",
  "Throwaway_Account_99",
  "PM_ME_UR_BETS",
  "DeathBetKing2024",
  "CryptoReaper420",
  "xXGrimBettorXx",
  "Nervous_Raccoon_847",
  "Original_Sloth_2847",
  "Deleted_User_404",
  "YOLOdeathtrader",
  "MoonOrTomb69",
  "ReaperGains2025",
  "DiamondHands_RIP",
  "BearishOnLife",
  "GrimHODLer",
  "SkullMarketCap",
  "DeathCrossTrader",
  "FinalBet_Steve",
  "CasketInvestor",
  "Organic_Potato_9284",
  "StonksOnlyGoDown",
  "GraveDigger_Pro",
  "RIPmyPortfolio",
  "DegenDeath666",
  "Smooth_Brain_420",
  "CoffinsAndGains",
  "FuneralFunds_LLC",
  "BetOnDeath_Steve",
  "Morbid_Investor_77",
  "TombstoneTrader",
  "DeathRattleAlpha",
  "CorpseCapital",
  "GrimReturns2026",
  "EndgameBets_OG",
  "MortalityMetrics",
  "LastBreathLarry",
  "SixFeetUnderFi",
  "TerminalGains_X",
  "EternalRest_ETF",
];

// Helper to generate a random bet
const generateRandomBet = (excludeUsernames: string[] = []): SimulatedBet => {
  const availableUsernames = REDDIT_USERNAMES.filter(
    name => !excludeUsernames.includes(name)
  );
  return {
    username: availableUsernames[Math.floor(Math.random() * availableUsernames.length)],
    won: Math.random() < 0.5,
    amount: Math.floor(Math.random() * (10000 - 50 + 1)) + 50,
    time: 1,
    isGlitching: false,
  };
};

// Generate initial bets with unique usernames
const generateInitialBets = (): SimulatedBet[] => {
  const bets: SimulatedBet[] = [];
  const usedUsernames: string[] = [];
  for (let i = 0; i < 2; i++) {
    const bet = generateRandomBet(usedUsernames);
    bets.push(bet);
    usedUsernames.push(bet.username);
  }
  return bets;
};

export function Header({ user, onLoginClick, onLogoutClick }: HeaderProps) {
  const balance = user?.balance ?? INITIAL_BALANCE;

  // Simulated betting feed state
  const [bets, setBets] = useState<SimulatedBet[]>(generateInitialBets);
  const timeoutRefs = useRef<(NodeJS.Timeout | null)[]>([null, null]);

  // Update bet at a specific index with glitch animation
  const updateBet = useCallback((index: number) => {
    setBets(prev => {
      const newBets = [...prev];
      const usedUsernames = prev
        .filter((_, i) => i !== index)
        .map(b => b.username);
      const availableUsernames = REDDIT_USERNAMES.filter(
        name => !usedUsernames.includes(name)
      );
      const username = availableUsernames[
        Math.floor(Math.random() * availableUsernames.length)
      ];
      newBets[index] = {
        ...generateRandomBet(),
        username,
        isGlitching: true,
      };
      return newBets;
    });

    setTimeout(() => {
      setBets(prev => {
        const newBets = [...prev];
        newBets[index] = { ...newBets[index], isGlitching: false };
        return newBets;
      });
    }, 150);

    const nextDelay = Math.floor(Math.random() * 2000) + 1000;
    timeoutRefs.current[index] = setTimeout(() => updateBet(index), nextDelay);
  }, []);

  // Initialize independent update chains for each bet slot
  useEffect(() => {
    [0, 1].forEach((index) => {
      const initialDelay = Math.floor(Math.random() * 2000) + 500;
      timeoutRefs.current[index] = setTimeout(() => updateBet(index), initialDelay);
    });

    return () => {
      timeoutRefs.current.forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [updateBet]);

  // Increment timestamps every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setBets(prev => prev.map(bet => ({ ...bet, time: bet.time + 1 })));
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  return (
    <header className="relative z-10 w-full border-b-4 border-red-900/50 bg-black/80">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/logo/new_logo_cropped_transparent.png"
            alt="Grim Market"
            width={180}
            height={40}
            className="h-7 sm:h-10 w-auto"
            style={{ imageRendering: 'pixelated' }}
            priority
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Live Bets Feed */}
          <div className="hidden sm:flex items-center gap-4 overflow-hidden">
            {bets.map((bet, i) => (
              <div
                key={i}
                className={`text-[9px] flex items-baseline gap-x-1 ${bet.isGlitching ? 'glitch-bet' : ''}`}
              >
                <span className="text-gray-400 truncate max-w-[105px]">{bet.username}</span>
                <span className={`whitespace-nowrap ${bet.won ? 'text-green-500' : 'text-red-500'}`}>
                  {bet.won ? ' PUMP ' : ' RIP '}
                  {bet.won ? '+' : '-'}${bet.amount.toLocaleString()}
                </span>
                <span className="text-gray-600 whitespace-nowrap">{bet.time}s</span>
              </div>
            ))}
          </div>

          {user ? (
            <>
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-500/10 border-2 border-yellow-500/30">
                <CoinsIcon className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                <span className="text-yellow-400 text-[10px] sm:text-xs font-semibold">
                  {formatCurrency(balance)}
                </span>
              </div>
              <button
                onClick={onLogoutClick}
                className="px-2 sm:px-4 py-1 sm:py-1.5 text-[8px] sm:text-[10px] text-gray-400 hover:text-gray-200 transition-colors uppercase"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white text-[8px] sm:text-[10px] font-semibold border-2 border-red-800 transition-colors pixel-btn uppercase"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function CoinsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}
