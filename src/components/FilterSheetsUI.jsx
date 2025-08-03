import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FilterSheetsUI({
    id,
    searchTerm, setSearchTerm,
    selectedGenre, setSelectedGenre, genreOptions,
    selectedCountry, setSelectedCountry, countriesOptions,
    selectedYear, yearsOptions, setSelectedYear,
    selectedLanguage, languagesOptions, setSelectedLanguage,
    selectedCategory, categoriesOptions, setSelectedCategory,

    selectedStatus, statusOptions, setSelectedStatus,
    selectedOwned, ownedOptions, setSelectedOwned,
    showWatched, setShowWatched,
    showRead, setShowRead,
    showOwned, setShowOwned,
    showAdult, setShowAdult,
    showAll, setShowAll,
    sortBy, setSortBy,
    activeFilters,
    isVisibleShowRead,
    estatisticas
}) {
    const renderSelectBox = (label, value, onChange, options) => (
        options.length > 0 ? <SelectBox label={label} value={value} onChange={onChange} options={options} /> : <></>
    );

    return (
        <div id={id}>
            <motion.div
                id={id}
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 space-y-6"
            >
                {/* Linha de Filtros Principais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-7">
                    <Input label="Buscar título" value={searchTerm} onChange={setSearchTerm} />
                    {renderSelectBox("Categoria", selectedCategory, setSelectedCategory, categoriesOptions)}
                    {renderSelectBox("Gênero", selectedGenre, setSelectedGenre, genreOptions)}
                    <div className="md:col-span-1 sm:col-span-1 col-span-1">
                        {renderSelectBox("País", selectedCountry, setSelectedCountry, countriesOptions)}
                    </div>
                    <div className="md:col-span-1 sm:col-span-1 col-span-1">
                        {renderSelectBox("Ano", selectedYear, setSelectedYear, yearsOptions)}
                    </div>
                    <div className="md:col-span-1 sm:col-span-1 col-span-1">
                        {renderSelectBox("Language", selectedLanguage, setSelectedLanguage, languagesOptions)}
                    </div>
                    <div className="md:col-span-1 sm:col-span-1 col-span-1">
                        {renderSelectBox("Status", selectedStatus, setSelectedStatus, statusOptions)}
                    </div>
                    <div className="md:col-span-1 sm:col-span-1 col-span-1">
                        {renderSelectBox("Na Coleção", selectedOwned, setSelectedOwned, ownedOptions)}
                    </div>
                </div>

                {/* Toggles e Ordenação */}
                <div className="flex flex-wrap items-center gap-4 mt-2">
                    {!isVisibleShowRead && <Toggle checked={showWatched} onChange={setShowWatched} label="Assistidos" />}
                    {isVisibleShowRead && <Toggle checked={showRead} onChange={setShowRead} label="Lidos" />}
                    <Toggle checked={showOwned} onChange={setShowOwned} label="Na coleção" />
                    <Toggle checked={showAdult} onChange={setShowAdult} label="Mostrar +18" />
                    <Toggle checked={showAll} onChange={setShowAll} label="Mostrar Tudo" />

                    <div className="ml-auto flex items-center">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Ordenar:</label>
                        <select
                            id={`${id}_sortby`}
                            className="border px-2 py-1 rounded bg-white dark:bg-gray-900 dark:text-white transition"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="title-asc">Título (A-Z)</option>
                            <option value="title-desc">Título (Z-A)</option>
                            <option value="year-desc">Ano (Mais recente)</option>
                            <option value="year-asc">Ano (Mais antigo)</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Estatísticas */}
            <div className="flex flex-wrap items-center justify-between mt-4 mb-2">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    {estatisticas}
                </div>
            </div>

            {/* Filtros Ativos */}
            <AnimatePresence mode="popLayout">
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {activeFilters.map((f, i) => (
                            <motion.div
                                key={f.label}
                                layout
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                            >
                                <span>{f.label}</span>
                                <button
                                    onClick={f.onClear}
                                    className="text-blue-600 hover:text-red-600 text-xs font-bold"
                                    title="Remover filtro"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SelectBox({ label, options, value, onChange }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-900 dark:text-white"
            >
                <option value="">Todos</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
}

function Input({ label, value, onChange }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input
                type="text"
                placeholder="Digite o título..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-900 dark:text-white"
            />
        </div>
    );
}

function Toggle({ checked, onChange, label }) {
    return (
        <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="text-sm text-gray-800 dark:text-gray-200">{label}</span>
        </label>
    );
}