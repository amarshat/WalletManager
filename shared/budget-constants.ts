// Default budget categories with icons and colors
export const DEFAULT_BUDGET_CATEGORIES = [
  {
    name: "Housing",
    color: "#2563EB", // Blue
    icon: "home"
  },
  {
    name: "Transportation",
    color: "#7C3AED", // Purple
    icon: "car"
  },
  {
    name: "Food & Dining",
    color: "#10B981", // Green
    icon: "utensils"
  },
  {
    name: "Utilities",
    color: "#F59E0B", // Amber
    icon: "plug"
  },
  {
    name: "Entertainment",
    color: "#EC4899", // Pink
    icon: "film"
  },
  {
    name: "Healthcare",
    color: "#EF4444", // Red
    icon: "heart-pulse"
  },
  {
    name: "Shopping",
    color: "#8B5CF6", // Violet
    icon: "shopping-bag"
  },
  {
    name: "Personal Care",
    color: "#6366F1", // Indigo
    icon: "scissors"
  },
  {
    name: "Education",
    color: "#0EA5E9", // Sky
    icon: "book"
  },
  {
    name: "Savings",
    color: "#14B8A6", // Teal
    icon: "piggy-bank"
  },
  {
    name: "Debt Payments",
    color: "#F43F5E", // Rose
    icon: "credit-card"
  },
  {
    name: "Miscellaneous",
    color: "#64748B", // Slate
    icon: "more-horizontal"
  }
];

// For budget periods
export enum BudgetPeriod {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUAL = "annual"
}