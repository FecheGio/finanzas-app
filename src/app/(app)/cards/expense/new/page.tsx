import CardExpensePageClient from "./CardExpensePageClient";

export default function NewCardExpensePage({
  searchParams,
}: {
  searchParams: { cardId?: string; subscription?: string };
}) {
  return (
    <CardExpensePageClient
      defaultCardId={searchParams.cardId ?? null}
      defaultSubscription={searchParams.subscription === "true"}
    />
  );
}
