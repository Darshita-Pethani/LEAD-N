import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import Modal from "../components/Model";
import Swal from 'sweetalert2';
import { Edit2, Trash2 } from 'lucide-react';
import { toast } from "react-toastify";

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formFields, setFormFields] = useState({
    permission_Id: null,
    permission_Name: "",
    permission_Route_Path: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchPermissions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${config.API_BASE_URL}/user/permissions`, {
        inputData: { filterData: { page, limit } }
      });
      if (res.data.status === "success") {
        setPermissions(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);

      } else {
        setError("Failed to fetch permissions");
      }
    } catch {
      setError("Failed to fetch permissions");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPermissions();
  }, [limit, page]);

  const handleInputChange = (e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFieldErrors({});
    try {
      const url = formFields.permission_Id
        ? `${config.API_BASE_URL}/user/update-permission`
        : `${config.API_BASE_URL}/user/create-permission`;

      const res = await axios.post(url, {
        inputData: formFields,
      });

      if (res.data.status === "success") {
        let msg = formFields.permission_Id ? "Permission updated successfully" : "Permission added successfully"
        toast.success(msg);
        setFormFields({
          permission_Id: null,
          permission_Name: "",
          permission_Route_Path: "",
        });
        setFormOpen(false);
        fetchPermissions();
      } else if (res.data.status === "error" && res.data.errors) {
        setFieldErrors(res.data.errors);
        toast.error("Validation failed.");
      } else {
        toast.error("Failed to save permission");
      }
    } catch {
      toast.error("Failed to save permission");
    }
    setFormLoading(false);
  };

  const handleEdit = async (permission) => {
    setFieldErrors({});
    setFormLoading(true);
    try {
      const res = await axios.post(`${config.API_BASE_URL}/user/permision-by-id`, {
        inputData: { permission_Id: permission.permission_Id },
      });
      if (res.data.status === "success" && res.data.data) {
        setFormFields(res.data.data[0]);
        setFormOpen(true);
      } else {
        toast.error("Failed to load permission details");
      }
    } catch (error) {
      toast.error("Failed to load permission details");
    }
    setFormLoading(false);
  };

  const handleDeletePermission = async (item) => {
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
          let res = await axios.post(`${config.API_BASE_URL}/user/delete-permission`, { inputData: { permission_Id: item.permission_Id } });
          // Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
          toast.success("Permission deleted successfully");
          if (res.data.status === 'success') {
            fetchPermissions();
          }
        } catch (error) {
          Swal.fire('Error!', 'Failed to delete the item.', 'error');
        }
      }
    });
  };
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-700">Permissions</h2>
        <button
          className="mb-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded hover:from-blue-600 hover:to-blue-500 font-semibold shadow transition"
          onClick={() => {
            setFormOpen(true);
            setFormFields({
              permission_Id: null,
              permission_Name: "",
              permission_Route_Path: "",
            });
          }}
        >
          Add Permission
        </button>
      </div>

      {/* Modal for Add/Edit */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={formFields.permission_Id ? "Edit Permission" : "Add Permission"}
      >
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                name="permission_Name"
                value={formFields.permission_Name}
                onChange={handleInputChange}
                placeholder="Permission Name"
                className={`outline-none border px-2 py-1 rounded w-full ${fieldErrors.permission_Name ? "border-red-500" : ""
                  }`}
                required
              />
              {fieldErrors.permission_Name && (
                <div className="text-red-600 text-sm mt-1">
                  {fieldErrors.permission_Name[0]}
                </div>
              )}
            </div>
            <div>
              <input
                name="permission_Route_Path"
                value={formFields.permission_Route_Path}
                onChange={handleInputChange}
                placeholder="Route Path"
                className={`outline-none border px-2 py-1 rounded w-full ${fieldErrors.permission_Route_Path ? "border-red-500" : ""
                  }`}
                required
              />
              {fieldErrors.permission_Route_Path && (
                <div className="text-red-600 text-sm mt-1">
                  {fieldErrors.permission_Route_Path[0]}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setFormFields({
                  permission_Id: null,
                  permission_Name: "",
                  permission_Route_Path: "",
                });
                setFieldErrors({});
              }}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {formLoading
                ? formFields.permission_Id
                  ? "Updating..."
                  : "Adding..."
                : formFields.permission_Id
                  ? "Update"
                  : "Add "}
            </button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : permissions.length === 0 ? (
        <div>No permissions found.</div>
      ) : (
        <div className="flex-1 flex flex-col w-full">
          <div className="overflow-x-auto flex-1" style={{ maxHeight: '100%' }}>
        <table className="w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">ID</th>
              <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Name</th>
              <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">
                Route Path
              </th>
              <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission, idx) => (
              <tr key={permission.permission_Id} className={`transition-colors duration-200 cursor-pointer
                  ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  hover:bg-blue-50`}>
                <td className="px-5 py-4 text-gray-800">{permission.index}</td>
                <td className="px-5 py-4 text-gray-800">{permission.permission_Name}</td>
                <td className="px-5 py-4 text-gray-800">
                  {permission.permission_Route_Path}
                </td>
                <td className="px-5 py-4 text-gray-800 flex items-center gap-2">
                  <div className="relative group">

                    <button
                      className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition"
                      onClick={() => handleEdit(permission)}
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
                      onClick={() => handleDeletePermission(permission)}
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
            ))}
          </tbody>
        </table>
        </div> 
        </div>
      )}

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
    </div>

  );
}
