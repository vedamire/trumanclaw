import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/adminDb";
import { id } from "@instantdb/admin";
import { createHash, randomUUID } from "crypto";

const ALLOWED_ORIGINS = [
  "https://trumanclaw.com",
  "https://www.trumanclaw.com",
  "http://localhost:5173",
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

function generateApiKey(): string {
  return `tc_${randomUUID().replace(/-/g, "")}`;
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

// POST - Register a new agent
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    const body = await request.json();
    const { name } = body;

    // Validate name
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Agent name is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 3) {
      return NextResponse.json(
        { success: false, error: "Agent name must be at least 3 characters" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (trimmedName.length > 50) {
      return NextResponse.json(
        { success: false, error: "Agent name must be 50 characters or less" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generate API key and hash
    const apiKey = generateApiKey();
    const apiKeyHash = hashApiKey(apiKey);
    const apiKeyPrefix = apiKey.substring(0, 12) + "...";

    // Create agent in database
    const agentId = id();
    await adminDb.transact(
      adminDb.tx.agents[agentId].update({
        name: trimmedName,
        apiKeyHash,
        apiKeyPrefix,
        createdAt: Date.now(),
        isActive: true,
      })
    );

    return NextResponse.json(
      {
        success: true,
        agentId,
        apiKey, // Only returned once - user must save it!
        apiKeyPrefix,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error registering agent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register agent" },
      { status: 500, headers: corsHeaders }
    );
  }
}
