import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import type { DashboardStats } from '../../../hooks/useDashboardStats';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ReportsByFolderChartProps {
  chartData: DashboardStats['reportsByFolder'];
  theme: string;
}

const ReportsByFolderChart: React.FC<ReportsByFolderChartProps> = ({ chartData, theme }) => {
  const textColor = theme === 'dark' ? '#adb5bd' : '#495057';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Reports per Folder', color: textColor, font: { size: 16 } },
    },
    scales: {
        x: { 
            ticks: { color: textColor },
            grid: { color: gridColor },
        },
        y: { 
            ticks: { color: textColor },
            grid: { color: gridColor },
            beginAtZero: true,
        }
    }
  };

  const data = {
    labels: chartData.labels,
    datasets: [{
      label: 'Reports',
      data: chartData.data,
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  };

  return <Bar options={options} data={data} />;
};

export default ReportsByFolderChart;
