import React, { useEffect, useState } from "react";
import axios from 'axios';
import config from '../config';

export default function SalesLeadReport() {
    const [reportData, setReportData] = useState([]);
    const [overallData, setOverallData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${config.API_BASE_URL}/sales/report`, { inputData: { page, limit } }
            );
            if (res.data.status === 'success') {
                setReportData(res.data.data.agents);
                setOverallData(res.data.data.overall);
                setTotalPages(res.data.pagination.totalPages);

            }
        } catch (e) {
            console.log('e: ', e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReport();
    }, []);

    return (
        <div className="p-6">
            {
                loading ? 'Lodding....' : <>
                    {/* Overall Leads Card */}
                    {overallData && (
                        <div className="p-4 mb-8 border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-semibold text-blue-900 mb-6">Overall Leads</h2>
                            <div className="grid grid-cols-12 gap-4 text-center">
                                <div className="col-span-6 sm:col-span-3 md:col-span-2 bg-blue-100 p-4 rounded-lg">
                                    <p className="text-sm text-blue-700 font-medium">Total</p>
                                    <p className="text-xl font-bold text-blue-900">{overallData.total}</p>
                                </div>
                                <div className="col-span-6 sm:col-span-3 md:col-span-2 bg-yellow-100 p-4 rounded-lg">
                                    <p className="text-sm text-yellow-700 font-medium">Pending</p>
                                    <p className="text-xl font-bold text-yellow-900">{overallData.pending}</p>
                                </div>
                                <div className="col-span-6 sm:col-span-3 md:col-span-2 bg-orange-100 p-4 rounded-lg">
                                    <p className="text-sm text-orange-700 font-medium">Working</p>
                                    <p className="text-xl font-bold text-orange-900">{overallData.working}</p>
                                </div>
                                <div className="col-span-6 sm:col-span-3 md:col-span-2 bg-green-100 p-4 rounded-lg">
                                    <p className="text-sm text-green-700 font-medium">Completed</p>
                                    <p className="text-xl font-bold text-green-900">{overallData.completed}</p>
                                </div>

                            </div>
                        </div>
                    )}


                    {/* Agents Table */}
                    <div>
                        <h2 className="text-lg font-semibold text-blue-900 mb-4">Agent-wise Leads</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                <thead className="bg-white border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">ID</th>
                                        <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Agent Name</th>
                                        <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Email</th>
                                        <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Total</th>
                                        <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Pending</th>
                                        <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Working</th>
                                        <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Completed</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {reportData.map((agent, idx) => (
                                        <tr key={agent.user_Id}
                                            className={`transition-colors duration-200 cursor-pointer
                                            ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                                            hover:bg-blue-50`}
                                        >
                                            <td className="px-5 py-4 text-gray-800">{agent.index}</td>
                                            <td className="px-5 py-4 text-gray-700">{agent.user_Name}</td>
                                            <td className="px-5 py-4 text-gray-700">{agent.user_Email}</td>
                                            <td className="px-5 py-4 text-gray-700">{agent.total}</td>
                                            <td className="px-5 py-4 text-gray-700">{agent.pending}</td>
                                            <td className="px-5 py-4 text-gray-700">{agent.working}</td>
                                            <td className="px-5 py-4 text-gray-700">{agent.completed}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* pagination sec */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 flex-wrap">
                            {/* Rows per page */}
                            <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                                <select
                                    value={limit}
                                    onChange={e => setLimit(Number(e.target.value))}
                                    className="border px-2 py-2 rounded focus:ring-2 focus:ring-blue-400 transition outline-none w-full sm:w-auto max-w-[150px]"
                                    title="Rows per page"
                                    name="items per page"
                                >
                                    {[5, 10, 20, 50, 100].map(opt => (
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
                                    onClick={() => setPage(prev => prev - 1)}
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
                                    onClick={() => setPage(prev => prev + 1)}
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
                    </div>

                </>
            }
        </div>
    );
}
