import { useMemo } from 'react';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import {
    CATEGORY_ANIMES,
    CATEGORY_TV_SHOWS,
    CATEGORY_TV_TOKUSATSU
} from "../utils/constantes";
import { isNullOrEmpty } from '../utils/utils';

const COLORS = ['#10B981', '#EF4444']; // Assistidos / Pendentes

const getCount = (arr, conditionFn) => arr.filter(conditionFn).length;

export default function StatsPanelSeries({ data = [] }) {
  const navigate = useNavigate();

  // Categorias fixas
  const categories = [
    { key: CATEGORY_TV_SHOWS, label: 'TV Shows' },
    { key: CATEGORY_ANIMES, label: 'Animes' },
    { key: CATEGORY_TV_TOKUSATSU, label: 'Tokusatsu' },
  ];

  // Dados agrupados e estatísticas
  const statsByCategory = useMemo(() => {
    return categories.map(({ key, label }) => {
      const items = data.filter((d) => d.category === key);
      const total = items.filter((item) => isNullOrEmpty(item.season)).length;
      const watched = getCount(items, (d) => d.watched === 'W');
      const unwatched = total - watched;

      return { key, label, total, watched, unwatched };
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
      <h2 className="text-2xl font-bold mb-4">📺 Séries</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {statsByCategory.map(({ key, label, total, watched, unwatched }) => {
          const pieData = [
            { name: 'Assistidos', value: watched },
            { name: 'Pendentes', value: unwatched },
          ];

          return (
            <div key={key} className="bg-gray-50 rounded-lg p-4 shadow-inner">
              <h3 className="text-lg font-semibold mb-3">{label}</h3>

              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <Indicator label="Total" value={total} />
                <Indicator label="Assistidos" value={watched} color="green" />
                <Indicator label="Pendentes" value={unwatched} color="red" />
              </div>

              <div className="w-full h-32">
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
          );
        })}
      </div>
    </div>
  );
}
