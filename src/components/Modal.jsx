import React from "react";

export default function Modal({ isOpen, onClose, item, onPrev, onNext, hasPrev, hasNext }) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-xl w-full relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
        >
          ×
        </button>

        <div className="flex gap-4">
          <img src={item.img} alt={item.title} className="w-24 h-32 object-cover rounded-md" />
          <div>
            <h2 className="text-xl font-bold">{item.title}</h2>
            {item.originalTitle && <p className="text-sm italic text-gray-500">{item.originalTitle}</p>}
            <p className="text-xs text-gray-400 mb-2">{item.type?.toUpperCase()} • {item.year}</p>
          </div>
        </div>

        <div className="mt-4 text-sm space-y-2">
          {item.synopsis && <p><strong>Sinopse:</strong> {item.synopsis}</p>}
          {item.genre && <p><strong>Gênero:</strong> {item.genre}</p>}
          {item.authors && <p><strong>Autores:</strong> {item.authors.join(', ')}</p>}
          {item.publisher && <p><strong>Editora:</strong> {item.publisher}</p>}
          {item.language && <p><strong>Idioma:</strong> {item.language}</p>}
          {item.countries && <p><strong>Países:</strong> {item.countries.join(', ')}</p>}
          {item.notes && <p><strong>Notas:</strong> {item.notes}</p>}
          {item.collection && <p><strong>Coleção:</strong> {item.collection}</p>}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={`px-4 py-1 rounded ${hasPrev ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            Anterior
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`px-4 py-1 rounded ${hasNext ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}
