import React from 'react';

export function Pagination({ currentPage, totalPages, onPageChange }) {
    const pageNumbers = getPageNumbers(currentPage, totalPages);

    return (
      <div className="mt-6 flex justify-center gap-2 flex-wrap select-none">
        <button
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(1)}
          aria-label="Primeira página"
        >
          {"<<"}
        </button>

        <button
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Página anterior"
        >
          {"<"}
        </button>

        {pageNumbers.map((page, idx) =>
          typeof page === "number" ? (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 border rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-white text-gray-800"
                }`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          ) : (
            <span
              key={page + idx}
              className="px-3 py-1 text-gray-500 select-none"
              aria-hidden="true"
            >
              &hellip;
            </span>
          )
        )}

        <button
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Próxima página"
        >
          {">"}
        </button>

        <button
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(totalPages)}
          aria-label="Última página"
        >
          {">>"}
        </button>
      </div>
    );
  }

  function getPageNumbers(currentPage, totalPages, maxVisible = 7) {
    // maxVisible é a quantidade máxima de botões de página visíveis (incluindo elipses)
    const pages = [];

    if (totalPages <= maxVisible) {
      // Mostra todas as páginas se total menor que maxVisible
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Sempre mostra primeira e última página
      pages.push(1);

      let left = Math.max(2, currentPage - 2);
      let right = Math.min(totalPages - 1, currentPage + 2);

      if (left > 2) {
        pages.push("left-ellipsis");
      } else {
        left = 2;
      }

      if (right < totalPages - 1) {
        // ajusta left se não houver espaço suficiente
        if (currentPage <= 4) right = 5;
        if (currentPage >= totalPages - 3) left = totalPages - 4;

        for (let i = left; i <= right; i++) pages.push(i);

        pages.push("right-ellipsis");
      } else {
        // Sem elipse na direita, mostrar até penúltima página
        for (let i = left; i <= totalPages - 1; i++) pages.push(i);
      }

      pages.push(totalPages);
    }

    return pages;
  }