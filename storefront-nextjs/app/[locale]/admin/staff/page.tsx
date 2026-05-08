'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  updateUserRole,
  addStaffMember,
  updateStaffProfile,
  deactivateStaff,
  getStaffAuditLogs,
  AppRole
} from '../actions';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Profile } from '@/utils/types';

const StaffPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Profile | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<AppRole>('employee');
  const [currentPage, setCurrentPage] = useState(1);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const itemsPerPage = 8;
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data as Profile[]);
    }
    setLoading(false);
  };

  const startLoading = () => setIsActionLoading(true);
  const stopLoading = () => setIsActionLoading(false);

  const filteredProfiles = profiles.filter(p =>
    (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const paginatedProfiles = filteredProfiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleManageProfile = async (staff: Profile) => {
    setSelectedStaff(staff);
    setIsDrawerOpen(true);
    const logs = await getStaffAuditLogs(staff.id);
    setAuditLogs(logs || []);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    startLoading();
    try {
      await addStaffMember(newStaffEmail, newStaffRole);
      setNewStaffEmail('');
      setIsAddingStaff(false);
      await fetchProfiles();
      alert("Staff member added successfully");
    } catch (err: any) {
      alert(err.message);
    } finally {
      stopLoading();
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedStaff) return;
    startLoading();
    try {
      await updateStaffProfile(selectedStaff.id, { status });
      const updated = { ...selectedStaff, status };
      setSelectedStaff(updated);
      setProfiles(prev => prev.map(p => p.id === selectedStaff.id ? updated : p));
    } catch (err: any) {
      alert(err.message);
    } finally {
      stopLoading();
    }
  };

  const handleDeactivate = async () => {
    if (!selectedStaff) return;
    const reason = prompt("Enter deactivation reason:");
    if (!reason) return;
    
    startLoading();
    try {
      await deactivateStaff(selectedStaff.id, reason);
      setIsDrawerOpen(false);
      await fetchProfiles();
    } catch (err: any) {
      alert(err.message);
    } finally {
      stopLoading();
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading specialized staff data...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-black/50 font-display">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <span className="material-symbols-outlined block">badge</span>
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Staff Management</h1>
                <p className="text-xs text-slate-500 font-medium">Healthcare professional directory</p>
             </div>
          </div>
          <button
            onClick={() => setIsAddingStaff(true)}
            className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Add Personnel
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
                { label: 'Total Personnel', val: profiles.length, icon: 'groups', color: 'text-blue-500' },
                { label: 'Administrators', val: profiles.filter(p => ['super_admin', 'supervisor'].includes(p.role)).length, icon: 'admin_panel_settings', color: 'text-purple-500' },
                { label: 'Active Status', val: profiles.filter(p => p.status === 'Active').length, icon: 'check_circle', color: 'text-emerald-500' },
                { label: 'New This Month', val: profiles.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).length, icon: 'neurology', color: 'text-amber-500' }
            ].map(stat => (
                <div key={stat.label} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.val}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                </div>
            ))}
        </div>

        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                type="text"
                placeholder="Search by name, email or professional ID..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Personnel</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Join Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {paginatedProfiles.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold relative overflow-hidden">
                          {staff.avatar_url ? (
                            <Image src={staff.avatar_url} alt={staff.full_name || 'Avatar'} fill className="object-cover" />
                          ) : (
                            staff.full_name?.[0] || '?'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{staff.full_name || "New User"}</p>
                          <p className="text-xs text-slate-500 font-medium">{staff.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-tighter">
                        {staff.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {new Date(staff.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase ${staff.status === "Active" ? "text-emerald-500" : "text-red-400"}`}>
                        <span className={`size-1.5 rounded-full ${staff.status === "Active" ? "bg-green-500" : staff.status === "On Leave" ? "bg-amber-500" : "bg-red-500"}`}></span> {staff.status || "Offline"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary font-bold text-sm hover:underline" onClick={() => handleManageProfile(staff)}>Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
              <span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white transition-all disabled:opacity-50">Back</button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white transition-all disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Profile Drawer */}
      {isDrawerOpen && selectedStaff && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="size-20 rounded-2xl bg-primary/10 relative overflow-hidden ring-4 ring-primary/5">
                    {selectedStaff.avatar_url ? (
                      <Image src={selectedStaff.avatar_url} alt={selectedStaff.full_name || 'Avatar'} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                        <span className="material-symbols-outlined text-4xl">person</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{selectedStaff.full_name || "User"}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${selectedStaff.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedStaff.status}</span>
                    </div>
                    <p className="text-slate-500 font-medium whitespace-nowrap text-xs uppercase tracking-tight">ID: {selectedStaff.id}</p>
                    <p className="text-primary font-bold text-sm uppercase tracking-widest">{selectedStaff.role.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <button className="size-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500" onClick={() => setIsDrawerOpen(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleUpdateStatus('Active')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-sm transition-all ${selectedStaff.status === 'Active' ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' : 'hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Set Active
                </button>
                <button 
                  onClick={() => handleUpdateStatus('On Leave')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-sm transition-all ${selectedStaff.status === 'On Leave' ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm' : 'hover:bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  <span className="material-symbols-outlined text-lg">holiday_village</span>
                  Set On Leave
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Personnel Documents</h3>
                <div className="flex flex-col gap-3">
                  <input 
                    type="file" 
                    id="doc-upload" 
                    className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !selectedStaff) return;
                      startLoading();
                      try {
                        const fileName = `${selectedStaff.id}/${Date.now()}_${file.name}`;
                        const { error } = await supabase.storage.from('staff_documents').upload(fileName, file);
                        if (error) throw error;
                        alert("Document uploaded successfully!");
                        const logs = await getStaffAuditLogs(selectedStaff.id);
                        setAuditLogs(logs || []);
                      } catch (err: any) {
                        alert("Upload failed: " + err.message);
                      } finally {
                        stopLoading();
                      }
                    }}
                  />
                  <label 
                    htmlFor="doc-upload"
                    className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                  >
                    <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">upload_file</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Upload Document</p>
                      <p className="text-xs text-slate-500">Medical certs, IDs, or contracts (Max 5MB)</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-red-700 dark:text-red-400">Restrict Access</h4>
                  <p className="text-xs text-red-600/70 dark:text-red-400/60 font-medium">Temporarily or permanently disable this account.</p>
                </div>
                <button onClick={handleDeactivate} className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-red-200/50 hover:bg-red-700 transition-all">
                  {selectedStaff.status === 'Deactivated' ? 'Already Disabled' : 'Deactivate'}
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Audit Activity Log</h3>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  {auditLogs.length > 0 ? auditLogs.map((log: any) => (
                    <div key={log.id} className="flex gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{new Date(log.created_at).toLocaleString()} • By {log.profiles?.full_name || 'System'}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic text-center py-4">No recent activity found for this staff member.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex gap-4">
              <button className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20" onClick={() => setIsDrawerOpen(false)}>Done</button>
              <button className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold dark:text-white" onClick={() => setIsDrawerOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md p-8 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Add New Personnel</h2>
                <p className="text-slate-500 text-sm mb-6">Assign professional roles to existing users by email.</p>
                <form onSubmit={handleAddStaff} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm text-slate-900 dark:text-white"
                            value={newStaffEmail}
                            onChange={e => setNewStaffEmail(e.target.value)}
                            placeholder="professional@hospital.com"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Assigned Role</label>
                        <select
                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm text-slate-900 dark:text-white"
                            value={newStaffRole}
                            onChange={e => setNewStaffRole(e.target.value as AppRole)}
                        >
                            <option value="employee">Employee</option>
                            <option value="editor">Editor</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="submit" disabled={isActionLoading} className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                            {isActionLoading ? "Adding..." : "Confirm Addition"}
                        </button>
                        <button type="button" onClick={() => setIsAddingStaff(false)} className="px-6 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-sm dark:text-white">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
