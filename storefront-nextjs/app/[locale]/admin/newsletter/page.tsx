"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { sendNewsletter } from "@/app/[locale]/admin/actions";
import { useLoading } from "@/components/providers";

const NewsletterPage = () => {
  const [subject, setSubject] = useState("");
  const [sender, setSender] = useState("newsletter@med-ecommerce.com");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const { setIsLoading } = useLoading();
  const editorRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const fileName = `newsletters/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('staff_documents').upload(fileName, file); // Reusing bucket for now
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('staff_documents').getPublicUrl(fileName);
      setAttachmentUrl(publicUrl);
      setAttachment(file);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    const content = editorRef.current?.innerHTML || "";
    if (!subject || !content) {
      alert("Please enter a subject and content before sending.");
      return;
    }
    
    setIsLoading(true);
    try {
      await sendNewsletter({
        subject,
        body: content,
        sender,
        attachment_url: attachmentUrl || undefined
      });
      alert("Newsletter successfully queued for delivery!");
      setSubject("");
      if (editorRef.current) editorRef.current.innerHTML = "";
      setAttachment(null);
      setAttachmentUrl(null);
    } catch (err: any) {
      alert("Failed to send: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-800 bg-[#f8fafc] font-sans">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .editor-placeholder:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
        }
      `}</style>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0054a3] rounded-xl flex items-center justify-center shadow-sm text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-xl">
              MedPortal <span className="text-[#0054a3] font-bold">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-10 w-10 bg-slate-200 rounded-full border-2 border-white ring-1 ring-slate-200 shadow-sm overflow-hidden relative">
              <Image 
                alt="avatar" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVC6b9LkhoutB8kQERD3yLgdB--2ow5TUug735IWZqxX-s3ld6liYJB-74fHVHb97rgESu-ytcmZlkvhB2hP-47i3v84KG4O5Fj688Nypq50G3PiUrFodmElnb0Y6ejVYBlVf7Hdgu5FzKmsnwPH_Xu3hP1i2mAReLVfvwtLv6uy6ehSO22PTJuadPoEVuhJB38i0SKEQG_mVv0-4j_e2G9Rx2qAiRrpsmTCfgl993uMVlAa7s5TUHiFX7E3iM_sYCEDqEjP-J2bw"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900">Newsletter Campaign</h1>
          <p className="text-slate-500 text-base mt-1">Create and dispatch professional medical updates to your verified network.</p>
        </header>

        <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          {/* Sender Row */}
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <label className="w-full md:w-32 text-sm font-bold text-slate-700 uppercase tracking-wider" htmlFor="sender-email">From:</label>
              <div className="flex-1">
                <select 
                  className="w-full border-slate-200 rounded-xl text-sm py-2.5 focus:ring-2 focus:ring-blue-100 focus:border-[#0054a3] transition-all bg-white" 
                  id="sender-email"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                >
                  <option value="newsletter@med-ecommerce.com">Newsletter &lt;newsletter@med-ecommerce.com&gt;</option>
                  <option value="updates@med-ecommerce.com">Product Updates &lt;updates@med-ecommerce.com&gt;</option>
                  <option value="support@med-ecommerce.com">Medical Support &lt;support@med-ecommerce.com&gt;</option>
                </select>
              </div>
            </div>
          </div>

          {/* Composer Body */}
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block" htmlFor="subject-input">Email Subject (العنوان)</label>
              <input 
                className="w-full border-slate-200 rounded-xl text-lg py-4 px-5 focus:ring-4 focus:ring-blue-50/50 focus:border-[#0054a3] transition-all placeholder-slate-400 font-medium" 
                id="subject-input" 
                placeholder="Enter a compelling subject line..." 
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">Message Body (الرسالة)</label>
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                  <button onClick={() => document.execCommand('bold')} className="p-2 hover:bg-white rounded-md text-slate-600 transition-all hover:shadow-sm" title="Bold">
                    <span className="material-symbols-outlined text-[20px]">format_bold</span>
                  </button>
                  <button onClick={() => document.execCommand('italic')} className="p-2 hover:bg-white rounded-md text-slate-600 transition-all hover:shadow-sm" title="Italic">
                    <span className="material-symbols-outlined text-[20px]">format_italic</span>
                  </button>
                  <div className="w-px h-6 bg-slate-300 mx-1"></div>
                  <button onClick={() => document.execCommand('insertOrderedList')} className="p-2 hover:bg-white rounded-md text-slate-600 transition-all hover:shadow-sm" title="Ordered List">
                    <span className="material-symbols-outlined text-[20px]">format_list_numbered</span>
                  </button>
                  <button onClick={() => document.execCommand('insertUnorderedList')} className="p-2 hover:bg-white rounded-md text-slate-600 transition-all hover:shadow-sm" title="Bullet List">
                    <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
                  </button>
                </div>
              </div>
              <div 
                ref={editorRef}
                className="min-h-[500px] w-full p-6 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-[#0054a3] transition-all editor-placeholder text-slate-700 text-lg leading-relaxed custom-scrollbar overflow-y-auto bg-white dark:bg-slate-900" 
                contentEditable="true" 
                data-placeholder="Start typing your medical update or campaign message here..." 
                id="editor-area"
              >
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">Attachments</label>
              <div className="flex flex-wrap items-center gap-4">
                <input 
                  type="file" 
                  id="newsletter-attach" 
                  className="hidden" 
                  accept=".pdf"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                <label 
                  htmlFor="newsletter-attach" 
                  className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-[#0054a3] hover:text-[#0054a3] hover:bg-blue-50/30 transition-all font-semibold cursor-pointer"
                >
                  <span className="material-symbols-outlined">attach_file</span>
                  <span>Attach PDF Document</span>
                </label>
                {attachment && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-[#0054a3] rounded-full text-sm font-semibold shadow-sm animate-in fade-in zoom-in duration-200">
                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                    <span className="max-w-[150px] truncate">{attachment.name}</span>
                    <button onClick={() => { setAttachment(null); setAttachmentUrl(null); }} className="ml-2 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-8 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">calendar_month</span>
                <span className="text-sm font-bold text-slate-600 whitespace-nowrap uppercase tracking-wide">Schedule Send:</span>
              </div>
              <input className="w-full sm:w-auto text-sm border-slate-200 rounded-xl focus:ring-[#0054a3] focus:border-[#0054a3] transition-all bg-white py-2.5 px-4 font-medium" type="datetime-local"/>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              <button className="px-8 py-3.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95" type="button">
                Save Draft
              </button>
              <button 
                className="px-12 py-3.5 text-base font-bold text-white bg-[#0054a3] border border-[#0054a3] rounded-xl hover:bg-blue-800 active:bg-blue-900 transition-all shadow-lg hover:shadow-blue-200/50 flex items-center gap-3 active:scale-95" 
                type="button"
                onClick={handleSend}
              >
                <span>Send Newsletter</span>
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        </section>

        {/* Info Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm h-fit">
              <span className="material-symbols-outlined text-[#0054a3]">verified_user</span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-blue-900">Compliance & Security</h4>
              <p className="text-sm text-blue-700/80 mt-1.5 leading-relaxed">All outbound communications are automatically logged for audit. Ensure content complies with clinical standards.</p>
            </div>
          </div>
          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm h-fit text-emerald-600">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-emerald-900">Broad Reach</h4>
              <p className="text-sm text-emerald-700/80 mt-1.5 leading-relaxed">Your current mailing list includes <strong>4,289</strong> verified medical practitioners.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewsletterPage;
