import { ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ControlStatusComponent } from "../components/ControlStatusComponent";
import { FilterSheets } from "../components/FilterSheets";
import { Pagination } from "../components/Pagination";
import { DataContext } from "../context/DataContext";
import { fetchCastAndCrew, fetchTmdbMovieId, getSanitizedImage, getValueOrDafault, isNullOrEmpty } from "../utils/utils";
import { useNavigate } from 'react-router-dom';
import { SHEET_MOVIES, STATUS_VIDEO_NOTW, STATUS_VIDEO_P, STATUS_VIDEO_W } from '../utils/constantes';

function MovieModal({ movie, movies, onClose, onSelectRelated }) {
  if (!movie) return null;

  const [activeTab, setActiveTab] = useState("detalhes");

  const relatedMoviesRaw = movies.filter((m) => m.title === movie.title && m.id !== movie.id);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >

      <div className="fixed inset-0 flex justify-center items-center z-50 p-4 overflow-auto">
        <div
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-4 text-gray-600 hover:text-black text-2xl font-bold"
          >
            &times;
          </button>

          <div className="mb-4 flex space-x-4 border-b pb-2">
            <button
              className={`px-3 py-1 font-semibold rounded ${activeTab === "detalhes" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
              onClick={() => setActiveTab("detalhes")}
            >
              Detalhes
            </button>
            <button
              className={`px-3 py-1 font-semibold rounded ${activeTab === "elenco" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
              onClick={() => setActiveTab("elenco")}
            >
              Elenco e equipe
            </button>
            {relatedMoviesRaw.length > 0 && (
              <button
                className={`px-3 py-1 font-semibold rounded ${activeTab === "relacionados" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
                onClick={() => setActiveTab("relacionados")}
              >
                Filmes Relacionados
              </button>
            )}
          </div>

          {activeTab === "detalhes" && (
            <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6">
              {/* Capa */}
              <div className="w-full md:w-48 aspect-[2/3] rounded overflow-hidden flex-shrink-0">
                <img
                  src={getSanitizedImage(movie)}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Conteúdo */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-2 text-gray-800">{movie.title}</h2>
                {movie.original_title && (
                  <p className="italic text-sm text-gray-600 mb-2">
                    {movie.original_title}
                  </p>
                )}

                {/* Informações Gerais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p><strong>Ano:</strong> {getValueOrDafault(movie.year, "N/A")}</p>
                  <p><strong>País(es): </strong>
                    {movie?.countries?.split(",").map((g) => (
                      <span
                        key={g?.trim()}
                        className="inline-block px-2 py-0.5 mr-1 rounded text-xs font-medium bg-blue-100 text-blue-700"
                      >
                        {g.trim() || "N/A"}
                      </span>
                    ))}
                  </p>
                  <p>
                    <strong>Gênero:</strong>{" "}
                    {movie.genre?.split(",").map((g) => (
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
                </div>

                <ControlStatusComponent
                  data={movie}
                  status={{
                    emoji: "👁️‍🗨️",
                    condicoes: {
                      completo: movie.watched === "W",
                      pacialmente: movie.watched === "P"
                    },
                    labels: {
                      incompleto: "Não assistido",
                      completo: "Assistido",
                      pacialmente: "Parcialmente assistido",
                    }
                  }}
                />

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Sinopse</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {getValueOrDafault(movie?.synopsis, "N/A")}
                  </p>
                </div>

                {movie?.notes && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-600 whitespace-pre-line">
                    <strong>Notas:</strong>
                    <p className="mt-1">{movie.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "elenco" && (
            <>
              {/* Cast e Direção do TMDb */}
              {(movie?.cast?.length || movie?.crew?.length) && (
                <div className="mt-6">
                  {movie.crew?.length > 0 && (
                    <>
                      <h4 className="text-lg font-semibold mb-2">🎬 Direção</h4>
                      <div className="flex flex-wrap gap-4">
                        {movie.crew.map((person) => (
                          <div key={person?.id} className="w-24 text-center">
                            <img
                              src={
                                person?.profile_path
                                  ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=random&size=256&rounded=true&font-size=0.45`
                              }
                              alt={person?.name}
                              className="w-24 h-24 object-cover rounded-full mx-auto shadow"
                            />
                            <p className="text-xs mt-2">{person?.name}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {(movie?.cast?.length ) && (
                    <>
                      <h4 className="text-lg font-semibold mt-6 mb-2">⭐ Elenco</h4>
                      <div className="flex flex-wrap gap-4">
                        {movie?.cast?.map((actor) => (
                          <div key={actor?.id} className="w-24 text-center">
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
            </>
          )}

          {activeTab === "relacionados" && (
            <>
              {relatedMoviesRaw.length > 0 && (
                <div className="mt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto">
                    {relatedMoviesRaw?.map((relMovie) => (
                      <div
                        key={relMovie.id}
                        className="cursor-pointer border rounded p-2 hover:shadow-md flex items-center gap-2 bg-white"
                        onClick={() => {
                          setActiveTab("detalhes")
                          onSelectRelated(relMovie);
                        }}
                      >
                        <img
                          src={getSanitizedImage(relMovie)}
                          alt={relMovie.title}
                          className="w-14 h-20 object-cover rounded shadow-sm"
                        />
                        <div className="flex flex-col text-sm overflow-hidden">
                          <span className="font-semibold truncate">
                            {getValueOrDafault(relMovie.subtitle, relMovie.title)}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            {relMovie.year || "N/A"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div >
    </div >
  );
}

export default function Filmes() {
  const ITEMS_PER_PAGE = 24;

  const { dataSheets } = useContext(DataContext);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se dataSheets está vazio
    if (!dataSheets || Object.keys(dataSheets).length === 0) {
      navigate("/home", { replace: true });
    }
  }, [dataSheets, navigate]);

  const movies = dataSheets[SHEET_MOVIES] || [];

  const moviesComplete = useMemo(() => {
      return movies.map((m) => ({ ...m, status: m.watched }))
  }, [movies]);

  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [loadingTmdb, setLoadingTmdb] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' ou 'list'

  const gridRef = useRef(null);

  useEffect(() => {
    setFilteredMovies(moviesComplete);
  }, [moviesComplete]); // This effect runs whenever 'moviesComplete' changes

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
 
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);

  const paginated = filteredMovies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  async function handleOpenModal(movie) {
    setLoadingTmdb(true);

    try {
      const tmdbId = await fetchTmdbMovieId(getValueOrDafault(movie.original_title, movie.title), movie.year);
      if (tmdbId) {
        const tmdbData = await fetchCastAndCrew(tmdbId);
        setSelectedMovie({ ...movie, ...tmdbData });
      } else {
        console.log('Não no tmdbId')

        setSelectedMovie(movie); // Sem dados TMDb, mas abre modal
      }
    } catch (error) {
      console.error("Erro ao buscar dados do TMDb", error);
      setSelectedMovie(movie); // fallback
    } finally {
      setLoadingTmdb(false);
    }
  }

  const handleSelectRelated = (movie) => {
    handleOpenModal(movie);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-6">
      <FilterSheets
        id='movies'
        dataSheets={moviesComplete}
        onFilter={setFilteredMovies}
        sortByDefault={'year-desc'}
        estatisticas={{
          tipo: "filme",
          total: filteredMovies?.length,
          emojis: {
            total: "🎬",
            assistidos: "👁️‍🗨️",
            adultos: "🔞",
          },
          labels: {
            assistidos: "assistidos"
          }
        }}
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
                      <span className="absolute top-2 left-2 bg-red-700 text-white text-[15px] font-semibold px-1.5 py-0.5 rounded shadow-md z-10">
                        +18
                      </span>
                    )}

                    {/* Assistido */}
                    {movie?.watched === "W" && (
                      <span className="absolute top-2 right-2 bg-green-600 text-white text-[15px] font-semibold px-1.5 py-0.5 rounded shadow-md z-10">
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

      {/* List view */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {paginated.map((movie) => {
            const imageSrc = getSanitizedImage(movie);

            return (
              <div
                key={`${movie.title}-${movie.id}-list`}
                className="flex items-center gap-4 bg-white p-3 rounded-lg shadow hover:shadow-lg cursor-pointer"
                onClick={() => handleOpenModal(movie)}
              >
                <img
                  src={imageSrc}
                  alt={movie.title}
                  className="w-20 h-28 object-cover rounded-md border border-gray-300 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {movie?.subtitle || movie?.title}
                  </h3>
                  {!isNullOrEmpty(movie?.subtitle) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">{movie.title}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {movie.year && (
                      <span>
                        <strong>Ano:</strong> {movie.year}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-700">
                    {movie.genre && (
                      <span>
                        Gênero: {movie.genre?.split(",").map((g) => (
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
                    data={movie}
                    status={{
                      emoji: "👁️‍🗨️",
                      condicoes: {
                        completo: movie.watched === "W",
                        pacialmente: movie.watched === "P"
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
        onPageChange={(page) => setCurrentPage(page)} />

      {/* Modal */}
      <MovieModal
        movie={selectedMovie}
        movies={movies}
        onClose={() => setSelectedMovie(null)}
        onSelectRelated={handleSelectRelated} />
    </div>
  );
}
