"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useLoading } from "@/components/providers";

const RegistrationPage = () => {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const { setIsLoading } = useLoading();
  
  const [showVerification, setShowVerification] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    englishOnly: false,
    mixed: false,
  });

  const validatePassword = (pass: string) => {
    const length = pass.length >= 8;
    // Strictly English characters, numbers and symbols
    const englishOnly = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(pass);
    const mixed = /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /[0-9]/.test(pass);
    
    setPasswordValidation({ length, englishOnly, mixed });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
    
    if (name === "password") {
      validatePassword(value as string);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordValidation.length || !passwordValidation.englishOnly || !passwordValidation.mixed) {
      setError("Please ensure your password meets all safety requirements.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
      } else {
        setShowVerification(true);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerification) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
        <style jsx>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .medical-loader {
            animation: spin-slow 3s linear infinite;
          }
        `}</style>
        <div className="w-full max-w-md text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-[#f0f7ff] dark:border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-[#0054a3] rounded-full medical-loader"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-12 w-12 text-[#0054a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Verify Your Email</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            A verification link has been sent to <span className="font-bold text-[#0054a3]">{formData.email}</span>. <br/>
            Please check your email to verify your account and complete registration.
          </p>
          <div className="space-y-4">
            <button className="w-full bg-[#0054a3] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors">
              Resend verification link
            </button>
            <Link 
              href={`/${locale}/login`}
              className="block w-full bg-transparent text-gray-500 font-medium py-3 hover:text-[#0054a3] transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-black font-sans text-gray-900 dark:text-white">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-slate-800">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-[#f0f7ff] dark:bg-blue-900/20 rounded-2xl mb-4">
              <svg className="h-8 w-8 text-[#0054a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Join our professional medical network</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3">
              <span className="material-symbols-outlined shrink-0 text-red-500">error</span>
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1" htmlFor="fullName">Full Name</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#0054a3] focus:ring focus:ring-[#0054a3]/20 transition-all" 
                id="fullName" 
                name="fullName" 
                placeholder="Dr. John Doe" 
                required 
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1" htmlFor="email">Email Address</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#0054a3] focus:ring focus:ring-[#0054a3]/20 transition-all" 
                id="email" 
                name="email" 
                placeholder="name@hospital.com" 
                required 
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1" htmlFor="password">Password</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#0054a3] focus:ring focus:ring-[#0054a3]/20 transition-all" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <div className="mt-3 space-y-2 px-1">
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${passwordValidation.length ? "text-emerald-500" : "text-slate-400"}`}>
                  <span className="material-symbols-outlined text-xs">{passwordValidation.length ? "check_circle" : "circle"}</span>
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${passwordValidation.englishOnly ? "text-emerald-500" : "text-slate-400"}`}>
                  <span className="material-symbols-outlined text-xs">{passwordValidation.englishOnly ? "check_circle" : "circle"}</span>
                  English Characters ONLY
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${passwordValidation.mixed ? "text-emerald-500" : "text-slate-400"}`}>
                  <span className="material-symbols-outlined text-xs">{passwordValidation.mixed ? "check_circle" : "circle"}</span>
                  Mix of A-Z, a-z, and 0-9
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1" htmlFor="confirmPassword">Confirm Password</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#0054a3] focus:ring focus:ring-[#0054a3]/20 transition-all" 
                id="confirmPassword" 
                name="confirmPassword" 
                placeholder="••••••••" 
                required 
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-start space-x-3 py-2">
              <input 
                className="mt-1 h-5 w-5 rounded border-gray-300 text-[#0054a3] focus:ring-[#0054a3] cursor-pointer bg-white" 
                id="terms" 
                name="terms" 
                required 
                type="checkbox"
                checked={formData.terms}
                onChange={handleInputChange}
              />
              <label className="text-sm text-gray-600 dark:text-gray-400 leading-tight" htmlFor="terms">
                I agree to the <a className="text-[#0054a3] font-semibold hover:underline" href="#">Terms & Conditions</a>.
              </label>
            </div>
            <button 
              className="w-full bg-[#0054a3] hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50" 
              type="submit"
              disabled={!formData.terms}
            >
              Create Account
            </button>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 font-medium">
              Already have an account? <Link className="text-[#0054a3] font-bold hover:underline" href={`/${locale}/login`}>Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default RegistrationPage;
