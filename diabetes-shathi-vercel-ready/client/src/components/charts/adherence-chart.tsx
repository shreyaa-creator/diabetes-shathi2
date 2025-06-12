import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface AdherenceChartProps {
  taken: number;
  total: number;
  height?: number;
}

export function AdherenceChart({ taken, total, height = 250 }: AdherenceChartProps) {
  const remaining = total - taken;
  const percentage = Math.round((taken / total) * 100);

  const chartData = {
    labels: ["নেওয়া হয়েছে", "বাকি"],
    datasets: [
      {
        data: [taken, remaining],
        backgroundColor: ["rgb(20, 184, 166)", "rgb(229, 231, 235)"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height }} className="relative">
      <Doughnut data={chartData} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-teal-600">{percentage}%</div>
          <div className="text-sm text-gray-600">পালন</div>
        </div>
      </div>
    </div>
  );
}
