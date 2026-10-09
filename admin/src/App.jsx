import React, { useState, useEffect, useMemo } from 'react';
import VisaForNationLogo from './assets/VisaForNationLogo.png';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  ExternalLink,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  GraduationCap,
  Building,
  CreditCard,
  Eye,
  X,
  ChevronRight,
  ShieldAlert,
  Lock,
  ArrowUpDown,
  Printer
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AdminApp() {
  const [token, setToken] = useState(() => localStorage.getItem('vfn_admin_token') || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Leads state
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters & selection
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Lead editing state inside modal
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check login state
  const isLoggedIn = !!token;

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setLoginError('Please enter admin password');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Invalid admin credentials');
      }

      localStorage.setItem('vfn_admin_token', data.token);
      setToken(data.token);
      setPassword('');
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('vfn_admin_token');
    setToken('');
    setSelectedLead(null);
  };

  // Fetch Leads & Stats
  const fetchLeads = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch leads
      const leadsRes = await fetch(`${API_BASE_URL}/admin/leads`, { headers });
      if (leadsRes.status === 401 || leadsRes.status === 403) {
        handleLogout();
        throw new Error('Session expired. Please log in again.');
      }
      const leadsData = await leadsRes.json();

      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
      const statsData = await statsRes.json();

      if (leadsData.success) {
        setLeads(leadsData.leads || []);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load submissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchLeads();
    }
  }, [token]);

  // Open Lead Details
  const handleSelectLead = async (leadId) => {
    setIsDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setSelectedLead(data.lead);
        setAdminNote(data.lead.adminNotes || '');
      }
    } catch (err) {
      alert('Failed to fetch full lead details: ' + err.message);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Update Status
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedLead) return;
    setStatusUpdateLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/leads/${selectedLead._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, adminNotes: adminNote })
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setSelectedLead(data.lead);
        // update in list
        setLeads((prev) => prev.map((l) => (l._id === data.lead._id ? data.lead : l)));
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Save Notes
  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setStatusUpdateLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/leads/${selectedLead._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ adminNotes: adminNote })
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setSelectedLead(data.lead);
        setLeads((prev) => prev.map((l) => (l._id === data.lead._id ? data.lead : l)));
        alert('Notes saved successfully!');
      }
    } catch (err) {
      alert('Failed to save notes: ' + err.message);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Delete Lead
  const handleDeleteLead = async (leadId) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/leads/${leadId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.filter((l) => l._id !== leadId));
        if (selectedLead && selectedLead._id === leadId) {
          setSelectedLead(null);
        }
        setDeleteConfirmId(null);
      } else {
        alert(data.message || 'Failed to delete lead');
      }
    } catch (err) {
      alert('Error deleting lead: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (lead.fullName && lead.fullName.toLowerCase().includes(q)) ||
        (lead.emailId && lead.emailId.toLowerCase().includes(q)) ||
        (lead.mobileNo && lead.mobileNo.includes(q)) ||
        (lead.positionJoiningFor && lead.positionJoiningFor.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [leads, statusFilter, searchTerm]);

  // Format Date and Time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Selected':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Shortlisted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Interviewed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'In Review':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // -------------------------------------------------------------
  // RENDER: LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="text-center mb-8">
            <img
              src={VisaForNationLogo}
              alt="Visa For Nation Logo"
              className="h-16 mx-auto mb-4 object-contain"
            />
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wide">
              Visa For Nation
            </h1>
            <p className="text-xs uppercase tracking-widest text-red-600 font-bold mt-1">
              Recruitment & Leads Admin Portal
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password..."
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-sm font-medium transition"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Configured securely via environment variables (.env).
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            Protected Admin System • Visa For Nation
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={VisaForNationLogo}
              alt="Visa For Nation"
              className="h-10 w-auto bg-white rounded p-1"
            />
            <div>
              <span className="text-white font-extrabold text-lg tracking-wide uppercase">
                Visa For Nation
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-red-400 font-semibold uppercase tracking-wider bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                Admin Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchLeads}
              disabled={isLoading}
              title="Refresh leads list"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-red-400' : ''}`} />
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-red-700 rounded-lg transition border border-slate-700 hover:border-red-600"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Leads
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Pending
              </span>
              <div className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                In Review
              </span>
              <div className="text-2xl font-black text-blue-600 mt-1">{stats.inReview}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Shortlisted
              </span>
              <div className="text-2xl font-black text-indigo-600 mt-1">{stats.shortlisted}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Selected
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{stats.selected}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Rejected
              </span>
              <div className="text-2xl font-black text-rose-600 mt-1">{stats.rejected}</div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, role..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Filter className="w-4 h-4" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-red-500"
            >
              <option value="All">All Statuses ({leads.length})</option>
              <option value="Pending">Pending</option>
              <option value="In Review">In Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interviewed">Interviewed</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchLeads}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        )}

        {/* User Leads Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              <span>Applicant Submissions</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                {filteredLeads.length} total
              </span>
            </h2>
            <span className="text-xs text-slate-400">
              Latest submissions sorted on top
            </span>
          </div>

          {isLoading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-red-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">Fetching submissions from database...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="py-20 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-base font-semibold text-slate-600">No applicant submissions found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm || statusFilter !== 'All'
                  ? 'Try clearing your search or status filter'
                  : 'New user applications will appear here automatically when submitted'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Position</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Submitted At (Date & Time)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredLeads.map((lead, index) => {
                    const isNewest = index === 0;
                    return (
                      <tr
                        key={lead._id}
                        className={`hover:bg-red-50/40 transition cursor-pointer ${
                          isNewest ? 'bg-red-50/20' : ''
                        }`}
                        onClick={() => handleSelectLead(lead._id)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {lead.documents?.photo?.webViewLink ? (
                              <img
                                src={lead.documents.photo.webViewLink}
                                alt={lead.fullName}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                                {lead.fullName ? lead.fullName.charAt(0) : 'U'}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-2">
                                <span>{lead.fullName}</span>
                                {isNewest && (
                                  <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider animate-pulse">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">
                                Age: {lead.age || 'N/A'} • {lead.gender || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {lead.positionJoiningFor}
                        </td>

                        <td className="py-3.5 px-4 text-xs space-y-0.5">
                          <div className="text-slate-800 font-medium flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{lead.mobileNo}</span>
                          </div>
                          <div className="text-slate-500 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{lead.emailId}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Calendar className="w-3.5 h-3.5 text-red-500" />
                            <span>{formatDateTime(lead.createdAt)}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Interview Date: {lead.applicationDate || 'N/A'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(
                              lead.status
                            )}`}
                          >
                            {lead.status || 'Pending'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleSelectLead(lead._id)}
                              className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(lead._id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded transition"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ----------------------------------------------------------- */}
      {/* FULL LEAD DETAIL MODAL / DRAWER (DO NOT MISS ANY DETAILS)   */}
      {/* ----------------------------------------------------------- */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedLead.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedLead.fullName}</h3>
                  <p className="text-xs text-slate-400">
                    Applying for: <span className="text-red-400 font-semibold">{selectedLead.positionJoiningFor}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                  title="Print Application"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Submission Date & Status Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-red-600" />
                <span>
                  <strong>Submitted:</strong> {formatDateTime(selectedLead.createdAt)}
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  <strong>Interview Date:</strong> {selectedLead.applicationDate || 'N/A'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Status:</span>
                <select
                  value={selectedLead.status || 'Pending'}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={statusUpdateLoading}
                  className={`px-3 py-1 rounded-full font-bold text-xs border outline-none ${getStatusColor(
                    selectedLead.status
                  )}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interviewed">Interviewed</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
                {statusUpdateLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-600" />}
              </div>
            </div>

            {/* Modal Body - All Details Included */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Photo & Core Bio */}
              <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {selectedLead.documents?.photo?.webViewLink ? (
                  <div className="flex-shrink-0 text-center">
                    <img
                      src={selectedLead.documents.photo.webViewLink}
                      alt="Passport"
                      className="w-32 h-40 object-cover rounded-lg border-2 border-white shadow-md mx-auto"
                    />
                    <a
                      href={selectedLead.documents.photo.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:underline mt-2 font-semibold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Full Photo
                    </a>
                  </div>
                ) : (
                  <div className="w-32 h-40 bg-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 mx-auto">
                    <User className="w-8 h-8 mb-1" />
                    <span className="text-xs">No Photo</span>
                  </div>
                )}

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[10px]">Full Name</span>
                    <span className="text-slate-800 font-semibold text-sm">{selectedLead.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[10px]">Position</span>
                    <span className="text-slate-800 font-semibold">{selectedLead.positionJoiningFor}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[10px]">Email Address</span>
                    <span className="text-slate-800 font-medium">{selectedLead.emailId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[10px]">Mobile / WhatsApp</span>
                    <span className="text-slate-800 font-medium">
                      {selectedLead.mobileNo} {selectedLead.whatsappNo ? `(WA: ${selectedLead.whatsappNo})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[10px]">Aadhaar Number</span>
                    <span className="text-slate-800 font-mono font-medium">{selectedLead.aadhaarNo || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[10px]">DOB & Age</span>
                    <span className="text-slate-800 font-medium">
                      {selectedLead.dob || 'N/A'} ({selectedLead.age || 'N/A'} years)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[10px]">Father / Husband</span>
                    <span className="text-slate-800 font-medium">
                      {selectedLead.fatherHusbandName || 'N/A'} ({selectedLead.fatherHusbandOccupation || 'N/A'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[10px]">Gender / Marital / Nationality</span>
                    <span className="text-slate-800 font-medium">
                      {selectedLead.gender} • {selectedLead.maritalStatus} • {selectedLead.nationality}
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5 text-red-600">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Emergency Contacts</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact 1</span>
                    <p className="font-semibold text-slate-800">{selectedLead.emergencyRelativeName1 || 'N/A'}</p>
                    <p className="text-slate-600">Relation: {selectedLead.emergencyRelation1 || 'N/A'}</p>
                    <p className="text-slate-600">Phone: {selectedLead.emergencyNo1 || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact 2</span>
                    <p className="font-semibold text-slate-800">{selectedLead.emergencyRelativeName2 || 'N/A'}</p>
                    <p className="text-slate-600">Relation: {selectedLead.emergencyRelation2 || 'N/A'}</p>
                    <p className="text-slate-600">Phone: {selectedLead.emergencyNo2 || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5 text-red-600">
                  <Building className="w-3.5 h-3.5" />
                  <span>Address Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Present Address</span>
                    <p className="text-slate-700 mt-1 font-medium bg-slate-50 p-2.5 rounded border border-slate-100">
                      {selectedLead.presentAddress || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Permanent Address</span>
                    <p className="text-slate-700 mt-1 font-medium bg-slate-50 p-2.5 rounded border border-slate-100">
                      {selectedLead.sameAsCurrentAddress
                        ? 'Same as Present Address'
                        : selectedLead.permanentAddress || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs bg-slate-50 p-2 rounded">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">District:</span>{' '}
                    <strong>{selectedLead.district || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">State:</span>{' '}
                    <strong>{selectedLead.state || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Pin Code:</span>{' '}
                    <strong>{selectedLead.postalCode || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* Languages Known */}
              {selectedLead.languages && selectedLead.languages.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 text-red-600">
                    Languages Known
                  </h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedLead.languages.map((lang, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 font-medium"
                      >
                        {lang.language === 'Other' ? lang.otherLang : lang.language}:{' '}
                        <strong className="text-red-600">{lang.fluency}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education History */}
              {selectedLead.educationHistory && selectedLead.educationHistory.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5 text-red-600">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Education History</span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded">
                      <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                        <tr>
                          <th className="p-2 border-b">Exam Passed</th>
                          <th className="p-2 border-b">School / College</th>
                          <th className="p-2 border-b">Year</th>
                          <th className="p-2 border-b">Marks / CGPA</th>
                          <th className="p-2 border-b">Subjects</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedLead.educationHistory.map((edu, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-semibold text-slate-800">{edu.examPassed}</td>
                            <td className="p-2 text-slate-700">{edu.schoolCollege || 'N/A'}</td>
                            <td className="p-2 text-slate-700">{edu.yearPassing || 'N/A'}</td>
                            <td className="p-2 text-slate-700">{edu.marksCGPA || 'N/A'}</td>
                            <td className="p-2 text-slate-700">{edu.subjects || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Work Experience */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5 text-red-600">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Work Experience</span>
                </h4>
                {selectedLead.isFresher ? (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded">
                    Candidate is applying as a <strong>Fresher</strong> (No prior employment history).
                  </p>
                ) : selectedLead.experienceDetails && selectedLead.experienceDetails.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLead.experienceDetails.map((exp, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{exp.designation || 'Role'}</span>
                          <span className="text-red-600">
                            {exp.periodFrom} to {exp.periodTo}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-0.5">
                          Company: <strong>{exp.companyName || 'N/A'}</strong> • Address: {exp.companyAddress || 'N/A'}
                        </p>
                        <p className="text-slate-600 mt-0.5">
                          CTC: <strong>{exp.ctc || 'N/A'}</strong> • Reason for leaving: {exp.reasonLeaving || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No experience details provided.</p>
                )}
              </div>

              {/* Family Details */}
              {selectedLead.familyDetails && selectedLead.familyDetails.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 text-red-600">
                    Family Details
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded">
                      <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                        <tr>
                          <th className="p-2 border-b">Member Name</th>
                          <th className="p-2 border-b">Relationship</th>
                          <th className="p-2 border-b">Age</th>
                          <th className="p-2 border-b">Occupation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedLead.familyDetails.map((fam, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-medium">{fam.name || 'N/A'}</td>
                            <td className="p-2">{fam.relationship || 'N/A'}</td>
                            <td className="p-2">{fam.age || 'N/A'}</td>
                            <td className="p-2">{fam.occupation || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bank Details & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 text-xs">
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-2 flex items-center gap-1.5 text-red-600">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Bank Details</span>
                  </h4>
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-slate-100">
                    <p>Bank: <strong>{selectedLead.bankDetails?.bankName || 'N/A'}</strong></p>
                    <p>Account No: <strong>{selectedLead.bankDetails?.accountNo || 'N/A'}</strong></p>
                    <p>IFSC Code: <strong>{selectedLead.bankDetails?.ifscCode || 'N/A'}</strong></p>
                    <p>Branch: <strong>{selectedLead.bankDetails?.branchName || 'N/A'}</strong></p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 text-xs">
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-2 flex items-center gap-1.5 text-red-600">
                    <User className="w-3.5 h-3.5" />
                    <span>Reference</span>
                  </h4>
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-slate-100">
                    <p>Name: <strong>{selectedLead.reference?.name || 'N/A'}</strong></p>
                    <p>Relationship: <strong>{selectedLead.reference?.relationship || 'N/A'}</strong></p>
                    <p>Mobile: <strong>{selectedLead.reference?.mobileNo || 'N/A'}</strong></p>
                    <p>Address: <strong>{selectedLead.reference?.address || 'N/A'}</strong></p>
                  </div>
                </div>
              </div>

              {/* Joining Terms, Declaration & Signature */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-2 text-red-600">
                  Terms & Candidate Declaration
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Offered Salary:</span>
                    <strong className="text-slate-800">{selectedLead.offeredSalary || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Joining Date:</span>
                    <strong className="text-slate-800">{selectedLead.joiningDate || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Declared By:</span>
                    <strong className="text-slate-800">{selectedLead.declarationName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Declared Date:</span>
                    <strong className="text-slate-800">{selectedLead.declarationDate || 'N/A'}</strong>
                  </div>
                </div>
                {selectedLead.signature && (
                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-bold">Digital Signature:</span>
                    <span className="font-serif italic text-sm text-slate-900 border-b border-dashed border-slate-400 px-2">
                      {selectedLead.signature}
                    </span>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------- */}
              {/* UPLOADED DOCUMENTS & GOOGLE DRIVE FILES                       */}
              {/* ------------------------------------------------------------- */}
              <div className="border-2 border-red-100 bg-red-50/20 rounded-xl p-5">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>Google Drive Uploaded Documents</span>
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Stored securely in Google Drive. Click to view or download.
                </p>

                {(() => {
                  const docKeys = [
                    { key: 'photo', label: 'Passport Photo' },
                    { key: 'updatedCv', label: 'CV / Resume' },
                    { key: 'aadhaarFront', label: 'Aadhaar Card (Front)' },
                    { key: 'aadhaarBack', label: 'Aadhaar Card (Back)' },
                    { key: 'panCard', label: 'PAN Card' },
                    { key: 'educationalCertificates', label: 'Educational Certificates' },
                    { key: 'bankPassbook', label: 'Bank Passbook / Cheque' },
                    { key: 'offerLetter', label: 'Offer Letter' },
                    { key: 'salarySlips', label: 'Salary Slips' },
                    { key: 'bankStatements', label: 'Bank Statements' },
                    { key: 'resignationLetter', label: 'Resignation Letter' },
                    { key: 'experienceLetter', label: 'Experience Letter' },
                    { key: 'rentAgreement', label: 'Rent Agreement' }
                  ];

                  const availableDocs = docKeys.filter(
                    (d) => selectedLead.documents && selectedLead.documents[d.key]
                  );

                  if (availableDocs.length === 0) {
                    return (
                      <p className="text-xs text-slate-500 italic py-2">
                        No documents were attached with this application.
                      </p>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableDocs.map(({ key, label }) => {
                        const fileObj = selectedLead.documents[key];
                        const viewUrl = fileObj.webViewLink;
                        const downloadUrl = fileObj.webContentLink || viewUrl;
                        const isGdrive = fileObj.storageType === 'gdrive';

                        return (
                          <div
                            key={key}
                            className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="overflow-hidden">
                              <span className="font-bold text-slate-800 block truncate">{label}</span>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {fileObj.originalName || fileObj.fileName}
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-600">
                                {isGdrive ? '☁ Google Drive' : '📁 Server Upload'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {viewUrl && (
                                <a
                                  href={viewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[11px] transition shadow-xs"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>View</span>
                                </a>
                              )}
                              {downloadUrl && (
                                <a
                                  href={downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                                  title="Download File"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Admin Notes Section */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 text-slate-700">
                  Internal Admin Remarks & Interview Notes
                </h4>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add notes about interview feedback, verification status, comments..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white outline-none focus:border-red-500"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={statusUpdateLoading}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded transition"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setDeleteConfirmId(selectedLead._id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 py-1.5 px-3 rounded hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Lead</span>
              </button>

              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Confirm Delete</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to delete this applicant lead and remove attached files? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLead(deleteConfirmId)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition flex items-center gap-1.5"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
