import { useEffect, useState } from "react";
import FilterSheetsUI from "./FilterSheetsUI";
import { getValueOrDafault, isAdultGenre, isFlagTrue } from "../utils/utils";
import { COLECAO_NAO, COLECAO_SIM, STATUS_BOOK_NOTR, STATUS_BOOK_P, STATUS_BOOK_R, STATUS_VIDEO_NOTW, STATUS_VIDEO_P, STATUS_VIDEO_W } from "../utils/constantes";

export function FilterSheets({
  id,
  dataSheets,
  dataSheetsGroup,
  onFilter,
  estatisticas,
  categoriesOptions = [],
  statusOptions = [],
  categoryDefault = '',
  isVisibleShowRead = false,
  sortByDefault = 'year-desc'
}) {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedStatus, setSelectedStatus] = useState();
  const [selectedOwned, setSelectedOwned] = useState();
  const [showWatched, setShowWatched] = useState(false);
  const [showRead, setShowRead] = useState(false);
  const [showOwned, setShowOwned] = useState(false);
  const [showAdult, setShowAdult] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(sortByDefault);

  const [filtered, setFiltered] = useState([]);

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

  const languages = Array.from(
    new Set(dataSheets.flatMap((m) => m.language?.split(",").map((c) => c.trim()) ?? []))
  ).sort();

  useEffect(() => {
    setSelectedCategory(categoryDefault)
  }, [])

  useEffect(() => {
    let filtered = dataSheets.filter((m) => {
      const matchesGenre = selectedGenre ? m.genre?.includes(selectedGenre) : true;
      const matchesCountry = selectedCountry ? m.countries?.includes(selectedCountry) : true;
      const matchesYear = selectedYear ? m.year?.toString() === selectedYear : true;
      const matchesLanguage = selectedLanguage ? m.language?.includes(selectedLanguage) : true;
      const matchesCategory = selectedCategory ? m?.category === selectedCategory : true;
      const matchesStatus = getValueStatus(selectedStatus) ? m.status === getValueStatus(selectedStatus) : true;
      const matchesOwned = selectedOwned ? (COLECAO_SIM === selectedOwned ? m.owned === 'TRUE' : m.owned === 'FALSE') : true;
      const matchesWatched = showWatched ? m?.watched === "W" : true;
      const matchesRead = showRead ? m.read === "R" : true;
      const matchesShowOwned = showOwned ? isFlagTrue(m.owned) : true;
      const matchesAdult =
        showAll ? true : 
        showAdult ? isAdultGenre(m.genre) : !(isAdultGenre(m.genre));
      const matchesSearch = searchTerm
        ? [m.title, m.original_title, m.subtitle, m.publication_title, m.publisher, m.cast, m.authors]
          .filter(Boolean) // remove campos null/undefined/vazios
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
        : true;

      return (
        matchesGenre &&
        matchesCountry &&
        matchesCategory &&
        matchesStatus &&
        matchesOwned &&
        matchesYear &&
        matchesLanguage &&
        matchesWatched &&
        matchesRead &&
        matchesShowOwned &&
        matchesAdult &&
        matchesSearch
      );
    });

    let finalList = filtered;

    if (dataSheetsGroup !== undefined) {
      finalList = dataSheetsGroup.filter((f) =>
        filtered.some((g) => g.title === f.title)
      );
    }

    if (sortBy === "title-asc") {
      finalList = [...finalList].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "title-desc") {
      finalList = [...finalList].sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === "year-desc") {
      finalList = [...finalList].sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortBy === "year-asc") {
      finalList = [...finalList].sort((a, b) => (a.year || 0) - (b.year || 0));
    }

    onFilter(finalList);
    setFiltered(finalList);
  }, [
    selectedGenre,
    selectedCountry,
    selectedYear,
    selectedLanguage,
    selectedCategory,
    selectedStatus,
    selectedOwned,
    showWatched,
    showRead,
    showOwned,
    showAdult,
    showAll,
    searchTerm,
    sortBy
  ]);

  const activeFilters = [
    selectedGenre && { label: selectedGenre, onClear: () => setSelectedGenre("") },
    selectedCountry && { label: selectedCountry, onClear: () => setSelectedCountry("") },
    selectedYear && { label: selectedYear, onClear: () => setSelectedYear("") },
    selectedLanguage && { label: selectedLanguage, onClear: () => setSelectedLanguage("") },
    selectedCategory && { label: selectedCategory, onClear: () => setSelectedCategory("") },
    selectedStatus && { label: selectedStatus, onClear: () => setSelectedStatus("") },
    selectedOwned && { label: selectedOwned, onClear: () => setSelectedOwned("") },
    showWatched && { label: "Assistidos", onClear: () => setShowWatched(false) },
    showRead && { label: "Lidos", onClear: () => setShowRead(false) },
    showOwned && { label: "Na coleção", onClear: () => setShowOwned(false) },
    showAdult && { label: "+18", onClear: () => setShowAdult(false) },
    showAll && { label: "Tudo", onClear: () => setShowAll(false) },
    searchTerm && { label: `Busca: "${searchTerm}"`, onClear: () => setSearchTerm("") },
  ].filter(Boolean);

  const totalFiltered = filtered.filter((m) => {
    if (showAll) return true;

    const isAdult = isAdultGenre(m.genre);
    return isAdult && showAdult ? true : !isAdult;
  });

  const watchedCount = totalFiltered.filter((m) => m.watched === "W").length;
  const readCount = totalFiltered.filter((m) => m.read === "R").length;
  const adultCount = totalFiltered.filter((m) => isAdultGenre(m.genre)).length;

  return (
    <FilterSheetsUI
      id={id}
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

      selectedLanguage={selectedLanguage}
      languagesOptions={languages}
      setSelectedLanguage={setSelectedLanguage}

      selectedCategory={selectedCategory}
      categoriesOptions={categoriesOptions}
      setSelectedCategory={setSelectedCategory}

      selectedStatus={selectedStatus}
      statusOptions={statusOptions}
      setSelectedStatus={setSelectedStatus}

      selectedOwned={selectedOwned}
      ownedOptions={[COLECAO_SIM, COLECAO_NAO]}
      setSelectedOwned={setSelectedOwned}

      showWatched={showWatched}
      setShowWatched={setShowWatched}

      showRead={showRead}
      setShowRead={setShowRead}

      setShowOwned={setShowOwned}
      showOwned={showOwned}

      showAdult={showAdult}
      setShowAdult={setShowAdult}

      showAll={showAll}
      setShowAll={setShowAll}

      sortBy={sortBy}
      setSortBy={setSortBy}

      activeFilters={activeFilters}
      isVisibleShowRead={isVisibleShowRead}

      estatisticas={renderEstatisticas({ ...estatisticas, assistidos: isVisibleShowRead ? readCount : watchedCount, adultos: adultCount })}
    />
  );
}

function getValueStatus(selectedStatus) {
  if (selectedStatus == undefined) return null;
  if (selectedStatus) {
    switch (selectedStatus) {
      case STATUS_BOOK_NOTR:
        return 'NOTR'
      case STATUS_BOOK_R:
        return 'R'
      case STATUS_VIDEO_NOTW:
        return 'NOTW'
      case STATUS_VIDEO_W:
        return 'W'
      case STATUS_BOOK_P:
      case STATUS_VIDEO_P:
        return 'P'
    }
  }
}

function getValueOwned(selectedOwned) {
  return selectedOwned != undefined ? (COLECAO_SIM == selectedOwned ? true : false) : true;
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