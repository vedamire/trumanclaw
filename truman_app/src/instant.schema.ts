// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
      balance: i.number().optional(),
      totalWins: i.number().optional(),
      totalLosses: i.number().optional(),
      createdAt: i.number().indexed().optional(),
    }),
    dailyStats: i.entity({
      date: i.string().unique().indexed(),
      deathCount: i.number(),
      isResolved: i.boolean().indexed(),
      createdAt: i.number(),
    }),
    bets: i.entity({
      amount: i.number(),
      prediction: i.string(), // "higher" | "lower" for grim, "yeah" | "nah" for mirage
      betType: i.string().indexed().optional(), // "grim" | "mirage"
      expiresAt: i.number().indexed(), // timestamp when bet resolves
      snapshotDeathCount: i.number().optional(), // death count at bet time (grim only)
      resolveDeathCount: i.number().optional(), // death count at resolution time (grim only)
      isResolved: i.boolean().indexed(),
      won: i.boolean().optional(),
      payout: i.number().optional(),
      createdAt: i.number().indexed(),
    }),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    userBets: {
      forward: {
        on: "bets",
        has: "one",
        label: "user",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "bets",
      },
    },
  },
  rooms: {},
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
