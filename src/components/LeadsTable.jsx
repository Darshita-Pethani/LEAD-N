import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import LeadAddForm from './LeadAddForm';
import moment from 'moment';
import Modal from "./Model";
import Swal from 'sweetalert2';
import { Edit2, Trash2 } from 'lucide-react';
import { toast } from "react-toastify";

const DUMMY_LEADS = [
  {
    lead_Id: "1",
    lead_Title: "Lead 1",
    lead_Description: "Lead description 1",
    lead_Source: "Cold Call",
    lead_Contact_Name: "Contact 1",
    lead_Contact_Email: "contact1@example.com",
    lead_Status: "In Progress",
    lead_Created_By: "1",
    lead_Updated_By: "2",
    lead_Assigned_To: "1",
    created_at: "2025-07-28 20:14:55",
    created_by: "Demo1",
    updatedBy: "staycation",
    updated_user_email: "erp@staycation1.com",
    lead_Address_Street: null,
    lead_Address_City: null,
    lead_Address_Postcode: null,
    lead_Address_Country: null,
    lead_Address_Latitude: null,
    lead_Address_Longitude: null,
    lead_Note: null,
    lead_Address_House: null
  }
  // ...add more dummy leads as needed...
];

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
              limit
            }
          }
        }
      );
      if (res.data.status === 'success') {
        setLeads(res.data.data && res.data.data.length > 0 ? res.data.data : DUMMY_LEADS);
        if (res.data.totalPages) {
          setTotalPages(res.data.totalPages);
        } else {
          setTotalPages((res.data.data && res.data.data.length < limit) ? page : page + 1);
        }
      }
    } catch (e) {
      setLeads(DUMMY_LEADS);
      setTotalPages(1);
    }
    setLoading(false);
  };


  useEffect(() => {

    fetchLeads();
    // eslint-disable-next-line
  }, [search, sort, page, limit]);

  const handleSort = (field) => {
    setPage(1);
    setSort(prevSort => {
      const existing = prevSort.find(s => s.field === field);
      if (!existing) {
        return [{ field, order: 'asc' }];
      }
      if (existing.order === 'asc') {
        return [{ field, order: 'desc' }];
      }
      if (existing.order === 'desc') {
        return [];
      }
      return [];
    });
  };



  const getSortIcon = (field) => {
    const s = sort.find(s => s.field === field);
    if (!s) return '↕';
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
    toast.error(msg || 'Failed to add lead');
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
        }
      );
      if (res.data.status === 'success' && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setLeadDetail(res.data.data[0]);
      } else {
        setLeadDetail({ error: 'Lead not found' });
      }
    } catch (e) {
      setLeadDetail({ error: 'Failed to fetch lead details' });
    }
    setLeadDetailLoading(false);
  };

  // Update lead status
  const handleStatusUpdate = async (leadId, newStatus) => {
    setLeadDetailLoading(true);
    try {
      let response = await axios.post(
        `${config.API_BASE_URL}/sales/update`,
        {
          inputData: {
            lead_Id: leadId,
            lead_Status: newStatus

          }
        }
      );
      if (response.status == 'success') {
        toast.success(res.data.msg || 'Staus updated successfully');
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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2 w-full">
        <h2 className="text-xl font-bold mb-4 text-blue-700">List</h2>

        <div className="flex gap-2 items-center">
          {/* <input
            type="text"
            placeholder="Search by Title"
            value={search}
            onChange={e => { setPage(1); setSearch(e.target.value); }}
            className="border px-3 py-2 rounded w-full md:w-64 focus:ring-2 focus:ring-blue-400 transition outline-none"
          /> */}
          <button
            type="button"
            onClick={() => setShowAddForm(v => !v)}
            className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded hover:from-blue-600 hover:to-blue-500 font-semibold shadow transition"
          >
            {showAddForm ? 'Close' : 'Add Lead'}
          </button>
        </div>
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
      <div className="flex-1 flex flex-col w-full">
        <div className="overflow-x-auto flex-1" style={{ maxHeight: '100%' }}>
          {/* <table className="min-w-full bg-white border border-gray-300 shadow-lg rounded-xl">
            <thead className="bg-blue-50">
              <tr>
                <th className="border px-4 py-2 font-semibold text-blue-700">ID</th>
                <th className="border px-4 py-2 font-semibold text-blue-700">Title</th>
                <th className="border px-4 py-2 font-semibold text-blue-700">Description</th>
                <th className="border px-4 py-2 font-semibold text-blue-700">Source</th>
                <th className="border px-4 py-2 font-semibold text-blue-700">Contact Name</th>
                <th className="border px-4 py-2 font-semibold text-blue-700">Contact Email</th>
                <th
                  className="border px-4 py-2 font-semibold text-blue-700 cursor-pointer select-none"
                  onClick={() => handleSort('lead_Status')}
                >
                  Status {getSortIcon('lead_Status')}
                </th>
                <th
                  className="border px-4 py-2 font-semibold text-blue-700 cursor-pointer select-none"
                  onClick={() => handleSort('created_at')}
                >
                  Created At {getSortIcon('created_at')}
                </th>
                <th className="border px-4 py-2 font-semibold text-blue-700">Actions</th>

              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={19} className="text-center py-8">Loading...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={19} className="text-center py-8">No Data</td>
                </tr>
              ) : (
                leads.map((lead, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-blue-100 cursor-pointer transition ${lead.lead_Status === 'completed' ? 'bg-green-50' : lead.lead_Status === 'Pending' ? 'bg-yellow-50' : ''}`}
                    onClick={() => {
                      setShowLeadModal(true);
                      fetchLeadDetail(lead.lead_Id);
                    }}
                  >
                    <td className="border px-4 py-2">{lead.lead_Id}</td>
                    <td className="border px-4 py-2">{lead.lead_Title}</td>
                    <td className="border px-4 py-2">{lead.lead_Description}</td>
                    <td className="border px-4 py-2">{lead.lead_Source}</td>
                    <td className="border px-4 py-2">{lead.lead_Contact_Name}</td>
                    <td className="border px-4 py-2">{lead.lead_Contact_Email}</td>
                    <td className="border px-4 py-2">{lead.lead_Status}</td>
                    <td className="border px-4 py-2">{moment(lead.created_at).format('DD-MM-YYYY')}</td>
                    <td className="border px-4 py-2 flex gap-2 justify-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(lead); }}
                        className="text-blue-500 font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(lead.lead_Id); }}
                        className="text-red-500 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table> */}
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
                  onClick={() => handleSort('lead_Status')}
                >
                  Status {getSortIcon('lead_Status')}
                </th>
                <th
                  className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide cursor-pointer select-none"
                  onClick={() => handleSort('created_at')}
                >
                  Created At {getSortIcon('created_at')}
                </th>
                {/* <th className="text-center px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Actions</th> */}
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
                leads.map((lead, idx) => (
                  <tr
                    key={lead.lead_Id ?? idx}
                    className={`transition-colors duration-200 cursor-pointer
                    ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    hover:bg-blue-50
                    ${lead.lead_Status?.toLowerCase() === 'completed' ? 'bg-green-50' : ''}
                    ${lead.lead_Status?.toLowerCase() === 'pending' ? 'bg-yellow-50' : ''}
                    `}
                    onClick={() => {
                      setShowLeadModal(true);
                      fetchLeadDetail(lead.lead_Id);
                    }}
                  >
                    <td className="px-5 py-4 text-gray-800">{lead.index}</td>
                    <td className="px-5 py-4 font-medium text-gray-700">{lead.lead_Title}</td>
                    <td className="px-5 py-4 text-gray-700">{lead.lead_Description}</td>
                    <td className="px-5 py-4 text-gray-700">{lead.lead_Source}</td>
                    <td className="px-5 py-4 text-gray-700">{lead.lead_Contact_Name}</td>
                    <td className="px-5 py-4 text-gray-700">{lead.lead_Contact_Email}</td>
                    <td className="px-5 py-4 text-gray-700">{lead.lead_Status}</td>
                    <td className="px-5 py-4 text-gray-700">{moment(lead.created_at).format('DD-MM-YYYY')}</td>

                    {/* <td className="px-5 py-4 text-gray-800 flex items-center gap-2">
                      <div className="relative group">
                        <button
                          className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition"
                          onClick={e => { e.stopPropagation(); handleEdit(lead); }}
                        >
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
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>

        </div>
      </div>

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



      {/* Lead Detail Modal */}
      {/* <Modal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        title="Lead Details"
      >
        {leadDetailLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : leadDetail && !leadDetail.error ? (
          <div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center mb-2">
                <div className="font-semibold w-48">lead_Status:</div>
                <select
                  className="border rounded px-2 py-1"
                  value={leadDetail.lead_Status || ''}
                  onChange={e => handleStatusUpdate(leadDetail.lead_Id, e.target.value)}
                >
                  <option value="pending">pending</option>
                  <option value="Contacted">contacted</option>
                  <option value="cancelled">cancelled</option>
                  <option value="not interested">not interested</option>
                  <option value="completed">completed</option>
                </select>
              </div>

              {Object.entries(leadDetail)
                .filter(([key]) => key !== 'lead_Status')
                .map(([key, value]) => (
                  <div key={key} className="flex">
                    <div className="font-semibold w-48">{key}:</div>
                    <div>{String(value)}</div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="text-red-600 py-8">{leadDetail?.error || 'No details found.'}</div>
        )}
      </Modal> */}
      <Modal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        title="Lead Details"
      >
        {leadDetailLoading ? (
          <div className="text-center py-8 text-blue-600 font-medium">Loading...</div>
        ) : leadDetail && !leadDetail.error ? (
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            {/* Status Update */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-5">
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                Lead Status
              </label>
              <select
                className="border border-blue-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={leadDetail.lead_Status || ""}
                onChange={e => handleStatusUpdate(leadDetail.lead_Id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="Contacted">Contacted</option>
                <option value="cancelled">Cancelled</option>
                <option value="not interested">Not Interested</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {Object.entries(leadDetail)
                .filter(([key]) => key !== "lead_Status")
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col border-b pb-2"
                  >
                    <span className="text-sm text-gray-500 font-medium">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-gray-900 font-semibold break-words">
                      {String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="text-red-600 py-8 text-center font-medium">
            {leadDetail?.error || "No details found."}
          </div>
        )}
      </Modal>

    </div>
  );
}
