import { useMemo } from 'react';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import {
  CATEGORY_ANIMES,
  CATEGORY_TV_SHOWS,
  CATEGORY_TV_TOKUSATSU
} from "../utils/constantes";
import { isAdultGenre, isFlagTrue, isNullOrEmpty } from '../utils/utils';

const COLORS = ['#10B981', '#EF4444']; // Assistidos / Pendentes

const getCount = (arr, conditionFn) => arr.filter(conditionFn).length;

export default function StatsPanelSeries({ data = [] }) {
  const navigate = useNavigate();

  // Categorias fixas
  const categories = [
    { key: CATEGORY_TV_SHOWS, label: 'TV Shows', slug: 'series' },
    { key: CATEGORY_ANIMES, label: 'Animes', slug: 'animes' },
    { key: CATEGORY_TV_TOKUSATSU, label: 'Tokusatsu', slug: 'tokusatsu' },
  ];

  // Dados agrupados e estatísticas
  const statsByCategory = useMemo(() => {
    return categories.map(({ key, label }) => {
      const items = data.filter((d) => d.category === key);

      let uniqueTitles = [...new Set(items.map((s) => s.title))];
      const total = uniqueTitles.length;

      const totalWatched = items.filter((item) => isNullOrEmpty(item.season))
        .filter((f) => items.filter((m) => m?.watched === "W").some((g) => g.title === f.title))
        .length;

      const unwatched = total - totalWatched;

      const totalOwned = items.filter((item) => isNullOrEmpty(item.season))
        .filter((f) => items.filter((m) => isFlagTrue(m.owned)).some((g) => g.title === f.title))
        .length;

      const totalTelegram = items.filter((item) => isNullOrEmpty(item.season))
        .filter((f) => items.filter((m) => isFlagTrue(m.telegram)).some((g) => g.title === f.title))
        .length;

      const totalAdult = items.filter((item) => isNullOrEmpty(item.season))
        .filter((f) => items.filter((m) => isAdultGenre(m.genre)).some((g) => g.title === f.title))
        .length;

      return { key, label, total, totalWatched, unwatched, totalOwned, totalTelegram, totalAdult };
    });
  }, [data]);

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
    <div
      className="rounded-xl border p-4 shadow-md bg-white cursor-pointer hover:scale-[1.02] transition-transform"
      onClick={() => navigate(`/series`)}
    >
      <h2 className="text-2xl font-bold mb-4">📺 Séries (<CountUp end={[...new Set(data.map((s) => s.title))].length} duration={1.5} /> itens) </h2>

      <div className="">
        {statsByCategory.map(({ key, label, total, totalWatched, unwatched, totalOwned, totalTelegram, totalAdult }) => {
          const pieData = [
            { name: 'Assistidos', value: totalWatched },
            { name: 'Pendentes', value: unwatched },
          ];

          return (
            <div key={key} className="bg-gray-50 rounded-lg p-4 shadow-inner">
              <h3 className="text-lg font-bold mb-3">{label}</h3>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Indicadores */}
                <div className="space-y-2">

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                    <Indicator label="🎞️ Total" value={total} />
                    <Indicator label="✅ Assistidos" value={totalWatched} color="green" />
                    <Indicator label="📌 Pendentes" value={unwatched} color="red" />
                    <Indicator label="🗂️ Na coleção" value={totalOwned} color="blue" />
                    <Indicator label="📱 Telegram" value={totalTelegram} color="purple" />
                    <Indicator label="🔞 +18" value={totalAdult} color="rose" />
                  </div>
                </div>

                {/* Gráfico */}
                <div className="w-full h-60">
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
          );
        })}
      </div>
    </div>
  );
}
