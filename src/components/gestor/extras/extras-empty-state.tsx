import Link from "next/link";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type ExtrasEmptyStateProps = {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
};

/** Telas de vínculo dependem de uma turma ou atividade já cadastrada. */
export function ExtrasEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: ExtrasEmptyStateProps) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardDescription className="mt-2">{description}</CardDescription>

      <Link
        href={actionHref}
        className="mt-4 inline-flex h-10 items-center rounded-lg bg-[#1E7BB8] px-4 text-sm font-medium text-white transition-colors hover:bg-[#186395]"
      >
        {actionLabel}
      </Link>
    </Card>
  );
}
