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
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.REACT_APP_TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(
    title
  )}&year=${year}&page=1&include_adult=false`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro na busca TMDb");

  const data = await res.json();
  return data.results?.[0]?.id || null;
}

export async function fetchCastAndCrew(tmdbId) {
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${process.env.REACT_APP_TMDB_API_KEY}&language=pt-BR`;
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

  const sheetId = process.env.REACT_APP_SHEET_ID;
  const apiKey = process.env.REACT_APP_API_KEY;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

  const response = await fetch(url);
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

export function isOwned(value) {
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

export function getValueOrDafault(value, outher) {
  return !isNullOrEmpty(value) ? value : outher;
}

export function isNotNullOrEmpty(value) {
  return !isNullOrEmpty(value);
}

export function isNullOrEmpty(value) {
  return value == null || String(value).trim() === '';
}

export function getSanitizedImage(value) {
  return value?.img?.replace(/"/g, "") || "/imagens/imgDefault.png";
}
