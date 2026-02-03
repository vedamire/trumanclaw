import { NextResponse } from "next/server";
import { adminDb } from "@/lib/adminDb";
import {
  getTodayDate,
  getYesterdayDate,
  generateDeathCount,
  dateToUUID,
} from "@/lib/mockData";

const BASE_TODAY_COUNT = 170000; // Starting count for today if no record exists

// GET - Initialize stats and return current state
export async function GET() {
  const todayDate = getTodayDate();
  const yesterdayDate = getYesterdayDate();

  try {
    // Query existing stats
    const { dailyStats } = await adminDb.query({
      dailyStats: {
        $: { where: { date: { $in: [todayDate, yesterdayDate] } } },
      },
    });

    const todayStat = dailyStats.find((s) => s.date === todayDate);
    const yesterdayStat = dailyStats.find((s) => s.date === yesterdayDate);

    const transactions = [];

    // Get yesterday's count for capping (use generated value if not in DB yet)
    const yesterdayCount = yesterdayStat?.deathCount ?? generateDeathCount(yesterdayDate);

    // Calculate bounds: today's count must stay within ±10% of yesterday's count
    const minCount = Math.floor(yesterdayCount * 0.9);
    const maxCount = Math.ceil(yesterdayCount * 1.1);

    // Calculate new death count with random ±(1-22) change
    // Read current count from database, or start at yesterday's count
    const currentCount = todayStat?.deathCount ?? yesterdayCount;
    const change = Math.floor(Math.random() * 22) + 1; // Random 1-22
    const direction = Math.random() < 0.5 ? 1 : -1;    // 50/50 increase or decrease
    const uncappedCount = currentCount + (change * direction);

    // Cap the count to stay within 10% of yesterday's count
    const newDeathCount = Math.max(minCount, Math.min(maxCount, uncappedCount));

    // Use existing ID if record exists, otherwise create with deterministic UUID
    const todayId = todayStat?.id ?? dateToUUID(todayDate);
    transactions.push(
      adminDb.tx.dailyStats[todayId].update({
        date: todayDate,
        deathCount: newDeathCount,
        isResolved: false,
        createdAt: todayStat?.createdAt ?? Date.now(),
      })
    );

    // Create yesterday's stat if missing (always final count)
    if (!yesterdayStat) {
      const deathCount = generateDeathCount(yesterdayDate);
      const yesterdayId = dateToUUID(yesterdayDate);
      transactions.push(
        adminDb.tx.dailyStats[yesterdayId].update({
          date: yesterdayDate,
          deathCount,
          isResolved: true,
          createdAt: Date.now() - 86400000,
        })
      );
    }

    // Execute transactions
    if (transactions.length > 0) {
      await adminDb.transact(transactions);
    }

    return NextResponse.json({
      success: true,
      deathCount: newDeathCount,
      date: todayDate
    });
  } catch (error) {
    console.error("Error updating daily stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update daily stats" },
      { status: 500 }
    );
  }
}
