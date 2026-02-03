"use client";

import { useState } from "react";
import Image from "next/image";
import { db } from "@/lib/db";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      await db.auth.sendMagicCode({ email });
      setStep("code");
    } catch (err) {
      setError("Failed to send code. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsLoading(true);
    setError(null);

    try {
      await db.auth.signInWithMagicCode({ email, code });
      onClose();
      setStep("email");
      setEmail("");
      setCode("");
    } catch (err) {
      setError("Invalid code. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep("email");
    setCode("");
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative pixel-panel-red p-8 max-w-md w-full mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <XIcon className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/logo/new_grim_logo.png"
            alt="Grim Market"
            width={80}
            height={80}
            className="mx-auto mb-4"
            style={{ imageRendering: 'pixelated' }}
          />
          <h2 className="text-sm font-bold text-gray-100 mb-2 uppercase">
            Enter the <span className="text-red-500">Grim Market</span>
          </h2>
          <p className="text-gray-500 text-[10px] leading-relaxed">
            {step === "email"
              ? "Sign in to place your bets and test your mortality intuition"
              : "Enter the code we sent to your email"}
          </p>
        </div>

        {/* Auth form */}
        {step === "email" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-[10px] mb-2 uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reaper@example.com"
                className="w-full pixel-input py-3 px-4 text-white text-sm focus:outline-none focus:border-red-500/50"
                required
              />
            </div>

            {error && <p className="text-red-500 text-[10px] text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold pixel-btn border-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {isLoading ? "Sending..." : "Send Magic Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-[10px] mb-2 uppercase">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full pixel-input py-3 px-4 text-white text-center text-lg tracking-widest focus:outline-none focus:border-red-500/50"
                required
                autoFocus
              />
            </div>

            {error && <p className="text-red-500 text-[10px] text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || !code}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold pixel-btn border-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {isLoading ? "Verifying..." : "Sign In"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="w-full py-2 text-gray-500 hover:text-gray-300 text-[10px] transition-colors uppercase"
            >
              Use a different email
            </button>
          </form>
        )}

        {/* Terms */}
        <p className="text-gray-600 text-[8px] text-center mt-6 leading-relaxed">
          By signing in, you agree to our Terms of Service and Privacy Policy.
          <br />
          <span className="text-red-600/60">All bets are for entertainment only.</span>
        </p>
      </div>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

