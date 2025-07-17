import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import type { DashboardStats } from '../../../hooks/useDashboardStats';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ReportsCreatedChartProps {
  chartData: DashboardStats['reportsCreatedOverTime'];
  theme: string;
}

const ReportsCreatedChart: React.FC<ReportsCreatedChartProps> = ({ chartData, theme }) => {
  const textColor = theme === 'dark' ? '#adb5bd' : '#495057';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const brandColor = 'rgba(25, 135, 84, 1)'; // Bootstrap success color

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Reports Created (Last 30 Days)', color: textColor, font: { size: 16 } },
    },
    scales: {
      x: { 
        ticks: { color: textColor },
        grid: { display: false },
      },
      y: { 
        ticks: { color: textColor },
        grid: { color: gridColor },
        beginAtZero: true
      }
    },
    elements: {
        line: {
            tension: 0.3
        }
    }
  };

  const data = {
    labels: chartData.labels,
    datasets: [{
      label: 'Reports Created',
      data: chartData.data,
      borderColor: brandColor,
      backgroundColor: 'rgba(25, 135, 84, 0.2)',
      pointBackgroundColor: brandColor,
      fill: true,
    }],
  };

  return <Line options={options} data={data} />;
};

export default ReportsCreatedChart;
