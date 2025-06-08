import { useEffect, useState } from "react";
import FilterSheetsUI from "./FilterSheetsUI";

export function FilterSheets({ dataSheets, onFilter, estatisticas, categoriesOptions = [], categoryDefault }) {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCategory, setSelectedCategory] = useState();
  const [showWatched, setShowWatched] = useState(false);
  const [showOwned, setShowOwned] = useState(false);
  const [showAdult, setShowAdult] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("year-desc");

  const genres = Array.from(
    new Set(dataSheets.flatMap((m) => m.genre?.split(",").map((g) => g.trim()) ?? []))
  ).sort();

  const countries = Array.from(
    new Set(dataSheets.flatMap((m) => m.countries?.split(",").map((c) => c.trim()) ?? []))
  ).sort();

  const years = Array.from(
    new Set(dataSheets.map((m) => {
      if (!m.year) return null;
      // Converte para número, se possível
      const y = Number(m.year);
      return isNaN(y) ? m.year.trim() : y;
    }).filter(Boolean))
  ).sort((a, b) => b - a);

  useEffect(() => {
    setSelectedCategory(categoryDefault)
  }, [])

  useEffect(() => {
    let filtered = dataSheets.filter((m) => {
      const matchesGenre = selectedGenre ? m.genre?.includes(selectedGenre) : true;
      const matchesCountry = selectedCountry ? m.countries?.includes(selectedCountry) : true;
      const matchesYear = selectedYear ? m.year?.toString() === selectedYear : true;
      const matchesCategory = selectedCategory ? m?.category === selectedCategory : true;
      const matchesWatched = showWatched ? m.watched === "W" : true;
      const matchesOwned = showOwned ? m.owned : true;
      const matchesAdult = showAdult
        ? m.genre?.toLowerCase().includes("adult") || m.genre?.toLowerCase().includes("erotic")
        : !(
          m.genre?.toLowerCase().includes("adult") ||
          m.genre?.toLowerCase().includes("erotic")
        );
      const matchesSearch = searchTerm
        ? [m.title, m.original_title, m.subtitle, m.cast]
          .filter(Boolean) // remove campos null/undefined/vazios
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
        : true;

      return (
        matchesGenre &&
        matchesCountry &&
        matchesCategory &&
        matchesYear &&
        matchesWatched &&
        matchesOwned &&
        matchesAdult &&
        matchesSearch
      );
    });

    if (sortBy === "title-asc") {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "title-desc") {
      filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === "year-desc") {
      filtered = [...filtered].sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortBy === "year-asc") {
      filtered = [...filtered].sort((a, b) => (a.year || 0) - (b.year || 0));
    }

    onFilter(filtered);
  }, [
    selectedGenre,
    selectedCountry,
    selectedYear,
    selectedCategory,
    showWatched,
    showOwned,
    showAdult,
    searchTerm,
    sortBy,
  ]);

  const activeFilters = [
    selectedGenre && { label: selectedGenre, onClear: () => setSelectedGenre("") },
    selectedCountry && { label: selectedCountry, onClear: () => setSelectedCountry("") },
    selectedYear && { label: selectedYear, onClear: () => setSelectedYear("") },
    selectedCategory && { label: selectedCategory, onClear: () => setSelectedCategory("") },
    showWatched && { label: "Assistidos", onClear: () => setShowWatched(false) },
    showOwned && { label: "Possuídos", onClear: () => setShowOwned(false) },
    showAdult && { label: "+18", onClear: () => setShowAdult(false) },
    searchTerm && { label: `Busca: "${searchTerm}"`, onClear: () => setSearchTerm("") },
  ].filter(Boolean);

  const totalFiltered = dataSheets.filter((m) => {
    const isAdult = m.genre?.toLowerCase().includes("adult") || m.genre?.toLowerCase().includes("erotic");
    const isWatched = m.watched === "W";
    return isAdult && showAdult ? true : !isAdult;
  });

  const watchedCount = totalFiltered.filter((m) => m.watched === "W").length;
  const adultCount = totalFiltered.filter((m) =>
    m.genre?.toLowerCase().includes("adult") || m.genre?.toLowerCase().includes("erotic")
  ).length;

  return (
    <FilterSheetsUI
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}

      selectedGenre={selectedGenre}
      setSelectedGenre={setSelectedGenre}
      genreOptions={genres}

      selectedCountry={selectedCountry}
      setSelectedCountry={setSelectedCountry}
      countriesOptions={countries}

      selectedYear={selectedYear}
      yearsOptions={years}
      setSelectedYear={setSelectedYear}

      selectedCategory={selectedCategory}
      categoriesOptions={categoriesOptions}
      setsSelectedCategory={setSelectedCategory}

      showWatched={showWatched}
      setShowWatched={setShowWatched}

      setShowOwned={setShowOwned}
      showOwned={showOwned}

      showAdult={showAdult}
      setShowAdult={setShowAdult}

      sortBy={sortBy}
      setSortBy={setSortBy}

      activeFilters={activeFilters}

      estatisticas={renderEstatisticas({...estatisticas, assistidos: watchedCount, adultos: adultCount })}
    />
  );
}

function renderEstatisticas({
  tipo = "item",           // Tipo base (filme, série, mangá, etc.)
  total = 0,
  assistidos = 0,          // Ou lidos / completados, conforme o tipo
  adultos = 0,
  emojis = {
    total: "📦",
    assistidos: "✅",
    adultos: "🔞",
  },
  labels = {
    encontrados: "encontrados",
    assistidos: "completos",
    adultos: "são +18",
  },
  pluralize = true,
}) {
  const plural = (word, count) => {
    if (!pluralize) return word;
    if (count === 1) return word;

    const irregular = {
      filme: "filmes",
      série: "séries",
      anime: "animes",
      livro: "livros",
      mangá: "mangás",
      item: "itens",
    };

    return irregular[word] || (word.endsWith("m") ? word.slice(0, -1) + "ns" : word + "s");
  };

  return (
    <>
      {emojis.total} <strong>{total}</strong> {plural(tipo, total)} {labels.encontrados}
      {assistidos > 0 && ` • ${emojis.assistidos} ${assistidos} ${labels.assistidos}`}
      {adultos > 0 && ` • ${emojis.adultos} ${adultos} ${labels.adultos ?? "são +18"}`}
    </>
  );
}