import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';

const COLORS = ['#10B981', '#EF4444']; // Assistidos / Pendentes

const getCount = (arr, conditionFn) => arr.filter(conditionFn).length;

export default function StatsPanel({ data = [], title = '🎬 Itens', slug = 'items' }) {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const total = data.length;
    const watched = getCount(data, (d) => d.watched === 'W');
    const owned = getCount(data, (d) => !!d.owned);
    const unwatched = total - watched;

    const genres = Array.from(new Set(
      data.flatMap((d) =>
        d.genre ? d.genre.split(',').map((g) => g.trim().toLowerCase()) : []
      )
    ));

    const countries = Array.from(new Set(
      data.flatMap((d) =>
        d.countries ? d.countries.split(',').map((c) => c.trim()) : []
      )
    ));

    const adultCount = getCount(
      data,
      (d) =>
        d.genre?.toLowerCase().includes('adult') ||
        d.genre?.toLowerCase().includes('erotic')
    );

    return {
      total,
      watched,
      unwatched,
      owned,
      genres: genres.length,
      countries: countries.length,
      adultCount
    };
  }, [data]);

  const pieData = [
    { name: 'Assistidos', value: stats.watched },
    { name: 'Pendentes', value: stats.unwatched },
  ];

  const Indicator = ({ label, value, color = 'gray' }) => {
    const textColor = {
      green: 'text-green-600 dark:text-green-400',
      red: 'text-red-600 dark:text-red-400',
      blue: 'text-blue-600 dark:text-blue-400',
      indigo: 'text-indigo-600 dark:text-indigo-400',
      purple: 'text-purple-600 dark:text-purple-400',
      rose: 'text-rose-600 dark:text-rose-400',
      gray: 'text-gray-800 dark:text-white',
    }[color];

    return (
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`text-xl font-bold ${textColor}`}>
          <CountUp end={value} duration={1.5} />
        </p>
      </div>
    );
  };

  return (
    <div className="">
    <div
      onClick={() => navigate(`/${slug}`)}
      className="cursor-pointer hover:scale-[1.02] transition transform"
    >
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* Indicadores */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <Indicator label="🎞️ Total" value={stats.total} />
            <Indicator label="✅ Assistidos" value={stats.watched} color="green" />
            <Indicator label="📌 Pendentes" value={stats.unwatched} color="red" />
            <Indicator label="🗂️ Na coleção" value={stats.owned} color="blue" />
            <Indicator label="🌍 Países" value={stats.countries} color="indigo" />
            <Indicator label="🎭 Gêneros" value={stats.genres} color="purple" />
            <Indicator label="🔞 +18" value={stats.adultCount} color="rose" />
          </div>
        </div>

        {/* Gráfico */}
        <div className="w-full h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    </div>
  );
}
