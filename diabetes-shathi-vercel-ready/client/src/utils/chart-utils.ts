export const chartColors = {
  primary: "rgb(20, 184, 166)",
  secondary: "rgb(16, 185, 129)",
  tertiary: "rgb(6, 182, 212)",
  quaternary: "rgb(139, 92, 246)",
  quinary: "rgb(245, 158, 11)",
  success: "rgb(34, 197, 94)",
  warning: "rgb(251, 191, 36)",
  danger: "rgb(239, 68, 68)",
  gray: "rgb(156, 163, 175)",
};

export const chartColorsPalette = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.tertiary,
  chartColors.quaternary,
  chartColors.quinary,
];

export function getColorWithOpacity(color: string, opacity: number): string {
  return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
}

export function getGlucoseStatus(level: number): {
  status: string;
  color: string;
  bgColor: string;
} {
  if (level < 4.0) {
    return {
      status: "Low",
      color: "text-red-600",
      bgColor: "bg-red-100",
    };
  } else if (level <= 7.0) {
    return {
      status: "Normal",
      color: "text-green-600",
      bgColor: "bg-green-100",
    };
  } else if (level <= 10.0) {
    return {
      status: "High",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    };
  } else {
    return {
      status: "Very High",
      color: "text-red-600",
      bgColor: "bg-red-100",
    };
  }
}

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getWeeklyLabels(): string[] {
  return ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];
}

export function getMonthlyLabels(): string[] {
  return [
    "জানু", "ফেব", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগ", "সেপ্ট", "অক্টো", "নভে", "ডিসে"
  ];
}
