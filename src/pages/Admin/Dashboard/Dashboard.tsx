import { motion } from "framer-motion";
import { Chart } from "react-chartjs-2";
import api from "../../../config/axios";
import React, { useEffect, useRef, useState } from "react";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import { Users, FileText, TrendingUp, CheckCircle2, BarChart2, Activity, LayoutDashboard, Download } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, LineController, BarController } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const YEARS = [2024, 2025, 2026, 2027];

const CHART_COLORS = {
  indigo: "#6366f1",
  indigoLight: "rgba(99, 102, 241, 0.15)",
  indigoBorder: "rgba(99, 102, 241, 0.35)",
  indigoBar: "rgba(99, 102, 241, 0.75)",
};

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  accent,
  index,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  accent: string;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.07 }}
    whileHover={{ y: -2 }}
    className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-4.5 h-4.5" strokeWidth={1.8} />
      </span>
    </div>
    <p className="text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
    <p className="text-xs text-gray-400">{change}</p>
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [userStats, setUserStats] = useState<any>(null);
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [testStats, setTestStats] = useState<any>(null);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const chartRef = useRef<any>(null);

  const fetchDashboard = async (year: number) => {
    try {
      const res = await api.get(`/admin/dashboard?year=${year}`);
      const data = res.data.data;
      setUserStats(data.userStats || {});
      setRevenueStats(data.revenueStats || {});
      setTestStats(data.testStats || {});
    } catch (err) {
      console.error("Lỗi khi load dashboard:", err);
    }
  };

  const fetchRevenueChart = async (year: number) => {
    try {
      const chartRes = await api.get(`/admin/revenue-stats?type=month&year=${year}`);
      const chartData = chartRes.data.data || [];
      setRevenueData(chartData);
      setTotalRevenue(chartData.reduce((sum: number, item: any) => sum + item.totalRevenue, 0));
    } catch (err) {
      console.error("Lỗi khi load revenue:", err);
    }
  };

  const handleExportChart = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement("a");
      link.href = url;
      link.download = `doanh-thu-${selectedYear}.png`;
      link.click();
    }
  };

  useEffect(() => {
    fetchDashboard(selectedYear);
    fetchRevenueChart(selectedYear);
  }, [selectedYear]);

  const labels = Array.from({ length: 12 }, (_, i) => `T${i + 1}`);
  const dataByMonth = labels.map((_, i) => {
    const found = revenueData.find((item) => item.month === i + 1);
    return found ? found.totalRevenue : 0;
  });

  const completionRate =
    testStats?.totalAttempts > 0
      ? Math.round((testStats.completedAttempts / testStats.totalAttempts) * 100)
      : 0;

  const chartData = {
    labels,
    datasets: [
      {
        label: `Doanh thu ${selectedYear}`,
        data: dataByMonth,
        borderColor: CHART_COLORS.indigo,
        backgroundColor:
          chartType === "bar" ? CHART_COLORS.indigoBar : CHART_COLORS.indigoLight,
        fill: chartType === "line",
        tension: chartType === "line" ? 0.4 : undefined,
        borderWidth: chartType === "line" ? 2 : 0,
        pointBackgroundColor: CHART_COLORS.indigo,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: chartType === "line" ? 4 : 0,
        pointHoverRadius: chartType === "line" ? 6 : 0,
        borderRadius: chartType === "bar" ? 6 : 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e1b4b",
        titleColor: "#c7d2fe",
        bodyColor: "#e0e7ff",
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (context: any) =>
            `  ${context.parsed.y.toLocaleString("vi-VN")} ₫`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#9ca3af",
          font: { size: 12 },
        },
      },
      y: {
        grid: {
          color: "rgba(0,0,0,0.04)",
          drawBorder: false,
        },
        border: { display: false, dash: [4, 4] },
        beginAtZero: true,
        ticks: {
          color: "#9ca3af",
          font: { size: 12 },
          callback: (value: any) => {
            if (value >= 1_000_000)
              return `${(value / 1_000_000).toFixed(0)}M ₫`;
            if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K ₫`;
            return `${value} ₫`;
          },
        },
      },
    },
  };

  const statCards = [
    {
      title: "Tổng người dùng",
      value: userStats?.totalUsers?.toLocaleString("vi-VN") ?? "—",
      change: `+${userStats?.growth ?? 0}% so với hôm qua`,
      icon: Users,
      accent: "bg-indigo-50 text-indigo-500",
    },
    {
      title: `Doanh thu ${selectedYear}`,
      value: `${(revenueStats?.totalRevenue || 0).toLocaleString("vi-VN")} ₫`,
      change: `${revenueStats?.growth?.toFixed(1) ?? 0}% so với năm trước`,
      icon: TrendingUp,
      accent: "bg-violet-50 text-violet-500",
    },
    {
      title: "Lượt thi TOEIC",
      value: testStats?.totalAttempts?.toLocaleString("vi-VN") ?? "—",
      change: "Tổng hợp đến hiện tại",
      icon: FileText,
      accent: "bg-purple-50 text-purple-500",
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: `${completionRate}%`,
      change: "Hoàn thành / Tổng lượt thi",
      icon: CheckCircle2,
      accent: "bg-fuchsia-50 text-fuchsia-500",
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#f5f4fb]">
      <LeftSidebarAdmin customHeight="h-auto w-64" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-indigo-400" strokeWidth={1.8} />
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">Tổng quan</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Theo dõi người dùng, doanh thu và hoạt động học tập</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <StatCard key={i} {...card} index={i} />
          ))}
        </div>

        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* Chart header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-0.5">Doanh thu theo tháng</p>
              <p className="text-xl font-semibold text-gray-900">{totalRevenue.toLocaleString("vi-VN")} ₫</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Year selector */}
              <select value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-9 px-3 text-sm rounded-xl border border-gray-200 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* Chart type toggle */}
              <div className="flex h-9 rounded-xl border border-gray-200 overflow-hidden text-sm">
                <button
                  onClick={() => setChartType("line")}
                  className={`px-3 flex items-center gap-1.5 transition-colors ${
                    chartType === "line"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-500 bg-white hover:bg-gray-50"
                  }`}>
                  <Activity className="w-3.5 h-3.5" strokeWidth={2} />
                  Đường
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-3 flex items-center gap-1.5 transition-colors ${
                    chartType === "bar"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-500 bg-white hover:bg-gray-50"
                  }`}>
                  <BarChart2 className="w-3.5 h-3.5" strokeWidth={2} />
                  Cột
                </button>
              </div>

              {/* Export */}
              <button onClick={handleExportChart}
                className="h-9 px-3 flex items-center gap-1.5 text-sm rounded-xl border border-emerald-100 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                <Download className="w-3.5 h-3.5" strokeWidth={2} />
                Xuất ảnh
              </button>
            </div>
          </div>

          {/* Custom legend */}
          <div className="flex items-center gap-2 mb-5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: CHART_COLORS.indigo }}
            />
            <span className="text-xs text-gray-400">
              Doanh thu năm {selectedYear} (VND)
            </span>
          </div>

          {/* Chart canvas */}
          <div className="h-80">
            <Chart ref={chartRef} type={chartType} data={chartData} options={options as any} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;