import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminAPI } from '../../services/api';
import { FaUser, FaUserTie, FaSave, FaUserShield, FaPlus, FaTrash, FaEdit, FaSearch, FaTimes } from 'react-icons/fa';
import { setAgentPermissions } from '../../utils/permissionsStore';

const MODULES = [
  { key: 'demand', label: 'Demand' },
  { key: 'demandLines', label: 'Demand-Lines' },
  { key: 'preApproval', label: 'Pre-Approval' },
  { key: 'advertisement', label: 'Advertisement' },
  { key: 'demandIssues', label: 'Demand-Issues' },
  { key: 'demandFiles', label: 'Demand-Files' },
  { key: 'applicant', label: 'Applicant' },
  { key: 'ticket', label: 'Ticket' },
  { key: 'visa', label: 'Visa' },
  { key: 'applicantFile', label: 'Applicant-File' },
  { key: 'applicantMedical', label: 'Applicant-Medical' },
  { key: 'applications', label: 'Applications' },
  { key: 'applicantIssues', label: 'Applicant-Issues' },
  { key: 'applicantTransaction', label: 'Applicant-Transaction' },
  { key: 'applicantLog', label: 'Applicant-Log' },
];

const defaultPerm = { list: true, detail: true, add: true, modify: true, remove: false };

