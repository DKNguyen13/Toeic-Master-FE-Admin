import React from 'react';

type RankItem = {
  rank: number;
  member: string;
  totalScore: number;
  icon: string;
};

const leaderboardData: RankItem[] = [
  { rank: 1, member: 'SOCCHUOT289', totalScore: 120, icon: '🔥' },
  { rank: 2, member: 'SOCCHUOT289', totalScore: 120, icon: '🏆' },
  { rank: 3, member: 'SOCCHUOT289', totalScore: 120, icon: '🥈' },
  { rank: 4, member: 'SOCCHUOT289', totalScore: 120, icon: '🥉' },
  { rank: 5, member: 'SOCCHUOT289', totalScore: 120, icon: '🏅' },
];

const Leaderboard = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <button className="text-blue-500 font-semibold">Weekly</button>
        <div className="space-x-4">
          <button className="text-gray-500">Daily</button>
          <button className="text-gray-500">Monthly</button>
          <button className="text-gray-500">Annually</button>
        </div>
      </div>
      
      <table className="min-w-full table-auto">
        <thead>
          <tr className="text-left">
            <th className="px-4 py-2 font-semibold">Rank</th>
            <th className="px-4 py-2 font-semibold">THÀNH VIÊN</th>
            <th className="px-4 py-2 font-semibold">TỔNG ĐIỂM</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{item.icon} {item.rank}</td>
              <td className="px-4 py-2">{item.member}</td>
              <td className="px-4 py-2">{item.totalScore} Điểm</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
