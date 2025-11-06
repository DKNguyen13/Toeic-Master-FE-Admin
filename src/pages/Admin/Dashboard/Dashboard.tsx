import api from "../../../config/axios";
import { Line } from "react-chartjs-2";
import React, { useEffect, useState } from "react";
import { MdOutlineCloudDone } from "react-icons/md";
import { FaUsers, FaFileAlt, FaChartLine } from "react-icons/fa";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage: React.FC = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [growth, setGrowth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const fetchRevenue = async (year: number) => {
    try {
      const res = await api.get(`/admin/revenue-stats?type=month&year=${year}`);
      const data = res.data.data || [];

      setRevenueData(data);

      const total = data.reduce(
        (sum: number, item: any) => sum + item.totalRevenue,
        0
      );
      setTotalRevenue(total);

      // Tính % tăng trưởng so với tháng trước
      if (data.length > 1) {
        const current = data[data.length - 1]?.totalRevenue || 0;
        const prev = data[data.length - 2]?.totalRevenue || 0;
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
    fetchRevenue(selectedYear);
  }, [selectedYear]);

  // Labels là các tháng
  const labels = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);

    const dataByMonth = labels.map((label, index) => {
    const monthNumber = index + 1;
    const monthData = revenueData.find((item) => item.month === monthNumber);
    return monthData ? monthData.totalRevenue : 0;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: `Doanh thu năm ${selectedYear} (VND)`,
        data: dataByMonth,
        borderColor: "#4A90E2",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: {
        title: { display: true, text: "Tháng" },
      },
      y: {
        title: { display: true, text: "Doanh thu (VND)" },
        beginAtZero: true,
      },
    },
  };

  const years = [2023, 2024, 2025, 2026];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <LeftSidebarAdmin customHeight="h-auto w-64" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Tổng số người dùng</h2>
              <p className="text-2xl font-bold text-gray-800">8</p>
              <p className="text-green-600">+0% so với hôm qua</p>
            </div>
            <FaUsers className="text-blue-600 text-4xl" />
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Tổng số bài thi đã làm
              </h2>
              <p className="text-2xl font-bold text-gray-800">10</p>
              <p className="text-green-600">+1.3% so với tuần trước</p>
            </div>
            <FaFileAlt className="text-orange-600 text-4xl" />
          </div>

          {/* Card 3 - Doanh thu */}
          <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Tổng doanh thu năm {selectedYear}</h2>
            <p className="text-2xl font-bold text-gray-800">{totalRevenue.toLocaleString("vi-VN")} đ</p>
            <p className="text-green-600">Doanh thu chi tiết theo tháng bên dưới</p>
          </div>
          <FaChartLine className="text-green-600 text-4xl" />
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Tỷ lệ hoàn thành bài</h2>
              <p className="text-2xl font-bold text-gray-800">80%</p>
              <p className="text-green-600">+1.8% so với hôm qua</p>
            </div>
            <MdOutlineCloudDone className="text-red-600 text-4xl" />
          </div>
        </div>

        {/* Biểu đồ doanh thu */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Chi tiết doanh thu theo tháng</h2>
            {/* Dropdown chọn năm */}
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border rounded px-3 py-2">
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
