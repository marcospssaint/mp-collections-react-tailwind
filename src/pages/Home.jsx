import {
  SHEET_MOVIES, SHEET_TV_SHOWS, SHEET_TV_TOKUSATSU,
  SHEET_ANIMES, SHEET_COMICS, SHEET_MANGAS,
  SHEET_BOOKS, SHEET_SERIES,
  CATEGORY_TV_SHOWS, CATEGORY_ANIMES, CATEGORY_TV_TOKUSATSU,
  CATEGORY_COMICS,
  CATEGORY_MANGAS,
  CATEGORY_BOOKS,
  SHEET_LIVROS
} from "../utils/constantes";

import StatsPanel from '../components/StatsPanel';
import { useContext, useEffect, useRef, useState } from "react";
import { DataContext } from "../context/DataContext";
import { fetchSheetData } from "../utils/utils";
import DashboardGrid from "../components/DashboardGrid";
import StatsPanelSeries from "../components/StatsPanelSeries";
import StatsPanelBooks from "../components/StatsPanelBooks";

const DELAY_BETWEEN_CALLS = 500;

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export default function Home() {
  const { dataSheets, setSheetData } = useContext(DataContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadedRef = useRef(false); // impede múltiplas execuções

  const sheetsToLoad = [
    SHEET_MOVIES,
    SHEET_TV_SHOWS,
    SHEET_TV_TOKUSATSU,
    SHEET_ANIMES,
    SHEET_COMICS,
    SHEET_MANGAS,
    SHEET_BOOKS,
  ];

  useEffect(() => {
    if (loadedRef.current) return; // já carregou
    loadedRef.current = true;

    async function loadSheets() {
      for (const sheet of sheetsToLoad) {
        try {
          const data = await fetchSheetData({ sheetName: sheet });
          setSheetData(sheet, data);
          await delay(DELAY_BETWEEN_CALLS);
        } catch (err) {
          setError(`Erro ao carregar ${sheet}: ${err.message}`);
          break;
        }
      }

      setLoading(false);
    }

    loadSheets();
  }, [setSheetData]);

  // Junta séries e livros
  const lastMergedSeriesRef = useRef(null);
  const lastMergedLivrosRef = useRef(null);

  useEffect(() => {
    const tvSeries = (dataSheets[SHEET_TV_SHOWS] || []).map(item => ({
      ...item,
      category: CATEGORY_TV_SHOWS,
    }));

    const animes = (dataSheets[SHEET_ANIMES] || []).map(item => ({
      ...item,
      category: CATEGORY_ANIMES,
    }));

    const tokusatsu = (dataSheets[SHEET_TV_TOKUSATSU] || []).map(item => ({
      ...item,
      category: CATEGORY_TV_TOKUSATSU,
    }));

    const comics = (dataSheets[SHEET_COMICS] || []).map(item => ({
      ...item,
      category: CATEGORY_COMICS,
    }));

    const mangas = (dataSheets[SHEET_MANGAS] || []).map(item => ({
      ...item,
      category: CATEGORY_MANGAS,
    }));

    const books = (dataSheets[SHEET_BOOKS] || []).map(item => ({
      ...item,
      category: CATEGORY_BOOKS,
    }));

    const mergedSeries = [...tvSeries, ...animes, ...tokusatsu];
    const prevSeries = JSON.stringify(lastMergedSeriesRef.current);
    const currSeries = JSON.stringify(mergedSeries);

    if (currSeries !== prevSeries) {
      setSheetData(SHEET_SERIES, mergedSeries);
      lastMergedSeriesRef.current = mergedSeries;
    }

    const mergedLivros = [...comics, ...mangas, ...books];
    const prevLivros = JSON.stringify(lastMergedLivrosRef.current);
    const currLivros = JSON.stringify(mergedLivros);

    if (currLivros !== prevLivros) {
      setSheetData(SHEET_LIVROS, mergedLivros);
      lastMergedLivrosRef.current = mergedLivros;
    }
  }, [
    dataSheets[SHEET_TV_SHOWS],
    dataSheets[SHEET_ANIMES],
    dataSheets[SHEET_TV_TOKUSATSU],
    dataSheets[SHEET_COMICS],
    dataSheets[SHEET_MANGAS],
    dataSheets[SHEET_BOOKS],
    setSheetData
  ]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg text-gray-700 font-medium">Carregando dados...</p>
      </div>
    </div>
  );
  if (error)
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <div className="flex items-center space-x-3 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow">
        <svg
          className="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm font-medium">Erro: {error}</span>
      </div>
    </div>
  );
  const panels = [
    {
      key: <StatsPanel title="🎬 Movies" slug="movies" data={dataSheets[SHEET_MOVIES] || []} />,
      title: 'Filmes',
      slug: 'movies',
      data: dataSheets[SHEET_MOVIES],
      category: 'Movies',
    },
    {
      key: <StatsPanelSeries title="📺 Séries" slug="series" data={dataSheets[SHEET_SERIES] || []} />,
      title: 'Séries',
      slug: 'series',
      data: dataSheets[SHEET_SERIES],
      category: 'Séries',
    },
    {
      key: <StatsPanelBooks title="📚 Livros" slug="livros" data={dataSheets[SHEET_LIVROS] || []} />,
      title: 'Livros',
      slug: 'livros',
      data: dataSheets[SHEET_LIVROS],
      category: 'Livros',
    },
    // Adicione mais painéis aqui
  ];

  return <DashboardGrid panels={panels} />;
}
