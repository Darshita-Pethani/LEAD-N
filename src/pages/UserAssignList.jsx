import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import Pagination from "../components/Pagination";

export default function AssignedLeadsList() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [sort, setSort] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // dropdown data
    const [statuses, setStatuses] = useState([]);
    const [agents, setAgents] = useState([]);
    const [users, setUsers] = useState([]);

    // search states
    const [searchAgent, setSearchAgent] = useState("");
    const [searchUser, setSearchUser] = useState("");

    const [dropdownVisibility, setDropdownVisibility] = useState({
        agent: false,
        user: false,
    });

    // filters
    const [filters, setFilters] = useState({
        lead_Assigned_To: "",
        lead_Created_By: "",
        lead_Status: "",
    });

    const token = localStorage.getItem("token");

    const fetchLeads = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.post(`${config.API_BASE_URL}/sales/admin/assigned-list`, { inputData: { page, limit, filter: filters, sort } }, {
                headers: { Authorization: token }
            });

            if (res.data.status === "success") {
                setLeads(res.data.data || []);
                const totalCount = res.data.totalCount || res.data.data?.length || 0;
                setTotalPages(res.data.totalPages || 1);
            } else {
                setLeads([]);
                setError(res.data.msg || "Failed to fetch leads");
            }
        } catch (err) {
            setLeads([]);
            setError("Something went wrong while fetching leads.");
        }
        setLoading(false);
    };

    // Fetch statuses
    const fetchStatuses = async () => {
        try {
            const res = await axios.post(
                `${config.API_BASE_URL}/sales/lead-status-list`,
                { inputData: {} },
                { headers: { Authorization: token } }
            );
            if (res.data.status === "success" && Array.isArray(res.data.data)) {
                setStatuses(res.data.data);
            }
        } catch (err) {
            console.log("Failed to fetch statuses", err);
        }
    };

    // fetch Agents (Assigned To)
    const fetchAgentsAndAdmin = async () => {
        setLoadingUsers(true);
        try {
            const res = await axios.post(`${config.API_BASE_URL}/user/agent-list`, { inputData: { role: "Both" } },
                { headers: { Authorization: token } });
            if (res.data.status === "success" && Array.isArray(res.data.data)) {
                let allUsers = res.data.data;
                const agentsOnly = allUsers.filter(u => u.user_Role === "Agent");
                const adminsOnly = allUsers.filter(u => u.user_Role === "Admin");
                setAgents(agentsOnly);
                setUsers(adminsOnly);
            } else {
                setAgents([]);
                setUsers([]);
            }
        } catch {
            setAgents([]);
            setUsers([]);
        }
        setLoadingUsers(false);

    };

    const handleSelectAgent = (agent) => {
        setFilters((prev) => ({ ...prev, lead_Assigned_To: agent.user_Id }));
        setSearchAgent(agent.user_Name);
    };

    const handleSelectUser = (user) => {
        setFilters((prev) => ({ ...prev, lead_Created_By: user.user_Id }));
        setSearchUser(user.user_Name);
    };


    useEffect(() => {
        fetchStatuses();
        fetchAgentsAndAdmin();
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [page, limit, sort]);

    // Filtered lists
    const filteredAgents = agents.filter((a) =>
        a.user_Name.toLowerCase().includes(searchAgent.toLowerCase())
    );
    const filteredUsers = users.filter((u) =>
        u.user_Name.toLowerCase().includes(searchUser.toLowerCase())
    );

    const handleSort = (field) => {
        setPage(1);
        setSort(prevSort => {
            const existing = prevSort.find(s => s.field === field);
            if (!existing) {
                return [{ field, order: 'asc' }];
            }
            if (existing.order === 'desc') {
                return [{ field, order: 'asc' }];
            }
            return [{ field, order: 'desc' }];
        });
    };


    const getSortIcon = (field) => {
        const s = sort.find(s => s.field === field);
        if (!s) return '↓';
        if (s.order === 'asc') return '↑';
        if (s.order === 'desc') return '↓';
    };
    const clearFilter = () => {
        setFilters({ lead_Assigned_To: "", lead_Created_By: "", lead_Status: "" });
        setSearchAgent("");
        setSearchUser("");
        fetchLeads();
    }
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Assigned Leads</h2>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-4">
                {/* Status Filter */}
                <div className="w-full sm:w-48">
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                    <select
                        value={filters.lead_Status}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, lead_Status: e.target.value }))
                        }
                        className="border px-3 py-2 rounded w-full outline-none"
                    >
                        <option value="">All</option>
                        {statuses.map((s) => (
                            <option key={s.lead_status_Id} value={s.lead_status_Name}>
                                {s.lead_status_Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Assigned To Filter */}
                <div className="relative w-full sm:w-64">
                    <label className="text-sm font-semibold text-gray-700">Assigned To</label>
                    <input
                        type="text"
                        placeholder="Search agent..."
                        value={searchAgent}
                        onChange={(e) => {
                            setSearchAgent(e.target.value);
                            setDropdownVisibility((prev) => ({ ...prev, agent: true }));
                        }}
                        onFocus={() =>
                            setDropdownVisibility((prev) => ({ ...prev, agent: true }))
                        }
                        className="border px-3 py-2 rounded w-full outline-none"
                        disabled={loadingUsers}
                    />
                    {dropdownVisibility.agent && (
                        <ul className="absolute w-full z-10 max-h-48 overflow-y-auto bg-white border rounded shadow">
                            {filteredAgents.length > 0 ? (
                                filteredAgents.map((agent) => (
                                    <li
                                        key={agent.user_Id}
                                        onClick={() => {
                                            handleSelectAgent(agent);
                                            setDropdownVisibility((prev) => ({ ...prev, agent: false }));
                                        }}
                                        className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                                    >
                                        {agent.user_Name}
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-2 text-gray-500">No agents found</li>
                            )}
                        </ul>
                    )}
                </div>

                {/* Assigned By Filter */}
                <div className="relative w-full sm:w-64">
                    <label className="text-sm font-semibold text-gray-700">Assigned By</label>
                    <input
                        type="text"
                        placeholder="Search user..."
                        value={searchUser}
                        onChange={(e) => {
                            setSearchUser(e.target.value);
                            setDropdownVisibility((prev) => ({ ...prev, user: true }));
                        }}
                        onFocus={() =>
                            setDropdownVisibility((prev) => ({ ...prev, user: true }))
                        }
                        className="border px-3 py-2 rounded w-full outline-none"
                        disabled={loadingUsers}
                    />
                    {dropdownVisibility.user && (
                        <ul className="absolute w-full z-10 max-h-48 overflow-y-auto bg-white border rounded shadow">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <li
                                        key={user.user_Id}
                                        onClick={() => {
                                            handleSelectUser(user);
                                            setDropdownVisibility((prev) => ({ ...prev, user: false }));
                                        }}
                                        className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                                    >
                                        {user.user_Name}
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-2 text-gray-500">No users found</li>
                            )}
                        </ul>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex items-end gap-2 w-full sm:w-auto">
                    <button
                        onClick={fetchLeads}
                        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 w-full sm:w-auto"
                    >
                        Apply Filter
                    </button>

                    <button
                        onClick={clearFilter}
                        className="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600 w-full sm:w-auto"
                    >
                        Clear Filter
                    </button>
                </div>
            </div>


            {/* Table */}
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : leads.length === 0 ? (
                <div>No leads found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <thead className="bg-white border-b border-gray-200">
                            <tr>
                                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">ID</th>
                                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Title</th>
                                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Contact</th>
                                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Phone</th>
                                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Status</th>
                                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Assigned To</th>
                                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Created By</th>
                                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Updated By</th>
                                <th
                                    className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide cursor-pointer select-none"
                                    onClick={() => handleSort('created_at')}
                                >
                                    Created At {getSortIcon('created_at')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead, idx) => (
                                <tr
                                    key={lead.lead_Id}
                                    className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                                >
                                    <td className="px-5 py-4 text-gray-800">{lead.index}</td>
                                    <td className="px-5 py-4 text-gray-700 whitespace-normal max-w-xs truncate">{lead.lead_Title}</td>
                                    <td className="px-5 py-4 text-gray-700 whitespace-normal max-w-xs truncate">{lead.lead_Contact_Name}</td>
                                    <td className="px-5 py-4 text-gray-700 whitespace-normal break-words">{lead.lead_Contact_Phone}</td>
                                    <td className="px-5 py-4 text-blue-500 font-bold whitespace-normal break-words">{lead.lead_Status}</td>
                                    <td className="px-5 py-4 text-gray-700 whitespace-normal break-words">{lead.lead_Assigned_To_Name}</td>
                                    <td className="px-5 py-4 text-gray-700 whitespace-normal break-words">{lead.lead_Created_By_Name}</td>
                                    <td className="px-5 py-4 text-gray-700 whitespace-normal break-words">{lead.lead_Updated_By_Name}</td>
                                    <td className="px-5 py-4 text-gray-700 whitespace-normal break-words">{lead.created_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {(dropdownVisibility.agent || dropdownVisibility.user) && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setDropdownVisibility({ agent: false, user: false })}
                ></div>
            )}

            {/* Pagination */}
            <Pagination
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                limit={limit}
                setLimit={setLimit}
            />
        </div>
    );
}
