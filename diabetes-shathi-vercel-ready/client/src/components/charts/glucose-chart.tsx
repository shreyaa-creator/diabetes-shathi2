import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { GlucoseReading } from "@shared/schema";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GlucoseChartProps {
  data: GlucoseReading[];
  height?: number;
}

export function GlucoseChart({ data, height = 250 }: GlucoseChartProps) {
  const chartData = {
    labels: data.slice(-7).map((reading) => {
      const date = new Date(reading.measuredAt);
      return date.toLocaleDateString('bn-BD', { weekday: 'short' });
    }),
    datasets: [
      {
        label: "গ্লুকোজ লেভেল",
        data: data.slice(-7).map((reading) => reading.level),
        borderColor: "rgb(20, 184, 166)",
        backgroundColor: "rgba(20, 184, 166, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(20, 184, 166)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y} mmol/L`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 4,
        max: 12,
        grid: {
          color: "rgba(20, 184, 166, 0.1)",
        },
        ticks: {
          callback: (value: any) => `${value} mmol/L`,
        },
      },
      x: {
        grid: {
          color: "rgba(20, 184, 166, 0.1)",
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
