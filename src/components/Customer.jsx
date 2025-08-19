import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import Modal from './otherComponents/Model';
import Swal from 'sweetalert2';

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [customerLoading, setCustomersLoading] = useState(false);
    const [customerError, setCustomersError] = useState('');

    const [addCustomerOpen, setAddCustomerOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const [addCustomerLoading, setAddCustomerLoading] = useState(false);
    const [addCustomerError, setAddCustomerError] = useState('');
    const [addCustomerSuccess, setAddCustomerSuccess] = useState('');
    const [addCustomerFieldErrors, setAddCustomerFieldErrors] = useState({});

    const fetchCustomers = async () => {
        setCustomersLoading(true);
        setCustomersError('');
        try {
            const res = await axios.post(`${config.API_BASE_URL}/user/customer`, {
                inputData: { formData: {} }
            });
            if (res.data.status === 'success') {
                setCustomers(res.data.data || []);
            }
        } catch (e) {
            setCustomersError('No records found');
        }
        setCustomersLoading(false);
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        setAddCustomerLoading(true);
        setAddCustomerError('');
        setAddCustomerSuccess('');
        setAddCustomerFieldErrors({});

        try {
            const res = await axios.post(`${config.API_BASE_URL}/user/create-customer`, {
                inputData: {
                    formData: {
                        firstName,
                        lastName,
                        email
                    }
                }
            });
            if (res.data.status === 'success') {
                setAddCustomerSuccess('Customer added successfully');
                setFirstName('');
                setLastName('');
                setEmail('');
                setAddCustomerOpen(false);
                await fetchCustomers();
            } else if (res.data.status === 'error' && res.data.errors) {
                setAddCustomerFieldErrors(res.data.errors);
                setAddCustomerError(res.data.msg || 'Validation failed.');
            } else {
                setAddCustomerError(res.data.msg || 'Failed to add customer');
            }
        } catch (e) {
            setAddCustomerError('Failed to add customer');
        }
        setAddCustomerLoading(false);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h2 className="text-xl font-bold mb-4 text-blue-700">Customers</h2>
                <button
                    className="mb-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded hover:from-blue-600 hover:to-blue-500 font-semibold shadow transition"
                    onClick={() => setAddCustomerOpen(true)}
                >
                    Add Customer
                </button>
            </div>

            <Modal
                isOpen={addCustomerOpen}
                onClose={() => {
                    setAddCustomerOpen(false);
                    setAddCustomerError('');
                    setAddCustomerSuccess('');
                    setAddCustomerFieldErrors({});
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                }}
                title="Add Customer"
            >
                <form onSubmit={handleAddCustomer} className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <input
                                type="text"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                placeholder="First Name"
                                className={`outline-none border px-2 py-1 rounded w-full ${addCustomerFieldErrors.firstName ? 'border-red-500' : ''}`}
                                required
                            />
                            {addCustomerFieldErrors.firstName && (
                                <div className="text-red-600 text-sm">{addCustomerFieldErrors.firstName[0]}</div>
                            )}
                        </div>
                        <div>
                            <input
                                type="text"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                placeholder="Last Name"
                                className={`outline-none border px-2 py-1 rounded w-full ${addCustomerFieldErrors.lastName ? 'border-red-500' : ''}`}
                                required
                            />
                            {addCustomerFieldErrors.lastName && (
                                <div className="text-red-600 text-sm">{addCustomerFieldErrors.lastName[0]}</div>
                            )}
                        </div>
                        <div className='md:col-span-2'>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Email"
                                className={`outline-none border px-2 py-1 rounded w-full ${addCustomerFieldErrors.email ? 'border-red-500' : ''}`}
                                required
                            />
                            {addCustomerFieldErrors.email && (
                                <div className="text-red-600 text-sm">{addCustomerFieldErrors.email[0]}</div>
                            )}
                        </div>
                    </div>

                    {addCustomerError && <div className="text-red-600">{addCustomerError}</div>}
                    {addCustomerSuccess && <div className="text-green-600">{addCustomerSuccess}</div>}

                    <div className="flex justify-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setAddCustomerOpen(false);
                                setAddCustomerError('');
                                setAddCustomerSuccess('');
                                setAddCustomerFieldErrors({});
                                setFirstName('');
                                setLastName('');
                                setEmail('');
                            }}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={addCustomerLoading}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            {addCustomerLoading ? 'Adding...' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>

            {customerLoading ? (
                <div>Loading...</div>
            ) : customerError ? (
                <div className="text-red-600">{customerError}</div>
            ) : customers.length === 0 ? (
                <div>No customers found.</div>
            ) : (
                <table className="min-w-full border rounded-xl">
                    <thead className="bg-blue-50">
                        <tr>
                            <th className="border px-2 py-1 font-semibold text-blue-700">First Name</th>
                            <th className="border px-2 py-1 font-semibold text-blue-700">Last Name</th>
                            <th className="border px-2 py-1 font-semibold text-blue-700">Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((cust, idx) => (
                            <tr key={cust.customer_Id || idx} className="hover:bg-blue-100 transition">
                                <td className="border px-2 py-1">{cust.firstName}</td>
                                <td className="border px-2 py-1">{cust.lastName}</td>
                                <td className="border px-2 py-1">{cust.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
