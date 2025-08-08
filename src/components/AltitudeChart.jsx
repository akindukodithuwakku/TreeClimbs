import React, { useRef, useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AltitudeChart = ({ altitudeData, sessionStartTime, isLive = true }) => {
  const [chartType, setChartType] = useState("line");
  const [timeRange, setTimeRange] = useState("all");

  // Filter data based on time range and session start time
  const getFilteredData = () => {
    if (timeRange === "all") return altitudeData;

    const rangeSeconds =
      {
        "1h": 3600,
        "30m": 1800,
        "15m": 900,
        "5m": 300,
      }[timeRange] || 0;

    if (rangeSeconds > 0 && sessionStartTime) {
      // For live sessions, filter from current time backwards
      if (isLive) {
        const now = Date.now() / 1000;
        const cutoffTime = now - rangeSeconds;
        return altitudeData.filter((d) => d.timestamp >= cutoffTime);
      } else {
        // For past sessions, filter from session end time backwards
        const sessionEndTime =
          altitudeData.length > 0
            ? altitudeData[altitudeData.length - 1].timestamp
            : sessionStartTime;
        const cutoffTime = sessionEndTime - rangeSeconds;
        return altitudeData.filter((d) => d.timestamp >= cutoffTime);
      }
    }

    return altitudeData;
  };

  const filteredData = getFilteredData();

  const chartData = {
    labels: filteredData.map((d) => {
      if (sessionStartTime) {
        // Show time relative to session start
        const timeFromStart = d.timestamp - sessionStartTime;
        const minutes = Math.floor(timeFromStart / 60);
        const seconds = Math.floor(timeFromStart % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      } else {
        // Fallback to absolute time
        const date = new Date(d.timestamp * 1000);
        return date.toLocaleTimeString();
      }
    }),
    datasets: [
      {
        label: "Altitude (m)",
        data: filteredData.map((d) => d.altitude),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor:
          chartType === "line"
            ? "rgba(75, 192, 192, 0.2)"
            : "rgba(75, 192, 192, 0.8)",
        fill: chartType === "line",
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    animation: {
      duration: isLive ? 300 : 0, // Smooth animation for live data
    },
    scales: {
      x: {
        title: {
          display: true,
          text: sessionStartTime ? "Time from Session Start" : "Time",
          font: { weight: "bold" },
        },
        ticks: {
          maxTicksLimit: window.innerWidth < 768 ? 5 : 10,
          maxRotation: 45,
        },
      },
      y: {
        title: {
          display: true,
          text: "Altitude (m)",
          font: { weight: "bold" },
        },
        suggestedMin: 0,
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          title: function (context) {
            const dataPoint = filteredData[context[0].dataIndex];
            const timestamp = dataPoint.timestamp;

            if (sessionStartTime) {
              const timeFromStart = timestamp - sessionStartTime;
              const minutes = Math.floor(timeFromStart / 60);
              const seconds = Math.floor(timeFromStart % 60);
              return `Session Time: ${minutes}:${seconds
                .toString()
                .padStart(2, "0")} (${new Date(
                timestamp * 1000
              ).toLocaleTimeString()})`;
            } else {
              return new Date(timestamp * 1000).toLocaleString();
            }
          },
          label: function (context) {
            return `Altitude: ${context.parsed.y.toFixed(1)}m`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
        </select>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Data</option>
          <option value="1h">Last Hour</option>
          <option value="30m">Last 30 Min</option>
          <option value="15m">Last 15 Min</option>
          <option value="5m">Last 5 Min</option>
        </select>
      </div>

      <div
        className="relative bg-white p-4 rounded-lg shadow-sm"
        style={{ height: "400px" }}
      >
        {chartType === "line" ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>

      <div className="text-center text-sm text-gray-500">
        Showing {filteredData.length} of {altitudeData.length} readings
        {timeRange !== "all" && ` (${timeRange} time range)`}
        {isLive && (
          <span className="ml-2 inline-flex items-center">
            <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Live
          </span>
        )}
      </div>
    </div>
  );
};

export default AltitudeChart;
