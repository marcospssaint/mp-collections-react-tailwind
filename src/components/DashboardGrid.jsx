import React, { useState } from 'react';

export default function DashboardGrid({ panels }) {
  const [category, setCategory] = useState('Todos');

  const categories = ['Todos', ...new Set(panels.map(p => p.category))];

  const filteredPanels = category === 'Todos'
    ? panels
    : panels.filter(p => p.category === category);

  return (
    <div className="w-full p-4">
      {/* Filtro */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <label className="font-medium">Filtrar por categoria:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded p-2 w-full sm:w-auto"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Grid de painéis */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">
        {filteredPanels.map(({ key, title, slug, data }) => (
          <div key={key} className="min-h-[300px] flex flex-col">
            <p className="text-gray-500 text-sm">{title}</p>
            {slug && data && (
              <p className="text-xs text-gray-400">({data.length} itens)</p>
            )}
            <div className="mt-2 flex-grow">
              {key}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
