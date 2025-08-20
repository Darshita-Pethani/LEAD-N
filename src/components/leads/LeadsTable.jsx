import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import LeadAddForm from './LeadAddForm';
import moment from 'moment';
import Modal from "../otherComponents/Model";
import Swal from 'sweetalert2';
import { Edit2, Layers, Trash2 } from 'lucide-react';
import { toast } from "react-toastify";
import LeadsDetails from './LeadsDetails';
import LeadTracker from "./LeadTracker";
export default function LeadsTable() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadDetail, setLeadDetail] = useState(null);
  const [leadDetailLoading, setLeadDetailLoading] = useState(false);
  const [editLeadData, setEditLeadData] = useState([]);
  const token = localStorage.getItem("token");
  const [statuses, setStatuses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const [trackerData, setTrackerData] = useState([]);
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${config.API_BASE_URL}/sales/lead-list`,
        {
          inputData: {
            filterData: {
              search,
              sort,
              page,
              limit,
              lead_Status: statusFilter
            }
          }
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      if (res.data.status === 'success') {
        setLeads(res.data.data && res.data.data.length > 0 && res.data.data);
        if (res.data.totalPages) {
          setTotalPages(res.data.totalPages);
        } else {
          setTotalPages((res.data.data && res.data.data.length < limit) ? page : page + 1);
        }
      }
    } catch (e) {
      setLeads([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [search, sort, page, limit, statusFilter]);

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


  // Handler for successful add
  const handleAddSuccess = (val) => {
    toast.success(`Lead ${val} successfully`);
    setShowAddForm(false);
    fetchLeads();
  };

  // Handler for add error
  const handleAddError = (msg) => {
    toast.error(msg || '');
  };

  // Fetch lead detail by id (use new filter format)
  const fetchLeadDetail = async (leadId) => {
    setLeadDetailLoading(true);
    setLeadDetail(null);
    try {
      const res = await axios.post(
        `${config.API_BASE_URL}/sales/sales-lead/id`,
        {
          inputData: { lead_Id: leadId }
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      if (res.data.status === 'success') {
        setLeadDetail(res.data.data);
      } else {
        setLeadDetail({ error: 'Lead not found' });
      }
    } catch (e) {
      setLeadDetail({ error: 'Failed to fetch lead details' });
    }
    setLeadDetailLoading(false);
  };

  // Update lead status
  const handleStatusUpdate = async (leadId, newStatus, oldStatusId, comment) => {
    setLeadDetailLoading(true);
    try {
      let response = await axios.post(
        `${config.API_BASE_URL}/sales/update`,
        {
          inputData: {
            lead_Id: leadId,
            lead_Status: newStatus,
            lead_status_Id: oldStatusId,
            comment: comment
          }
        },
        {
          headers: {
            Authorization: token,
          }
        }
      );
      if (response.data.status == 'success') {
        toast.success('Status updated successfully');
        await fetchLeadDetail(leadId);
        setShowLeadModal(false)
        fetchLeads();
      }
    } catch (e) {
      setLeadDetail(prev => ({
        ...prev,
        error: 'Failed to update status'
      }));
    }
    setLeadDetailLoading(false);
  };

  const handleEdit = async (lead) => {
    const res = await axios.post(`${config.API_BASE_URL}/sales/sales-lead/id`, {
      inputData: { lead_Id: lead.lead_Id }
    });
    if (res.data.status === 'success' && Array.isArray(res.data.data) && res.data.data.length > 0) {
      setEditLeadData(res.data.data[0]);
      setShowAddForm(true);
    }

  };

  const handleDelete = async (item) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          let res = await axios.post(`${config.API_BASE_URL}/sales/delete`, { inputData: { lead_Id: item } });
          // Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
          toast.success(res.data.msg || 'Lead deleted successfully');
          if (res.data.status === 'success') {
            fetchLeads();
          }
        } catch (error) {
          Swal.fire('Error!', 'Failed to delete the item.', 'error');
        }
      }
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditLeadData([]);
  };

  // Fetch statuses
  const fetchStatuses = async () => {
    try {
      const res = await axios.post(
        `${config.API_BASE_URL}/sales/lead-status-list`,
        { inputData: {} },
        {
          headers: { Authorization: token },
        }
      );
      if (res.data.status === "success" && Array.isArray(res.data.data)) {
        setStatuses(res.data.data);
      }
    } catch (err) {
      console.log("Failed to fetch statuses", err);
    }
  }

  const handleOpenTracker = (lead) => {
    if (lead.tracker && lead.tracker.length > 0) {
      setTrackerData(lead.tracker);
      setShowTrackerModal(true);
    } else {
      setTrackerData([]);
      setShowTrackerModal(true);
    }
  };


  const clearFilter = () => {
    setPage(1);
    setStatusFilter("");
  }

  useEffect(() => {
    fetchStatuses();
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2 w-full">
        <h2 className="text-xl font-bold mb-4 text-blue-700">List</h2>

        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => setShowAddForm(v => !v)}
            className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded hover:from-blue-600 hover:to-blue-500 font-semibold shadow transition"
          >
            {showAddForm ? 'Close' : 'Add Lead'}
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3">
        <label className="text-sm font-semibold text-gray-700">
          Filter by Status
        </label>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none border border-gray-300 px-4 py-2 pr-8 rounded-lg shadow-sm text-sm font-medium text-gray-700 
                outline-none bg-white"
          >
            <option value="">All status</option>
            {statuses.length > 0 && statuses.map(s => (
              <option key={s.lead_status_Id} value={s.lead_status_Name}>
                {s.lead_status_Name}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"> ▼ </span>
        </div>

        {/* Clear Filter Button */}
        {statusFilter && (
          <button
            type="button"
            onClick={() => clearFilter()}
            className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg shadow-sm transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Add Lead Form Modal */}
      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title={editLeadData != '' ? "Update Lead" : "Add Lead"}
      >
        <LeadAddForm
          onSuccess={(val) => handleAddSuccess(val)}
          onError={handleAddError}
          onCancel={handleCancel}
          // onCancel={() => setShowAddForm(false)}
          editLeadData={editLeadData}
        />
      </Modal>

      {/* show table */}
      <div className="flex-1 flex flex-col w-full mt-5">
        <div className="overflow-x-auto flex-1" style={{ maxHeight: '100%' }}>
          <table className="w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">ID</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Title</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Description</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Source</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Contact Name</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Contact Email</th>
                <th
                  className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide cursor-pointer select-none"
                // onClick={() => handleSort('lead_Status')}
                >
                  Status
                </th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide cursor-pointer select-none"              >
                  Tracker
                </th>
                <th
                  className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide cursor-pointer select-none"
                  onClick={() => handleSort('created_at')}
                >
                  Created At {getSortIcon('created_at')}
                </th>
                <th className="text-center px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">Loading...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">No Data</td>
                </tr>
              ) : (
                leads.length > 0 ? leads.map((lead, idx) => (
                  <tr
                    key={lead.lead_Id ?? idx}
                    className={`transition-colors duration-200 cursor-pointer hover:bg-blue-50 ${lead.lead_Status?.toLowerCase() === 'completed'
                      ? 'bg-green-50' : lead.lead_Status?.toLowerCase() === 'pending' ? 'bg-yellow-50' : idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                    onClick={() => {
                      setShowLeadModal(true);
                      fetchLeadDetail(lead.lead_Id);
                    }}
                  >

                    <td className="px-5 py-4 text-gray-800">{lead.index}</td>
                    <td className="px-5 py-4 text-gray-700 whitespace-normal max-w-xs truncate" title={lead.lead_Title}>
                      {lead.lead_Title}
                    </td>

                    <td className="px-5 py-4 text-gray-700 whitespace-normal max-w-xs truncate" title={lead.lead_Description}>
                      {lead.lead_Description}</td>
                    <td className="px-5 py-4 text-gray-700 whitespace-normal truncate max-w-xs" title={lead.lead_Source}>
                      {lead.lead_Source}</td>
                    <td className="px-5 py-4 text-gray-700 whitespace-normal truncate max-w-xs" title={lead.lead_Contact_Name}>
                      {lead.lead_Contact_Name}</td>
                    <td className="px-5 py-4 text-gray-700 whitespace-normal truncate max-w-xs" title={lead.lead_Contact_Email}>
                      {lead.lead_Contact_Email}</td>
                    <td className="px-5 py-4 text-gray-700">{lead.lead_Status}</td>
                    <td className="px-4 py-3">
                      <div className="relative group">
                        <button
                          className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTracker(lead);
                          }}
                        >
                        <Layers size={17}/>
                        </button>
                        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 
                          text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 
                          transition-opacity whitespace-nowrap z-10">
                          Tracker
                        </span>
                      </div>

                    </td>
                    <td className="px-5 py-4 text-gray-700">{moment(lead.created_at).format('DD-MM-YYYY')}</td>

                    <td className="px-5 py-4 text-gray-800 flex items-center gap-2">
                      <div className="relative group">
                        <button
                          className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition"
                          // onClick={e => { e.stopPropagation(); handleEdit(lead); }}
                          onClick={() => {
                            setShowLeadModal(true);
                            fetchLeadDetail(lead.lead_Id);
                          }}                        >
                          <Edit2 size={17} />
                        </button>
                        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 
                          text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 
                          transition-opacity whitespace-nowrap z-10">
                          Edit
                        </span>
                      </div>

                      <div className="relative group">
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(lead.lead_Id); }}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                        >
                          <Trash2 size={17} />
                        </button>
                        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 
                          text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 
                          transition-opacity whitespace-nowrap z-10">
                          Delete
                        </span>
                      </div>
                    </td>
                  </tr>
                )) :
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">No records found</td>
                  </tr>
              )}
            </tbody>
          </table>

        </div>
      </div>

      {leads.length > 0 &&
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
              disabled={page == totalPages}
              onClick={() => setPage(prev => prev + 1)}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 font-semibold shadow transition"
            >
              ▶
            </button>

            {/* Last Page */}
            <button
              disabled={page == totalPages}
              onClick={() => setPage(totalPages)}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 font-semibold shadow transition"
            >
              ⏭
            </button>
          </div>
        </div>
      }

      <Modal
        isOpen={showTrackerModal}
        onClose={() => setShowTrackerModal(false)}
        title="Lead Status Tracker"
      >
        {trackerData.length > 0 ? (
          <LeadTracker trackerData={trackerData} />
        ) : (
          <p className="text-center text-gray-500">No data available.</p>
        )}
      </Modal>

      <LeadsDetails
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        leadDetail={leadDetail}
        leadDetailLoading={leadDetailLoading}
        handleStatusUpdate={handleStatusUpdate}
        status={statuses}
      />
    </div>
  );
}
