'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { sendNewsletter } from '../actions';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const NewsletterPage = () => {
  const [subject, setSubject] = useState('');
  const [sender, setSender] = useState('newsletter@med-store.com');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [isSending, setIsActionLoading] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    const fetchSubscribers = async () => {
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
        if (!error) setSubscriberCount(count);
    };
    fetchSubscribers();
  }, [supabase]);

  const handleUpload = async (file: File) => {
    setIsActionLoading(true);
    try {
      const fileName = `newsletter_attachments/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('public_assets').upload(fileName, file);
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('public_assets').getPublicUrl(data.path);
      setAttachment(file);
      setAttachmentUrl(publicUrl);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSend = async () => {
    if (!subject || !editorRef.current?.innerHTML) {
      alert("Please provide a subject and message body.");
      return;
    }

    setIsActionLoading(true);
    try {
      await sendNewsletter({
        subject,
        body: editorRef.current.innerHTML,
        sender_email: sender,
        attachment_url: attachmentUrl || undefined
      });
      alert("Newsletter sent successfully to verified network.");
      setSubject('');
      if (editorRef.current) editorRef.current.innerHTML = '';
      setAttachment(null);
      setAttachmentUrl(null);
    } catch (err: any) {
      alert("Failed to send: " + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-display antialiased">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/${locale}/admin`} className="flex items-center gap-2 text-primary font-bold">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-slate-200 relative overflow-hidden">
                <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-slate-400">person</span>
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900">Newsletter Campaign</h1>
          <p className="text-slate-500 text-base mt-1">Create and dispatch professional medical updates to your verified network.</p>
        </header>

        <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <label className="w-full md:w-32 text-sm font-bold text-slate-700 uppercase tracking-wider" htmlFor="sender-email">From:</label>
              <div className="flex-1">
                <select 
                  className="w-full border-slate-200 rounded-xl text-sm py-2.5 focus:ring-2 focus:ring-primary-light focus:border-primary transition-all bg-white"
                  id="sender-email"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                >
                  <option value="newsletter@med-store.com">Newsletter &lt;newsletter@med-store.com&gt;</option>
                  <option value="updates@med-store.com">Product Updates &lt;updates@med-store.com&gt;</option>
                  <option value="support@med-store.com">Medical Support &lt;support@med-store.com&gt;</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block" htmlFor="subject-input">Email Subject</label>
              <input 
                className="w-full border-slate-200 rounded-xl text-lg py-4 px-5 focus:ring-4 focus:ring-primary-light/50 focus:border-primary transition-all placeholder-slate-400 font-medium"
                id="subject-input" 
                placeholder="Enter a compelling subject line..." 
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">Message Body</label>
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
                className="min-h-[500px] w-full p-6 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-light/50 focus:border-primary transition-all editor-placeholder text-slate-700 text-lg leading-relaxed custom-scrollbar overflow-y-auto bg-white dark:bg-slate-900"
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
                  className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-primary hover:text-primary hover:bg-primary-light/30 transition-all font-semibold cursor-pointer"
                >
                  <span className="material-symbols-outlined">attach_file</span>
                  <span>Attach PDF Document</span>
                </label>
                {attachment && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary-light border border-primary/20 text-primary rounded-full text-sm font-semibold shadow-sm animate-in fade-in zoom-in duration-200">
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

          <div className="px-8 py-8 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">calendar_month</span>
                <span className="text-sm font-bold text-slate-600 whitespace-nowrap uppercase tracking-wide">Schedule Send:</span>
              </div>
              <input className="w-full sm:w-auto text-sm border-slate-200 rounded-xl focus:ring-primary focus:border-primary transition-all bg-white py-2.5 px-4 font-medium" type="datetime-local"/>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              <button className="px-8 py-3.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95" type="button">
                Save Draft
              </button>
              <button 
                className="px-12 py-3.5 text-base font-bold text-white bg-primary border border-primary rounded-xl hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/20 flex items-center gap-3 active:scale-95"
                type="button"
                onClick={handleSend}
                disabled={isSending}
              >
                <span>{isSending ? "Processing..." : "Send Newsletter"}</span>
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        </section>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-primary-light border border-primary/10 rounded-2xl flex gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm h-fit">
              <span className="material-symbols-outlined text-primary">verified_user</span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-primary-dark">Compliance & Security</h4>
              <p className="text-sm text-primary/80 mt-1.5 leading-relaxed">All outbound communications are automatically logged for audit. Ensure content complies with clinical standards.</p>
            </div>
          </div>
          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm h-fit text-emerald-600">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-emerald-900">Broad Reach</h4>
              <p className="text-sm text-emerald-700/80 mt-1.5 leading-relaxed">Your current mailing list includes <strong>{subscriberCount !== null ? subscriberCount.toLocaleString() : '...'}</strong> verified medical practitioners.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewsletterPage;
