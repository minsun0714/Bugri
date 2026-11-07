import type { LedgerEntry } from "@/api/contracts";
import { initialBugCoin } from "@/mocks/shop-items";

/** Display fixtures, not a learning reward policy. Total equals the original demo credit. */
export const coinHistory: readonly Omit<
  LedgerEntry,
  "id" | "reference"
>[] = Array.from({ length: 25 }, (_, index) => ({
  amount: initialBugCoin / 25,
  reason: "SEED" as const,
  createdAt: new Date(
    Date.UTC(2025, 11, index + 7, 0),
  ).toISOString(),
}));

export function demoCoinHistory(
  userId: string,
): LedgerEntry[] {
  return coinHistory.map((entry, index) => ({
    ...entry,
    id: `seed-coin-history-${userId}-${index + 1}`,
    reference: userId,
  }));
}
