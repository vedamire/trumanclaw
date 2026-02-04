import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/adminDb";

// POST - Claim an agent (link to authenticated user)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { claimCode, userId } = body;

    // Validate input
    if (!claimCode || typeof claimCode !== "string") {
      return NextResponse.json(
        { success: false, error: "Claim code is required" },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Find agent by claim code
    const { agents } = await adminDb.query({
      agents: {
        $: { where: { claimCode } },
      },
    });

    if (agents.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid claim code" },
        { status: 404 }
      );
    }

    const agent = agents[0];

    // Check if already claimed
    if (agent.isActive && agent.claimedAt) {
      return NextResponse.json(
        { success: false, error: "This agent has already been claimed" },
        { status: 400 }
      );
    }

    // Verify user exists
    const { $users } = await adminDb.query({
      $users: {
        $: { where: { id: userId } },
      },
    });

    if ($users.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Claim the agent - link to user, activate, set claimedAt
    await adminDb.transact([
      adminDb.tx.agents[agent.id].update({
        isActive: true,
        claimedAt: Date.now(),
      }),
      adminDb.tx.agents[agent.id].link({ owner: userId }),
    ]);

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
      },
    });
  } catch (error) {
    console.error("Error claiming agent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to claim agent" },
      { status: 500 }
    );
  }
}
