import { redirect } from "next/navigation";

export default function GestorSalaDeAulaRealizarFrequenciaIndexPage() {
  redirect(
    "/gestor/consultas/sala-de-aula/frequencia-turma/realizar/diaria",
  );
}
