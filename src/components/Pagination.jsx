import React from "react";

export default function Pagination({ page, setPage, totalPages, limit, setLimit }) {
    totalPages = Number(totalPages);
    page = Number(page);
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 flex-wrap">
            {/* Rows per page */}
            <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                <select
                    value={limit}
                    onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        if (page === totalPages) {
                            setLimit(newLimit);
                            setPage(1);
                        } else {
                            setLimit(newLimit);
                        }
                    }}
                    className="border px-2 py-2 rounded focus:ring-2 focus:ring-blue-400 transition outline-none w-full sm:w-auto max-w-[150px]"
                    title="Rows per page"
                    name="items per page"
                >
                    {[5, 10, 20, 50, 100].map((opt) => (
                        <option key={opt} value={opt}>
                            {opt} / page
                        </option>
                    ))}
                </select>
            </div>

            {/* Pagination */}
            <div className="w-full sm:w-auto flex flex-wrap items-center gap-2 justify-center sm:justify-end">
                {/* First Page */}
                <button
                    disabled={page === 1}
                    onClick={() => setPage(1)}
                    className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 font-semibold shadow transition"
                >
                    ⏮
                </button>

                {/* Prev */}
                <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 font-semibold shadow transition"
                >
                    ◀
                </button>

                {/* Current page info */}
                <span className="px-2 py-2 font-semibold text-blue-700">
                    Page {page} of {totalPages}
                </span>

                {/* Next */}
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 font-semibold shadow transition"
                >
                    ▶
                </button>

                {/* Last Page */}
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(totalPages)}
                    className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 font-semibold shadow transition"
                >
                    ⏭
                </button>
            </div>
        </div>
    );
}
