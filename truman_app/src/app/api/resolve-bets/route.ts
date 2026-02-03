import { NextResponse } from "next/server";
import { adminDb } from "@/lib/adminDb";
import { getTodayDate } from "@/lib/mockData";
import { PAYOUT_MULTIPLIER } from "@/lib/gameLogic";

// POST - Resolve expired bets
export async function POST() {
  const now = Date.now();

  try {
    // Query unresolved bets that have expired
    const { bets } = await adminDb.query({
      bets: {
        $: { where: { isResolved: false, expiresAt: { $lte: now } } },
        user: {},
      },
    });

    if (bets.length === 0) {
      return NextResponse.json({ success: true, resolved: 0 });
    }

    // Get current death count from dailyStats (for grim bets)
    const todayDate = getTodayDate();
    const { dailyStats } = await adminDb.query({
      dailyStats: {
        $: { where: { date: todayDate } },
      },
    });

    const todayStat = dailyStats[0];
    const currentDeathCount = todayStat?.deathCount ?? 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transactions: any[] = [];

    // Process each expired bet
    for (const bet of bets) {
      const betType = bet.betType ?? "grim"; // Default to grim for legacy bets

      let won: boolean | null;
      let payout: number;

      if (betType === "mirage") {
        // Mirage bet resolution: random 50/50 outcome
        const prediction = bet.prediction as "yeah" | "nah";
        const subjectSurvived = Math.random() >= 0.5; // 50% chance

        if (
          (prediction === "yeah" && subjectSurvived) ||
          (prediction === "nah" && !subjectSurvived)
        ) {
          // Win
          won = true;
          payout = bet.amount * PAYOUT_MULTIPLIER;
        } else {
          // Loss
          won = false;
          payout = 0;
        }

        // Update mirage bet
        transactions.push(
          adminDb.tx.bets[bet.id].update({
            isResolved: true,
            won,
            payout,
          })
        );
      } else {
        // Grim bet resolution: based on death count
        if (!todayStat) {
          // Skip grim bets if no daily stats available
          continue;
        }

        const snapshotCount = bet.snapshotDeathCount ?? 0;
        const prediction = bet.prediction as "higher" | "lower";

        if (currentDeathCount === snapshotCount) {
          // Push - return original bet
          won = null;
          payout = bet.amount;
        } else if (
          (prediction === "higher" && currentDeathCount > snapshotCount) ||
          (prediction === "lower" && currentDeathCount < snapshotCount)
        ) {
          // Win
          won = true;
          payout = bet.amount * PAYOUT_MULTIPLIER;
        } else {
          // Loss
          won = false;
          payout = 0;
        }

        // Update grim bet
        transactions.push(
          adminDb.tx.bets[bet.id].update({
            isResolved: true,
            won,
            payout,
            resolveDeathCount: currentDeathCount,
          })
        );
      }

      // Update user balance if they won or pushed
      // Note: bet.user is a has-one relation, so it's an object not an array
      const betUser = bet.user as { id: string; balance?: number } | undefined;
      if (payout > 0 && betUser?.id) {
        const userId = betUser.id;
        const currentBalance = betUser.balance ?? 0;
        transactions.push(
          adminDb.tx.$users[userId].update({
            balance: currentBalance + payout,
          })
        );
      }
    }

    // Execute all transactions
    if (transactions.length > 0) {
      await adminDb.transact(transactions);
    }

    return NextResponse.json({
      success: true,
      resolved: bets.length,
      currentDeathCount,
    });
  } catch (error) {
    console.error("Error resolving bets:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resolve bets" },
      { status: 500 }
    );
  }
}
