import { ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { Bookmark, Eye, TvIcon } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

import { FilterSheets } from "../components/FilterSheets";
import { Pagination } from "../components/Pagination";
import { DataContext } from "../context/DataContext";
import {
  CATEGORY_COMICS,
  CATEGORY_MANGAS,
  CATEGORY_BOOKS,
  SHEET_LIVROS
} from "../utils/constantes";
import { getOwnedList, getSanitizedImage, getValueOrDafault, isNotNullOrEmpty, isNullOrEmpty, isFlagTrue } from '../utils/utils';
import { ControlStatusComponent } from '../components/ControlStatusComponent';
import { useNavigate } from 'react-router-dom';

function getTotalVolumes(volumeString) {
  if (typeof volumeString === 'string') {
    const [, total] = volumeString?.split("|").map(s => s.trim());
    return Number(total) || volumeString;
  }
  return volumeString;
}

// VolumesStatus Component
function VolumesStatus({ totalVolumes, readVolume }) {
  const total = getTotalVolumes(totalVolumes);
  const totalNaColecao = getOwnedList(totalVolumes);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2 text-sm font-semibold text-gray-700">
        <div>Volumes na coleção: {totalNaColecao} / {total}</div>
        <div>Volumes lidos: {readVolume}</div>
      </div>
      <div className="grid grid-cols-8 gap-1">
        {Array.from({ length: total }).map((_, idx) => {
          const volNum = idx + 1;
          const isRead = volNum <= readVolume;
          const isOwned = volNum <= totalNaColecao;
          return (
            <div
              key={volNum}
              className={`w-6 h-6 text-xs flex items-center justify-center rounded ${isRead ? "bg-green-500 text-white" : isOwned ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400" }`}
              title={`Volume ${volNum} ${isRead ? "(Lido)" : ""}`}
            >
              {volNum}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Modal({ livro, livros, onClose, onSelectRelated }) {
  if (!livro) return null;

  const [activeTab, setActiveTab] = useState("obra");

  const relatedlivros = livros.filter((c) => c.title === livro.title && c.id !== livro.id);

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
              className={`px-3 py-1 font-semibold rounded ${activeTab === "obra" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
              onClick={() => setActiveTab("obra")}
            >
              Obra
            </button>
            {
              getTotalVolumes(livro.volume) > 1 && (
                <button
                  className={`px-3 py-1 font-semibold rounded ${activeTab === "volume" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
                  onClick={() => setActiveTab("volume")}
                >
                  Volume
                </button>
              )
            }
            {relatedlivros.length > 0 && (
              <button
                className={`px-3 py-1 font-semibold rounded ${activeTab === "relacionados" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
                onClick={() => setActiveTab("relacionados")}
              >
                Quadrinhos Relacionados
              </button>
            )}
          </div>

          {activeTab === "obra" && (
            <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-4 md:gap-6">
              <div className="w-full md:w-48 aspect-[2/3] rounded overflow-hidden flex-shrink-0">
                <img
                  src={getSanitizedImage(livro)}
                  alt={livro.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-2 text-gray-800">
                  {livro.title}
                </h2>
                {isNotNullOrEmpty(livro.publication_title) && (
                  <p className="italic text-sm text-gray-600 mb-2">
                    {livro.publication_title}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 text-sm text-gray-700 mb-4">
                  <p><strong>Editora:</strong> {getValueOrDafault(livro.publisher, "N/A")}</p>
                  <p><strong>Ano:</strong> {getValueOrDafault(livro.year, "N/A")}</p>
                  <p><strong>Idioma:</strong> {getValueOrDafault(livro.language, "N/A")}</p>

                  {livro.genre && (
                    <p><strong>Gênero: </strong>
                      {livro.genre?.split(",").map((g) => (
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
                  )}
                  <p className="mb-2 text-gray-700 text-sm">
                    <strong>Título original: </strong>
                    {getValueOrDafault(livro.original_title, "N/A")}
                  </p>
                  <div className="mb-2 text-sm">
                    <p><strong>País(es) de Publicação: </strong>
                      {livro?.countries?.split(",").map((g) => (
                        <span
                          key={g?.trim()}
                          className="inline-block px-2 py-0.5 mr-1 rounded text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {g.trim() || "N/A"}
                        </span>
                      ))}
                    </p>
                  </div>

                  {isNotNullOrEmpty(livro.phase) && (
                    <p className="mb-2 text-gray-700 text-sm">
                      <strong>Fase: </strong> {livro.phase}
                    </p>
                  )}

                  {livro.authors && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">Autores</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {livro.authors
                          .split("\n\n")
                          .filter(Boolean)
                          .map((author, idx) => {
                            const trimmed = author.trim();
                            if (trimmed.startsWith("<>")) {
                              return (
                                <li key={idx}>
                                  ✍️ {trimmed.replace("<>", "")}{" "}
                                  <span className="text-gray-500">(Escritor)</span>
                                </li>
                              );
                            }
                            if (trimmed.startsWith("*")) {
                              return (
                                <li key={idx}>
                                  🎨 {trimmed.replace("*", "")}{" "}
                                  <span className="text-gray-500">(Artista)</span>
                                </li>
                              );
                            }
                            return <li key={idx}>{trimmed}</li>;
                          })}
                      </ul>
                    </div>
                  )}
                </div>

                <ControlStatusComponent
                  data={livro}
                  status={{
                    emoji: "📖",
                    condicoes: {
                      completo: livro.read === "R",
                      pacialmente: livro.read === "P"
                    },
                    labels: {
                      incompleto: "Não lido",
                      completo: "Lido",
                      pacialmente: "Parcialmente lido",
                    }

                  }}
                />

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Sinopse</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {livro?.synopsis}
                  </p>
                </div>

                {livro.notes && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-600 whitespace-pre-line">
                    <strong>Notas:</strong>
                    <p className="mt-1">{livro.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isNotNullOrEmpty(livro.volume) && (
            <>
              {activeTab === "volume" && (
                <VolumesStatus totalVolumes={livro.volume} readVolume={livro.read_volume || 0} />
              )}
            </>
          )}

          {activeTab === "relacionados" && (
            <>
              {relatedlivros.length > 0 && (
                <div className="mt-6">
                  {/* Agrupamento por fase */}
                  {Object.entries(
                    relatedlivros.reduce((acc, c) => {
                      const phaseKey = c.phase ? `Fase ${c.phase}` : "Fase desconhecida";
                      if (!acc[phaseKey]) acc[phaseKey] = [];
                      acc[phaseKey].push(c);
                      return acc;
                    }, {})
                  ).map(([phase, livros]) => (
                    <div key={phase} className="mb-4">
                      <h4 className="text-md font-semibold mb-2 text-gray-800">{phase}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto">
                        {livros?.map((relLivro) => (
                          <div
                            key={relLivro.id}
                            className="cursor-pointer border rounded p-2 hover:shadow-md flex items-center gap-2 bg-white"
                            onClick={() => {
                              setActiveTab("obra")
                              onSelectRelated(relLivro);
                            }}
                          >
                            <img
                              src={getSanitizedImage(relLivro)}
                              alt={relLivro.title}
                              className="w-14 h-20 object-cover rounded shadow-sm"
                            />
                            <div className="flex flex-col text-sm overflow-hidden">
                              <span className="font-semibold truncate">
                                {getValueOrDafault(relLivro.publication_title, relLivro.title)}
                                {isNotNullOrEmpty(relLivro?.phase) && <> ({relLivro?.phase})</>}
                              </span>
                              {relLivro.id_phase && (
                                <span className="text-gray-600 text-xs">
                                  Volume: {relLivro.id_phase}
                                </span>
                              )}
                              {isFlagTrue(relLivro.collection) && (
                                <>
                                  {relLivro?.phase && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">Fase: {relLivro.phase}</p>
                                  )}
                                  <p className="text-xs text-gray-600 mt-auto">
                                    Coleção
                                  </p>
                                </>
                              )}
                              <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-700">
                                <BadgeIdioma
                                  livro={relLivro}
                                  className={'px-2 py-0.5 rounded font-medium shadow-sm'}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Books() {
  const ITEMS_PER_PAGE = 24;

  const categories = [CATEGORY_COMICS, CATEGORY_MANGAS, CATEGORY_BOOKS];

  const { dataSheets } = useContext(DataContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se dataSheets está vazio
    if (!dataSheets || Object.keys(dataSheets).length === 0) {
      navigate("/home", { replace: true });
    }
  }, [dataSheets, navigate]);
  
  const livros = dataSheets[SHEET_LIVROS] || [];

  const livrosComplete = useMemo(() => {
    return livros.map((l) => {
      // Se o livro NÃO for uma coleção, mas fizer parte de uma (mesmo título)
      const collectionParent = !isFlagTrue(l.collection)
        ? livros.find((c) => isFlagTrue(c.collection) && c.title === l.title)
        : null;

      // Herança reversa: se o livro for filho, herda campos do pai se não tiver
      return {
        ...l,
        countries: getValueOrDafault(l.countries, collectionParent?.countries),
        genre: getValueOrDafault(l.genre, collectionParent?.genre),
      };
    })
  }, [livros]);

  const [filteredLivros, setFilteredLivros] = useState([]);
  const [selectedlivro, setSelectedLivro] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' ou 'list'

  const gridRef = useRef(null);

  const totalPages = Math.ceil(filteredLivros.length / ITEMS_PER_PAGE);

  const paginated = filteredLivros.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setFilteredLivros(livrosComplete);
  }, [livrosComplete]); // This effect runs whenever 'livrosComplete' changes

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredLivros]);

  useEffect(() => {
    // Ao mudar a página, rolar para o topo do grid
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // fallback para rolar a página toda até o topo
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const handleSelectRelated = (livro) => {
    setSelectedLivro(livro);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-6">
      <FilterSheets
        dataSheets={livrosComplete}
        onFilter={setFilteredLivros}
        estatisticas={{
          tipo: "livro",
          total: filteredLivros.length,
          emojis: {
            total: "📚",
            assistidos: "👁️‍🗨️",
            adultos: "🔞",
          },
          labels: {
            assistidos: "lidos"
          }
        }}
        categoriesOptions={categories}
        categoryDefault={CATEGORY_COMICS}
        sortByDefault={'title-asc'}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {paginated.map((livro) => {
                return (
                  <div
                    key={`${livro.category}-${livro.title}-${livro.id}-grid`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer
                  transform transition duration-300 hover:scale-105 hover:shadow-xl relative group"
                    onClick={() => setSelectedLivro(livro)}
                  >

                    {/* Lido */}
                    {livro?.read === "R" && (
                      <span className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-md z-10">
                        Lido
                      </span>
                    )}

                    <div className="relative w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <img
                        src={getSanitizedImage(livro)}
                        alt={livro.title}
                        className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        draggable={false}
                      />
                    </div>
                    <div className="p-2 flex-1 flex flex-col">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {getValueOrDafault(livro?.publication_title, livro.title)}
                      </h3>
                      {livro?.publication_title && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">{livro.title}</p>
                      )}
                      {isNotNullOrEmpty(livro.id_phase) && (
                        <p className="text-xs text-gray-600 mt-auto">
                          Volume: {livro.id_phase}
                        </p>
                      )}
                      {isFlagTrue(livro.collection) && (
                        <>
                          {isNotNullOrEmpty(livro?.phase) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">{livro.phase}</p>
                          )}
                          <p className="text-xs text-gray-600 mt-auto">
                            Coleção
                          </p>
                        </>
                      )}
                    </div>

                    <BadgeIdioma
                      livro={livro}
                      className={'absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm'}
                    />
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
          {paginated.map((livro) => {
            return (
              <div
                key={`${livro.category}-${livro.title}-${livro.id}-list`}
                className="flex items-center gap-4 bg-white p-3 rounded-lg shadow hover:shadow-lg cursor-pointer"
                onClick={() => setSelectedLivro(livro)}
              >
                <img
                  src={getSanitizedImage(livro)}
                  alt={livro.title}
                  className="w-20 h-28 object-cover rounded-md border border-gray-300 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {getValueOrDafault(livro?.publication_title, livro.title)}
                  </h3>

                  {!isNullOrEmpty(livro?.publication_title) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">{livro.title}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {livro.year && (
                      <span>
                        <strong>Ano:</strong> {livro.year}
                      </span>
                    )}
                    {livro.publisher && (
                      <span>
                        <strong>Editora:</strong> {livro.publisher}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                    <BadgeIdioma
                      livro={livro}
                      className={' px-2 py-0.5 rounded font-medium shadow-sm'}
                    />
                  </div>

                  {livro.volume && (
                    <p className="text-xs text-gray-600 mt-1">
                      Volume: {livro.volume}
                    </p>
                  )}

                  {isFlagTrue(livro.collection) && (
                    <>
                      {livro?.phase && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">Fase: {livro.phase}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-auto">
                        Coleção
                      </p>
                    </>
                  )}

                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-700">
                    {livro.genre && (
                      <span>
                        Gênero: {livro.genre?.split(",").map((g) => (
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
                    data={livro}
                    status={{
                      emoji: "📖",
                      condicoes: {
                        completo: livro.read === "R",
                        pacialmente: livro.read === "P"
                      },
                      labels: {
                        incompleto: "Não lido",
                        completo: "Lido",
                        pacialmente: "Parcialmente lido",
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

      < Modal
        livro={selectedlivro}
        livros={livrosComplete}
        onClose={() => setSelectedLivro(null)}
        onSelectRelated={handleSelectRelated}
      />
    </div>
  );
}

{/* Badge de idioma com cor por linguagem */ }
function BadgeIdioma({ livro, className }) {
  if (isNullOrEmpty(livro?.language)) return <></>
  return (
    <span
      className={`${className}
                          ${livro.language === "English"
          ? "bg-blue-100 text-blue-700"
          : livro.language === "Portugues"
            ? "bg-green-100 text-green-700"
            : livro.language === "Spanish"
              ? "bg-red-100 text-red-700"
              : livro.language === "French"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-200 text-gray-700"
        }`}>
      {livro.language.toUpperCase()}
    </span>
  )
}
