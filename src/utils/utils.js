function groupSeasonsByTitle(flatSeasons) {
  const grouped = {};

  flatSeasons.forEach((season) => {
    const title = season.title.trim();

    if (!grouped[title]) {
      grouped[title] = {
        ...season,
        seasons: [],
      };
    }

    // Removemos os campos que são de temporada, pois estarão na lista de seasons
    const {
      id, season: seasonNum, year, episodes, watchedEpisodes, synopsis, watched, owned
    } = season;

    grouped[title].seasons.push({
      id,
      season: seasonNum,
      year,
      episodes,
      watchedEpisodes,
      synopsis,
      watched,
      owned
    });
  });

  // Opcional: ordenar as temporadas por número
  Object.values(grouped).forEach(series => {
    series.seasons.sort((a, b) => a.season - b.season);
  });

  // Retorna array (não objeto)
  return Object.values(grouped);
}

export async function fetchTmdbMovieId(title, year) {
  const url = `${process.env.REACT_APP_URL_TMDB_MOVIE}?title=${encodeURIComponent(title)}&year=${year}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro na busca TMDb");

  const data = await res.json();
  return data.results?.[0]?.id || null;
}

export async function fetchCastAndCrew(tmdbId) {
  const url = `${process.env.REACT_APP_URL_TMDB_CREDITS}?tmdbId=${tmdbId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao buscar elenco");

  const data = await res.json();
  const crew = data.crew?.filter((p) => p.job === "Director") || [];
  const cast = data.cast?.slice(0, 10) || []; // Limita a 10

  return { crew, cast };
}

export async function fetchSheetData({ sheetName }) {
  if (!sheetName) {
    throw new Error("sheetName é obrigatório");
  }

  const response = await fetch(`${process.env.REACT_APP_URL_SHEETS}?sheetName=${encodeURIComponent(sheetName)}`);
  if (!response.ok) {
    throw new Error(`Erro ao buscar dados da planilha: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.values) {
    throw new Error("Dados inválidos da planilha");
  }

  return parseSheetData(data.values); // sua função de parsing dos dados
}

function parseSheetData(rows) {
  const headers = rows[0];
  const data = rows.slice(1);
  return data.map((row) => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.toLowerCase().replace(/\s+/g, "_")] = row[i];
    });
    return obj;
  });
}

export function isFlagTrue(value) {
  return value === 'TRUE';
}

export function getOwnedList(valor) {
  if (!valor.includes("|")) return valor;

  const [possuidosStr] = valor.split("|").map(s => s.trim());

  if (!possuidosStr) return 0;

  const entradas = possuidosStr.split(",").map(s => s.trim());

  let total = 0;

  for (const entrada of entradas) {
    if (entrada.includes("-")) {
      const [inicio, fim] = entrada.split("-").map(Number);
      if (!isNaN(inicio) && !isNaN(fim) && fim >= inicio) {
        total += fim - inicio + 1;
      }
    } else {
      const num = Number(entrada);
      if (!isNaN(num) && num !== 0) {
        total += 1;
      }
    }
  }

  return total;
}

export function expandRange(input) {
  const result = [];

  if (!isNaN(input)) {
    const n = Number(input);
    for (let i = 1; i <= n; i++) {
      result.push(i);
    }
    return result;
  }

  // descarta tudo depois do "|"
  input = input.split("|")[0];

  // separa por vírgula
  input.split(",").forEach(part => {
    part = part.trim();

    if (part.includes('-')) {
      // intervalo
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
    } else {
      // número único
      result.push(Number(part));
    }
  });

  return result;
}

export function getValueOrDafault(value, outher) {
  return !isNullOrEmpty(value) ? value : outher;
}

export function isNotNullOrEmpty(value) {
  return !isNullOrEmpty(value);
}

export function isNullOrEmpty(value) {
  return value == undefined || value == null || String(value).trim() === '';
}

export function getSanitizedImage(value) {
  if (isNullOrEmpty(value?.img)) return `${process.env.PUBLIC_URL}/imagens/imgDefault.png`;
  return value?.img?.replace(/"/g, "");
}
