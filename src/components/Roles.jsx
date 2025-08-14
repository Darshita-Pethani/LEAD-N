import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Modal from "./Model";
import Swal from 'sweetalert2';
import { Edit2, Trash2 } from 'lucide-react';
import { toast } from "react-toastify";

const DUMMY_ROLES = [
  { roleId: 1, roleName: "Sales Executive", roleSlug: "sales-executive" },
  { roleId: 2, roleName: "Manager", roleSlug: "manager" },
  { roleId: 3, roleName: "Admin", roleSlug: "admin" }
];

export default function Roles() {
  // Roles list
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState('');

  // Single modal for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [modalRoleName, setModalRoleName] = useState('');
  const [modalRoleId, setModalRoleId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // add-role form validation errors (if any)
  const [fieldErrors, setFieldErrors] = useState({});

  // Permission management state
  const [showRolePermissions, setShowRolePermissions] = useState(null); // roleId or null
  const [rolePermissions, setRolePermissions] = useState([]);
  const [rolePermissionsLoading, setRolePermissionsLoading] = useState(false);
  const [rolePermissionsError, setRolePermissionsError] = useState('');

  // Add for permission assignment
  const [allPermissions, setAllPermissions] = useState([]);
  const [addPermissionLoading, setAddPermissionLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  // small helper to refresh roles
  const fetchRoles = async () => {
    setRolesLoading(true);
    setRolesError('');
    try {
      const res = await axios.post(`${config.API_BASE_URL}/user/roles`, {
        inputData: { filterData: { page, limit } }
      });
      if (res.data.status === 'success') {
        setRoles(res.data.data && res.data.data.length > 0 ? res.data.data : DUMMY_ROLES);
        setTotalPages(res.data.totalPages || 1);

      } else {
        setRoles(DUMMY_ROLES);
        setRolesError(res.data.msg || 'Failed to fetch roles');
      }
    } catch (e) {
      setRoles(DUMMY_ROLES);
      setRolesError('Failed to fetch roles');
    }
    setRolesLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, [page, limit]);

  // Open modal for add
  const openAddModal = () => {
    setModalMode('add');
    setModalRoleName('');
    setModalRoleId(null);
    setFieldErrors({});
    setModalOpen(true);
  };

  // Open modal for edit
  const openEditModal = async (role) => {
    setModalMode('edit');

    try {
      const roleId = role.role_Id ?? role.roleId ?? null;
      if (!roleId) throw new Error('Invalid role id');

      const res = await axios.post(`${config.API_BASE_URL}/user/role-by-id`, { inputData: { roleId: role.role_Id } });
      if (res.data.status === 'success' && res.data.data) {
        setModalRoleName(res.data.data[0].role_Name || '');
        setModalRoleId(res.data.data[0].role_Id);
        setModalOpen(true);
      }
    } catch (error) {
      setModalOpen(true);
    }
    setModalLoading(false);
  };


  // Save role — handles both add & edit
  const handleSaveRole = async (e) => {
    e && e.preventDefault();
    setModalLoading(true);
    setFieldErrors({});
    try {
      if (!modalRoleName || modalRoleName.trim() === '') {
        setFieldErrors({ roleName: ['Role name is required'] });
        setModalLoading(false);
        return;
      }

      if (modalMode === 'add') {
        const res = await axios.post(`${config.API_BASE_URL}/user/create-role`, {
          inputData: { formData: { roleName: modalRoleName } }
        });
        if (res.data.status === 'success') {
          toast.success("Role added successfully");
          setModalOpen(false);
          setModalRoleName('');
          await fetchRoles();
        } else if (res.data.status === 'error' && res.data.errors) {
          setFieldErrors(res.data.errors || {});
          toast.error(res.data.msg || 'Validation failed.');
        } else {
          toast.error(res.data.msg || 'Failed to add role');
        }
      } else {
        // edit
        const res = await axios.post(`${config.API_BASE_URL}/user/update-role`, {
          inputData: {
            roleId: modalRoleId,
            roleName: modalRoleName

          }
        });
        if (res.data.status === 'success') {
          toast.success(res.data.msg || 'Role updated successfully');
          setModalOpen(false);
          setModalRoleName('');
          setModalRoleId(null);
          await fetchRoles();
        } else if (res.data.status === 'error' && res.data.errors) {
          setFieldErrors(res.data.errors || {});
          toast.error(res.data.msg || 'Validation failed.');
        } else {
          toast.error(res.data.msg || 'Failed to update role');
        }
      }
    } catch (err) {
      toast.error(res.data.msg || 'Failed to save role');
    }
    setModalLoading(false);
  };

  const handleDeleteRole = async (item) => {
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
          let res = await axios.post(`${config.API_BASE_URL}/user/delete-role`, { inputData: { role_Id: item.role_Id } });
          // Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
          toast.success(res.data.msg || 'Role deleted successfully.');
          if (res.data.status === 'success') {
            fetchRoles();
          }
        } catch (error) {
          Swal.fire('Error!', 'Failed to delete the item.', 'error');
        }
      }
    });
  };

  // Permissions functions (kept mostly same)
  const fetchRolePermissions = async (roleId) => {
    setRolePermissionsLoading(true);
    setRolePermissionsError('');
    setShowRolePermissions(roleId);
    try {
      const res = await axios.post(`${config.API_BASE_URL}/user/role-permission`, {
        inputData: { role_Id: roleId }
      });
      if (res.data.status === 'success') {
        setRolePermissions(res.data.data || []);
      } else {
        setRolePermissions([]);
        setRolePermissionsError('Failed to fetch permissions for this role');
      }
    } catch (e) {
      setRolePermissions([]);
      setRolePermissionsError('Failed to fetch permissions for this role');
    }
    setRolePermissionsLoading(false);
  };

  const fetchAllPermissions = async () => {
    try {
      const res = await axios.post(`${config.API_BASE_URL}/user/permissions`, { inputData: { formData: {} } });
      if (res.data.status === 'success') {
        setAllPermissions(res.data.data || []);
      } else {
        setAllPermissions([]);
      }
    } catch {
      setAllPermissions([]);
    }
  };

  useEffect(() => {
    if (showRolePermissions) fetchAllPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRolePermissions]);

  const togglePermission = async (perm, assigned) => {
    setAddPermissionLoading(true);
    try {
      if (!assigned) {
        // add permission
        const res = await axios.post(`${config.API_BASE_URL}/user/add-role-permission`, {
          inputData: { formData: { roleId: showRolePermissions, permissionId: perm.permission_Id } }
        });
        if (res.data.status === 'success') {
          toast.success(res.data.msg || 'Permission added');
          fetchRolePermissions(showRolePermissions);
        } else {
          toast.error(res.data.msg || 'Failed to add permission');
        }
      } else {
        // find rolePermissionId
        const rolePermission = rolePermissions.find(rp => rp.permission_Id === perm.permission_Id);
        if (!rolePermission) {
          toast.error(res.data.msg || 'Failed to find assigned permission id');
        } else {
          let res = await axios.post(`${config.API_BASE_URL}/user/delete-role-permission`, {
            inputData: { role_Id: rolePermission.role_Id, rolePermissionId: rolePermission.permission_Id, isActive: 0 }
          });
          toast.success(res.data.msg || 'Permission removed');
          fetchRolePermissions(showRolePermissions);
        }
      }
    } catch (e) {
      toast.error('Failed to update permission');
    }
    setAddPermissionLoading(false);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-700">Roles</h2>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded hover:from-blue-600 hover:to-blue-500 font-semibold shadow transition"
            onClick={openAddModal}
          >
            Add Role
          </button>
        </div>
      </div>

      {rolesLoading ? (
        <div>Loading roles...</div>
      ) : rolesError ? (
        <div className="text-red-600">{rolesError}</div>
      ) : (
        // <div className="overflow-x-auto">
        //   <table className="min-w-full border rounded-xl">
        //     <thead className="bg-blue-50">
        //       <tr>
        //         <th className="border px-3 py-2 font-semibold text-blue-700">Role ID</th>
        //         <th className="border px-3 py-2 font-semibold text-blue-700">Role Name</th>
        //         <th className="border px-3 py-2 font-semibold text-blue-700">Role Slug</th>
        //         <th className="border px-3 py-2 font-semibold text-blue-700">Manage Permission</th>
        //         <th className="border px-3 py-2 font-semibold text-blue-700">Actions</th>
        //       </tr>
        //     </thead>
        //     <tbody>
        //       {(roles || []).map((role, idx) => (
        //         <tr key={role.role_Id ?? role.roleId ?? idx} className="hover:bg-blue-100">
        //           <td className="border px-2 py-1">{role.index}</td>
        //           <td className="border px-2 py-1">{role.role_Name ?? role.roleName}</td>
        //           <td className="border px-2 py-1">{role.role_Slug ?? role.roleSlug}</td>
        //           <td className="border px-2 py-1">
        //             <button
        //               className="px-2 py-1 bg-gradient-to-r text-blue-500 font-semibold rounded"
        //               onClick={() => fetchRolePermissions(role.role_Id ?? role.roleId)}
        //             >
        //               Manage Permission
        //             </button>
        //           </td>
        //           <td className="border px-2 py-1 flex gap-2 justify-center">
        //             <button
        //               onClick={() => openEditModal(role)}
        //               className="px-2 py-1 text-blue-500 font-semibold"
        //             >
        //               Edit
        //             </button>
        //             <button
        //               onClick={() => handleDeleteRole(role)}
        //               className="px-2 py-1 text-red-500 font-semibold"
        //             >
        //               Delete
        //             </button>
        //           </td>
        //         </tr>
        //       ))}
        //     </tbody>
        //   </table>
        // </div>
        <div className="flex-1 flex flex-col w-full">
          <div className="overflow-x-auto flex-1" style={{ maxHeight: '100%' }}>

            <table className="w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">ID</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Role Name</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Role Slug</th>
                  <th className="px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Permissions</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {(roles || []).map((role, idx) => (
                  <tr
                    key={role.role_Id ?? role.roleId ?? idx}
                    className={`transition-colors duration-200 cursor-pointer
                ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                hover:bg-blue-50`}
                  >
                    <td className="px-5 py-4 text-gray-800">{role.index}</td>
                    <td className="px-5 py-4 text-gray-700">{role.role_Name ?? role.roleName}</td>
                    <td className="px-5 py-4 italic text-gray-500">{role.role_Slug ?? role.roleSlug}</td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => fetchRolePermissions(role.role_Id ?? role.roleId)}
                        className="inline-block bg-blue-100 text-blue-700 font-semibold px-4 py-1 rounded-lg hover:bg-blue-200 transition"
                      >
                        Manage
                      </button>
                    </td>

                    <td className="px-5 py-4 text-gray-800 flex items-center gap-3">
                      {/* Edit Button */}
                      <div className="relative group">
                        <button
                          className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition"
                          onClick={() => openEditModal(role)}
                        >
                          <Edit2 size={17} />
                        </button>
                        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 
                      text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 
                      transition-opacity whitespace-nowrap z-10">
                          Edit
                        </span>
                      </div>

                      {/* Delete Button */}
                      <div className="relative group">
                        <button
                          onClick={() => handleDeleteRole(role)}
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

      {/* Add / Edit Role Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'add' ? 'Add Role' : 'Edit Role'}
      >

        <form onSubmit={handleSaveRole} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <input
              type="text"
              value={modalRoleName}
              onChange={(e) => setModalRoleName(e.target.value)}
              className={`outline-none border px-3 py-2 rounded ${fieldErrors.roleName ? 'border-red-500' : ''}`}
              placeholder="Enter role name"
              required
            />
            {fieldErrors.roleName && (
              <div className="text-red-600 text-sm mt-1">{fieldErrors.roleName[0]}</div>
            )}
          </label>

          <div className="flex justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setModalMode('add');
                setModalRoleName('');
                setModalRoleId(null);
                setFieldErrors({});
              }}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {modalLoading ? 'Saving...' : (modalMode === 'add' ? 'Add' : 'Update')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={!!showRolePermissions}
        onClose={() => setShowRolePermissions(null)}
        title={`Permissions for Role: ${roles.find(r => (r.role_Id ?? r.roleId) === showRolePermissions)?.role_Name ?? ''
          }`}
      >
        {rolePermissionsLoading ? (
          <div>Loading...</div>
        ) : rolePermissionsError ? (
          <div className="text-red-600 mb-2">{rolePermissionsError}</div>
        ) : (
          <div className="mb-4 max-h-72 overflow-y-auto flex flex-col gap-2">
            {allPermissions.length === 0 ? (
              <div>No permissions found.</div>
            ) : (
              allPermissions.map((perm) => {
                const assigned = rolePermissions.some(rp => rp.permission_Id === perm.permission_Id);
                return (
                  <label key={perm.permission_Id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assigned}
                      onChange={() => togglePermission(perm, assigned)}
                      disabled={addPermissionLoading}
                    />
                    <span>{perm.permission_Name} <span className="text-gray-500">({perm.permission_Route_Path})</span></span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </Modal>

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
