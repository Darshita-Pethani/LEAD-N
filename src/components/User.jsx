import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Modal from "./otherComponents/Model";
import Swal from 'sweetalert2';
import { Edit2, KeyRound, Trash2 } from 'lucide-react';
import { toast } from "react-toastify";

const DUMMY_USERS = [
  {
    user_Id: 1,
    userName: "Priya Sharma",
    userEmail: "priya.sharma@email.com",
    roleId: "Sales Executive",
    role_Name: "Sales Executive"
  },
  {
    user_Id: 2,
    userName: "Amit Verma",
    userEmail: "amit.verma@email.com",
    roleId: "Manager",
    role_Name: "Manager"
  },
  {
    user_Id: 3,
    userName: "Neha Singh",
    userEmail: "neha.singh@email.com",
    roleId: "Sales Executive",
    role_Name: "Sales Executive"
  }
];

export default function User() {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [defaultPwd, setDefaultPwd] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserFieldErrors, setAddUserFieldErrors] = useState({});
  const [addUserForm, setAddUserForm] = useState({
    userName: '',
    userEmail: '',
    userPassword: '',
    userPassword_confirmation: '',
    roleId: ''
  });

  const [rolesForUser, setRolesForUser] = useState([]);
  const [rolesForUserLoading, setRolesForUserLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editUserData, setEditUserData] = useState(null);
  const token = localStorage.getItem("token");
  const [defaultPwdModalOpen, setDefaultPwdModalOpen] = useState(false);

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const res = await axios.post(`${config.API_BASE_URL}/user/userlist`, {
        inputData: { filterData: { page, limit }, }
      }, {
        headers: {
          Authorization: token,
        },
      });
      if (res.data.status === 'success') {
        setUsers(res.data.data?.length ? res.data.data : DUMMY_USERS);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setUsers(DUMMY_USERS);
        setUsersError('Failed to fetch users');
      }
    } catch (e) {
      setUsers(DUMMY_USERS);
      setUsersError('Failed to fetch users');
    }
    setUsersLoading(false);
  };


  const fetchRolesForUser = async () => {
    setRolesForUserLoading(true);
    try {
      const res = await axios.post(`${config.API_BASE_URL}/user/roles`, { inputData: {} }, {
        headers: {
          Authorization: token,
        },
      });
      if (res.data.status === 'success') {
        setRolesForUser(res.data.data || []);
      } else {
        setRolesForUser([]);
      }
    } catch (e) {
      setRolesForUser([]);
    }
    setRolesForUserLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit]);

  const handleAddUserInputChange = (e) => {
    setAddUserForm({ ...addUserForm, [e.target.name]: e.target.value });
    setAddUserFieldErrors({ ...addUserFieldErrors, [e.target.name]: undefined });
  };

  const handleOpenAddUser = () => {
    setAddUserOpen(!addUserOpen);
    setAddUserFieldErrors({});
    setAddUserForm({
      userName: '',
      userEmail: '',
      userPassword: '',
      userPassword_confirmation: '',
      roleId: ''
    })
    if (!addUserOpen) fetchRolesForUser();
  };


  const handleSaveUser = async (e) => {
    e.preventDefault();
    setAddUserLoading(true);

    try {
      let url = `${config.API_BASE_URL}/user/create-user`;
      let payload = { inputData: { formData: addUserForm } };

      if (editUserData) {
        // For update
        url = `${config.API_BASE_URL}/user/update-user`;
        payload = { inputData: { ...addUserForm, user_Id: editUserData.user_Id } };
      }

      const res = await axios.post(url, payload, {
        headers: {
          Authorization: token,
        },
      });

      if (res.data.status === 'success') {
        let msg = editUserData ? 'User updated successfully' : 'User added successfully'
        toast.success(msg);
        setAddUserForm({
          userName: '',
          userEmail: '',
          userPassword: '',
          userPassword_confirmation: '',
          roleId: ''
        });
        setEditUserData(null);
        setEditUserOpen(false);
        setAddUserOpen(false);
        fetchUsers();
      } else {
        if (res.data.errors) {
          setAddUserFieldErrors(res.data.errors);
        }
        toast.error('Failed to save user');
      }
    } catch (e) {
      toast.error('Failed to save user');
    }

    setAddUserLoading(false);
  };


  const handleEditUser = async (user) => {
    try {
      setEditUserOpen(true);
      const res = await axios.post(`${config.API_BASE_URL}/user/get-user-by-id`, {
        inputData: { userId: user.user_Id }
      }, {
        headers: {
          Authorization: token,
        },
      });
      if (res.data.status === 'success') {
        let userDetails = res.data.data;
        userDetails = userDetails[0];
        setEditUserData(userDetails);
        setAddUserForm({
          userName: userDetails.user_Name || '',
          userEmail: userDetails.user_Email || '',
          roleId: userDetails.role_Id || ''
        });
        fetchRolesForUser();
      } else {
        alert('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Error fetching user details');
    }
  };



  const handleDeleteUser = async (itemId) => {
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
          let res = await axios.post(`${config.API_BASE_URL}/user/delete-user/`, { inputData: { user_Id: itemId } }, {
            headers: {
              Authorization: token,
            },
          });
          Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
          if (res.data.status === 'success') {
            fetchUsers();
          }
        } catch (error) {
          Swal.fire('Error!', 'Failed to delete the item.', 'error');
        }
      }
    });
  };


  const handleResetPwd = async (user) => {
    try {
      const token = localStorage.getItem("token");
      let res = await axios.post(`${config.API_BASE_URL}/auth/app/set-default-pwd/`, { inputData: { userId: user } },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      if (res.data.status === 'success') {
        toast.success(res.data.msg);
        setDefaultPwd(res.data.defaultPassword);
        setDefaultPwdModalOpen(true);
      } else {
        toast.error(res.data.msg);
      }
    } catch (error) {
      toast.error('Error!', 'Failed to reset the password.');
    }
  }

  console.log(editUserData, "editUserDataeditUserData")

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-700">User List</h2>
        <button
          className="mt-2 sm:mt-0 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded hover:from-blue-600 hover:to-blue-500 font-semibold shadow transition"
          onClick={handleOpenAddUser}
        >
          {addUserOpen ? 'Cancel' : 'Add User'}
        </button>
      </div>

      <Modal
        isOpen={addUserOpen || (editUserOpen && editUserData)}
        onClose={() => {
          setAddUserOpen(false);
          setEditUserOpen(false);
          setEditUserData(null);
        }}
        title={editUserData ? 'Edit User' : 'Add User'}
      >
          <form onSubmit={handleSaveUser} className="grid gap-4">
            <div>
              <input
                name="userName"
                value={addUserForm.userName}
                onChange={handleAddUserInputChange}
                placeholder="Name"
                className={`outline-none border px-3 py-2 rounded w-full ${addUserFieldErrors.userName ? 'border-red-500' : ''}`}
                required
              />
              {addUserFieldErrors.userName && (
                <div className="text-red-600 text-sm mt-1">{addUserFieldErrors.userName[0]}</div>
              )}
            </div>
            <div>
              <input
                name="userEmail"
                value={addUserForm.userEmail}
                onChange={handleAddUserInputChange}
                placeholder="Email"
                type="email"
                className={`outline-none border px-3 py-2 rounded w-full ${addUserFieldErrors.userEmail ? 'border-red-500' : ''}`}
                required
              />
              {addUserFieldErrors.userEmail && (
                <div className="text-red-600 text-sm mt-1">{addUserFieldErrors.userEmail[0]}</div>
              )}
            </div>
            {addUserOpen && (
              <>
                <div>
                  <input
                    name="userPassword"
                    value={addUserForm.userPassword}
                    onChange={handleAddUserInputChange}
                    placeholder="Password"
                    type="password"
                    className={`outline-none border px-3 py-2 rounded w-full ${addUserFieldErrors.userPassword ? 'border-red-500' : ''}`}
                    required
                  />
                  {addUserFieldErrors.userPassword && (
                    <div className="text-red-600 text-sm mt-1">{addUserFieldErrors.userPassword[0]}</div>
                  )}
                </div>
                <div>
                  <input
                    name="userPassword_confirmation"
                    value={addUserForm.userPassword_confirmation}
                    onChange={handleAddUserInputChange}
                    placeholder="Confirm Password"
                    type="password"
                    className={`outline-none border px-3 py-2 rounded w-full ${addUserFieldErrors.userPassword_confirmation ? 'border-red-500' : ''}`}
                    required
                  />
                  {addUserFieldErrors.userPassword_confirmation && (
                    <div className="text-red-600 text-sm mt-1">{addUserFieldErrors.userPassword_confirmation[0]}</div>
                  )}
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <select
                name="roleId"
                value={addUserForm.roleId}
                onChange={handleAddUserInputChange}
                className={`outline-none border px-3 py-2 rounded w-full ${addUserFieldErrors.roleId ? 'border-red-500' : ''}`}
                required
              >
                <option value="">Select Role</option>
                {rolesForUserLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  rolesForUser.map(role => (
                    <option key={role.role_Id} value={role.role_Id}>
                      {role.role_Name}
                    </option>
                  ))
                )}
              </select>
              {addUserFieldErrors.roleId && (
                <div className="text-red-600 text-sm mt-1">{addUserFieldErrors.roleId[0]}</div>
              )}
            </div>
            <div className="flex justify-center gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setAddUserOpen(false);
                  setEditUserOpen(false);
                  setEditUserData(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={addUserLoading}
              >
                {addUserLoading ? 'Saving...' : (editUserData ? 'Update' : 'Add')}

              </button>
            </div>
          </form>
      </Modal>

      {usersLoading ? (
        <div>Loading...</div>
      ) : usersError ? (
        <div className="text-red-600">{usersError}</div>
      ) : users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">ID</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {users.map((user, idx) => (
                <tr key={user.user_Id}
                  className={`transition-colors duration-200 cursor-pointer
                  ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  hover:bg-blue-50`}
                >
                  <td className="px-5 py-4 text-gray-800">{user.index}</td>
                  <td className="px-5 py-4 text-gray-700 whitespace-normal break-words">{user.user_Name}</td>
                  <td className="px-5 py-4 text-gray-700 whitespace-normal break-words">{user.user_Email}</td>
                  <td className="px-5 py-4 text-gray-700 whitespace-normal break-words">{user.role_Name}</td>
                  <td className="px-5 py-4 text-gray-800 flex items-center gap-2">
                    <div className="relative group">

                      <button
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition"
                        onClick={() => handleEditUser(user)}
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
                        onClick={() => handleDeleteUser(user.user_Id)}
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

                    {user.role_Name !== 'Admin' && (
                      <div className="relative group">
                        <button
                          onClick={() => handleResetPwd(user.user_Id)}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition"
                        >
                          <KeyRound size={17} />
                        </button>
                        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 
                        text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 
                        transition-opacity whitespace-nowrap z-10">
                          Set Default Password
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* show default pwd */}
      <Modal
        isOpen={defaultPwdModalOpen}
        onClose={() => setDefaultPwdModalOpen(false)}
        title="Default Password"
      >
        <div className="text-center">
          <div className='flex justify-between items-center'>
            <p className="text-lg font-semibold text-gray-700">User's Default Password is:</p>
            <p className="mt-2 px-4 py-2 bg-gray-100 border rounded text-blue-700 font-bold">
              {defaultPwd}
            </p>
          </div>
          <button
            onClick={() => setDefaultPwdModalOpen(false)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
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
