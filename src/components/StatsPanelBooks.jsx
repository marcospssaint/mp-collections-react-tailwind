import { useMemo } from 'react';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import {
  CATEGORY_COMICS,
  CATEGORY_MANGAS,
  CATEGORY_BOOKS
} from "../utils/constantes";
import { isAdultGenre, isFlagTrue } from '../utils/utils';

const COLORS = ['#10B981', '#EF4444']; // Lidos / Pendentes

const getCount = (arr, conditionFn) => arr.filter(conditionFn).length;

export default function StatsPanelBooks({ data = [] }) {
  const navigate = useNavigate();

  // Categorias fixas
  const categories = [
    { key: CATEGORY_COMICS, label: CATEGORY_COMICS },
    { key: CATEGORY_MANGAS, label: CATEGORY_MANGAS },
    { key: CATEGORY_BOOKS, label: CATEGORY_BOOKS },
  ];

  // Dados agrupados e estatísticas
  const statsByCategory = useMemo(() => {
    return categories.map(({ key, label }) => {
      const items = data.filter((d) => d.category === key);

      const total = items.length;
      const read = items
        .filter((f) => f?.read === "R")
        .length;
      const unRead = total - read;

      const totalOwned = items
        .filter((m) => isFlagTrue(m.owned))
        .length;

      const totalTelegram = items
        .filter((m) => isFlagTrue(m.telegram))
        .length;

      const totalAdult = items
        .filter(((m) => isAdultGenre(m.genre)))
        .length;

      const languagePortugues = items.filter((f) => f.language?.includes('Portugues')).length;
      const languageSpanish = items.filter((f) => f.language?.includes('Spanish')).length;
      const languageFrench = items.filter((f) => f.language?.includes('French')).length;
      const languageJapanese = items.filter((f) => f.language?.includes('Japanese')).length;
      const languageEnglish = items.filter((f) => f.language?.includes('English')).length;

      return {
        key, label, total, read, unRead,
        totalOwned, totalTelegram, totalAdult,
        languagePortugues, languageSpanish, languageFrench, languageJapanese, languageEnglish
      };
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
      onClick={() => navigate(`/books`)}
    >
      <h2 className="text-2xl font-bold mb-4">📚 Livros  (<CountUp end={data.length} duration={1.5} /> itens)</h2>

      <div className="">
        {statsByCategory.map(({ key, label, total, read, unRead,
          totalOwned, totalTelegram, totalAdult,
          languagePortugues, languageSpanish, languageFrench, languageJapanese, languageEnglish }) => {
          const pieData = [
            { name: 'Lidos', value: read },
            { name: 'Pendentes', value: unRead },
          ];

          return (
            <div key={key} className="bg-gray-50 rounded-lg p-4 shadow-inner">
              <h3 className="text-lg font-semibold mb-3">{label}</h3>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Indicadores */}
                <div className="space-y-2">

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                    <Indicator label="📚 Total" value={total} />
                    <Indicator label="✅ Lidos" value={read} color="green" />
                    <Indicator label="📌 Pendentes" value={unRead} color="red" />
                    <Indicator label="🗂️ Na coleção" value={totalOwned} color="blue" />
                    <Indicator label="📱 Telegram" value={totalTelegram} color="purple" />
                    <Indicator label="🔞 +18" value={totalAdult} color="rose" />
                    <Indicator label="🇧🇷 Portugues" value={languagePortugues} />
                    <Indicator label="🇪🇸 Spanish" value={languageSpanish} />
                    <Indicator label="🇫🇷 French" value={languageFrench} />
                    {
                      key === CATEGORY_MANGAS && <Indicator label="🇯🇵 Japanese" value={languageJapanese} />
                    }

                    <Indicator label="🇺🇸 English" value={languageEnglish} />
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
