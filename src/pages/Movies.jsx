import React, { useState, useEffect, useMemo, useRef, useContext } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import CountUp from "react-countup";
import { motion, AnimatePresence } from "framer-motion";
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { fetchCastAndCrew, fetchSheetData, fetchTmdbMovieId, getSanitizedImage } from "../utils/utils";
import { DataContext } from "../context/DataContext";
import { Pagination } from "../components/Pagination";
import { FilterSheets } from "../components/FilterSheets";

function MovieModal({ movie, onClose }) {
  if (!movie) return null;

  const mainMovie = {
    ...movie,
    img: movie.img?.replace(/"/g, "")
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
        <div
          className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-full overflow-y-auto p-5 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
            aria-label="Fechar"
          >
            &times;
          </button>

          <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6">
            {/* Capa */}
            {mainMovie.img && (
              <div className="w-full md:w-48 aspect-[2/3] rounded overflow-hidden flex-shrink-0">
                <img
                  src={mainMovie.img}
                  alt={mainMovie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Conteúdo */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-800">{mainMovie.title}</h2>
              {mainMovie.original_title && (
                <p className="italic text-gray-500">{mainMovie.original_title}</p>
              )}
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {mainMovie.synopsis}
              </p>

              {/* Nova seção de notas */}
              {mainMovie?.notes && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-600 whitespace-pre-line">
                  <strong>Notas:</strong>
                  <p className="mt-1">{mainMovie.notes}</p>
                </div>
              )}

              {/* Informações Gerais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <p><strong>Ano:</strong> {mainMovie.year || "N/A"}</p>
                <p><strong>Países:</strong> {mainMovie.countries || "N/A"}</p>
                <p>
                  <strong>Gênero:</strong>{" "}
                  {mainMovie.genre?.split(",").map((g) => (
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
                </p>
                <p>
                  <strong>Possuído:</strong>{" "}
                  {mainMovie.owned ? (
                    <span className="text-green-600 font-semibold">Sim</span>
                  ) : (
                    <span className="text-gray-500">Não</span>
                  )}
                </p>
                <p>
                  <strong>Assistido:</strong>{" "}
                  {mainMovie.watched === "W" ? (
                    <span className="text-green-600 font-semibold">Sim</span>
                  ) : (
                    <span className="text-gray-500">Não</span>
                  )}
                </p>
              </div>

              {/* Cast e Direção do TMDb */}
              {(movie.cast?.length || movie.crew?.length) && (
                <div className="mt-6">
                  {movie.crew?.length > 0 && (
                    <>
                      <h4 className="text-lg font-semibold mb-2">🎬 Direção</h4>
                      <div className="flex flex-wrap gap-4">
                        {movie.crew.map((person) => (
                          <div key={person.id} className="w-24 text-center">
                            <img
                              src={
                                person.profile_path
                                  ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=random&size=256&rounded=true&font-size=0.45`
                              }
                              alt={person.name}
                              className="w-24 h-24 object-cover rounded-full mx-auto shadow"
                            />
                            <p className="text-xs mt-2">{person.name}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {movie?.cast?.length > 0 && (
                    <>
                      <h4 className="text-lg font-semibold mt-6 mb-2">⭐ Elenco</h4>
                      <div className="flex flex-wrap gap-4">
                        {movie?.cast?.map((actor) => (
                          <div key={actor.id} className="w-24 text-center">
                            <img
                              src={
                                actor.profile_path
                                  ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name)}&background=random&size=256&rounded=true&font-size=0.45`
                              }
                              alt={actor.name}
                              className="w-24 h-24 object-cover rounded-full mx-auto shadow"
                            />
                            <p className="text-xs mt-2"><strong>{actor.name}</strong></p>
                            <p className="text-xs mt-2">{actor.character}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Filmes() {
  const SHEET_NAME = 'Movies';
  const ITEMS_PER_PAGE = 24;

  const { dataSheets } = useContext(DataContext);
  const movies = dataSheets[SHEET_NAME] || []

  const [filteredMovies, setFilteredMovies] = useState(movies);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [loadingTmdb, setLoadingTmdb] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' ou 'list'

  const gridRef = useRef(null);

  const isAdultGenre = (genre = "") =>
    genre.toLowerCase().includes("adult") || genre.toLowerCase().includes("erotic");

  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);

  const paginated = filteredMovies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  function getValueOrDafault(value, outher) {
    return !isNullOrEmpty(value) ? value : outher;
  }

  function isNullOrEmpty(value) {
    return value == null || String(value).trim() === '';
  }

  async function handleOpenModal(movie) {
    setLoadingTmdb(true);

    try {
      const tmdbId = await fetchTmdbMovieId(getValueOrDafault(movie.original_title, movie.title), movie.year);
      if (tmdbId) {
        const tmdbData = await fetchCastAndCrew(tmdbId);
        setSelectedMovie({ ...movie, ...tmdbData });
      } else {
        setSelectedMovie(movie); // Sem dados TMDb, mas abre modal
      }
    } catch (error) {
      console.error("Erro ao buscar dados do TMDb", error);
      setSelectedMovie(movie); // fallback
    } finally {
      setLoadingTmdb(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-6">
      <FilterSheets
        dataSheets={movies}
        onFilter={setFilteredMovies}
        estatisticas={{
          tipo: "filme",
          total: filteredMovies.length,
          emojis: {
            total: "🎬",
            assistidos: "👁️‍🗨️",
            adultos: "🔞",
          },
          labels: {
            assistidos: "assistidos"
          }
        }}
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

      {loadingTmdb && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white text-center p-6 rounded-lg shadow-lg text-gray-700 font-semibold">
            Carregando informações do filme...
          </div>
        </div>
      )}

      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">

          {/* Grid view */}
          {viewMode === "grid" && (

            <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {paginated.map((movie) => {
                const imageSrc = getSanitizedImage(movie);

                return (
                  <div
                    key={`${movie.title}-${movie.id}`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer
                  transform transition duration-300 hover:scale-105 hover:shadow-xl relative group"
                    title={`${movie?.subtitle || movie?.title} (${movie?.year || "Ano desconhecido"})`}
                    onClick={() => handleOpenModal(movie)}
                  >
                    {/* +18 Badge */}
                    {isAdultGenre(movie?.genre) && (
                      <span className="absolute top-2 left-2 bg-red-700 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-md z-10">
                        +18
                      </span>
                    )}

                    {/* Assistido */}
                    {movie?.watched === "W" && (
                      <span className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-md z-10">
                        Assistido
                      </span>
                    )}

                    {/* Imagem */}
                    <div className="relative w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={movie.title}
                        className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        draggable={false}
                      />
                    </div>

                    {/* Conteúdo */}
                    <div className="p-3 flex flex-col flex-grow text-center">
                      <h3 className="text-sm font-semibold line-clamp-2">{movie?.subtitle || movie?.title}</h3>
                      {movie?.subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">{movie.title}</p>
                      )}
                      <p className="text-[11px] text-gray-400 dark:text-gray-300 mt-1">{movie?.year || "Ano desconhecido"}</p>
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
        onPageChange={(page) => setCurrentPage(page)} />

      {/* Modal */}
      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  );
}