const createDefaultPermissions = () => {
  const perms = {};
  MODULES.forEach(m => {
    perms[m.key] = { ...defaultPerm };
  });
  return perms;
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState(createDefaultPermissions());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Add/Edit User Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    role: 'AGENT'
  });

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredUsers(users.filter(u => 
        u.username.toLowerCase().includes(lower) || 
        u.role.toLowerCase().includes(lower)
      ));
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error('Error loading users', err);
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const res = await adminAPI.getOfficerApprovalRequests();
      setPendingUsers(res.data);
    } catch (err) {
      console.error('Error loading pending users', err);
    }
  };

  const handleApproveUser = async (id) => {
    try {
      await adminAPI.approveUser(id);
      setMessage({ type: 'success', text: 'User approved successfully' });
      fetchPendingUsers();
      fetchUsers();
    } catch (err) {
      console.error('Error approving user', err);
      setMessage({ type: 'error', text: 'Failed to approve user' });
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    // Reset permissions first
    setPermissions(createDefaultPermissions());
    
    if (user.role === 'AGENT' && user.agent) {
        // Load permissions for agent
        const agent = user.agent;
        try {
            const localKeyUser = user.username ? `agentPerm:u:${user.username}` : null;
            const localKeyId = agent.id ? `agentPerm:id:${agent.id}` : null;
            const localRaw = localKeyUser ? localStorage.getItem(localKeyUser) : null;
            const localRawAlt = (!localRaw && localKeyId) ? localStorage.getItem(localKeyId) : null;
            const base = createDefaultPermissions();
            const fromLocal = localRaw ? JSON.parse(localRaw) : (localRawAlt ? JSON.parse(localRawAlt) : null);
            
            if (fromLocal) {
                setPermissions({ ...base, ...fromLocal });
            } else if (agent.permissionsJson) {
                const parsed = JSON.parse(agent.permissionsJson);
                setPermissions({ ...base, ...parsed });
            } else {
                setPermissions(base);
            }
        } catch (e) {
            console.error('Error parsing permissionsJson', e);
            setPermissions(createDefaultPermissions());
        }
    }
  };

  const toggleModuleAll = (moduleKey, value) => {
    setPermissions(prev => ({
      ...prev,
      [moduleKey]: {
        list: value,
        detail: value,
        add: value,
        modify: value,
        remove: value,
      },
    }));
  };

  const togglePermission = (moduleKey, permKey, value) => {
    setPermissions(prev => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [permKey]: value,
      },
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedUser || selectedUser.role !== 'AGENT' || !selectedUser.agent) return;
    setSaving(true);
    try {
      await adminAPI.updateAgentPermissions(selectedUser.agent.id, permissions);
      // Also save to local storage as backup
      setAgentPermissions(selectedUser.agent, permissions);
      setMessage({ type: 'success', text: 'Permissions updated successfully' });
      fetchUsers(); // Refresh to update any local state if needed
    } catch (err) {
      console.error('Failed to save permissions:', err);
      setMessage({ type: 'error', text: 'Failed to save permissions' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddUserClick = () => {
    setIsEditMode(false);
    setUserForm({ username: '', password: '', role: 'AGENT' });
    setShowUserModal(true);
  };

  const handleEditUserClick = (user, e) => {
    e.stopPropagation();
    setIsEditMode(true);
    setUserForm({
      username: user.username,
      password: '', // Password empty means don't change
      role: user.role
    });
    // If we are editing the currently selected user, keep it selected. 
    // Otherwise, we might want to select it, but let's just open the modal.
    if (!selectedUser || selectedUser.id !== user.id) {
        handleSelectUser(user);
    }
    setShowUserModal(true);
  };

  const handleDeleteUser = async (user, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
        await adminAPI.deleteUser(user.id);
        setMessage({ type: 'success', text: 'User deleted successfully' });
        if (selectedUser && selectedUser.id === user.id) {
            setSelectedUser(null);
        }
        fetchUsers();
        fetchPendingUsers();
    } catch (err) {
        console.error('Error deleting user:', err);
        setMessage({ type: 'error', text: 'Failed to delete user' });
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
        if (isEditMode) {
            await adminAPI.updateUser(selectedUser.id, userForm);
            setMessage({ type: 'success', text: 'User updated successfully' });
        } else {
            await adminAPI.createUser(userForm);
            setMessage({ type: 'success', text: 'User created successfully' });
        }
        setShowUserModal(false);
        fetchUsers();
    } catch (err) {
        console.error('Error saving user:', err);
        setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save user' });
    } finally {
        setSaving(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserShield /> User Management
          </h1>
          <button
            onClick={handleAddUserClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all"
          >
            <FaPlus /> Add User
          </button>
        </div>

        {message.text && (
          <div className={`px-4 py-3 rounded border ${
            message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            {message.text}
          </div>
        )}

        {pendingUsers.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-yellow-800 mb-2">Pending Officer Approvals</h3>
            <div className="space-y-2">
              {pendingUsers.map(u => (
                <div key={u.id} className="flex justify-between items-center bg-white p-3 rounded border border-yellow-100">
                  <div>
                    <span className="font-semibold">{u.username}</span>
                    <span className="text-gray-500 text-sm ml-2">({u.email || 'No email'})</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApproveUser(u.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                        onClick={(e) => handleDeleteUser(u, e)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                        Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users list */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-200px)]">
            <div className="p-4 border-b border-gray-200">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No users found.</div>
            ) : (
                filteredUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {user.profilePhotoPath ? (
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${user.profilePhotoPath}`}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-gray-800 truncate">{user.username}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'AGENT' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                        <button 
                            onClick={(e) => handleEditUserClick(user, e)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded"
                            title="Edit User"
                        >
                            <FaEdit />
                        </button>
                        <button 
                            onClick={(e) => handleDeleteUser(user, e)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded"
                            title="Delete User"
                        >
                            <FaTrash />
                        </button>
                    </div>
                  </div>
                ))
            )}
            </div>
          </div>

          {/* User Details / Permissions */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col h-[calc(100vh-200px)] overflow-y-auto">
            {!selectedUser ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FaUserShield size={48} className="mb-4 text-gray-300" />
                <p className="text-lg">Select a user to view details</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start gap-6 border-b border-gray-100 pb-6">
                    <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {selectedUser.profilePhotoPath ? (
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${selectedUser.profilePhotoPath}`}
                          alt={selectedUser.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser size={32} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{selectedUser.username}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm font-semibold text-gray-500">Role:</span>
                            <span className={`px-2 py-1 text-sm rounded ${
                                selectedUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                selectedUser.role === 'AGENT' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {selectedUser.role}
                            </span>
                        </div>
                        {selectedUser.role === 'AGENT' && selectedUser.agent && (
                             <p className="text-sm text-gray-500 mt-1">Agent Status: {selectedUser.agent.status}</p>
                        )}
                    </div>
                </div>

                {selectedUser.role === 'AGENT' ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Agent Permissions
                        </h3>
                        <p className="text-sm text-gray-500">
                          Configure what this agent can see and modify.
                        </p>
                      </div>
                      <button
                        onClick={handleSavePermissions}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                      >
                        <FaSave /> {saving ? 'Saving...' : 'Save Permissions'}
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg">
                      {MODULES.map((mod) => {
                        const perms = permissions[mod.key] || defaultPerm;
                        const allChecked =
                          perms.list && perms.detail && perms.add && perms.modify && perms.remove;
                        return (
                          <div
                            key={mod.key}
                            className="px-4 py-3 border-b last:border-b-0 border-gray-200 hover:bg-gray-50"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="w-48">
                                    <div className="font-semibold text-green-700">{mod.label}</div>
                                    <label className="flex items-center gap-1 text-xs text-gray-500 mt-1 cursor-pointer">
                                        <input
                                        type="checkbox"
                                        checked={allChecked}
                                        onChange={(e) => toggleModuleAll(mod.key, e.target.checked)}
                                        className="rounded text-green-600 focus:ring-green-500"
                                        />
                                        <span>Select All</span>
                                    </label>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm flex-1">
                                {['list', 'detail', 'add', 'modify', 'remove'].map((permKey) => (
                                    <label key={permKey} className="flex items-center gap-1 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={!!perms[permKey]}
                                        onChange={(e) =>
                                        togglePermission(mod.key, permKey, e.target.checked)
                                        }
                                        className="rounded text-green-600 focus:ring-green-500"
                                    />
                                    <span className="capitalize">{permKey}</span>
                                    </label>
                                ))}
                                </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-500">
                            {selectedUser.role === 'ADMIN' 
                                ? 'Administrators have full access to all modules.' 
                                : 'Permissions are currently only configurable for Agents.'}
                        </p>
                    </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {isEditMode ? 'Edit User' : 'Add New User'}
                    </h3>
                    <button onClick={() => setShowUserModal(false)} className="text-gray-500 hover:text-gray-700">
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            value={userForm.username}
                            onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isEditMode ? 'Password (leave blank to keep current)' : 'Password'}
                        </label>
                        <input
                            type="password"
                            required={!isEditMode}
                            value={userForm.password}
                            onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={userForm.role}
                            onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ADMIN">ADMIN</option>
                            <option value="AGENT">AGENT</option>
                            <option value="OFFICER">OFFICER</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            {userForm.role === 'AGENT' && "Selecting AGENT will automatically create an Agent profile."}
                        </p>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowUserModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminUsers;
