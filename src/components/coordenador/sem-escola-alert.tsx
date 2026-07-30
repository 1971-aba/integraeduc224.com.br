import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function SemEscolaAlert() {
  return (
    <Card className="mt-6 border-amber-200 bg-[#FFFDE7]">
      <CardTitle className="text-amber-900">Escola não vinculada</CardTitle>
      <CardDescription className="mt-2 text-amber-800">
        Seu perfil de coordenador precisa estar vinculado a uma unidade escolar.
        Solicite ao técnico do SGA a correção do cadastro.
      </CardDescription>
    </Card>
  );
}
