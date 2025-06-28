import { ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { Bookmark, Eye, TvIcon } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

import { FilterSheets } from "../components/FilterSheets";
import { Pagination } from "../components/Pagination";
import { DataContext } from "../context/DataContext";
import { CATEGORY_ANIMES, CATEGORY_TV_SHOWS, CATEGORY_TV_TOKUSATSU, SHEET_ANIMES, SHEET_SERIES, SHEET_TV_SHOWS, SHEET_TV_TOKUSATSU, STATUS_VIDEO_NOTW, STATUS_VIDEO_P, STATUS_VIDEO_W } from "../utils/constantes";
import { getOwnedList, getSanitizedImage, isNotNullOrEmpty, isNullOrEmpty, isFlagTrue, getValueOrDafault } from "../utils/utils";
import { ControlStatusComponent } from '../components/ControlStatusComponent';
import { useNavigate } from 'react-router-dom';

function getTotalEpisodes(episodesString) {
  if (typeof episodesString === 'string') {
    const [, total] = episodesString?.split("|").map(s => s.trim());
    return Number(total) || episodesString;
  }
  return episodesString;
}

const SeasonAccordion = ({ seasons }) => {
  const [openId, setOpenId] = useState(null);

  const toggleOpen = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {seasons.map((season) => {
        const totalEpisodes = getTotalEpisodes(season.episodes);
        const totalNaColecao = getOwnedList(season.episodes);
        const isOpen = openId === season.id;

        return (
          <div key={season.id} className="border rounded-md bg-gray-50 overflow-hidden">
            {/* Accordion Header */}
            <button
              onClick={() => toggleOpen(season.id)}
              className="w-full text-left px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-gray-100 transition"
            >
              <h4 className="text-lg font-semibold">
                {(season.type === "OVA" || season.type === "Special" || season.type === "Movie") && (
                  <>
                    {getValueOrDafault(season.subtitle, season.original_title)} (
                    <strong className="text-sm text-gray-600">{season?.year}</strong>) - {season.type}
                  </>
                )}
                {season.type === "TV Show" && (
                  <>
                    {isNotNullOrEmpty(season.subtitle) &&
                      <>{season.subtitle} - </>
                    }
                      Temporada {season.season} (
                      <strong className="text-sm text-gray-600">{season?.year}</strong>)
                  </>
                )}
              </h4>
              <span className="text-sm text-gray-600 mt-2 sm:mt-0">
                Episódios assistidos: <strong>{season.watched_episodes || 0}</strong> / {totalEpisodes}
              </span>
            </button>

            {/* Accordion Content */}
            {isOpen && (
              <div className="px-4 pb-4">
                {isNotNullOrEmpty(season.original_title) && (
                  <p className="text-gray-700 text-sm mb-2">
                    {season.original_title}
                  </p>
                )}

                {season.synopsis && (
                  <p className="text-gray-700 text-sm mb-2">{season.synopsis}</p>
                )}

                <p className="text-sm">
                  <strong>Episódios na coleção:</strong> {getOwnedList(season.episodes)} / {totalEpisodes}
                </p>

                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1 mt-2">
                  {Array.from({ length: totalEpisodes }).map((_, index) => {
                    const epNum = index + 1;
                    const isWatched = epNum <= season.watched_episodes;
                    const isOwned = epNum <= totalNaColecao;
                    return (
                      <div
                        key={epNum}
                        className={`w-6 h-6 text-xs flex items-center justify-center rounded ${isWatched ? "bg-green-500 text-white" : isOwned ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400" }`}
                      >
                        {epNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

function Modal({ data, onClose }) {
  if (!data || !Array.isArray(data)) return null;

  const mainSeries = data.find((item) => isNullOrEmpty(item.season));
  const seasons = data.filter((item) => isNotNullOrEmpty(item.season));
  const [activeTab, setActiveTab] = useState("serie");

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
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
              <div className="w-full md:w-48 aspect-[2/3] rounded overflow-hidden flex-shrink-0">
                <img
                  src={getSanitizedImage(mainSeries)}
                  alt={mainSeries?.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-2 text-gray-800">
                  {mainSeries?.title}
                </h2>
                {isNotNullOrEmpty(mainSeries?.original_title) && (
                  <p className="italic text-sm text-gray-600 mb-2">
                    {mainSeries?.original_title}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base">
                  <div className="flex flex-wrap gap-1">
                    <strong>Gênero:</strong>
                    {mainSeries?.genre
                      ? mainSeries.genre.split(",").map((g) => (
                        <span
                          key={g.trim()}
                          className={`inline-block px-2 py-0.5 mr-1 rounded text-xs font-medium ${g.toLowerCase().includes("erotic") || g.toLowerCase().includes("adult")
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {g.trim()}
                        </span>
                      ))
                      : (
                        <span className="text-gray-500">N/A</span>
                      )}
                  </div>
                  <p>
                    <strong>País(es): </strong>
                    {mainSeries?.countries?.split(",").map((c) => (
                      <span
                        key={c?.trim()}
                        className="inline-block px-2 py-0.5 mr-1 rounded text-xs font-medium bg-blue-100 text-blue-700"
                      >
                        {c.trim() || "N/A"}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Sinopse</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {mainSeries?.synopsis}
                  </p>
                </div>
                {mainSeries.notes && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-600 whitespace-pre-line">
                    <strong>Notas:</strong>
                    <p className="mt-1">{mainSeries.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "seasons" && (
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <SeasonAccordion seasons={seasons} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Series() {
  const ITEMS_PER_PAGE = 24;

  const categories = [CATEGORY_TV_SHOWS, CATEGORY_TV_TOKUSATSU, CATEGORY_ANIMES];

  const { dataSheets } = useContext(DataContext);

  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se dataSheets está vazio
    if (!dataSheets || Object.keys(dataSheets).length === 0) {
      navigate("/home", { replace: true });
    }
  }, [dataSheets, navigate]);

  const series = dataSheets[SHEET_SERIES] || [];

  const seriesComplete = useMemo(() => {
    return series.map((s) => {
      // Se o serie NÃO for uma coleção, mas fizer parte de uma (mesmo título)
      const serieParent = series.find((c) => c.title === s.title && isNullOrEmpty(c.season));

      // Herança reversa: se o serie for filho, herda campos do pai se não tiver
      return {
        ...s,
        countries: getValueOrDafault(s.countries, serieParent?.countries),
        genre: getValueOrDafault(s.genre, serieParent?.genre),
        status: getValueOrDafault(s.watched, serieParent?.watched),
      };
    })
  }, [series]);

  const [filteredSeries, setFilteredSeries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' ou 'list'

  const gridRef = useRef(null);

  useEffect(() => {
    setFilteredSeries(seriesComplete);
  }, [seriesComplete]); // This effect runs whenever 'seriesComplete' changes

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    // Ao mudar a página, rolar para o topo do grid
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // fallback para rolar a página toda até o topo
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

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

  const groupByTitle = (title) => seriesComplete.filter((s) => s.title === title);

  const newSeasonMap = useMemo(() => {
    const map = {};

    const grouped = seriesComplete.reduce((acc, item) => {
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
      const latestSeasonEpisodes = validSeasons.filter((s) => Number(s.year) === latestYear);

      map[title] = validSeasons.length > 1 && latestSeasonEpisodes.some((ep) => ep.watched !== "W");
    }

    return map;
  }, [seriesComplete]);

  const checkAllSeasonsWatched = (title) => {
    const seasons = seriesComplete.filter((item) => item.title === title && !isNullOrEmpty(item.season));
    if (seasons.length === 0) return false; // se não tem temporadas, não considera "tudo assistido"
    return seasons.length > 0 && seasons.every((item) => item.watched === "W");
  };

  const checkStatusSeasonsWatched = (title) => {
    const seasons = seriesComplete.filter((item) => item.title === title && !isNullOrEmpty(item.season));
    if (seasons.length === 0) return 'NOTW'; // se não tem temporadas, não considera "tudo assistido"

    if (seasons.every((item) => item.watched === "W")) return "W";
    if (seasons.some((item) => item.watched === "P" || item.watched === "W")) return "P";

    return "NOTW";
  };

  const checkAllSeasonsOwned = (title) => {
    const seasons = seriesComplete.filter((item) => item.title === title && !isNullOrEmpty(item.season));
    if (seasons.length === 0) return false; // sem temporadas, não considera "tudo owned"
    return seasons.length > 0 && seasons.every((item) => item.owned === 'TRUE');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-6">
      <FilterSheets
        dataSheets={seriesComplete}
        dataSheetsGroup={seriesComplete.filter((item) => isNullOrEmpty(item.season))}
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
        statusOptions={[STATUS_VIDEO_NOTW, STATUS_VIDEO_W, STATUS_VIDEO_P]}
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
                const main = seriesComplete.find((item) => item.title === s.title && isNullOrEmpty(item.season)) || s;

                const allWatched = checkAllSeasonsWatched(s.title);
                const allOwned = checkAllSeasonsOwned(s.title);
                const imageSrc = getSanitizedImage(main);

                return (
                  <div
                    key={`${s.title}-${main.id}`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer
                  transform transition duration-300 hover:scale-105 hover:shadow-xl relative group"
                    title={`${s?.subtitle || s?.title} (${s?.year || "Ano desconhecido"})`}
                    onClick={() => setSelectedSeries(groupByTitle(s.title))}
                  >

                    {/* +18 Badge */}
                    {isAdultGenre(main?.genre) && (
                      <span className="absolute top-2 left-2 bg-red-700 text-white text-[15px] font-semibold px-1.5 py-0.5 rounded shadow-md z-10">
                        +18
                      </span>
                    )}

                    {/* Assistido */}
                    {allWatched && (
                      <span className="absolute top-2 right-2 bg-green-600 text-white text-[15px] font-semibold px-1.5 py-0.5 rounded shadow-md z-10">
                        Assistido
                      </span>
                    )}

                    {newSeasonMap[main.title] === true && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-[15px] font-semibold rounded px-2 py-0.5 rounded shadow-md z-10">
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

      {/* List view */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {paginatedSeries.map((s) => {
            const allWatched = checkStatusSeasonsWatched(s.title);
            const allOwned = checkAllSeasonsOwned(s.title);

            const mainSerie = seriesComplete.find((item) => item.title === s.title && isNullOrEmpty(item.season)) || s;

            const main = { ...mainSerie, owned: allOwned ? 'TRUE' : 'FALSE' }
            const imageSrc = getSanitizedImage(main);

            return (
              <div
                key={`${s.title}-${s.id}-list`}
                className="flex items-center gap-4 bg-white p-3 rounded-lg shadow hover:shadow-lg cursor-pointer"
                onClick={() => setSelectedSeries(groupByTitle(s.title))}
              >
                <img
                  src={imageSrc}
                  alt={main.title}
                  className="w-20 h-28 object-cover rounded-md border border-gray-300 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">

                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {main.title}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {main.year && (
                      <span>
                        <strong>Ano:</strong> {main.year}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-700">
                    {main.genre && (
                      <span>
                        Gênero: {main.genre?.split(",").map((g) => (
                          <span
                            key={g.trim()}
                            className={`inline-block px-2 py-0.5 mr-1 rounded text-xs font-medium ${g.toLowerCase().includes("erotic") || g.toLowerCase().includes("adult")
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                              }`}
                          >
                            {g.trim()}
                          </span>
                        )) || "N/A"}
                      </span>
                    )}
                  </div>
                  <ControlStatusComponent
                    data={main}
                    status={{
                      emoji: "👁️‍🗨️",
                      condicoes: {
                        completo: allWatched === "W",
                        pacialmente: allWatched === "P"
                      },
                      labels: {
                        incompleto: "Não assistido",
                        completo: "Assistido",
                        pacialmente: "Parcialmente assistido",
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {selectedSeries && (
        <Modal
          data={selectedSeries}
          onClose={() => setSelectedSeries(null)}
        />
      )}
    </div>
  );
}
