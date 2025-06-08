import { ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { Bookmark, Eye, TvIcon } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

//import data from '../data/tvSeries.json'
import { FilterSheets } from "../components/FilterSheets";
import { Pagination } from "../components/Pagination";
import { DataContext } from "../context/DataContext";
import { CATEGORY_ANIMES, CATEGORY_TV_SHOWS, CATEGORY_TV_TOKUSATSU, SHEET_ANIMES, SHEET_SERIES, SHEET_TV_SHOWS, SHEET_TV_TOKUSATSU } from "../utils/constantes";
import { getOwnedList, getSanitizedImage, isNotNullOrEmpty, isNullOrEmpty, isOwned } from "../utils/utils";

// Função descrita acima
function getUniqueGenres(data) {
  const allGenres = data.flatMap((item) => {
    if (!item.genre) return [];
    return item.genre
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g.length > 0);
  });
  // Remove duplicatas e ordenar alfabeticamente
  return Array.from(new Set(allGenres)).sort((a, b) => a.localeCompare(b));
}
function getTotalEpisodes(episodesString) {
  if (typeof episodesString === 'string') {
    const [, total] = episodesString?.split("|").map(s => s.trim());
    return Number(total) || 0;
  }
  return episodesString;
}

// Modal Component
function TvSeriesModal({ data, onClose }) {
  if (!data || !Array.isArray(data)) return null;

  const mainSeries = data.find((item) => isNullOrEmpty(item.season));
  const seasons = data.filter((item) => !isNullOrEmpty(item.season));
  const [activeTab, setActiveTab] = useState("serie");

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex justify-center items-center z-50 p-4 overflow-auto">
        <div
          className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-full overflow-y-auto p-4 sm:p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
            aria-label="Fechar"
          >
            &times;
          </button>

          <div className="mb-4 flex space-x-4 border-b pb-2">
            <button
              className={`px-3 py-1 font-semibold rounded ${activeTab === "serie" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
              onClick={() => setActiveTab("serie")}
            >
              Série
            </button>
            <button
              className={`px-3 py-1 font-semibold rounded ${activeTab === "seasons" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
              onClick={() => setActiveTab("seasons")}
            >
              Temporadas
            </button>
          </div>

          {activeTab === "serie" && (
            <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-4 md:gap-6">
              {mainSeries?.img && (
                <div className="w-full md:w-48 aspect-w-3 aspect-h-4 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={getSanitizedImage(mainSeries)}
                    alt={mainSeries.title}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  />
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
                  {mainSeries?.title}
                </h2>
                {isNotNullOrEmpty(mainSeries?.original_title) && (
                  <p className="italic text-gray-500">{mainSeries?.original_title}</p>
                )}
                <p className="text-gray-700 leading-relaxed">
                  {mainSeries?.synopsis}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base">
                  <div className="flex flex-wrap gap-1">
                    <strong>Gênero:</strong>
                    {mainSeries?.genre
                      ? mainSeries.genre.split(",").map((g) => (
                        <span
                          key={g.trim()}
                          className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded"
                        >
                          {g.trim()}
                        </span>
                      ))
                      : (
                        <span className="text-gray-500">N/A</span>
                      )}
                  </div>
                  <p>
                    <strong>Tipo:</strong> {mainSeries?.type || "N/A"}
                  </p>
                  <p>
                    <strong>Países:</strong> {mainSeries?.countries || "N/A"}
                  </p>
                  <p>
                    <strong>Possuído:</strong>{" "}
                    {isOwned(mainSeries?.owned) ? (
                      <span className="text-blue-600 font-semibold">Sim</span>
                    ) : (
                      "Não"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "seasons" && (
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {seasons.map((season) => {
                const totalEpisodes = getTotalEpisodes(season.episodes);
                return (
                  <div key={season.id} className="border rounded-md p-3 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                      <h4 className="text-lg font-semibold">
                        Temporada {season.season} ({season.year})
                      </h4>
                      <span className="text-sm text-gray-600">
                        Episódios assistidos: <strong>{season.watched_episodes || 0}</strong> / {totalEpisodes}
                      </span>
                    </div>

                    {season.synopsis && (
                      <p className="text-gray-700 text-sm mb-2">{season.synopsis}</p>
                    )}

                    <div className="text-sm mb-2">
                      <p><strong>Tipo:</strong> {season.type || "TV Show"}</p>
                      <p><strong>Possuído:</strong> {isOwned(season.owned) ? "Sim" : "Não"}</p>
                    </div>

                    <div>
                      <p className="text-sm">
                        <strong>Episódios na coleção:</strong> {getOwnedList(season.episodes)} / {totalEpisodes}
                      </p>
                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1 mt-2">
                        {Array.from({ length: totalEpisodes }).map((_, index) => {
                          const epNum = index + 1;
                          const isOwned = epNum <= season.watched_episodes;
                          return (
                            <div
                              key={epNum}
                              className={`w-6 h-6 text-xs flex items-center justify-center rounded ${isOwned ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400"}`}
                            >
                              {epNum}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )
              }
              )}

            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Series() {
  const ITEMS_PER_PAGE = 24;

  const categories = [CATEGORY_TV_SHOWS, CATEGORY_TV_TOKUSATSU, CATEGORY_ANIMES];

  const { dataSheets } = useContext(DataContext);
  const series = dataSheets[SHEET_SERIES] || []

  //const [series, setSeries] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState(series);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' ou 'list'

  const gridRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  const isAdultGenre = (genre = "") =>
    genre.toLowerCase().includes("adult") || genre.toLowerCase().includes("erotic");

  // Títulos únicos para paginação
  let uniqueTitles = [...new Set(filteredSeries.map((s) => s.title))];

  const totalCount = uniqueTitles.length;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const paginatedTitles = uniqueTitles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const paginatedSeries = paginatedTitles
    .map((title) => filteredSeries.find(
      (s) => s.title === title && s.season === undefined) ||
      filteredSeries.find((s) => s.title === title)
    );

  const groupByTitle = (title) => series.filter((s) => s.title === title);

  // Função para detectar se o título tem temporadas com episódios não assistidos
  const hasNewSeasons = (title) => {
    const seasons = series.filter((item) => item.title === title && !isNullOrEmpty(item.season) && !isNullOrEmpty(item.year));

    if (seasons.length === 0) return false;

    // Verifica se já assistiu ao menos um episódio em qualquer temporada
    const watchedAny = seasons.some((ep) => ep.watched === "W");
    if (!watchedAny) return false;

    // Ano da temporada mais recente
    const latestYear = Math.max(...seasons.map((s) => s.year));

    // Episódios da temporada mais recente
    const latestSeasonEpisodes = seasons.filter((s) => s.year === latestYear);

    // Se tem episódio não assistido na última temporada, retorna true
    return latestSeasonEpisodes.some((ep) => ep.watched !== "W");
  };

  const newSeasonMap = useMemo(() => {
    const map = {};

    const grouped = series.reduce((acc, item) => {
      if (!acc[item.title]) acc[item.title] = [];
      acc[item.title].push(item);
      return acc;
    }, {});

    for (const [title, seasons] of Object.entries(grouped)) {
      const validSeasons = seasons.filter(
        (item) => !isNullOrEmpty(item.season) && !isNullOrEmpty(item.year)
      );

      if (validSeasons.length === 0) {
        map[title] = false;
        continue;
      }

      const watchedAny = validSeasons.some((ep) => ep.watched === "W" || ep.watched === "P");
      if (!watchedAny) {
        map[title] = false;
        continue;
      }

      const latestYear = Math.max(...validSeasons.map((s) => s.year));
      const latestSeasonEpisodes = validSeasons.filter((s) => s.year === latestYear);

      map[title] = latestSeasonEpisodes.some((ep) => ep.watched !== "P");
    }

    return map;
  }, [series]);

  const checkAllSeasonsWatched = (title) => {
    const seasons = series.filter((item) => item.title === title && !isNullOrEmpty(item.season));
    if (seasons.length === 0) return false; // se não tem temporadas, não considera "tudo assistido"
    return seasons.length > 0 && seasons.every((item) => item.watched === "W");
  };

  const checkAllSeasonsOwned = (title) => {
    const seasons = series.filter((item) => item.title === title && !isNullOrEmpty(item.season));
    if (seasons.length === 0) return false; // sem temporadas, não considera "tudo owned"
    return seasons.length > 0 && seasons.every((item) => item.owned === true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-6">
      {/* Exibe total de séries de forma moderna */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          <TvIcon className="w-4 h-4 mr-1" />
          <span>{totalCount} Séries</span>
        </div>
      </div>

      <FilterSheets
        dataSheets={series}
        onFilter={setFilteredSeries}
        estatisticas={{
          tipo: "serie",
          total: totalCount,
          emojis: {
            total: "🎬",
            assistidos: "👁️‍🗨️",
            adultos: "🔞",
          },
          labels: {
            assistidos: "assistidos"
          }
        }}
        categoriesOptions={categories}
        categoryDefault={CATEGORY_TV_SHOWS}
      />

      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-2"></div>
        {/* Botões de visualização à direita */}
        <div className="inline-flex rounded-xl shadow-sm overflow-hidden border border-gray-300">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all ${viewMode === "grid"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            aria-label="Visualização em grade"
          >
            <Squares2X2Icon className="w-5 h-5" />
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all ${viewMode === "list"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            aria-label="Visualização em lista"
          >
            <ListBulletIcon className="w-5 h-5" />
            Lista
          </button>
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          {/* Grid view */}
          {viewMode === "grid" && (

            <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {paginatedSeries.map((s) => {
                const main = series.find((item) => item.title === s.title && isNullOrEmpty(item.season)) || s;

                const allWatched = checkAllSeasonsWatched(s.title);
                const allOwned = checkAllSeasonsOwned(s.title);
                const imageSrc = getSanitizedImage(main);

                return (
                  <div
                    key={`${s.title}-${s.id}`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer
                  transform transition duration-300 hover:scale-105 hover:shadow-xl relative group"
                    title={`${s?.subtitle || s?.title} (${s?.year || "Ano desconhecido"})`}
                    onClick={() => setSelectedSeries(groupByTitle(s.title))}
                  >

                    {/* +18 Badge */}
                    {isAdultGenre(main?.genre) && (
                      <span className="absolute top-2 left-2 bg-red-700 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-md z-10">
                        +18
                      </span>
                    )}

                    {/* Assistido */}
                    {allWatched && (
                      <span className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-md z-10">
                        Assistido
                      </span>
                    )}

                    {newSeasonMap[main.title] && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold rounded px-2 py-0.5 shadow-lg select-none">
                        Novas
                      </div>
                    )}

                    <div className="relative w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={s.title}
                        className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        draggable={false}
                      />

                    </div>

                    <div className="p-2 flex-grow flex flex-col justify-between">
                      <div className="flex justify-center items-center gap-2">
                        <h3 className="text-sm font-semibold text-center line-clamp-2 flex-grow">{s.title}</h3>

                        <div className="flex gap-1 text-gray-500 text-xs">
                          {allOwned && <Bookmark title="Todas as temporadas na coleção" size={16} />}
                        </div>
                      </div>

                      <p className="text-xs text-center text-gray-600 mt-1">{main?.year}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {selectedSeries && (
        <TvSeriesModal
          data={selectedSeries}
          onClose={() => setSelectedSeries(null)}
        />
      )}
    </div>
  );
}
