import { motion } from "framer-motion";
import { Chart } from "react-chartjs-2";
import api from "../../../config/axios";
import React, { useEffect, useState } from "react";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import { Users, FileText, LineChart, CheckCircle2, BarChart as BarChartIcon } from "lucide-react";
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
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const DashboardPage: React.FC = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [growth, setGrowth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [userStats, setUserStats] = useState<any>(null);
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const fetchDashboard = async (year: number) => {
    try {
      const res = await api.get(`/admin/dashboard?year=${year}`);
      const data = res.data.data;
      setUserStats(data.userStats || {});
      setRevenueStats(data.revenueStats || {});
    } catch (err) {
      console.error("Lỗi khi load dashboard:", err);
    }
  };

  const fetchRevenueChart = async (year: number) => {
    try {
      const chartRes = await api.get(`/admin/revenue-stats?type=month&year=${year}`);
      const chartData = chartRes.data.data || [];
      setRevenueData(chartData);

      const total = chartData.reduce((sum: number, item: any) => sum + item.totalRevenue, 0);
      setTotalRevenue(total);

      if (chartData.length > 1) {
        const current = chartData[chartData.length - 1]?.totalRevenue || 0;
        const prev = chartData[chartData.length - 2]?.totalRevenue || 0;
        const g = prev > 0 ? ((current - prev) / prev) * 100 : 0;
        setGrowth(g);
      } else {
        setGrowth(0);
      }
    } catch (err) {
      console.error("Lỗi khi load revenue:", err);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedYear);
    fetchRevenueChart(selectedYear);
  }, [selectedYear]);

  // Tạo nhãn 12 tháng
  const labels = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
  const dataByMonth = labels.map((_, i) => {
    const monthData = revenueData.find((item) => item.month === i + 1);
    return monthData ? monthData.totalRevenue : 0;
  });

  // Cấu hình dữ liệu chart - tối ưu cho cả line và bar
  const chartData = {
    labels,
    datasets: [
      {
        label: `Doanh thu năm ${selectedYear} (VND)`,
        data: dataByMonth,
        borderColor: "#2563eb",
        backgroundColor:
          chartType === "bar"
            ? "rgba(37, 99, 235, 0.5)"
            : "rgba(37, 99, 235, 0.2)",
        fill: chartType === "line",
        tension: chartType === "line" ? 0.3 : undefined,
        borderWidth: 2,
        pointBackgroundColor: "#2563eb",
        pointRadius: chartType === "line" ? 4 : 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" as const },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return `Doanh thu: ${value.toLocaleString("vi-VN")} ₫`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Tháng" },
        grid: { display: false },
      },
      y: {
        title: { display: true, text: "Doanh thu (VND)" },
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            return value.toLocaleString("vi-VN") + " ₫";
          },
        },
      },
    },
  };

  const years = [2025, 2026, 2027];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <LeftSidebarAdmin customHeight="h-auto w-64" />

      {/* Main content */}
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">
          Dashboard
        </h1>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            {
              title: "Tổng số người dùng",
              value: userStats?.totalUsers?.toLocaleString("vi-VN") || "0",
              change: `+${userStats?.growth ?? 0}% so với hôm qua`,
              icon: Users,
              color: "text-blue-600",
            },
            {
              title: "Tổng số bài thi đã làm",
              value: "10",
              change: "+1.3% so với tuần trước",
              icon: FileText,
              color: "text-orange-500",
            },
            {
              title: `Tổng doanh thu ${selectedYear}`,
              value: `${(revenueStats?.totalRevenue || 0).toLocaleString("vi-VN")} ₫`,
              change: `${revenueStats?.growth?.toFixed(1) ?? 0}% tăng trưởng`,
              icon: LineChart,
              color: "text-green-600",
            },
            {
              title: "Tỷ lệ hoàn thành bài",
              value: "80%",
              change: "+1.8% so với hôm qua",
              icon: CheckCircle2,
              color: "text-rose-500",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-semibold text-gray-700">{card.title}</h2>
                <card.icon className={`${card.color} w-7 h-7`} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-green-600 mt-1">{card.change}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Doanh thu theo tháng
            </h2>

            <div className="flex items-center gap-4">
              {/* Year Selector */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border text-sm border-gray-400 rounded-lg text-gray-700 focus:outline-none">
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              {/* Chart Type Toggle */}
              <div className="flex border border-gray-400 text-sm rounded-lg overflow-hidden">
                <button
                  onClick={() => setChartType("line")}
                  className={`px-4 py-2 flex items-center gap-2 transition-all ${
                    chartType === "line"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 bg-white hover:bg-gray-50"
                  }`}>
                  <LineChart className="w-4 h-4" />
                  Đường
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-4 py-2 flex items-center gap-2 transition-all ${
                    chartType === "bar"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 bg-white hover:bg-gray-50"
                  }`}>
                  <BarChartIcon className="w-4 h-4" />
                  Cột
                </button>
              </div>
            </div>
          </div>

          {/* Chart - DÙNG MỘT CHART DUY NHẤT */}
          <div className="h-96">
            <Chart
              type={chartType}
              data={chartData}
              options={options}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;