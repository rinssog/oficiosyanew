import Link from "next/link";
import { Button } from "@/components/ui/button";

export type QuickFilter = { label: string; href: string };

export default function QuickFilters({ items }: { items: QuickFilter[] }) {
  return (
    <section className="flex flex-wrap gap-3 py-6">
      {items.map((filter) => (
        <Button
          asChild
          key={filter.label}
          variant="secondary"
          className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        >
          <Link href={filter.href}>{filter.label}</Link>
        </Button>
      ))}
    </section>
  );
}
