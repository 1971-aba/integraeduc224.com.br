import Link from "next/link";
import { FileText } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";

const documentos = [
  {
    href: "/gestor/documentos/declaracao",
    title: "Declaração de Matrícula",
    description: "Documento para comprovar vínculo do aluno com a escola",
    icon: FileText,
  },
  {
    href: "/gestor/documentos/historico",
    title: "Histórico Escolar",
    description: "Matrículas e rendimento do estudante",
    icon: FileText,
  },
  {
    href: "/gestor/documentos/autorizacao",
    title: "Autorizações",
    description: "Saída antecipada, uso de imagem e atividades externas",
    icon: FileText,
  },
] as const;

export default async function GestorDocumentosPage() {
  await requireRole(["gestor_escolar", "admin_sme"]);

  return (
    <>
      <GestorPageHeader
        title="Documentos"
        description="Declarações e fichas escolares"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documentos.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#E3F2FD] text-[#1E7BB8]">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
