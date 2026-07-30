import type { DashboardConfig, DashboardNotification } from "@/types/dashboard";

export const dashboardConfig: DashboardConfig = {
  schoolName: "UNIDADE ESCOLAR JOÃO BARBOSA SOARES",
  location: "Jardim do Mulato-PI",
  date: "17 de Julho de 2026",
};

export const dashboardNotifications: DashboardNotification[] = [
  {
    id: "notif-1",
    type: "info",
    message:
      "Hoje é: Dia de Proteção às Florestas (Data Comemorativa Nacional)",
  },
  {
    id: "notif-2",
    type: "info",
    message: "Hoje é: 14 a 28 de julho (RECESSO MUNICIPAL)",
  },
  {
    id: "notif-3",
    type: "birthday",
    message: "Aniversariante: ROBERTA PEREIRA DE JESUS",
    detail: "5º ANO MANHÃ",
  },
  {
    id: "notif-4",
    type: "birthday",
    message: "Aniversariante: FRANCISCO JUNIOR DA COSTA VELOSO",
    detail: "6º ANO TARDE",
  },
  {
    id: "notif-5",
    type: "birthday",
    message: "Aniversariante: JOÃO DA CRUZ VELOSO",
    detail: "8º ANO TARDE",
  },
];
