import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import api from "../../../config/axios";
import React, { useEffect, useState } from "react";
import { Users, FileText, LineChart, CheckCircle2 } from "lucide-react";
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
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DashboardPage: React.FC = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [growth, setGrowth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [userStats, setUserStats] = useState<any>(null);
  const [revenueStats, setRevenueStats] = useState<any>(null);

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
      } else setGrowth(0);
    } catch (err) {
      console.error("Lỗi khi load revenue:", err);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedYear); 
    fetchRevenueChart(selectedYear);
  }, [selectedYear]);

  const labels = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
  const dataByMonth = labels.map((_, i) => {
    const monthData = revenueData.find((item) => item.month === i + 1);
    return monthData ? monthData.totalRevenue : 0;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: `Doanh thu năm ${selectedYear} (VND)`,
        data: dataByMonth,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: {
      x: { title: { display: true, text: "Tháng" } },
      y: { title: { display: true, text: "Doanh thu (VND)" }, beginAtZero: true },
    },
  };

  const years = [2024, 2025, 2026];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <LeftSidebarAdmin customHeight="h-auto w-64" />

      {/* Main content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
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
              value: `${(revenueStats?.totalRevenue || 0).toLocaleString("vi-VN")} đ`,
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
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-semibold text-gray-700">
                  {card.title}
                </h2>
                <card.icon className={`${card.color} w-7 h-7`} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-green-600 mt-1">{card.change}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Doanh thu theo tháng
            </h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <Line data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
