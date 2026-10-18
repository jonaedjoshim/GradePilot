import {
  LayoutDashboard,
  Calculator,
  TrendingUp,
  Lightbulb,
  ChartNoAxesCombined,
  Info,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    description: "Academic overview",
    icon: LayoutDashboard,
  },
  {
    to: "/calculator",
    label: "Calculator",
    description: "GPA & CGPA",
    icon: Calculator,
  },
  {
    to: "/prediction",
    label: "Prediction",
    description: "Future performance",
    icon: TrendingUp,
  },
  {
    to: "/improvement",
    label: "Improvement",
    description: "Grade optimization",
    icon: Lightbulb,
  },
  {
    to: "/insights",
    label: "Insights",
    description: "Academic analytics",
    icon: ChartNoAxesCombined,
  },
  {
    to: "/about",
    label: "About",
    description: "About GradePilot",
    icon: Info,
  },
];

export function getCurrentPage(pathname) {
  return (
    NAV_ITEMS.find(
      (item) =>
        item.to === pathname ||
        (item.to !== "/" && pathname.startsWith(`${item.to}/`)),
    ) ?? NAV_ITEMS[0]
  );
}
