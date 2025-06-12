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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendChartProps {
  data: Array<{ label: string; value: number }>;
  height?: number;
  color?: string;
}

export function TrendChart({ 
  data, 
  height = 250, 
  color = "rgb(20, 184, 166)" 
}: TrendChartProps) {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: "ট্রেন্ড",
        data: data.map(item => item.value),
        borderColor: color,
        backgroundColor: `${color.replace('rgb', 'rgba').replace(')', ', 0.1)')}`,
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
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
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(20, 184, 166, 0.1)",
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
