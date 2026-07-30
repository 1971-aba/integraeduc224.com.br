export type MenuItem = {
  label: string;
  href?: string;
  children?: MenuItem[];
};

export type NotificationType = "info" | "birthday" | "alert" | "stats";

export type DashboardNotification = {
  id: string;
  type: NotificationType;
  message: string;
  detail?: string;
  highlight?: string;
};

export type DashboardConfig = {
  schoolName: string;
  location: string;
  date: string;
};
