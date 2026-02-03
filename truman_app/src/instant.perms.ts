// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  $users: {
    allow: {
      view: "true",
      update: "auth.id == data.id",
    },
  },
  dailyStats: {
    allow: {
      view: "true",
      create: "true", // Allow creating daily stats (mock data)
      update: "false",
      delete: "false",
    },
  },
  bets: {
    allow: {
      view: "isOwner",
      create: "auth.id != null",
      update: "false",
      delete: "false",
    },
    bind: ["isOwner", "auth.id in data.ref('user.id')"],
  },
} satisfies InstantRules;

export default rules;
