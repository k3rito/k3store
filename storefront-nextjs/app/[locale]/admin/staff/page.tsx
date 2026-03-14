"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { updateStaffProfile, deactivateStaff, getStaffAuditLogs } from "@/app/[locale]/admin/actions";
import { useLoading } from "@/components/providers";

const StaffPage = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const { setIsLoading } = useLoading();
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  const supabase = createClient();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['super_admin', 'supervisor', 'employee', 'editor'])
      .order('created_at', { ascending: false });
    if (data) setProfiles(data);
  };

  const handleManageProfile = async (staff: any) => {
    setSelectedStaff(staff);
    setIsDrawerOpen(true);
    const logs = await getStaffAuditLogs(staff.id);
    setAuditLogs(logs || []);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedStaff) return;
    startLoading();
    try {
      await updateStaffProfile(selectedStaff.id, { status });
      await fetchStaff();
      setSelectedStaff({ ...selectedStaff, status });
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
      await fetchStaff();
      setIsDrawerOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      stopLoading();
    }
  };

  const filteredStaff = profiles.filter(s => 
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStaff.length / pageSize);
  const paginatedStaff = filteredStaff.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-[#f5f7f8] dark:bg-[#0f1923] text-slate-900 dark:text-slate-100 min-h-screen font-display">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>

      {/* Desktop Sidebar (Placeholder) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 bg-[#0054a3] rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined">health_and_safety</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#0054a3]">MedCommerce</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {["dashboard", "badge", "inventory_2", "shopping_cart", "settings"].map((icon, i) => (
            <a key={icon} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${i === 1 ? "bg-[#0054a3]/10 text-[#0054a3] font-semibold" : "text-slate-500 dark:text-slate-400 hover:bg-[#0054a3]/10 hover:text-[#0054a3]"}`} href="#">
              <span className="material-symbols-outlined">{icon}</span> {i === 0 ? "Dashboard" : i === 1 ? "Staff Directory" : i === 2 ? "Inventory" : i === 3 ? "Orders" : "Settings"}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <header className="sticky top-0 bg-white/80 dark:bg-[#0f1923]/80 backdrop-blur-md z-30 px-4 py-4 lg:px-8 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Staff Management</h1>
                <p className="text-slate-500 text-sm">Manage medical personnel, roles, and access controls</p>
              </div>
              <button className="bg-[#0054a3] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#0054a3]/20 hover:bg-[#0054a3]/90 transition-all">
                <span className="material-symbols-outlined">person_add</span>
                <span className="hidden sm:inline">Add New Staff</span>
              </button>
            </div>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#0054a3]/50 text-sm" 
                  placeholder="Search by Name, Email, or ID..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {["Role", "Department", "Status"].map(filter => (
                  <select key={filter} className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-[#0054a3]/50">
                    <option>{filter}</option>
                  </select>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Main Staff Table */}
        <section className="p-4 lg:p-8 max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[11px] font-bold tracking-widest">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Hire Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-[#0054a3]/10 flex items-center justify-center overflow-hidden relative">
                            {staff.avatar_url ? (
                              <Image src={staff.avatar_url} alt={staff.full_name || staff.email} fill className="object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-primary">person</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{staff.full_name || "User"}</p>
                            <p className="text-xs text-slate-500">{staff.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">{staff.email}</p>
                        <p className="text-xs text-slate-400">{staff.phone || "No phone"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold uppercase tracking-wider">{staff.role.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{staff.hire_date || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${staff.status === "Active" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : staff.status === "On Leave" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                          <span className={`size-1.5 rounded-full ${staff.status === "Active" ? "bg-green-500" : staff.status === "On Leave" ? "bg-amber-500" : "bg-red-500"}`}></span> {staff.status || "Offline"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[#0054a3] font-bold text-sm hover:underline" onClick={() => handleManageProfile(staff)}>Manage Profile</button>
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
          </div>
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
                  <div className="size-20 rounded-2xl bg-[#0054a3]/10 relative overflow-hidden ring-4 ring-[#0054a3]/5">
                    {selectedStaff.avatar_url ? (
                      <Image src={selectedStaff.avatar_url} alt={selectedStaff.full_name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                        <span className="material-symbols-outlined text-4xl">person</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-extrabold tracking-tight">{selectedStaff.full_name || "User"}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${selectedStaff.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedStaff.status}</span>
                    </div>
                    <p className="text-slate-500 font-medium whitespace-nowrap text-xs uppercase tracking-tight">ID: {selectedStaff.id}</p>
                    <p className="text-[#0054a3] font-bold text-sm">{selectedStaff.role.replace('_', ' ')}</p>
                  </div>
                </div>
                <button className="size-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500" onClick={() => setIsDrawerOpen(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              {/* Profile Actions */}
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

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Employee Documents</h3>
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
                        await getStaffAuditLogs(selectedStaff.id).then(setAuditLogs);
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
                      <p className="text-sm font-bold">Upload Document</p>
                      <p className="text-xs text-slate-500">PDF, JPG, or PNG (Max 5MB)</p>
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

              {/* Audit Logs */}
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
              <button className="flex-1 bg-[#0054a3] text-white py-3 rounded-xl font-bold shadow-lg shadow-[#0054a3]/20" onClick={() => setIsDrawerOpen(false)}>Done</button>
              <button className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold" onClick={() => setIsDrawerOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
