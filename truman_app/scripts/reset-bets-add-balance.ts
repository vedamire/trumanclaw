import { init } from "@instantdb/admin";
import schema from "../src/instant.schema";

const adminDb = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
  schema,
});

async function resetBetsAndAddBalance() {
  console.log("Starting reset...");

  // Query all active (unresolved) bets
  const { bets } = await adminDb.query({
    bets: {
      $: { where: { isResolved: false } },
    },
  });

  console.log(`Found ${bets.length} active bets to remove`);

  // Delete all active bets
  const deleteBetTxs = bets.map((bet) => adminDb.tx.bets[bet.id].delete());

  if (deleteBetTxs.length > 0) {
    await adminDb.transact(deleteBetTxs);
    console.log(`Deleted ${deleteBetTxs.length} active bets`);
  }

  // Query all users
  const { $users } = await adminDb.query({
    $users: {},
  });

  console.log(`Found ${$users.length} users to update`);

  // Add $2000 to each user's balance
  const updateUserTxs = $users.map((user) => {
    const currentBalance = user.balance ?? 0;
    const newBalance = currentBalance + 2000;
    console.log(`User ${user.id}: ${currentBalance} -> ${newBalance}`);
    return adminDb.tx.$users[user.id].update({
      balance: newBalance,
    });
  });

  if (updateUserTxs.length > 0) {
    await adminDb.transact(updateUserTxs);
    console.log(`Updated ${updateUserTxs.length} users with +$2000`);
  }

  console.log("Done!");
}

resetBetsAndAddBalance().catch(console.error);
