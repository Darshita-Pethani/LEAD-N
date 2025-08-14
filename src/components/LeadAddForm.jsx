import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import { toast } from "react-toastify";
const API_KEY = import.meta.env.VITE_GOOGLE_CODE_API_KEY;

export default function LeadAddForm({ onSuccess, onError, onCancel, editLeadData }) {
  const [form, setForm] = useState({
    lead_Title: '',
    lead_Description: '',
    lead_Source: '',
    lead_Contact_Name: '',
    lead_Contact_Email: '',
    lead_Contact_Phone: '',
    lead_Status: '',
    lead_Assigned_To: '',
    lead_Address_House: '',
    lead_Address_Street: '',
    lead_Address_City: '',
    lead_Address_Postcode: '',
    lead_Address_Country: '',
    lead_Address_Latitude: '',
    lead_Address_Longitude: '',
    lead_Note: ''
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [agents, setAgents] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
    if (
      [
        'lead_Address_House',
        'lead_Address_Street',
        'lead_Address_City',
        'lead_Address_Postcode',
        'lead_Address_Country'
      ].includes(e.target.name)
    ) {
      setGeoError('');
    }
  };

  const buildAddressString = () => {
    return [
      form.lead_Address_House,
      form.lead_Address_Street,
      form.lead_Address_City,
      form.lead_Address_Postcode,
      form.lead_Address_Country
    ].filter(Boolean).join(', ');
  };

  const handleAddressLookup = async () => {
    const address = buildAddressString();
    if (!address) {
      setGeoError('Please enter address details.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setForm(f => ({
          ...f,
          lead_Address_Latitude: location.lat,
          lead_Address_Longitude: location.lng
        }));
        setGeoError('');
      } else {
        setGeoError('Address not found. Please try a different address.');
      }
    } catch (err) {
      setGeoError('Failed to fetch location. Please try again.');
    }
    setGeoLoading(false);
  };

  // Map API response error keys to form field names
  const errorFieldMap = {
    lead_Title: 'lead_Title',
    lead_Description: 'lead_Description',
    lead_Source: 'lead_Source',
    lead_Contact_Name: 'lead_Contact_Name',
    lead_Contact_Email: 'lead_Contact_Email',
    lead_Address_House: 'lead_Address_House',
    lead_Address_Street: 'lead_Address_Street',
    lead_Address_City: 'lead_Address_City',
    lead_Address_Postcode: 'lead_Address_Postcode',
    lead_Address_Country: 'lead_Address_Country',
    lead_Address_Latitude: 'lead_Address_Latitude',
    lead_Address_Longitude: 'lead_Address_Longitude'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      let res;
      if (editLeadData && editLeadData.lead_Id) {
        // Update lead
        res = await axios.post(
          `${config.API_BASE_URL}/sales/update`,
          {
            inputData: {
              ...form,
              lead_Id: editLeadData.lead_Id,
            }
          }
        );
      } else {
        // Add new lead
        res = await axios.post(
          `${config.API_BASE_URL}/sales/create-lead`,
          {
            inputData: { formData: form }
          }
        );
      }

      if (res.data.status === 'success') {
        if (onSuccess) onSuccess(editLeadData != '' ? "update" : "add");
        // Clear form only if adding new lead
        if (!editLeadData) {
          setForm({
            lead_Title: '',
            lead_Description: '',
            lead_Source: '',
            lead_Contact_Name: '',
            lead_Contact_Email: '',
            lead_Contact_Phone: '',
            lead_Status: '',
            lead_Assigned_To: '',
            lead_Address_House: '',
            lead_Address_Street: '',
            lead_Address_City: '',
            lead_Address_Postcode: '',
            lead_Address_Country: '',
            lead_Address_Latitude: '',
            lead_Address_Longitude: '',
            lead_Note: ''
          });
          setSearchTerm('');
        }
      } else if (res.data.status === 'error' && res.data.errors) {
        // Map API error keys to form field names
        const mappedErrors = {};
        Object.entries(res.data.errors).forEach(([apiKey, messages]) => {
          const formKey = errorFieldMap[apiKey] || apiKey;
          mappedErrors[formKey] = messages;
        });
        setFieldErrors(mappedErrors);
        if (onError) onError(res.data.msg || 'Validation failed.');
      } else {
        if (onError) onError(res.data.msg || 'Failed to save lead');
      }
    } catch (e) {
      if (onError) onError('Failed to save lead');
    }
    setLoading(false);
  };

  const fetchAgents = async () => {
    try {
      const res = await axios.post(`${config.API_BASE_URL}/user/agent-list`);
      if (res.data.status === 'success' && Array.isArray(res.data.data)) {
        setAgents(res.data.data);
      } else {
        setAgents([]);
      }
    } catch (error) {
      setAgents([]);
    }
  };


  useEffect(() => {
    fetchAgents();

  }, []);

  useEffect(() => {
    if (editLeadData) {
      setForm({
        lead_Title: editLeadData.lead_Title || '',
        lead_Description: editLeadData.lead_Description || '',
        lead_Source: editLeadData.lead_Source || '',
        lead_Contact_Name: editLeadData.lead_Contact_Name || '',
        lead_Contact_Email: editLeadData.lead_Contact_Email || '',
        lead_Contact_Phone: editLeadData.lead_Contact_Phone || '',
        lead_Status: editLeadData.lead_Status || '',
        lead_Assigned_To: editLeadData.lead_Assigned_To || '',
        lead_Address_House: editLeadData.lead_Address_House || '',
        lead_Address_Street: editLeadData.lead_Address_Street || '',
        lead_Address_City: editLeadData.lead_Address_City || '',
        lead_Address_Postcode: editLeadData.lead_Address_Postcode || '',
        lead_Address_Country: editLeadData.lead_Address_Country || '',
        lead_Address_Latitude: editLeadData.lead_Address_Latitude || '',
        lead_Address_Longitude: editLeadData.lead_Address_Longitude || '',
        lead_Note: editLeadData.lead_Note || ''
      });
      const assignedAgent = agents.find(agent => agent.user_Id === editLeadData.lead_Assigned_To);
      if (assignedAgent) {
        setSearchTerm(assignedAgent.user_Name);
      } else {
        setSearchTerm('');
      }
    } else {
      setForm({
        lead_Title: '',
        lead_Description: '',
        lead_Source: '',
        lead_Contact_Name: '',
        lead_Contact_Email: '',
        lead_Contact_Phone: '',
        lead_Status: '',
        lead_Assigned_To: '',
        lead_Address_House: '',
        lead_Address_Street: '',
        lead_Address_City: '',
        lead_Address_Postcode: '',
        lead_Address_Country: '',
        lead_Address_Latitude: '',
        lead_Address_Longitude: '',
        lead_Note: ''
      });
      setSearchTerm('');
    }
  }, [editLeadData, agents]);


  useEffect(() => {
    if (searchTerm.trim() !== '') {
      const filtered = agents.filter(agent =>
        agent.user_Name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAgents(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [searchTerm, agents]);

  const handleSelect = (agent) => {
    setForm({ ...form, ['lead_Assigned_To']: agent.user_Id });
    setFieldErrors({ ...fieldErrors, ['lead_Assigned_To']: undefined });
    setSearchTerm(agent.user_Name);
    setShowDropdown(false);
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4"
      style={{ maxHeight: '80vh', overflowY: 'auto' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            name="lead_Title"
            value={form.lead_Title}
            onChange={handleChange}
            placeholder="Title"
            className={`outline-none border px-3 py-2 rounded w-full${fieldErrors.lead_Title ? ' border-red-500' : ''}`}
          />
          {fieldErrors.lead_Title && (
            <div className="text-red-600 text-sm mt-1">{fieldErrors.lead_Title[0]}</div>
          )}
        </div>
        <div>
          <input
            name="lead_Description"
            value={form.lead_Description}
            onChange={handleChange}
            placeholder="Description"
            className={`outline-none border px-3 py-2 rounded w-full${fieldErrors.lead_Description ? ' border-red-500' : ''}`}
          />
          {fieldErrors.lead_Description && (
            <div className="text-red-600 text-sm mt-1">{fieldErrors.lead_Description[0]}</div>
          )}
        </div>
        <div>
          <input
            name="lead_Source"
            value={form.lead_Source}
            onChange={handleChange}
            placeholder="Source"
            className={`outline-none border px-3 py-2 rounded w-full${fieldErrors.lead_Source ? ' border-red-500' : ''}`}
          />
          {fieldErrors.lead_Source && (
            <div className="text-red-600 text-sm mt-1">{fieldErrors.lead_Source[0]}</div>
          )}
        </div>
        <div>
          <input
            name="lead_Contact_Name"
            value={form.lead_Contact_Name}
            onChange={handleChange}
            placeholder="Contact Name"
            className={`outline-none border px-3 py-2 rounded w-full${fieldErrors.lead_Contact_Name ? ' border-red-500' : ''}`}
          />
          {fieldErrors.lead_Contact_Name && (
            <div className="text-red-600 text-sm mt-1">{fieldErrors.lead_Contact_Name[0]}</div>
          )}
        </div>
        <div>
          <input
            name="lead_Contact_Email"
            value={form.lead_Contact_Email}
            onChange={handleChange}
            placeholder="Contact Email"
            type="email"
            className={`outline-none border px-3 py-2 rounded w-full${fieldErrors.lead_Contact_Email ? ' border-red-500' : ''}`}
          />
          {fieldErrors.lead_Contact_Email && (
            <div className="text-red-600 text-sm mt-1">{fieldErrors.lead_Contact_Email[0]}</div>
          )}
        </div>
        <div>
          <input
            name="lead_Contact_Phone"
            value={form['lead_Contact_Phone']}
            onChange={handleChange}
            placeholder="Contact Number"
            type="tel"
            className={`outline-none border px-3 py-2 rounded w-full${fieldErrors['lead_Contact_Phone'] ? ' border-red-500' : ''}`}
          />
          {fieldErrors['lead_Contact_Phone'] && (
            <div className="text-red-600 text-sm mt-1">{fieldErrors['lead_Contact_Phone'][0]}</div>
          )}
        </div>

        <div>
          <select
            name="lead_Status"
            value={form.lead_Status}
            onChange={handleChange}
            className={`outline-none border px-3 py-2 rounded w-full${fieldErrors.lead_Status ? ' border-red-500' : ''}`}
          >
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="Work In Progress">Work In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          {fieldErrors.lead_Status && (
            <div className="text-red-600 text-sm mt-1">{fieldErrors.lead_Status[0]}</div>
          )}
        </div>
        {/* agent dropdown */}
        <div className='relative'>
          <input
            type="text"
            name="Search agent"
            placeholder="Search agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          {showDropdown && (
            <ul className="absolute w-full z-10 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg">
              {filteredAgents.length > 0 ? (
                filteredAgents.map((agent, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelect(agent)}
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
        {/* <div>
          <input
            name="lead_Assigned_To"
            value={form.lead_Assigned_To}
            onChange={handleChange}
            placeholder="Assigned To (User ID)"
            className="border px-3 py-2 rounded w-full"
          />
        </div> */}
        <div>
          <input
            name="lead_Address_House"
            value={form.lead_Address_House}
            onChange={handleChange}
            placeholder="House / Flat No."
            className={`outline-none border px-3 py-2 rounded w-full${fieldErrors.lead_Address_House ? ' border-red-500' : ''}`}
          />
          {fieldErrors.lead_Address_House && (
            <div className="text-red-600 text-sm mt-1">{fieldErrors.lead_Address_House[0]}</div>
          )}
        </div>
        <div>
          <input
            name="lead_Address_Street"
            value={form.lead_Address_Street}
            onChange={handleChange}
            placeholder="Street"
            className={`outline-none border px-3 py-2 rounded w-full${fieldErrors.lead_Address_Street ? ' border-red-500' : ''}`}
          />
          {fieldErrors.lead_Address_Street && (
            <div className="text-red-600 text-sm mt-1">{fieldErrors.lead_Address_Street[0]}</div>
          )}
        </div>
        <div>
          <input
            name="lead_Address_City"
            value={form.lead_Address_City}
            onChange={handleChange}
            placeholder="City"
            className={`outline-none border px-3 py-2 rounded w-full${fieldErrors.lead_Address_City ? ' border-red-500' : ''}`}
          />
          {fieldErrors.lead_Address_City && (
            <div className="text-red-600 text-sm mt-1">{fieldErrors.lead_Address_City[0]}</div>
          )}
        </div>
        <div>
          <input
            name="lead_Address_Postcode"
            value={form.lead_Address_Postcode}
            onChange={handleChange}
            placeholder="Postcode"
            className={`outline-none border px-3 py-2 rounded w-full${fieldErrors.lead_Address_Postcode ? ' border-red-500' : ''}`}
          />
          {fieldErrors.lead_Address_Postcode && (
            <div className="text-red-600 text-sm mt-1">{fieldErrors.lead_Address_Postcode[0]}</div>
          )}
        </div>
        <div>
          <input
            name="lead_Address_Country"
            value={form.lead_Address_Country}
            onChange={handleChange}
            placeholder="Country"
            className={`outline-none border px-3 py-2 rounded w-full${fieldErrors.lead_Address_Country ? ' border-red-500' : ''}`}
          />
          {fieldErrors.lead_Address_Country && (
            <div className="text-red-600 text-sm mt-1">{fieldErrors.lead_Address_Country[0]}</div>
          )}
        </div>
        <div>
          <button
            type="button"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleAddressLookup}
            disabled={geoLoading}
          >
            {geoLoading ? 'Locating...' : 'Get Location from Address'}
          </button>
          {geoError && <div className="text-red-600 text-sm mt-1">{geoError}</div>}
        </div>
        <div>
          <input
            name="lead_Address_Latitude"
            value={form.lead_Address_Latitude}
            readOnly
            placeholder="Latitude"
            className={`outline-none border px-3 py-2 rounded w-full bg-gray-100${fieldErrors.lead_Address_Latitude ? ' border-red-500' : ''}`}
          />
          {fieldErrors.lead_Address_Latitude && (
            <div className="text-red-600 text-sm mt-1">{fieldErrors.lead_Address_Latitude[0]}</div>
          )}
        </div>
        <div>
          <input
            name="lead_Address_Longitude"
            value={form.lead_Address_Longitude}
            readOnly
            placeholder="Longitude"
            className={`outline-none border px-3 py-2 rounded w-full bg-gray-100${fieldErrors.lead_Address_Longitude ? ' border-red-500' : ''}`}
          />
          {fieldErrors.lead_Address_Longitude && (
            <div className="text-red-600 text-sm mt-1">{fieldErrors.lead_Address_Longitude[0]}</div>
          )}
        </div>
        <div className="md:col-span-2">
          <input
            name="lead_Note"
            value={form.lead_Note}
            onChange={handleChange}
            placeholder="Note"
            className="outline-none border px-3 py-2 rounded w-full"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2 justify-center">
        <button
          type="button"
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? (editLeadData != '' ? 'Updating...' : 'Adding...') : (editLeadData != '' ? 'Update Lead' : 'Add Lead')}
        </button>

      </div>
    </form>
  );
}
