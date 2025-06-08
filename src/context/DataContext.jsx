import React, { createContext, useState } from "react";

export const DataContext = createContext();

export function DataProvider({ children }) {
  // Usamos um objeto para guardar os dados por nome da sheet
  const [dataSheets, setDataSheets] = useState({});

  // Função para atualizar dados de uma sheet
  const setSheetData = (sheetName, data) => {
    setDataSheets((prev) => ({
      ...prev,
      [sheetName]: data,
    }));
  };

  return (
    <DataContext.Provider value={{ dataSheets, setSheetData }}>
      {children}
    </DataContext.Provider>
  );
}
