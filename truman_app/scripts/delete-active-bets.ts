import { init } from "@instantdb/admin";
import schema from "../src/instant.schema";

const adminDb = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
  schema,
});

async function deleteActiveBets() {
  const { bets } = await adminDb.query({
    bets: { $: { where: { isResolved: false } } },
  });

  console.log(`Found ${bets.length} active bets`);

  if (bets.length > 0) {
    await adminDb.transact(bets.map((b) => adminDb.tx.bets[b.id].delete()));
    console.log("Deleted all active bets");
  }
}

deleteActiveBets().catch(console.error);
