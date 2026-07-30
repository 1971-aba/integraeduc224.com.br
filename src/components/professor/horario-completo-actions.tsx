"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HorarioCompletoActions() {
  return (
    <Button type="button" onClick={() => window.print()}>
      <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
      Imprimir horário
    </Button>
  );
}
