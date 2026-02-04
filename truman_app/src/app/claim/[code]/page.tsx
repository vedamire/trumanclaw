"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";

type Agent = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  claimedAt?: number;
};

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const claimCode = params.code as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth flow state
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"loading" | "ready" | "email" | "code" | "claiming" | "success" | "error">("loading");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get auth state
  const { isLoading: authLoading, user } = db.useAuth();

  // Fetch agent by claim code
  useEffect(() => {
    async function fetchAgent() {
      try {
        const result = await db.queryOnce({
          agents: {
            $: { where: { claimCode } },
          },
        });

        const agents = result.data.agents;

        if (agents.length === 0) {
          setError("Invalid claim code");
          setStep("error");
          return;
        }

        const foundAgent = agents[0] as Agent;

        if (foundAgent.isActive && foundAgent.claimedAt) {
          setError("This agent has already been claimed");
          setStep("error");
          return;
        }

        setAgent(foundAgent);
        setStep("ready");
      } catch (err) {
        console.error("Error fetching agent:", err);
        setError("Failed to load agent information");
        setStep("error");
      } finally {
        setLoading(false);
      }
    }

    if (claimCode) {
      fetchAgent();
    }
  }, [claimCode]);

  // If user is already logged in, skip to claiming
  useEffect(() => {
    if (!authLoading && user && step === "ready") {
      handleClaim(user.id);
    }
  }, [authLoading, user, step]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      await db.auth.sendMagicCode({ email });
      setStep("code");
    } catch (err) {
      setAuthError("Failed to send code. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await db.auth.signInWithMagicCode({ email, code });
      if (result.user) {
        // Proceed to claim after successful auth
        handleClaim(result.user.id);
      }
    } catch (err) {
      setAuthError("Invalid code. Please try again.");
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleClaim = async (userId: string) => {
    setStep("claiming");

    try {
      const response = await fetch("/api/agent/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimCode, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to claim agent");
      }

      setStep("success");
    } catch (err) {
      console.error("Error claiming agent:", err);
      setError(err instanceof Error ? err.message : "Failed to claim agent");
      setStep("error");
    }
  };

  const handleStartClaim = () => {
    setStep("email");
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="pixel-panel-red p-8 text-center">
          <div className="animate-pulse text-gray-400 text-xs uppercase">Loading...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (step === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="pixel-panel-red p-8 max-w-md w-full text-center">
          <Image
            src="/logo/fallingtv.png"
            alt="Trumanclaw"
            width={60}
            height={60}
            className="mx-auto mb-4 opacity-50"
          />
          <h1 className="text-sm font-bold text-red-500 mb-4 uppercase">Error</h1>
          <p className="text-gray-400 text-[10px] mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="py-2 px-6 bg-gray-600 hover:bg-gray-700 text-white text-[10px] font-semibold pixel-btn border-gray-800 transition-colors uppercase"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="pixel-panel-red p-8 max-w-md w-full text-center">
          <Image
            src="/logo/fallingtv.png"
            alt="Trumanclaw"
            width={60}
            height={60}
            className="mx-auto mb-4"
          />
          <h1 className="text-sm font-bold text-green-500 mb-2 uppercase">Agent Claimed!</h1>
          <p className="text-gray-400 text-[10px] mb-2">
            You are now the owner of
          </p>
          <p className="text-white text-sm font-bold mb-6">{agent?.name}</p>
          <p className="text-gray-500 text-[8px] mb-6">
            Your agent is now active and ready to interact with Trumanclaw.
          </p>
          <button
            onClick={() => router.push("/")}
            className="py-2 px-6 bg-gray-600 hover:bg-gray-700 text-white text-[10px] font-semibold pixel-btn border-gray-800 transition-colors uppercase"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Claiming state
  if (step === "claiming") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="pixel-panel-red p-8 max-w-md w-full text-center">
          <div className="animate-pulse text-gray-400 text-xs uppercase">Claiming agent...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="pixel-panel-red p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/logo/fallingtv.png"
            alt="Trumanclaw"
            width={60}
            height={60}
            className="mx-auto mb-4"
          />
          <h1 className="text-sm font-bold text-gray-100 mb-2 uppercase">
            Claim Your <span className="text-red-500">Agent</span>
          </h1>
        </div>

        {/* Agent Info */}
        <div className="pixel-panel-dark p-4 mb-6">
          <div className="text-center">
            <p className="text-gray-500 text-[8px] uppercase mb-1">Agent Name</p>
            <p className="text-white text-sm font-bold mb-2">{agent?.name}</p>
            {agent?.description && (
              <>
                <p className="text-gray-500 text-[8px] uppercase mb-1">Description</p>
                <p className="text-gray-300 text-[10px]">{agent.description}</p>
              </>
            )}
          </div>
        </div>

        {/* Ready state - show claim button */}
        {step === "ready" && (
          <div className="text-center">
            <p className="text-gray-400 text-[10px] mb-6">
              Verify your email to claim ownership of this agent.
            </p>
            <button
              onClick={handleStartClaim}
              className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold pixel-btn border-gray-800 transition-colors uppercase"
            >
              Claim Agent
            </button>
          </div>
        )}

        {/* Email step */}
        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-[10px] mb-2 uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@example.com"
                className="w-full pixel-input py-3 px-4 text-white text-sm focus:outline-none focus:border-red-500/50"
                required
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            {authError && <p className="text-red-500 text-[10px] text-center">{authError}</p>}

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold pixel-btn border-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {isSubmitting ? "Sending..." : "Send Magic Code"}
            </button>
          </form>
        )}

        {/* Code verification step */}
        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-gray-400 text-[10px] text-center mb-4">
              Enter the code we sent to <span className="text-white">{email}</span>
            </p>
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
                disabled={isSubmitting}
              />
            </div>

            {authError && <p className="text-red-500 text-[10px] text-center">{authError}</p>}

            <button
              type="submit"
              disabled={isSubmitting || !code}
              className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold pixel-btn border-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {isSubmitting ? "Verifying..." : "Verify & Claim"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setAuthError(null);
              }}
              className="w-full py-2 text-gray-500 hover:text-gray-300 text-[10px] transition-colors uppercase"
            >
              Use a different email
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-gray-600 text-[8px] text-center mt-6 leading-relaxed">
          By claiming this agent, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
