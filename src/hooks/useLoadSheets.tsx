import { useContext, useEffect, useState } from "react";
import { DataContext } from "../context/DataContext";
import { fetchSheetData } from "../utils/sheets";

const DELAY_BETWEEN_CALLS = 500;

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export function useLoadSheets(sheetNames) {
  const { setSheetData } = useContext(DataContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  console.log("🔄 useLoadSheets chamado:", sheetNames);
}, [sheetNames]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);

      for (const sheet of sheetNames) {
        try {
          console.log('sheet ', sheet)
          const data = await fetchSheetData({ sheetName: sheet });
          if (!isCancelled) {
            setSheetData(sheet, data);
          }
        } catch (err) {
          if (!isCancelled) {
            setError(`Erro ao carregar ${sheet}: ${err.message}`);
          }
          break; // Interrompe após o primeiro erro
        }

        await delay(DELAY_BETWEEN_CALLS); // Aguarda entre cada chamada
      }

      if (!isCancelled) {
        setLoading(false);
      }
    }

    fetchAll();
    return () => {
      isCancelled = true;
    };
  }, [setSheetData]);

  return { loading, error };
}
