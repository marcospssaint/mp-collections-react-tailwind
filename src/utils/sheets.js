// utils/sheets.js
export async function fetchSheetData({ sheetName }) {
    const sheetId = process.env.REACT_APP_SHEET_ID;
    const apiKey = process.env.REACT_APP_API_KEY;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao buscar dados da planilha");

    const data = await res.json();
    if (!data.values) throw new Error("Dados inválidos da planilha");

    // Aqui você pode usar sua função parseSheetData para converter valores
    // Se não tiver, retorne data.values diretamente
    return parseSheetData(data.values); // defina parseSheetData em algum lugar
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