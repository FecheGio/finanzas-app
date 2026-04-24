import CardExpensePageClient from "./CardExpensePageClient";

export default function NewCardExpensePage({
  searchParams,
}: {
  searchParams: { cardId?: string };
}) {
  return <CardExpensePageClient defaultCardId={searchParams.cardId ?? null} />;
}
