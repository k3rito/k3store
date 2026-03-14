import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useLoading } from "@/components/providers";

interface ProfileBubbleProps {
  userName: string;
  userEmail: string;
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileBubble: React.FC<ProfileBubbleProps> = ({
  userName,
  userEmail,
  userRole,
  isOpen,
  onClose
}) => {
  const router = useRouter();
  const { locale } = useParams();
  const { setIsLoading } = useLoading();
  const supabase = createClient();

  if (!isOpen) return null;

  const handleSignOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    onClose();
    router.push(`/${locale}/login`);
    router.refresh();
    setIsLoading(false);
  };

  return (
    <div className="relative w-full max-w-[320px] bg-white rounded-2xl shadow-xl border border-gray-100 animate-popover-in popover-arrow" id="profile-popover">
      <style jsx>{`
        @keyframes popoverIn {
          0% { opacity: 0; transform: scale(0.95) translateY(-10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-popover-in {
          animation: popoverIn 0.2s ease-out forwards;
        }
        .popover-arrow::before {
          content: "";
          position: absolute;
          top: -6px;
          right: 24px;
          width: 12px;
          height: 12px;
          background-color: white;
          transform: rotate(45deg);
          border-left: 1px solid rgba(0,0,0,0.05);
          border-top: 1px solid rgba(0,0,0,0.05);
        }
      `}</style>
      
      {/* Header Section */}
      <header className="pt-6 pb-4 flex flex-col items-center border-b border-gray-50">
        <div className="mb-3 w-12 h-12 bg-[#0054a3] rounded-full flex items-center justify-center text-white shadow-md">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 01-.586 1.414l-5 5c-.126.126-.255.246-.388.358m0 0a2 2 0 112.828 2.828l-5 5c-.126.126-.255.246-.388.358m0 0a2 2 0 11-2.828-2.828" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-800">{userName}</h2>
      </header>

      {/* Body Section */}
      <div className="px-6 py-4 flex flex-col items-center space-y-3">
        <span className="text-sm text-gray-500 font-medium">{userEmail}</span>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 text-[#10b981] border border-emerald-100 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 mr-2 rounded-full bg-[#10b981]"></span>
          {userRole}
        </div>
      </div>

      {/* Links Section */}
      <div className="px-4 py-2">
        <a className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200 group" href="#">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-3 text-[#0054a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            <span className="font-medium">Completed Orders</span>
          </div>
          <svg className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
        </a>
      </div>

      {/* Footer Actions */}
      <footer className="p-4 space-y-2">
        <Link 
          href={`/${locale}/admin`}
          onClick={onClose}
          className="block w-full text-center py-2.5 px-4 bg-[#0054a3] text-white text-sm font-bold rounded-xl hover:bg-blue-800 transition-all shadow-sm active:scale-[0.98]"
        >
          {['super_admin', 'supervisor', 'employee', 'editor'].includes(userRole.toLowerCase().replace(' ', '_')) ? "Admin Dashboard" : "Account Settings"}
        </Link>
        <button 
          onClick={handleSignOut}
          className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 text-red-600 text-sm font-bold rounded-xl border border-red-100 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-[0.98]"
        >
          Sign Out
        </button>
      </footer>
    </div>
  );
};

export default ProfileBubble;
